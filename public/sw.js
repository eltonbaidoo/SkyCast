const CACHE_NAME = "skycast-cache-v2"
const urlsToCache = [
  "/",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "https://maps.googleapis.com/maps/api/js",
  "https://openweathermap.org/img/wn/01d@2x.png",
  "https://openweathermap.org/img/wn/01n@2x.png",
  "https://openweathermap.org/img/wn/02d@2x.png",
  "https://openweathermap.org/img/wn/02n@2x.png",
]

// Install the service worker and cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

// Activate the service worker and clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Serve cached content when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return the response from the cached version
      if (response) {
        return response
      }

      // Not in cache - fetch and cache the response
      return fetch(event.request)
        .then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          // Cache the fetched response
          caches.open(CACHE_NAME).then((cache) => {
            if (
              !event.request.url.includes("/api/") &&
              !event.request.url.includes("maps.googleapis.com") &&
              !event.request.url.includes("maps.gstatic.com")
            ) {
              cache.put(event.request, responseToCache)
            }
          })

          return response
        })
        .catch(() => {
          // If fetch fails (e.g., offline), try to return a cached response for weather API requests
          if (event.request.url.includes("/api/weather")) {
            return caches.match("/offline-weather.json")
          }
        })
    }),
  )
})

// Store weather data for offline use
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CACHE_WEATHER_DATA") {
    const { city, data } = event.data

    // Create a response object from the weather data
    const response = new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    })

    // Store in cache
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(`/offline-weather/${city}`, response)
    })
  }
})
