"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Wrapper } from "@googlemaps/react-wrapper"
import * as google from "google.maps"

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
      <Card className="h-[400px] flex items-center justify-center rounded-[2rem] overflow-hidden">
        <div className="text-center">
          <p className="text-red-500">Google Maps API key not configured</p>
          <p className="text-sm text-muted-foreground">
            Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-2 border-weather-blue/20 shadow-lg rounded-[2rem]">
      <div className="h-[400px] w-full relative">
        <Wrapper apiKey={apiKey} libraries={["marker"]}>
          <GoogleMapComponent {...props} />
        </Wrapper>
      </div>
    </Card>
  )
}

function GoogleMapComponent({ city, country, lat, lon, temp, description, icon, isFahrenheit }: WeatherMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null)

  useEffect(() => {
    if (!mapRef.current || !window.google) return

    // Initialize the map
    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat, lng: lon },
      zoom: 10,
      mapId: "weather-map", // Required for Advanced Markers
      styles: [
        {
          featureType: "all",
          elementType: "geometry.fill",
          stylers: [{ color: "#f5f5f5" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#4dd3f7" }],
        },
      ],
    })

    setMap(mapInstance)

    // Create custom weather marker
    const weatherMarkerElement = document.createElement("div")
    weatherMarkerElement.innerHTML = `
      <div style="
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        padding: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        border: 2px solid #4dd3f7;
      ">
        <img 
          src="https://openweathermap.org/img/wn/${icon}@2x.png" 
          alt="${description}"
          style="width: 40px; height: 40px; display: block;"
        />
      </div>
    `

    // Create Advanced Marker
    const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
      map: mapInstance,
      position: { lat, lng: lon },
      content: weatherMarkerElement,
      title: `${city}, ${country}`,
    })

    // Create info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="text-align: center; padding: 10px;">
          <div style="font-weight: bold; margin-bottom: 5px;">
            ${city}, ${country}
          </div>
          <div style="font-size: 18px; margin-bottom: 5px;">
            ${isFahrenheit ? `${Math.round((temp * 9) / 5 + 32)}°F` : `${Math.round(temp)}°C`}
          </div>
          <div style="text-transform: capitalize;">
            ${description}
          </div>
        </div>
      `,
    })

    // Add click listener to marker
    advancedMarker.addListener("click", () => {
      infoWindow.open(mapInstance, advancedMarker)
    })

    setMarker(advancedMarker)

    return () => {
      if (marker) {
        marker.map = null
      }
    }
  }, [lat, lon, city, country, temp, description, icon, isFahrenheit])

  return (
    <div
      ref={mapRef}
      style={{
        height: "100%",
        width: "100%",
        borderRadius: "1.5rem",
      }}
    />
  )
}

export default WeatherMap
