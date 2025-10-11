import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MenuItemCard } from "@/components/MenuItemCard";
import { ItemDetailsModal } from "@/components/ItemDetailsModal";
import { MenuCategoryTabs } from "@/components/menu/MenuCategoryTabs";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Footer } from "@/components/Footer";
import { menuItems as staticMenuItems, categories } from "@/data/menuData";
import { DEFAULT_CATEGORY_ORDER } from "@/lib/categoryLabels";
import { MenuItem } from "@/types/menu";
import { useMenuQuery } from "@/hooks/useMenuApi";
import { useTranslation } from "react-i18next";
import { LanguageDropdown } from "@/components/LanguageDropdown";

type BackendMenuItem = Omit<MenuItem, "id"> & { _id?: string; id?: string };

const Menu = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>(
    searchParams.get("category") || "__all"
  );
  const {
    data: backendItems,
    isLoading: apiLoading,
    isError,
  } = useMenuQuery({ lang: i18n.language });

  useEffect(() => {
    // Keep a short skeleton for visual polish while fetching
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setActiveCategory(category);
      // Smooth scroll to category section
      const element = document.getElementById(category);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [searchParams]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === "__all") {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  const handleViewDetails = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay clearing the item to allow modal animation to complete
    setTimeout(() => setSelectedItem(null), 300);
  };

  // Normalize backend response: backend may return either an array of items
  // or a paged object { items: MenuItem[], total, page, ... }.
  // Map safely to the UI MenuItem shape and warn if the shape is unexpected.
  const rawBackend: unknown = backendItems;
  let backendArray: BackendMenuItem[] = [];

  if (Array.isArray(rawBackend)) {
    backendArray = rawBackend as BackendMenuItem[];
  } else if (rawBackend && typeof rawBackend === "object") {
    const asRecord = rawBackend as Record<string, unknown>;
    if (Array.isArray(asRecord.items)) {
      backendArray = asRecord.items as BackendMenuItem[];
    } else {
      // Unexpected shape — log for debugging and fall back to empty list
      if (Object.keys(asRecord).length > 0) {
        console.warn(
          "useMenuQuery returned unexpected shape for backendItems:",
          asRecord
        );
      }
      backendArray = [];
    }
  } else {
    backendArray = [];
  }

  const sourceItems = backendArray.map((b: BackendMenuItem) => ({
    id:
      b._id ||
      b.id ||
      (typeof crypto !== "undefined" &&
      typeof (crypto as unknown as Crypto)?.randomUUID === "function"
        ? (crypto as unknown as Crypto).randomUUID()
        : Math.random().toString(36).slice(2)),
    name: b.name,
    category: b.category,
    price: b.price,
    description: b.description,
    fullDescription: b.fullDescription || "",
    image: b.image || "",
    ingredients: b.ingredients || [],
    allergens: b.allergens || [],
    prepTime: b.prepTime || "",
    portionSize: b.portionSize || "",
    available: b.available,
  })) as MenuItem[];

  const filteredItems = sourceItems.filter((item) =>
    activeCategory === "__all" ? true : item.category === activeCategory
  );

  const tabList = ["__all", ...DEFAULT_CATEGORY_ORDER];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-muted"
            aria-label={t("common.back")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-serif text-foreground">
              {t("menu.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("menu.subtitle")}
            </p>
          </div>
          <div className="ml-auto">
            <LanguageDropdown />
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <MenuCategoryTabs
        categories={tabList}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        labelFor={(c) =>
          c === "__all"
            ? t("menuMgmt.filters_all")
            : t(`menu.categories.${c}`, { defaultValue: c })
        }
      />

      {/* Menu Items */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div id={activeCategory} className="space-y-4">
          <h2 className="text-3xl font-bold font-serif text-foreground mb-6">
            {activeCategory === "__all" ? t("menu.title") : activeCategory}
          </h2>

          <AnimatePresence mode="wait">
            {loading || apiLoading ? (
              <motion.div
                key={`loading-${activeCategory}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`items-${activeCategory}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("menu.empty")}</p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Item Details Modal */}
      <ItemDetailsModal
        item={selectedItem}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Menu;
//sRjtsyIO5YPHPQiR
//abdsalih229_db_user
