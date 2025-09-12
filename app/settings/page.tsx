"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    temperatureUnit: "celsius",
    notifications: true,
    autoLocation: true,
    darkMode: false,
    refreshInterval: "5",
  })

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem("weatherAppSettings", JSON.stringify(settings))
    router.push("/")
  }

  if (!user) {
    router.push("/")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={() => router.push("/")} variant="outline" size="sm" className="neon-button bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>

        <Card className="glass-panel border neon-border bg-black/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-amber-400">Weather Preferences</CardTitle>
            <CardDescription className="text-gray-300">Customize your weather app experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature-unit" className="text-gray-300">
                Temperature Unit
              </Label>
              <Select
                value={settings.temperatureUnit}
                onValueChange={(value) => setSettings({ ...settings, temperatureUnit: value })}
              >
                <SelectTrigger className="w-32 bg-black/20 border-amber-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-amber-500/30">
                  <SelectItem value="celsius">°C</SelectItem>
                  <SelectItem value="fahrenheit">°F</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-gray-300">
                Weather Notifications
              </Label>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-location" className="text-gray-300">
                Auto-detect Location
              </Label>
              <Switch
                id="auto-location"
                checked={settings.autoLocation}
                onCheckedChange={(checked) => setSettings({ ...settings, autoLocation: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="refresh-interval" className="text-gray-300">
                Refresh Interval (minutes)
              </Label>
              <Select
                value={settings.refreshInterval}
                onValueChange={(value) => setSettings({ ...settings, refreshInterval: value })}
              >
                <SelectTrigger className="w-20 bg-black/20 border-amber-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-amber-500/30">
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSave}
              className="w-full neon-button bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border-amber-500/50"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
