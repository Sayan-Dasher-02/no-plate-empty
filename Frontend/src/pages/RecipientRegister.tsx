import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Utensils, MapPin, Users } from "lucide-react";

interface RecipientRegisterProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RecipientModal = ({ isOpen, onOpenChange }: RecipientRegisterProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-lg rounded-3xl bg-white p-6">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Utensils className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">Find Food Support</DialogTitle>
          <DialogDescription>
            Register to connect with local food donors in your area.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 py-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rec-name">Representative Name</Label>
              <Input id="rec-name" placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rec-phone">Contact Number</Label>
              <Input id="rec-phone" placeholder="+1..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rec-size">People Served Weekly</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="rec-size" type="number" className="pl-10" placeholder="e.g. 50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rec-addr">Primary Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="rec-addr" className="pl-10" placeholder="Street address, City" />
            </div>
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90 text-white mt-4 py-6 text-lg font-semibold">
            Register as Recipient
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};