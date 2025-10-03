import { Schema, model, Document, Types } from "mongoose";

export type PasswordResetStatus =
  | "pending"
  | "email-verified"
  | "sms-verified"
  | "completed"
  | "expired";

export interface PasswordResetSessionDocument extends Document {
  adminId: Types.ObjectId;
  emailTokenHash: string;
  emailTokenExpiresAt: Date;
  emailVerified: boolean;
  smsCodeHash?: string;
  smsCodeExpiresAt?: Date;
  smsVerified: boolean;
  status: PasswordResetStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const passwordResetSessionSchema = new Schema<PasswordResetSessionDocument>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
    emailTokenHash: {
      type: String,
      required: true,
    },
    emailTokenExpiresAt: {
      type: Date,
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    smsCodeHash: {
      type: String,
    },
    smsCodeExpiresAt: {
      type: Date,
    },
    smsVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "email-verified",
        "sms-verified",
        "completed",
        "expired",
      ],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

passwordResetSessionSchema.pre("save", function (next) {
  if (this.expiresAt <= new Date()) {
    this.status = "expired";
  }
  next();
});

export const PasswordResetSession = model<PasswordResetSessionDocument>(
  "PasswordResetSession",
  passwordResetSessionSchema
);
