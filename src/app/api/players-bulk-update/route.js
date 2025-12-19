import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import connectDB from '../../../lib/db/connectDB'
import Player from '../../../lib/models/Player'
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

// PUT bulk update players
export async function PUT(request) {
  try {
    await authenticateRequest(request)
    await connectDB()

    const { isPlayingThisWeek, playerIds } = await request.json()

    // Validate playerIds
    if (!Array.isArray(playerIds) || playerIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'playerIds must be a non-empty array',
        },
        { status: 400 }
      )
    }

    // Ensure all playerIds are strings
    const sanitizedPlayerIds = playerIds.map(id => String(id))

    // Update the players
    const result = await Player.updateMany(
      { _id: { $in: sanitizedPlayerIds } },
      { $set: { isPlayingThisWeek: Boolean(isPlayingThisWeek) } }
    )

    return NextResponse.json({
      success: true,
      message: 'Players updated successfully',
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error('Bulk update players error:', error)

    if (
      error.message.includes('Unauthenticated') ||
      error.message.includes('Token') ||
      error.message.includes('Session')
    ) {
      return NextResponse.json({ message: error.message }, { status: 401 })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update players',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
