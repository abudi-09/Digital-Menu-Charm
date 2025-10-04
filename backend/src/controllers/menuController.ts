import { Request, Response } from "express";
import * as menuService from "../services/menuService";

const pickLocale = (
  value: string | Record<string, string> | undefined,
  lang: string | undefined
): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  const locale = (lang || "en").toLowerCase();
  return value[locale] || value.en || Object.values(value)[0] || "";
};

const pickLocaleArray = (
  value: string[] | Record<string, string[]> | undefined,
  lang: string | undefined
): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  const locale = (lang || "en").toLowerCase();
  return value[locale] || value.en || Object.values(value)[0] || [];
};

export const getMenu = async (req: Request, res: Response) => {
  const { category, page, limit, lang } = req.query as {
    category?: string;
    page?: string;
    limit?: string;
    lang?: string;
  };

  // If no pagination query params are provided, preserve legacy behavior for backward compatibility
  if (!page && !limit && !category) {
    const items = await menuService.listMenuItems();
    const mapped = items.map((i) => ({
      ...i.toObject(),
      name: pickLocale(i.name as any, lang),
      description: pickLocale(i.description as any, lang),
      fullDescription: pickLocale(i.fullDescription as any, lang),
      ingredients: pickLocaleArray(i.ingredients as any, lang),
      allergens: pickLocaleArray(i.allergens as any, lang),
    }));
    return res.json(mapped);
  }

  const paged = await menuService.listMenuPaged({
    category,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  const mapped = {
    ...paged,
    items: paged.items.map((i) => ({
      ...i.toObject(),
      name: pickLocale(i.name as any, lang),
      description: pickLocale(i.description as any, lang),
      fullDescription: pickLocale(i.fullDescription as any, lang),
      ingredients: pickLocaleArray(i.ingredients as any, lang),
      allergens: pickLocaleArray(i.allergens as any, lang),
    })),
  };
  return res.json(mapped);
};

export const postMenu = async (req: Request, res: Response) => {
  const item = await menuService.createMenuItem(req.body);
  res.status(201).json(item);
};

export const putMenu = async (req: Request, res: Response) => {
  const updated = await menuService.updateMenuItem(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: "Menu item not found" });
  res.json(updated);
};

export const deleteMenu = async (req: Request, res: Response) => {
  const deleted = await menuService.deleteMenuItem(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Menu item not found" });
  res.status(204).send();
};

export const getCategories = async (_req: Request, res: Response) => {
  const categories = await menuService.listDistinctCategories();
  res.json(categories);
};
