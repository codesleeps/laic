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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";

interface TestNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onEmailChange: (email: string) => void;
  onSend: () => void;
}

export function TestNotificationDialog({
  open,
  onOpenChange,
  email,
  onEmailChange,
  onSend,
}: TestNotificationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Test Notification</DialogTitle>
          <DialogDescription>Send a test email to verify your notification setup</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSend}>
            <Send className="h-4 w-4 mr-2" />
            Send Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
