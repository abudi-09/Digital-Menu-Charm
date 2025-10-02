import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryTabs = ({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) => {
  return (
    <div className="sticky top-[148px] z-20 border-b border-border/60 bg-background/90 backdrop-blur-2xl sm:top-[156px] md:top-[164px]">
      <div className="container mx-auto px-4 pb-4 pt-3 md:px-6">
        <div className="flex items-center gap-3 overflow-x-auto">
          <div className="flex min-w-max items-center gap-2 rounded-full border border-border/70 bg-card/85 px-2 py-2 shadow-soft">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={cn(
                  "group relative flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium uppercase tracking-[0.15em] transition-all duration-300 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  activeCategory === category
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full bg-primary transition-all duration-300",
                    activeCategory === category
                      ? "opacity-100 scale-100"
                      : "-translate-y-0.5 scale-0 opacity-0"
                  )}
                />
                <span>{category}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
