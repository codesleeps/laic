"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Zap, CheckCircle2, Clock, Bell } from "lucide-react";
import { INTEGRATIONS } from "./types";

interface QuickStatsProps {
  scheduledReportsCount: number;
  alertsEnabled: boolean;
}

export function QuickStats({ scheduledReportsCount, alertsEnabled }: QuickStatsProps) {
  const stats = [
    {
      label: "Available",
      value: INTEGRATIONS.length,
      icon: Zap,
      bgColor: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Connected",
      value: 0,
      icon: CheckCircle2,
      bgColor: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      label: "Scheduled Reports",
      value: scheduledReportsCount,
      icon: Clock,
      bgColor: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Alerts Status",
      value: alertsEnabled ? "On" : "Off",
      icon: Bell,
      bgColor: "bg-orange-100 dark:bg-orange-900",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
