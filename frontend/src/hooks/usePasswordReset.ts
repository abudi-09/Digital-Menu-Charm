import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface PasswordResetIdentity {
  maskedEmail: string;
  phoneEnding: string | null;
  hasPhone: boolean;
  phoneVerified: boolean;
}

const identityKey = ["password-reset-identity"] as const;

export const usePasswordResetIdentity = () =>
  useQuery<PasswordResetIdentity>({
    queryKey: identityKey,
    queryFn: async () => {
      const { data } = await api.get<PasswordResetIdentity>(
        "/admin/password/identity"
      );
      return data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });

export const usePasswordResetRequest = () =>
  useMutation({
    mutationFn: async (payload: {
      method: "email" | "phone";
      value: string;
    }) => {
      const { data } = await api.post<{
        message: string;
        sessionId: string;
        maskedEmail?: string;
      }>("/admin/password/forgot", payload);
      return data;
    },
  });

export const useVerifyResetEmail = () =>
  useMutation({
    mutationFn: async (payload: { sessionId: string; token: string }) => {
      const { data } = await api.post<{
        message: string;
        smsRequired: boolean;
      }>("/admin/password/verify-email", payload);
      return data;
    },
  });

export const useVerifyResetSms = () =>
  useMutation({
    mutationFn: async (payload: { sessionId: string; code: string }) => {
      const { data } = await api.post<{
        message: string;
        smsVerified: boolean;
      }>("/admin/password/verify-sms", payload);
      return data;
    },
  });

export const useCompletePasswordReset = () =>
  useMutation({
    mutationFn: async (payload: { sessionId: string; newPassword: string }) => {
      const { data } = await api.post<{ message: string }>(
        "/admin/password/reset",
        payload
      );
      return data;
    },
  });
