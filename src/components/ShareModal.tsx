// ===========================
// Imports
// ===========================
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Share2Icon } from "lucide-react";
import { TooltipProvider } from "./ui/tooltip";
import { useAuth } from "@clerk/nextjs";
import { ApiGateway } from "@/shared/axios";
import { toast } from "sonner";

// ===========================
// Component
// ===========================
export function ShareModal({ documentId }: { documentId: string }) {
  // ===========================
  // State & Hooks
  // ===========================
  const [email, setEmail] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { getToken } = useAuth();
  const options = ["View", "Edit", "Delete"];

  // ===========================
  // Event Handlers
  // ===========================
  const handleOptionToggle = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    const token = await getToken();
    try {
      const response = await ApiGateway.patch(
        "/document-metadata/share",
        {
          email,
          types: selectedOptions,
          documentId,
        },
        { headers: { Authorization: token } }
      );
      if (response) {
        toast.success("Document shared successfully");
        setOpen(false);
        setEmail("");
        setSelectedOptions([]);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error sharing document:", error);
      toast.error("Error sharing document");
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // Render
  // ===========================
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              <Share2Icon color="blue" className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
        {/* Dialog Content */}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share</DialogTitle>
          </DialogHeader>

          {/* Share Form */}
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            {/* Email Input Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            {/* Permissions Checkboxes */}
            <div className="flex items-start gap-4">
              <Label className="text-right pt-2">Permissions</Label>
              <div className="flex justify-center items-center pt-2 gap-4">
                {options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={selectedOptions.includes(option.toLowerCase())}
                      onCheckedChange={() =>
                        handleOptionToggle(option.toLowerCase())
                      }
                    />
                    <Label htmlFor={option}>{option}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="mt-4" disabled={loading}>
              {loading ? "Sharing" : "Submit"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
