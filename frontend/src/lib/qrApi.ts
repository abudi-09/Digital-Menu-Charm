import api from "./api";
import { QRCodeRecord, QRFormat, QRStats } from "@/types/admin";

export const fetchQRCodes = async () => {
  const { data } = await api.get<QRCodeRecord[]>("/admin/qr");
  return data;
};

export const createQRCode = async (payload: {
  url: string;
  format: QRFormat;
}) => {
  const { data } = await api.post<QRCodeRecord>("/admin/qr", payload);
  return data;
};

export const updateQRCode = async (
  id: string,
  payload: { url?: string; format?: QRFormat }
) => {
  const { data } = await api.put<QRCodeRecord>(`/admin/qr/${id}`, payload);
  return data;
};

export const fetchQRCodeById = async (id: string) => {
  const { data } = await api.get<QRCodeRecord>(`/admin/qr/${id}`);
  return data;
};

export const fetchQRStats = async () => {
  const { data } = await api.get<QRStats>("/admin/qr/stats");
  return data;
};
