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
import { TemperatureSlider } from "@/components/temperature-slider"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { useUserPreferences } from "@/lib/user-preferences-context"
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
  const [useMapFallback, setUseMapFallback] = useState(false)
  const [activeTab, setActiveTab] = useState("current")
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const { preferences, updatePreferences } = useUserPreferences()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isFahrenheit = preferences?.temperature_unit === "fahrenheit"
  const isMph = preferences?.wind_unit === "mph" || (!user && isClient && localStorage.getItem("isMph") === "true")

  useEffect(() => {
    if (!isClient) return

    const lastCity = localStorage.getItem("lastSearchedCity")
    if (lastCity) {
      setSearchQuery(lastCity)
    }

    const savedTab = localStorage.getItem("activeTab")
    if (savedTab) {
      setActiveTab(savedTab)
    }
  }, [isClient])

  useEffect(() => {
    if (searchQuery) {
      fetchWeather(searchQuery)
    }
  }, [searchQuery])

  useEffect(() => {
    if (!isClient || !weather) return

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "CACHE_WEATHER_DATA",
        city: searchQuery,
        data: weather,
      })
    }
  }, [weather, searchQuery, isClient])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("activeTab", activeTab)
    }
  }, [activeTab, isClient])

  const fetchWeather = async (query) => {
    if (!query) return

    setLoading(true)
    setError("")
    try {
      if (isClient) {
        localStorage.setItem("lastSearchedCity", query)
      }

      const response = await fetch(`/api/weather?city=${encodeURIComponent(query)}&type=weather`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "City not found")
      }

      const data = await response.json()
      setWeather(data)

      const forecastResponse = await fetch(`/api/weather?city=${encodeURIComponent(query)}&type=forecast`)

      if (!forecastResponse.ok) {
        const errorData = await forecastResponse.json()
        throw new Error(errorData.error || "Forecast data not available")
      }

      const forecastData = await forecastResponse.json()

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
    setUseMapFallback(false)
  }, [])

  const handleSearch = (city) => {
    setSearchQuery(city)
  }

  const handleTabChange = (value) => {
    setActiveTab(value)
  }

  const handleTemperatureToggle = async (checked: boolean) => {
    if (user && preferences) {
      await updatePreferences({
        temperature_unit: checked ? "fahrenheit" : "celsius",
      })
    }
    if (!user && isClient) {
      localStorage.setItem("isFahrenheit", checked.toString())
    }
  }

  const handleWindSpeedToggle = async (checked: boolean) => {
    if (user && preferences) {
      await updatePreferences({
        wind_unit: checked ? "mph" : "kmh",
      })
    }
    if (!user && isClient) {
      localStorage.setItem("isMph", checked.toString())
    }
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
    const kmh = speed * 3.6
    return isMph ? `${Math.round(convertToMph(kmh))} mph` : `${Math.round(kmh)} km/h`
  }

  const getWindDirection = (degrees) => {
    if (degrees === undefined || degrees === null) return "N/A"

    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ]
    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
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

  const handleLocationSelect = async (lat: number, lon: number, address?: string) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}&type=weather`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch weather data")
      }

      const data = await response.json()
      setWeather(data)

      if (address) {
        setSearchQuery(address)
        if (isClient) {
          localStorage.setItem("lastSearchedCity", address)
        }
      }

      const forecastResponse = await fetch(`/api/weather?lat=${lat}&lon=${lon}&type=forecast`)

      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json()
        const dailyForecasts = forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 5)
        setForecast(dailyForecasts)
      }

      toast({
        title: "Location Updated",
        description: `Weather data loaded for ${address || "selected location"}`,
      })
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
                    <Switch id="temperature-unit" checked={isFahrenheit} onCheckedChange={handleTemperatureToggle} />
                    <Thermometer className="h-4 w-4 text-weather-red" />
                    <Label htmlFor="temperature-unit" className="text-sm font-medium">
                      {isFahrenheit ? "°F" : "°C"}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Label htmlFor="wind-unit" className="text-sm font-medium">
                      km/h
                    </Label>
                    <Switch id="wind-unit" checked={isMph} onCheckedChange={handleWindSpeedToggle} />
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
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-weather-blue text-xs md:text-sm"
              >
                Current
              </TabsTrigger>
              <TabsTrigger
                value="forecast"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-weather-blue text-xs md:text-sm"
              >
                <span className="hidden sm:inline">5-Day Forecast</span>
                <span className="sm:hidden">5-Day</span>
              </TabsTrigger>
              <TabsTrigger
                value="map"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-weather-blue text-xs md:text-sm"
              >
                <Map className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 inline" />
                <span className="hidden sm:inline">Map View</span>
                <span className="sm:hidden">Map</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current">
              <Card className="border-2 border-weather-blue/20 shadow-lg overflow-hidden dark:border-weather-blue/10 dark:bg-gray-800/60 rounded-[2rem] glass-card">
                <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-weather-blue/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 -mb-8 -ml-8 bg-weather-teal/10 rounded-full blur-2xl"></div>

                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg md:text-2xl flex items-center text-weather-blue dark:text-weather-lightBlue">
                        <MapPin className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                        <span className="hidden sm:inline">
                          {weather.name}, {weather.sys.country}
                        </span>
                        <span className="sm:hidden">{weather.name}</span>
                      </CardTitle>
                      <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs md:text-sm">
                        <span>
                          {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        <span className="hidden sm:block">•</span>
                        <LocalTime timezone={weather.timezone} />
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-weather-blue to-weather-teal dark:from-weather-lightBlue dark:to-weather-cyan">
                        {getTemperature(weather.main.temp)}
                      </div>
                      <div className="text-xs md:text-sm text-foreground/70">
                        Feels like {getTemperature(weather.main.feels_like)}
                      </div>
                      {weather.main.temp_min !== undefined && weather.main.temp_max !== undefined && (
                        <div className="mt-2 max-w-[150px] md:max-w-[200px] ml-auto">
                          <TemperatureSlider
                            current={isFahrenheit ? convertToFahrenheit(weather.main.temp) : weather.main.temp}
                            min={isFahrenheit ? convertToFahrenheit(weather.main.temp_min) : weather.main.temp_min}
                            max={isFahrenheit ? convertToFahrenheit(weather.main.temp_max) : weather.main.temp_max}
                            unit={isFahrenheit ? "°F" : "°C"}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 md:gap-4 sm:grid-cols-4">
                    <div
                      className={`flex flex-col items-center p-2 md:p-4 rounded-2xl transition-all duration-150 ease-out hover:shadow-lg hover:scale-105 glass-interactive ${getWeatherCardColor(weather.weather[0].main)}`}
                    >
                      <div className="bg-white/50 dark:bg-gray-800/50 p-1 md:p-2 rounded-full mb-2">
                        <img
                          src={getWeatherIcon(weather.weather[0].icon) || "/placeholder.svg"}
                          alt={weather.weather[0].description}
                          className="w-10 h-10 md:w-16 md:h-16"
                        />
                      </div>
                      <span className="text-xs md:text-sm font-medium capitalize text-center">
                        {weather.weather[0].description}
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 md:p-4 bg-weather-blue/10 dark:bg-weather-blue/5 rounded-2xl glass-interactive transition-all duration-150 ease-out hover:shadow-lg">
                      <span className="text-xs md:text-sm text-muted-foreground">Humidity</span>
                      <span className="text-lg md:text-xl font-medium">{weather.main.humidity}%</span>
                      {weather.uvi !== undefined && (
                        <div className="mt-1 md:mt-2 text-center">
                          <span className="text-xs text-muted-foreground">UV Index</span>
                          <div className="text-xs md:text-sm font-medium">{Math.round(weather.uvi)}</div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 md:p-4 bg-weather-cyan/10 dark:bg-weather-cyan/5 rounded-2xl glass-interactive transition-all duration-150 ease-out hover:shadow-lg">
                      <span className="text-xs md:text-sm text-muted-foreground">Wind</span>
                      <span className="text-lg md:text-xl font-medium">{getWindSpeed(weather.wind.speed)}</span>
                      {weather.wind.deg !== undefined && (
                        <span className="text-xs text-muted-foreground mt-1">{getWindDirection(weather.wind.deg)}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 md:p-4 bg-weather-teal/10 dark:bg-weather-teal/5 rounded-2xl glass-interactive transition-all duration-150 ease-out hover:shadow-lg">
                      <span className="text-xs md:text-sm text-muted-foreground">Pressure</span>
                      <span className="text-lg md:text-xl font-medium">{weather.main.pressure} hPa</span>
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
                  <CardTitle className="text-lg md:text-xl text-weather-blue dark:text-weather-lightBlue">
                    5-Day Forecast for {weather.name}
                  </CardTitle>
                  <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs md:text-sm">
                    Weather forecast for the next 5 days
                    <span className="hidden sm:inline-flex items-center">
                      <span className="mx-2">•</span>
                      <Clock className="h-4 w-4 mr-1" />
                      Local time: <LocalTime timezone={weather.timezone} />
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 md:gap-4 sm:grid-cols-5">
                    {forecast.map((day, index) => (
                      <div
                        key={index}
                        className={`flex flex-col items-center p-2 md:p-4 rounded-2xl glass-interactive transition-all duration-150 ease-out hover:shadow-lg hover:scale-105 ${getWeatherCardColor(day.weather[0].main)}`}
                      >
                        <div className="font-medium text-xs md:text-sm">{formatDate(day.dt)}</div>
                        <div className="bg-white/50 dark:bg-gray-800/50 p-1 rounded-full my-2">
                          <img
                            src={getWeatherIcon(day.weather[0].icon) || "/placeholder.svg"}
                            alt={day.weather[0].description}
                            className="w-8 h-8 md:w-12 md:h-12"
                          />
                        </div>
                        <div className="text-sm md:text-lg font-bold text-weather-blue dark:text-weather-lightBlue">
                          {getTemperature(day.main.temp)}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize text-center">
                          {day.weather[0].description}
                        </div>
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
                    onLocationSelect={handleLocationSelect}
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
