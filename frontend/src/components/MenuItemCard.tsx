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
  const { t } = useTranslation();
  return (
    <Card className="group overflow-hidden bg-gradient-card border-border hover:shadow-hover transition-all duration-300 animate-fade-in">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-foreground font-serif line-clamp-1">
            {item.name}
          </h3>
          <span className="text-lg font-bold text-primary whitespace-nowrap">
            ${item.price.toFixed(2)}
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between pt-2">
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
            className="text-primary hover:text-primary-foreground hover:bg-primary transition-all"
            disabled={!item.available}
          >
            {t("menu.view_details")}
          </Button>
        </div>
      </div>
    </Card>
  );
};
