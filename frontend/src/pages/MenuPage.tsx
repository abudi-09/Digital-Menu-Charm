import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { Filter } from "lucide-react";
import { useAllMenuItems } from "@/hooks/useMenuApi";
import type { MenuItem } from "@/types/menu";
import { MenuTopBar } from "@/components/menu/MenuTopBar";
import { MenuCategoryTabs } from "@/components/menu/MenuCategoryTabs";
import { MenuCard } from "@/components/menu/MenuCard";
import { ItemDetailModal } from "@/components/menu/ItemDetailModal";
import { MenuSkeletonGrid } from "@/components/menu/MenuSkeletonGrid";
import { EmptyState } from "@/components/menu/EmptyState";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  DEFAULT_CATEGORY_ORDER,
  formatCategoryLabel,
} from "@/lib/categoryLabels";
import { Footer } from "@/components/Footer";
import i18n from "@/i18n";

const ALL_CATEGORY = "__all";

const toCategoryDomId = (category: string) => {
  if (category === ALL_CATEGORY) {
    return "menu-tabpanel-all";
  }
  const normalized = category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `menu-tabpanel-${normalized || "all"}`;
};

type CartEntry = {
  item: MenuItem;
  quantity: number;
};

const extractLocalizedValue = (
  value: unknown,
  language: string,
  fallback: string = ""
): string => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const record = value as Record<string, string>;
    return (
      record[language] ?? record["en"] ?? Object.values(record)[0] ?? fallback
    );
  }
  return fallback;
};

const extractLocalizedArray = (value: unknown, language: string): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean) as string[];
  if (typeof value === "object") {
    const record = value as Record<string, string[]>;
    const localized =
      record[language] ?? record["en"] ?? Object.values(record)[0];
    return Array.isArray(localized) ? localized.filter(Boolean) : [];
  }
  return [];
};

const formatMoney = (value: number, currency?: string) => {
  const currencyCode = currency ?? "ETB";
  try {
    return new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "narrowSymbol",
    }).format(value);
  } catch (error) {
    return `Br ${value.toFixed(2)}`;
  }
};

const createClientId = () => {
  const globalCrypto =
    typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (globalCrypto && "randomUUID" in globalCrypto) {
    return globalCrypto.randomUUID();
  }
  return `menu-${Math.random().toString(36).slice(2, 11)}`;
};

const MenuPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cart, setCart] = useState<CartEntry[]>([]);

  const {
    data: rawItems,
    isLoading: itemsLoading,
    isError: itemsError,
  } = useAllMenuItems(i18n.language);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");
    const search = params.get("search");
    if (category) {
      setActiveCategory(category);
    }
    if (search) {
      setSearchTerm(search);
    }
  }, [location.search]);

  const categories = useMemo(
    () => [ALL_CATEGORY, ...DEFAULT_CATEGORY_ORDER, "Pasta"],
    []
  );

  const menuItems: MenuItem[] = useMemo(() => {
    if (!rawItems) return [];
    return rawItems.map((item) => {
      const baseName = extractLocalizedValue(item.name, i18n.language, "");
      const description = extractLocalizedValue(
        item.description,
        i18n.language,
        ""
      );
      const fullDescription = extractLocalizedValue(
        item.fullDescription,
        i18n.language,
        description
      );

      return {
        id:
          (item as Record<string, unknown>)._id?.toString?.() ??
          (item as Record<string, unknown>).id?.toString?.() ??
          createClientId(),
        name: baseName,
        category: (item as Record<string, unknown>).category as string,
        price: Number((item as Record<string, unknown>).price ?? 0),
        description,
        fullDescription,
        image: ((item as Record<string, unknown>).image as string) ?? "",
        ingredients: extractLocalizedArray(
          (item as Record<string, unknown>).ingredients,
          i18n.language
        ),
        allergens: extractLocalizedArray(
          (item as Record<string, unknown>).allergens,
          i18n.language
        ),
        prepTime: ((item as Record<string, unknown>).prepTime as string) ?? "",
        portionSize:
          ((item as Record<string, unknown>).portionSize as string) ?? "",
        available: Boolean((item as Record<string, unknown>).available ?? true),
        tags: Array.isArray((item as Record<string, unknown>).tags)
          ? ((item as Record<string, unknown>).tags as string[])
          : undefined,
        badges: Array.isArray((item as Record<string, unknown>).badges)
          ? ((item as Record<string, unknown>).badges as string[])
          : undefined,
        spiceLevel: (item as Record<string, unknown>).spiceLevel as
          | string
          | undefined,
        calories: (item as Record<string, unknown>).calories as
          | number
          | undefined,
        currency: (item as Record<string, unknown>).currency as
          | string
          | undefined,
        isChefSpecial: Boolean((item as Record<string, unknown>).isChefSpecial),
        isNew: Boolean((item as Record<string, unknown>).isNew),
        isPopular: Boolean((item as Record<string, unknown>).isPopular),
      };
    });
  }, [rawItems, i18n.language]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === ALL_CATEGORY || item.category === activeCategory;
      const matchesSearch =
        term.length === 0 ||
        item.name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, searchTerm]);

  const totalAvailable = filteredItems.length;
  const loading = itemsLoading;

  const handleCategoryChange = useCallback(
    (category: string) => {
      setActiveCategory(category);
      const params = new URLSearchParams(location.search);
      if (category === ALL_CATEGORY) {
        params.delete("category");
      } else {
        params.set("category", category);
      }
      navigate({ search: params.toString() }, { replace: true });
    },
    [location.search, navigate]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      const params = new URLSearchParams(location.search);
      if (value.trim().length === 0) {
        params.delete("search");
      } else {
        params.set("search", value);
      }
      navigate({ search: params.toString() }, { replace: true });
    },
    [location.search, navigate]
  );

  const handleViewDetails = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedItem(null), 200);
  }, []);

  const handleAddToOrder = useCallback(
    (item: MenuItem, quantity: number = 1) => {
      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (entry) => entry.item.id === item.id
        );
        if (existingIndex === -1) {
          return [...prev, { item, quantity }];
        }
        const next = [...prev];
        next[existingIndex] = {
          item: next[existingIndex].item,
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      });

      toast({
        title: t("menu.added_to_order", { defaultValue: "Added to order" }),
        description: `${item.name} × ${quantity}`,
        duration: 2500,
      });
    },
    [toast, t]
  );

  const handleViewOrder = useCallback(() => {
    toast({
      title: t("menu.cart_placeholder_title", {
        defaultValue: "Cart preview coming soon",
      }),
      description: t("menu.cart_placeholder_description", {
        defaultValue:
          "Please share your selections with our host to complete the order.",
      }),
      duration: 4000,
    });
  }, [toast, t]);

  const cartSummary = useMemo(() => {
    const itemsCount = cart.reduce((total, entry) => total + entry.quantity, 0);
    const subtotal = cart.reduce(
      (total, entry) => total + entry.item.price * entry.quantity,
      0
    );
    const currency = cart[0]?.item.currency ?? "USD";
    return {
      itemsCount,
      subtotal,
      displaySubtotal: formatMoney(subtotal, currency),
    };
  }, [cart]);

  const labelForCategory = useCallback(
    (category: string) => {
      if (category === ALL_CATEGORY) {
        const base = t("menu.view_all", { defaultValue: "All" });
        return `✨ ${base}`;
      }
      const translated = t(`menu.categories.${category}`, {
        defaultValue: category,
      });
      return formatCategoryLabel(category, translated);
    },
    [t]
  );

  const activePanelId = useMemo(
    () => toCategoryDomId(activeCategory),
    [activeCategory]
  );
  const activeTabId = `${activePanelId}-tab`;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      <div className="absolute inset-x-0 top-0 -z-10 h-[60vh] bg-[radial-gradient(circle_at_top,_rgba(226,232,240,0.22),_transparent_55%)]" />

      <MenuTopBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        sticky
      />

      <MenuCategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        labelFor={labelForCategory}
        sticky
        className="[--menu-tabs-offset:5.25rem]"
      />

      <main className="container mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8">
        <section className="space-y-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-3xl font-serif font-semibold text-foreground sm:text-4xl lg:text-5xl"
          >
            {t("menu.hero_title", {
              defaultValue: "Discover our signature plates",
            })}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg"
          >
            {t("menu.hero_subtitle", {
              defaultValue:
                "A seasonal tasting journey curated by our culinary team.",
            })}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
            className="flex items-center justify-center gap-3 text-sm text-muted-foreground"
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
            <span>
              {t("menu.results_count", {
                defaultValue: "{{count}} curated dishes",
                count: totalAvailable,
              })}
            </span>
          </motion.div>
        </section>

        {loading ? (
          <MenuSkeletonGrid />
        ) : itemsError ? (
          <EmptyState
            title={t("menu.error_title", {
              defaultValue: "Unable to load menu",
            })}
            description={t("menu.error_message", {
              defaultValue: "Please refresh the page or try again shortly.",
            })}
            illustration="⚠️"
            actionLabel={t("menu.retry", { defaultValue: "Retry" })}
            onAction={() => navigate(0)}
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title={t("menu.empty_title", { defaultValue: "No dishes yet" })}
            description={t("menu.empty", {
              defaultValue: "No items available in this category.",
            })}
            illustration="🕊️"
            actionLabel={t("menu.explore_all", { defaultValue: "Explore all" })}
            onAction={() => handleCategoryChange(ALL_CATEGORY)}
          />
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`${activeCategory}-${searchTerm}`}
              layout
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              role="tabpanel"
              id={activePanelId}
              aria-labelledby={activeTabId}
            >
              {filteredItems.map((item) => (
                <motion.div key={item.id} layout>
                  <MenuCard
                    item={item}
                    onViewDetails={handleViewDetails}
                    onAddToOrder={(menuItem) => handleAddToOrder(menuItem)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <ItemDetailModal
        item={selectedItem}
        open={isModalOpen}
        onClose={closeModal}
        onAddToOrder={handleAddToOrder}
      />

      <AnimatePresence>
        {cartSummary.itemsCount > 0 ? (
          <motion.aside
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="sticky bottom-6 z-40 mx-auto flex w-full max-w-md items-center justify-between gap-4 rounded-full border border-border/70 bg-background/95 px-6 py-4 shadow-2xl shadow-primary/10 backdrop-blur"
          >
            <div className="flex flex-col text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {t("menu.cart_summary", {
                  defaultValue: "{{count}} items in your order",
                  count: cartSummary.itemsCount,
                })}
              </span>
              <span>
                {t("menu.cart_total", { defaultValue: "Subtotal" })}:{" "}
                {cartSummary.displaySubtotal}
              </span>
            </div>
            <Button
              className="rounded-full px-6 text-sm font-semibold shadow-soft"
              onClick={handleViewOrder}
            >
              {t("menu.view_order", { defaultValue: "View Order" })}
            </Button>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default MenuPage;
