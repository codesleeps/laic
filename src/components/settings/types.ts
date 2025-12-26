import { ReactNode } from "react";

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: "connected" | "disconnected";
  icon: string;
}

export interface AIProvider {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  docsUrl: string;
  keyPrefix: string;
  models: string[];
  status: "active" | "inactive" | "error";
  apiKey?: string;
}

export interface ProfileSettings {
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  timezone: string;
}

export interface NotificationSettings {
  emailAlerts: boolean;
  pushNotifications: boolean;
  wasteAlerts: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
  recommendations: boolean;
  teamUpdates: boolean;
  systemUpdates: boolean;
}

export interface AppearanceSettings {
  theme: string;
  compactMode: boolean;
  showAnimations: boolean;
  dashboardLayout: string;
}
