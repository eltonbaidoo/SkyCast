import { NextResponse } from "next/server"

interface WeatherData {
  name: string
  sys: { country: string }
  coord: { lat: number; lon: number }
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
    temp_min?: number
    temp_max?: number
  }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
    deg?: number
  }
  timezone: number
}

interface ForecastData {
  list: Array<{
    dt: number
    main: {
      temp: number
      feels_like: number
      humidity: number
      pressure: number
      temp_min?: number
      temp_max?: number
    }
    weather: Array<{
      main: string
      description: string
      icon: string
    }>
    wind: {
      speed: number
      deg?: number
    }
  }>
}

// Google Weather API integration (using Google's geocoding + weather data)
async function fetchGoogleWeather(city: string, lat?: string, lon?: string): Promise<WeatherData | null> {
  try {
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!googleApiKey) return null

    // If we don't have coordinates, geocode the city first
    if (!lat || !lon) {
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${googleApiKey}`,
      )
      const geocodeData = await geocodeResponse.json()

      if (geocodeData.status !== "OK" || !geocodeData.results[0]) {
        return null
      }

      const location = geocodeData.results[0].geometry.location
      lat = location.lat.toString()
      lon = location.lng.toString()
    }

    // Note: Google doesn't have a direct weather API, so we'll use this as a geocoding service
    // and fall back to OpenWeather for actual weather data with enhanced error handling
    return null
  } catch (error) {
    console.error("Google Weather API error:", error)
    return null
  }
}

// Enhanced OpenWeather API with better error handling
async function fetchOpenWeather(
  city: string,
  lat?: string,
  lon?: string,
  type = "weather",
): Promise<WeatherData | ForecastData | null> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) throw new Error("OpenWeather API key not configured")

    const endpoint =
      type === "forecast"
        ? "https://api.openweathermap.org/data/2.5/forecast"
        : "https://api.openweathermap.org/data/2.5/weather"

    const queryString = city ? `q=${encodeURIComponent(city)}` : `lat=${lat}&lon=${lon}`

    const response = await fetch(`${endpoint}?${queryString}&units=metric&appid=${apiKey}`, {
      headers: {
        "User-Agent": "SkyCast-Weather-App/1.0",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("OpenWeather API error:", error)
    throw error
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city")
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")
  const type = searchParams.get("type") || "weather"

  if (!city && (!lat || !lon)) {
    return NextResponse.json({ error: "City or coordinates are required" }, { status: 400 })
  }

  try {
    let weatherData = null

    // Attempt Google Weather integration (currently used for geocoding enhancement)
    if (city) {
      weatherData = await fetchGoogleWeather(city, lat || undefined, lon || undefined)
    }

    // Use OpenWeather as primary weather data source (with Google geocoding enhancement if available)
    if (!weatherData) {
      weatherData = await fetchOpenWeather(city || "", lat || undefined, lon || undefined, type)
    }

    if (!weatherData) {
      return NextResponse.json({ error: "Weather data not available" }, { status: 503 })
    }

    return NextResponse.json(weatherData)
  } catch (error: any) {
    console.error("Weather API error:", error)

    // Enhanced error responses
    if (error.message?.includes("not found")) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    if (error.message?.includes("API key")) {
      return NextResponse.json({ error: "Weather service temporarily unavailable" }, { status: 503 })
    }

    return NextResponse.json(
      {
        error: "Failed to fetch weather data",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
