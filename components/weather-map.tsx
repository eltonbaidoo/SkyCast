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
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <LoadingMap />
  }

  if (mapError) {
    return <ErrorMap error={mapError} {...props} />
  }

  return <ClientSideMap {...props} onError={setMapError} />
}

// Loading component
function LoadingMap() {
  return (
    <Card className="h-[400px] flex items-center justify-center rounded-[2rem] overflow-hidden glass-card">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-weather-blue border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading map...</p>
      </div>
    </Card>
  )
}

// Error fallback component
function ErrorMap({ error, lat, lon, city, country }: WeatherMapProps & { error: string }) {
  return (
    <Card className="overflow-hidden border-2 border-weather-blue/20 shadow-lg rounded-[2rem] glass-card">
      <div className="h-[400px] w-full relative">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.1}%2C${lat - 0.1}%2C${lon + 0.1}%2C${lat + 0.1}&amp;layer=mapnik&amp;marker=${lat}%2C${lon}`}
          style={{ border: 0, borderRadius: "1.5rem" }}
          title={`Map of ${city}, ${country}`}
        ></iframe>
        <div className="absolute bottom-0 right-0 bg-white p-2 text-xs rounded-tl-2xl">
          <a
            href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=12/${lat}/${lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            View Larger Map
          </a>
        </div>
      </div>
    </Card>
  )
}

// Client-side map component with better error handling
function ClientSideMap({
  city,
  country,
  lat,
  lon,
  temp,
  description,
  icon,
  isFahrenheit,
  onError,
}: WeatherMapProps & { onError: (error: string) => void }) {
  const [MapComponents, setMapComponents] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadMap = async () => {
      try {
        // Check if we're in a browser environment
        if (typeof window === "undefined") {
          throw new Error("Not in browser environment")
        }

        // Dynamic imports with error handling
        const [L, ReactLeaflet] = await Promise.all([
          import("leaflet").catch(() => {
            throw new Error("Failed to load Leaflet")
          }),
          import("react-leaflet").catch(() => {
            throw new Error("Failed to load React-Leaflet")
          }),
        ])

        if (!isMounted) return

        const { MapContainer, TileLayer, Marker, Popup } = ReactLeaflet

        // Fix Leaflet icon issue
        if (L.Icon?.Default?.prototype) {
          delete L.Icon.Default.prototype._getIconUrl
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          })
        }

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

        if (isMounted) {
          setMapComponents({
            L,
            MapContainer,
            TileLayer,
            Marker,
            Popup,
            weatherIcon,
          })
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error loading map components:", error)
        if (isMounted) {
          onError(error.message || "Failed to load map")
          setIsLoading(false)
        }
      }
    }

    loadMap()

    // Load Leaflet CSS
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    link.onerror = () => {
      console.error("Failed to load Leaflet CSS")
    }
    document.head.appendChild(link)

    return () => {
      isMounted = false
      try {
        document.head.removeChild(link)
      } catch (e) {
        // Link might already be removed
      }
    }
  }, [icon, description, onError])

  if (isLoading) {
    return <LoadingMap />
  }

  if (!MapComponents) {
    return (
      <ErrorMap
        error="Failed to load map components"
        city={city}
        country={country}
        lat={lat}
        lon={lon}
        temp={temp}
        description={description}
        icon={icon}
        isFahrenheit={isFahrenheit}
      />
    )
  }

  const { MapContainer, TileLayer, Marker, Popup, weatherIcon } = MapComponents
  const position: [number, number] = [lat, lon]

  try {
    return (
      <Card className="overflow-hidden border-2 border-weather-blue/20 shadow-lg rounded-[2rem] glass-card">
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
  } catch (error) {
    console.error("Error rendering map:", error)
    return (
      <ErrorMap
        error="Failed to render map"
        city={city}
        country={country}
        lat={lat}
        lon={lon}
        temp={temp}
        description={description}
        icon={icon}
        isFahrenheit={isFahrenheit}
      />
    )
  }
}

export default WeatherMap
