const EMOJI_MAP: Record<string, string> = {
  lunch: "🍱",
  burger: "🍔",
  breakfast: "🥐",
  juice: "🧃",
  sandwich: "🥪",
  soft: "🥤",
  shorma: "�",
  "hot thing": "�️",
  pizza: "🍕",
};

export const DEFAULT_CATEGORY_ORDER = [
  "Lunch",
  "Burger",
  "Breakfast",
  "Juice",
  "Sandwich",
  "Soft",
  "Shorma",
  "Hot Thing",
  "Pizza",
];

export const formatCategoryLabel = (
  category: string,
  label: string
): string => {
  const emoji = getCategoryEmoji(category);
  return emoji ? `${emoji} ${label}` : label;
};

export const getCategoryEmoji = (category: string): string | undefined => {
  if (!category) return undefined;
  const key = category.toLowerCase();
  return EMOJI_MAP[key];
};

export const mergeCategoryOrder = (
  categories: string[],
  fallback: string[] = DEFAULT_CATEGORY_ORDER
): string[] => {
  const seen = new Set<string>();
  const ordered: string[] = [];

  // Add all from fallback first
  for (const defined of fallback) {
    if (!seen.has(defined)) {
      seen.add(defined);
      ordered.push(defined);
    }
  }

  // Add any additional categories not in fallback
  for (const category of categories) {
    if (!seen.has(category)) {
      seen.add(category);
      ordered.push(category);
    }
  }

  return ordered;
};
