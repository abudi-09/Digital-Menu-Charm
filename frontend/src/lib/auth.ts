const TOKEN_KEY = "adminToken";

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

interface JwtPayload {
  adminId: string;
  role: string;
  exp: number;
  iat: number;
}

const decodePayload = (segment: string) => {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );
  const decoded = atob(padded);
  return JSON.parse(decoded) as JwtPayload;
};

export const decodeToken = (): JwtPayload | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }
    return decodePayload(payload);
  } catch (error) {
    console.warn("Failed to decode JWT", error);
    return null;
  }
};

export const isAuthenticated = () => {
  const payload = decodeToken();
  if (!payload) return false;
  const isExpired = payload.exp * 1000 < Date.now();
  if (isExpired) {
    clearToken();
    return false;
  }
  return true;
};

export const isAdmin = () => {
  const payload = decodeToken();
  return Boolean(payload && payload.role === "admin");
};

export const authTokenKey = TOKEN_KEY;
