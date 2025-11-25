// utils/api.js
import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/api'
      : '/api', // Use relative URL in production to avoid CORS issues
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  config => {
    // Add cache-busting headers for GET requests in production
    if (config.method === 'get' && process.env.NODE_ENV === 'production') {
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
      config.headers['Pragma'] = 'no-cache'
      config.headers['Expires'] = '0'

      // Add timestamp to prevent caching
      if (!config.params) {
        config.params = {}
      }
      config.params._t = Date.now()
    }

    // Only stringify if data exists and is an object
    if (config.data && typeof config.data === 'object') {
      // Ensure arrays are properly stringified
      if (Array.isArray(config.data.players)) {
        config.data = {
          ...config.data,
          players: config.data.players,
        }
      }
      config.data = JSON.stringify(config.data)
    }
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Handle 401 Unauthorized errors, but don't retry auth/check calls, logout calls, or verify-credentials calls
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/check') &&
      !originalRequest.url?.includes('/logout') &&
      !originalRequest.url?.includes('/verify-credentials')
    ) {
      originalRequest._retry = true

      try {
        const authCheck = await api.get('/auth/check')

        if (authCheck.status === 200) {
          return api(originalRequest)
        }
      } catch (authError) {
        // Auth check failed, user is likely logged out
        // Just return the original error instead of the auth error
        console.error('Auth check failed during retry, user likely logged out')
        return Promise.reject(error)
      }
    }

    // Only log errors that aren't expected 401s after logout or verify-credentials
    if (
      !(
        error.response?.status === 401 &&
        (originalRequest.url?.includes('/auth/check') ||
          originalRequest.url?.includes('/logout') ||
          originalRequest.url?.includes('/verify-credentials'))
      )
    ) {
      console.error('API Error:', error.response)
    }

    return Promise.reject(error)
  }
)

// Helper function to log persistently
const logPersistent = (message, data = null) => {
  const timestamp = new Date().toISOString()
  const logEntry = { timestamp, message, data }

  // Store in localStorage
  const logs = JSON.parse(localStorage.getItem('authLogs') || '[]')
  logs.push(logEntry)
  if (logs.length > 50) logs.shift() // Keep only last 50 entries
  localStorage.setItem('authLogs', JSON.stringify(logs))
}

