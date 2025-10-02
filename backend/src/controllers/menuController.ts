import { Request, Response } from "express";
import * as menuService from "../services/menuService";

export const getMenu = async (_req: Request, res: Response) => {
  const items = await menuService.listMenuItems();
  res.json(items);
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
