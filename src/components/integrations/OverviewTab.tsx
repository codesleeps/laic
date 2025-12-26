"use client";

import { IntegrationCard } from "./IntegrationCard";
import { Integration, INTEGRATIONS } from "./types";

interface OverviewTabProps {
  onConnectIntegration: (integration: Integration) => void;
}

export function OverviewTab({ onConnectIntegration }: OverviewTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {INTEGRATIONS.map((integration) => (
        <IntegrationCard
          key={integration.id}
          integration={integration}
          onConnect={onConnectIntegration}
        />
      ))}
    </div>
  );
}
