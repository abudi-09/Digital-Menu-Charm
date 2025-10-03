import { Router } from "express";
import { requireAdminAuth } from "../middleware/auth";
import {
  getProfile,
  updateProfileHandler,
  changePasswordHandler,
} from "../controllers/adminProfileController";

const router = Router();

router.use(requireAdminAuth);

router.get("/profile", getProfile);
router.put("/profile", updateProfileHandler);
router.post("/profile/change-password", changePasswordHandler);

export default router;
