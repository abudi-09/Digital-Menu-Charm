import { Request, Response } from "express";
import { z } from "zod";
import {
  confirmEmailVerification,
  confirmPhoneVerification,
  requestEmailVerification,
  requestPhoneVerification,
} from "../services/adminVerificationService";
import { Admin } from "../models/Admin";

const tokenSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
  context: z.enum(["profile", "password-reset" as const]).default("profile"),
});

const phoneCodeSchema = z.object({
  code: z.string().trim().min(4, "Verification code is required"),
});

export const resendProfileEmailVerification = async (
  req: Request,
  res: Response
) => {
  const adminId = req.admin?.adminId;
  if (!adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const admin = await Admin.findById(adminId).exec();
  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  if (!admin.email) {
    return res.status(400).json({ message: "Email address is missing" });
  }

  if (admin.emailVerified) {
    return res.status(200).json({ message: "Email is already verified" });
  }

  try {
    await requestEmailVerification(admin.id, admin.email, "profile");
    return res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.error("Failed to send verification email", error);
    return res
      .status(500)
      .json({ message: "Unable to send verification email" });
  }
};

export const confirmEmailToken = async (req: Request, res: Response) => {
  try {
    const { token, context } = tokenSchema.parse(req.body);
    const admin = await confirmEmailVerification(token, context);
    return res.status(200).json({
      message: "Email verified successfully",
      adminId: admin.id,
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

export const resendProfilePhoneVerification = async (
  req: Request,
  res: Response
) => {
  const adminId = req.admin?.adminId;
  if (!adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const admin = await Admin.findById(adminId).exec();
  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  if (!admin.phoneNumber) {
    return res
      .status(400)
      .json({ message: "Phone number is missing from profile" });
  }

  if (admin.phoneVerified) {
    return res
      .status(200)
      .json({ message: "Phone number is already verified" });
  }

  try {
    await requestPhoneVerification(admin.id, admin.phoneNumber, "profile");
    return res.status(200).json({ message: "Verification SMS sent" });
  } catch (error) {
    console.error("Failed to send verification SMS", error);
    return res.status(500).json({ message: "Unable to send verification SMS" });
  }
};

export const confirmPhoneCode = async (req: Request, res: Response) => {
  const adminId = req.admin?.adminId;
  if (!adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { code } = phoneCodeSchema.parse(req.body);
    const admin = await confirmPhoneVerification(adminId, code, "profile");
    return res.status(200).json({
      message: "Phone number verified successfully",
      adminId: admin.id,
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
    console.error("Phone verification failed", error);
    return res.status(500).json({ message: "Unable to verify phone" });
  }
};
