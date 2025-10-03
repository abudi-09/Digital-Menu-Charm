import { Request, Response } from "express";
import {
  createQRCode,
  getQRCodeById,
  getQRCodeStats,
  listQRCodes,
  updateQRCode,
} from "../services/qrService";

export const postCreateQRCode = async (req: Request, res: Response) => {
  try {
    const { url, format } = req.body ?? {};

    if (typeof url !== "string" || url.trim().length === 0) {
      return res.status(400).json({ message: "Target URL is required" });
    }

    if (format && !["png", "svg", "pdf"].includes(format)) {
      return res.status(400).json({ message: "Unsupported QR format" });
    }

    const qr = await createQRCode({ url, format });
    return res.status(201).json(qr);
  } catch (error) {
    console.error("Failed to create QR code", error);
    return res.status(500).json({ message: "Failed to create QR code" });
  }
};

export const getQRCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qr = await getQRCodeById(id);
    if (!qr) {
      return res.status(404).json({ message: "QR code not found" });
    }
    return res.status(200).json(qr);
  } catch (error) {
    console.error("Failed to fetch QR code", error);
    return res.status(500).json({ message: "Failed to fetch QR code" });
  }
};

export const getAllQRCodes = async (_req: Request, res: Response) => {
  try {
    const qrs = await listQRCodes();
    return res.status(200).json(qrs);
  } catch (error) {
    console.error("Failed to list QR codes", error);
    return res.status(500).json({ message: "Failed to list QR codes" });
  }
};

export const getQRStats = async (_req: Request, res: Response) => {
  try {
    const stats = await getQRCodeStats();
    return res.status(200).json(stats);
  } catch (error) {
    console.error("Failed to fetch QR stats", error);
    return res.status(500).json({ message: "Failed to fetch QR stats" });
  }
};

export const putUpdateQRCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { url, format } = req.body ?? {};

    if (!url && !format) {
      return res
        .status(400)
        .json({ message: "Provide url or format to update" });
    }

    if (url && (typeof url !== "string" || url.trim().length === 0)) {
      return res.status(400).json({ message: "Invalid URL" });
    }

    if (format && !["png", "svg", "pdf"].includes(format)) {
      return res.status(400).json({ message: "Unsupported QR format" });
    }

    const updated = await updateQRCode(id, { url, format });
    if (!updated) {
      return res.status(404).json({ message: "QR code not found" });
    }
    return res.status(200).json(updated);
  } catch (error) {
    console.error("Failed to update QR code", error);
    return res.status(500).json({ message: "Failed to update QR code" });
  }
};
