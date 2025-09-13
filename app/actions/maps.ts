"use server"

interface MapEmbedData {
  embedUrl: string
  directUrl: string
}

export async function getMapEmbedUrl(lat: number, lon: number, city: string, country: string): Promise<MapEmbedData> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    throw new Error("Google Maps API key not configured")
  }

  if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
    throw new Error("Invalid coordinates provided")
  }

  try {
    const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lon}&zoom=10&maptype=roadmap`
    const directUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`

    return {
      embedUrl,
      directUrl,
    }
  } catch (error) {
    console.error("Map embed URL generation error:", error)
    throw new Error("Failed to generate map URLs")
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`
  }

  if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
    return "Invalid coordinates"
  }

  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`)

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.status === "OK" && data.results && data.results.length > 0) {
      return data.results[0].formatted_address
    }

    if (data.status === "ZERO_RESULTS") {
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`
    }

    throw new Error(`Geocoding API error: ${data.status}`)
  } catch (error) {
    console.error("Reverse geocoding error:", error)
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`
  }
}
