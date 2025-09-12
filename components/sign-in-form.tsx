"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, Github, Chrome } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { signIn } from "@/app/actions/auth"

interface SignInFormProps {
  onSuccess: () => void
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)

      const result = await signIn(formData)

      if (result.error) {
        toast({
          title: "Sign In Failed",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to SkyCast",
        })
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    toast({
      title: `${provider} Login`,
      description: `Connecting to ${provider}...`,
    })
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-amber-400">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-amber-500/60" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="neon-input pl-10 bg-black/20 border-amber-500/20 text-white placeholder:text-gray-400 focus:border-amber-500/60"
            />
          </div>
          {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-amber-400">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-amber-500/60" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="neon-input pl-10 pr-10 bg-black/20 border-amber-500/20 text-white placeholder:text-gray-400 focus:border-amber-500/60"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-amber-500/60" />
              ) : (
                <Eye className="h-4 w-4 text-amber-500/60" />
              )}
            </Button>
          </div>
          {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full neon-button py-3 font-semibold text-lg">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              Accessing...
            </div>
          ) : (
            "Enter SkyCast"
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-amber-500/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-black/50 px-2 text-amber-400/80">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin("Google")}
          className="neon-button bg-black/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/5"
        >
          <Chrome className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin("GitHub")}
          className="neon-button bg-black/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/5"
        >
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>

      <div className="text-center">
        <Button variant="link" className="text-amber-400/80 hover:text-amber-300 text-sm">
          Forgot your access code?
        </Button>
      </div>
    </div>
  )
}
