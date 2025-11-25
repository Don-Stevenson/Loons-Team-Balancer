import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '../../../lib/db/connectDB'
import User from '../../../lib/models/User'
import { corsHeaders } from '../../../lib/utils/cors'

export async function POST(request) {
  const origin = request.headers.get('origin')

  try {
    await connectDB()

    const { username, currentPassword, newPassword } = await request.json()

    // Validate inputs
    if (!username || !currentPassword || !newPassword) {
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

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password)
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

    // Update password (will be automatically hashed by the User model's pre-save hook)
    user.password = newPassword
    await user.save()

    const response = NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    })

    const headers = corsHeaders(origin)
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  } catch (error) {
    console.error('Password reset error:', error)
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
