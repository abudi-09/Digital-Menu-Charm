import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { MenuItem as FrontendMenuItem } from "@/types/menu";

// Backend returns _id, map to id when needed by UI
type BackendMenuItem = Omit<FrontendMenuItem, "id"> & { _id: string };

export interface MenuQueryParams {
  category?: string; // undefined or 'all' means no filter
  page?: number; // defaults in backend
  limit?: number; // defaults in backend
}

type PagedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const useMenuQuery = (params: MenuQueryParams = {}) =>
  useQuery<PagedResponse<BackendMenuItem>>({
    queryKey: [
      "menu-items",
      params.category ?? "all",
      params.page ?? 1,
      params.limit ?? 5,
    ],
    queryFn: async () => {
      const { category, page, limit } = params;
      const { data } = await api.get<PagedResponse<BackendMenuItem>>("/menu", {
        params: { category, page, limit },
      });
      return data;
    },
  });

export const useCategoriesQuery = () =>
  useQuery<string[]>({
    queryKey: ["menu-categories"],
    queryFn: async () => {
      const { data } = await api.get<string[]>("/menu/categories");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

export const useCreateMenuItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<BackendMenuItem>) =>
      api.post("/menu", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
};

export const useUpdateMenuItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<BackendMenuItem>;
    }) => api.put(`/menu/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
};

export const useDeleteMenuItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/menu/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
};
