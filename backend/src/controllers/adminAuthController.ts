import { Request, Response } from "express";
import {
  loginAdmin,
  InvalidCredentialsError,
} from "../services/adminAuthService";

export const postAdminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const result = await loginAdmin(email.trim().toLowerCase(), password);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.error("Admin login failed", error);
    return res.status(500).json({ message: "Unable to login" });
  }
};
