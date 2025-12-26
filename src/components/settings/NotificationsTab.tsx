"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Mail, Smartphone, AlertTriangle, CheckCircle2, Bell, Building2 } from "lucide-react";
import { NotificationSettings } from "./types";

interface NotificationsTabProps {
  notifications: NotificationSettings;
  onNotificationsChange: (notifications: NotificationSettings) => void;
}

export function NotificationsTab({ notifications, onNotificationsChange }: NotificationsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Alerts</p>
                  <p className="text-sm text-muted-foreground">Receive important alerts via email</p>
                </div>
              </div>
              <Switch
                checked={notifications.emailAlerts}
                onCheckedChange={(checked) => onNotificationsChange({ ...notifications, emailAlerts: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                </div>
              </div>
              <Switch
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) => onNotificationsChange({ ...notifications, pushNotifications: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Waste Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified about waste incidents</p>
                </div>
              </div>
              <Switch
                checked={notifications.wasteAlerts}
                onCheckedChange={(checked) => onNotificationsChange({ ...notifications, wasteAlerts: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">AI Recommendations</p>
                  <p className="text-sm text-muted-foreground">Receive AI-generated improvement suggestions</p>
                </div>
              </div>
              <Switch
                checked={notifications.recommendations}
                onCheckedChange={(checked) => onNotificationsChange({ ...notifications, recommendations: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Daily Digest</p>
                  <p className="text-sm text-muted-foreground">Daily summary of project activities</p>
                </div>
              </div>
              <Switch
                checked={notifications.dailyDigest}
                onCheckedChange={(checked) => onNotificationsChange({ ...notifications, dailyDigest: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Weekly Report</p>
                  <p className="text-sm text-muted-foreground">Weekly performance report</p>
                </div>
              </div>
              <Switch
                checked={notifications.weeklyReport}
                onCheckedChange={(checked) => onNotificationsChange({ ...notifications, weeklyReport: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
