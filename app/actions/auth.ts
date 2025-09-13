"use server"

import { createUser, authenticateUser } from "@/lib/auth"
import { cookies } from "next/headers"
import { signJWT } from "@/lib/jwt"

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required")
}

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

    if (password.length < 8) {
      return { error: "Password must be at least 8 characters" }
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { error: "Password must contain at least one uppercase letter, one lowercase letter, and one number" }
    }

    const user = await createUser(name, email, password)

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: "user",
    })

    cookies().set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
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

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: "user",
    })

    cookies().set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return { success: true, user }
  } catch (error) {
    console.error("Sign in error:", error)
    return { error: "Failed to sign in" }
  }
}

export async function signOut() {
  cookies().set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })

  return { success: true }
}

export async function refreshToken() {
  try {
    const token = cookies().get("auth-token")?.value

    if (!token) {
      return { error: "No token found" }
    }

    const { verifyJWT } = await import("@/lib/jwt")
    const decoded = await verifyJWT(token)

    if (!decoded) {
      return { error: "Invalid token" }
    }

    // Generate new token with extended expiry
    const newToken = await signJWT({
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name || "",
      role: "user",
    })

    cookies().set("auth-token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Token refresh error:", error)
    return { error: "Failed to refresh token" }
  }
}
