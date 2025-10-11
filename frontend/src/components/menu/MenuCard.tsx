import { memo, useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Flame,
  Heart,
  Leaf,
  Plus,
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
  popular: <Heart className="h-3.5 w-3.5" aria-hidden="true" />,
  signature: <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />,
  quick: <Timer className="h-3.5 w-3.5" aria-hidden="true" />,
};

const badgeTranslationKeys: Record<string, string> = {
  spicy: "menu.badges.spicy",
  vegan: "menu.badges.vegan",
  vegetarian: "menu.badges.vegetarian",
  chef: "menu.badges.chef",
  "chef's special": "menu.badges.chefs_special",
  new: "menu.badges.new",
  popular: "menu.badges.popular",
  signature: "menu.badges.signature",
  quick: "menu.badges.quick",
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
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{
            y: -6,
            boxShadow: "0px 25px 45px -24px rgba(17, 24, 39, 0.35)",
          }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 24,
            mass: 0.9,
          }}
          className={cn(
            "group/card relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-background/95 bg-gradient-to-br from-background/70 via-background/90 to-background backdrop-blur-xl transition-all",
            "focus-within:ring-2 focus-within:ring-primary/60",
            className
          )}
          aria-label={item.name}
        >
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/15" />
          </div>

          <div className="relative">
            <AspectRatio ratio={4 / 3}>
              <motion.img
                src={imageSrc}
                alt={item.name}
                loading="lazy"
                className="h-full w-full rounded-t-3xl object-cover transition-transform duration-500 will-change-transform group-hover/card:scale-105"
                whileHover={{ scale: 1.05 }}
                onError={(event) => {
                  (event.currentTarget as HTMLImageElement).src =
                    "/placeholder.svg";
                }}
              />
            </AspectRatio>

            <div className="pointer-events-none absolute inset-0 rounded-t-3xl bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />

            {badges.length > 0 ? (
              <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
                {badges.slice(0, 3).map((badge) => {
                  const key = badge.toLowerCase();
                  const icon = badgeIconMap[key] ?? null;
                  return (
                    <Badge
                      key={badge}
                      className="bg-background/85 backdrop-blur-md"
                    >
                      <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide">
                        {icon}
                        {t(badgeTranslationKeys[key] ?? badge, {
                          defaultValue: badge,
                        })}
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
                      type="button"
                      size="icon"
                      variant="secondary"
                      onClick={(event) => {
                        event.stopPropagation();
                        onAddToOrder(item);
                      }}
                      className="rounded-full border border-border/60 bg-background/90 text-muted-foreground shadow-soft transition-transform hover:scale-110 hover:text-primary"
                      aria-label={t("menu.add_to_order", {
                        defaultValue: "Add to Order",
                      })}
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
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
                <motion.span
                  layout
                  className="shrink-0 rounded-full bg-primary/12 px-3 py-1 text-sm font-semibold text-primary shadow-soft"
                >
                  {price}
                </motion.span>
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

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 gap-2 rounded-full px-4 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                  onClick={() => onViewDetails(item)}
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  {t("menu.view_details", { defaultValue: "View Details" })}
                </Button>

                {onAddToOrder ? (
                  <Button
                    type="button"
                    className="group/add h-10 rounded-full px-4 text-sm font-semibold shadow-soft transition-transform hover:-translate-y-0.5"
                    onClick={() => onAddToOrder(item)}
                  >
                    <ShoppingCart
                      className="mr-2 h-4 w-4 transition-transform group-hover/add:scale-110"
                      aria-hidden="true"
                    />
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
