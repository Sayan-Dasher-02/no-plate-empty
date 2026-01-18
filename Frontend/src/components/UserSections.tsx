import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import donationImage from "@/assets/donation-hands.jpg";
import foodBankImage from "@/assets/food-bank.jpg";

const DonorSection = () => {
  const benefits = [
    "Easy scheduling & pickup coordination",
    "Tax deduction documentation",
    "Real-time impact tracking",
    "Brand visibility & recognition",
  ];

  return (
    <section id="donors" className="py-24 bg-gradient-fresh overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <span className="text-secondary font-semibold text-sm uppercase tracking-wider mb-4 block">
              For Businesses
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
              Turn Surplus Into Impact
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Join hundreds of restaurants, grocery stores, and event venues who are reducing waste 
              while making a difference. Our platform handles the logistics so you can focus on your business.
            </p>

            <ul className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>

            <Button variant="default" size="lg" className="group">
              Become a Donor
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-elevated">
              <img
                src={donationImage}
                alt="Hands sharing food donation box"
                className="w-full h-[400px] object-cover"
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/20 rounded-full blur-2xl" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

const RecipientSection = () => {
  const benefits = [
    "Access to diverse, quality food sources",
    "Real-time notifications for new donations",
    "Efficient pickup scheduling",
    "Free for all nonprofit organizations",
  ];

  return (
    <section id="recipients" className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-elevated">
              <img
                src={foodBankImage}
                alt="Food bank volunteer sorting donations"
                className="w-full h-[400px] object-cover"
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="text-secondary font-semibold text-sm uppercase tracking-wider mb-4 block">
              For Organizations
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
              More Food for Those in Need
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Food banks, shelters, and community organizations can connect with local donors 
              and receive fresh, quality food for the communities they serve.
            </p>

            <ul className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>

            <Button variant="secondary" size="lg" className="group">
              Register as Recipient
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { DonorSection, RecipientSection };
