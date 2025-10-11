import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowUp,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PHONE_NUMBER = "+251 91 234 5678";
const EMAIL_ADDRESS = "hello@lavendercafe.com";

export const Footer = () => {
  const { t } = useTranslation();
  const phoneHref = `tel:${PHONE_NUMBER.replace(/\s+/g, "")}`;
  const emailHref = `mailto:${EMAIL_ADDRESS}`;
  const address = t("home.contact.address");

  const handleScrollTop = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950/95 text-slate-100">
      <div className="border-y border-white/10">
        <div className="container mx-auto grid gap-12 px-6 py-14 md:grid-cols-2 md:items-start lg:grid-cols-[1.2fr,1fr,1fr]">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-purple-300">
                Lavender Café & Restaurant
              </p>
              <h3 className="mt-3 text-2xl font-serif font-semibold">
                {t("footer.tagline")}
              </h3>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin
                  className="mt-0.5 h-5 w-5 text-purple-300"
                  aria-hidden="true"
                />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-purple-300" aria-hidden="true" />
                <a
                  href={phoneHref}
                  className="transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  {PHONE_NUMBER}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-purple-300" aria-hidden="true" />
                <a
                  href={emailHref}
                  className="transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  {EMAIL_ADDRESS}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-300">
                {t("footer.follow")}
              </span>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full border border-white/10 bg-white/5 text-slate-100 transition-transform hover:-translate-y-0.5"
                  asChild
                >
                  <a
                    href="https://facebook.com"
                    aria-label="Facebook"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Facebook className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full border border-white/10 bg-white/5 text-slate-100 transition-transform hover:-translate-y-0.5"
                  asChild
                >
                  <a
                    href="https://instagram.com"
                    aria-label="Instagram"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Instagram className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">
              {t("footer.hours.title")}
            </h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <Clock
                  className="mt-0.5 h-5 w-5 text-purple-300"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium text-white">
                    {t("footer.hours.everyday")}
                  </p>
                  <p>{t("footer.hours.schedule")}</p>
                </div>
              </div>
              <p>{t("footer.hours.note")}</p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">
              {t("footer.quick_links", { defaultValue: "Quick Links" })}
            </h3>
            <nav className="flex flex-col gap-3 text-sm text-slate-300">
              <Link to="/" className="transition-colors hover:text-white">
                {t("nav.home")}
              </Link>
              <Link to="/menu" className="transition-colors hover:text-white">
                {t("nav.menu")}
              </Link>
              <a href="#about" className="transition-colors hover:text-white">
                {t("footer.about_link")}
              </a>
              <a href="#contact" className="transition-colors hover:text-white">
                {t("footer.contact_link")}
              </a>
            </nav>

            <Button
              onClick={handleScrollTop}
              variant="outline"
              className="w-fit gap-2 rounded-full border-white/20 bg-white/5 text-slate-100 transition-transform hover:-translate-y-0.5"
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
              {t("footer.scroll_top")}
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-slate-400 md:flex-row">
          <p>
            © {new Date().getFullYear()} Lavender Café & Restaurant.{" "}
            {t("footer.copyright")}
          </p>
          <p>{t("footer.made_in_gonder")}</p>
        </div>
      </div>
    </footer>
  );
};
