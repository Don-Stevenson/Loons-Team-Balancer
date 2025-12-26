import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import balanceTeams from '../../../lib/utils/balanceTeams'
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

// POST balance teams
export async function POST(request) {
  try {
    await authenticateRequest(request)

    const body = await request.json()
    const { numTeams, players } = body

    // Validate request body
    if (!body) {
      console.error('No request body received')
      return NextResponse.json(
        { error: 'No request body received' },
        { status: 400 }
      )
    }

    if (!numTeams) {
      console.error('No numTeams provided')
      return NextResponse.json(
        { error: 'Number of teams is required' },
        { status: 400 }
      )
    }

    const parsedNumTeams = parseInt(numTeams, 10)
    if (isNaN(parsedNumTeams) || parsedNumTeams < 2) {
      console.error('Invalid number of teams:', numTeams)
      return NextResponse.json(
        { error: 'Invalid number of teams' },
        { status: 400 }
      )
    }

    if (!players) {
      console.error('No players array provided')
      return NextResponse.json(
        { error: 'Players array is required' },
        { status: 400 }
      )
    }

    // Ensure players is an array
    let playersArray = players
    if (typeof players === 'string') {
      try {
        // Try to parse the string as JSON
        playersArray = JSON.parse(players)
      } catch (e) {
        console.error('Failed to parse players string:', e)
        return NextResponse.json(
          { error: 'Invalid players data format' },
          { status: 400 }
        )
      }
    }

    if (!Array.isArray(playersArray)) {
      console.error('Players is not an array:', typeof playersArray)
      return NextResponse.json(
        { error: 'Players must be an array' },
        { status: 400 }
      )
    }

    if (playersArray.length === 0) {
      console.error('Empty players array')
      return NextResponse.json(
        { error: 'Players array cannot be empty' },
        { status: 400 }
      )
    }

    // Clean up player data
    const cleanedPlayers = playersArray.map((player, index) => {
      if (!player || typeof player !== 'object') {
        console.error(`Invalid player at index ${index}:`, player)
        throw new Error(`Invalid player data structure at index ${index}`)
      }

      const cleanedPlayer = {
        name: String(player.name || ''),
        gameKnowledgeScore: Number(player.gameKnowledgeScore || 0),
        goalScoringScore: Number(player.goalScoringScore || 0),
        attackScore: Number(player.attackScore || 0),
        midfieldScore: Number(player.midfieldScore || 0),
        defenseScore: Number(player.defenseScore || 0),
        fitnessScore: Number(player.fitnessScore || 0),
        gender: String(player.gender || 'male'),
        isPlayingThisWeek: Boolean(player.isPlayingThisWeek),
      }

      // Validate cleaned player data
      if (!cleanedPlayer.name) {
        throw new Error(`Player at index ${index} has no name`)
      }

      if (
        cleanedPlayer.gameKnowledgeScore < 0 ||
        cleanedPlayer.gameKnowledgeScore > 10 ||
        cleanedPlayer.goalScoringScore < 0 ||
        cleanedPlayer.goalScoringScore > 10 ||
        cleanedPlayer.attackScore < 0 ||
        cleanedPlayer.attackScore > 10 ||
        cleanedPlayer.midfieldScore < 0 ||
        cleanedPlayer.midfieldScore > 10 ||
        cleanedPlayer.defenseScore < 0 ||
        cleanedPlayer.defenseScore > 10 ||
        cleanedPlayer.fitnessScore < 0 ||
        cleanedPlayer.fitnessScore > 10
      ) {
        throw new Error(
          `Player ${cleanedPlayer.name} has invalid scores (must be between 0 and 10)`
        )
      }

      if (!['male', 'female', 'nonBinary'].includes(cleanedPlayer.gender)) {
        throw new Error(
          `Player ${cleanedPlayer.name} has invalid gender: ${cleanedPlayer.gender}`
        )
      }

      return cleanedPlayer
    })

    const { teams, totalPlayersPlaying } = balanceTeams(
      cleanedPlayers,
      parsedNumTeams
    )
    return NextResponse.json({ teams, totalPlayersPlaying })
  } catch (error) {
    console.error('Error processing balance teams request:', error)

    if (
      error.message.includes('Unauthenticated') ||
      error.message.includes('Token') ||
      error.message.includes('Session')
    ) {
      return NextResponse.json({ message: error.message }, { status: 401 })
    }

    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
