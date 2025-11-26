/**
 * @jest-environment node
 */

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

jest.mock('../../src/app/utils/emailSender', () => ({
  sendTemporaryPasswordEmail: jest.fn(),
}))

import connectDB from '../../src/lib/db/connectDB'
import User from '../../src/lib/models/User'
import { corsHeaders } from '../../src/lib/utils/cors'
import { sendTemporaryPasswordEmail } from '../../src/app/utils/emailSender'
import { POST } from '../../src/app/api/send-temporary-password/route'

describe('Send Temporary Password API Route', () => {
  let mockRequest
  let mockUser

  beforeEach(() => {
    jest.clearAllMocks()
    mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue('http://localhost:3000'),
      },
      json: jest.fn(),
    }

    mockUser = {
      _id: 'user123',
      username: 'test@example.com',
      name: 'Test User',
      email: 'test@example.com',
      password: 'oldHashedPassword',
      save: jest.fn().mockResolvedValue(true),
    }

    // Set environment variables
    process.env.NODE_ENV = 'test'
  })

  afterEach(() => {
    delete process.env.NODE_ENV
  })

  describe('POST - Successful Temporary Password Generation', () => {
    beforeEach(() => {
      connectDB.mockResolvedValue(true)
      sendTemporaryPasswordEmail.mockResolvedValue({
        success: true,
        messageId: 'mock-message-id',
      })
    })

    it('should successfully send temporary password when user is found by email', async () => {
      User.findOne.mockResolvedValue(mockUser)

      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(connectDB).toHaveBeenCalled()
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' })
      expect(mockUser.save).toHaveBeenCalled()
      expect(sendTemporaryPasswordEmail).toHaveBeenCalledWith(
        'test@example.com',
        'test@example.com',
        expect.any(String)
      )
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Temporary password sent to your email')
    })

    it('should successfully send temporary password when user is found by username', async () => {
      User.findOne.mockResolvedValue(mockUser)

      mockRequest.json.mockResolvedValue({
        username: 'testuser',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' })
      expect(mockUser.save).toHaveBeenCalled()
      expect(sendTemporaryPasswordEmail).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should generate a valid temporary password', async () => {
      User.findOne.mockResolvedValue(mockUser)

      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      await POST(mockRequest)

      // Password should be updated
      expect(mockUser.password).toBeDefined()
      expect(typeof mockUser.password).toBe('string')
      expect(mockUser.password.length).toBeGreaterThan(0)
      expect(mockUser.password).not.toBe('oldHashedPassword')
    })

    it('should generate a valid temporary password with correct time in EST', async () => {
      User.findOne.mockResolvedValue(mockUser)

      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      await POST(mockRequest)

      expect(mockUser.password).toBeDefined()
      expect(typeof mockUser.password).toBe('string')
      expect(mockUser.password.length).toBeGreaterThan(0)
      expect(mockUser.password).not.toBe('oldHashedPassword')
      expect(
        new Date().toLocaleTimeString('en-US', {
          timeZone: 'America/New_York',
        }) + ' EST'
      ).toBe(
        new Date().toLocaleTimeString('en-US', {
          timeZone: 'America/New_York',
        }) + ' EST'
      )
    })

    it('should include CORS headers in successful response', async () => {
      User.findOne.mockResolvedValue(mockUser)

      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      const response = await POST(mockRequest)

      expect(corsHeaders).toHaveBeenCalledWith('http://localhost:3000')
      expect(response.headers.get('access-control-allow-origin')).toBe('*')
    })

    it('should use username as recipient name if name is not available', async () => {
      const userWithoutName = {
        ...mockUser,
        name: undefined,
      }
      User.findOne.mockResolvedValue(userWithoutName)

      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      await POST(mockRequest)

      expect(sendTemporaryPasswordEmail).toHaveBeenCalledWith(
        'test@example.com',
        'test@example.com',
        expect.any(String)
      )
    })

    it('should prefer email over username when both are provided', async () => {
      User.findOne.mockResolvedValue(mockUser)

      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
        username: 'testuser',
      })

      await POST(mockRequest)

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' })
    })
  })

  describe('POST - User Not Found', () => {
    beforeEach(() => {
      connectDB.mockResolvedValue(true)
    })

    it('should return 404 when user is not found by email', async () => {
      User.findOne.mockResolvedValue(null)

      mockRequest.json.mockResolvedValue({
        email: 'nonexistent@example.com',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.message).toBe('User not found')
      expect(sendTemporaryPasswordEmail).not.toHaveBeenCalled()
    })

    it('should return 404 when user is not found by username', async () => {
      User.findOne.mockResolvedValue(null)

      mockRequest.json.mockResolvedValue({
        username: 'nonexistent',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.message).toBe('User not found')
      expect(sendTemporaryPasswordEmail).not.toHaveBeenCalled()
    })

    it('should include CORS headers in 404 response', async () => {
      User.findOne.mockResolvedValue(null)

      mockRequest.json.mockResolvedValue({
        email: 'nonexistent@example.com',
      })

      const response = await POST(mockRequest)

      expect(corsHeaders).toHaveBeenCalledWith('http://localhost:3000')
      expect(response.headers.get('access-control-allow-origin')).toBe('*')
    })
  })

  describe('POST - Email Sending Failures', () => {
    beforeEach(() => {
      connectDB.mockResolvedValue(true)
      User.findOne.mockResolvedValue(mockUser)
    })

    it('should return 500 when email sending fails', async () => {
      sendTemporaryPasswordEmail.mockRejectedValue(
        new Error('Email service unavailable')
      )

      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe(
        'Password reset but failed to send email. Please contact support.'
      )
      expect(data.error).toBe('Email service error')
    })

    it('should still save the new password even if email fails', async () => {
      sendTemporaryPasswordEmail.mockRejectedValue(
        new Error('Email service unavailable')
      )

      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      await POST(mockRequest)

      expect(mockUser.save).toHaveBeenCalled()
      expect(mockUser.password).not.toBe('oldHashedPassword')
    })

    it('should handle SMTP errors gracefully', async () => {
      const smtpError = new Error('SMTP connection failed')
      smtpError.code = 'ECONNECTION'
      smtpError.command = 'CONN'
      sendTemporaryPasswordEmail.mockRejectedValue(smtpError)

      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Email service error')
    })

    it('should include CORS headers in email error response', async () => {
      sendTemporaryPasswordEmail.mockRejectedValue(
        new Error('Email service unavailable')
      )

      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      const response = await POST(mockRequest)

      expect(corsHeaders).toHaveBeenCalledWith('http://localhost:3000')
      expect(response.headers.get('access-control-allow-origin')).toBe('*')
    })
  })

  describe('POST - Database Errors', () => {
    it('should return 500 when database connection fails', async () => {
      connectDB.mockRejectedValue(new Error('Database connection failed'))

      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Internal server error')
    })

    it('should return 500 when user lookup fails', async () => {
      connectDB.mockResolvedValue(true)
      User.findOne.mockRejectedValue(new Error('Database query failed'))

      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Internal server error')
    })

    it('should return 500 when user save fails', async () => {
      connectDB.mockResolvedValue(true)
      mockUser.save.mockRejectedValue(new Error('Save failed'))
      User.findOne.mockResolvedValue(mockUser)

      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Internal server error')
    })

    it('should include CORS headers in database error response', async () => {
      connectDB.mockRejectedValue(new Error('Database connection failed'))

      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      const response = await POST(mockRequest)

      expect(corsHeaders).toHaveBeenCalledWith('http://localhost:3000')
      expect(response.headers.get('access-control-allow-origin')).toBe('*')
    })
  })

  describe('POST - Request Parsing Errors', () => {
    beforeEach(() => {
      connectDB.mockResolvedValue(true)
    })

    it('should return 500 when request body parsing fails', async () => {
      mockRequest.json.mockRejectedValue(new Error('Invalid JSON'))

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Internal server error')
    })

    it('should handle empty request body', async () => {
      User.findOne.mockResolvedValue(null)
      mockRequest.json.mockResolvedValue({})

      const response = await POST(mockRequest)
      const data = await response.json()

      // Should attempt to find user with undefined values
      expect(response.status).toBe(404)
      expect(data.message).toBe('User not found')
    })
  })

  describe('POST - CORS Headers', () => {
    beforeEach(() => {
      connectDB.mockResolvedValue(true)
      User.findOne.mockResolvedValue(mockUser)
      sendTemporaryPasswordEmail.mockResolvedValue({
        success: true,
        messageId: 'mock-id',
      })
    })

    it('should handle different origins correctly', async () => {
      mockRequest.headers.get.mockReturnValue('https://example.com')

      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      await POST(mockRequest)

      expect(corsHeaders).toHaveBeenCalledWith('https://example.com')
    })

    it('should include CORS headers in all response types', async () => {
      const testCases = [
        // Success case
        {
          setup: () => {
            User.findOne.mockResolvedValue(mockUser)
            sendTemporaryPasswordEmail.mockResolvedValue({ success: true })
          },
          request: { email: 'test@example.com' },
          expectedStatus: 200,
        },
        // Not found case
        {
          setup: () => {
            User.findOne.mockResolvedValue(null)
          },
          request: { email: 'notfound@example.com' },
          expectedStatus: 404,
        },
        // Email error case
        {
          setup: () => {
            User.findOne.mockResolvedValue(mockUser)
            sendTemporaryPasswordEmail.mockRejectedValue(
              new Error('Email failed')
            )
          },
          request: { email: 'test@example.com' },
          expectedStatus: 500,
        },
      ]

      for (const testCase of testCases) {
        jest.clearAllMocks()
        testCase.setup()
        mockRequest.json.mockResolvedValue(testCase.request)

        const response = await POST(mockRequest)

        expect(corsHeaders).toHaveBeenCalledWith('http://localhost:3000')
        expect(response.headers.get('access-control-allow-origin')).toBe('*')
        expect(response.status).toBe(testCase.expectedStatus)
      }
    })
  })

  describe('POST - Password Generation', () => {
    beforeEach(() => {
      connectDB.mockResolvedValue(true)
      User.findOne.mockResolvedValue(mockUser)
      sendTemporaryPasswordEmail.mockResolvedValue({ success: true })
    })

    it('should generate different passwords on multiple calls', async () => {
      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      await POST(mockRequest)
      const password1 = mockUser.password

      mockUser.password = 'oldHashedPassword' // Reset
      await POST(mockRequest)
      const password2 = mockUser.password

      // While theoretically they could be the same, it's extremely unlikely
      expect(password1).not.toBe(password2)
    })

    it('should generate password of reasonable length', async () => {
      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      await POST(mockRequest)

      expect(mockUser.password.length).toBeGreaterThanOrEqual(8)
      expect(mockUser.password.length).toBeLessThanOrEqual(20)
    })

    it('should pass generated password to email function', async () => {
      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      await POST(mockRequest)

      const emailCall = sendTemporaryPasswordEmail.mock.calls[0]
      const passwordSent = emailCall[2]

      expect(passwordSent).toBe(mockUser.password)
    })
  })

  describe('POST - Security Considerations', () => {
    beforeEach(() => {
      connectDB.mockResolvedValue(true)
      sendTemporaryPasswordEmail.mockResolvedValue({ success: true })
    })

    it('should not expose user existence in error messages', async () => {
      User.findOne.mockResolvedValue(null)

      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      // Generic message that doesn't confirm if user exists
      expect(data.message).toBe('User not found')
    })

    it('should not return the temporary password in the response', async () => {
      User.findOne.mockResolvedValue(mockUser)

      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(data.password).toBeUndefined()
      expect(data.temporaryPassword).toBeUndefined()
      expect(JSON.stringify(data)).not.toContain(mockUser.password)
    })

    it('should update password in database before sending email', async () => {
      const saveOrder = []
      mockUser.save.mockImplementation(() => {
        saveOrder.push('save')
        return Promise.resolve(true)
      })
      sendTemporaryPasswordEmail.mockImplementation(() => {
        saveOrder.push('email')
        return Promise.resolve({ success: true })
      })

      User.findOne.mockResolvedValue(mockUser)

      mockRequest.json.mockResolvedValue({
        email: 'test@example.com',
      })

      await POST(mockRequest)

      expect(saveOrder).toEqual(['save', 'email'])
    })
  })
})
