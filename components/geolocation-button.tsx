"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GeolocationButtonProps {
  onSearch: (city: string) => void
  isLoading: boolean
}

export function GeolocationButton({ onSearch, isLoading }: GeolocationButtonProps) {
  const [gettingLocation, setGettingLocation] = useState(false)
  const { toast } = useToast()

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      })
      return
    }

    setGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          // Use reverse geocoding to get the city name
          const response = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`)

          if (!response.ok) {
            throw new Error("Failed to get location information")
          }

          const data = await response.json()

          if (data.city) {
            toast({
              title: "Location found",
              description: `Found your location: ${data.city}`,
            })
            onSearch(data.city)
          } else {
            throw new Error("Couldn't determine your city")
          }
        } catch (error) {
          toast({
            title: "Error",
            description: error.message || "Failed to get your location",
            variant: "destructive",
          })
        } finally {
          setGettingLocation(false)
        }
      },
      (error) => {
        let message = "Failed to get your location"

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please enable location services in your browser settings."
            break
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable."
            break
          case error.TIMEOUT:
            message = "Location request timed out."
            break
        }

        toast({
          title: "Geolocation error",
          description: message,
          variant: "destructive",
        })

        setGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  return (
    <Button
      variant="outline"
      onClick={handleGetLocation}
      disabled={gettingLocation || isLoading}
      className="flex items-center gap-2 rounded-full"
    >
      {gettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
      Use My Location
    </Button>
  )
}
