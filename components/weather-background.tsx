"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

type WeatherCondition = "clear" | "clouds" | "rain" | "snow" | "thunderstorm" | "drizzle" | "mist" | "fog" | "default"

interface WeatherBackgroundProps {
  condition: string
}

export function WeatherBackground({ condition }: WeatherBackgroundProps) {
  const [weatherType, setWeatherType] = useState<WeatherCondition>("default")
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Add mounted state to avoid hydration mismatch
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const lowerCondition = condition?.toLowerCase() || ""

    if (lowerCondition.includes("clear")) {
      setWeatherType("clear")
    } else if (lowerCondition.includes("cloud")) {
      setWeatherType("clouds")
    } else if (lowerCondition.includes("rain")) {
      setWeatherType("rain")
    } else if (lowerCondition.includes("snow")) {
      setWeatherType("snow")
    } else if (lowerCondition.includes("thunder")) {
      setWeatherType("thunderstorm")
    } else if (lowerCondition.includes("drizzle")) {
      setWeatherType("drizzle")
    } else if (lowerCondition.includes("mist") || lowerCondition.includes("fog")) {
      setWeatherType("mist")
    } else {
      setWeatherType("default")
    }
  }, [condition])

  const getGradient = () => {
    if (isDark) {
      switch (weatherType) {
        case "clear":
          return "from-blue-900 to-blue-800"
        case "clouds":
          return "from-gray-800 to-gray-700"
        case "rain":
          return "from-gray-900 to-gray-800"
        case "snow":
          return "from-blue-900 to-blue-800"
        case "thunderstorm":
          return "from-gray-900 to-gray-800"
        case "drizzle":
          return "from-gray-800 to-gray-700"
        case "mist":
        case "fog":
          return "from-gray-800 to-gray-700"
        default:
          return "from-blue-900 to-blue-800"
      }
    } else {
      switch (weatherType) {
        case "clear":
          return "from-weather-blue to-weather-lightBlue"
        case "clouds":
          return "from-slate-400 to-slate-300"
        case "rain":
          return "from-slate-700 to-slate-500"
        case "snow":
          return "from-slate-200 to-white"
        case "thunderstorm":
          return "from-slate-800 to-slate-600"
        case "drizzle":
          return "from-slate-500 to-slate-400"
        case "mist":
        case "fog":
          return "from-slate-300 to-slate-200"
        default:
          return "from-weather-cyan to-weather-teal"
      }
    }
  }

  // Only render the background if mounted to avoid hydration issues
  if (!mounted) return null

  return <div className={`fixed inset-0 -z-10 bg-gradient-to-b ${getGradient()} opacity-30`} aria-hidden="true" />
}
