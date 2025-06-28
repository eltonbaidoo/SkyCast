import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city")
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")
  const type = searchParams.get("type") || "weather" // weather or forecast

  if (!city && (!lat || !lon)) {
    return NextResponse.json({ error: "City or coordinates are required" }, { status: 400 })
  }

  const apiKey = process.env.OPENWEATHER_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  try {
    const endpoint =
      type === "forecast"
        ? "https://api.openweathermap.org/data/2.5/forecast"
        : "https://api.openweathermap.org/data/2.5/weather"

    // Build the query string based on whether we have city or coordinates
    const queryString = city ? `q=${encodeURIComponent(city)}` : `lat=${lat}&lon=${lon}`

    const response = await fetch(`${endpoint}?${queryString}&units=metric&appid=${apiKey}`)

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch weather data" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}
