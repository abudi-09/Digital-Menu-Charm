import { Schema, model, Document, Types } from "mongoose";

export type VerificationType = "email" | "phone";
export type VerificationStatus = "pending" | "verified" | "expired";
export type VerificationContext = "profile" | "password-reset";

export interface AdminVerificationDocument extends Document {
  adminId: Types.ObjectId;
  type: VerificationType;
  context: VerificationContext;
  targetValue: string;
  tokenHash: string;
  expiresAt: Date;
  status: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const adminVerificationSchema = new Schema<AdminVerificationDocument>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["email", "phone"],
      required: true,
    },
    context: {
      type: String,
      enum: ["profile", "password-reset"],
      required: true,
    },
    targetValue: {
      type: String,
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    status: {
      type: String,
      enum: ["pending", "verified", "expired"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const AdminVerification = model<AdminVerificationDocument>(
  "AdminVerification",
  adminVerificationSchema
);
