export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'admin' | 'staff';
}

export interface MenuStats {
  totalItems: number;
  totalCategories: number;
  outOfStock: number;
}

export interface QRStats {
  totalScans: number;
  scansToday: number;
  scansThisWeek: number;
  uniqueVisitors: number;
  lastScanTime: string | null;
}

export interface VerificationState {
  status: 'idle' | 'pending' | 'confirmed' | 'error';
  message?: string;
}
