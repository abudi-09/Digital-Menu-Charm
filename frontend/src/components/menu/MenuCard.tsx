import { memo, useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Flame,
  Heart,
  Leaf,
  ShoppingCart,
  Sparkles,
  Star,
  Timer,
} from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/menu";
import { useTranslation } from "react-i18next";

interface MenuCardProps {
  item: MenuItem;
  onViewDetails: (item: MenuItem) => void;
  onAddToOrder?: (item: MenuItem) => void;
  className?: string;
  layoutId?: string;
}

const badgeIconMap: Record<string, ReactNode> = {
  spicy: <Flame className="h-3.5 w-3.5" aria-hidden="true" />,
  vegan: <Leaf className="h-3.5 w-3.5" aria-hidden="true" />,
  vegetarian: <Leaf className="h-3.5 w-3.5" aria-hidden="true" />,
  chef: <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />,
  new: <Star className="h-3.5 w-3.5" aria-hidden="true" />,
  popular: <Heart className="h-3.5 w-3.5" aria-hidden="true" />, // heart for popularity
  signature: <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />,
  quick: <Timer className="h-3.5 w-3.5" aria-hidden="true" />,
};

const resolveBadges = (item: MenuItem) => {
  const rawBadges = new Set<string>();
  item.badges?.forEach((badge) => rawBadges.add(badge));
  item.tags?.forEach((tag) => rawBadges.add(tag));
  if (item.isChefSpecial) rawBadges.add("Chef's Special");
  if (item.isNew) rawBadges.add("New");
  if (item.isPopular) rawBadges.add("Popular");
  if (item.spiceLevel) rawBadges.add(item.spiceLevel);
  return Array.from(rawBadges);
};

const formatPrice = (value: number, currency?: string) => {
  const currencyCode = currency ?? "USD";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "narrowSymbol",
    }).format(value);
  } catch (error) {
    return `${currencyCode} ${value.toFixed(2)}`;
  }
};

export const MenuCard = memo(
  ({
    item,
    onViewDetails,
    onAddToOrder,
    className,
    layoutId,
  }: MenuCardProps) => {
    const { t } = useTranslation();
    const badges = useMemo(() => resolveBadges(item), [item]);
    const price = useMemo(
      () => formatPrice(item.price, item.currency),
      [item.price, item.currency]
    );

    const imageSrc =
      item.image && item.image.trim() !== "" ? item.image : "/placeholder.svg";

    return (
      <TooltipProvider delayDuration={150}>
        <motion.article
          layoutId={layoutId}
          whileHover={{
            y: -4,
            boxShadow: "0px 18px 40px -24px rgba(17, 24, 39, 0.35)",
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className={cn(
            "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-background/95 backdrop-blur-sm transition-colors",
            className
          )}
        >
          <div className="relative">
            <AspectRatio ratio={4 / 3}>
              <motion.img
                src={imageSrc}
                alt={item.name}
                loading="lazy"
                className="h-full w-full rounded-t-3xl object-cover transition-transform duration-500 will-change-transform group-hover:scale-105"
                whileHover={{ scale: 1.05 }}
                onError={(event) => {
                  (event.currentTarget as HTMLImageElement).src =
                    "/placeholder.svg";
                }}
              />
            </AspectRatio>

            <div className="pointer-events-none absolute inset-0 rounded-t-3xl bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {badges.length > 0 ? (
              <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
                {badges.slice(0, 3).map((badge) => {
                  const key = badge.toLowerCase();
                  const icon = badgeIconMap[key] ?? null;
                  return (
                    <Badge
                      key={badge}
                      className="bg-background/80 backdrop-blur-md"
                    >
                      <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide">
                        {icon}
                        {badge}
                      </span>
                    </Badge>
                  );
                })}
              </div>
            ) : null}

            {onAddToOrder ? (
              <div className="absolute right-4 top-4 flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(event) => {
                        event.stopPropagation();
                        onAddToOrder(item);
                      }}
                      className="rounded-full border border-border/60 bg-background/80 text-muted-foreground shadow-sm transition-transform hover:scale-105 hover:text-primary"
                      aria-label={t("menu.add_to_order", {
                        defaultValue: "Add to Order",
                      })}
                    >
                      <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    className="rounded-full px-3 py-1 text-xs"
                  >
                    {t("menu.add_to_order", { defaultValue: "Add to Order" })}
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col gap-5 p-6">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold leading-tight text-foreground">
                  {item.name}
                </h3>
                <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {price}
                </span>
              </div>
              <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground/80">
                {item.prepTime ? (
                  <span className="flex items-center gap-1.5">
                    <Timer className="h-3.5 w-3.5" aria-hidden="true" />
                    {item.prepTime}
                  </span>
                ) : null}
                {item.portionSize ? <span>{item.portionSize}</span> : null}
                {item.calories ? <span>{item.calories} kcal</span> : null}
              </div>

              <Separator className="border-border/60" />

              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  className="h-10 gap-2 rounded-full px-4 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                  onClick={() => onViewDetails(item)}
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  {t("menu.view_details", { defaultValue: "View Details" })}
                </Button>

                {onAddToOrder ? (
                  <Button
                    className="h-10 rounded-full px-4 text-sm font-semibold shadow-soft"
                    onClick={() => onAddToOrder(item)}
                  >
                    {t("menu.add_to_order", { defaultValue: "Add to Order" })}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </motion.article>
      </TooltipProvider>
    );
  }
);

MenuCard.displayName = "MenuCard";
