import express, { Request, Response } from "express";
import cors from "cors";
import menuRoutes from "./routes/menuRoutes";
import adminAuthRoutes from "./routes/adminAuthRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));
app.use("/api", menuRoutes);
app.use("/api/admin", adminAuthRoutes);

export default app;
