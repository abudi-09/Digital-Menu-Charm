import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageDropdown } from "@/components/LanguageDropdown";
import { cn } from "@/lib/utils";

interface MenuTopBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sticky?: boolean;
}

export const MenuTopBar = ({
  searchTerm,
  onSearchChange,
  sticky = true,
}: MenuTopBarProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const containerClasses = useMemo(
    () =>
      cn(
        "border-b border-border bg-background/90 backdrop-blur-md",
        sticky ? "sticky top-0 z-40" : "relative"
      ),
    [sticky]
  );

  return (
    <header className={containerClasses}>
      <div className="container mx-auto flex flex-wrap items-center gap-4 px-4 py-4 md:flex-nowrap md:gap-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0 rounded-full border border-border/60 bg-background/80 transition-transform hover:-translate-y-0.5 hover:bg-background"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Button>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-xs uppercase tracking-[0.4em] text-primary/80">
            Grand Vista
          </span>
          <h1 className="text-2xl font-serif font-bold text-foreground sm:text-3xl">
            {t("menu.title")}
          </h1>
        </div>

        <div className="flex w-full flex-1 items-center gap-3 md:w-auto md:max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t("menu.search_placeholder")}
              className="w-full rounded-full border-border bg-background/80 pl-10 pr-4 text-sm shadow-sm focus-visible:ring-1"
            />
          </div>
        </div>

        <div className="ml-auto shrink-0">
          <LanguageDropdown />
        </div>
      </div>
    </header>
  );
};
