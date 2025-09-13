import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyJWT } from "@/lib/jwt"

export async function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /protected)
  const path = request.nextUrl.pathname

  // Define paths that require authentication
  const protectedPaths = ["/api/favorites", "/api/user"]

  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some((protectedPath) => path.startsWith(protectedPath))

  if (isProtectedPath) {
    // Get the token from the request cookies
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    try {
      // Verify the JWT token using our JWT_SECRET
      const decoded = await verifyJWT(token)

      if (!decoded) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
      }

      // Add user info to request headers for use in API routes
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("x-user-id", decoded.userId)
      requestHeaders.set("x-user-email", decoded.email)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      console.error("JWT verification error in middleware:", error)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/favorites/:path*", "/api/user/:path*"],
}
