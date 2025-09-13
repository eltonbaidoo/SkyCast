"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, Loader2, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { type CityData, popularCities } from "@/lib/city-data"

interface CitySearchProps {
  onSearch: (city: string) => void
  loading: boolean
}

export function CitySearch({ onSearch, loading }: CitySearchProps) {
  const [city, setCity] = useState("")
  const [suggestions, setSuggestions] = useState<CityData[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize with last searched city
  useEffect(() => {
    // Removed the automatic loading of lastSearchedCity
    // Search bar will now start empty
  }, [])

  useEffect(() => {
    // Filter cities based on input
    if (city.trim().length > 1) {
      const filtered = popularCities
        .filter(
          (cityData) =>
            cityData.name.toLowerCase().includes(city.toLowerCase()) ||
            cityData.country.toLowerCase().includes(city.toLowerCase()),
        )
        .slice(0, 5) // Limit to 5 suggestions

      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [city])

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (city.trim()) {
      onSearch(city)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: CityData) => {
    setCity(suggestion.name)
    onSearch(suggestion.name)
    setShowSuggestions(false)
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 border-weather-blue/30 focus-visible:ring-weather-blue pr-10"
            onFocus={() => city.trim().length > 1 && setSuggestions.length > 0 && setShowSuggestions(true)}
          />
          {city.length > 0 && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setCity("")}
            >
              ×
            </button>
          )}
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-weather-blue to-weather-cyan hover:from-weather-cyan hover:to-weather-blue text-white"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
          Search
        </Button>
      </form>

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-white rounded-2xl shadow-lg max-h-60 overflow-auto border border-gray-200"
        >
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <MapPin className="h-4 w-4 mr-2 text-weather-blue" />
                <span>
                  {suggestion.name}, {suggestion.country}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
