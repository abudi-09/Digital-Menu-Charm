import { Router } from "express";
import {
  postCreateQRCode,
  getQRCode,
  getQRStats,
  putUpdateQRCode,
  getAllQRCodes,
} from "../controllers/qrController";
import { requireAdminAuth } from "../middleware/auth";
import { getQRFile } from "../controllers/qrFileController";

const router = Router();

router.post("/qr", requireAdminAuth, postCreateQRCode);
router.get("/qr/stats", requireAdminAuth, getQRStats);
router.get("/qr/file/:key", getQRFile);
router.get("/qr", requireAdminAuth, getAllQRCodes);
router.get("/qr/:id", requireAdminAuth, getQRCode);
router.put("/qr/:id", requireAdminAuth, putUpdateQRCode);

export default router;
