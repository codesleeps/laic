"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, XCircle } from "lucide-react";
import { REPORT_TYPE_LABELS } from "@/shared/models/lean-construction";

interface ScheduledReport {
  id: string;
  report_type: string;
  frequency: string;
  time_of_day: string;
  project_name?: string;
  email_recipients?: string[];
  is_active: boolean;
}

interface ScheduledTabProps {
  reports: ScheduledReport[] | undefined;
  isLoading: boolean;
  onCreateNew: () => void;
  onDelete: (id: string) => void;
}

export function ScheduledTab({ reports, isLoading, onCreateNew, onDelete }: ScheduledTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Scheduled Reports</CardTitle>
            <CardDescription>Automated reports sent on a schedule</CardDescription>
          </div>
          <Button onClick={onCreateNew}>
            <Clock className="h-4 w-4 mr-2" />
            New Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : reports && reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="font-medium">
                    {REPORT_TYPE_LABELS[report.report_type as keyof typeof REPORT_TYPE_LABELS] ||
                      report.report_type}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {report.frequency} at {report.time_of_day}
                    </span>
                    {report.project_name && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {report.project_name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recipients: {report.email_recipients?.join(", ") || "None"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={report.is_active ? "default" : "secondary"}>
                    {report.is_active ? "Active" : "Paused"}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(report.id)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No scheduled reports yet</p>
            <Button variant="outline" className="mt-4" onClick={onCreateNew}>
              Create Your First Schedule
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
