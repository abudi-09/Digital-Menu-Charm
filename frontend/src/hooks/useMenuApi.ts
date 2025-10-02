import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { MenuItem as FrontendMenuItem } from "@/types/menu";

// Backend returns _id, map to id when needed by UI
type BackendMenuItem = Omit<FrontendMenuItem, "id"> & { _id: string };

export const useMenuQuery = () =>
  useQuery<BackendMenuItem[]>({
    queryKey: ["menu"],
    queryFn: async () => {
      const { data } = await api.get<BackendMenuItem[]>("/menu");
      return data;
    },
  });

export const useCreateMenuItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<BackendMenuItem>) => api.post("/menu", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu"] }),
  });
};

export const useUpdateMenuItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BackendMenuItem> }) =>
      api.put(`/menu/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu"] }),
  });
};

export const useDeleteMenuItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/menu/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu"] }),
  });
};
