import { useNavigate } from "react-router-dom";
import { Utensils, Wine, Cookie, Coffee, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/CategoryCard";
import { Footer } from "@/components/Footer";
import { useMenuQuery } from "@/hooks/useMenuApi";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const navigate = useNavigate();

  const categoryIcons: Record<string, React.ReactNode> = {
    Starters: <Utensils className="w-6 h-6" />,
    "Main Course": <Utensils className="w-6 h-6" />,
    Desserts: <Cookie className="w-6 h-6" />,
    Drinks: <Coffee className="w-6 h-6" />,
    Specials: <Sparkles className="w-6 h-6" />,
  };

  // Always show the predefined categories. Counts come from backend items.
  // useMenuQuery may return either a plain array (legacy) or a paged response
  // { items, total, page, limit, totalPages } depending on the hook parameters.
  const { data: backendItems } = useMenuQuery();
  type BackendMenuItem = { _id: string; category?: string } & Record<
    string,
    unknown
  >;

  // Normalize to an array for the UI. If backendItems is a paged response, use
  // its `items` property; otherwise assume it's already an array.
  type Paged<T> = { items: T[]; total?: number; page?: number; limit?: number };
  const items: BackendMenuItem[] = Array.isArray(backendItems)
    ? backendItems
    : (backendItems && (backendItems as Paged<BackendMenuItem>).items) || [];

  const predefined = [
    "Starters",
    "Main Course",
    "Desserts",
    "Drinks",
    "Specials",
  ];
  const categoryCounts = predefined.map((category) => ({
    name: category,
    count: items.filter((item) => item.category === category).length,
    icon: categoryIcons[category] || <Utensils className="w-6 h-6" />,
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>

        <div className="relative z-10 text-center px-4 animate-fade-up">
          <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm">
            <Wine className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground font-serif mb-4">
            Grand Vista Hotel
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Exquisite Dining Experience
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/menu")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft hover:shadow-hover transition-all text-lg px-8 py-6"
          >
            Explore Menu
          </Button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16 flex-1">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold font-serif text-foreground mb-4">
              Our Menu
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our carefully curated selection of dishes, crafted with
              passion and the finest ingredients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryCounts.map((category, index) => (
              <CategoryCard
                key={category.name}
                title={category.name}
                icon={category.icon}
                count={category.count}
                onClick={() => navigate(`/menu?category=${category.name}`)}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
