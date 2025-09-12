"use server"

import { createUser, authenticateUser } from "@/lib/auth"
import { cookies } from "next/headers"
import { signJWT } from "@/lib/jwt"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function signUp(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!name || !email || !password) {
      return { error: "All fields are required" }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: "Invalid email format" }
    }

    // Validate password strength
    if (password.length < 8) {
      return { error: "Password must be at least 8 characters" }
    }

    const user = await createUser(name, email, password)

    const token = await signJWT({ userId: user.id, email: user.email })

    // Set cookie
    cookies().set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return { success: true, user }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: error instanceof Error ? error.message : "Failed to create account" }
  }
}

export async function signIn(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return { error: "Email and password are required" }
    }

    const user = await authenticateUser(email, password)

    if (!user) {
      return { error: "Invalid email or password" }
    }

    const token = await signJWT({ userId: user.id, email: user.email })

    // Set cookie
    cookies().set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return { success: true, user }
  } catch (error) {
    console.error("Sign in error:", error)
    return { error: "Failed to sign in" }
  }
}

export async function signOut() {
  cookies().delete("auth-token")
  return { success: true }
}
