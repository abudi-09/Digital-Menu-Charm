import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageDropdown } from "@/components/LanguageDropdown";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  href: string;
  type: "route" | "anchor";
}

function scrollToHash(hash: string) {
  if (typeof document === "undefined") return;
  const el = document.querySelector(hash);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: "home", label: t("nav.home"), href: "/", type: "route" },
    { id: "menu", label: t("nav.menu"), href: "#menu", type: "anchor" },
    {
      id: "contact",
      label: t("nav.contact"),
      href: "#contact",
      type: "anchor",
    },
  ];

  const handleNavigate = (item: NavItem) => {
    if (item.type === "route") {
      navigate(item.href);
    } else {
      scrollToHash(item.href);
    }
    setMobileOpen(false);
  };

  const renderNavItems = (itemClass?: string) =>
    navItems.map((item) => (
      <button
        key={item.id}
        type="button"
        onClick={() => handleNavigate(item)}
        className={cn(
          "text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          itemClass
        )}
      >
        {item.label}
      </button>
    ));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4 sm:h-20">
        <Link
          to="/"
          className="text-lg font-semibold uppercase tracking-[0.35em] text-primary"
          aria-label="Grand Vista Home"
        >
          Grand&nbsp;Vista
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {renderNavItems()}
          <LanguageDropdown />
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageDropdown />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70"
                aria-label="Toggle navigation"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background/95 p-6">
              <SheetHeader>
                <SheetTitle className="text-left text-base font-semibold uppercase tracking-[0.3em] text-primary">
                  Grand Vista
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-4">
                {renderNavItems("justify-start text-left text-base")}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
