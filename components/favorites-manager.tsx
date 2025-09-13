"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, MapPin, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { getFavorites, removeFromFavorites } from "@/app/actions/user-preferences"

interface Favorite {
  id: string
  user_id: string
  city_name: string
  lat: number
  lon: number
  country?: string
  created_at: string
}

interface FavoritesManagerProps {
  onLocationSelect?: (lat: number, lon: number, name: string) => void
}

export function FavoritesManager({ onLocationSelect }: FavoritesManagerProps) {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      const data = await getFavorites()
      setFavorites(data)
    } catch (error) {
      console.error("Error loading favorites:", error)
      toast.error("Failed to load favorites")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (favoriteId: string, cityName: string) => {
    try {
      const success = await removeFromFavorites(favoriteId)
      if (success) {
        setFavorites((prev) => prev.filter((f) => f.id !== favoriteId))
        toast.success(`Removed ${cityName} from favorites`)
      } else {
        toast.error("Failed to remove favorite")
      }
    } catch (error) {
      console.error("Error removing favorite:", error)
      toast.error("Failed to remove favorite")
    }
  }

  const handleLocationClick = (favorite: Favorite) => {
    if (onLocationSelect) {
      onLocationSelect(favorite.lat, favorite.lon, favorite.city_name)
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-weather-blue/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/10 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-weather-blue/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Heart className="w-5 h-5 text-red-400" />
          Favorite Locations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {favorites.length === 0 ? (
          <div className="text-center py-8 text-ring">
            <Heart className="w-12 h-12 mx-auto mb-3 text-white/30" />
            <p>No favorite locations yet</p>
            <p className="text-sm">Add locations to your favorites for quick access</p>
          </div>
        ) : (
          favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
            >
              <button
                onClick={() => handleLocationClick(favorite)}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <MapPin className="w-4 h-4 text-weather-blue" />
                <div>
                  <p className="font-medium text-white">{favorite.city_name}</p>
                  {favorite.country && <p className="text-sm text-white/70">{favorite.country}</p>}
                </div>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFavorite(favorite.id, favorite.city_name)}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
