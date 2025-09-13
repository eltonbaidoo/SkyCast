"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { getMapEmbedUrl } from "@/app/actions/maps"

interface MapFallbackProps {
  lat: number
  lon: number
  city: string
  country: string
}

export function MapFallback({ lat, lon, city, country }: MapFallbackProps) {
  const [embedUrl, setEmbedUrl] = useState<string>("")
  const [directUrl, setDirectUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const loadMapData = async () => {
      try {
        setIsLoading(true)
        const mapData = await getMapEmbedUrl(lat, lon, city, country)
        setEmbedUrl(mapData.embedUrl)
        setDirectUrl(mapData.directUrl)
        setError("")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load map")
      } finally {
        setIsLoading(false)
      }
    }

    loadMapData()
  }, [lat, lon, city, country])

  if (isLoading) {
    return (
      <Card className="h-[400px] flex items-center justify-center rounded-[2rem] overflow-hidden">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-weather-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading map...</p>
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
        />
        <div className="absolute bottom-0 right-0 bg-white p-2 text-xs rounded-tl-2xl">
          <a href={directUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
            View on Google Maps
          </a>
        </div>
      </div>
    </Card>
  )
}

export default MapFallback
