import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  labelFor?: (category: string) => string;
  sticky?: boolean;
  className?: string;
  innerClassName?: string;
}

export const CategoryTabs = ({
  categories,
  activeCategory,
  onCategoryChange,
  labelFor,
  sticky = true,
  className,
  innerClassName,
}: CategoryTabsProps) => {
  return (
    <div
      className={cn(
        "z-10 overflow-x-auto border-b border-border py-3 px-4",
        sticky
          ? "sticky top-0 bg-background/95 backdrop-blur-sm"
          : "bg-transparent border-none px-0",
        className
      )}
    >
      <div className={cn("flex min-w-max gap-2", innerClassName)}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 font-medium transition-all duration-300",
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
