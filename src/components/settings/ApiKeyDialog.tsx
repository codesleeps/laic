"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Key, Eye, EyeOff, ExternalLink } from "lucide-react";
import { AIProvider } from "./types";

interface ApiKeyDialogProps {
  provider: AIProvider | null;
  onClose: () => void;
  onSave: (providerId: string, apiKey: string) => void;
}

export function ApiKeyDialog({ provider, onClose, onSave }: ApiKeyDialogProps) {
  const [newApiKey, setNewApiKey] = useState(provider?.apiKey || "");
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    if (provider) {
      onSave(provider.id, newApiKey);
      setNewApiKey("");
    }
  };

  return (
    <Dialog open={!!provider} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {provider?.icon}
            {provider?.apiKey ? "Edit" : "Add"} {provider?.name} API Key
          </DialogTitle>
          <DialogDescription>
            Enter your API key to enable AI-powered analysis with {provider?.name}.
            {provider?.docsUrl && (
              <Button
                variant="link"
                className="px-1 h-auto"
                onClick={() => window.open(provider?.docsUrl, "_blank")}
              >
                Get your API key here <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                placeholder={`Enter your ${provider?.name} API key`}
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                className="pr-10 font-mono"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Expected format: <code className="bg-muted px-1 rounded">{provider?.keyPrefix}...</code>
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Key className="h-4 w-4 mr-2" />
            Save API Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
