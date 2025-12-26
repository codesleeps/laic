"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield } from "lucide-react";

export function SettingsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integration Security</CardTitle>
        <CardDescription>Manage API keys and access tokens</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <Shield className="h-8 w-8 text-green-600" />
          <div>
            <p className="font-medium">Secure Connection</p>
            <p className="text-sm text-muted-foreground">
              All integrations use encrypted connections and OAuth 2.0 where available
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium mb-2">Connected Accounts</h4>
          <p className="text-sm text-muted-foreground">
            No accounts connected yet. Click &quot;Connect&quot; on an integration above to get
            started.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
