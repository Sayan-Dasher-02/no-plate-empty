import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-food.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Fresh vegetables and fruits"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 left-10 w-48 h-48 bg-leaf/20 rounded-full blur-3xl animate-pulse-slow" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-2 mb-6 animate-fade-up">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-primary-foreground">
              Reducing food waste, fighting hunger
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-primary-foreground mb-6 animate-fade-up leading-tight" style={{ animationDelay: "0.1s" }}>
            No Good Food
            <br />
            Should Go to
            <br />
            <span className="text-secondary">Waste</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl animate-fade-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
            Connect surplus food from restaurants, stores, and events with local 
            communities in need. Together, we can end hunger and reduce waste.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="lg" className="group">
              Start Donating
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="heroOutline" size="lg">
              Find Food Near You
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mt-12 pt-8 border-t-4 border-primary-foreground/20 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div>
              <div className="text-4xl md:text-4xl font-display font-bold text-secondary">2M+</div>
              <div className="text-sm text-primary-foreground/70">Meals Saved</div>
            </div>
            <div>
              <div className="text-4xl md:text-4xl font-display font-bold text-secondary">5K+</div>
              <div className="text-sm text-primary-foreground/70">Active Donors</div>
            </div>
            <div>
              <div className="text-4xl md:text-4xl font-display font-bold text-secondary">300+</div>
              <div className="text-sm text-primary-foreground/70">Partner Orgs</div>
            </div>
            <div>
              <div className="text-4xl md:text-4xl font-display font-bold text-secondary">24/7</div>
              <div className="text-sm text-primary-foreground/70">Available</div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
