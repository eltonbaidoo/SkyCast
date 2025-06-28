"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface LocalTimeProps {
  timezone: number // Timezone offset in seconds from UTC
}

export function LocalTime({ timezone }: LocalTimeProps) {
  const [time, setTime] = useState<string>("")

  useEffect(() => {
    // Function to update the time
    const updateTime = () => {
      const now = new Date()
      // Get UTC time in milliseconds
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000
      // Create new Date object for the city's local time
      const cityTime = new Date(utcTime + timezone * 1000)

      // Format the time
      const timeString = cityTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })

      setTime(timeString)
    }

    // Update time immediately
    updateTime()

    // Update time every second
    const interval = setInterval(updateTime, 1000)

    // Clean up interval on unmount
    return () => clearInterval(interval)
  }, [timezone])

  return (
    <div className="flex items-center gap-2 text-lg font-medium">
      <Clock className="h-5 w-5 text-weather-blue animate-pulse-subtle" />
      <span className="tabular-nums">{time}</span>
    </div>
  )
}
