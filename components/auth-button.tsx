"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { User, LogOut, Settings } from "lucide-react"
import { AuthModal } from "./auth-modal"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AuthButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user, isLoading, signOut } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <Button
        disabled
        className="neon-button rounded-full px-4 py-2 font-medium transition-all duration-300 bg-transparent"
        variant="outline"
      >
        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2"></div>
        Loading...
      </Button>
    )
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="neon-button rounded-full px-4 py-2 font-medium transition-all duration-300 hover:scale-105 bg-transparent"
            variant="outline"
          >
            <User className="h-4 w-4 mr-2" />
            {user.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 glass-panel border neon-border bg-black/80 backdrop-blur-md">
          <DropdownMenuLabel className="text-amber-400">My Account</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-amber-500/20" />
          <DropdownMenuItem
            className="text-gray-300 hover:bg-amber-500/10 hover:text-amber-400 cursor-pointer"
            onClick={() => router.push("/settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-gray-300 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

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
