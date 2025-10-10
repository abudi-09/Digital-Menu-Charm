import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";

const PHONE_NUMBER = "+251 11 123 4567";
const EMAIL_ADDRESS = "dining@grandvista.com";

export const Footer = () => {
  const { t } = useTranslation();
  const phoneHref = `tel:${PHONE_NUMBER.replace(/\s+/g, "")}`;
  const emailHref = `mailto:${EMAIL_ADDRESS}`;
  const address = t("home.contact.address", {
    defaultValue: "123 Skyline Avenue, Addis Ababa",
  });

  return (
    <footer className="bg-muted/30 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Hotel Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-serif text-foreground">
              Grand Vista Hotel
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 flex-shrink-0 text-primary" />
                <a
                  href={phoneHref}
                  className="hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  aria-label={t("footer.call", {
                    defaultValue: "Call Grand Vista Hotel",
                  })}
                >
                  {PHONE_NUMBER}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 flex-shrink-0 text-primary" />
                <a
                  href={emailHref}
                  className="hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded break-all"
                  aria-label={t("footer.email", {
                    defaultValue: "Email Grand Vista Hotel",
                  })}
                >
                  {EMAIL_ADDRESS}
                </a>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-serif text-foreground">
              {t("footer.opening_hours", { defaultValue: "Opening Hours" })}
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {t("footer.weekdays", { defaultValue: "Monday - Friday" })}
                  </p>
                  <p>7:00 AM - 11:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {t("footer.weekends", {
                      defaultValue: "Saturday - Sunday",
                    })}
                  </p>
                  <p>8:00 AM - 12:00 AM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-serif text-foreground">
              {t("footer.quick_links", { defaultValue: "Quick Links" })}
            </h3>
            <nav className="flex flex-col space-y-2 text-sm">
              <Link
                to="/"
                className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded inline-block"
                aria-label={t("footer.home_aria", {
                  defaultValue: "Go to home page",
                })}
              >
                {t("footer.home", { defaultValue: "Home" })}
              </Link>
              <Link
                to="/menu"
                className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded inline-block"
                aria-label={t("footer.menu_aria", {
                  defaultValue: "View our menu",
                })}
              >
                {t("menu.title")}
              </Link>
              <Link
                to="/about"
                className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded inline-block"
                aria-label={t("footer.about_aria", {
                  defaultValue: "Learn about us",
                })}
              >
                {t("footer.about", { defaultValue: "About Us" })}
              </Link>
            </nav>
          </div>

          {/* Staff Login */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-serif text-foreground">
              {t("footer.staff_area", { defaultValue: "Staff Area" })}
            </h3>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1"
              aria-label={t("footer.staff_login_aria", {
                defaultValue: "Staff login portal",
              })}
            >
              <LogIn className="w-4 h-4" />
              {t("admin.login")}
            </Link>
            {/* Language switcher removed per request */}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Grand Vista Hotel.{" "}
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};
