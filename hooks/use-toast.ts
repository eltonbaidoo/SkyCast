"use client"

import { useState, useCallback } from "react"

type ToastType = {
  title: string
  description: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastType[]>([])

  const toast = useCallback(({ title, description, variant = "default" }: ToastType) => {
    const id = Date.now()
    setToasts((prevToasts) => [...prevToasts, { title, description, variant }])

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((_, index) => index !== 0))
    }, 5000)
  }, [])

  return { toast, toasts }
}
