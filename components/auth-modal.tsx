"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignInForm } from "./sign-in-form"
import { SignUpForm } from "./sign-up-form"
import { useAuth } from "@/lib/auth-context"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState("signin")
  const { refreshUser } = useAuth()

  const handleSuccess = async () => {
    await refreshUser()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-panel border-0 neon-border">
        <div className="absolute -top-3 -left-3 w-6 h-6 bg-amber-500/40 rounded-full blur-sm neon-pulse"></div>
        <div className="absolute -top-2 -right-4 w-4 h-4 bg-indigo-500/30 rounded-full blur-sm neon-pulse"></div>
        <div className="absolute -bottom-3 -right-3 w-7 h-7 bg-cyan-400/25 rounded-full blur-md neon-pulse"></div>

        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold neon-text">SkyCast Access</DialogTitle>
          <p className="text-muted-foreground">Enter the digital realm of weather intelligence</p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/10 border neon-border">
            <TabsTrigger
              value="signin"
              className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-6">
            <SignInForm onSuccess={handleSuccess} />
          </TabsContent>

          <TabsContent value="signup" className="mt-6">
            <SignUpForm onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
