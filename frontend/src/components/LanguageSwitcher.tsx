import { useTranslation } from "react-i18next";
import { changeLanguage, SUPPORTED_LANGS, type SupportedLang } from "@/i18n";
import { cn } from "@/lib/utils";

type Props = {
  compact?: boolean;
  className?: string;
};

export function LanguageSwitcher({ compact = false, className }: Props) {
  const { i18n, t } = useTranslation();
  const current = (i18n.language as SupportedLang) || "en";

  const btn = (lng: SupportedLang, label: string) => (
    <button
      key={lng}
      aria-label={t("common.switch_to", { lang: label })}
      className={cn(
        "px-2.5 py-1 rounded-md text-sm font-medium transition-colors",
        current === lng
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-foreground hover:bg-muted/80",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "touch-manipulation"
      )}
      onClick={() => changeLanguage(lng)}
    >
      {label}
    </button>
  );

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      {btn("en", compact ? "EN" : t("common.english"))}
      <span className="text-muted-foreground text-xs">|</span>
      {btn("am", compact ? "አማ" : t("common.amharic"))}
    </div>
  );
}

export default LanguageSwitcher;
