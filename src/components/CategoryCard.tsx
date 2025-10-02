import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  onClick: () => void;
  delay?: number;
}

export const CategoryCard = ({
  title,
  icon,
  count,
  onClick,
  delay = 0,
}: CategoryCardProps) => {
  return (
    <Card
      className="group cursor-pointer overflow-hidden bg-gradient-to-br from-white to-muted/30 border-border/50 hover:border-primary/30 hover:shadow-2xl transition-all duration-500 animate-fade-up hover:scale-105 transform"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="p-8 flex items-center justify-between relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-110 transform">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground font-serif mb-2 group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              {count} delicious {count === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
        <ChevronRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all duration-300 w-6 h-6 relative z-10" />
      </div>
    </Card>
  );
};
