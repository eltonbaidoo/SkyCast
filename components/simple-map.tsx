"use client"

import { Card } from "@/components/ui/card"

interface SimpleMapProps {
  city: string
  country: string
  lat: number
  lon: number
  temp: number
  description: string
  isFahrenheit: boolean
}

export function SimpleMap({ city, country, lat, lon, temp, description, isFahrenheit }: SimpleMapProps) {
  const temperature = isFahrenheit ? `${Math.round((temp * 9) / 5 + 32)}°F` : `${Math.round(temp)}°C`

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
          loading="lazy"
        />

        {/* Weather info overlay */}
        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <img
              src={`https://openweathermap.org/img/wn/${description.includes("clear") ? "01d" : description.includes("cloud") ? "02d" : description.includes("rain") ? "10d" : "01d"}@2x.png`}
              alt={description}
              className="w-12 h-12"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
            <div>
              <div className="font-bold text-lg">
                {city}, {country}
              </div>
              <div className="text-2xl font-bold text-weather-blue">{temperature}</div>
              <div className="text-sm text-muted-foreground capitalize">{description}</div>
            </div>
          </div>
        </div>

        {/* Link to full map */}
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-2">
          <a
            href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=12/${lat}/${lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:underline text-weather-blue hover:text-weather-teal transition-colors"
          >
            View Larger Map →
          </a>
        </div>
      </div>
    </Card>
  )
}

export default SimpleMap
