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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewScheduledReport } from "./types";
import { REPORT_TYPE_LABELS } from "@/shared/models/lean-construction";

interface Project {
  id: string;
  name: string;
}

interface ScheduleReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: NewScheduledReport;
  onReportChange: (report: NewScheduledReport) => void;
  onSubmit: () => void;
  projects: Project[] | undefined;
}

export function ScheduleReportDialog({
  open,
  onOpenChange,
  report,
  onReportChange,
  onSubmit,
  projects,
}: ScheduleReportDialogProps) {
  const updateReport = (updates: Partial<NewScheduledReport>) => {
    onReportChange({ ...report, ...updates });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule New Report</DialogTitle>
          <DialogDescription>Set up automated reports to be sent on a schedule</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select
              value={report.report_type}
              onValueChange={(value) =>
                updateReport({ report_type: value as NewScheduledReport["report_type"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Project (Optional)</Label>
            <Select
              value={report.project_id}
              onValueChange={(value) => updateReport({ project_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={report.frequency}
                onValueChange={(value) => updateReport({ frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={report.time_of_day}
                onChange={(e) => updateReport({ time_of_day: e.target.value })}
              />
            </div>
          </div>
          {report.frequency === "weekly" && (
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select
                value={report.day_of_week.toString()}
                onValueChange={(value) => updateReport({ day_of_week: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Email Recipients (comma-separated)</Label>
            <Input
              placeholder="email1@example.com, email2@example.com"
              value={report.email_recipients}
              onChange={(e) => updateReport({ email_recipients: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Create Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
