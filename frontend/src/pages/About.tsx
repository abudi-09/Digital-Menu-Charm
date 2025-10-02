import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Footer } from '@/components/Footer';

const About = () => {
  const navigate = useNavigate();

  const contactInfo = [
    { icon: MapPin, label: 'Address', value: '123 Grand Avenue, Downtown, City 12345' },
    { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567' },
    { icon: Mail, label: 'Email', value: 'info@grandvistahotel.com' },
    { icon: Clock, label: 'Hours', value: 'Mon-Sun: 7:00 AM - 11:00 PM' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold font-serif text-foreground">About Us</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <div className="space-y-8 animate-fade-up">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground">Grand Vista Hotel</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience culinary excellence in the heart of the city
            </p>
          </div>

          {/* Story Section */}
          <Card className="p-8 bg-gradient-card border-border">
            <h3 className="text-2xl font-bold font-serif text-foreground mb-4">Our Story</h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Since 1995, Grand Vista Hotel has been serving exceptional cuisine that combines 
                traditional techniques with modern innovation. Our passion for quality ingredients 
                and authentic flavors has made us a favorite destination for food lovers.
              </p>
              <p>
                Our team of experienced chefs carefully crafts each dish using locally sourced, 
                seasonal ingredients. We believe in creating memorable dining experiences that 
                bring people together and celebrate the art of fine dining.
              </p>
              <p>
                Whether you're joining us for a casual lunch, romantic dinner, or special celebration, 
                we're committed to providing impeccable service and unforgettable flavors.
              </p>
            </div>
          </Card>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold font-serif text-foreground">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactInfo.map((info, index) => (
                <Card key={index} className="p-6 bg-gradient-card border-border hover:shadow-hover transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <info.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground mb-1">{info.label}</h4>
                      <p className="text-muted-foreground break-words">{info.value}</p>
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
              onClick={() => navigate('/menu')}
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
