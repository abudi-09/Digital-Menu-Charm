import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { AdminProfile } from "@/types/admin";

export interface UpdateAdminProfilePayload {
  fullName: string;
  email: string;
  phoneNumber: string;
}

const adminProfileKey = ["admin-profile"] as const;

export const useAdminProfile = () =>
  useQuery<AdminProfile>({
    queryKey: adminProfileKey,
    queryFn: async () => {
      const { data } = await api.get<AdminProfile>("/admin/profile");
      return data;
    },
    staleTime: 1000 * 30,
  });

export const useUpdateAdminProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateAdminProfilePayload) => {
      const { data } = await api.put<{
        message: string;
        profile: AdminProfile;
      }>("/admin/profile", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminProfileKey });
    },
  });
};

export const useResendEmailVerification = () =>
  useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ message: string }>(
        "/admin/profile/email/resend"
      );
      return data;
    },
  });

export const useResendPhoneVerification = () =>
  useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ message: string }>(
        "/admin/profile/phone/resend"
      );
      return data;
    },
  });

export const useConfirmPhoneVerification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code: string }) => {
      const { data } = await api.post<{ message: string }>(
        "/admin/profile/phone/confirm",
        payload
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminProfileKey });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (payload: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const { data } = await api.post<{ message: string }>(
        "/admin/profile/change-password",
        payload
      );
      return data;
    },
  });
};
