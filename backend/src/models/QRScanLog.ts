import { Schema, model, Document, Types } from "mongoose";

export interface QRScanLogDocument extends Document {
  qr: Types.ObjectId;
  slug: string;
  createdAt: Date;
}

const qrScanLogSchema = new Schema<QRScanLogDocument>(
  {
    qr: {
      type: Schema.Types.ObjectId,
      ref: "QRCode",
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { versionKey: false }
);

export const QRScanLog = model<QRScanLogDocument>("QRScanLog", qrScanLogSchema);
