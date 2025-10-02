import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  LogIn,
  Home,
  Utensils,
  Info,
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-border mt-auto text-foreground">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-200/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Hotel Info */}
            <div className="space-y-3">
              <h3 className="text-lg font-serif font-bold text-primary">
                Grand Vista Hotel
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                  <span className="leading-snug">
                    123 Grand Avenue, Downtown, City 12345
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0 text-primary" />
                  <a
                    href="tel:+15551234567"
                    className="hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                    aria-label="Call Grand Vista Hotel"
                  >
                    +1 (555) 123-4567
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0 text-primary" />
                  <a
                    href="mailto:info@grandvistahotel.com"
                    className="hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded break-all"
                    aria-label="Email Grand Vista Hotel"
                  >
                    info@grandvistahotel.com
                  </a>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="space-y-3">
              <h3 className="text-lg font-serif font-bold text-primary">
                Opening Hours
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      Monday - Friday
                    </p>
                    <p className="leading-snug">7:00 AM - 11:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      Saturday - Sunday
                    </p>
                    <p className="leading-snug">8:00 AM - 12:00 AM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h3 className="text-lg font-serif font-bold text-primary">
                Quick Links
              </h3>
              <nav className="flex flex-col space-y-2 text-sm">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1"
                  aria-label="Go to home page"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1"
                  aria-label="View our menu"
                >
                  <Utensils className="w-4 h-4" />
                  Menu
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1"
                  aria-label="Learn about us"
                >
                  <Info className="w-4 h-4" />
                  About Us
                </Link>
              </nav>
            </div>

            {/* Staff Login */}
            <div className="space-y-3">
              <h3 className="text-lg font-serif font-bold text-primary">
                Staff Area
              </h3>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1"
                aria-label="Staff login portal"
              >
                <LogIn className="w-4 h-4" />
                Staff Login
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Grand Vista Hotel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
