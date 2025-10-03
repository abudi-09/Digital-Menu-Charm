import { Router } from "express";
import { requireAdminAuth } from "../middleware/auth";
import {
  confirmEmailToken,
  confirmPhoneCode,
  resendProfileEmailVerification,
  resendProfilePhoneVerification,
} from "../controllers/adminVerificationController";

const router = Router();

router.post(
  "/profile/email/resend",
  requireAdminAuth,
  resendProfileEmailVerification
);
router.post("/profile/email/confirm", confirmEmailToken);
router.post(
  "/profile/phone/resend",
  requireAdminAuth,
  resendProfilePhoneVerification
);
router.post("/profile/phone/confirm", requireAdminAuth, confirmPhoneCode);

export default router;
