import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import connectDB from '../../../lib/db/connectDB'
import User from '../../../lib/models/User'
import { invalidateSession } from '../../../lib/utils/sessionStore'
import { addToBlacklist } from '../../../lib/utils/tokenBlacklist'
import { corsHeaders } from '../../../lib/utils/cors'

export async function OPTIONS(request) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(origin),
  })
}

// export async function DELETE(request) {
//   const origin = request.headers.get('origin')

//   try {
//     await connectDB()

//     // Get token from cookie or authorization header
//     const cookieStore = cookies()
//     let token = cookieStore.get('token')?.value

//     if (!token) {
//       const authHeader = request.headers.get('authorization')
//       if (authHeader) {
//         token = authHeader.split(' ')[1]
//       }
//     }

//     if (!token) {
//       const response = NextResponse.json(
//         { message: 'Unauthenticated request' },
//         { status: 401 }
//       )

//       const headers = corsHeaders(origin)
//       Object.entries(headers).forEach(([key, value]) => {
//         response.headers.set(key, value)
//       })

//       return response
//     }

//     // Verify token and get user ID
//     let userId
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET)
//       userId = decoded.userId
//     } catch (error) {
//       const response = NextResponse.json(
//         { message: 'Invalid or expired token' },
//         { status: 401 }
//       )

//       const headers = corsHeaders(origin)
//       Object.entries(headers).forEach(([key, value]) => {
//         response.headers.set(key, value)
//       })

//       return response
//     }

//     // Get password and optional username from request body
//     const { password, username } = await request.json()

//     // admin password required to delete user
//     if (!password) {
//       const response = NextResponse.json(
//         { message: 'Password is required to delete account' },
//         { status: 400 }
//       )

//       const headers = corsHeaders(origin)
//       Object.entries(headers).forEach(([key, value]) => {
//         response.headers.set(key, value)
//       })

//       return response
//     }

//     // Get the authenticated user (for password verification)
//     const authenticatedUser = await User.findById(userId)
//     if (!authenticatedUser) {
//       const response = NextResponse.json(
//         { message: 'Authenticated user not found' },
//         { status: 404 }
//       )

//       const headers = corsHeaders(origin)
//       Object.entries(headers).forEach(([key, value]) => {
//         response.headers.set(key, value)
//       })

//       return response
//     }

//     // Verify the authenticated user's password
//     const isMatch = await bcrypt.compare(password, authenticatedUser.password)
//     if (!isMatch) {
//       const response = NextResponse.json(
//         { message: 'Invalid password' },
//         { status: 401 }
//       )

//       const headers = corsHeaders(origin)
//       Object.entries(headers).forEach(([key, value]) => {
//         response.headers.set(key, value)
//       })

//       return response
//     }

//     // Determine which user to delete
//     let userToDelete
//     if (username) {
//       // Delete specified user by username
//       userToDelete = await User.findOne({ username })
//       if (!userToDelete) {
//         const response = NextResponse.json(
//           { message: `User '${username}' not found` },
//           { status: 404 }
//         )

//         const headers = corsHeaders(origin)
//         Object.entries(headers).forEach(([key, value]) => {
//           response.headers.set(key, value)
//         })

//         return response
//       }
//     } else {
//       // Delete the authenticated user (self-deletion)
//       userToDelete = authenticatedUser
//     }

//     // Delete the user
//     await User.findByIdAndDelete(userToDelete._id)

//     // Invalidate session and blacklist token
//     invalidateSession(token)
//     addToBlacklist(token)

//     // Create response
//     const response = NextResponse.json({
//       success: true,
//       message: username
//         ? `User '${username}' deleted successfully`
//         : 'Account deleted successfully',
//       deletedUser: userToDelete.username,
//     })

//     // Add CORS headers
//     const headers = corsHeaders(origin)
//     Object.entries(headers).forEach(([key, value]) => {
//       response.headers.set(key, value)
//     })

//     // Clear the authentication cookie
//     response.cookies.set('token', '', {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       maxAge: 0,
//       path: '/',
//     })

//     return response
//   } catch (error) {
//     console.error('Delete user error:', error)
//     const response = NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     )

//     const headers = corsHeaders(origin)
//     Object.entries(headers).forEach(([key, value]) => {
//       response.headers.set(key, value)
//     })

//     return response
//   }
// }
