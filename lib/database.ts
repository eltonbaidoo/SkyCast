import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface UserPreferences {
  id: string
  user_id: string
  temperature_unit: "celsius" | "fahrenheit"
  notifications_enabled: boolean
  auto_location: boolean
  refresh_interval: number
  theme: "light" | "dark" | "system"
  default_location?: {
    lat: number
    lon: number
    city: string
    country: string
  }
  created_at: string
  updated_at: string
}

export interface Favorite {
  id: string
  user_id: string
  city_name: string
  country: string
  lat: number
  lon: number
  created_at: string
}

export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

// User Preferences Operations
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const result = await sql`
      SELECT * FROM user_preferences 
      WHERE user_id = ${userId}
      LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error fetching user preferences:", error)
    return null
  }
}

export async function createUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>,
): Promise<UserPreferences | null> {
  try {
    const result = await sql`
      INSERT INTO user_preferences (
        user_id, 
        temperature_unit, 
        notifications_enabled, 
        auto_location, 
        refresh_interval, 
        theme, 
        default_location
      )
      VALUES (
        ${userId},
        ${preferences.temperature_unit || "celsius"},
        ${preferences.notifications_enabled ?? true},
        ${preferences.auto_location ?? true},
        ${preferences.refresh_interval || 300000},
        ${preferences.theme || "system"},
        ${preferences.default_location ? JSON.stringify(preferences.default_location) : null}
      )
      RETURNING *
    `
    return result[0] || null
  } catch (error) {
    console.error("Error creating user preferences:", error)
    return null
  }
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>,
): Promise<UserPreferences | null> {
  try {
    const result = await sql`
      UPDATE user_preferences 
      SET 
        temperature_unit = COALESCE(${preferences.temperature_unit}, temperature_unit),
        notifications_enabled = COALESCE(${preferences.notifications_enabled}, notifications_enabled),
        auto_location = COALESCE(${preferences.auto_location}, auto_location),
        refresh_interval = COALESCE(${preferences.refresh_interval}, refresh_interval),
        theme = COALESCE(${preferences.theme}, theme),
        default_location = COALESCE(${preferences.default_location ? JSON.stringify(preferences.default_location) : null}, default_location),
        updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING *
    `
    return result[0] || null
  } catch (error) {
    console.error("Error updating user preferences:", error)
    return null
  }
}

// Favorites Operations
export async function getUserFavorites(userId: string): Promise<Favorite[]> {
  try {
    const result = await sql`
      SELECT * FROM favorites 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return result as Favorite[]
  } catch (error) {
    console.error("Error fetching user favorites:", error)
    return []
  }
}

export async function addFavorite(
  userId: string,
  favorite: Omit<Favorite, "id" | "user_id" | "created_at">,
): Promise<Favorite | null> {
  try {
    const result = await sql`
      INSERT INTO favorites (user_id, city_name, country, lat, lon)
      VALUES (${userId}, ${favorite.city_name}, ${favorite.country}, ${favorite.lat}, ${favorite.lon})
      RETURNING *
    `
    return result[0] || null
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
    return result.length > 0
  } catch (error) {
    console.error("Error removing favorite:", error)
    return false
  }
}

// User Operations
export async function getUser(userId: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, name, created_at, updated_at 
      FROM users_sync 
      WHERE id = ${userId}
      LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function createUser(email: string, name: string): Promise<User | null> {
  try {
    const result = await sql`
      INSERT INTO users_sync (email, name)
      VALUES (${email}, ${name})
      RETURNING id, email, name, created_at, updated_at
    `

    // Create default preferences for new user
    if (result[0]) {
      await createUserPreferences(result[0].id, {})
    }

    return result[0] || null
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}
