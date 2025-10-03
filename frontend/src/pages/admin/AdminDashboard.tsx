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
import { useMenuQuery } from "@/hooks/useMenuApi";
import React from "react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: backendItems, isLoading } = useMenuQuery();

  const mapped = (backendItems ?? []).map((b) => ({
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
    totalScans: 1247,
    scansToday: 34,
    uniqueVisitors: 892,
  };

  const quickActions = [
    {
      title: "Manage Menu",
      description: "Add, edit, or remove menu items",
      icon: Package,
      action: () => navigate("/admin/menu"),
    },
    {
      title: "QR Code",
      description: "Generate and manage QR codes",
      icon: QrCode,
      action: () => navigate("/admin/qr"),
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of your hotel menu system
        </p>
      </div>

      {/* Menu Stats */}
      <div>
        <h2 className="text-xl font-semibold font-serif text-foreground mb-4">
          Menu Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Items"
            value={stats.totalItems}
            icon={Package}
            description="Active menu items"
            loading={isLoading}
          />
          <StatsCard
            title="Categories"
            value={stats.totalCategories}
            icon={Grid3x3}
            description="Menu categories"
            loading={isLoading}
          />
          <StatsCard
            title="Out of Stock"
            value={stats.outOfStock}
            icon={AlertCircle}
            description="Unavailable items"
            loading={isLoading}
          />
        </div>
      </div>

      {/* QR Analytics */}
      <div>
        <h2 className="text-xl font-semibold font-serif text-foreground mb-4">
          QR Code Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Scans"
            value={stats.totalScans}
            icon={QrCode}
            trend={{ value: "+12% this month", positive: true }}
          />
          <StatsCard
            title="Scans Today"
            value={stats.scansToday}
            icon={TrendingUp}
            description="Last 24 hours"
          />
          <StatsCard
            title="Unique Visitors"
            value={stats.uniqueVisitors}
            icon={Users}
            description="All time"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold font-serif text-foreground mb-4">
          Quick Actions
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
