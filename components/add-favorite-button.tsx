"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import { addToFavorites } from "@/app/actions/user-preferences"

interface AddFavoriteButtonProps {
  cityName: string
  lat: number
  lon: number
  country?: string
  className?: string
}

export function AddFavoriteButton({ cityName, lat, lon, country, className }: AddFavoriteButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleAddFavorite = async () => {
    setLoading(true)
    try {
      const result = await addToFavorites(cityName, lat, lon, country)
      if (result) {
        toast.success(`Added ${cityName} to favorites`)
      } else {
        toast.error("Failed to add to favorites")
      }
    } catch (error: any) {
      console.error("Error adding favorite:", error)
      if (error.message?.includes("already in favorites")) {
        toast.error("Location already in favorites")
      } else {
        toast.error("Failed to add to favorites")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleAddFavorite}
      disabled={loading}
      variant="ghost"
      size="sm"
      className={`text-red-400 hover:text-red-300 hover:bg-red-400/10 ${className}`}
    >
      <Heart className="w-4 h-4" />
      {loading ? "Adding..." : "Add to Favorites"}
    </Button>
  )
}
