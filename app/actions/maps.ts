"use server"

import { verifyToken } from "@/lib/jwt"
import { cookies } from "next/headers"

interface MapEmbedData {
  embedUrl: string
  directUrl: string
}

export async function getMapEmbedUrl(lat: number, lon: number, city: string, country: string): Promise<MapEmbedData> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    throw new Error("Google Maps API key not configured")
  }

  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lon}&zoom=10&maptype=roadmap`
  const directUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`

  return {
    embedUrl,
    directUrl,
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`
  }

  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`)

    if (!response.ok) {
      throw new Error("Geocoding failed")
    }

    const data = await response.json()

    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address
    }

    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`
  } catch (error) {
    console.error("Reverse geocoding error:", error)
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`
  }
}

export async function validateMapAccess(): Promise<boolean> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return false
    }

    const payload = await verifyToken(token)
    return !!payload
  } catch {
    return false
  }
}
