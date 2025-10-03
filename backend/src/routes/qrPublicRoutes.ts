import { Router } from "express";
import { redirectQRCode } from "../controllers/qrFileController";

const router = Router();

router.get("/:slug", redirectQRCode);

export default router;
