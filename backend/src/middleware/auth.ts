import { Request, Response, NextFunction } from "express";
import { verifyAdminToken } from "../utils/jwt";

export interface AuthenticatedAdmin {
  adminId: string;
  role: "admin";
}

declare global {
  namespace Express {
    interface Request {
      admin?: AuthenticatedAdmin;
    }
  }
}

export const requireAdminAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers["authorization"];
  if (!header) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "Invalid authorization header" });
  }

  try {
    const payload = verifyAdminToken(token);
    if (!payload || payload.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.admin = {
      adminId: payload.adminId,
      role: payload.role,
    };

    next();
  } catch (error) {
    console.warn("Failed admin auth", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
