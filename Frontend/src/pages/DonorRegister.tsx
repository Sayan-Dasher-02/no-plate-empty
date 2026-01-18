import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart } from "lucide-react";

interface RegisterModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DonorModal = ({ isOpen, onOpenChange }: RegisterModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-lg rounded-3xl bg-white p-6">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Heart className="w-6 h-6 text-primary fill-current" />
          </div>
          <DialogTitle className="text-2xl font-bold">Become a Donor</DialogTitle>
          <DialogDescription>
            Join NoPlateEmpty to start saving surplus food today.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 py-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reg-name">Contact Name</Label>
              <Input id="reg-name" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-phone">Phone</Label>
              <Input id="reg-phone" placeholder="+1..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Organization Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-org">Organization Name</Label>
            <Input id="reg-org" placeholder="Business Name" />
          </div>

          <Button className="w-full bg-secondary hover:bg-secondary/90 text-white mt-4 py-6 text-lg font-semibold">
            Complete Registration
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};