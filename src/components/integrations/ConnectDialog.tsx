"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Integration } from "./types";

interface ConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: Integration | null;
}

export function ConnectDialog({ open, onOpenChange, integration }: ConnectDialogProps) {
  const handleConnect = () => {
    toast.info(
      `${integration?.name} integration requires OAuth setup. Please contact support to enable.`
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect {integration?.name}</DialogTitle>
          <DialogDescription>{integration?.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">
              To connect {integration?.name}, you&apos;ll need to authorize LeanBuild AI to access
              your account. This integration is available but requires external authorization.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">This integration will enable:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {integration?.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConnect}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Connect via OAuth
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
