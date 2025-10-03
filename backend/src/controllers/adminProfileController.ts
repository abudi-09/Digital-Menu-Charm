import { Request, Response } from "express";
import { z } from "zod";
import {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} from "../services/adminProfileService";

export const getProfile = async (req: Request, res: Response) => {
  const adminId = req.admin?.adminId;
  if (!adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const profile = await getAdminProfile(adminId);
    return res.status(200).json(profile);
  } catch (error) {
    console.error("Failed to fetch admin profile", error);
    return res
      .status(500)
      .json({ message: "Unable to fetch admin profile data" });
  }
};

export const updateProfileHandler = async (req: Request, res: Response) => {
  const adminId = req.admin?.adminId;
  if (!adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const profile = await updateAdminProfile(adminId, req.body);
    return res.status(200).json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid profile data",
        issues: error.issues,
      });
    }

    if (error instanceof Error) {
      const status =
        error.message === "Email address is already in use" ? 409 : 400;
      return res.status(status).json({ message: error.message });
    }

    console.error("Failed to update admin profile", error);
    return res.status(500).json({ message: "Unable to update profile" });
  }
};

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const changePasswordHandler = async (req: Request, res: Response) => {
  const adminId = req.admin?.adminId;
  if (!adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(
      req.body
    );
    const result = await changeAdminPassword(
      adminId,
      currentPassword,
      newPassword
    );
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid payload", issues: error.issues });
    }
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Password change failed", error);
    return res.status(500).json({ message: "Unable to change password" });
  }
};
