import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '../../../lib/db/connectDB'
import User from '../../../lib/models/User'
import { corsHeaders } from '../../../lib/utils/cors'

export async function OPTIONS(request) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(origin),
  })
}

export async function POST(request) {
  const origin = request.headers.get('origin')

  try {
    await connectDB()

    const { username, password } = await request.json()

    // Validate inputs
    if (!username || !password) {
      const response = NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
      const headers = corsHeaders(origin)
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    // Find user
    const user = await User.findOne({ username })
    if (!user) {
      const response = NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
      const headers = corsHeaders(origin)
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      const response = NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
      const headers = corsHeaders(origin)
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    // Credentials are valid - return success without creating session
    const response = NextResponse.json({
      success: true,
      message: 'Credentials verified',
    })

    const headers = corsHeaders(origin)
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  } catch (error) {
    console.error('Credential verification error:', error)
    const response = NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
    const headers = corsHeaders(origin)
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }
}
