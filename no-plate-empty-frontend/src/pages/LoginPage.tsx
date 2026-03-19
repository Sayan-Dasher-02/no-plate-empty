import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroImage from "@/assets/hero-food.jpg";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage, getRoleHomePath } from "@/lib/auth";
import { DonorModal } from "./DonorRegister";
import { RecipientModal } from "./RecipientRegister";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isDonorOpen, setIsDonorOpen] = useState(false);
  const [isRecipientOpen, setIsRecipientOpen] = useState(false);

  const handleLogin = async () => {
    setError("");

    try {
      const currentUser = await login({ email, password });
      const fromPath = location.state?.from?.pathname;
      const defaultPath = getRoleHomePath(currentUser.role);
      const targetPath =
        typeof fromPath === "string" && fromPath !== "/login"
          ? fromPath
          : defaultPath;

      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Something went wrong"));
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img
          src={heroImage}
          alt="Fresh vegetables and fruits"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/60 backdrop-blur-[2px]" />
        <div className="absolute inset-0 flex flex-col justify-center px-12 text-primary-foreground">
          <h2 className="mb-4 text-5xl font-bold font-display">Welcome Back!</h2>
          <p className="max-w-md text-xl leading-relaxed text-primary-foreground/80">
            Log in to manage your impact. Every contribution helps ensure no good
            food goes to waste.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md space-y-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight font-display">
              Login
            </h1>
            <p className="text-muted-foreground">
              Enter your credentials to access your dashboard.
            </p>
            <p className="text-sm text-muted-foreground">
              Approved donors and NGOs sign in here. Super admins can use the
              dedicated admin portal below.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/35 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Need the admin approval panel?
                </p>
                <p className="text-sm text-muted-foreground">
                  Super admins can use the dedicated admin portal to approve donor
                  and NGO users before they sign in.
                </p>
                <Link
                  to="/admin/login"
                  className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
                >
                  Open Admin Sign In
                </Link>
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-red-100 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              void handleLogin();
            }}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="h-12 pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-12 pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary py-6 text-lg font-semibold text-white hover:bg-secondary/90"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="space-y-4 border-t border-border pt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsDonorOpen(true)}
                className="font-bold text-secondary hover:underline"
              >
                Join as Donor
              </button>
              <span className="hidden text-muted-foreground/30 sm:block">|</span>
              <button
                type="button"
                onClick={() => setIsRecipientOpen(true)}
                className="font-bold text-primary hover:underline"
              >
                Join as Recipient
              </button>
            </div>
          </div>
        </div>
      </div>

      <DonorModal isOpen={isDonorOpen} onOpenChange={setIsDonorOpen} />
      <RecipientModal
        isOpen={isRecipientOpen}
        onOpenChange={setIsRecipientOpen}
      />
    </div>
  );
};

export default LoginPage;
