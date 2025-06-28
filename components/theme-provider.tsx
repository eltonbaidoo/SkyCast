"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Initialize theme from localStorage if available
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme)
    }
  }, [])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
