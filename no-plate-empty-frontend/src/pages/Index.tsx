import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import ImpactStats from "@/components/ImpactStats";
import FoodCategories from "@/components/FoodCategories";
import { DonorSection, RecipientSection } from "@/components/UserSections";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import JourneyDialog from "@/components/JourneyDialog";

// Import the Modal Components
import { DonorModal } from "@/pages/DonorRegister";
import { RecipientModal } from "@/pages/RecipientRegister";

const Index = () => {
  const navigate = useNavigate();
  const [isDonorOpen, setIsDonorOpen] = useState(false);
  const [isRecipientOpen, setIsRecipientOpen] = useState(false);
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);

  const openDonorModal = () => {
    setIsJourneyOpen(false);
    setIsDonorOpen(true);
  };

  const openRecipientModal = () => {
    setIsJourneyOpen(false);
    setIsRecipientOpen(true);
  };

  const openAdminLogin = () => {
    setIsJourneyOpen(false);
    navigate("/admin/login");
  };

  const openUserLogin = () => {
    setIsJourneyOpen(false);
    navigate("/login");
  };

  const scrollToHowItWorks = () => {
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onOpenDonor={openDonorModal} 
        onOpenRecipient={openRecipientModal} 
      />
      
      <main>
        <HeroSection
          onOpenDonor={openDonorModal}
          onOpenRecipient={openRecipientModal}
        />
        
        <HowItWorks />
        <FoodCategories />
        
        <DonorSection onOpenRegister={openDonorModal} />
        <RecipientSection onOpenRegister={openRecipientModal} />
        
        <ImpactStats />
        <CTASection
          onStartJourney={() => setIsJourneyOpen(true)}
          onLearnMore={scrollToHowItWorks}
        />
      </main>
      
      <Footer />

      <JourneyDialog
        open={isJourneyOpen}
        onOpenChange={setIsJourneyOpen}
        onChooseDonor={openDonorModal}
        onChooseRecipient={openRecipientModal}
        onChooseAdmin={openAdminLogin}
        onGoToLogin={openUserLogin}
      />
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
