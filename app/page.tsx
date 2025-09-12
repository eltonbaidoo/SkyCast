"use client"

import { useState, useEffect } from "react"
import { MapPin, Thermometer, ThermometerSnowflake, Clock, Wind, Map } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Footer } from "@/components/footer"
import { WeatherBackground } from "@/components/weather-background"
import { LocalTime } from "@/components/local-time"
import { CitySearch } from "@/components/city-search"
import { ThemeToggle } from "@/components/theme-toggle"
import { Favorites } from "@/components/favorites"
import { GeolocationButton } from "@/components/geolocation-button"
import { PWARegister } from "@/components/pwa-register"
import { CircularDecorations } from "@/components/circular-decorations"
import { AuthButton } from "@/components/auth-button"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"

// Dynamically import the WeatherMap component with no SSR
const WeatherMap = dynamic(() => import("@/components/weather-map"), {
  ssr: false,
  loading: () => (
    <Card className="h-[400px] flex items-center justify-center rounded-[2rem]">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-weather-blue border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading map...</p>
      </div>
    </Card>
  ),
})

// Fallback map component
const MapFallback = dynamic(() => import("@/components/map-fallback"), {
  ssr: false,
})

export default function WeatherApp() {
  const [searchQuery, setSearchQuery] = useState("")
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isFahrenheit, setIsFahrenheit] = useState(false)
  const [isMph, setIsMph] = useState(false)
  const [useMapFallback, setUseMapFallback] = useState(false)
  const [activeTab, setActiveTab] = useState("current")
  const { toast } = useToast()

  // Initialize with saved preferences
  useEffect(() => {
    // Load last searched city
    const lastCity = localStorage.getItem("lastSearchedCity")
    if (lastCity) {
      setSearchQuery(lastCity)
    } else {
      // Default to London if no saved city
      setSearchQuery("London")
    }

    // Load active tab preference
    const savedTab = localStorage.getItem("activeTab")
    if (savedTab) {
      setActiveTab(savedTab)
    }

    // Load user preferences from localStorage
    const loadPreferences = () => {
      const storedFahrenheit = localStorage.getItem("isFahrenheit")
      const storedMph = localStorage.getItem("isMph")

      if (storedFahrenheit !== null) {
        setIsFahrenheit(storedFahrenheit === "true")
      }

      if (storedMph !== null) {
        setIsMph(storedMph === "true")
      }
    }

    loadPreferences()
  }, [])

  // Fetch weather when searchQuery changes
  useEffect(() => {
    if (searchQuery) {
      fetchWeather(searchQuery)
    }
  }, [searchQuery])

  // Cache weather data for offline use
  useEffect(() => {
    if (weather && "serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "CACHE_WEATHER_DATA",
        city: searchQuery,
        data: weather,
      })
    }
  }, [weather, searchQuery])

  // Save active tab preference
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab)
  }, [activeTab])

  // Save temperature unit preference
  useEffect(() => {
    localStorage.setItem("isFahrenheit", isFahrenheit.toString())
  }, [isFahrenheit])

  // Save wind speed unit preference
  useEffect(() => {
    localStorage.setItem("isMph", isMph.toString())
  }, [isMph])

  const fetchWeather = async (query) => {
    if (!query) return

    setLoading(true)
    setError("")
    try {
      // Save the searched city to localStorage
      localStorage.setItem("lastSearchedCity", query)

      // Use our server API route instead of directly calling OpenWeather API
      const response = await fetch(`/api/weather?city=${encodeURIComponent(query)}&type=weather`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "City not found")
      }

      const data = await response.json()
      setWeather(data)

      // Fetch 5-day forecast using our server API route
      const forecastResponse = await fetch(`/api/weather?city=${encodeURIComponent(query)}&type=forecast`)

      if (!forecastResponse.ok) {
        const errorData = await forecastResponse.json()
        throw new Error(errorData.error || "Forecast data not available")
      }

      const forecastData = await forecastResponse.json()

      // Group forecast by day (taking noon forecast for each day)
      const dailyForecasts = forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 5)

      setForecast(dailyForecasts)
    } catch (err) {
      setError(err.message)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if we should use the fallback map
    const checkLeaflet = async () => {
      try {
        await import("leaflet")
        setUseMapFallback(false)
      } catch (error) {
        console.error("Leaflet import failed, using fallback map", error)
        setUseMapFallback(true)
      }
    }

    checkLeaflet()
  }, [])

  const handleSearch = (city) => {
    setSearchQuery(city)
  }

  const handleTabChange = (value) => {
    setActiveTab(value)
  }

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  }

  const formatDate = (dt) => {
    return new Date(dt * 1000).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const convertToFahrenheit = (celsius) => {
    return (celsius * 9) / 5 + 32
  }

  const getTemperature = (celsius) => {
    return isFahrenheit ? `${Math.round(convertToFahrenheit(celsius))}°F` : `${Math.round(celsius)}°C`
  }

  const convertToMph = (kmh) => {
    return kmh * 0.621371
  }

  const getWindSpeed = (speed) => {
    // OpenWeather API returns wind speed in m/s, convert to km/h first
    const kmh = speed * 3.6
    return isMph ? `${Math.round(convertToMph(kmh))} mph` : `${Math.round(kmh)} km/h`
  }

  const getWeatherCardColor = (condition) => {
    if (!condition) return "bg-muted/50"

    const lowerCondition = condition.toLowerCase()
    if (lowerCondition.includes("clear")) return "bg-weather-yellow/20 dark:bg-weather-yellow/10"
    if (lowerCondition.includes("cloud")) return "bg-slate-200/50 dark:bg-slate-700/50"
    if (lowerCondition.includes("rain")) return "bg-weather-blue/20 dark:bg-weather-blue/10"
    if (lowerCondition.includes("snow")) return "bg-blue-50/50 dark:bg-blue-900/30"
    if (lowerCondition.includes("thunder")) return "bg-slate-700/20 dark:bg-slate-600/30"
    if (lowerCondition.includes("mist") || lowerCondition.includes("fog")) return "bg-slate-300/30 dark:bg-slate-700/30"

    return "bg-muted/50"
  }

  return (
    <>
      {weather && <WeatherBackground condition={weather.weather[0].main} />}
      <CircularDecorations />

      <div className="glass-panel container mx-auto px-8 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-4 px-2">
          <PWARegister />
          <div className="flex items-center gap-3">
            <AuthButton />
            <ThemeToggle />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-weather-blue to-weather-teal dark:from-weather-lightBlue dark:to-weather-cyan">
            SkyCast
          </h1>
          <p className="text-muted-foreground">Check the weather and time for any city around the world</p>
        </div>

        <Card className="mb-6 border-2 border-weather-blue/20 shadow-lg dark:border-weather-blue/10 dark:bg-gray-800/60 rounded-[2rem] glass-interactive">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <CitySearch onSearch={handleSearch} loading={loading} />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GeolocationButton onSearch={handleSearch} isLoading={loading} />
                  {weather && <Favorites currentCity={weather.name} onSelectCity={handleSearch} />}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <ThermometerSnowflake className="h-4 w-4 text-weather-blue" />
                    <Switch id="temperature-unit" checked={isFahrenheit} onCheckedChange={setIsFahrenheit} />
                    <Thermometer className="h-4 w-4 text-weather-red" />
                    <Label htmlFor="temperature-unit" className="text-sm font-medium">
                      {isFahrenheit ? "°F" : "°C"}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Label htmlFor="wind-unit" className="text-sm font-medium">
                      km/h
                    </Label>
                    <Switch id="wind-unit" checked={isMph} onCheckedChange={setIsMph} />
                    <Label htmlFor="wind-unit" className="text-sm font-medium">
                      mph
                    </Label>
                    <Wind className="h-4 w-4 ml-1 text-weather-blue" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-8 border-destructive dark:border-red-800 rounded-[2rem]">
            <CardContent className="pt-6">
              <p className="text-destructive dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {weather && (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 bg-muted/70 dark:bg-gray-700/70 p-1">
              <TabsTrigger
                value="current"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-weather-blue"
              >
                Current
              </TabsTrigger>
              <TabsTrigger
                value="forecast"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-weather-blue"
              >
                5-Day Forecast
              </TabsTrigger>
              <TabsTrigger
                value="map"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-weather-blue"
              >
                <Map className="h-4 w-4 mr-2 inline" />
                Map View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current">
              <Card className="border-2 border-weather-blue/20 shadow-lg overflow-hidden dark:border-weather-blue/10 dark:bg-gray-800/60 rounded-[2rem] glass-card">
                <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-weather-blue/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 -mb-8 -ml-8 bg-weather-teal/10 rounded-full blur-2xl"></div>

                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center text-weather-blue dark:text-weather-lightBlue">
                        <MapPin className="h-5 w-5 mr-2" />
                        {weather.name}, {weather.sys.country}
                      </CardTitle>
                      <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span>
                          {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        {/* Add a separator dot for desktop view */}
                        <span className="hidden sm:block">•</span>
                        {/* Add the local time component */}
                        <LocalTime timezone={weather.timezone} />
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-weather-blue to-weather-teal dark:from-weather-lightBlue dark:to-weather-cyan">
                        {getTemperature(weather.main.temp)}
                      </div>
                      <div className="text-sm text-foreground/70">
                        Feels like {getTemperature(weather.main.feels_like)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div
                      className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-150 ease-out hover:shadow-lg hover:scale-105 glass-interactive ${getWeatherCardColor(weather.weather[0].main)}`}
                    >
                      <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded-full mb-2">
                        <img
                          src={getWeatherIcon(weather.weather[0].icon) || "/placeholder.svg"}
                          alt={weather.weather[0].description}
                          className="w-16 h-16"
                        />
                      </div>
                      <span className="text-sm font-medium capitalize">{weather.weather[0].description}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-weather-blue/10 dark:bg-weather-blue/5 rounded-2xl glass-interactive transition-all duration-150 ease-out hover:shadow-lg">
                      <span className="text-sm text-muted-foreground">Humidity</span>
                      <span className="text-xl font-medium">{weather.main.humidity}%</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-weather-cyan/10 dark:bg-weather-cyan/5 rounded-2xl glass-interactive transition-all duration-150 ease-out hover:shadow-lg">
                      <span className="text-sm text-muted-foreground">Wind</span>
                      <span className="text-xl font-medium">{getWindSpeed(weather.wind.speed)}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-weather-teal/10 dark:bg-weather-teal/5 rounded-2xl glass-interactive transition-all duration-150 ease-out hover:shadow-lg">
                      <span className="text-sm text-muted-foreground">Pressure</span>
                      <span className="text-xl font-medium">{weather.main.pressure} hPa</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forecast">
              <Card className="border-2 border-weather-blue/20 shadow-lg overflow-hidden dark:border-weather-blue/10 dark:bg-gray-800/60 rounded-[2rem] glass-card">
                <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-weather-blue/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 -mb-8 -ml-8 bg-weather-teal/10 rounded-full blur-2xl"></div>

                <CardHeader>
                  <CardTitle className="text-weather-blue dark:text-weather-lightBlue">
                    5-Day Forecast for {weather.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    Weather forecast for the next 5 days
                    <span className="inline-flex items-center">
                      <span className="mx-2">•</span>
                      <Clock className="h-4 w-4 mr-1" />
                      Local time: <LocalTime timezone={weather.timezone} />
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                    {forecast.map((day, index) => (
                      <div
                        key={index}
                        className={`flex flex-col items-center p-4 rounded-2xl glass-interactive transition-all duration-150 ease-out hover:shadow-lg hover:scale-105 ${getWeatherCardColor(day.weather[0].main)}`}
                      >
                        <div className="font-medium">{formatDate(day.dt)}</div>
                        <div className="bg-white/50 dark:bg-gray-800/50 p-1 rounded-full my-2">
                          <img
                            src={getWeatherIcon(day.weather[0].icon) || "/placeholder.svg"}
                            alt={day.weather[0].description}
                            className="w-12 h-12"
                          />
                        </div>
                        <div className="text-lg font-bold text-weather-blue dark:text-weather-lightBlue">
                          {getTemperature(day.main.temp)}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">{day.weather[0].description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <Wind className="h-3 w-3 inline mr-1" />
                          {getWindSpeed(day.wind.speed)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="map">
              {weather &&
                (useMapFallback ? (
                  <MapFallback
                    lat={weather.coord.lat}
                    lon={weather.coord.lon}
                    city={weather.name}
                    country={weather.sys.country}
                  />
                ) : (
                  <WeatherMap
                    city={weather.name}
                    country={weather.sys.country}
                    lat={weather.coord.lat}
                    lon={weather.coord.lon}
                    temp={weather.main.temp}
                    description={weather.weather[0].description}
                    icon={weather.weather[0].icon}
                    isFahrenheit={isFahrenheit}
                  />
                ))}
            </TabsContent>
          </Tabs>
        )}

        <Footer />
      </div>
    </>
  )
}
