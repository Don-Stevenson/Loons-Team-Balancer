import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { isBlacklisted } from '../../../../lib/utils/tokenBlacklist'
import { isSessionValid } from '../../../../lib/utils/sessionStore'
import { corsHeaders } from '../../../../lib/utils/cors'

export async function OPTIONS(request) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(origin),
  })
}

export async function GET(request) {
  const origin = request.headers.get('origin')

  try {
    const cookieStore = await cookies()
    let token = cookieStore.get('token')?.value

    // If no cookie token, check for Authorization header (Bearer token)
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        const response = NextResponse.json(
          { message: 'Unauthenticated request' },
          { status: 401 }
        )

        const headers = corsHeaders(origin)
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value)
        })

        return response
      }
      token = authHeader.split(' ')[1] // Format: "Bearer TOKEN"
    }

    if (!token) {
      const response = NextResponse.json(
        { message: 'Unauthenticated request' },
        { status: 401 }
      )

      const headers = corsHeaders(origin)
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    }

    // Check if token is blacklisted
    const blacklisted = isBlacklisted(token)
    if (blacklisted) {
      const response = NextResponse.json(
        { message: 'Token has been invalidated' },
        { status: 401 }
      )

      const headers = corsHeaders(origin)
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    }

    // Check if session is valid
    const sessionValid = isSessionValid(token)
    if (!sessionValid) {
      const response = NextResponse.json(
        { message: 'Session has been invalidated' },
        { status: 401 }
      )

      const headers = corsHeaders(origin)
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const response = NextResponse.json({
        success: true,
        message: 'Authenticated',
        userId: decoded.userId,
      })

      const headers = corsHeaders(origin)
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      // Prevent caching of auth check
      response.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      )
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')

      return response
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const response = NextResponse.json(
          { message: 'Token has expired' },
          { status: 401 }
        )

        const headers = corsHeaders(origin)
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value)
        })

        return response
      }
      if (error.name === 'JsonWebTokenError') {
        const response = NextResponse.json(
          { message: 'Unauthenticated request' },
          { status: 401 }
        )

        const headers = corsHeaders(origin)
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value)
        })

        return response
      }
      throw error
    }
  } catch (error) {
    console.error('Auth check error:', error)
    const response = NextResponse.json(
      { message: 'Unauthenticated request' },
      { status: 500 }
    )

    const headers = corsHeaders(origin)
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }
}
