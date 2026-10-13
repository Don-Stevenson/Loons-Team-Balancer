// Environment variables
const teamId = process.env.TEAM_ID
const refreshToken = process.env.REFRESH_TOKEN

// GraphQL queries
const ACTIVITIES_QUERY = `
query UpcomingActivitiesList($teamid: String!, $cursor: String, $past: Boolean) {
  activities(input: { teamid: $teamid, cursor: $cursor, past: $past }) {
    edges {
      node {
        _id
        title
        startdate
        meetdate
        cancelled
        isPast
      }
    }
  }
}`

const ACTIVITY_QUERY = `
query GetActivity($teamid: String!, $activityid: String!) {
  activity(input: {teamid: $teamid, activityid: $activityid}) {
    node {
      ...Activity
    }
  }
}

fragment Activity on Activity {
  _id
  title
  startdate
  enddate
  meetdate
  location {
    name
    address
    country
    city
    longitude
    latitude
  }
  timezone
  venue
  inviteType
  invitedGroups
  isRecurring
  cancelled
  isPast
  maxAttendees
  rsvpDueDate
  members {
    _id
    attending
    attendanceDetails {
      category
      note
    }
    seen
    user {
      _id
      fullName
    }
  }
}`

// Heja auth tokens last 10 minutes, so reuse one until just before it expires
let authTokenCache = null
let authTokenValidTo = 0
const AUTH_TOKEN_EXPIRY_BUFFER = 60 * 1000 // 1 minute

// The refresh token is a JWT that lasts a year; warn ahead of time
const REFRESH_TOKEN_WARNING_DAYS = 30
let refreshTokenExpiryChecked = false

function warnIfRefreshTokenExpiringSoon() {
  if (refreshTokenExpiryChecked) return
  refreshTokenExpiryChecked = true

  try {
    const payload = JSON.parse(
      Buffer.from(refreshToken.split('.')[1], 'base64url').toString()
    )
    const daysLeft = Math.floor((payload.exp * 1000 - Date.now()) / 86400000)
    if (daysLeft <= REFRESH_TOKEN_WARNING_DAYS) {
      console.warn(
        `Heja REFRESH_TOKEN expires in ${daysLeft} days. Run \`npm run heja:login\` to create a new one.`
      )
    }
  } catch {
    // Not a JWT we can read; Heja will reject it if it's expired
  }
}

/**
 * Get GraphQL authentication token using refresh token
 * @returns {Promise<string>} The auth token
 */
async function getGraphqlToken() {
  if (
    authTokenCache &&
    Date.now() < authTokenValidTo - AUTH_TOKEN_EXPIRY_BUFFER
  ) {
    return authTokenCache
  }

  warnIfRefreshTokenExpiringSoon()

  try {
    const response = await fetch('https://auth.heja.io/login/refreshToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'heja-api-version': '3',
        'x-app-version-brand': 'web',
        Cookie: `refreshToken=${refreshToken}`,
      },
      body: JSON.stringify({
        credentialType: 'refreshToken',
        refreshToken: 'cookie',
      }),
    })

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        'Heja rejected REFRESH_TOKEN (expired or revoked). Run `npm run heja:login` to create a new one.'
      )
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    authTokenCache = data.data.authToken
    authTokenValidTo = Number(data.data.authTokenValidTo) || 0
    return authTokenCache
  } catch (error) {
    console.error('Error getting GraphQL token:', error)
    throw error
  }
}

/**
 * Make a GraphQL request to Heja API
 * @param {Object} query - The GraphQL query object
 * @returns {Promise<Object>} The response data
 */
async function hejaGraphqlRequest(query) {
  try {
    const token = await getGraphqlToken()

    const response = await fetch('https://web-api.heja.io/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:138.0) Gecko/20100101 Firefox/138.0',
      },
      body: JSON.stringify(query),
    })

    if (response.status === 401) {
      // Drop the cached auth token so the next request gets a fresh one
      authTokenCache = null
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error making GraphQL request:', error)
    throw error
  }
}

/**
 * Get upcoming games for a team
 * @param {Object} options - Options object
 * @param {string} options.teamId - The team ID
 * @param {string} [options.cursor] - Pagination cursor
 * @param {boolean} [options.past] - Whether to get past activities
 * @returns {Promise<Array>} Array of upcoming games
 */
async function upcomingGames({ teamId, cursor = null, past = false }) {
  try {
    const response = await hejaGraphqlRequest({
      operationName: 'UpcomingActivitiesList',
      variables: {
        teamid: teamId,
        cursor,
        past,
      },
      query: ACTIVITIES_QUERY,
    })

    return response.data.activities.edges.map((edge) => edge.node)
  } catch (error) {
    console.error('Error getting upcoming games:', error)
    throw error
  }
}

/**
 * Get RSVPs for a specific game
 * @param {Object} options - Options object
 * @param {string} options.teamId - The team ID
 * @param {string} options.gameId - The game/activity ID
 * @returns {Promise<Array<string>>} Array of full names of attendees
 */
export async function rsvpsForGame({ teamId, gameId }) {
  try {
    const response = await hejaGraphqlRequest({
      operationName: 'GetActivity',
      variables: {
        activityid: gameId,
        teamid: teamId,
      },
      query: ACTIVITY_QUERY,
    })

    const members = response.data.activity.node.members

    return members
      .filter((member) => member.attending)
      .map((member) => member.user.fullName)
  } catch (error) {
    console.error('Error getting RSVPs for game:', error)
    throw error
  }
}

async function getUpcomingGames() {
  try {
    // Validate environment variables at runtime
    if (!teamId || !refreshToken) {
      throw new Error(
        'Missing required environment variables: TEAM_ID and REFRESH_TOKEN must be set in .env.local'
      )
    }

    const games = await upcomingGames({ teamId })
    return games.slice(0, 5)
  } catch (error) {
    console.error('Error getting upcoming games:', error)
    throw error
  }
}

// Cache for upcoming games list
let upcomingGamesListCache = null
let cacheTime = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getUpcomingGamesList() {
  const now = Date.now()

  // Return cached data if still valid
  if (upcomingGamesListCache && cacheTime && now - cacheTime < CACHE_DURATION) {
    return upcomingGamesListCache
  }

  // Fetch fresh data
  try {
    const games = await getUpcomingGames()
    upcomingGamesListCache = games
    cacheTime = now
    return games
  } catch (error) {
    // Return cached data if available, even if stale
    if (upcomingGamesListCache) {
      console.warn('Returning stale games data due to error:', error)
      return upcomingGamesListCache
    }
    throw error
  }
}

export { upcomingGames, getUpcomingGames }
