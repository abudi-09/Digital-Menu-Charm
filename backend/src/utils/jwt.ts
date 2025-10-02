import jwt from "jsonwebtoken";

interface AdminTokenPayload {
  adminId: string;
  role: "admin";
}

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET env variable is not set");
  }
  return secret;
};

export const signAdminToken = (payload: AdminTokenPayload) => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "1h",
    subject: payload.adminId,
  });
};

export const verifyAdminToken = (token: string) => {
  return jwt.verify(token, getJwtSecret()) as AdminTokenPayload & {
    iat: number;
    exp: number;
    sub: string;
  };
};
