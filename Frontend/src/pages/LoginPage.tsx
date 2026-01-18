import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import heroImage from "@/assets/hero-food.jpg"; 

// Import both specific modals
import { DonorModal } from "./DonorRegister"; 
import { RecipientModal } from "./RecipientRegister";

const LoginPage = () => {
  // Separate states for Donor and Recipient modals
  const [isDonorOpen, setIsDonorOpen] = useState<boolean>(false);
  const [isRecipientOpen, setIsRecipientOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side: Branding/Visuals */}
      <div className="relative hidden lg:block">
        <img
          src={heroImage}
          alt="Fresh vegetables and fruits"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/60 backdrop-blur-[2px]" />
        <div className="absolute inset-0 flex flex-col justify-center px-12 text-primary-foreground">
          <h2 className="text-5xl font-display font-bold mb-4">Welcome Back!</h2>
          <p className="text-xl text-primary-foreground/80 max-w-md leading-relaxed">
            Log in to manage your impact. Every contribution helps ensure no good food goes to waste.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex items-center justify-center p-8 bg-background relative">
        <div className="w-full max-w-md space-y-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold tracking-tight">Login</h1>
            <p className="text-muted-foreground">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" placeholder="name@example.com" type="email" className="pl-10 h-12" required />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-secondary hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="••••••••" className="pl-10 h-12" required />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label htmlFor="remember" className="text-sm font-medium cursor-pointer">Remember me</label>
              </div>
            </div>

            <Button className="w-full bg-secondary hover:bg-secondary/90 text-white py-6 text-lg font-semibold shadow-lg">
              Sign In
            </Button>
          </form>

          {/* Dual Registration Trigger */}
          <div className="text-center space-y-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Don&apos;t have an account?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                type="button"
                onClick={() => setIsDonorOpen(true)}
                className="font-bold text-secondary hover:underline transition-all"
              >
                Join as Donor
              </button>
              <span className="hidden sm:block text-muted-foreground/30">|</span>
              <button 
                type="button"
                onClick={() => setIsRecipientOpen(true)}
                className="font-bold text-primary hover:underline transition-all"
              >
                Join as Recipient
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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

export default LoginPage;