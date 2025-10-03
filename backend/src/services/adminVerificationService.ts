import { Types } from "mongoose";
import { Admin } from "../models/Admin";
import {
  AdminVerification,
  VerificationContext,
  VerificationType,
} from "../models/AdminVerification";
import {
  generateNumericCode,
  generateRandomToken,
  hashToken,
} from "../utils/security";
import { sendEmail, sendSms } from "./notificationService";

const VERIFICATION_EXPIRY_MINUTES = 15;

const buildExpiryDate = () =>
  new Date(Date.now() + VERIFICATION_EXPIRY_MINUTES * 60 * 1000);

const purgeExisting = async (
  adminId: Types.ObjectId | string,
  type: VerificationType,
  context: VerificationContext
) => {
  await AdminVerification.updateMany(
    { adminId, type, context, status: "pending" },
    { status: "expired" }
  );
};

interface EmailVerificationOptions {
  verificationPath?: string;
  additionalQuery?: Record<string, string>;
  subject?: string;
  message?: string;
}

export const requestEmailVerification = async (
  adminId: Types.ObjectId | string,
  targetEmail: string,
  context: VerificationContext,
  options: EmailVerificationOptions = {}
) => {
  await purgeExisting(adminId, "email", context);

  const token = generateRandomToken(24);
  const tokenHash = hashToken(token);

  const verification = await AdminVerification.create({
    adminId,
    type: "email",
    context,
    targetValue: targetEmail,
    tokenHash,
    expiresAt: buildExpiryDate(),
  });

  const appUrl = process.env.ADMIN_APP_URL ?? "http://localhost:5173";
  const path = options.verificationPath ?? "/admin/verify-email";
  const query = new URLSearchParams({
    token,
    context,
    ...options.additionalQuery,
  });
  const verificationUrl = `${appUrl}${path}?${query.toString()}`;

  await sendEmail({
    to: targetEmail,
    subject: options.subject ?? "Verify your email address",
    html:
      options.message ??
      `
      <p>Hi there,</p>
      <p>Please confirm your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify Email Address</a></p>
      <p>This link will expire in ${VERIFICATION_EXPIRY_MINUTES} minutes.</p>
    `,
  });

  return verification;
};

export const confirmEmailVerification = async (
  token: string,
  context: VerificationContext
) => {
  const tokenHash = hashToken(token);

  const verification = await AdminVerification.findOne({
    tokenHash,
    type: "email",
    context,
  }).exec();

  if (!verification) {
    throw new Error("Invalid or expired email verification token");
  }

  if (verification.expiresAt.getTime() < Date.now()) {
    verification.status = "expired";
    await verification.save();
    throw new Error("Email verification token has expired");
  }

  const admin = await Admin.findById(verification.adminId).exec();
  if (!admin) {
    throw new Error("Admin account no longer exists");
  }

  if (admin.email !== verification.targetValue) {
    admin.email = verification.targetValue;
  }
  admin.emailVerified = true;
  await admin.save();

  verification.status = "verified";
  await verification.save();

  return admin;
};

interface PhoneVerificationOptions {
  messagePrefix?: string;
}

export const requestPhoneVerification = async (
  adminId: Types.ObjectId | string,
  targetPhone: string,
  context: VerificationContext,
  options: PhoneVerificationOptions = {}
) => {
  await purgeExisting(adminId, "phone", context);

  const code = generateNumericCode(6);
  const tokenHash = hashToken(code);

  const verification = await AdminVerification.create({
    adminId,
    type: "phone",
    context,
    targetValue: targetPhone,
    tokenHash,
    expiresAt: buildExpiryDate(),
  });

  const prefix = options.messagePrefix ?? "Your verification code";
  await sendSms(
    targetPhone,
    `${prefix} is ${code}. It expires in ${VERIFICATION_EXPIRY_MINUTES} minutes.`
  );

  return verification;
};

export const confirmPhoneVerification = async (
  adminId: Types.ObjectId | string,
  code: string,
  context: VerificationContext
) => {
  const tokenHash = hashToken(code);

  const verification = await AdminVerification.findOne({
    adminId,
    type: "phone",
    context,
    status: "pending",
  }).exec();

  if (!verification) {
    throw new Error("No pending phone verification found");
  }

  if (verification.expiresAt.getTime() < Date.now()) {
    verification.status = "expired";
    await verification.save();
    throw new Error("Phone verification code has expired");
  }

  if (verification.tokenHash !== tokenHash) {
    throw new Error("Invalid phone verification code");
  }

  const admin = await Admin.findById(verification.adminId).exec();
  if (!admin) {
    throw new Error("Admin account no longer exists");
  }

  admin.phoneNumber = verification.targetValue;
  admin.phoneVerified = true;
  await admin.save();

  verification.status = "verified";
  await verification.save();

  return admin;
};
