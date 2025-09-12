"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Wrapper } from "@googlemaps/react-wrapper"
import type { google } from "google-maps"

// Define the props interface
interface WeatherMapProps {
  city: string
  country: string
  lat: number
  lon: number
  temp: number
  description: string
  icon: string
  isFahrenheit: boolean
}

// Google Maps component
function GoogleMapComponent({ lat, lon, city, country, temp, description, icon, isFahrenheit }: WeatherMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)

  useEffect(() => {
    if (!mapRef.current || !window.google) return

    // Initialize the map
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng: lon },
      zoom: 10,
      styles: [
        {
          featureType: "all",
          elementType: "geometry.fill",
          stylers: [{ color: "#f8fafc" }],
        },
        {
          featureType: "water",
          elementType: "geometry.fill",
          stylers: [{ color: "#4dd3f7" }],
        },
      ],
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    })

    setMap(mapInstance)

    // Create custom weather marker
    const weatherMarker = new window.google.maps.Marker({
      position: { lat, lng: lon },
      map: mapInstance,
      title: `${city}, ${country}`,
      icon: {
        url: `https://openweathermap.org/img/wn/${icon}@2x.png`,
        scaledSize: new window.google.maps.Size(50, 50),
        anchor: new window.google.maps.Point(25, 25),
      },
    })

    // Create info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="text-align: center; padding: 10px; font-family: system-ui;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">
            ${city}, ${country}
          </div>
          <div style="font-size: 18px; font-weight: bold; color: #0ea5e9; margin-bottom: 5px;">
            ${isFahrenheit ? `${Math.round((temp * 9) / 5 + 32)}°F` : `${Math.round(temp)}°C`}
          </div>
          <div style="text-transform: capitalize; color: #64748b;">
            ${description}
          </div>
        </div>
      `,
    })

    // Add click listener to marker
    weatherMarker.addListener("click", () => {
      infoWindow.open(mapInstance, weatherMarker)
    })

    setMarker(weatherMarker)

    // Cleanup function
    return () => {
      if (weatherMarker) {
        weatherMarker.setMap(null)
      }
    }
  }, [lat, lon, city, country, temp, description, icon, isFahrenheit])

  return <div ref={mapRef} style={{ width: "100%", height: "400px", borderRadius: "1.5rem" }} />
}

export function WeatherMap(props: WeatherMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <Card className="h-[400px] flex items-center justify-center rounded-[2rem] overflow-hidden">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-weather-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading map...</p>
        </div>
      </Card>
    )
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return (
      <Card className="h-[400px] flex items-center justify-center rounded-[2rem] overflow-hidden border-2 border-red-200">
        <div className="text-center text-red-600">
          <p className="font-semibold">Google Maps API Key Required</p>
          <p className="text-sm">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-2 border-weather-blue/20 shadow-lg rounded-[2rem]">
      <div className="h-[400px] w-full relative">
        <Wrapper apiKey={apiKey}>
          <GoogleMapComponent {...props} />
        </Wrapper>
      </div>
    </Card>
  )
}

export default WeatherMap
