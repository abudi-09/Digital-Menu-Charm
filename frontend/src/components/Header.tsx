import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import FocusTrap from "focus-trap-react";
import { Button } from "@/components/ui/button";
import { LanguageDropdown } from "@/components/LanguageDropdown";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 24;

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY || document.documentElement.scrollTop;
      setScrolled(offset > SCROLL_THRESHOLD);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems: NavItem[] = useMemo(
    () => [
      { id: "home", label: t("nav.home"), href: "/", type: "route" },
      {
        id: "menu",
        label: t("nav.menu"),
        href: "#menu-preview",
        type: "anchor",
      },
      {
        id: "about",
        label: t("nav.about", { defaultValue: "About" }),
        href: "/about",
        type: "route",
      },
      {
        id: "contact",
        label: t("nav.contact"),
        href: "#contact",
        type: "anchor",
      },
    ],
    [t]
  );

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
          "relative text-sm font-semibold text-muted-foreground transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          itemClass
        )}
      >
        <span>{item.label}</span>
        <span className="absolute inset-x-0 -bottom-1 h-0.5 origin-center scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100" />
      </button>
    ));

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-50 w-full backdrop-blur-lg",
        scrolled
          ? "bg-background/95 shadow-lg shadow-primary/5"
          : "bg-background/70 border-b border-border/50"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4 transition-all sm:h-20">
        <Link
          to="/"
          className="flex items-center gap-3 text-left"
          aria-label="Lavender Café & Restaurant home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 via-primary to-primary/70 text-base font-semibold text-primary-foreground shadow-soft">
            LC
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold uppercase tracking-[0.38em] text-primary">
              Lavender
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              Café & Restaurant
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {renderNavItems("group")}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageDropdown className="h-10 rounded-full px-4" />
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-primary/30 bg-gradient-to-r from-primary/10 to-transparent px-4 text-sm font-semibold text-primary shadow-soft hover:-translate-y-0.5"
            onClick={() => scrollToHash("#menu-preview")}
          >
            {t("home.hero_primary_cta", { defaultValue: "Explore Menu" })}
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button
            variant="ghost"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background/80"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>
            <motion.div
              key="mobile-drawer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 lg:hidden"
            >
              <button
                aria-label="Close menu overlay"
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", stiffness: 240, damping: 28 }}
                className="relative flex h-full w-[82%] max-w-sm flex-col gap-8 bg-background/98 p-6 backdrop-blur-xl shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm uppercase tracking-[0.4em] text-primary">
                      Lavender Café
                    </span>
                    <span className="text-base font-semibold text-foreground">
                      ላቬንደር ካፌ & ምግብ ቤት
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full border border-border/60"
                    onClick={() => setMobileOpen(false)}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </div>

                <nav className="flex flex-col gap-4" role="navigation">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item)}
                      className="flex items-center justify-between rounded-xl border border-transparent bg-muted/40 px-4 py-3 text-base font-semibold text-foreground transition-all hover:border-primary/30 hover:bg-muted/60"
                    >
                      <span>{item.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.id === "menu"
                          ? t("home.menu_cta", { defaultValue: "View" })
                          : ""}
                      </span>
                    </button>
                  ))}
                </nav>

                <div className="space-y-4">
                  <LanguageDropdown className="w-full justify-center rounded-xl px-4 py-2" />
                  <Button
                    className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/80 text-base font-semibold shadow-lg shadow-primary/20"
                    onClick={() => {
                      handleNavigate({
                        id: "menu",
                        href: "#menu-preview",
                        label: "",
                        type: "anchor",
                      });
                    }}
                  >
                    {t("home.hero_primary_cta", {
                      defaultValue: "Explore Menu",
                    })}
                  </Button>
                </div>

                <div className="mt-auto space-y-3 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">
                    Lavender Café & Restaurant
                  </p>
                  <p>Piassa, Gonder • +251 91 123 4567</p>
                </div>
              </motion.aside>
            </motion.div>
          </FocusTrap>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
