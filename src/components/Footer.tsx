import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, LogIn } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Hotel Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-serif text-foreground">Grand Vista Hotel</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>123 Grand Avenue, Downtown, City 12345</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 flex-shrink-0 text-primary" />
                <a 
                  href="tel:+15551234567" 
                  className="hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  aria-label="Call Grand Vista Hotel"
                >
                  +1 (555) 123-4567
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 flex-shrink-0 text-primary" />
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
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-serif text-foreground">Opening Hours</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Monday - Friday</p>
                  <p>7:00 AM - 11:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Saturday - Sunday</p>
                  <p>8:00 AM - 12:00 AM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-serif text-foreground">Quick Links</h3>
            <nav className="flex flex-col space-y-2 text-sm">
              <Link 
                to="/" 
                className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded inline-block"
                aria-label="Go to home page"
              >
                Home
              </Link>
              <Link 
                to="/menu" 
                className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded inline-block"
                aria-label="View our menu"
              >
                Menu
              </Link>
              <Link 
                to="/about" 
                className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded inline-block"
                aria-label="Learn about us"
              >
                About Us
              </Link>
            </nav>
          </div>

          {/* Staff Login */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-serif text-foreground">Staff Area</h3>
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

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Grand Vista Hotel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
