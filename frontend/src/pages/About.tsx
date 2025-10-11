import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";

const About = () => {
  const navigate = useNavigate();

  const contactInfo = [
    {
      icon: MapPin,
      label: "Address",
      value: "Piassa, Gondar, Ethiopia",
    },
    { icon: Phone, label: "Phone", value: "+251 91 234 5678" },
    { icon: Mail, label: "Email", value: "hello@lavendercafe.com" },
    { icon: Clock, label: "Hours", value: "Daily: 8:00 AM - 10:00 PM" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold font-serif text-foreground">
            About Us
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <div className="space-y-8 animate-fade-up">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground">
              Lavender Café & Restaurant / ላቬንደር ካፌ እና ምግቤት
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Passion, flavor, and warmth in every dish — rooted in Gondar.
            </p>
          </div>

          {/* Story Section */}
          <Card className="p-8 bg-gradient-card border-border">
            <h3 className="text-2xl font-bold font-serif text-foreground mb-4">
              🌿 Our Story – Lavender Café & Restaurant (ላቬንደር ካፌ እና ምግቤት)
            </h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Nestled in the heart of Gondar, Lavender Café & Restaurant
                (ላቬንደር ካፌ እና ምግቤት) is more than just a place to eat — it’s a
                space to connect, unwind, and celebrate the art of good food.
              </p>

              <p>
                Our menu blends local authenticity with a touch of modern
                craftsmanship, offering everything from hearty breakfasts and
                signature burgers to refreshing juices and gourmet specialties.
                Whether you’re joining us for a quick coffee, a family meal, or
                a special gathering, we’re here to make every moment memorable.
              </p>

              <p>
                At Lavender Café, we believe food is not just about taste — it’s
                about experience, emotion, and community. That’s why every
                detail, from our ingredients to our ambiance, is crafted with
                care.
              </p>

              <p className="font-semibold">
                ✨ Lavender Café & Restaurant — where flavor meets comfort, and
                every visit feels like home.
              </p>
            </div>
          </Card>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold font-serif text-foreground">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactInfo.map((info, index) => (
                <Card
                  key={index}
                  className="p-6 bg-gradient-card border-border hover:shadow-hover transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <info.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground mb-1">
                        {info.label}
                      </h4>
                      <p className="text-muted-foreground break-words">
                        {info.value}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Back to Menu Button */}
          <div className="text-center pt-4">
            <Button
              size="lg"
              onClick={() => navigate("/menu")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft hover:shadow-hover transition-all"
            >
              View Our Menu
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
