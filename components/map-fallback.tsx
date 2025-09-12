"use client"

import { Card } from "@/components/ui/card"

interface MapFallbackProps {
  lat: number
  lon: number
  city: string
  country: string
}

export function MapFallback({ lat, lon, city, country }: MapFallbackProps) {
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
          src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${lat},${lon}&zoom=10`}
          style={{ border: 0, borderRadius: "1.5rem" }}
          title={`Map of ${city}, ${country}`}
        ></iframe>
        <div className="absolute bottom-0 right-0 bg-white p-2 text-xs rounded-tl-2xl">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            View in Google Maps
          </a>
        </div>
      </div>
    </Card>
  )
}

export default MapFallback
