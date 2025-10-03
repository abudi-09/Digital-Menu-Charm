import { Request, Response } from "express";
import fs from "fs/promises";
import {
  getFilePathForKey,
  getQRCodeBySlug,
  incrementScanCount,
  verifyFileToken,
} from "../services/qrService";

export const getQRFile = async (req: Request, res: Response) => {
  const { key } = req.params;
  const token = req.query.token;

  if (!key || typeof key !== "string") {
    return res.status(400).json({ message: "Missing file key" });
  }

  if (!token || typeof token !== "string") {
    return res.status(401).json({ message: "Signed token required" });
  }

  const payload = verifyFileToken(token);
  if (!payload || payload.key !== key) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  try {
    const filePath = getFilePathForKey(key);
    await fs.access(filePath);
    return res.sendFile(filePath);
  } catch (error) {
    return res.status(404).json({ message: "QR file not found" });
  }
};

export const redirectQRCode = async (req: Request, res: Response) => {
  const { slug } = req.params;
  if (!slug) {
    return res.status(400).json({ message: "Missing QR slug" });
  }

  const qr = await getQRCodeBySlug(slug);
  if (!qr) {
    return res.status(404).json({ message: "QR code not found" });
  }

  await incrementScanCount(slug);
  return res.redirect(qr.url);
};
