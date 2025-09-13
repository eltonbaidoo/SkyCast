"use client"

import { useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getMapEmbedUrl, reverseGeocode } from "@/app/actions/maps"

interface WeatherMapProps {
  city: string
  country: string
  lat: number
  lon: number
  temp: number
  description: string
  icon: string
  isFahrenheit: boolean
  onLocationSelect?: (lat: number, lon: number, address?: string) => void
}

export function WeatherMap({
  lat,
  lon,
  city,
  country,
  temp,
  description,
  icon,
  isFahrenheit,
  onLocationSelect,
}: WeatherMapProps) {
  const [embedUrl, setEmbedUrl] = useState<string>("")
  const [directUrl, setDirectUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    const loadMapData = async () => {
      try {
        setIsLoading(true)
        setError("")

        if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
          throw new Error("Invalid coordinates")
        }

        const mapData = await getMapEmbedUrl(lat, lon, city, country)
        setEmbedUrl(mapData.embedUrl)
        setDirectUrl(mapData.directUrl)
      } catch (err) {
        console.error("Map loading error:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to load map"
        setError(errorMessage)

        toast({
          title: "Map Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadMapData()
  }, [lat, lon, city, country, toast])

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Getting Location",
      description: "Please allow location access...",
    })

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude
        const userLon = position.coords.longitude

        try {
          const address = await reverseGeocode(userLat, userLon)

          if (onLocationSelect) {
            onLocationSelect(userLat, userLon, address)
          }

          toast({
            title: "Location Found",
            description: `Getting weather for ${address}`,
          })
        } catch (error) {
          console.error("Reverse geocoding error:", error)
          if (onLocationSelect) {
            onLocationSelect(userLat, userLon, "Your Location")
          }

          toast({
            title: "Location Found",
            description: "Getting weather for your location",
          })
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        let errorMessage = "Unable to get your location"

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out"
            break
        }

        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    )
  }, [onLocationSelect, toast])

  if (isLoading) {
    return (
      <Card className="h-[400px] flex items-center justify-center rounded-[2rem] overflow-hidden">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-weather-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading interactive map...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-[400px] flex items-center justify-center rounded-[2rem] overflow-hidden border-2 border-red-200">
        <div className="text-center text-red-600">
          <p className="font-semibold">Map Loading Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-2 border-weather-blue/20 shadow-lg rounded-[2rem]">
      <div className="h-[400px] w-full relative">
        {embedUrl ? (
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src={embedUrl}
            style={{ border: 0, borderRadius: "1.5rem" }}
            title={`Map of ${city}, ${country}`}
            loading="lazy"
            onError={() => {
              setError("Failed to load map iframe")
              toast({
                title: "Map Display Error",
                description: "Unable to display the map",
                variant: "destructive",
              })
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-[1.5rem]">
            <p className="text-gray-500">Map unavailable</p>
          </div>
        )}

        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button size="sm" variant="secondary" onClick={getUserLocation} className="glass-button">
            <Navigation className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => window.open(directUrl, "_blank")}
            className="glass-button"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-weather-blue/20 max-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <img src={`https://openweathermap.org/img/wn/${icon}@2x.png`} alt={description} className="w-10 h-10" />
            <div>
              <div className="flex items-center gap-1 text-xs font-medium">
                <MapPin className="h-3 w-3 text-blue-500" />
                <span className="truncate">
                  {city}, {country}
                </span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {isFahrenheit ? `${Math.round((temp * 9) / 5 + 32)}°F` : `${Math.round(temp)}°C`}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 capitalize mb-1">{description}</div>
          <div className="text-xs text-gray-500">
            {lat.toFixed(2)}, {lon.toFixed(2)}
          </div>
        </div>

        <div className="absolute bottom-4 right-4">
          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg border border-weather-blue/20"
          >
            View on Google Maps
          </a>
        </div>
      </div>
    </Card>
  )
}

export default WeatherMap
