"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  User,
  Bell,
  Shield,
  Palette,
  Key,
  Link2,
  Save,
  RefreshCw,
} from "lucide-react";
import { Zap, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  ProfileTab,
  ApiKeysTab,
  NotificationsTab,
  AppearanceTab,
  IntegrationsTab,
  SecurityTab,
  AIProvider,
  ProfileSettings,
  NotificationSettings,
  AppearanceSettings
} from "@/components/settings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  
  // AI Providers
  const [aiProviders, setAiProviders] = useState<AIProvider[]>([
    {
      id: "openrouter",
      name: "OpenRouter",
      description: "Access multiple AI models through a single API. Supports GPT-4, Claude, Llama, Mistral, and more.",
      icon: <Zap className="h-6 w-6 text-purple-500" />,
      docsUrl: "https://openrouter.ai/keys",
      keyPrefix: "sk-or-",
      models: ["GPT-4o", "GPT-4 Turbo", "Claude 3.5 Sonnet", "Llama 3.1 70B", "Mistral Large"],
      status: "inactive",
      apiKey: ""
    },
    {
      id: "gemini",
      name: "Google Gemini",
      description: "Google's most capable AI model. Gemini 2.5 Flash offers fast, efficient responses with advanced reasoning.",
      icon: <Sparkles className="h-6 w-6 text-blue-500" />,
      docsUrl: "https://aistudio.google.com/app/apikey",
      keyPrefix: "AIza",
      models: ["Gemini 2.5 Flash", "Gemini 2.5 Pro", "Gemini 1.5 Pro"],
      status: "inactive",
      apiKey: ""
    }
  ]);

  // Load saved API keys from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem("leanbuild_ai_keys");
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        setAiProviders(prev => prev.map(provider => ({
          ...provider,
          apiKey: parsed[provider.id] || "",
          status: parsed[provider.id] ? "active" : "inactive"
        })));
      } catch {
        console.error("Failed to parse saved API keys");
      }
    }
  }, []);
  
  // Profile settings
  const [profile, setProfile] = useState<ProfileSettings>({
    name: "John Smith",
    email: "john.smith@leanbuild.com",
    phone: "+1 (555) 123-4567",
    company: "LeanBuild Construction Inc.",
    role: "Project Manager",
    timezone: "America/New_York"
  });

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailAlerts: true,
    pushNotifications: true,
    wasteAlerts: true,
    dailyDigest: true,
    weeklyReport: true,
    recommendations: true,
    teamUpdates: false,
    systemUpdates: true
  });

  // Appearance settings
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: "system",
    compactMode: false,
    showAnimations: true,
    dashboardLayout: "default"
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Save API keys to localStorage
    const keysToSave: Record<string, string> = {};
    aiProviders.forEach(provider => {
      if (provider.apiKey) {
        keysToSave[provider.id] = provider.apiKey;
      }
    });
    localStorage.setItem("leanbuild_ai_keys", JSON.stringify(keysToSave));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">API Keys</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab profile={profile} onProfileChange={setProfile} />
        </TabsContent>

        <TabsContent value="api-keys">
          <ApiKeysTab providers={aiProviders} onProvidersChange={setAiProviders} />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab notifications={notifications} onNotificationsChange={setNotifications} />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceTab appearance={appearance} onAppearanceChange={setAppearance} />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsTab />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
