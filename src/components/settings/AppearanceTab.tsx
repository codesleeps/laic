"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppearanceSettings } from "./types";

interface AppearanceTabProps {
  appearance: AppearanceSettings;
  onAppearanceChange: (appearance: AppearanceSettings) => void;
}

export function AppearanceTab({ appearance, onAppearanceChange }: AppearanceTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance Settings</CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={appearance.theme}
              onValueChange={(value) => onAppearanceChange({ ...appearance, theme: value })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Compact Mode</p>
              <p className="text-sm text-muted-foreground">Use smaller spacing and fonts</p>
            </div>
            <Switch
              checked={appearance.compactMode}
              onCheckedChange={(checked) => onAppearanceChange({ ...appearance, compactMode: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Animations</p>
              <p className="text-sm text-muted-foreground">Enable UI animations and transitions</p>
            </div>
            <Switch
              checked={appearance.showAnimations}
              onCheckedChange={(checked) => onAppearanceChange({ ...appearance, showAnimations: checked })}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Dashboard Layout</Label>
            <Select
              value={appearance.dashboardLayout}
              onValueChange={(value) => onAppearanceChange({ ...appearance, dashboardLayout: value })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="expanded">Expanded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
