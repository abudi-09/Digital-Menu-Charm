import { useNavigate } from "react-router-dom";
import {
  Package,
  Grid3x3,
  AlertCircle,
  QrCode,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/admin/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { fetchQRStats } from "@/lib/qrApi";
import { useQRStats } from "@/hooks/useQRApi";
import { useMenuQuery, useAllMenuItems } from "@/hooks/useMenuApi";
import React from "react";
import { useTranslation } from "react-i18next";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const { data: allItems, isLoading } = useAllMenuItems(i18n.language);

  const mapped = (allItems ?? []).map((b) => ({
    id: b._id,
    name: b.name,
    category: b.category,
    price: b.price,
    description: b.description,
    fullDescription: b.fullDescription ?? "",
    image: b.image ?? "",
    ingredients: b.ingredients ?? [],
    allergens: b.allergens ?? [],
    prepTime: b.prepTime ?? "",
    portionSize: b.portionSize ?? "",
    available: typeof b.available === "boolean" ? b.available : true,
  }));

  const stats = {
    totalItems: mapped.length,
    totalCategories: Array.from(new Set(mapped.map((item) => item.category)))
      .length,
    outOfStock: mapped.filter((item) => !item.available).length,
    // QR placeholders — overwritten by backend data below when available
    totalScans: 0,
    scansToday: 0,
    uniqueVisitors: 0,
  };

  const {
    data: qrStats,
    isLoading: qrStatsLoading,
    isFetching: qrStatsFetching,
  } = useQRStats();

  // if backend data available, merge into stats used by the UI
  if (qrStats) {
    stats.totalScans = qrStats.totalScans;
    stats.scansToday = qrStats.scansToday;
    stats.uniqueVisitors = qrStats.uniqueVisitors;
  }

  const quickActions = [
    {
      title: t("dashboard.manage_menu"),
      description: t("dashboard.manage_menu_desc"),
      icon: Package,
      action: () => navigate("/admin/menu"),
    },
    {
      title: t("dashboard.qr_code"),
      description: t("dashboard.qr_code_desc"),
      icon: QrCode,
      action: () => navigate("/admin/qr"),
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-2">
          {t("dashboard.title")}
        </h1>
        <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      {/* Menu Stats */}
      <div>
        <h2 className="text-xl font-semibold font-serif text-foreground mb-4">
          {t("dashboard.menu_stats")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title={t("dashboard.total_items")}
            value={stats.totalItems}
            icon={Package}
            description={t("dashboard.active_items")}
            loading={isLoading}
          />
          <StatsCard
            title={t("dashboard.categories")}
            value={stats.totalCategories}
            icon={Grid3x3}
            description={t("dashboard.menu_categories")}
            loading={isLoading}
          />
          <StatsCard
            title={t("dashboard.out_of_stock")}
            value={stats.outOfStock}
            icon={AlertCircle}
            description={t("dashboard.unavailable_items")}
            loading={isLoading}
          />
        </div>
      </div>

      {/* QR Analytics */}
      <div>
        <h2 className="text-xl font-semibold font-serif text-foreground mb-4">
          {t("dashboard.qr_stats")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title={t("dashboard.total_scans")}
            value={stats.totalScans}
            icon={QrCode}
            trend={{ value: t("dashboard.trend"), positive: true }}
            loading={qrStatsLoading || qrStatsFetching}
          />
          <StatsCard
            title={t("dashboard.scans_today")}
            value={stats.scansToday}
            icon={TrendingUp}
            description={t("dashboard.last_24h")}
            loading={qrStatsLoading || qrStatsFetching}
          />
          <StatsCard
            title={t("dashboard.unique_visitors")}
            value={stats.uniqueVisitors}
            icon={Users}
            description={t("dashboard.all_time")}
            loading={qrStatsLoading || qrStatsFetching}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold font-serif text-foreground mb-4">
          {t("dashboard.quick_actions")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={action.action}
              className="p-6 rounded-lg border border-border bg-gradient-card hover:shadow-hover transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <action.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
