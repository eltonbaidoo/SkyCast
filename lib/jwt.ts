export interface JWTPayload {
  userId: string
  email: string
  exp: number
  iat: number
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Convert string to ArrayBuffer
function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder()
  return encoder.encode(str)
}

// Convert ArrayBuffer to base64url
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

// Convert base64url to ArrayBuffer
function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export async function signJWT(payload: Omit<JWTPayload, "exp" | "iat">): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days
  }

  const header = { alg: "HS256", typ: "JWT" }

  const encodedHeader = arrayBufferToBase64Url(stringToArrayBuffer(JSON.stringify(header)))
  const encodedPayload = arrayBufferToBase64Url(stringToArrayBuffer(JSON.stringify(fullPayload)))

  const data = `${encodedHeader}.${encodedPayload}`

  const key = await crypto.subtle.importKey(
    "raw",
    stringToArrayBuffer(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )

  const signature = await crypto.subtle.sign("HMAC", key, stringToArrayBuffer(data))
  const encodedSignature = arrayBufferToBase64Url(signature)

  return `${data}.${encodedSignature}`
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".")

    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      return null
    }

    const data = `${encodedHeader}.${encodedPayload}`

    const key = await crypto.subtle.importKey(
      "raw",
      stringToArrayBuffer(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    )

    const signature = base64UrlToArrayBuffer(encodedSignature)
    const isValid = await crypto.subtle.verify("HMAC", key, signature, stringToArrayBuffer(data))

    if (!isValid) {
      return null
    }

    const payload = JSON.parse(new TextDecoder().decode(base64UrlToArrayBuffer(encodedPayload))) as JWTPayload

    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) {
      return null
    }

    return payload
  } catch (error) {
    console.error("JWT verification error:", error)
    return null
  }
}
