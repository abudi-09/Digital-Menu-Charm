import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChefHat,
  Mail,
  MapPin,
  Phone,
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
import heroImage from "@/assets/hero-image.jpg";
import { useAllMenuItems, useMenuQuery } from "@/hooks/useMenuApi";
import type { MenuItem } from "@/types/menu";
import { MenuCategoryTabs } from "@/components/menu/MenuCategoryTabs";
// Full file replacement below
                variant="outline"
                className="rounded-full border-border px-8 text-base"
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
              className="text-sm text-muted-foreground"
            >
              {t("home.hero.note", { phone: PHONE_NUMBER })}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="mt-6 grid gap-4 sm:grid-cols-3"
            >
              {accolades.map(({ id, title, description, icon: Icon }) => (
                <Card
                  key={id}
                  className="flex h-full flex-col gap-3 border border-border/60 bg-background/75 p-5 backdrop-blur-md"
                >
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  <h3 className="text-base font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </Card>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* About moved to /about */}

        <section id="menu-preview" className="bg-muted/20 py-20" aria-label={t("menu.title")}> 
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-serif font-bold text-foreground sm:text-4xl">{t("home.menuPreview.title")}</h2>
              <p className="mt-3 text-lg text-muted-foreground">{t("home.menuPreview.copy")}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t("home.menuPreview.count", { count: totalMenuItems })}</p>
            </div>

            <div className="mt-12">
              <MenuCategoryTabs
                categories={[ALL_CATEGORY, ...availableCategories]}
                activeCategory={activeCategory}
                onCategoryChange={(c) => setActiveCategory(c)}
                labelFor={labelForCategory}
                sticky={false}
                innerClassName="overflow-x-auto"
              />

              <div className="mt-6">
                {isLoading || pagedLoading ? (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <SkeletonCard key={index} />
                    ))}
                  </div>
                ) : filteredItems.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredItems.map((item) => (
                      <MenuItemCard key={item.id} item={item} onViewDetails={handleViewDetails} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed border-border/70 bg-background/80 p-12 text-center">
                    <p className="text-muted-foreground">{t("home.menuPreview.empty")}</p>
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

        <section id="testimonials" className="container mx-auto px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-serif font-bold text-foreground sm:text-4xl">{t("home.testimonials.title")}</h2>
            <p className="mt-3 text-lg text-muted-foreground">{t("home.testimonials.copy")}</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-8 text-left">
              <Quote className="h-6 w-6 text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">{t("home.testimonials.one")}</p>
              <p className="mt-3 text-xs font-semibold text-foreground">— {t("home.testimonials.one_by")}</p>
            </Card>

            <Card className="p-8 text-left">
              <Quote className="h-6 w-6 text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">{t("home.testimonials.two")}</p>
              <p className="mt-3 text-xs font-semibold text-foreground">— {t("home.testimonials.two_by")}</p>
            </Card>

            <Card className="p-8 text-left">
              <Quote className="h-6 w-6 text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">{t("home.testimonials.three")}</p>
              <p className="mt-3 text-xs font-semibold text-foreground">— {t("home.testimonials.three_by")}</p>
            </Card>
          </div>
        </section>

        <section id="contact" className="container mx-auto px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-serif font-bold text-foreground sm:text-4xl">{t("home.contact.title")}</h2>
            <p className="mt-3 text-lg text-muted-foreground">{t("home.contact.copy")}</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contactCards.map(({ id, icon: Icon, label, value, href }) => (
              <Card key={id} className="p-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{label}</p>
                    <a className="mt-1 block text-sm text-muted-foreground" href={href}>{value}</a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <ItemDetailsModal open={modalOpen} item={selectedItem} onClose={handleCloseModal} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

                    <motion.p
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className="max-w-2xl text-lg text-muted-foreground sm:text-xl"
                    >
                      {t("home.hero.copy")}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.6 }}
                      className="flex flex-wrap items-center gap-3"
                    >
                      <Button
                        size="lg"
                        onClick={handleScrollToMenu}
                        className="gap-2 rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 px-8 text-base font-semibold shadow-2xl shadow-primary/30 transition-transform hover:-translate-y-0.5"
                      >
                        {t("home.hero.primaryCta")}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full border-border px-8 text-base"
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
                      className="text-sm text-muted-foreground"
                    >
                      {t("home.hero.note", { phone: PHONE_NUMBER })}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.6 }}
                      className="mt-6 grid gap-4 sm:grid-cols-3"
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

                {/* About moved to /about */}

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
                        categories={[ALL_CATEGORY, ...availableCategories]}
                        activeCategory={activeCategory}
                        onCategoryChange={(c) => setActiveCategory(c)}
                        labelFor={labelForCategory}
                        sticky={false}
                        innerClassName="overflow-x-auto"
                      />

                      <div className="mt-6">
                        {isLoading || pagedLoading ? (
                          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                              <SkeletonCard key={index} />
                            ))}
                          </div>
                        ) : filteredItems.length > 0 ? (
                          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredItems.map((item) => (
                              <MenuItemCard
                                key={item.id}
                                item={item}
                                onViewDetails={handleViewDetails}
                              />
                            ))}
                          </div>
                        ) : (
                          <Card className="border-dashed border-border/70 bg-background/80 p-12 text-center">
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

                <section id="testimonials" className="container mx-auto px-6 py-20">
                  <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl font-serif font-bold text-foreground sm:text-4xl">
                      {t("home.testimonials.title")}
                    </h2>
                    <p className="mt-3 text-lg text-muted-foreground">{t("home.testimonials.copy")}</p>
                  </div>

                  <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Card className="p-8 text-left">
                      <Quote className="h-6 w-6 text-primary" />
                      <p className="mt-4 text-sm text-muted-foreground">{t("home.testimonials.one")}</p>
                      <p className="mt-3 text-xs font-semibold text-foreground">— {t("home.testimonials.one_by")}</p>
                    </Card>

                    <Card className="p-8 text-left">
                      <Quote className="h-6 w-6 text-primary" />
                      <p className="mt-4 text-sm text-muted-foreground">{t("home.testimonials.two")}</p>
                      <p className="mt-3 text-xs font-semibold text-foreground">— {t("home.testimonials.two_by")}</p>
                    </Card>

                    <Card className="p-8 text-left">
                      <Quote className="h-6 w-6 text-primary" />
                      <p className="mt-4 text-sm text-muted-foreground">{t("home.testimonials.three")}</p>
                      <p className="mt-3 text-xs font-semibold text-foreground">— {t("home.testimonials.three_by")}</p>
                    </Card>
                  </div>
                </section>

                <section id="contact" className="container mx-auto px-6 py-20">
                  <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl font-serif font-bold text-foreground sm:text-4xl">{t("home.contact.title")}</h2>
                    <p className="mt-3 text-lg text-muted-foreground">{t("home.contact.copy")}</p>
                  </div>

                  <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {contactCards.map(({ id, icon: Icon, label, value, href }) => (
                      <Card key={id} className="p-6 text-left">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{label}</p>
                            <a className="mt-1 block text-sm text-muted-foreground" href={href}>{value}</a>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>

                <ItemDetailsModal open={modalOpen} item={selectedItem} onClose={handleCloseModal} />
              </main>
              <Footer />
            </div>
          );
        };

        export default Index;

