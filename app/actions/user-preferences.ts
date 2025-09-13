"use server"

import {
  getUserPreferences,
  updateUserPreferences,
  createUserPreferences,
  getUserFavorites,
  addFavorite,
  removeFavorite,
  type UserPreferences,
  type Favorite,
} from "@/lib/database"
import { getCurrentUser } from "@/lib/auth"

export async function getPreferences(): Promise<UserPreferences | null> {
  try {
    const user = await getCurrentUser()
    if (!user) return null

    let preferences = await getUserPreferences(user.id)

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await createUserPreferences(user.id, {})
    }

    return preferences
  } catch (error) {
    console.error("Error getting preferences:", error)
    return null
  }
}

export async function savePreferences(
  preferences: Partial<UserPreferences>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const updated = await updateUserPreferences(user.id, preferences)

    if (!updated) {
      return { success: false, error: "Failed to update preferences" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error saving preferences:", error)
    return { success: false, error: "Internal server error" }
  }
}

export async function getFavorites(): Promise<Favorite[]> {
  try {
    const user = await getCurrentUser()
    if (!user) return []

    return await getUserFavorites(user.id)
  } catch (error) {
    console.error("Error getting favorites:", error)
    return []
  }
}

export async function saveFavorite(
  favorite: Omit<Favorite, "id" | "user_id" | "created_at">,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const added = await addFavorite(user.id, favorite)

    if (!added) {
      return { success: false, error: "Failed to add favorite" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error saving favorite:", error)
    return { success: false, error: "Internal server error" }
  }
}

export async function deleteFavorite(favoriteId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const removed = await removeFavorite(user.id, favoriteId)

    if (!removed) {
      return { success: false, error: "Failed to remove favorite" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting favorite:", error)
    return { success: false, error: "Internal server error" }
  }
}
