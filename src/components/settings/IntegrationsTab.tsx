"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Integration } from "./types";

const integrations: Integration[] = [
  { id: "procore", name: "Procore", description: "Project management and collaboration", status: "connected", icon: "🏗️" },
  { id: "primavera", name: "Primavera P6", description: "Enterprise project portfolio management", status: "connected", icon: "📊" },
  { id: "autodesk", name: "Autodesk BIM 360", description: "Building information modeling", status: "disconnected", icon: "🏢" },
  { id: "msproject", name: "Microsoft Project", description: "Project scheduling", status: "disconnected", icon: "📅" },
  { id: "bluebeam", name: "Bluebeam Revu", description: "PDF markup and collaboration", status: "disconnected", icon: "📐" },
  { id: "plangrid", name: "PlanGrid", description: "Construction productivity software", status: "disconnected", icon: "📱" },
];

export function IntegrationsTab() {
  const handleConnectIntegration = (integration: Integration) => {
    toast.success(`Connecting to ${integration.name}...`);
  };

  const handleDisconnectIntegration = (integration: Integration) => {
    toast.success(`Disconnected from ${integration.name}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connected Integrations</CardTitle>
          <CardDescription>Manage your third-party integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{integration.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{integration.name}</h3>
                      <Badge variant={integration.status === "connected" ? "default" : "secondary"}>
                        {integration.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                {integration.status === "connected" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnectIntegration(integration)}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnectIntegration(integration)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
