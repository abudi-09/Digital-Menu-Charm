import { Types } from "mongoose";
import { z } from "zod";
import { Admin } from "../models/Admin";
import bcrypt from "bcrypt";
import { validatePasswordStrength } from "../utils/security";

const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(120, "Full name must be at most 120 characters"),
  email: z.string().trim().email("Invalid email address"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[+]?\d{8,15}$/u, "Phone number must contain 8-15 digits"),
});

export const getAdminProfile = async (adminId: Types.ObjectId | string) => {
  const adminDoc = await Admin.findById(adminId).exec();
  if (!adminDoc) {
    throw new Error("Admin not found");
  }

  const { password, __v, _id, ...rest } = adminDoc.toObject();

  return { id: adminDoc.id, ...rest };
};

export const updateAdminProfile = async (
  adminId: Types.ObjectId | string,
  payload: unknown
) => {
  const parsed = profileSchema.parse(payload);

  const admin = await Admin.findById(adminId).select("+password").exec();
  if (!admin) {
    throw new Error("Admin not found");
  }

  const existingWithEmail = await Admin.findOne({
    email: parsed.email,
    _id: { $ne: admin._id },
  })
    .select("_id")
    .lean()
    .exec();

  if (existingWithEmail) {
    throw new Error("Email address is already in use");
  }

  admin.fullName = parsed.fullName;
  admin.email = parsed.email;
  admin.phoneNumber = parsed.phoneNumber;

  await admin.save();

  return getAdminProfile(admin.id);
};

export const changeAdminPassword = async (
  adminId: Types.ObjectId | string,
  currentPassword: string,
  newPassword: string
) => {
  if (!validatePasswordStrength(newPassword)) {
    throw new Error(
      "Password does not meet complexity requirements (min 8 chars, include 3 of: upper, lower, number, symbol)"
    );
  }

  const admin = await Admin.findById(adminId).select("+password").exec();
  if (!admin) {
    throw new Error("Admin not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  admin.password = hashed;
  await admin.save();

  return { message: "Password updated successfully" };
};
