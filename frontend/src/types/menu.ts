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
}

export type Category = 'Starters' | 'Main Course' | 'Desserts' | 'Drinks' | 'Specials';
