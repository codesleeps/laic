import { LucideIcon, Mail, Calendar, MessageSquare, Users, Send } from "lucide-react";

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: "email" | "calendar" | "communication";
  status: "connected" | "available" | "unavailable";
  features: string[];
}

export interface NotificationSettings {
  email_enabled: boolean;
  slack_enabled: boolean;
  teams_enabled: boolean;
  email_address: string;
  slack_channel: string;
  teams_channel: string;
  waste_incident_alerts: boolean;
  task_reminders: boolean;
  weekly_reports: boolean;
  daily_standups: boolean;
}

export interface NewScheduledReport {
  project_id: string;
  report_type: "weekly_performance" | "monthly_waste" | "project_status" | "5s_scorecard";
  frequency: string;
  day_of_week: number;
  time_of_day: string;
  email_recipients: string;
}

export const INTEGRATIONS: Integration[] = [
  {
    id: "gmail",
    name: "Gmail / Google Workspace",
    description: "Send automated emails, reports, and notifications via Gmail",
    icon: Mail,
    category: "email",
    status: "available",
    features: ["Waste incident alerts", "Weekly reports", "Task reminders", "Team invitations"]
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    description: "Send emails and manage calendar via Outlook",
    icon: Mail,
    category: "email",
    status: "available",
    features: ["Email notifications", "Calendar sync", "Task reminders"]
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync tasks, milestones, and events with Google Calendar",
    icon: Calendar,
    category: "calendar",
    status: "available",
    features: ["Task sync", "Milestone tracking", "Kaizen scheduling", "5S assessment reminders"]
  },
  {
    id: "slack",
    name: "Slack",
    description: "Real-time notifications and team collaboration in Slack",
    icon: MessageSquare,
    category: "communication",
    status: "available",
    features: ["Waste alerts", "Daily standups", "AI analysis notifications", "Team channels"]
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    description: "Notifications and collaboration in Microsoft Teams",
    icon: Users,
    category: "communication",
    status: "available",
    features: ["Real-time alerts", "Channel notifications", "Team collaboration"]
  },
  {
    id: "sendgrid",
    name: "Twilio SendGrid",
    description: "Transactional emails for automated notifications",
    icon: Send,
    category: "email",
    status: "available",
    features: ["Bulk emails", "Transactional emails", "Email analytics"]
  }
];

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  email_enabled: true,
  slack_enabled: false,
  teams_enabled: false,
  email_address: "",
  slack_channel: "",
  teams_channel: "",
  waste_incident_alerts: true,
  task_reminders: true,
  weekly_reports: true,
  daily_standups: false,
};

export const DEFAULT_NEW_REPORT: NewScheduledReport = {
  project_id: "",
  report_type: "weekly_performance",
  frequency: "weekly",
  day_of_week: 1,
  time_of_day: "09:00",
  email_recipients: "",
};
