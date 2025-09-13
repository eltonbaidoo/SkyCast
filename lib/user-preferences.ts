import { sql } from "./db"

export interface UserPreferences {
  id: string
  user_id: string
  temperature_unit: "celsius" | "fahrenheit"
  notifications_enabled: boolean
  auto_location: boolean
  refresh_interval: number
  theme: "light" | "dark" | "system"
  created_at: string
  updated_at: string
}

export interface UserLocation {
  id: string
  user_id: string
  name: string
  lat: number
  lon: number
  country?: string
  is_current: boolean
  created_at: string
  updated_at: string
}

export interface Favorite {
  id: string
  user_id: string
  city_name: string
  lat: number
  lon: number
  country?: string
  created_at: string
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const result = await sql`
      SELECT * FROM user_preferences WHERE user_id = ${userId}
    `

    if (result.length === 0) {
      // Create default preferences if none exist
      return await createDefaultPreferences(userId)
    }

    return result[0] as UserPreferences
  } catch (error) {
    console.error("Error getting user preferences:", error)
    return null
  }
}

export async function createDefaultPreferences(userId: string): Promise<UserPreferences> {
  const now = new Date().toISOString()

  const result = await sql`
    INSERT INTO user_preferences (user_id, created_at, updated_at)
    VALUES (${userId}, ${now}, ${now})
    ON CONFLICT (user_id) DO UPDATE SET updated_at = ${now}
    RETURNING *
  `

  return result[0] as UserPreferences
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<Omit<UserPreferences, "id" | "user_id" | "created_at" | "updated_at">>,
): Promise<UserPreferences | null> {
  try {
    const now = new Date().toISOString()

    const result = await sql`
      UPDATE user_preferences 
      SET 
        temperature_unit = COALESCE(${preferences.temperature_unit}, temperature_unit),
        notifications_enabled = COALESCE(${preferences.notifications_enabled}, notifications_enabled),
        auto_location = COALESCE(${preferences.auto_location}, auto_location),
        refresh_interval = COALESCE(${preferences.refresh_interval}, refresh_interval),
        theme = COALESCE(${preferences.theme}, theme),
        updated_at = ${now}
      WHERE user_id = ${userId}
      RETURNING *
    `

    return result.length > 0 ? (result[0] as UserPreferences) : null
  } catch (error) {
    console.error("Error updating user preferences:", error)
    return null
  }
}

export async function getUserLocations(userId: string): Promise<UserLocation[]> {
  try {
    const result = await sql`
      SELECT * FROM user_locations 
      WHERE user_id = ${userId}
      ORDER BY is_current DESC, created_at DESC
    `

    return result as UserLocation[]
  } catch (error) {
    console.error("Error getting user locations:", error)
    return []
  }
}

export async function saveUserLocation(
  userId: string,
  name: string,
  lat: number,
  lon: number,
  country?: string,
  isCurrent = false,
): Promise<UserLocation | null> {
  try {
    const now = new Date().toISOString()

    // If this is the current location, unset other current locations
    if (isCurrent) {
      await sql`
        UPDATE user_locations 
        SET is_current = false 
        WHERE user_id = ${userId}
      `
    }

    const result = await sql`
      INSERT INTO user_locations (user_id, name, lat, lon, country, is_current, created_at, updated_at)
      VALUES (${userId}, ${name}, ${lat}, ${lon}, ${country}, ${isCurrent}, ${now}, ${now})
      RETURNING *
    `

    return result[0] as UserLocation
  } catch (error) {
    console.error("Error saving user location:", error)
    return null
  }
}

export async function getUserFavorites(userId: string): Promise<Favorite[]> {
  try {
    const result = await sql`
      SELECT * FROM favorites 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    return result as Favorite[]
  } catch (error) {
    console.error("Error getting user favorites:", error)
    return []
  }
}

export async function addFavorite(
  userId: string,
  cityName: string,
  lat: number,
  lon: number,
  country?: string,
): Promise<Favorite | null> {
  try {
    const now = new Date().toISOString()

    // Check if already exists
    const existing = await sql`
      SELECT id FROM favorites 
      WHERE user_id = ${userId} AND city_name = ${cityName}
    `

    if (existing.length > 0) {
      throw new Error("Location already in favorites")
    }

    const result = await sql`
      INSERT INTO favorites (user_id, city_name, lat, lon, country, created_at)
      VALUES (${userId}, ${cityName}, ${lat}, ${lon}, ${country}, ${now})
      RETURNING *
    `

    return result[0] as Favorite
  } catch (error) {
    console.error("Error adding favorite:", error)
    return null
  }
}

export async function removeFavorite(userId: string, favoriteId: string): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM favorites 
      WHERE id = ${favoriteId} AND user_id = ${userId}
    `

    return result.count > 0
  } catch (error) {
    console.error("Error removing favorite:", error)
    return false
  }
}
