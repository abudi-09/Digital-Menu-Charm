export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: "admin" | "staff";
}

export interface MenuStats {
  totalItems: number;
  totalCategories: number;
  outOfStock: number;
}

export type QRFormat = "png" | "svg" | "pdf";

export interface QRCodeRecord {
  id: string;
  url: string;
  format: QRFormat;
  slug: string;
  scanCount: number;
  signedUrl: string;
  lastScanAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QRStats {
  totalCodes: number;
  totalScans: number;
  scansToday: number;
  scansThisWeek: number;
  uniqueVisitors: number;
  lastScanTime: string | null;
}

export interface VerificationState {
  status: "idle" | "pending" | "confirmed" | "error";
  message?: string;
}
