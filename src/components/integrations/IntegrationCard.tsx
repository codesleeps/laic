"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Settings, ExternalLink, Mail, Calendar, MessageSquare, Cloud } from "lucide-react";
import { Integration } from "./types";

interface IntegrationCardProps {
  integration: Integration;
  onConnect: (integration: Integration) => void;
}

export function IntegrationCard({ integration, onConnect }: IntegrationCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
          </Badge>
        );
      case "available":
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" /> Available
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" /> Not Available
          </Badge>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "email":
        return <Mail className="h-5 w-5" />;
      case "calendar":
        return <Calendar className="h-5 w-5" />;
      case "communication":
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <Cloud className="h-5 w-5" />;
    }
  };

  const Icon = integration.icon;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {getCategoryIcon(integration.category)}
                <span className="text-xs text-muted-foreground capitalize">
                  {integration.category}
                </span>
              </div>
            </div>
          </div>
          {getStatusBadge(integration.status)}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">{integration.description}</CardDescription>
        <div className="space-y-2">
          <p className="text-sm font-medium">Features:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {integration.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <Button
          className="w-full mt-4"
          variant={integration.status === "connected" ? "outline" : "default"}
          onClick={() => onConnect(integration)}
        >
          {integration.status === "connected" ? (
            <>
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
