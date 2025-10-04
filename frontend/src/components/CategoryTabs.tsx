import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  labelFor?: (category: string) => string;
}

export const CategoryTabs = ({
  categories,
  activeCategory,
  onCategoryChange,
  labelFor,
}: CategoryTabsProps) => {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border py-3 px-4 overflow-x-auto">
      <div className="flex gap-2 min-w-max">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              "px-4 py-2 rounded-full font-medium transition-all duration-300 whitespace-nowrap",
              activeCategory === category
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {labelFor ? labelFor(category) : category}
          </button>
        ))}
      </div>
    </div>
  );
};
