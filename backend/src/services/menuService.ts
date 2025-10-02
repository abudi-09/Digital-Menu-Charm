import { MenuItem, MenuItemDocument } from "../models/MenuItem";

export const listMenuItems = () => MenuItem.find().sort({ createdAt: -1 });

export const createMenuItem = (payload: Partial<MenuItemDocument>) => {
  const item = new MenuItem(payload);
  return item.save();
};

export const updateMenuItem = (
  id: string,
  payload: Partial<MenuItemDocument>
) => MenuItem.findByIdAndUpdate(id, payload, { new: true });

export const deleteMenuItem = (id: string) => MenuItem.findByIdAndDelete(id);
