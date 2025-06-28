"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

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
    // This will only run on the client
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

  // We'll render the actual map content in a separate component
  return <ClientSideMap {...props} />
}

// This component will only be rendered on the client
function ClientSideMap({ city, country, lat, lon, temp, description, icon, isFahrenheit }: WeatherMapProps) {
  // Import Leaflet and React-Leaflet dynamically
  const [MapComponents, setMapComponents] = useState<any>(null)

  useEffect(() => {
    // Dynamically import Leaflet and React-Leaflet
    const loadMap = async () => {
      try {
        const L = await import("leaflet")
        const { MapContainer, TileLayer, Marker, Popup } = await import("react-leaflet")

        // Fix Leaflet icon issue
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        })

        // Create a custom weather icon
        const weatherIcon = L.divIcon({
          html: `
            <div class="weather-icon-container">
              <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" class="weather-icon" />
            </div>
          `,
          className: "weather-marker",
          iconSize: [50, 50],
          iconAnchor: [25, 25],
        })

        setMapComponents({
          L,
          MapContainer,
          TileLayer,
          Marker,
          Popup,
          weatherIcon,
        })
      } catch (error) {
        console.error("Error loading map components:", error)
      }
    }

    loadMap()

    // Import Leaflet CSS
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    document.head.appendChild(link)

    return () => {
      // Clean up
      document.head.removeChild(link)
    }
  }, [icon, description])

  if (!MapComponents) {
    return (
      <Card className="h-[400px] flex items-center justify-center rounded-[2rem] overflow-hidden">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-weather-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading map components...</p>
        </div>
      </Card>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup, weatherIcon } = MapComponents
  const position: [number, number] = [lat, lon]

  return (
    <Card className="overflow-hidden border-2 border-weather-blue/20 shadow-lg rounded-[2rem]">
      <div className="h-[400px] w-full relative">
        <style jsx global>{`
          .weather-icon-container {
            background-color: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            padding: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          }
          .weather-icon {
            width: 40px;
            height: 40px;
          }
          .leaflet-container {
            height: 100%;
            width: 100%;
            z-index: 1;
            border-radius: 1.5rem;
          }
          .leaflet-popup-content-wrapper {
            border-radius: 1rem;
          }
          .leaflet-popup-tip {
            border-radius: 50%;
          }
        `}</style>
        <MapContainer
          center={position}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={weatherIcon}>
            <Popup>
              <div className="text-center">
                <div className="font-bold">
                  {city}, {country}
                </div>
                <div className="text-lg">
                  {isFahrenheit ? `${Math.round((temp * 9) / 5 + 32)}°F` : `${Math.round(temp)}°C`}
                </div>
                <div className="capitalize">{description}</div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </Card>
  )
}

export default WeatherMap
