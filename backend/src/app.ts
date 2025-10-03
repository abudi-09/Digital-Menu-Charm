import express, { Request, Response } from "express";
import cors from "cors";
import menuRoutes from "./routes/menuRoutes";
import adminAuthRoutes from "./routes/adminAuthRoutes";
import adminProfileRoutes from "./routes/adminProfileRoutes";
import passwordResetRoutes from "./routes/passwordResetRoutes";
import adminVerificationRoutes from "./routes/adminVerificationRoutes";
import qrRoutes from "./routes/qrRoutes";
import qrPublicRoutes from "./routes/qrPublicRoutes";

const app = express();

app.use(cors());
// Allow larger JSON payloads (e.g. base64-encoded images). Long-term: prefer uploading files
// as multipart/form-data to a storage service and only send the URL in JSON.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));
app.use("/api", menuRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", passwordResetRoutes);
app.use("/api/admin", adminProfileRoutes);
app.use("/api/admin", adminVerificationRoutes);
app.use("/api/admin", qrRoutes);
app.use("/qr", qrPublicRoutes);

export default app;
