import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MenuItem } from "@/types/menu";
import { ArrowRight, UtensilsCrossed } from "lucide-react";

interface MenuItemCardProps {
  item: MenuItem;
  onViewDetails: (item: MenuItem) => void;
}

export const MenuItemCard = ({ item, onViewDetails }: MenuItemCardProps) => {
  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-border/70 bg-card/90 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-hover">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground shadow-sm backdrop-blur">
          <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />
          <span className="text-[0.7rem] text-foreground">{item.category}</span>
        </div>
        <div className="absolute bottom-4 right-4 rounded-2xl border border-white/50 bg-white/90 px-4 py-1.5 text-sm font-semibold text-foreground shadow-md">
          ${item.price.toFixed(2)}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
        <div className="space-y-2">
          <h3 className="font-serif text-xl font-semibold text-foreground">
            {item.name}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {item.description}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <Badge
            variant={item.available ? "default" : "secondary"}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              item.available
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {item.available ? "Available" : "Not Available"}
          </Badge>

          <Button
            variant={item.available ? "default" : "outline"}
            size="sm"
            onClick={() => onViewDetails(item)}
            className={cn(
              "group/button rounded-full px-4 py-2 text-sm font-semibold transition-all",
              item.available
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow"
                : "text-muted-foreground"
            )}
            disabled={!item.available}
          >
            <span>View Details</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
