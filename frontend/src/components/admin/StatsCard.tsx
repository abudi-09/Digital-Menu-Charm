import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  loading?: boolean;
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  loading = false,
}: StatsCardProps) => {
  return (
    <Card className="p-6 bg-gradient-card border-border hover:shadow-hover transition-all animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-24 h-8 bg-muted rounded animate-pulse" />
            </div>
          ) : (
            <p className="text-3xl font-bold text-foreground font-serif">
              {value}
            </p>
          )}
          {loading ? (
            <div className="w-32 h-3 bg-muted rounded animate-pulse mt-1" />
          ) : (
            description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )
          )}
          {trend && !loading && (
            <p
              className={cn(
                "text-xs font-medium",
                trend.positive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};
