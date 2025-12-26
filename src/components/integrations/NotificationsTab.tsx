"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Mail, MessageSquare, Users } from "lucide-react";
import { NotificationSettings } from "./types";

interface NotificationsTabProps {
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function NotificationsTab({
  settings,
  onSettingsChange,
  onSave,
  isSaving,
}: NotificationsTabProps) {
  const updateSettings = (updates: Partial<NotificationSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>Configure how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <Label>Email Notifications</Label>
              </div>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={settings.email_enabled}
              onCheckedChange={(checked) => updateSettings({ email_enabled: checked })}
            />
          </div>
          {settings.email_enabled && (
            <div className="ml-6">
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={settings.email_address}
                onChange={(e) => updateSettings({ email_address: e.target.value })}
                className="mt-1"
              />
            </div>
          )}

          <Separator />

          {/* Slack Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <Label>Slack Notifications</Label>
              </div>
              <p className="text-sm text-muted-foreground">Post notifications to Slack channels</p>
            </div>
            <Switch
              checked={settings.slack_enabled}
              onCheckedChange={(checked) => updateSettings({ slack_enabled: checked })}
            />
          </div>
          {settings.slack_enabled && (
            <div className="ml-6">
              <Label>Slack Channel</Label>
              <Input
                placeholder="#lean-construction"
                value={settings.slack_channel}
                onChange={(e) => updateSettings({ slack_channel: e.target.value })}
                className="mt-1"
              />
            </div>
          )}

          <Separator />

          {/* Teams Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <Label>Microsoft Teams Notifications</Label>
              </div>
              <p className="text-sm text-muted-foreground">Post notifications to Teams channels</p>
            </div>
            <Switch
              checked={settings.teams_enabled}
              onCheckedChange={(checked) => updateSettings({ teams_enabled: checked })}
            />
          </div>
          {settings.teams_enabled && (
            <div className="ml-6">
              <Label>Teams Channel</Label>
              <Input
                placeholder="General"
                value={settings.teams_channel}
                onChange={(e) => updateSettings({ teams_channel: e.target.value })}
                className="mt-1"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>Choose which events trigger notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Waste Incident Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new waste incidents are reported
              </p>
            </div>
            <Switch
              checked={settings.waste_incident_alerts}
              onCheckedChange={(checked) => updateSettings({ waste_incident_alerts: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Task Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Receive reminders for upcoming task deadlines
              </p>
            </div>
            <Switch
              checked={settings.task_reminders}
              onCheckedChange={(checked) => updateSettings({ task_reminders: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Performance Reports</Label>
              <p className="text-sm text-muted-foreground">
                Receive AI-generated weekly performance summaries
              </p>
            </div>
            <Switch
              checked={settings.weekly_reports}
              onCheckedChange={(checked) => updateSettings({ weekly_reports: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Daily Standup Summaries</Label>
              <p className="text-sm text-muted-foreground">Get daily summaries of tasks and blockers</p>
            </div>
            <Switch
              checked={settings.daily_standups}
              onCheckedChange={(checked) => updateSettings({ daily_standups: checked })}
            />
          </div>
        </CardContent>
        <div className="p-6 pt-0">
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Notification Settings"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
