"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("ServiceWorker registration successful with scope: ", registration.scope)
          },
          (err) => {
            console.log("ServiceWorker registration failed: ", err)
          },
        )
      })
    }

    // Handle install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setInstallPrompt(e)
    })

    // Check if app is already installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    })

    // Check if app is already in standalone mode (installed)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }
  }, [])

  const handleInstallClick = () => {
    if (!installPrompt) return

    // Show the install prompt
    installPrompt.prompt()

    // Wait for the user to respond to the prompt
    installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
        setIsInstalled(true)
      } else {
        console.log("User dismissed the install prompt")
      }
      setInstallPrompt(null)
    })
  }

  if (!installPrompt || isInstalled) return null

  return (
    <Button
      onClick={handleInstallClick}
      variant="outline"
      size="sm"
      className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full border-2 border-weather-blue/20"
    >
      <Download className="h-4 w-4" />
      Install App
    </Button>
  )
}
