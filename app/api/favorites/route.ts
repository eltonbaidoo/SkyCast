import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware-set headers
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const favorites = await sql`
      SELECT id, city_name, country, lat, lon, created_at
      FROM favorites 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const { cityName, country, lat, lon } = await request.json()

    if (!cityName || !country || lat === undefined || lon === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if favorite already exists
    const existing = await sql`
      SELECT id FROM favorites 
      WHERE user_id = ${userId} AND city_name = ${cityName} AND country = ${country}
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: "Location already in favorites" }, { status: 409 })
    }

    const result = await sql`
      INSERT INTO favorites (user_id, city_name, country, lat, lon)
      VALUES (${userId}, ${cityName}, ${country}, ${lat}, ${lon})
      RETURNING id, city_name, country, lat, lon, created_at
    `

    return NextResponse.json({ favorite: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Error adding favorite:", error)
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const favoriteId = searchParams.get("id")

    if (!favoriteId) {
      return NextResponse.json({ error: "Favorite ID required" }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM favorites 
      WHERE id = ${favoriteId} AND user_id = ${userId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Favorite not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting favorite:", error)
    return NextResponse.json({ error: "Failed to delete favorite" }, { status: 500 })
  }
}
