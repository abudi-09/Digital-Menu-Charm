import { Router } from "express";
import {
  getPasswordResetIdentity,
  requestPasswordReset,
  resetPassword,
  verifyResetEmail,
  verifyResetSms,
} from "../controllers/passwordResetController";

const router = Router();

router.get("/password/identity", getPasswordResetIdentity);
router.post("/password/forgot", requestPasswordReset);
router.post("/password/verify-email", verifyResetEmail);
router.post("/password/verify-sms", verifyResetSms);
router.post("/password/reset", resetPassword);

export default router;
