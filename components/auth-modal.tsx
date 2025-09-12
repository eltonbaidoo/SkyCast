"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignInForm } from "./sign-in-form"
import { SignUpForm } from "./sign-up-form"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState("signin")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-panel border-0 neon-border">
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-amber-500 rounded-full blur-sm neon-pulse opacity-60"></div>
        <div className="absolute -top-2 -right-6 w-6 h-6 bg-indigo-500 rounded-full blur-sm neon-pulse opacity-40"></div>
        <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-cyan-400 rounded-full blur-md neon-pulse opacity-30"></div>

        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold neon-text neon-flicker">SkyCast Access</DialogTitle>
          <p className="text-muted-foreground">Enter the digital realm of weather intelligence</p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/20 border neon-border">
            <TabsTrigger
              value="signin"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 data-[state=active]:neon-glow"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 data-[state=active]:neon-glow"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-6">
            <SignInForm onSuccess={onClose} />
          </TabsContent>

          <TabsContent value="signup" className="mt-6">
            <SignUpForm onSuccess={onClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
