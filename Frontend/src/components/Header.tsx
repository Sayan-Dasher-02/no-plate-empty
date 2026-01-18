import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart, ChevronDown, Utensils, HeartHandshake } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Relative imports matching the file names exactly
import { DonorModal } from "../pages/DonorRegister"; 
import { RecipientModal } from "../pages/RecipientRegister";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);
  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState(false);

  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "For Donors", href: "#donors" },
    { label: "For Recipients", href: "#recipients" },
    { label: "Impact", href: "#impact" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-soft group-hover:shadow-card transition-all duration-300">
              <Heart className="w-5 h-5 text-primary-foreground fill-current" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              NoPlate<span className="text-secondary">Empty</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-primary font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="gap-2 shadow-lg">
                  Sign Up <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <DropdownMenuItem onSelect={() => setIsDonorModalOpen(true)} className="p-3 cursor-pointer">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-secondary" /> Donor
                    </span>
                    <span className="text-xs text-muted-foreground">I want to give food</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsRecipientModalOpen(true)} className="p-3 cursor-pointer">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-primary" /> Recipient
                    </span>
                    <span className="text-xs text-muted-foreground">I am looking for food</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-foreground" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Modals */}
      <DonorModal isOpen={isDonorModalOpen} onOpenChange={setIsDonorModalOpen} />
      <RecipientModal isOpen={isRecipientModalOpen} onOpenChange={setIsRecipientModalOpen} />
    </>
  );
};

export default Header;