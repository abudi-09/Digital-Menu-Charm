import bcrypt from "bcrypt";
import { Admin } from "../models/Admin";
import { PasswordResetSession } from "../models/PasswordResetSession";
import {
  generateNumericCode,
  generateRandomToken,
  hashToken,
  maskEmail,
  validatePasswordStrength,
} from "../utils/security";
import * as notificationService from "./notificationService";
import { AdminVerification } from "../models/AdminVerification";

const EMAIL_TOKEN_EXPIRY_MINUTES = 15;
const SESSION_EXPIRY_MINUTES = 60;
const SMS_CODE_EXPIRY_MINUTES = 10;

const buildDateFromMinutes = (minutes: number) =>
  new Date(Date.now() + minutes * 60 * 1000);

const getPrimaryAdmin = async () => {
  const admin = await Admin.findOne().exec();
  if (!admin) {
    throw new Error("Admin account not found");
  }
  return admin;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const normalizePhoneNumber = (phoneNumber: string) =>
  phoneNumber.replace(/[\s()\-]+/gu, "").trim();

export const getRegisteredAdminContact = async () => {
  const admin = await getPrimaryAdmin();
  return {
    email: admin.email,
    maskedEmail: maskEmail(admin.email),
    phoneNumber: admin.phoneNumber ?? "",
    phoneVerified: admin.phoneVerified ?? false,
  };
};

export const initiatePasswordReset = async (
  method: "email" | "phone",
  value: string
) => {
  if (method === "email") {
    const admin = await Admin.findOne({ email: normalizeEmail(value) }).exec();
    if (!admin) {
      throw new Error(
        "We couldn't start the password reset process. The provided email was not found."
      );
    }

    const token = generateRandomToken(24);
    const tokenHash = hashToken(token);

    const session = await PasswordResetSession.create({
      adminId: admin._id,
      emailTokenHash: tokenHash,
      emailTokenExpiresAt: buildDateFromMinutes(EMAIL_TOKEN_EXPIRY_MINUTES),
      smsVerified: false,
      emailVerified: false,
      status: "pending",
      expiresAt: buildDateFromMinutes(SESSION_EXPIRY_MINUTES),
    });

    const appUrl = process.env.ADMIN_APP_URL ?? "http://localhost:5173";
    const verificationUrl = `${appUrl}/admin/reset-password?sessionId=${session.id}&token=${token}`;

    await notificationService.sendEmail({
      to: admin.email,
      subject: "Reset your admin password",
      html: `
      <p>Hi ${admin.fullName || "there"},</p>
      <p>You requested to reset your admin password. Click the link below to verify your email address and continue:</p>
      <p><a href="${verificationUrl}">Verify Email & Continue</a></p>
      <p>This link expires in ${EMAIL_TOKEN_EXPIRY_MINUTES} minutes. If you did not request a reset, please ignore this email.</p>
    `,
    });

    return {
      sessionId: session.id,
      maskedEmail: maskEmail(admin.email),
    };
  }

  // method === 'phone'
  const phone = normalizePhoneNumber(value);
  const admin = await Admin.findOne({ phoneNumber: { $exists: true } }).exec();
  // find by normalized phone
  const admins = await Admin.find().exec();
  const matched = admins.find(
    (a) => a.phoneNumber && normalizePhoneNumber(a.phoneNumber) === phone
  );

  if (!matched) {
    throw new Error(
      "We couldn't start the password reset process. The provided phone number was not found."
    );
  }

  const code = generateNumericCode(6);
  const session = await PasswordResetSession.create({
    adminId: matched._id,
    smsCodeHash: hashToken(code),
    smsCodeExpiresAt: buildDateFromMinutes(SMS_CODE_EXPIRY_MINUTES),
    smsVerified: false,
    emailVerified: false,
    status: "pending",
    expiresAt: buildDateFromMinutes(SESSION_EXPIRY_MINUTES),
  });

  const smsConfigured = notificationService.isSmsServiceConfigured();

  if (smsConfigured) {
    // send SMS for production usage
    await notificationService.sendSms(
      matched.phoneNumber as string,
      `Your password reset code is ${code}. It expires in ${SMS_CODE_EXPIRY_MINUTES} minutes.`
    );
  } else {
    // Dev fallback: log the code so developers can test without Twilio
    console.warn(
      `Twilio not configured - password reset code for ${matched.phoneNumber}: ${code}`
    );
  }

  const response: {
    sessionId: string;
    maskedPhone: string | null;
    debugCode?: string;
  } = {
    sessionId: session.id,
    maskedPhone: matched.phoneNumber
      ? `••••${matched.phoneNumber.slice(-4)}`
      : null,
  };

  // Only include the raw code in non-production for debugging/testing
  if (!smsConfigured && process.env.NODE_ENV !== "production") {
    response.debugCode = code;
  }

  return response;
};

const ensureSession = async (sessionId: string) => {
  const session = await PasswordResetSession.findById(sessionId).exec();
  if (!session) {
    throw new Error("Password reset session not found");
  }
  if (session.expiresAt.getTime() < Date.now()) {
    session.status = "expired";
    await session.save();
    throw new Error("Password reset session has expired");
  }
  return session;
};

export const verifyEmailForReset = async (sessionId: string, token: string) => {
  const rawToken = token;
  const cleanedToken = rawToken.trim();
  const session = await ensureSession(sessionId);

  console.debug(
    JSON.stringify({
      evt: "verifyEmailForReset:start",
      sessionId,
      rawTokenLength: rawToken.length,
      cleanedDiff: rawToken.length - cleanedToken.length,
      status: session.status,
      emailVerified: session.emailVerified,
      smsVerified: session.smsVerified,
    })
  );

  if (session.emailVerified) {
    return {
      smsRequired: !session.smsVerified,
    };
  }

  if (
    session.emailTokenExpiresAt &&
    session.emailTokenExpiresAt.getTime() < Date.now()
  ) {
    session.status = "expired";
    await session.save();
    throw new Error("Email verification token has expired");
  }
  const computedHash = hashToken(cleanedToken);
  const matches = computedHash === session.emailTokenHash;
  console.debug(
    JSON.stringify({
      evt: "verifyEmailForReset:compare",
      sessionId,
      providedHash: computedHash,
      storedHash: session.emailTokenHash,
      matches,
    })
  );

  if (!matches) {
    throw new Error("Invalid email verification token");
  }

  const admin = await Admin.findById(session.adminId).exec();
  if (!admin) {
    throw new Error("Admin account not found");
  }
  session.emailVerified = true;

  const smsConfigured =
    Boolean(admin.phoneNumber) && notificationService.isSmsServiceConfigured();

  if (!smsConfigured) {
    session.smsVerified = true;
    session.status = "sms-verified";
    session.smsCodeHash = undefined;
    session.smsCodeExpiresAt = undefined;
    await session.save();
    return { smsRequired: false };
  }

  session.status = "email-verified";

  if (!admin.phoneNumber) {
    throw new Error("Admin phone number is not configured");
  }

  const code = generateNumericCode(6);
  session.smsCodeHash = hashToken(code);
  session.smsCodeExpiresAt = buildDateFromMinutes(SMS_CODE_EXPIRY_MINUTES);

  await notificationService.sendSms(
    admin.phoneNumber,
    `Your password reset code is ${code}. It expires in ${SMS_CODE_EXPIRY_MINUTES} minutes.`
  );

  await session.save();

  return { smsRequired: true };
};

export const verifySmsForReset = async (sessionId: string, code: string) => {
  const session = await ensureSession(sessionId);

  // If the session includes an email token, require email verification first.
  // For SMS-only sessions (no emailTokenHash), allow direct SMS verification.
  if (session.emailTokenHash && !session.emailVerified) {
    throw new Error("Email verification must be completed first");
  }

  if (session.smsVerified && !session.smsCodeHash) {
    return { smsVerified: true };
  }

  if (!session.smsCodeHash || !session.smsCodeExpiresAt) {
    throw new Error("SMS verification was not initiated");
  }

  if (session.smsCodeExpiresAt.getTime() < Date.now()) {
    throw new Error("SMS verification code has expired");
  }

  if (session.smsCodeHash !== hashToken(code)) {
    throw new Error("Invalid SMS verification code");
  }

  session.smsVerified = true;
  session.status = "sms-verified";
  await session.save();

  return { smsVerified: true };
};

export const completePasswordReset = async (
  sessionId: string,
  newPassword: string
) => {
  const session = await ensureSession(sessionId);

  // Only require verifications that are part of the session flow.
  const emailRequired = Boolean(session.emailTokenHash);
  const smsRequired = Boolean(session.smsCodeHash);

  if (emailRequired && !session.emailVerified) {
    throw new Error(
      "Email verification must be completed before resetting password"
    );
  }
  if (smsRequired && !session.smsVerified) {
    throw new Error(
      "SMS verification must be completed before resetting password"
    );
  }

  if (!validatePasswordStrength(newPassword)) {
    throw new Error(
      "Password does not meet complexity requirements (min 8 chars, include 3 of: upper, lower, number, symbol)"
    );
  }

  const admin = await Admin.findById(session.adminId)
    .select("+password")
    .exec();
  if (!admin) {
    throw new Error("Admin account not found");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  admin.password = hashedPassword;
  await admin.save();

  session.status = "completed";
  session.smsCodeHash = undefined;
  session.emailTokenHash = hashToken(generateRandomToken(16));
  await session.save();

  await AdminVerification.updateMany(
    { adminId: admin._id, context: "password-reset", status: "pending" },
    { status: "expired" }
  );

  return { success: true };
};
