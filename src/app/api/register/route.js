import { NextResponse } from 'next/server'
// import jwt from 'jsonwebtoken'
import connectDB from '../../../lib/db/connectDB'
// import User from '../../../lib/models/User'
// import { createSession } from '../../../lib/utils/sessionStore'
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

    // // Check if user already exists
    // const existingUser = await User.findOne({ username })
    // if (existingUser) {
    //   const response = NextResponse.json(
    //     { message: 'Username already exists' },
    //     { status: 409 }
    //   )

    //   const headers = corsHeaders(origin)
    //   Object.entries(headers).forEach(([key, value]) => {
    //     response.headers.set(key, value)
    //   })

    //   return response
    // }

    // // Create new user (password will be hashed by the model's pre-save hook)
    // const newUser = new User({
    //   username,
    //   password, // Don't hash here - let the model's pre-save hook handle it
    // })

    // await newUser.save()

    // // Generate token and auto-login the user
    // const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
    //   expiresIn: '1h',
    // })

    // // Create session
    // createSession(newUser._id, token)

    // const isProduction = process.env.NODE_ENV === 'production'

    // const response = NextResponse.json({
    //   success: true,
    //   message: 'User registered successfully',
    //   userId: newUser._id,
    // })

    // response.cookies.set('token', token, {
    //   httpOnly: true,
    //   secure: isProduction,
    //   sameSite: 'lax', // Use 'lax' for better compatibility
    //   maxAge: 3600000, // 1 hour
    //   path: '/',
    // })
    // return failed response while the above code is commented out
    const response = NextResponse.json({
      success: false,
      message: 'User registration failed',
    })

    const headers = corsHeaders(origin)
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
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
