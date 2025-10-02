import { Router } from "express";
import { postAdminLogin } from "../controllers/adminAuthController";

const router = Router();

router.post("/login", postAdminLogin);

export default router;
