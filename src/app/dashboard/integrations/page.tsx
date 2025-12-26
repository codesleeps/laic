"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Send, Clock } from "lucide-react";
import {
  useNotificationSettings,
  useScheduledReports,
  useProjects,
  saveNotificationSettings,
  createScheduledReport,
  deleteScheduledReport,
  sendNotification,
} from "@/client-lib/api-client";
import {
  Integration,
  NotificationSettings,
  NewScheduledReport,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_NEW_REPORT,
  QuickStats,
  OverviewTab,
  NotificationsTab,
  ScheduledTab,
  SettingsTab,
  ConnectDialog,
  ScheduleReportDialog,
  TestNotificationDialog,
} from "@/components/integrations";

export default function IntegrationsPage() {
  const { data: notificationSettings } = useNotificationSettings();
  const { data: scheduledReports, isLoading: reportsLoading } = useScheduledReports();
  const { data: projects } = useProjects();

  const [activeTab, setActiveTab] = useState("overview");
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);

  // Sync settings from server
  useEffect(() => {
    if (notificationSettings?.[0]) {
      const current = notificationSettings[0];
      setSettings({
        email_enabled: current.email_enabled ?? true,
        slack_enabled: current.slack_enabled ?? false,
        teams_enabled: current.teams_enabled ?? false,
        email_address: current.email_address ?? "",
        slack_channel: current.slack_channel ?? "",
        teams_channel: current.teams_channel ?? "",
        waste_incident_alerts: current.waste_incident_alerts ?? true,
        task_reminders: current.task_reminders ?? true,
        weekly_reports: current.weekly_reports ?? true,
        daily_standups: current.daily_standups ?? false,
      });
    }
  }, [notificationSettings]);

  // Scheduled report state
  const [newReport, setNewReport] = useState<NewScheduledReport>(DEFAULT_NEW_REPORT);

  const handleConnectIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowConnectDialog(true);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await saveNotificationSettings(settings);
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateScheduledReport = async () => {
    if (!newReport.email_recipients) {
      toast.error("Please enter at least one email recipient");
      return;
    }

    try {
      await createScheduledReport({
        project_id: newReport.project_id || undefined,
        report_type: newReport.report_type,
        frequency: newReport.frequency as "daily" | "weekly" | "monthly",
        day_of_week: newReport.frequency === "weekly" ? newReport.day_of_week : undefined,
        time_of_day: newReport.time_of_day,
        email_recipients: newReport.email_recipients.split(",").map((e) => e.trim()),
      });
      toast.success("Scheduled report created");
      setShowScheduleDialog(false);
      setNewReport(DEFAULT_NEW_REPORT);
    } catch {
      toast.error("Failed to create scheduled report");
    }
  };

  const handleDeleteScheduledReport = async (id: string) => {
    try {
      await deleteScheduledReport(id);
      toast.success("Scheduled report deleted");
    } catch {
      toast.error("Failed to delete scheduled report");
    }
  };

  const handleSendTestNotification = async () => {
    if (!testEmail) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      const result = await sendNotification({
        type: "email",
        channel: "waste_alert",
        recipients: [testEmail],
        subject: "🧪 Test Notification from LeanBuild AI",
        content:
          "This is a test notification to verify your email integration is working correctly.\n\nIf you received this email, your notification settings are configured properly!",
      });

      if (result.success) {
        toast.success("Test notification sent!");
      } else {
        toast.info(result.message || "Notification logged (no email service configured)");
      }
      setShowTestDialog(false);
      setTestEmail("");
    } catch {
      toast.error("Failed to send test notification");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations Hub</h1>
          <p className="text-muted-foreground mt-1">
            Connect external services for notifications, calendar sync, and team collaboration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTestDialog(true)}>
            <Send className="h-4 w-4 mr-2" />
            Send Test
          </Button>
          <Button onClick={() => setShowScheduleDialog(true)}>
            <Clock className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats
        scheduledReportsCount={scheduledReports?.length ?? 0}
        alertsEnabled={settings.waste_incident_alerts}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab onConnectIntegration={handleConnectIntegration} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationsTab
            settings={settings}
            onSettingsChange={setSettings}
            onSave={handleSaveSettings}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <ScheduledTab
            reports={scheduledReports}
            isLoading={reportsLoading}
            onCreateNew={() => setShowScheduleDialog(true)}
            onDelete={handleDeleteScheduledReport}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SettingsTab />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ConnectDialog
        open={showConnectDialog}
        onOpenChange={setShowConnectDialog}
        integration={selectedIntegration}
      />

      <ScheduleReportDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        report={newReport}
        onReportChange={setNewReport}
        onSubmit={handleCreateScheduledReport}
        projects={projects}
      />

      <TestNotificationDialog
        open={showTestDialog}
        onOpenChange={setShowTestDialog}
        email={testEmail}
        onEmailChange={setTestEmail}
        onSend={handleSendTestNotification}
      />
    </div>
  );
}
