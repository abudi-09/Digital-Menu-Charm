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
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        data-no-close
        className="w-full max-w-4xl max-h-[90vh] p-0 overflow-hidden animate-slide-up"
      >
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-0 h-full">
          {/* Left: Hero image */}
          <div className="relative md:col-span-1 h-56 md:h-auto bg-zinc-100">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            {/* Mobile-only close button over image (visible < md) */}
            <button
              onClick={onClose}
              aria-label="Close item details"
              className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-transform bg-amber-50 text-foreground hover:scale-105 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Content */}
          <ScrollArea className="md:col-span-2 max-h-[90vh]">
            <div className="p-6 md:p-8 space-y-5 relative">
              {/* Content close button: hidden on small screens to avoid duplicate with image button */}
              <button
                onClick={onClose}
                aria-label="Close item details"
                className="absolute left-3 top-3 md:right-4 md:left-auto md:top-4 w-10 h-10 rounded-full items-center justify-center shadow-sm transition-transform bg-amber-50 text-foreground hover:scale-105 hidden md:flex"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <DialogHeader>
                    <DialogTitle className="text-2xl md:text-3xl font-extrabold tracking-tight">
                      {item.name}
                    </DialogTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.shortDescription}
                    </p>
                  </DialogHeader>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg text-muted-foreground">Price</div>
                    <div className="mt-1 text-2xl font-bold text-primary">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  variant={item.available ? "default" : "secondary"}
                  className={
                    item.available
                      ? "bg-emerald-50 text-emerald-600 border-0"
                      : "bg-amber-50 text-amber-700 border-0"
                  }
                >
                  {item.available ? "Available Now" : "Currently Unavailable"}
                </Badge>

                <Badge variant="outline" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{item.prepTime}</span>
                </Badge>

                <Badge variant="outline" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{item.portionSize}</span>
                </Badge>
              </div>

              <div className="pt-4 border-t border-muted/40" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold">Description</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    {item.fullDescription}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Ingredients</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-muted/60"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>

                  {item.allergens.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-destructive">
                        Allergens
                      </h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.allergens.map((allergen, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-destructive/10 text-destructive"
                          >
                            {allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
