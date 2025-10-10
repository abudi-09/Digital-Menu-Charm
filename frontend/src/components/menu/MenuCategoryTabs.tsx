import { motion } from "framer-motion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MenuCategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  labelFor: (category: string) => string;
  sticky?: boolean;
  className?: string;
  innerClassName?: string;
}

export const MenuCategoryTabs = ({
  categories,
  activeCategory,
  onCategoryChange,
  labelFor,
  sticky = true,
  className,
  innerClassName,
}: MenuCategoryTabsProps) => {
  return (
    <div
      className={cn(
        "border-b border-border/70 bg-background/95 backdrop-blur-sm",
        sticky && "sticky top-[var(--menu-tabs-offset,4rem)] z-30",
        className
      )}
    >
      <ScrollArea className="w-full whitespace-nowrap">
        <div
          className={cn(
            "container mx-auto flex items-center gap-2 px-4 py-3",
            innerClassName
          )}
        >
          {categories.map((category) => {
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <span>{labelFor(category)}</span>
                {isActive ? (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute inset-0 -z-10 rounded-full bg-primary/10 shadow-soft"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="hidden md:flex" />
      </ScrollArea>
    </div>
  );
};
