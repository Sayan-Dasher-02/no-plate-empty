import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { API } from "@/lib/api";
import {
  getApiErrorMessage,
  getErrorMessage,
  readApiResponse,
} from "@/lib/auth";

interface RegisterModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DonorModal = ({ isOpen, onOpenChange }: RegisterModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: "DONOR",
        }),
      });
      const payload = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(getApiErrorMessage(payload, "Registration failed."));
      }

      setSuccess(
        payload?.message ||
          "Registration successful! Please wait for admin approval before login.",
      );
      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err, "Something went wrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl bg-white p-6">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-6 w-6 fill-current text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">Become a Donor</DialogTitle>
          <DialogDescription>
            Register to donate surplus food. Admin approval is required.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="rounded bg-red-100 p-2 text-sm text-red-600">{error}</p>
        )}

        {success && (
          <p className="rounded bg-green-100 p-2 text-sm text-green-600">
            {success}
          </p>
        )}

        <form
          className="space-y-4 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleRegister();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="donor-name">Name</Label>
            <Input
              id="donor-name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="donor-email">Email</Label>
            <Input
              id="donor-email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="donor-password">Password</Label>
            <Input
              id="donor-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-secondary py-6 text-lg font-semibold text-white hover:bg-secondary/90"
          >
            {isSubmitting ? "Submitting..." : "Complete Registration"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
