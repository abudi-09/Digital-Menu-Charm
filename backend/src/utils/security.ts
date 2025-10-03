import crypto from "crypto";

export const generateRandomToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const generateNumericCode = (length = 6) => {
  const max = 10 ** length;
  return crypto.randomInt(0, max).toString().padStart(length, "0");
};

export const maskEmail = (email: string) => {
  const [user, domain] = email.split("@");
  if (!domain || user.length === 0) {
    return "***";
  }
  const visible = user.slice(0, Math.min(1, user.length));
  return `${visible}${"*".repeat(Math.max(user.length - 1, 0))}@${domain}`;
};

export const validatePasswordStrength = (password: string) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (password.length < minLength) {
    return false;
  }

  const score = [hasUppercase, hasLowercase, hasNumber, hasSymbol].filter(
    Boolean
  ).length;

  return score >= 3;
};
