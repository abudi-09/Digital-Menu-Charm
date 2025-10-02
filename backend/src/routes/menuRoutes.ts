import { Router } from "express";
import {
  getMenu,
  postMenu,
  putMenu,
  deleteMenu,
} from "../controllers/menuController";

const router = Router();

router.get("/menu", getMenu);
router.post("/menu", postMenu);
router.put("/menu/:id", putMenu);
router.delete("/menu/:id", deleteMenu);

export default router;
