import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  onClick: () => void;
}

export const CategoryCard = ({
  title,
  icon,
  count,
  onClick,
}: CategoryCardProps) => {
  const { t } = useTranslation();
  return (
    <Card
      className="group cursor-pointer overflow-hidden bg-gradient-card border-border hover:shadow-hover transition-all duration-300 animate-fade-up"
      onClick={onClick}
    >
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground font-serif">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("home.items_count", {
                count,
                defaultValue: "{{count}} items",
              })}
            </p>
          </div>
        </div>
        <ChevronRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </Card>
  );
};
