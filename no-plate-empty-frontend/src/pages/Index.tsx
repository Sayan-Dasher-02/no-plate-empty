import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import ImpactStats from "@/components/ImpactStats";
import FoodCategories from "@/components/FoodCategories";
import { DonorSection, RecipientSection } from "@/components/UserSections";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

// Import the Modal Components
import { DonorModal } from "@/pages/DonorRegister";
import { RecipientModal } from "@/pages/RecipientRegister";

const Index = () => {
  // 1. Define states to control the visibility of both modals
  const [isDonorOpen, setIsDonorOpen] = useState(false);
  const [isRecipientOpen, setIsRecipientOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* 2. Pass modal triggers to the Header (for the Sign Up dropdown) */}
      <Header 
        onOpenDonor={() => setIsDonorOpen(true)} 
        onOpenRecipient={() => setIsRecipientOpen(true)} 
      />
      
      <main>
        {/* 3. Pass triggers to HeroSection (for the "Start Donating" button) */}
        <HeroSection onOpenDonor={() => setIsDonorOpen(true)} />
        
        <HowItWorks />
        <FoodCategories />
        
        {/* 4. Pass triggers to UserSections */}
        <DonorSection onOpenRegister={() => setIsDonorOpen(true)} />
        <RecipientSection onOpenRegister={() => setIsRecipientOpen(true)} />
        
        <ImpactStats />
        <CTASection onOpenDonor={() => setIsDonorOpen(true)} />
      </main>
      
      <Footer />

      {/* 5. Render the Modals globally at the bottom of the page */}
      <DonorModal 
        isOpen={isDonorOpen} 
        onOpenChange={setIsDonorOpen} 
      />
      <RecipientModal 
        isOpen={isRecipientOpen} 
        onOpenChange={setIsRecipientOpen} 
      />
    </div>
  );
};

export default Index;