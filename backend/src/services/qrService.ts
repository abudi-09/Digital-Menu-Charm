import { randomBytes } from "crypto";
import QRCodeGenerator from "qrcode";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import jwt from "jsonwebtoken";
import { QRCode, QRCodeDocument, QRFormat } from "../models/QRCode";
import { QRScanLog } from "../models/QRScanLog";

const QR_STORAGE_DIR = path.resolve(process.cwd(), "storage", "qr-codes");
const SIGNED_URL_TTL_SECONDS = 60 * 10; // 10 minutes

const getSigningSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET env variable is not set");
  }
  return secret;
};

const ensureStorageDir = async () => {
  await fs.mkdir(QR_STORAGE_DIR, { recursive: true });
};

const generateSlug = () => randomBytes(6).toString("base64url");

const generateImageKey = (format: QRFormat) =>
  `${generateSlug()}-${Date.now()}.${format}`;

const generateUniqueSlug = async (): Promise<string> => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = generateSlug();
    const exists = await QRCode.exists({ slug });
    if (!exists) {
      return slug;
    }
  }
  throw new Error("Failed to generate unique QR slug");
};

const buildImagePath = (imageKey: string) =>
  path.join(QR_STORAGE_DIR, imageKey);

const generateQRCodeFile = async (
  url: string,
  format: QRFormat,
  imagePath: string
) => {
  if (format === "pdf") {
    await new Promise<void>(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const stream = createWriteStream(imagePath);
        doc.pipe(stream);

        doc.fontSize(26).text("Grand Vista Hotel", { align: "center" });
        doc.moveDown();
        doc
          .fontSize(16)
          .text("Scan to view our digital menu", { align: "center" });
        doc.moveDown(2);

        const qrPngBuffer = await QRCodeGenerator.toBuffer(url, { width: 256 });
        doc.image(qrPngBuffer, {
          fit: [256, 256],
          align: "center",
          valign: "center",
        });

        doc.moveDown(2);
        doc.fontSize(12).fillColor("#666").text(url, {
          align: "center",
        });

        doc.end();

        stream.on("finish", resolve);
        stream.on("error", reject);
      } catch (error) {
        reject(error as Error);
      }
    });
    return;
  }

  if (format === "svg") {
    const svg = await QRCodeGenerator.toString(url, {
      type: "svg",
    });
    await fs.writeFile(imagePath, svg, "utf-8");
    return;
  }

  const buffer = await QRCodeGenerator.toBuffer(url, { width: 512 });
  await fs.writeFile(imagePath, buffer);
};

const signImageKey = (imageKey: string) => {
  return jwt.sign({ key: imageKey }, getSigningSecret(), {
    expiresIn: SIGNED_URL_TTL_SECONDS,
  });
};

const getSignedUrl = (imageKey: string) => {
  const token = signImageKey(imageKey);
  return `/api/admin/qr/file/${imageKey}?token=${token}`;
};

export const createQRCode = async (params: {
  url: string;
  format?: QRFormat;
}) => {
  await ensureStorageDir();
  const format = params.format ?? "png";
  const url = params.url.trim();
  const imageKey = generateImageKey(format);
  const imagePath = buildImagePath(imageKey);

  await generateQRCodeFile(url, format, imagePath);

  const qr = await QRCode.create({
    url,
    format,
    slug: await generateUniqueSlug(),
    imageKey,
  });

  return serializeQRCode(qr);
};

export const getQRCodeById = async (id: string) => {
  const qr = await QRCode.findById(id).exec();
  if (!qr) return null;
  return serializeQRCode(qr);
};

export const listQRCodes = async () => {
  const qrs = await QRCode.find().sort({ createdAt: -1 }).exec();
  return qrs.map(serializeQRCode);
};

export const updateQRCode = async (
  id: string,
  params: { url?: string; format?: QRFormat }
) => {
  const qr = await QRCode.findById(id).exec();
  if (!qr) return null;

  if (params.url) {
    qr.url = params.url.trim();
  }
  if (params.format) {
    qr.format = params.format;
  }

  if (params.url || params.format) {
    await ensureStorageDir();
    await fs.rm(buildImagePath(qr.imageKey), { force: true });

    const format = qr.format;
    const imageKey = generateImageKey(format);
    const imagePath = buildImagePath(imageKey);
    await generateQRCodeFile(qr.url, format, imagePath);
    qr.imageKey = imageKey;
  }

  await qr.save();
  return serializeQRCode(qr);
};

export const getQRCodeStats = async () => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalCodes,
    totalScans,
    scansToday,
    scansThisWeek,
    lastLog,
    uniqueSlugs,
  ] = await Promise.all([
    QRCode.countDocuments().exec(),
    QRScanLog.countDocuments().exec(),
    QRScanLog.countDocuments({ createdAt: { $gte: startOfDay } }).exec(),
    QRScanLog.countDocuments({ createdAt: { $gte: sevenDaysAgo } }).exec(),
    QRScanLog.findOne().sort({ createdAt: -1 }).exec(),
    QRScanLog.distinct("slug"),
  ]);

  return {
    totalCodes,
    totalScans,
    scansToday,
    scansThisWeek,
    uniqueVisitors: Array.isArray(uniqueSlugs) ? uniqueSlugs.length : 0,
    lastScanTime: lastLog?.createdAt ?? null,
  };
};

export const incrementScanCount = async (slug: string) => {
  const qr = await QRCode.findOne({ slug }).exec();
  if (!qr) return null;

  qr.scanCount += 1;
  qr.lastScanAt = new Date();
  await qr.save();
  await QRScanLog.create({ qr: qr._id, slug: qr.slug });
  return qr;
};

export const getQRCodeBySlug = async (slug: string) => {
  const qr = await QRCode.findOne({ slug }).exec();
  return qr;
};

export const verifyFileToken = (token: string) => {
  try {
    return jwt.verify(token, getSigningSecret()) as { key: string };
  } catch (error) {
    return null;
  }
};

export const getFilePathForKey = (imageKey: string) => buildImagePath(imageKey);

const serializeQRCode = (qr: QRCodeDocument) => ({
  id: qr.id,
  url: qr.url,
  format: qr.format,
  slug: qr.slug,
  scanCount: qr.scanCount,
  lastScanAt: qr.lastScanAt,
  createdAt: qr.createdAt,
  updatedAt: qr.updatedAt,
  signedUrl: getSignedUrl(qr.imageKey),
});
