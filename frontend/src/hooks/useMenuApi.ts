import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { MenuItem as FrontendMenuItem } from "@/types/menu";

// Backend returns _id, map to id when needed by UI
type BackendMenuItem = Omit<FrontendMenuItem, "id"> & { _id: string };

export interface MenuQueryParams {
  category?: string; // undefined or 'all' means no filter
  page?: number; // defaults in backend
  limit?: number; // defaults in backend
  lang?: string; // optional language code: 'en' | 'am'
}

type PagedResponse<T> = {
  map(
    arg0: (b: Omit<FrontendMenuItem, "id"> & { _id?: string; id?: string }) => {
      id: string;
      name: string;
      category: string;
      price: number;
      description: string;
      fullDescription: string;
      image: string;
      ingredients: string[];
      allergens: string[];
      prepTime: string;
      portionSize: string;
      available: boolean;
    }
  ): FrontendMenuItem[];
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
      params.lang ?? "en",
    ],
    queryFn: async () => {
      const { category, page, limit, lang } = params;
      const { data } = await api.get<PagedResponse<BackendMenuItem>>("/menu", {
        params: { category, page, limit, lang },
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

export const useAllMenuItems = (lang?: string) =>
  useQuery<BackendMenuItem[]>({
    queryKey: ["menu-items-all", lang ?? "en"],
    queryFn: async () => {
      const { data } = await api.get<BackendMenuItem[]>("/menu", {
        params: { lang },
      });
      return data;
    },
  });

export const useCreateMenuItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => api.post("/menu", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
};

export const useUpdateMenuItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
      api.put(`/menu/${id}`, payload),
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
