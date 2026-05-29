"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Bell, Shield, Palette, Globe, Save, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: false,
    darkMode: true,
    autoRefresh: true,
    refreshInterval: 5,
    defaultStake: 10,
    minConfidence: 50,
    defaultRiskLevel: "medium",
    timezone: "UTC",
    oddsFormat: "decimal",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="w-8 h-8 text-sport-blue" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Customize your prediction experience
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-white/5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="betting">Betting</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" />
                General Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Refresh Data</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically refresh predictions and odds
                  </p>
                </div>
                <Switch
                  checked={settings.autoRefresh}
                  onCheckedChange={(v) => setSettings((p) => ({ ...p, autoRefresh: v }))}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Refresh Interval (minutes)</Label>
                  <span className="font-mono">{settings.refreshInterval}m</span>
                </div>
                <Slider
                  value={[settings.refreshInterval]}
                  onValueChange={([v]) => setSettings((p) => ({ ...p, refreshInterval: v }))}
                  min={1}
                  max={30}
                  step={1}
                  disabled={!settings.autoRefresh}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Use dark theme for the dashboard
                  </p>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(v) => setSettings((p) => ({ ...p, darkMode: v }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified about new high-confidence predictions
                  </p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(v) => setSettings((p) => ({ ...p, notifications: v }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive daily prediction summaries via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailAlerts}
                  onCheckedChange={(v) => setSettings((p) => ({ ...p, emailAlerts: v }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="betting" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Betting Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Default Stake ($)</Label>
                  <span className="font-mono">${settings.defaultStake}</span>
                </div>
                <Slider
                  value={[settings.defaultStake]}
                  onValueChange={([v]) => setSettings((p) => ({ ...p, defaultStake: v }))}
                  min={1}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Minimum Confidence Threshold (%)</Label>
                  <span className="font-mono">{settings.minConfidence}%</span>
                </div>
                <Slider
                  value={[settings.minConfidence]}
                  onValueChange={([v]) => setSettings((p) => ({ ...p, minConfidence: v }))}
                  min={30}
                  max={90}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <Label>Default Risk Level</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["low", "medium", "high"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSettings((p) => ({ ...p, defaultRiskLevel: level }))}
                      className={`p-2 rounded-lg border text-xs capitalize transition-all ${
                        settings.defaultRiskLevel === level
                          ? "border-sport-green bg-sport-green/10 text-sport-green"
                          : "border-white/5 hover:border-white/10"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Display Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Odds Format</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "decimal", label: "Decimal (1.85)" },
                    { value: "fractional", label: "Fractional (17/20)" },
                    { value: "american", label: "American (-118)" },
                  ].map((format) => (
                    <button
                      key={format.value}
                      onClick={() => setSettings((p) => ({ ...p, oddsFormat: format.value }))}
                      className={`p-2 rounded-lg border text-xs transition-all ${
                        settings.oddsFormat === format.value
                          ? "border-sport-blue bg-sport-blue/10 text-sport-blue"
                          : "border-white/5 hover:border-white/10"
                      }`}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings((p) => ({ ...p, timezone: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="UTC">UTC</option>
                  <option value="Europe/London">London (GMT/BST)</option>
                  <option value="Europe/Paris">Paris (CET/CEST)</option>
                  <option value="America/New_York">New York (ET)</option>
                  <option value="America/Los_Angeles">Los Angeles (PT)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
