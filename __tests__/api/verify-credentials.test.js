// Mock NextResponse before importing
jest.mock('next/server', () => {
  class MockNextResponse extends Response {
    constructor(body, init = {}) {
      super(body, init)
      this._jsonData = null
      // Make headers.set chainable and store headers properly
      const headersMap = new Map()
      // Initialize with existing headers
      if (init.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          headersMap.set(key.toLowerCase(), value)
        })
      }
      this.headers = {
        get: name => headersMap.get(name.toLowerCase()),
        set: (name, value) => {
          headersMap.set(name.toLowerCase(), value)
          return this.headers
        },
        has: name => headersMap.has(name.toLowerCase()),
      }
    }

    static json(data, init = {}) {
      const response = new MockNextResponse(JSON.stringify(data), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...init.headers,
        },
      })
      response._jsonData = data
      return response
    }

    async json() {
      if (this._jsonData !== null) {
        return this._jsonData
      }
      const text = await this.text()
      return text ? JSON.parse(text) : null
    }
  }

  return {
    NextResponse: MockNextResponse,
  }
})

// Mock the dependencies
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

jest.mock('../../src/lib/db/connectDB', () => jest.fn())

jest.mock('../../src/lib/models/User', () => ({
  findOne: jest.fn(),
}))

jest.mock('../../src/lib/utils/cors', () => ({
  corsHeaders: jest.fn(() => ({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })),
}))

import bcrypt from 'bcryptjs'
import connectDB from '../../src/lib/db/connectDB'
import User from '../../src/lib/models/User'
import { corsHeaders } from '../../src/lib/utils/cors'
import { POST, OPTIONS } from '../../src/app/api/verify-credentials/route'

