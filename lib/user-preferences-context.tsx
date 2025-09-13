"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import {
  getPreferences,
  savePreferences,
  getFavorites,
  saveFavorite,
  deleteFavorite,
} from "@/app/actions/user-preferences"
import type { UserPreferences, Favorite } from "./database"
import { useToast } from "@/hooks/use-toast"

interface UserPreferencesContextType {
  preferences: UserPreferences | null
  favorites: Favorite[]
  isLoading: boolean
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<void>
  addFavorite: (favorite: Omit<Favorite, "id" | "user_id" | "created_at">) => Promise<void>
  removeFavorite: (favoriteId: string) => Promise<void>
  refreshData: () => Promise<void>
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined)

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshData = async () => {
    if (!user) {
      setPreferences(null)
      setFavorites([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const [prefsData, favoritesData] = await Promise.all([getPreferences(), getFavorites()])

      setPreferences(prefsData)
      setFavorites(favoritesData)
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast({
        title: "Error",
        description: "Failed to load user preferences",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return

    try {
      const result = await savePreferences(newPreferences)

      if (result.success) {
        // Optimistically update local state
        setPreferences((prev) => (prev ? { ...prev, ...newPreferences } : null))
        toast({
          title: "Settings saved",
          description: "Your preferences have been updated successfully",
        })
      } else {
        throw new Error(result.error || "Failed to save preferences")
      }
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      })
    }
  }

  const addFavorite = async (favorite: Omit<Favorite, "id" | "user_id" | "created_at">) => {
    if (!user) return

    try {
      const result = await saveFavorite(favorite)

      if (result.success) {
        // Refresh favorites to get the new one with proper ID
        const updatedFavorites = await getFavorites()
        setFavorites(updatedFavorites)
        toast({
          title: "Location saved",
          description: `${favorite.city_name} has been added to your favorites`,
        })
      } else {
        throw new Error(result.error || "Failed to add favorite")
      }
    } catch (error) {
      console.error("Error adding favorite:", error)
      toast({
        title: "Error",
        description: "Failed to add location to favorites",
        variant: "destructive",
      })
    }
  }

  const removeFavorite = async (favoriteId: string) => {
    if (!user) return

    try {
      const result = await deleteFavorite(favoriteId)

      if (result.success) {
        // Optimistically remove from local state
        setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId))
        toast({
          title: "Location removed",
          description: "Location has been removed from your favorites",
        })
      } else {
        throw new Error(result.error || "Failed to remove favorite")
      }
    } catch (error) {
      console.error("Error removing favorite:", error)
      toast({
        title: "Error",
        description: "Failed to remove location from favorites",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (!authLoading) {
      refreshData()
    }
  }, [user, authLoading])

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        favorites,
        isLoading: isLoading || authLoading,
        updatePreferences,
        addFavorite,
        removeFavorite,
        refreshData,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  )
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (context === undefined) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider")
  }
  return context
}
