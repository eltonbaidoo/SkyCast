"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FavoritesProps {
  currentCity: string
  onSelectCity: (city: string) => void
}

export function Favorites({ currentCity, onSelectCity }: FavoritesProps) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites")
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites))
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites))
  }, [favorites])

  const addToFavorites = () => {
    if (currentCity && !favorites.includes(currentCity)) {
      const newFavorites = [...favorites, currentCity]
      setFavorites(newFavorites)
    }
  }

  const removeFromFavorites = (city: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newFavorites = favorites.filter((fav) => fav !== city)
    setFavorites(newFavorites)
  }

  const isFavorite = currentCity && favorites.includes(currentCity)

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
        <Card className="absolute right-0 mt-2 p-2 z-10 w-64 shadow-lg rounded-2xl glass-card">
          <ScrollArea className="max-h-60">
            <div className="space-y-1">
              {favorites.map((city) => (
                <div
                  key={city}
                  onClick={() => {
                    onSelectCity(city)
                    setIsOpen(false)
                  }}
                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all duration-150 ease-out hover:shadow-lg ${
                    city === currentCity
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/80 bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm"
                  }`}
                >
                  <span className="truncate">{city}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => removeFromFavorites(city, e)}
                    className="h-6 w-6 ml-2 hover:bg-red-100 hover:text-red-500 rounded-full"
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
