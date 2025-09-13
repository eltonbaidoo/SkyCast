"use client"

import type React from "react"

import { useState } from "react"
import { Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUserPreferences } from "@/lib/user-preferences-context"
import { useAuth } from "@/lib/auth-context"

interface FavoritesProps {
  currentCity: string
  onSelectCity: (city: string) => void
}

export function Favorites({ currentCity, onSelectCity }: FavoritesProps) {
  const { user } = useAuth()
  const { favorites, addFavorite, removeFavorite } = useUserPreferences()
  const [isOpen, setIsOpen] = useState(false)

  const favoriteNames = favorites.map((fav) => fav.city_name)

  const addToFavorites = async () => {
    if (currentCity && !favoriteNames.includes(currentCity) && user) {
      // For now, we'll add with basic data - ideally we'd have lat/lon from weather data
      await addFavorite({
        city_name: currentCity,
        country: "", // Would need to get this from weather data
        lat: 0, // Would need to get this from weather data
        lon: 0, // Would need to get this from weather data
      })
    }
  }

  const removeFromFavorites = async (city: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (user) {
      const favoriteToRemove = favorites.find((fav) => fav.city_name === city)
      if (favoriteToRemove) {
        await removeFavorite(favoriteToRemove.id)
      }
    }
  }

  const isFavorite = currentCity && favoriteNames.includes(currentCity)

  if (!user) {
    return null
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Button
          variant={isFavorite ? "default" : "outline"}
          size="icon"
          onClick={addToFavorites}
          disabled={!currentCity || isFavorite}
          title={isFavorite ? "Already in favorites" : "Add to favorites"}
          className={
            isFavorite ? "bg-amber-400 hover:bg-amber-500 text-black border-none glass-button" : "glass-button"
          }
        >
          <Star className={`h-4 w-4 ${isFavorite ? "fill-black" : ""}`} />
        </Button>

        {favorites.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs rounded-full glass-button"
          >
            {isOpen ? "Hide Favorites" : `Favorites (${favorites.length})`}
          </Button>
        )}
      </div>

      {isOpen && favorites.length > 0 && (
        <Card className="absolute right-0 mt-2 p-2 z-10 w-64 sm:w-72 shadow-lg rounded-2xl glass-card">
          <ScrollArea className="max-h-60">
            <div className="space-y-1">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  onClick={() => {
                    onSelectCity(favorite.city_name)
                    setIsOpen(false)
                  }}
                  className={`flex items-center justify-between p-2 sm:p-3 rounded-xl cursor-pointer transition-all duration-150 ease-out hover:shadow-lg ${
                    favorite.city_name === currentCity
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/80 bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm"
                  }`}
                >
                  <span className="truncate text-sm sm:text-base">{favorite.city_name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => removeFromFavorites(favorite.city_name, e)}
                    className="h-6 w-6 ml-2 hover:bg-red-100 hover:text-red-500 rounded-full flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  )
}
