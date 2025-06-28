import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SkyCast Weather App",
    short_name: "SkyCast",
    description: "Check the weather and time for any city around the world",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4dabf7",
    icons: [
      {
        src: "/icons/icon-192x192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  }
}
