import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import donationImage from "@/assets/donation-hands.jpg";
import foodBankImage from "@/assets/food-bank.jpg";

// Donor Section with Props
export const DonorSection = ({ onOpenRegister }: { onOpenRegister: () => void }) => {
  const benefits = [
    "Easy scheduling & pickup coordination",
    "Tax deduction documentation",
    "Real-time impact tracking",
    "Brand visibility & recognition",
  ];

  return (
    <section id="donors" className="py-24 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-secondary font-semibold text-sm uppercase tracking-wider mb-4 block">For Businesses</span>
            <h2 className="text-4xl font-display font-bold text-foreground mb-6">Turn Surplus Into Impact</h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Join hundreds of businesses making a difference. Our platform handles the logistics.
            </p>
            <ul className="space-y-4 mb-8">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
            <Button variant="default" size="lg" className="group" onClick={onOpenRegister}>
              Become a Donor
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          <div className="relative">
            <img src={donationImage} alt="Donation" className="relative z-10 rounded-3xl overflow-hidden shadow-xl w-full h-[400px] object-cover" />
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

// Recipient Section with Props
export const RecipientSection = ({ onOpenRegister }: { onOpenRegister: () => void }) => {
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
          <div className="relative order-2 lg:order-1">
            <img src={foodBankImage} alt="Recipient" className="relative z-10 rounded-3xl overflow-hidden shadow-xl w-full h-[400px] object-cover" />
            <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
          </div>
          <div className="order-1 lg:order-2">
            <span className="text-secondary font-semibold text-sm uppercase tracking-wider mb-4 block">For Organizations</span>
            <h2 className="text-4xl font-display font-bold text-foreground mb-6">More Food for Those in Need</h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Connect with local donors and receive fresh food for the communities you serve.
            </p>
            <ul className="space-y-4 mb-8">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
            <Button variant="secondary" size="lg" className="group" onClick={onOpenRegister}>
              Register as Recipient
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};