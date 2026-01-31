import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { isBlacklisted } from '../../../lib/utils/tokenBlacklist'
import { isSessionValid } from '../../../lib/utils/sessionStore'

// Auth helper function
async function authenticateRequest(request) {
  const cookieStore = await cookies()
  let token = cookieStore.get('token')?.value

  if (!token) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      throw new Error('Unauthenticated request')
    }
    token = authHeader.split(' ')[1]
  }

  if (!token) {
    throw new Error('Unauthenticated request')
  }

  const blacklisted = isBlacklisted(token)
  if (blacklisted) {
    throw new Error('Token has been invalidated')
  }

  const sessionValid = isSessionValid(token)
  if (!sessionValid) {
    throw new Error('Session has been invalidated')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded.userId
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

// GET upcoming games
export async function GET(request) {
  try {
    await authenticateRequest(request)

    // Check if environment variables are configured
    if (!process.env.TEAM_ID || !process.env.REFRESH_TOKEN) {
      return NextResponse.json({
        message:
          'Games feature not configured. Please set TEAM_ID and REFRESH_TOKEN environment variables.',
        games: [],
      })
    }

    // Lazy load the games utility to avoid errors at startup
    try {
      const { getUpcomingGamesList } =
        await import('../../../lib/utils/getUpcomingGames')
      const games = await getUpcomingGamesList()

      // Create response with no-cache headers to prevent browser caching
      const response = NextResponse.json(games)
      response.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      )
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')

      return response
    } catch (gamesError) {
      console.error('Games API error:', gamesError)
      return NextResponse.json({
        error: true,
        message: 'Heja is currently unavailable. Please try again later.',
        games: [],
      })
    }
  } catch (error) {
    console.error('Get upcoming games error:', error)

    if (
      error.message.includes('Unauthenticated') ||
      error.message.includes('Token') ||
      error.message.includes('Session')
    ) {
      return NextResponse.json({ message: error.message }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch upcoming games' },
      { status: 500 }
    )
  }
}
