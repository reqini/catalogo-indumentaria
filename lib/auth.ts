import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface UserPayload {
  id: string
  email: string
  rol: 'admin' | 'editor' | 'viewer' | 'user' | 'tenant' | 'superadmin'
}

export async function getAuthUser(): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload
    return decoded
  } catch (error) {
    return null
  }
}

export async function isAdmin(): Promise<boolean> {
  const user = await getAuthUser()
  return user?.rol === 'admin'
}

