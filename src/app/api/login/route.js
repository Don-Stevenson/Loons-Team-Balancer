import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import connectDB from '../../../lib/db/connectDB'
import User from '../../../lib/models/User'
import { createSession } from '../../../lib/utils/sessionStore'
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
    const body = await request.json()

    const { username, password } = body

    const user = await User.findOne({ username })
    if (!user) {
      console.error('missing user')

      const response = NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )

      const headers = corsHeaders(origin)
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      const response = NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )

      const headers = corsHeaders(origin)
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })

    // Create session
    createSession(user._id, token)

    const isProduction = process.env.NODE_ENV === 'production'

    const response = NextResponse.json({ success: true })

    // Add CORS headers
    const headers = corsHeaders(origin)
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax', // Use 'lax' for better compatibility
      maxAge: 3600000, // 1 hour
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    const response = NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )

    const headers = corsHeaders(origin)
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }
}
