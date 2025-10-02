import { useNavigate } from "react-router-dom";
import { Utensils, Wine, Cookie, Coffee, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/CategoryCard";
import { Footer } from "@/components/Footer";
import { menuItems } from "@/data/menuData";
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

  const categories = Array.from(
    new Set(menuItems.map((item) => item.category))
  );
  const categoryCounts = categories.map((category) => ({
    name: category,
    count: menuItems.filter((item) => item.category === category).length,
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
          <div className="mx-auto mt-4 flex items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate("/menu")}
              className="rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-soft transition-all duration-200 text-base px-8 py-3 font-semibold hover:scale-105"
            >
              Explore Our Menu
            </Button>

            <Button
              size="lg"
              onClick={() => navigate("/about")}
              className="rounded-full bg-white/95 text-foreground shadow-sm border border-white/30 transition-all duration-200 text-base px-8 py-3 font-medium hover:bg-gradient-to-br hover:from-primary hover:to-accent hover:text-primary-foreground"
            >
              About Us
            </Button>
          </div>
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
