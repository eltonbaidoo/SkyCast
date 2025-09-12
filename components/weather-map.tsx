"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Wrapper } from "@googlemaps/react-wrapper"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Layers } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import * as google from "google.maps"

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

function GoogleMapComponent({
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
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [userLocationMarker, setUserLocationMarker] = useState<google.maps.Marker | null>(null)
  const [mapType, setMapType] = useState<google.maps.MapTypeId>(google.maps.MapTypeId.ROADMAP)
  const { toast } = useToast()

  useEffect(() => {
    if (!mapRef.current) return

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat, lng: lon },
      zoom: 10,
      mapTypeId: mapType,
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
        {
          featureType: "landscape",
          elementType: "geometry.fill",
          stylers: [{ color: "#f1f5f9" }],
        },
      ],
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: "cooperative",
    })

    setMap(mapInstance)

    const weatherMarker = new google.maps.Marker({
      position: { lat, lng: lon },
      map: mapInstance,
      title: `${city}, ${country} - ${description}`,
      icon: {
        url: `https://openweathermap.org/img/wn/${icon}@2x.png`,
        scaledSize: new google.maps.Size(60, 60),
        anchor: new google.maps.Point(30, 30),
      },
      animation: google.maps.Animation.DROP,
    })

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="
          text-align: center; 
          padding: 15px; 
          font-family: system-ui; 
          min-width: 200px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 12px;
          border: 2px solid #4dd3f7;
        ">
          <div style="
            font-weight: bold; 
            font-size: 18px; 
            margin-bottom: 8px;
            color: #1e293b;
          ">
            📍 ${city}, ${country}
          </div>
          <div style="
            font-size: 24px; 
            font-weight: bold; 
            color: #0ea5e9; 
            margin-bottom: 8px;
          ">
            🌡️ ${isFahrenheit ? `${Math.round((temp * 9) / 5 + 32)}°F` : `${Math.round(temp)}°C`}
          </div>
          <div style="
            text-transform: capitalize; 
            color: #64748b;
            font-size: 14px;
            margin-bottom: 8px;
          ">
            ${description}
          </div>
          <div style="
            font-size: 12px;
            color: #94a3b8;
          ">
            📍 ${lat.toFixed(4)}, ${lon.toFixed(4)}
          </div>
        </div>
      `,
    })

    // Add click listener to marker
    weatherMarker.addListener("click", () => {
      infoWindow.open(mapInstance, weatherMarker)
    })

    mapInstance.addListener("click", async (event: google.maps.MapMouseEvent) => {
      if (event.latLng && onLocationSelect) {
        const clickedLat = event.latLng.lat()
        const clickedLon = event.latLng.lng()

        // Get address from coordinates using reverse geocoding
        try {
          const geocoder = new google.maps.Geocoder()
          const response = await geocoder.geocode({
            location: { lat: clickedLat, lng: clickedLon },
          })

          const address = response.results[0]?.formatted_address || `${clickedLat.toFixed(4)}, ${clickedLon.toFixed(4)}`
          onLocationSelect(clickedLat, clickedLon, address)

          toast({
            title: "Location Selected",
            description: `Getting weather for ${address}`,
          })
        } catch (error) {
          console.error("Geocoding error:", error)
          onLocationSelect(clickedLat, clickedLon)
        }
      }
    })

    setMarker(weatherMarker)

    return () => {
      if (weatherMarker) {
        weatherMarker.setMap(null)
      }
    }
  }, [lat, lon, city, country, temp, description, icon, isFahrenheit, mapType, onLocationSelect, toast])

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude
        const userLon = position.coords.longitude

        if (map) {
          map.setCenter({ lat: userLat, lng: userLon })
          map.setZoom(12)

          // Remove existing user location marker
          if (userLocationMarker) {
            userLocationMarker.setMap(null)
          }

          // Add new user location marker
          const newUserMarker = new google.maps.Marker({
            position: { lat: userLat, lng: userLon },
            map: map,
            title: "Your Location",
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#4285f4",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
            animation: google.maps.Animation.BOUNCE,
          })

          setUserLocationMarker(newUserMarker)

          // Stop bouncing after 2 seconds
          setTimeout(() => {
            newUserMarker.setAnimation(null)
          }, 2000)
        }

        if (onLocationSelect) {
          onLocationSelect(userLat, userLon, "Your Location")
        }

        toast({
          title: "Location Found",
          description: "Centered map on your location",
        })
      },
      (error) => {
        toast({
          title: "Location Error",
          description: "Unable to get your location",
          variant: "destructive",
        })
      },
    )
  }, [map, userLocationMarker, onLocationSelect, toast])

  return (
    <div className="relative">
      <div ref={mapRef} style={{ width: "100%", height: "400px", borderRadius: "1.5rem" }} />

      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button size="sm" variant="secondary" onClick={getUserLocation} className="glass-button">
          <Navigation className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            setMapType(
              mapType === google.maps.MapTypeId.ROADMAP
                ? google.maps.MapTypeId.SATELLITE
                : google.maps.MapTypeId.ROADMAP,
            )
          }
          className="glass-button"
        >
          <Layers className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-blue-500" />
          <span className="font-medium">
            {city}, {country}
          </span>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Click anywhere on the map to get weather for that location
        </div>
      </div>
    </div>
  )
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
          <p>Loading interactive map...</p>
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
        <Wrapper apiKey={apiKey} libraries={["geometry", "places"]}>
          <GoogleMapComponent {...props} />
        </Wrapper>
      </div>
    </Card>
  )
}

export default WeatherMap
