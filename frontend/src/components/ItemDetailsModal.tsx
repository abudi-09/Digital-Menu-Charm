import { X, Clock, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MenuItem } from "@/types/menu";
import { useTranslation } from "react-i18next";

interface ItemDetailsModalProps {
  item: MenuItem | null;
  open: boolean;
  onClose: () => void;
}

export const ItemDetailsModal = ({
  item,
  open,
  onClose,
}: ItemDetailsModalProps) => {
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
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 animate-slide-up">
        <div className="relative w-full h-64 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-all"
            aria-label={t("common.cancel", { defaultValue: "Close dialog" })}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ScrollArea className="max-h-[calc(90vh-16rem)]">
          <div className="p-6 space-y-6">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <DialogTitle className="text-3xl font-bold font-serif text-foreground">
                  {item.name}
                </DialogTitle>
                <span className="text-2xl font-bold text-primary whitespace-nowrap">
                  {formatPrice(item.price)}
                </span>
              </div>
            </DialogHeader>

            <div className="flex gap-2">
              <Badge
                variant={item.available ? "default" : "secondary"}
                className={item.available ? "bg-primary/10 text-primary" : ""}
              >
                {item.available
                  ? t("menuMgmt.available")
                  : t("menuMgmt.out_of_stock", { defaultValue: "Unavailable" })}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                {item.prepTime}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Users className="w-3 h-3" />
                {item.portionSize}
              </Badge>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold font-serif">
                {t("menu.item_description", { defaultValue: "Description" })}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.fullDescription}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold font-serif">
                {t("menu.ingredients", { defaultValue: "Ingredients" })}
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.ingredients.map((ingredient, index) => (
                  <Badge key={index} variant="secondary" className="bg-muted">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>

            {item.allergens.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold font-serif text-destructive">
                  {t("menu.allergens", { defaultValue: "Allergens" })}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.allergens.map((allergen, index) => (
                    <Badge
                      key={index}
                      variant="destructive"
                      className="bg-destructive/10 text-destructive hover:bg-destructive/20"
                    >
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
