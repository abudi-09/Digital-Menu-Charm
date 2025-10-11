import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/types/menu";
import { useTranslation } from "react-i18next";

interface MenuItemCardProps {
  item: MenuItem;
  onViewDetails: (item: MenuItem) => void;
}

export const MenuItemCard = ({ item, onViewDetails }: MenuItemCardProps) => {
  const { t, i18n } = useTranslation();
  const formatPrice = (value: number) => {
    try {
      return new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency: "ETB",
        maximumFractionDigits: 2,
        currencyDisplay: "narrowSymbol",
      }).format(value);
    } catch (err) {
      return `Br ${value.toFixed(2)}`;
    }
  };
  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border bg-gradient-card transition-all duration-300 hover:shadow-hover animate-fade-in">
      <div className="aspect-[4/3] w-full overflow-hidden sm:aspect-video">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-start gap-2">
          <h3 className="flex-1 text-base font-serif font-semibold text-foreground sm:text-lg">
            {item.name}
          </h3>
          <span className="text-base font-bold text-primary sm:text-lg">
            {formatPrice(item.price)}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {item.description}
        </p>

        <div className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <Badge
            variant={item.available ? "default" : "secondary"}
            className={
              item.available
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : ""
            }
          >
            {item.available
              ? t("menuMgmt.available")
              : t("menuMgmt.out_of_stock", { defaultValue: "Not Available" })}
          </Badge>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(item)}
            className="w-full text-primary transition-all hover:bg-primary hover:text-primary-foreground sm:w-auto"
            disabled={!item.available}
          >
            {t("menu.view_details")}
          </Button>
        </div>
      </div>
    </Card>
  );
};
