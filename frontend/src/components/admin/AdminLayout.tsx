import { useState } from "react";
import { Outlet, useNavigate, useLocation, NavLink } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Utensils,
  QrCode,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clearToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import { LanguageDropdown } from "@/components/LanguageDropdown";

const navItems = [
  {
    icon: LayoutDashboard,
    labelKey: "admin.dashboard",
    path: "/admin/dashboard",
  },
  { icon: Utensils, labelKey: "admin.menu_mgmt", path: "/admin/menu" },
  { icon: QrCode, labelKey: "admin.qr", path: "/admin/qr" },
  { icon: User, labelKey: "admin.profile", path: "/admin/profile" },
] as const;

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleLogout = () => {
    clearToken();
    navigate("/admin/login", { replace: true });
  };

  const NavLinkItem = ({ item }: { item: (typeof navItems)[number] }) => {
    const isActive =
      location.pathname === item.path ||
      (item.path === "/admin/dashboard" && location.pathname === "/admin");

    return (
      <NavLink
        to={item.path}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
          isActive
            ? "bg-primary text-primary-foreground shadow-soft"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        onClick={() => setSidebarOpen(false)}
      >
        <item.icon className="w-5 h-5" />
        <span className="font-medium">{t(item.labelKey)}</span>
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen bg-card border-r border-border z-50 transition-transform duration-300 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "w-64"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-serif text-foreground">
              {t("admin.panel")}
            </h2>
            <p className="text-xs text-muted-foreground">Grand Vista Hotel</p>
          </div>
          <LanguageDropdown className="hidden lg:inline-flex" />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLinkItem key={item.path} item={item} />
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <div className="mb-3 lg:hidden">
            <LanguageDropdown />
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            {t("admin.logout")}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold font-serif">{t("admin.panel")}</h1>
          <div className="ml-auto">
            <LanguageDropdown />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
