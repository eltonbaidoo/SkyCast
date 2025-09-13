"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Settings, User, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useUserPreferences } from "@/lib/user-preferences-context"
import { CircularDecorations } from "@/components/circular-decorations"
import { WeatherBackground } from "@/components/weather-background"
import { FavoritesManager } from "@/components/favorites-manager"

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { preferences, updatePreferences, isLoading } = useUserPreferences()

  const [formData, setFormData] = useState({
    temperature_unit: "celsius" as "celsius" | "fahrenheit",
    notifications_enabled: true,
    auto_location: true,
    refresh_interval: 300000, // 5 minutes in milliseconds
    theme: "system" as "light" | "dark" | "system",
  })

  useEffect(() => {
    if (preferences) {
      setFormData({
        temperature_unit: preferences.temperature_unit,
        notifications_enabled: preferences.notifications_enabled,
        auto_location: preferences.auto_location,
        refresh_interval: preferences.refresh_interval,
        theme: preferences.theme,
      })
    }
  }, [preferences])

  const handleSave = async () => {
    await updatePreferences(formData)
    router.push("/")
  }

  const handleLocationSelect = (lat: number, lon: number, name: string) => {
    // Navigate back to main page with the selected location
    router.push(`/?lat=${lat}&lon=${lon}&city=${encodeURIComponent(name)}`)
  }

  if (!user) {
    router.push("/")
    return null
  }

  return (
    <>
      <WeatherBackground condition="Clear" />
      <CircularDecorations />

      <div className="glass-panel container mx-auto px-8 py-8 max-w-4xl min-h-screen">
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            size="sm"
            className="border-2 border-weather-blue/20 shadow-lg dark:border-weather-blue/10 dark:bg-gray-800/60 rounded-2xl glass-interactive hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-weather-blue to-weather-teal dark:from-weather-lightBlue dark:to-weather-cyan">
              Settings
            </h1>
            <p className="text-muted-foreground">Customize your SkyCast experience</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Information */}
          <Card className="border-2 border-weather-blue/20 shadow-lg dark:border-weather-blue/10 dark:bg-gray-800/60 rounded-[2rem] glass-card">
            <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-weather-blue/10 rounded-full blur-2xl"></div>
            <CardHeader>
              <CardTitle className="text-weather-blue dark:text-weather-lightBlue flex items-center">
                <User className="h-5 w-5 mr-2" />
                Account Information
              </CardTitle>
              <CardDescription>Signed in as {user.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 bg-weather-blue/10 dark:bg-weather-blue/5 rounded-2xl glass-interactive">
                <div className="w-12 h-12 bg-weather-blue/20 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-weather-blue" />
                </div>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Favorites Manager */}
          <div className="lg:row-span-2">
            <FavoritesManager onLocationSelect={handleLocationSelect} />
          </div>

          {/* Weather Preferences */}
          <Card className="border-2 border-weather-blue/20 shadow-lg dark:border-weather-blue/10 dark:bg-gray-800/60 rounded-[2rem] glass-card">
            <div className="absolute bottom-0 left-0 w-32 h-32 -mb-8 -ml-8 bg-weather-teal/10 rounded-full blur-2xl"></div>
            <CardHeader>
              <CardTitle className="text-weather-blue dark:text-weather-lightBlue flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Weather Preferences
              </CardTitle>
              <CardDescription>Configure how weather data is displayed and updated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-weather-blue/10 dark:bg-weather-blue/5 rounded-2xl glass-interactive">
                <Label htmlFor="temperature-unit" className="font-medium">
                  Temperature Unit
                </Label>
                <Select
                  value={formData.temperature_unit}
                  onValueChange={(value: "celsius" | "fahrenheit") =>
                    setFormData({ ...formData, temperature_unit: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-32 border-weather-blue/30 bg-white/50 dark:bg-gray-800/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-weather-blue/30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md">
                    <SelectItem value="celsius">°C (Celsius)</SelectItem>
                    <SelectItem value="fahrenheit">°F (Fahrenheit)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 bg-weather-cyan/10 dark:bg-weather-cyan/5 rounded-2xl glass-interactive">
                <div>
                  <Label htmlFor="notifications" className="font-medium">
                    Weather Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">Get notified about weather changes</p>
                </div>
                <Switch
                  id="notifications"
                  checked={formData.notifications_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, notifications_enabled: checked })}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-weather-teal/10 dark:bg-weather-teal/5 rounded-2xl glass-interactive">
                <div>
                  <Label htmlFor="auto-location" className="font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Auto-detect Location
                  </Label>
                  <p className="text-sm text-muted-foreground">Automatically use your current location</p>
                </div>
                <Switch
                  id="auto-location"
                  checked={formData.auto_location}
                  onCheckedChange={(checked) => setFormData({ ...formData, auto_location: checked })}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-weather-blue/10 dark:bg-weather-blue/5 rounded-2xl glass-interactive">
                <Label htmlFor="theme" className="font-medium">
                  Theme Preference
                </Label>
                <Select
                  value={formData.theme}
                  onValueChange={(value: "light" | "dark" | "system") => setFormData({ ...formData, theme: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-32 border-weather-blue/30 bg-white/50 dark:bg-gray-800/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-weather-blue/30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md">
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 bg-weather-cyan/10 dark:bg-weather-cyan/5 rounded-2xl glass-interactive">
                <Label htmlFor="refresh-interval" className="font-medium">
                  Data Refresh Interval
                </Label>
                <Select
                  value={formData.refresh_interval.toString()}
                  onValueChange={(value) => setFormData({ ...formData, refresh_interval: Number.parseInt(value) })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-32 border-weather-blue/30 bg-white/50 dark:bg-gray-800/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-weather-blue/30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md">
                    <SelectItem value="60000">1 minute</SelectItem>
                    <SelectItem value="300000">5 minutes</SelectItem>
                    <SelectItem value="600000">10 minutes</SelectItem>
                    <SelectItem value="900000">15 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full border-2 border-weather-blue/20 shadow-lg dark:border-weather-blue/10 bg-weather-blue/10 hover:bg-weather-blue/20 text-weather-blue dark:text-weather-lightBlue rounded-2xl glass-interactive hover:scale-105 transition-all duration-300 py-6"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
