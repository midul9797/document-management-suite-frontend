"use client";

// ===========================
// Imports
// ===========================
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@clerk/nextjs";
import { ApiGateway } from "@/shared/axios";
import { Loading } from "@/components/Loading";

export default function SettingsPage() {
  // ===========================
  // State & Hooks
  // ===========================
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { theme, setTheme } = useTheme();
  const [notificationMethod, setNotificationMethod] = useState<string>("");
  const { getToken } = useAuth();

  // ===========================
  // Event Handlers
  // ===========================
  const handleSave = async () => {
    setSaving(true);
    const token = await getToken();
    await ApiGateway.patch(
      "/system-configuration",
      { key: "darkMode", value: theme === "dark" ? "on" : "off" },
      { headers: { Authorization: token } }
    );
    await ApiGateway.patch(
      "/system-configuration",
      { key: "notificationType", value: notificationMethod },
      { headers: { Authorization: token } }
    );
    alert("Saved");
    setSaving(false);
    fetchSetting();
  };

  // ===========================
  // Data Fetching
  // ===========================
  const fetchSetting = async () => {
    const token = await getToken();
    const darkModeResponse = await ApiGateway.get(
      "/system-configuration/darkMode",
      { headers: { Authorization: token } }
    );
    setTheme(darkModeResponse.data.value === "on" ? "dark" : "light");
    const notificationTypeResponse = await ApiGateway.get(
      "/system-configuration/notificationType",
      { headers: { Authorization: token } }
    );
    setNotificationMethod(notificationTypeResponse.data.value);
    setLoading(false);
  };

  // ===========================
  // Effects
  // ===========================
  useEffect(() => {
    if (loading) fetchSetting();
  }, []);

  if (loading) {
    return <Loading />;
  }

  // ===========================
  // Render Component
  // ===========================
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      {/* Settings Card */}
      <Card className="w-full max-w-md">
        {/* Card Header */}
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Settings</CardTitle>
        </CardHeader>
        {/* Card Content */}
        <CardContent className="space-y-6">
          {/* Notifications Section */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Notifications</h2>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="notifications">Alert Method</Label>
              <Select
                value={notificationMethod}
                onValueChange={setNotificationMethod}
              >
                <SelectTrigger id="notifications">
                  <SelectValue placeholder="Select notification method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Appearance Section */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Appearance</h2>
            <div className="flex items-center space-x-2">
              <Switch
                id="darkMode"
                checked={theme === "dark"}
                onCheckedChange={() =>
                  setTheme(theme === "dark" ? "light" : "dark")
                }
              />
              <Label htmlFor="darkMode">Dark Mode</Label>
              {/* Theme Icon */}
              {theme === "dark" ? (
                <Moon className="h-4 w-4 ml-2" />
              ) : (
                <Sun className="h-4 w-4 ml-2" />
              )}
            </div>
          </div>
          {/* Save Button */}
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
