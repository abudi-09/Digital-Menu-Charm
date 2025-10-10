export interface MenuItem {
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
  spiceLevel?: "Mild" | "Medium" | "Hot" | string;
  badges?: string[];
  tags?: string[];
  calories?: number;
  currency?: string;
  isChefSpecial?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
}

export type Category =
  | "Starters"
  | "Main Course"
  | "Desserts"
  | "Drinks"
  | "Specials";
