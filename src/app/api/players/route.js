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

// GET all players
export async function GET(request) {
  try {
    await authenticateRequest(request)
    await connectDB()

    const players = await Player.find().select('-__v')

    // Create response with no-cache headers to prevent browser caching
    const response = NextResponse.json(players)
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    )
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  } catch (error) {
    console.error('Get players error:', error)
    if (
      error.message.includes('Unauthenticated') ||
      error.message.includes('Token') ||
      error.message.includes('Session')
    ) {
      return NextResponse.json({ message: error.message }, { status: 401 })
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// POST a new player
export async function POST(request) {
  try {
    await authenticateRequest(request)
    await connectDB()

    const playerData = await request.json()

    // Validation
    const requiredFields = [
      'name',
      'gameKnowledgeScore',
      'goalScoringScore',
      'attackScore',
      'midfieldScore',
      'defenseScore',
      'fitnessScore',
      'gender',
    ]

    for (const field of requiredFields) {
      if (!playerData[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate scores are between 1-10
    const scoreFields = [
      'gameKnowledgeScore',
      'goalScoringScore',
      'attackScore',
      'midfieldScore',
      'defenseScore',
      'fitnessScore',
    ]

    for (const field of scoreFields) {
      const score = Number(playerData[field])
      if (isNaN(score) || score < 1 || score > 10) {
        return NextResponse.json(
          { message: `${field} must be between 1 and 10` },
          { status: 400 }
        )
      }
    }

    // Validate gender
    if (!['male', 'female', 'nonBinary'].includes(playerData.gender)) {
      return NextResponse.json(
        { message: 'Gender must be male, female, or nonBinary' },
        { status: 400 }
      )
    }

    const player = new Player(playerData)
    const newPlayer = await player.save()
    return NextResponse.json(newPlayer, { status: 201 })
  } catch (error) {
    console.error('Create player error:', error)

    if (
      error.message.includes('Unauthenticated') ||
      error.message.includes('Token') ||
      error.message.includes('Session')
    ) {
      return NextResponse.json({ message: error.message }, { status: 401 })
    }

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(', ')
      return NextResponse.json({ message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
