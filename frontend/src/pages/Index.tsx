import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  ChefHat,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Quote,
  Sparkles,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MenuItemCard } from "@/components/MenuItemCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { ItemDetailsModal } from "@/components/ItemDetailsModal";
import { CategoryTabs } from "@/components/CategoryTabs";
import heroImage from "@/assets/hero-image.jpg";
import { useAllMenuItems } from "@/hooks/useMenuApi";
import type { MenuItem } from "@/types/menu";

const PHONE_NUMBER = "+251 11 123 4567";
const EMAIL_ADDRESS = "dining@grandvista.com";
const CATEGORY_ORDER = [
  "Starters",
  "Main Course",
  "Specials",
  "Desserts",
  "Drinks",
  "Beverages",
];
const ALL_CATEGORIES = "__all";

type ApiMenuItem = {
  _id?: string;
  id?: string;
  name?: string;
  category?: string;
  price?: number;
  description?: string;
  shortDescription?: string;
  fullDescription?: string;
  image?: string;
  ingredients?: string[];
  allergens?: string[];
  prepTime?: string;
  portionSize?: string;
  available?: boolean;
};

const Index = () => {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useAllMenuItems(i18n.language);

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);

  const menuItems: MenuItem[] = useMemo(() => {
    if (!data) return [];
    return (data as ApiMenuItem[]).map((item) => {
      const fallbackId =
        item._id ?? item.id ?? item.name ?? Math.random().toString(36).slice(2);
      return {
        id: String(fallbackId),
        name: item.name ?? "",
        category: item.category ?? "Specials",
        price: item.price ?? 0,
        description:
          item.description ??
          item.shortDescription ??
          t("menu.item_description"),
        fullDescription:
          item.fullDescription ??
          item.description ??
          t("menu.item_description"),
        image: item.image ?? "/placeholder.svg",
        ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
        allergens: Array.isArray(item.allergens) ? item.allergens : [],
        prepTime: item.prepTime ?? "",
        portionSize: item.portionSize ?? "",
        available: item.available ?? true,
      };
    });
  }, [data, t]);

  const groupedMenu = useMemo(() => {
    return menuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
      const category = item.category || "Specials";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [menuItems]);

  const sortedCategories = useMemo(() => {
    return Object.keys(groupedMenu).sort((a, b) => {
      const aIndex = CATEGORY_ORDER.indexOf(a);
      const bIndex = CATEGORY_ORDER.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [groupedMenu]);

  const totalItems = menuItems.length;

  const filterCategories = useMemo(
    () =>
      sortedCategories.length > 0
        ? [ALL_CATEGORIES, ...sortedCategories]
        : [ALL_CATEGORIES],
    [sortedCategories]
  );

  const categoriesToShow = useMemo(() => {
    if (activeCategory === ALL_CATEGORIES) {
      return sortedCategories;
    }
    if (groupedMenu[activeCategory]) {
      return [activeCategory];
    }
    return [];
  }, [activeCategory, groupedMenu, sortedCategories]);

  const hasVisibleItems = categoriesToShow.some(
    (category) => (groupedMenu[category]?.length ?? 0) > 0
  );

  const filteredItemsCount = useMemo(() => {
    if (activeCategory === ALL_CATEGORIES) {
      return totalItems;
    }
    return groupedMenu[activeCategory]?.length ?? 0;
  }, [activeCategory, groupedMenu, totalItems]);

  const getCategoryLabel = useCallback(
    (category: string) => {
      if (category === ALL_CATEGORIES) {
        return t("menuMgmt.filters_all");
      }
      return t(`menu.categories.${category}`, { defaultValue: category });
    },
    [t]
  );

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  const formatCount = useCallback(
    (count: number) =>
      count === 1
        ? t("home.items_count", { count })
        : t("home.items_count_plural", { count }),
    [t]
  );

  const handleViewDetails = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedItem(null);
  }, []);

  const handleScrollToMenu = useCallback(() => {
    if (typeof document === "undefined") return;
    const menuSection = document.querySelector("#menu");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const highlightStats = [
    {
      id: "since",
      icon: CalendarCheck,
      text: t("home.since", { year: 2012 }),
    },
    {
      id: "rating",
      icon: Star,
      text: t("home.rating", { rating: "4.9" }),
    },
    {
      id: "signature",
      icon: Sparkles,
      text: t("home.chef_signature"),
    },
  ];

  const contactCards = [
    {
      id: "call",
      icon: Phone,
      label: "Call concierge",
      value: PHONE_NUMBER,
      linkLabel: "Call concierge",
      href: `tel:${PHONE_NUMBER.replace(/\s+/g, "")}`,
    },
    {
      id: "email",
      icon: Mail,
      label: "Write to us",
      value: EMAIL_ADDRESS,
      linkLabel: "Write to us",
      href: `mailto:${EMAIL_ADDRESS}`,
    },
    {
      id: "location",
      icon: MapPin,
      label: "Visit the hotel",
      value: "123 Skyline Avenue, Addis Ababa",
      linkLabel: "Visit the hotel",
      href: "https://www.google.com/maps/search/?api=1&query=Grand%20Vista%20Hotel",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex flex-col">
        <section
          id="hero"
          className="relative flex min-h-[70vh] items-center overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage as string})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-20 text-left">
            <Badge className="w-fit border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.4em] text-primary">
              {t("home.hero_badge")}
            </Badge>
            <h1 className="max-w-3xl text-4xl font-serif font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              {t("home.hero_title")}
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
              {t("home.hero_subtitle")}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={handleScrollToMenu}
                className="gap-2 rounded-full px-8 text-base font-semibold shadow-soft transition-all hover:-translate-y-0.5"
              >
                {t("home.hero_primary_cta")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-border px-8 text-base"
                asChild
              >
                <a href={`tel:${PHONE_NUMBER.replace(/\s+/g, "")}`}>
                  {t("home.hero_secondary_cta")}
                </a>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              {t("home.hero_secondary_note", { phone: PHONE_NUMBER })}
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              {highlightStats.map(({ id, icon: Icon, text }) => (
                <Card
                  key={id}
                  className="flex items-center gap-3 border border-border/60 bg-background/70 px-4 py-3 backdrop-blur-sm"
                >
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="text-sm font-medium text-foreground">
                    {text}
                  </span>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          id="menu"
          className="container mx-auto px-6 py-20"
          aria-label={t("menu.title")}
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-serif font-bold text-foreground sm:text-4xl">
              {t("home.menu_section.title")}
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              {t("home.menu_section.description")}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              {formatCount(filteredItemsCount)}
            </p>
          </div>

          {sortedCategories.length > 0 && (
            <div className="mt-10">
              <CategoryTabs
                categories={filterCategories}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
                labelFor={getCategoryLabel}
                sticky={false}
                className="border-none bg-transparent px-0"
                innerClassName="flex-wrap justify-center gap-3"
              />
            </div>
          )}

          <div className="mt-12 space-y-12">
            {isLoading && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            )}

            {!isLoading &&
              (!hasVisibleItems || categoriesToShow.length === 0) && (
                <Card className="border-dashed border-border/70 bg-background/80 p-10 text-center">
                  <p className="text-muted-foreground">{t("home.no_items")}</p>
                </Card>
              )}

            {categoriesToShow.map((category) => {
              const categoryItems = groupedMenu[category];
              if (!categoryItems || categoryItems.length === 0) return null;
              return (
                <div key={category} className="space-y-6">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-serif font-semibold text-foreground">
                        {t(`menu.categories.${category}`, {
                          defaultValue: category,
                        })}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatCount(categoryItems.length)}
                      </p>
                    </div>
                    <Badge className="rounded-full bg-primary/10 px-4 py-1 text-primary">
                      {category}
                    </Badge>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {categoryItems.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <Button asChild variant="ghost" className="gap-2 text-primary">
              <Link to="/menu">
                {t("home.menu_cta")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="bg-primary/5 py-16">
          <div className="container mx-auto grid gap-10 px-6 md:grid-cols-2">
            <div className="space-y-4">
              <Badge className="w-fit bg-primary text-primary-foreground">
                {t("home.recommendation.title")}
              </Badge>
              <h2 className="text-3xl font-serif font-bold text-foreground">
                {t("home.recommendation.title")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t("home.recommendation.description")}
              </p>
              <Button asChild className="mt-2 w-fit gap-2 rounded-full">
                <a href={`tel:${PHONE_NUMBER.replace(/\s+/g, "")}`}>
                  <ChefHat className="h-4 w-4" aria-hidden="true" />
                  {t("home.recommendation.cta")}
                </a>
              </Button>
            </div>
            <Card className="flex flex-col justify-between border-border/60 bg-background/80 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <ChefHat className="h-8 w-8 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                    {t("home.recommendation.title")}
                  </p>
                  <h3 className="text-xl font-semibold text-foreground">
                    {t("home.recommendation.card_title")}
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {t("home.chef_signature")}
              </p>
              <div className="mt-6 flex items-center gap-4">
                <Badge className="rounded-full bg-primary/10 px-4 py-1 text-primary">
                  {t("home.recommendation.tag_courses")}
                </Badge>
                <Badge className="rounded-full bg-primary/10 px-4 py-1 text-primary">
                  {t("home.recommendation.tag_pairing")}
                </Badge>
              </div>
            </Card>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-6">
            <Card className="flex flex-col gap-6 overflow-hidden border-border/60 bg-muted/40 p-8 shadow-sm md:flex-row md:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <QrCode className="h-8 w-8" aria-hidden="true" />
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-serif font-semibold text-foreground">
                  Scan & Explore Instantly
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Each table features a dedicated QR code so guests can browse,
                  check allergens, and order from their devices.
                </p>
              </div>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/admin/login" className="gap-2">
                  Learn about our QR program
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </Card>
          </div>
        </section>

        <section className="bg-muted/20 py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-center text-3xl font-serif font-bold text-foreground">
              {t("home.testimonials_title")}
            </h2>
            <Card className="mx-auto mt-10 max-w-4xl border-border/60 bg-background/80 p-10 text-center">
              <Quote
                className="mx-auto h-10 w-10 text-primary"
                aria-hidden="true"
              />
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                {t("home.testimonial_placeholder")}
              </p>
            </Card>
          </div>
        </section>

        <section id="contact" className="py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-serif font-bold text-foreground sm:text-4xl">
                Contact & Reservations
              </h2>
              <p className="mt-3 text-muted-foreground">
                Seating is limited each evening. Connect with our concierge team
                to plan your visit.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {contactCards.map(
                ({ id, icon: Icon, label, value, linkLabel, href }) => (
                  <Card
                    key={id}
                    className="flex h-full flex-col justify-between border-border/70 bg-background/80 p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className="h-6 w-6 text-primary"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                        {label.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-4 text-lg font-medium text-foreground">
                      {value}
                    </p>
                    <Button
                      variant="ghost"
                      className="mt-6 justify-start gap-2 px-0 text-primary"
                      asChild
                    >
                      <a
                        href={href}
                        target={id === "location" ? "_blank" : undefined}
                        rel={id === "location" ? "noreferrer" : undefined}
                      >
                        {linkLabel}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </Button>
                  </Card>
                )
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <ItemDetailsModal
        item={selectedItem}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Index;
