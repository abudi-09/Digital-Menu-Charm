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

const getCategoryDomId = (category: string) => {
  if (category === "__all") {
    return "menu-tabpanel-all";
  }
  const normalized = category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `menu-tabpanel-${normalized || "all"}`;
};

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
    <nav
      className={cn(
        "relative border-b border-border/70 bg-background/95/90 backdrop-blur-md shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]",
        sticky && "sticky top-[var(--menu-tabs-offset,4rem)] z-30",
        className
      )}
      aria-label="Menu Categories"
    >
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        aria-hidden="true"
      />
      <ScrollArea className="w-full whitespace-nowrap">
        <div
          className={cn(
            "container mx-auto flex items-center gap-2 px-4 py-3 sm:gap-3",
            "justify-start md:justify-center",
            innerClassName
          )}
          role="tablist"
          aria-orientation="horizontal"
        >
          {categories.map((category, idx) => {
            const isActive = category === activeCategory;
            const panelId = getCategoryDomId(category);
            const tabId = `${panelId}-tab`;
            return (
              <button
                key={category}
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                id={tabId}
                onClick={() => onCategoryChange(category)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" && idx < categories.length - 1) {
                    onCategoryChange(categories[idx + 1]);
                  } else if (e.key === "ArrowLeft" && idx > 0) {
                    onCategoryChange(categories[idx - 1]);
                  } else if (e.key === "Home") {
                    onCategoryChange(categories[0]);
                  } else if (e.key === "End") {
                    onCategoryChange(categories[categories.length - 1]);
                  }
                }}
                className={cn(
                  "group relative flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-primary",
                  isActive
                    ? "shadow-lg shadow-primary/15"
                    : "bg-muted/60 hover:bg-muted/80"
                )}
              >
                <span className="relative z-10 px-0.5">
                  {labelFor(category)}
                </span>
                {isActive ? (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute inset-0 -z-10 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  />
                ) : (
                  <span className="absolute inset-0 -z-10 rounded-full bg-muted/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                )}
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="hidden md:flex" />
      </ScrollArea>
    </nav>
  );
};
