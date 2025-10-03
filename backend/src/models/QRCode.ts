import { Schema, model, Document } from "mongoose";

export type QRFormat = "png" | "svg" | "pdf";

export interface QRCodeDocument extends Document {
  url: string;
  format: QRFormat;
  slug: string;
  imageKey: string;
  scanCount: number;
  lastScanAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const qrCodeSchema = new Schema<QRCodeDocument>(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    format: {
      type: String,
      enum: ["png", "svg", "pdf"],
      default: "png",
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    imageKey: {
      type: String,
      required: true,
      unique: true,
    },
    scanCount: {
      type: Number,
      default: 0,
    },
    lastScanAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const QRCode = model<QRCodeDocument>("QRCode", qrCodeSchema);