describe('Verify Credentials API Route', () => {
  let mockRequest

  beforeEach(() => {
    jest.clearAllMocks()
    mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue('http://localhost:3000'),
      },
      json: jest.fn(),
    }

    // Set environment variables
    process.env.NODE_ENV = 'test'
  })

  afterEach(() => {
    delete process.env.NODE_ENV
  })

  describe('OPTIONS - CORS preflight', () => {
    it('should return 200 with CORS headers', async () => {
      const response = await OPTIONS(mockRequest)

      expect(response.status).toBe(200)
      expect(corsHeaders).toHaveBeenCalledWith('http://localhost:3000')
    })

    it('should handle different origins correctly', async () => {
      mockRequest.headers.get.mockReturnValue('https://example.com')

      await OPTIONS(mockRequest)

      expect(corsHeaders).toHaveBeenCalledWith('https://example.com')
    })
  })

  describe('POST - Successful Verification', () => {
    beforeEach(() => {
      connectDB.mockResolvedValue(true)
    })

    it('should successfully verify valid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: 'hashedPassword',
      }

      User.findOne.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(true)

      mockRequest.json.mockResolvedValue({
        username: 'testuser',
        password: 'correctPassword',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(connectDB).toHaveBeenCalled()
      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' })
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'correctPassword',
        'hashedPassword'
      )
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Credentials verified')
    })

    it('should include CORS headers in successful response', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: 'hashedPassword',
      }

      User.findOne.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(true)

      mockRequest.json.mockResolvedValue({
        username: 'testuser',
        password: 'correctPassword',
      })

      const response = await POST(mockRequest)

      expect(corsHeaders).toHaveBeenCalledWith('http://localhost:3000')
      expect(response.headers.get('access-control-allow-origin')).toBe('*')
    })

    it('should not create a session or token', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: 'hashedPassword',
      }

      User.findOne.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(true)

      mockRequest.json.mockResolvedValue({
        username: 'testuser',
        password: 'correctPassword',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      // Should not have token or session-related data
      expect(data.token).toBeUndefined()
      expect(data.sessionId).toBeUndefined()
      expect(response.cookies).toBeUndefined()
    })
  })

  describe('POST - Validation Errors', () => {
    beforeEach(() => {
      connectDB.mockResolvedValue(true)
    })

    it('should return 400 when username is missing', async () => {
      mockRequest.json.mockResolvedValue({
        password: 'password',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Missing required fields')
      expect(User.findOne).not.toHaveBeenCalled()
    })

    it('should return 400 when password is missing', async () => {
      mockRequest.json.mockResolvedValue({
        username: 'testuser',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Missing required fields')
      expect(User.findOne).not.toHaveBeenCalled()
    })

    it('should return 400 when both fields are missing', async () => {
      mockRequest.json.mockResolvedValue({})

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Missing required fields')
    })
  })

  describe('POST - Authentication Errors', () => {
    beforeEach(() => {
      connectDB.mockResolvedValue(true)
    })

    it('should return 401 when user is not found', async () => {
      User.findOne.mockResolvedValue(null)

      mockRequest.json.mockResolvedValue({
        username: 'nonexistent',
        password: 'password',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Invalid credentials')
      expect(bcrypt.compare).not.toHaveBeenCalled()
    })

    it('should return 401 when password is incorrect', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: 'hashedPassword',
      }

      User.findOne.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(false)

      mockRequest.json.mockResolvedValue({
        username: 'testuser',
        password: 'wrongPassword',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Invalid credentials')
    })

    it('should not reveal whether username or password was incorrect', async () => {
      // Test with non-existent username
      User.findOne.mockResolvedValue(null)
      mockRequest.json.mockResolvedValue({
        username: 'nonexistent',
        password: 'password',
      })

      const response1 = await POST(mockRequest)
      const data1 = await response1.json()

      // Test with wrong password
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: 'hashedPassword',
      }
      User.findOne.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(false)
      mockRequest.json.mockResolvedValue({
        username: 'testuser',
        password: 'wrongPassword',
      })

      const response2 = await POST(mockRequest)
      const data2 = await response2.json()

      // Both should return the same generic error message
      expect(data1.message).toBe(data2.message)
      expect(data1.message).toBe('Invalid credentials')
    })
  })

  describe('POST - Server Errors', () => {
    it('should return 500 when database connection fails', async () => {
      connectDB.mockRejectedValue(new Error('Database connection failed'))

      mockRequest.json.mockResolvedValue({
        username: 'testuser',
        password: 'password',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Server error')
    })

    it('should return 500 when user lookup fails', async () => {
      connectDB.mockResolvedValue(true)
      User.findOne.mockRejectedValue(new Error('Database query failed'))

      mockRequest.json.mockResolvedValue({
        username: 'testuser',
        password: 'password',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Server error')
    })

    it('should return 500 when password comparison fails', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: 'hashedPassword',
      }

      connectDB.mockResolvedValue(true)
      User.findOne.mockResolvedValue(mockUser)
      bcrypt.compare.mockRejectedValue(new Error('Bcrypt error'))

      mockRequest.json.mockResolvedValue({
        username: 'testuser',
        password: 'password',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Server error')
    })
  })

  describe('POST - CORS Headers', () => {
    beforeEach(() => {
      connectDB.mockResolvedValue(true)
    })

    it('should include CORS headers in error responses', async () => {
      mockRequest.json.mockResolvedValue({})

      const response = await POST(mockRequest)

      expect(corsHeaders).toHaveBeenCalledWith('http://localhost:3000')
      expect(response.headers.get('access-control-allow-origin')).toBe('*')
    })

    it('should handle different origins correctly', async () => {
      mockRequest.headers.get.mockReturnValue('https://example.com')
      mockRequest.json.mockResolvedValue({
        username: 'testuser',
        password: 'password',
      })

      User.findOne.mockResolvedValue({
        username: 'testuser',
        password: 'hashedPassword',
      })
      bcrypt.compare.mockResolvedValue(true)

      await POST(mockRequest)

      expect(corsHeaders).toHaveBeenCalledWith('https://example.com')
    })
  })
})
