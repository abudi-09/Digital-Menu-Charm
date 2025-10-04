import { Request, Response } from "express";
import { z } from "zod";
import {
  completePasswordReset,
  getRegisteredAdminContact,
  initiatePasswordReset,
  verifyEmailForReset,
  verifySmsForReset,
} from "../services/passwordResetService";

const sessionBodySchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

const forgotPasswordSchema = z.object({
  method: z.enum(["email", "phone"]),
  value: z.string().trim().min(1, "A value is required"),
});

const verifyEmailSchema = sessionBodySchema.extend({
  token: z.string().min(1, "Verification token is required"),
});

const verifySmsSchema = sessionBodySchema.extend({
  code: z.string().trim().min(4, "Verification code is required"),
});

const resetPasswordSchema = sessionBodySchema.extend({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be under 128 characters"),
});

export const getPasswordResetIdentity = async (
  _req: Request,
  res: Response
) => {
  try {
    const contact = await getRegisteredAdminContact();
    const hasPhone = Boolean(contact.phoneNumber);
    return res.status(200).json({
      maskedEmail: contact.maskedEmail,
      phoneEnding: hasPhone ? contact.phoneNumber.slice(-4) : null,
      phoneVerified: contact.phoneVerified ?? false,
      hasPhone,
    });
  } catch (error) {
    console.error("Failed to fetch admin contact", error);
    return res
      .status(500)
      .json({ message: "Unable to fetch password reset identity" });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { method, value } = forgotPasswordSchema.parse(req.body);
    const result = await initiatePasswordReset(method, value);
    const maskedEmail = (
      "maskedEmail" in result ? (result as any).maskedEmail : null
    ) as string | null;
    const maskedPhone = (
      "maskedPhone" in result ? (result as any).maskedPhone : null
    ) as string | null;
    return res.status(200).json({
      message: "Password reset initiated",
      sessionId: result.sessionId,
      maskedEmail,
      maskedPhone,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid payload", issues: error.issues });
    }
    console.error("Failed to initiate password reset", error);
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Unable to initiate password reset" });
  }
};

export const verifyResetEmail = async (req: Request, res: Response) => {
  try {
    const { sessionId, token } = verifyEmailSchema.parse(req.body);
    const result = await verifyEmailForReset(sessionId, token);
    return res.status(200).json({
      message: "Email verified. SMS code sent.",
      smsRequired: result.smsRequired,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid payload", issues: error.issues });
    }
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Email verification failed", error);
    return res.status(500).json({ message: "Unable to verify email" });
  }
};

export const verifyResetSms = async (req: Request, res: Response) => {
  try {
    const { sessionId, code } = verifySmsSchema.parse(req.body);
    const result = await verifySmsForReset(sessionId, code);
    return res.status(200).json({
      message: "Phone number verified",
      smsVerified: result.smsVerified,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid payload", issues: error.issues });
    }
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    console.error("SMS verification failed", error);
    return res.status(500).json({ message: "Unable to verify phone number" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { sessionId, newPassword } = resetPasswordSchema.parse(req.body);
    await completePasswordReset(sessionId, newPassword);
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid payload", issues: error.issues });
    }
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Password reset failed", error);
    return res.status(500).json({ message: "Unable to reset password" });
  }
};
