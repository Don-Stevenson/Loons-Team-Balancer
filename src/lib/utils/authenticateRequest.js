import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { isBlacklisted } from './tokenBlacklist'
import { isSessionValid } from './sessionStore'

export async function authenticateRequest(request) {
  const cookieStore = await cookies()
  let token = cookieStore.get('token')?.value

  // If no cookie token, check for Authorization header (Bearer token)
  if (!token) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      throw new Error('Unauthenticated request')
    }
    token = authHeader.split(' ')[1] // Format: "Bearer TOKEN"
  }

  if (!token) {
    throw new Error('Unauthenticated request')
  }

  // Check if token is blacklisted
  const blacklisted = isBlacklisted(token)
  if (blacklisted) {
    throw new Error('Token has been invalidated')
  }

  // Check if session is valid
  const sessionValid = isSessionValid(token)
  if (!sessionValid) {
    throw new Error('Session has been invalidated')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return { userId: decoded.userId, token }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired')
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Unauthenticated request')
    }
    throw error
  }
}

export function handleAuthError(error) {
  if (
    error.message.includes('Unauthenticated') ||
    error.message.includes('Token') ||
    error.message.includes('Session')
  ) {
    return { status: 401, message: error.message }
  }
  return { status: 500, message: 'Server error' }
}
