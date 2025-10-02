import { Schema, model, Document } from "mongoose";

export interface MenuItemDocument extends Document {
  name: string;
  category: string;
  price: number;
  description: string;
  fullDescription?: string;
  image?: string;
  ingredients?: string[];
  allergens?: string[];
  prepTime?: string;
  portionSize?: string;
  available: boolean;
}

const menuItemSchema = new Schema<MenuItemDocument>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    fullDescription: String,
    image: String,
    ingredients: [String],
    allergens: [String],
    prepTime: String,
    portionSize: String,
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const MenuItem = model<MenuItemDocument>("MenuItem", menuItemSchema);
