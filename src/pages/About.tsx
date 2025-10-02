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
      value: "123 Grand Avenue, Downtown, City 12345",
    },
    { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
    { icon: Mail, label: "Email", value: "info@grandvistahotel.com" },
    { icon: Clock, label: "Hours", value: "Mon-Sun: 7:00 AM - 11:00 PM" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full border border-border/70 bg-card/80 p-0 text-muted-foreground shadow-sm transition-colors hover:bg-card hover:text-foreground"
            aria-label="Go back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold uppercase tracking-[0.35em] text-muted-foreground md:text-2xl">
            About Us
          </h1>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden py-20">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-[160px]" />
            <div className="absolute bottom-[-30%] right-[10%] h-[360px] w-[360px] rounded-full bg-accent/12 blur-[160px]" />
          </div>

          <div className="container mx-auto flex max-w-6xl flex-col gap-12 px-6 md:px-8">
            <div className="rounded-[36px] border border-border/60 bg-card/90 p-8 text-center shadow-soft backdrop-blur md:p-14">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
                <span className="text-2xl font-serif">GV</span>
              </div>
              <h2 className="mt-6 text-4xl font-serif font-bold text-foreground md:text-5xl">
                Grand Vista Hotel
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Experience culinary excellence in the heart of the city
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="group overflow-hidden rounded-[28px] border border-border/60 bg-card/90 p-8 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-hover">
                <div className="space-y-4 text-muted-foreground">
                  <h3 className="text-2xl font-serif font-semibold text-foreground">
                    Our Story
                  </h3>
                  <p>
                    Since 1995, Grand Vista Hotel has been serving exceptional
                    cuisine that combines traditional techniques with modern
                    innovation. Our passion for quality ingredients and
                    authentic flavors has made us a favorite destination for
                    food lovers.
                  </p>
                  <p>
                    Our team of experienced chefs carefully crafts each dish
                    using locally sourced, seasonal ingredients. We believe in
                    creating memorable dining experiences that bring people
                    together and celebrate the art of fine dining.
                  </p>
                  <p>
                    Whether you're joining us for a casual lunch, romantic
                    dinner, or special celebration, we're committed to providing
                    impeccable service and unforgettable flavors.
                  </p>
                </div>
              </Card>

              <Card className="flex flex-col justify-between gap-6 rounded-[28px] border border-border/60 bg-card/90 p-8 shadow-soft">
                <div className="space-y-4 text-muted-foreground">
                  <h3 className="text-2xl font-serif font-semibold text-foreground">
                    What We Believe
                  </h3>
                  <ul className="space-y-3 text-base leading-relaxed text-foreground/85">
                    <li className="rounded-2xl border border-border/50 bg-muted/40 px-4 py-3">
                      Since 1995, Grand Vista Hotel has been serving exceptional
                      cuisine that combines traditional techniques with modern
                      innovation.
                    </li>
                    <li className="rounded-2xl border border-border/50 bg-muted/40 px-4 py-3">
                      Our team carefully crafts each dish using locally sourced,
                      seasonal ingredients.
                    </li>
                    <li className="rounded-2xl border border-border/50 bg-muted/40 px-4 py-3">
                      We believe in creating memorable dining experiences that
                      bring people together.
                    </li>
                  </ul>
                </div>
                <Button
                  size="lg"
                  onClick={() => navigate("/menu")}
                  className="rounded-full bg-gradient-to-r from-primary via-primary/90 to-accent text-primary-foreground shadow-md transition-all hover:shadow-hover"
                >
                  View Our Menu
                </Button>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-muted/40 py-20">
          <div className="container mx-auto max-w-6xl px-6 md:px-8">
            <div className="mb-10 text-center">
              <h3 className="text-3xl font-serif font-semibold text-foreground md:text-4xl">
                Contact Information
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {contactInfo.map((info) => (
                <Card
                  key={info.label}
                  className="group flex items-start gap-4 rounded-[24px] border border-border/60 bg-card/95 p-6 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-hover"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/12 text-primary">
                    <info.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
                      {info.label}
                    </h4>
                    <p className="text-base leading-relaxed text-foreground/90 break-words">
                      {info.value}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
