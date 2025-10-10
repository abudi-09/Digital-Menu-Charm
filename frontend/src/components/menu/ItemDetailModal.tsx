import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import type { MenuItem } from "@/types/menu";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface ItemDetailModalProps {
  item: MenuItem | null;
  open: boolean;
  onClose: () => void;
  onAddToOrder?: (item: MenuItem, quantity: number) => void;
}

const quantityBounds = { min: 1, max: 12 } as const;

export const ItemDetailModal = ({
  item,
  open,
  onClose,
  onAddToOrder,
}: ItemDetailModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const { t } = useTranslation();

  useEffect(() => {
    if (open) {
      setQuantity(1);
    }
  }, [open, item]);

  const price = useMemo(() => {
    if (!item) return "";
    const currency = item.currency ?? "USD";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
      }).format(item.price * quantity);
    } catch (error) {
      return `${currency} ${(item.price * quantity).toFixed(2)}`;
    }
  }, [item, quantity]);

  const handleQuantityChange = (value: number) => {
    if (Number.isNaN(value)) return;
    const clamped = Math.min(
      quantityBounds.max,
      Math.max(quantityBounds.min, value)
    );
    setQuantity(clamped);
  };

  const handleAddToOrder = () => {
    if (!item) return;
    onAddToOrder?.(item, quantity);
    onClose();
  };

  const imageSrc =
    item && item.image && item.image.trim() !== ""
      ? item.image
      : "/placeholder.svg";

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? null : onClose())}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden border-border/80 bg-background/95 p-0 backdrop-blur-xl">
        {item ? (
          <div className="grid max-h-[80vh] grid-cols-1 md:grid-cols-[1.1fr,0.9fr]">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative h-full"
            >
              <AspectRatio ratio={4 / 3} className="md:h-full">
                <motion.img
                  src={imageSrc}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                  initial={{ scale: 1.02 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  onError={(event) => {
                    (event.currentTarget as HTMLImageElement).src =
                      "/placeholder.svg";
                  }}
                />
              </AspectRatio>
              <div className="absolute inset-0 bg-gradient-to-tr from-background/60 via-transparent to-background/20" />
            </motion.div>

            <ScrollArea>
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col gap-6 p-6 md:p-8"
              >
                <DialogHeader className="space-y-2 text-left">
                  <DialogTitle className="text-3xl font-serif font-semibold">
                    {item.name}
                  </DialogTitle>
                  <DialogDescription className="text-sm uppercase tracking-[0.3em] text-primary/70">
                    {t(`menu.categories.${item.category}`, {
                      defaultValue: item.category,
                    })}
                  </DialogDescription>
                </DialogHeader>

                <p className="text-base leading-relaxed text-muted-foreground">
                  {item.fullDescription || item.description}
                </p>

                <div className="space-y-3 text-sm text-muted-foreground">
                  {item.ingredients && item.ingredients.length > 0 ? (
                    <div>
                      <p className="font-semibold text-foreground">
                        {t("menu.ingredients", { defaultValue: "Ingredients" })}
                      </p>
                      <p>{item.ingredients.join(", ")}</p>
                    </div>
                  ) : null}

                  {item.allergens && item.allergens.length > 0 ? (
                    <div>
                      <p className="font-semibold text-foreground">
                        {t("menu.allergens", { defaultValue: "Allergens" })}
                      </p>
                      <p>{item.allergens.join(", ")}</p>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-3">
                    {item.spiceLevel ? (
                      <Badge
                        variant="outline"
                        className="rounded-full px-3 py-1"
                      >
                        {t("menu.spice_level", { defaultValue: "Spice" })}:{" "}
                        {item.spiceLevel}
                      </Badge>
                    ) : null}
                    {item.portionSize ? (
                      <Badge
                        variant="outline"
                        className="rounded-full px-3 py-1"
                      >
                        {t("menu.portion_size", { defaultValue: "Portion" })}:{" "}
                        {item.portionSize}
                      </Badge>
                    ) : null}
                    {item.calories ? (
                      <Badge
                        variant="outline"
                        className="rounded-full px-3 py-1"
                      >
                        {t("menu.calories", { defaultValue: "Calories" })}:{" "}
                        {item.calories} kcal
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <Separator className="border-border/70" />

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t("menu.quantity", { defaultValue: "Quantity" })}
                    </span>
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= quantityBounds.min}
                        aria-label={t("menu.decrease_quantity", {
                          defaultValue: "Decrease quantity",
                        })}
                      >
                        −
                      </Button>
                      <Input
                        type="number"
                        inputMode="numeric"
                        className="h-10 w-16 text-center"
                        value={quantity}
                        min={quantityBounds.min}
                        max={quantityBounds.max}
                        onChange={(event) =>
                          handleQuantityChange(Number(event.target.value))
                        }
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= quantityBounds.max}
                        aria-label={t("menu.increase_quantity", {
                          defaultValue: "Increase quantity",
                        })}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t("menu.cart_total", { defaultValue: "Subtotal" })}
                    </span>
                    <span className="text-2xl font-semibold text-foreground">
                      {price}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <Button
                    variant="ghost"
                    className="rounded-full px-6"
                    onClick={onClose}
                  >
                    {t("common.cancel", { defaultValue: "Cancel" })}
                  </Button>
                  <Button
                    className={cn(
                      "rounded-full px-8 text-base font-semibold shadow-soft",
                      "bg-gradient-to-r from-primary to-primary/80"
                    )}
                    onClick={handleAddToOrder}
                  >
                    {t("menu.add_to_order", { defaultValue: "Add to Order" })}
                  </Button>
                </div>
              </motion.div>
            </ScrollArea>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
