// Mock NextResponse before importing
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init = {}) => {
      const response = new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...init.headers,
        },
      })
      response._jsonData = data
      // Make headers.set chainable and store headers properly
      const headersMap = new Map()
      response.headers = {
        get: (name) => headersMap.get(name.toLowerCase()),
        set: (name, value) => {
          headersMap.set(name.toLowerCase(), value)
          return response.headers
        },
        has: (name) => headersMap.has(name.toLowerCase()),
      }
      return response
    },
  },
}))

// Mock the dependencies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}))

jest.mock('../../src/lib/utils/tokenBlacklist', () => ({
  isBlacklisted: jest.fn(),
}))

jest.mock('../../src/lib/utils/sessionStore', () => ({
  isSessionValid: jest.fn(),
}))

// Mock the getUpcomingGames module
jest.mock('../../src/lib/utils/getUpcomingGames', () => ({
  getUpcomingGamesList: jest.fn(),
}))

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { isBlacklisted } from '../../src/lib/utils/tokenBlacklist'
import { isSessionValid } from '../../src/lib/utils/sessionStore'
import { getUpcomingGamesList } from '../../src/lib/utils/getUpcomingGames'
import { GET } from '../../src/app/api/upcoming-games/route'

describe('Upcoming Games API Route', () => {
  let mockRequest

  beforeEach(() => {
    jest.clearAllMocks()
    mockRequest = {
      headers: {
        get: jest.fn(),
      },
    }

    // Default successful auth setup
    cookies.mockReturnValue({
      get: jest.fn().mockReturnValue({ value: 'valid-token' }),
    })
    isBlacklisted.mockReturnValue(false)
    isSessionValid.mockReturnValue(true)
    jwt.verify.mockReturnValue({ userId: 'user123' })

    // Set environment variables
    process.env.JWT_SECRET = 'test-secret'
    process.env.TEAM_ID = 'team123'
    process.env.REFRESH_TOKEN = 'refresh-token'
  })

  afterEach(() => {
    delete process.env.JWT_SECRET
    delete process.env.TEAM_ID
    delete process.env.REFRESH_TOKEN
  })

  describe('Successful Requests', () => {
    it('should return games when Heja is working', async () => {
      const mockGames = [
        { _id: 'game1', title: 'Game 1', meetdate: '2024-01-01' },
        { _id: 'game2', title: 'Game 2', meetdate: '2024-01-02' },
      ]
      getUpcomingGamesList.mockResolvedValue(mockGames)

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockGames)
      expect(response.headers.get('Cache-Control')).toContain('no-cache')
    })

    it('should set proper no-cache headers', async () => {
      getUpcomingGamesList.mockResolvedValue([])

      const response = await GET(mockRequest)

      expect(response.headers.get('Cache-Control')).toBe(
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      )
      expect(response.headers.get('Pragma')).toBe('no-cache')
      expect(response.headers.get('Expires')).toBe('0')
    })
  })

  describe('Heja Error Handling', () => {
    it('should return error object when Heja is down', async () => {
      getUpcomingGamesList.mockRejectedValue(
        new Error('Failed to fetch from Heja API')
      )

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        error: true,
        message: 'Heja is currently unavailable. Please try again later.',
        games: [],
      })
    })

    it('should return error object when Heja times out', async () => {
      getUpcomingGamesList.mockRejectedValue(new Error('Request timeout'))

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(data.error).toBe(true)
      expect(data.message).toBe(
        'Heja is currently unavailable. Please try again later.'
      )
      expect(data.games).toEqual([])
    })

    it('should return error object when network error occurs', async () => {
      getUpcomingGamesList.mockRejectedValue(
        new Error('Network error: ECONNREFUSED')
      )

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(data.error).toBe(true)
      expect(data.games).toEqual([])
    })
  })

  describe('Configuration Errors', () => {
    it('should return error message when TEAM_ID is missing', async () => {
      delete process.env.TEAM_ID

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(data.message).toContain('not configured')
      expect(data.games).toEqual([])
      expect(getUpcomingGamesList).not.toHaveBeenCalled()
    })

    it('should return error message when REFRESH_TOKEN is missing', async () => {
      delete process.env.REFRESH_TOKEN

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(data.message).toContain('not configured')
      expect(data.games).toEqual([])
      expect(getUpcomingGamesList).not.toHaveBeenCalled()
    })
  })

  describe('Authentication Errors', () => {
    it('should return 401 when token is missing', async () => {
      cookies.mockReturnValue({
        get: jest.fn().mockReturnValue(undefined),
      })
      mockRequest.headers.get.mockReturnValue(null)

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toContain('Unauthenticated')
    })

    it('should return 401 when token is blacklisted', async () => {
      isBlacklisted.mockReturnValue(true)

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toContain('invalidated')
    })

    it('should return 401 when session is invalid', async () => {
      isSessionValid.mockReturnValue(false)

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toContain('invalidated')
    })

    it('should return 401 when token is expired', async () => {
      jwt.verify.mockImplementation(() => {
        const error = new Error('Token expired')
        error.name = 'TokenExpiredError'
        throw error
      })

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toContain('expired')
    })
  })
})
