import { Request, Response, NextFunction } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
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
    if (error instanceof TokenExpiredError) {
      console.info("Admin session expired", {
        path: req.path,
        admin: req.admin?.adminId ?? null,
      });
      return res.status(401).json({
        message: "Session expired. Please log in again.",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error instanceof JsonWebTokenError) {
      console.warn("Failed admin auth", {
        reason: error.message,
        path: req.path,
      });
      return res.status(401).json({
        message: "Invalid authentication token",
        code: "TOKEN_INVALID",
      });
    }

    console.error("Unexpected auth error", error);
    return res.status(500).json({
      message: "Authentication failure",
      code: "AUTH_ERROR",
    });
  }
};
