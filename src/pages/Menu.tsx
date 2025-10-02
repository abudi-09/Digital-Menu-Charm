import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Clock3, Leaf, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItemCard } from "@/components/MenuItemCard";
import { ItemDetailsModal } from "@/components/ItemDetailsModal";
import { CategoryTabs } from "@/components/CategoryTabs";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Footer } from "@/components/Footer";
import { menuItems, categories } from "@/data/menuData";
import { MenuItem } from "@/types/menu";

const Menu = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>(
    searchParams.get("category") || categories[0]
  );
  const isTabInteraction = useRef(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const category = searchParams.get("category") || categories[0];

    if (categories.includes(category)) {
      setActiveCategory(category);

      if (!isTabInteraction.current) {
        const element = document.getElementById(category);
        if (element) {
          const rect = element.getBoundingClientRect();
          const offset = window.innerWidth < 768 ? 140 : 220;
          const top = rect.top + window.scrollY - offset;

          window.scrollTo({ top, behavior: "smooth" });
        }
      }
    }

    isTabInteraction.current = false;
  }, [searchParams]);

  const handleCategoryChange = (category: string) => {
    isTabInteraction.current = true;
    setActiveCategory(category);
    setSearchParams({ category });
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

  const filteredItems = menuItems.filter(
    (item) => item.category === activeCategory
  );

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-1/3 top-0 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute right-[-20%] top-1/3 h-[360px] w-[360px] rounded-full bg-secondary/50 blur-[160px]" />
        <div className="absolute bottom-[-30%] left-1/4 h-[320px] w-[320px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-2xl">
        <div className="container mx-auto px-4 pb-4 pt-6 md:px-6">
          <div className="flex items-center justify-between pb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-full border border-border/70 bg-card/80 p-0 text-muted-foreground shadow-sm transition-colors hover:bg-card hover:text-foreground"
              aria-label="Go back to home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="hidden text-sm font-medium uppercase tracking-[0.35em] text-muted-foreground/80 sm:inline-flex">
              Refined Dining Experience
            </span>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-border/70 bg-card/90 px-6 py-8 shadow-soft backdrop-blur md:px-10 md:py-12">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_hsl(35_85%_92%/.6),_transparent_65%)] opacity-90" />
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-10 right-10 hidden h-32 w-32 rounded-full bg-accent/20 blur-3xl md:block" />

            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-3xl space-y-6">
                <span className="inline-flex items-center gap-2 self-start rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
                  Today's Selection
                </span>
                <div className="space-y-4">
                  <h1 className="text-3xl font-serif font-bold text-foreground md:text-4xl lg:text-5xl">
                    Our Menu
                  </h1>
                  <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                    Explore refined culinary offerings crafted by our chefs.
                    Filter by category to discover signature dishes, seasonal
                    plates, and timeless classics tailored to every occasion.
                  </p>
                </div>
                <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
                  {[
                    {
                      Icon: Sparkles,
                      label: "Chef-curated seasonal dishes",
                    },
                    {
                      Icon: Clock3,
                      label: "All-day service 7 AM – 11 PM",
                    },
                    {
                      Icon: Leaf,
                      label: "Locally sourced ingredients",
                    },
                  ].map(({ Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/40 px-3 py-2 backdrop-blur"
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="leading-snug">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden shrink-0 rounded-[24px] border border-border/60 bg-muted/40 p-6 text-sm text-muted-foreground shadow-sm md:flex md:w-64 md:flex-col md:gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  At a glance
                </span>
                <div>
                  <p className="text-4xl font-serif font-bold text-foreground">
                    {categories.length}
                  </p>
                  <p className="leading-relaxed">
                    distinct categories to explore, each featuring carefully
                    plated dishes and curated pairings.
                  </p>
                </div>
                <div className="mt-auto rounded-2xl border border-border/50 bg-card/70 p-3 text-xs">
                  <p className="font-medium text-foreground">Need a tip?</p>
                  <p className="text-muted-foreground/80">
                    Tap a category below to focus the selection or open any dish
                    for full tasting notes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Menu Items */}
      <main className="container mx-auto flex-1 px-4 pb-16 pt-10 md:px-6 md:pt-12">
        <section
          id={activeCategory}
          className="relative overflow-hidden rounded-[32px] border border-border/70 bg-card/85 px-6 py-10 shadow-soft backdrop-blur md:px-10"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_transparent,_hsl(35_85%_92%/.35)_45%,_transparent_80%)]" />
          <div className="absolute -right-14 -top-20 h-44 w-44 rounded-full bg-accent/15 blur-3xl" />
          <div className="absolute bottom-10 -left-24 h-56 w-56 rounded-full bg-primary/10 blur-[120px]" />

          <div className="flex flex-col gap-4 pb-8 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">
                Category
              </span>
              <h2 className="text-3xl font-serif font-bold text-foreground md:text-4xl">
                {activeCategory}
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                A curated lineup of dishes designed to complement the mood of
                the course. Select a plate to reveal full tasting notes,
                pairings, and allergen details.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>
                {loading
                  ? "Preparing selections"
                  : `${filteredItems.length} dishes available`}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}

          {!loading && filteredItems.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border/60 bg-muted/40 py-12 text-center">
              <p className="text-muted-foreground">
                No items available in this category yet. Please check another
                selection.
              </p>
            </div>
          )}
        </section>
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
