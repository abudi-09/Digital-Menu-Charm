import { Request, Response } from "express";
import * as menuService from "../services/menuService";

export const getMenu = async (req: Request, res: Response) => {
  const { category, page, limit } = req.query as {
    category?: string;
    page?: string;
    limit?: string;
  };

  // If no pagination query params are provided, preserve legacy behavior for backward compatibility
  if (!page && !limit && !category) {
    const items = await menuService.listMenuItems();
    return res.json(items);
  }

  const paged = await menuService.listMenuPaged({
    category,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  return res.json(paged);
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
