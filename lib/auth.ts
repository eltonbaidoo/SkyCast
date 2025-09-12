import bcrypt from "bcryptjs"
import { sql } from "./db"

export interface User {
  id: string
  name: string
  email: string
  created_at: string
}

export async function createUser(name: string, email: string, password: string): Promise<User> {
  // Check if user already exists
  const existingUser = await sql`
    SELECT id FROM users_sync WHERE email = ${email} AND deleted_at IS NULL
  `

  if (existingUser.length > 0) {
    throw new Error("User already exists with this email")
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create user
  const userId = crypto.randomUUID()
  const now = new Date().toISOString()

  const result = await sql`
    INSERT INTO users_sync (id, name, email, raw_json, created_at, updated_at)
    VALUES (
      ${userId}, 
      ${name}, 
      ${email}, 
      ${JSON.stringify({ password: hashedPassword })},
      ${now},
      ${now}
    )
    RETURNING id, name, email, created_at
  `

  return result[0] as User
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const result = await sql`
    SELECT id, name, email, raw_json, created_at 
    FROM users_sync 
    WHERE email = ${email} AND deleted_at IS NULL
  `

  if (result.length === 0) {
    return null
  }

  const user = result[0]
  const userData = user.raw_json as { password: string }

  const isValid = await bcrypt.compare(password, userData.password)

  if (!isValid) {
    return null
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await sql`
    SELECT id, name, email, created_at 
    FROM users_sync 
    WHERE id = ${id} AND deleted_at IS NULL
  `

  return result.length > 0 ? (result[0] as User) : null
}