// React Query compatible API functions
export const apiService = {
  // Players
  players: {
    getAll: async () => {
      const response = await api.get('/players')
      return response.data.map(player => ({
        ...player,
        isPlayingThisWeek: Boolean(player.isPlayingThisWeek),
      }))
    },

    getById: async id => {
      const response = await api.get(`/players/${id}`)
      return response.data
    },

    create: async playerData => {
      const response = await api.post('/players', playerData)
      return {
        ...response.data,
        isPlayingThisWeek: Boolean(response.data.isPlayingThisWeek),
        gameKnowledgeScore: parseInt(response.data.gameKnowledgeScore),
        goalScoringScore: parseInt(response.data.goalScoringScore),
        attackScore: parseInt(response.data.attackScore),
        midfieldScore: parseInt(response.data.midfieldScore),
        defenseScore: parseInt(response.data.defenseScore),
        fitnessScore: parseInt(response.data.fitnessScore),
      }
    },

    update: async ({ id, ...playerData }) => {
      const formattedData = {
        ...playerData,
        gameKnowledgeScore: parseInt(playerData.gameKnowledgeScore, 10),
        goalScoringScore: parseInt(playerData.goalScoringScore, 10),
        attackScore: parseInt(playerData.attackScore, 10),
        midfieldScore: parseInt(playerData.midfieldScore, 10),
        defenseScore: parseInt(playerData.defenseScore, 10),
        fitnessScore: parseInt(playerData.fitnessScore, 10),
        isPlayingThisWeek: playerData.isPlayingThisWeek.toString(),
      }

      const response = await api.put(`/players/${id}/playerInfo`, formattedData)
      return {
        ...response.data,
        isPlayingThisWeek: Boolean(response.data.isPlayingThisWeek),
      }
    },

    delete: async id => {
      await api.delete(`/players/${id}`)
      return { id }
    },

    bulkUpdate: async ({ isPlayingThisWeek, playerIds }) => {
      const response = await api.put('/players-bulk-update', {
        isPlayingThisWeek,
        playerIds,
      })
      return response.data
    },
  },

  // Games
  games: {
    getUpcoming: async () => {
      const response = await api.get('/upcoming-games')
      // If the response includes an error flag, return the full object
      if (response.data && response.data.error) {
        return response.data
      }
      // Otherwise return just the games array for backward compatibility
      return Array.isArray(response.data)
        ? response.data
        : response.data?.games || []
    },

    getRsvps: async gameId => {
      const response = await api.get(`/rsvps-for-game/${gameId}`)
      return response.data
    },
  },

  // Teams
  teams: {
    balance: async ({ numTeams, players }) => {
      const response = await api.post('/balance-teams', { numTeams, players })
      return response.data
    },
  },

  // Auth
  auth: {
    check: async () => {
      try {
        logPersistent('Auth check attempt')
        const response = await api.get('/auth/check')
        logPersistent('Auth check successful', response.data)
        return response.data.success
      } catch (error) {
        if (error.response?.status !== 401) {
          logPersistent('Auth check failed', {
            status: error.response?.status,
            data: error.response?.data,
          })
        }
        return false
      }
    },

    login: async ({ username, password }) => {
      try {
        logPersistent('Login attempt', { username })
        const response = await api.post('/login', { username, password })
        logPersistent('Login successful', response.data)
        return response.data
      } catch (error) {
        logPersistent('Login failed', { error: error.message })
        console.error('Login Error:', error)
        throw error
      }
    },

    verifyCredentials: async ({ username, password }) => {
      try {
        logPersistent('Verify credentials attempt', { username })
        const response = await api.post('/verify-credentials', {
          username,
          password,
        })
        logPersistent('Credentials verified', response.data)
        return response.data
      } catch (error) {
        logPersistent('Credential verification failed', {
          error: error.message,
        })
        console.error('Credential verification error:', error)
        throw error
      }
    },
    resetPassword: async ({ username, currentPassword, newPassword }) => {
      try {
        const response = await api.post('/reset-password', {
          username,
          currentPassword,
          newPassword,
        })
        return response.data
      } catch (error) {
        logPersistent('Reset password failed', { error: error.message })
        console.error('Reset password Error:', error)
        throw error
      }
    },

    forceResetPassword: async ({ username, newPassword }) => {
      try {
        const response = await api.post('/force-reset-password', {
          username,
          newPassword,
        })
        return response.data
      } catch (error) {
        logPersistent('Force reset password failed', { error: error.message })
        console.error('Force reset password Error:', error)
        throw error
      }
    },

    logout: async () => {
      try {
        logPersistent('Logout attempt')
        const response = await api.post('/logout')
        logPersistent('Logout successful', response.data)

        // Manual cookie clearing as backup
        const isProduction = process.env.NODE_ENV === 'production'
        document.cookie =
          'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

        if (!isProduction) {
          // Local development domains
          document.cookie =
            'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;'
          document.cookie =
            'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost;'
          document.cookie =
            'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost:3000;'
        }

        logPersistent('Manual cookie clearing attempted')
        return response.data
      } catch (error) {
        logPersistent('Logout failed', { error: error.message })
        console.error('Logout Error:', error)
        throw error
      }
    },
  },
}

// Keep existing functions for backward compatibility
export const login = async (username, password) => {
  return apiService.auth.login({ username, password })
}

export const logout = async () => {
  return apiService.auth.logout()
}

export const checkAuth = async () => {
  return apiService.auth.check()
}

export default api
