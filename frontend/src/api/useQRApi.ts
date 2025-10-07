import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createQRCode as apiCreateQRCode,
  fetchQRCodes as apiFetchQRCodes,
  fetchQRStats as apiFetchQRStats,
  fetchQRCodeById as apiFetchQRCodeById,
  updateQRCode as apiUpdateQRCode,
} from "@/lib/qrApi";
import { QRCodeRecord, QRFormat, QRStats } from "@/types/admin";

export const useQRCodes = () =>
  useQuery<QRCodeRecord[]>({
    queryKey: ["qr-codes"],
    queryFn: apiFetchQRCodes,
  });

export const useQRStats = () =>
  useQuery<QRStats>({
    queryKey: ["qr-stats"],
    queryFn: apiFetchQRStats,
    refetchInterval: 30_000,
  });

export const useCreateQRCode = () => {
  const qc = useQueryClient();
  return useMutation<QRCodeRecord, Error, { url: string; format: QRFormat }>({
    mutationFn: ({ url, format }) => apiCreateQRCode({ url, format }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["qr-codes"] });
      qc.invalidateQueries({ queryKey: ["qr-stats"] });
    },
  });
};

export const useUpdateQRCode = () => {
  const qc = useQueryClient();
  return useMutation<
    QRCodeRecord,
    Error,
    { id: string; url?: string; format?: QRFormat }
  >({
    mutationFn: ({ id, url, format }) => apiUpdateQRCode(id, { url, format }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["qr-codes"] });
      qc.invalidateQueries({ queryKey: ["qr-stats"] });
    },
  });
};

export const useQRCode = (id?: string | null) =>
  useQuery<QRCodeRecord | null>({
    queryKey: ["qr-code", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      return apiFetchQRCodeById(id);
    },
  });

export default useQRCodes;
