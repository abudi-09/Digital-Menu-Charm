import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { changeLanguage, SUPPORTED_LANGS, type SupportedLang } from "@/i18n";
import { Languages, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const FLAG_MAP: Record<SupportedLang, string> = {
  en: "🇬🇧",
  am: "🇪🇹",
};

const SHORT_LABEL: Record<SupportedLang, string> = {
  en: "EN",
  am: "አማ",
};

export interface LanguageDropdownProps {
  className?: string;
}

export const LanguageDropdown = ({ className }: LanguageDropdownProps) => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = (i18n.language as SupportedLang) || "en";

  const label = `${FLAG_MAP[current]} ${SHORT_LABEL[current]}`;

  const handleChange = async (lng: SupportedLang) => {
    setOpen(false);
    if (lng === current) return;
    await changeLanguage(lng);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-sm font-medium shadow-sm transition-all hover:bg-background/90",
            className
          )}
          aria-label={t("common.language")}
        >
          <Languages className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="font-semibold tracking-wide">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 rounded-xl border border-border/60 bg-background/95 backdrop-blur-sm shadow-lg"
      >
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          {t("common.language")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SUPPORTED_LANGS.map((lng) => (
          <DropdownMenuItem
            key={lng}
            onSelect={() => handleChange(lng)}
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-2">
              <span role="img" aria-hidden="true">
                {FLAG_MAP[lng]}
              </span>
              <span>
                {t(lng === "en" ? "common.english" : "common.amharic")}
              </span>
            </div>
            {current === lng && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageDropdown;
