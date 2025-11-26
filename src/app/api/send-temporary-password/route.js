import { NextResponse } from 'next/server'
import connectDB from '../../../lib/db/connectDB'
import User from '../../../lib/models/User'
import { corsHeaders } from '../../../lib/utils/cors'
import { sendTemporaryPasswordEmail } from '../../utils/emailSender'

// function to send a temporary password to the user's email
// the temporary password will be a random string of 8 characters
// the temporary password will be sent to the user's email
export async function POST(request) {
  const origin = request.headers.get('origin')

  try {
    await connectDB()

    const { email, username } = await request.json()

    // Try to find user by email first, fall back to username
    const query = email ? { email } : { username }
    const user = await User.findOne(query)

    if (!user) {
      const response = NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
      const headers = corsHeaders(origin)
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    const generateTemporaryPassword = () => {
      return Math.random().toString(36).substring(2, 15) // generate a random string of 8 characters
    }

    const temporaryPassword = generateTemporaryPassword()
    user.password = temporaryPassword
    await user.save()

    // Send the temporary password via email
    try {
      await sendTemporaryPasswordEmail(
        user.username, // username is the email address
        user.username || user.name || 'User',
        temporaryPassword
      )
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
      console.error('Email error details:', {
        message: emailError.message,
        code: emailError.code,
        command: emailError.command,
      })
      // You might want to handle this differently - either fail the request or succeed with a warning
      const response = NextResponse.json(
        {
          success: false,
          message:
            'Password reset but failed to send email. Please contact support.',
          error: emailError.message, // Include error in response for debugging
        },
        { status: 500 }
      )
      const headers = corsHeaders(origin)
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    const response = NextResponse.json({
      success: true,
      message: 'Temporary password sent to your email',
    })

    const headers = corsHeaders(origin)
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  } catch (error) {
    console.error('Error sending temporary password:', error)
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
    const headers = corsHeaders(origin)
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }
}
