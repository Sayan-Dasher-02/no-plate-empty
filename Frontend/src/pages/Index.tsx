import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import ImpactStats from "@/components/ImpactStats";
import FoodCategories from "@/components/FoodCategories";
import { DonorSection, RecipientSection } from "@/components/UserSections";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <HowItWorks />
        <FoodCategories />
        <DonorSection />
        <RecipientSection />
        <ImpactStats />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
