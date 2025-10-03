import { MenuItem, MenuItemDocument } from "../models/MenuItem";

export const listMenuItems = () => MenuItem.find().sort({ createdAt: -1 });

export const listMenuPaged = async (params: {
  category?: string;
  page?: number;
  limit?: number;
}) => {
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const limit = Math.max(1, Math.floor(params.limit ?? 5));
  const filter: Record<string, unknown> = {};
  if (params.category && params.category !== "all") {
    filter.category = params.category;
  }

  const total = await MenuItem.countDocuments(filter).exec();
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);

  const items = await MenuItem.find(filter)
    .sort({ createdAt: -1 })
    .skip((safePage - 1) * limit)
    .limit(limit)
    .exec();

  return { items, total, page: safePage, limit, totalPages };
};

export const listDistinctCategories = async (): Promise<string[]> => {
  const cats = await MenuItem.distinct("category").exec();
  // Sort categories alphabetically for consistent UX
  return (cats as string[]).filter(Boolean).sort((a, b) => a.localeCompare(b));
};

export const createMenuItem = (payload: Partial<MenuItemDocument>) => {
  const item = new MenuItem(payload);
  return item.save();
};

export const updateMenuItem = (
  id: string,
  payload: Partial<MenuItemDocument>
) => MenuItem.findByIdAndUpdate(id, payload, { new: true });

export const deleteMenuItem = (id: string) => MenuItem.findByIdAndDelete(id);
