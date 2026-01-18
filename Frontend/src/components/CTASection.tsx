import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative bg-gradient-hero rounded-3xl p-8 md:p-16 text-center overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border-2 border-primary-foreground rounded-full" />
            <div className="absolute bottom-10 right-10 w-32 h-32 border-2 border-primary-foreground rounded-full" />
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-primary-foreground rounded-full blur-xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-primary-foreground">Join our growing community</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
              Ready to Make a Difference?
            </h2>

            <p className="text-lg text-primary-foreground/80 mb-10 max-w-xl mx-auto">
              Whether you have food to share or a community to feed, 
              NoPlateEmpty connects you with the resources you need.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" className="group">
                <Heart className="w-5 h-5" />
                Start Your Journey
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="heroOutline" size="xl">
                Learn More
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 pt-8 border-t border-primary-foreground/20">
              <p className="text-primary-foreground/60 text-sm mb-4">Trusted by leading organizations</p>
              <div className="flex flex-wrap justify-center gap-8 opacity-60">
                <div className="text-primary-foreground font-display text-lg">FoodBank Alliance</div>
                <div className="text-primary-foreground font-display text-lg">Green Restaurant</div>
                <div className="text-primary-foreground font-display text-lg">Community Meals</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
