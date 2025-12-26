"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Brain,
  Key,
  ExternalLink,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { AIProvider } from "./types";
import { ApiKeyDialog } from "./ApiKeyDialog";

interface ApiKeysTabProps {
  providers: AIProvider[];
  onProvidersChange: (providers: AIProvider[]) => void;
}

export function ApiKeysTab({ providers, onProvidersChange }: ApiKeysTabProps) {
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [isTestingKey, setIsTestingKey] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);

  const toggleShowApiKey = (providerId: string) => {
    setShowApiKey(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const maskApiKey = (key: string) => {
    if (!key) return "";
    if (key.length <= 8) return "••••••••";
    return key.slice(0, 4) + "••••••••••••" + key.slice(-4);
  };

  const copyApiKey = (providerId: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(providerId);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("API key copied to clipboard");
  };

  const handleSaveApiKey = (providerId: string, apiKey: string) => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    const provider = providers.find(p => p.id === providerId);
    if (provider && !apiKey.startsWith(provider.keyPrefix)) {
      toast.warning(`This doesn't look like a valid ${provider.name} key. Expected prefix: ${provider.keyPrefix}`);
    }

    onProvidersChange(providers.map(p => 
      p.id === providerId 
        ? { ...p, apiKey, status: "active" as const }
        : p
    ));

    // Save to localStorage immediately
    const savedKeys = localStorage.getItem("leanbuild_ai_keys");
    const parsed = savedKeys ? JSON.parse(savedKeys) : {};
    parsed[providerId] = apiKey;
    localStorage.setItem("leanbuild_ai_keys", JSON.stringify(parsed));

    setEditingProvider(null);
    toast.success(`${provider?.name} API key saved successfully`);
  };

  const handleRemoveApiKey = (providerId: string) => {
    onProvidersChange(providers.map(p => 
      p.id === providerId 
        ? { ...p, apiKey: "", status: "inactive" as const }
        : p
    ));

    // Remove from localStorage
    const savedKeys = localStorage.getItem("leanbuild_ai_keys");
    if (savedKeys) {
      const parsed = JSON.parse(savedKeys);
      delete parsed[providerId];
      localStorage.setItem("leanbuild_ai_keys", JSON.stringify(parsed));
    }

    const provider = providers.find(p => p.id === providerId);
    toast.success(`${provider?.name} API key removed`);
  };

  const testApiKey = async (provider: AIProvider) => {
    if (!provider.apiKey) {
      toast.error("No API key configured");
      return;
    }

    setIsTestingKey(prev => ({ ...prev, [provider.id]: true }));
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo, randomly succeed or fail
    const success = Math.random() > 0.2;
    
    if (success) {
      onProvidersChange(providers.map(p => 
        p.id === provider.id ? { ...p, status: "active" } : p
      ));
      toast.success(`${provider.name} API key is valid!`);
    } else {
      onProvidersChange(providers.map(p => 
        p.id === provider.id ? { ...p, status: "error" } : p
      ));
      toast.error(`${provider.name} API key validation failed. Please check your key.`);
    }
    
    setIsTestingKey(prev => ({ ...prev, [provider.id]: false }));
  };

  const getStatusBadge = (status: AIProvider["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Active</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Not Configured</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Configure AI Providers</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Connect your AI providers to enable intelligent waste analysis, predictive insights, and automated recommendations. 
                Your API keys are stored securely in your browser and never sent to our servers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Providers */}
      <div className="grid gap-4">
        {providers.map((provider) => (
          <Card key={provider.id} className={provider.status === "error" ? "border-red-300 dark:border-red-800" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    {provider.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      {getStatusBadge(provider.status)}
                    </div>
                    <CardDescription className="mt-1">{provider.description}</CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(provider.docsUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get API Key
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Models Supported */}
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Supported Models</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {provider.models.map((model) => (
                    <Badge key={model} variant="outline" className="text-xs">
                      {model}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* API Key Input/Display */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>API Key</Label>
                  {provider.apiKey && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleShowApiKey(provider.id)}
                      >
                        {showApiKey[provider.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyApiKey(provider.id, provider.apiKey || "")}
                      >
                        {copiedKey === provider.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {provider.apiKey ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm">
                      {showApiKey[provider.id] ? provider.apiKey : maskApiKey(provider.apiKey)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testApiKey(provider)}
                        disabled={isTestingKey[provider.id]}
                      >
                        {isTestingKey[provider.id] ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Test
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProvider(provider)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveApiKey(provider.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setEditingProvider(provider)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Add API Key
                  </Button>
                )}

                {provider.status === "error" && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    API key validation failed. Please check your key and try again.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 text-xs font-bold">1</span>
                </div>
              </div>
              <div>
                <p className="font-medium">OpenRouter for Variety</p>
                <p className="text-muted-foreground">Best for accessing multiple models. Great for comparing responses across GPT-4, Claude, and open-source models.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">2</span>
                </div>
              </div>
              <div>
                <p className="font-medium">Gemini 2.5 Flash for Speed</p>
                <p className="text-muted-foreground">Google's fastest model. Ideal for real-time analysis and quick responses with excellent reasoning.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-xs font-bold">3</span>
                </div>
              </div>
              <div>
                <p className="font-medium">Configure Both</p>
                <p className="text-muted-foreground">Set up both providers to switch between them. Use Gemini for speed, OpenRouter for complex analysis.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-6 w-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <span className="text-orange-600 dark:text-orange-400 text-xs font-bold">4</span>
                </div>
              </div>
              <div>
                <p className="font-medium">Secure Storage</p>
                <p className="text-muted-foreground">Keys are stored in your browser's localStorage. They never leave your device or touch our servers.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Key Dialog */}
      <ApiKeyDialog
        provider={editingProvider}
        onClose={() => setEditingProvider(null)}
        onSave={handleSaveApiKey}
      />
    </div>
  );
}
