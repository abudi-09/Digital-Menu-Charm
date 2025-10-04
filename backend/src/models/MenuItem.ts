import { Schema, model, Document, Types } from "mongoose";

// For multilingual support, name/description/fullDescription can be either a string or an object keyed by locale (e.g., { en, am })
export interface MenuItemDocument extends Document {
  name: string | Record<string, string>;
  category: string;
  price: number;
  description: string | Record<string, string>;
  fullDescription?: string | Record<string, string>;
  image?: string;
  ingredients?: string[] | Record<string, string[]>;
  allergens?: string[] | Record<string, string[]>;
  prepTime?: string;
  portionSize?: string;
  available: boolean;
}

const menuItemSchema = new Schema<MenuItemDocument>(
  {
    // Mixed to allow string or { en, am }
    name: { type: Schema.Types.Mixed, required: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: Schema.Types.Mixed, required: true },
    fullDescription: { type: Schema.Types.Mixed },
    image: String,
    // Allow array of strings or localized arrays keyed by locale
    ingredients: { type: Schema.Types.Mixed },
    allergens: { type: Schema.Types.Mixed },
    prepTime: String,
    portionSize: String,
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const MenuItem = model<MenuItemDocument>("MenuItem", menuItemSchema);
