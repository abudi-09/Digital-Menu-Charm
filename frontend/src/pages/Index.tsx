import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChefHat,
  Mail,
  MapPin,
  Phone,
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
import heroImage from "@/assets/hero-image.jpg";
import { useCategoriesQuery, useMenuQuery } from "@/hooks/useMenuApi";
import type { MenuItem } from "@/types/menu";
import { MenuCategoryTabs } from "@/components/menu/MenuCategoryTabs";

const PHONE_NUMBER = "+251 91 234 5678";
const ALL_CATEGORY = "all";

const Index = () => {
  const { t, i18n } = useTranslation();

  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Categories list (unused for now but kept for future dynamic checks)
  const { isLoading: categoriesLoading } = useCategoriesQuery();

  const {
    data: menuResponse,
    isLoading: itemsLoading,
    isFetching: itemsFetching,
  } = useMenuQuery({
    category: activeCategory === ALL_CATEGORY ? undefined : activeCategory,
    lang: i18n.language,
    page: 1,
    limit: 10,
  });

  type BackendItem = Omit<MenuItem, "id"> & { _id?: string; id?: string };

  const menuItems = useMemo<MenuItem[]>(() => {
    if (!menuResponse?.items) return [];
    return (menuResponse.items as unknown as BackendItem[]).map((item) => {
      return {
        ...item,
        id: item.id ?? item._id ?? `${item.category}-${item.name}`,
      };
    });
  }, [menuResponse]);

  const totalMenuItems = menuResponse?.total ?? 0;

  // Exact requested category order (with "All" first)
  const tabCategories = useMemo(() => {
    const fixed = [
      "Lunch",
      "Burger",
      "Breakfast",
      "Juice",
      "Sandwich",
      "Soft",
      "Shorma",
      "Hot Thing",
      "Pizza",
    ];
    return [ALL_CATEGORY, ...fixed];
  }, []);

  const showSkeleton =
    categoriesLoading ||
    itemsLoading ||
    (itemsFetching && menuItems.length === 0);

  const accolades = [
    {
      id: "rating",
      title: t("home.accolades.rating.title"),
      description: t("home.accolades.rating.copy"),
      icon: Star,
    },
    {
      id: "ambience",
      title: t("home.accolades.ambience.title"),
      description: t("home.accolades.ambience.copy"),
      icon: Sparkles,
    },
    {
      id: "chef",
      title: t("home.accolades.chef.title"),
      description: t("home.accolades.chef.copy"),
      icon: ChefHat,
    },
  ];

  const contactCards = [
    {
      id: "address",
      icon: MapPin,
      label: t("home.contact.address_label", {
        defaultValue: t("home.contact.address"),
      }),
      value: t("home.contact.address"),
      href: `https://maps.google.com/?q=${encodeURIComponent(
        t("home.contact.address")
      )}`,
    },
    {
      id: "phone",
      icon: Phone,
      label: t("home.contact.phone_label", {
        defaultValue: t("home.contact.phone"),
      }),
      value: PHONE_NUMBER,
      href: `tel:${PHONE_NUMBER.replace(/\s+/g, "")}`,
    },
    {
      id: "email",
      icon: Mail,
      label: t("home.contact.email_label", {
        defaultValue: t("home.contact.email"),
      }),
      value: t("home.contact.email_address", {
        defaultValue: "hello@lavendercafe.com",
      }),
      href: `mailto:${t("home.contact.email_address", {
        defaultValue: "hello@lavendercafe.com",
      })}`,
    },
  ];

  const handleViewDetails = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => setModalOpen(false), []);

  const labelForCategory = (category: string) =>
    category === ALL_CATEGORY
      ? t("ALl")
      : t(`categories.${category}`, { defaultValue: category });

  const handleScrollToMenu = () => {
    const el = document.getElementById("menu-preview");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main>
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative flex min-h-[70vh] flex-col justify-center overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage as string})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/65 to-background" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <Badge className="w-fit border border-primary/30 bg-primary/10 px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-primary sm:text-xs sm:tracking-[0.5em]">
              {t("home.hero.badge")}
            </Badge>

            <h1 className="mt-4 max-w-3xl text-3xl font-serif font-bold leading-tight sm:text-5xl lg:text-6xl">
              {t("home.hero.title")}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-xl"
            >
              {t("home.hero.copy")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <Button
                size="lg"
                onClick={handleScrollToMenu}
                className="w-full gap-2 rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 px-6 text-base font-semibold shadow-2xl shadow-primary/30 transition-transform hover:-translate-y-0.5 sm:w-auto sm:px-8"
              >
                {t("home.hero.primaryCta")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full border-border px-6 text-base sm:w-auto sm:px-8"
                asChild
              >
                <a href={`tel:${PHONE_NUMBER.replace(/\s+/g, "")}`}>
                  {t("home.hero.secondaryCta")}
                </a>
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-2 text-sm text-muted-foreground"
            >
              {t("home.hero.note", { phone: PHONE_NUMBER })}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {accolades.map(({ id, title, description, icon: Icon }) => (
                <Card
                  key={id}
                  className="flex h-full flex-col gap-3 border border-border/60 bg-background/75 p-5 backdrop-blur-md"
                >
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  <h3 className="text-base font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </Card>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <section
          id="menu-preview"
          className="bg-muted/20 py-20"
          aria-label={t("menu.title")}
        >
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-serif font-bold text-foreground sm:text-4xl">
                {t("home.menuPreview.title")}
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                {t("home.menuPreview.copy")}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("home.menuPreview.count", { count: totalMenuItems })}
              </p>
            </div>

            <div className="mt-12">
              <MenuCategoryTabs
                categories={tabCategories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                labelFor={labelForCategory}
                sticky={false}
                innerClassName="md:overflow-x-auto"
              />

              <div className="mt-6">
                {showSkeleton ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <SkeletonCard key={index} />
                    ))}
                  </div>
                ) : menuItems.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {menuItems.slice(0, 10).map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="mx-auto max-w-md border-dashed border-border/70 bg-background/80 p-12 text-center">
                    <p className="text-muted-foreground">
                      {t("home.menuPreview.empty")}
                    </p>
                  </Card>
                )}
              </div>
            </div>

            <div className="mt-12 flex justify-center">
              <Button asChild className="gap-2 rounded-full px-6 shadow-soft">
                <Link to="/menu">
                  {t("home.menuPreview.cta")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="contact" className="container mx-auto px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-serif font-bold text-foreground sm:text-4xl">
              {t("home.contact.title")}
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              {t("home.contact.copy")}
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contactCards.map(({ id, icon: Icon, label, value, href }) => (
              <Card key={id} className="p-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {label}
                    </p>
                    <a
                      className="mt-1 block text-sm text-muted-foreground"
                      href={href}
                    >
                      {value}
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <ItemDetailsModal
          open={modalOpen}
          item={selectedItem}
          onClose={handleCloseModal}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
