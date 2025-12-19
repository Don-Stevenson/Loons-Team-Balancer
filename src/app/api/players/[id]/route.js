import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import connectDB from '../../../../lib/db/connectDB'
import Player from '../../../../lib/models/Player'
import jwt from 'jsonwebtoken'
import { isBlacklisted } from '../../../../lib/utils/tokenBlacklist'
import { isSessionValid } from '../../../../lib/utils/sessionStore'

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

// PUT update player
export async function PUT(request, { params }) {
  try {
    await authenticateRequest(request)
    await connectDB()

    const { id } = await params
    const updateData = await request.json()

    // Check if this is just updating isPlayingThisWeek
    if (
      Object.keys(updateData).length === 1 &&
      'isPlayingThisWeek' in updateData
    ) {
      const updatedPlayer = await Player.findByIdAndUpdate(
        id,
        { isPlayingThisWeek: updateData.isPlayingThisWeek },
        { new: true, runValidators: true }
      )

      if (!updatedPlayer) {
        return NextResponse.json(
          { message: 'Player not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(updatedPlayer)
    }

    // Full player info update
    const {
      name,
      gameKnowledgeScore,
      goalScoringScore,
      attackScore,
      midfieldScore,
      defenseScore,
      fitnessScore,
      isPlayingThisWeek,
      gender,
    } = updateData

    // Validate required fields
    if (!name || !gender) {
      return NextResponse.json(
        { message: 'Name and gender are required' },
        { status: 400 }
      )
    }

    // Validate scores
    const scoreFields = [
      { name: 'gameKnowledgeScore', value: gameKnowledgeScore },
      { name: 'goalScoringScore', value: goalScoringScore },
      { name: 'attackScore', value: attackScore },
      { name: 'midfieldScore', value: midfieldScore },
      { name: 'defenseScore', value: defenseScore },
      { name: 'fitnessScore', value: fitnessScore },
    ]

    for (const field of scoreFields) {
      const score = Number(field.value)
      if (isNaN(score) || score < 1 || score > 10) {
        return NextResponse.json(
          { message: `${field.name} must be between 1 and 10` },
          { status: 400 }
        )
      }
    }

    // Validate gender
    if (!['male', 'female', 'nonBinary'].includes(gender)) {
      return NextResponse.json(
        { message: 'Gender must be male, female, or nonBinary' },
        { status: 400 }
      )
    }

    const updatedPlayer = await Player.findByIdAndUpdate(
      id,
      {
        name,
        gameKnowledgeScore: Number(gameKnowledgeScore),
        goalScoringScore: Number(goalScoringScore),
        attackScore: Number(attackScore),
        midfieldScore: Number(midfieldScore),
        defenseScore: Number(defenseScore),
        fitnessScore: Number(fitnessScore),
        isPlayingThisWeek: Boolean(isPlayingThisWeek),
        gender,
      },
      { new: true, runValidators: true }
    )

    if (!updatedPlayer) {
      return NextResponse.json({ message: 'Player not found' }, { status: 404 })
    }

    return NextResponse.json(updatedPlayer)
  } catch (error) {
    console.error('Update player error:', error)

    if (
      error.message.includes('Unauthenticated') ||
      error.message.includes('Token') ||
      error.message.includes('Session')
    ) {
      return NextResponse.json({ message: error.message }, { status: 401 })
    }

    if (error.name === 'CastError' || error.name === 'ValidationError') {
      return NextResponse.json(
        { message: 'Invalid data format', error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// DELETE a player
export async function DELETE(request, { params }) {
  try {
    await authenticateRequest(request)
    await connectDB()

    const { id } = await params
    const deletedPlayer = await Player.findByIdAndDelete(id)

    if (!deletedPlayer) {
      return NextResponse.json({ message: 'Player not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Player deleted successfully' })
  } catch (error) {
    console.error('Delete player error:', error)

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
