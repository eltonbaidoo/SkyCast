"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { AuthModal } from "./auth-modal"

export function AuthButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="neon-button rounded-full px-4 py-2 font-medium transition-all duration-300 hover:scale-105"
        variant="outline"
      >
        <User className="h-4 w-4 mr-2" />
        Sign In
      </Button>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
