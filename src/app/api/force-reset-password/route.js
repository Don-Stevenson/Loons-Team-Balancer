import { NextResponse } from 'next/server'
import connectDB from '../../../lib/db/connectDB'
import User from '../../../lib/models/User'
import { corsHeaders } from '../../../lib/utils/cors'

// TEMPORARY ADMIN ROUTE - REMOVE AFTER USE
// This route allows resetting password without current password verification
// export async function POST(request) {
//   const origin = request.headers.get('origin')

//   try {
//     await connectDB()

//     const { username, newPassword } = await request.json()

//     console.log('Force reset attempt for username:', username)

//     // Validate inputs
//     if (!username || !newPassword) {
//       const response = NextResponse.json(
//         { success: false, message: 'Missing required fields' },
//         { status: 400 }
//       )
//       const headers = corsHeaders(origin)
//       Object.entries(headers).forEach(([key, value]) => {
//         response.headers.set(key, value)
//       })
//       return response
//     }

//     // List all users to help debug
//     const allUsers = await User.find({}, 'username')
//     console.log(
//       'Available users:',
//       allUsers.map(u => u.username)
//     )

//     // Find user (case-insensitive search)
//     const user = await User.findOne({
//       username: { $regex: new RegExp(`^${username}$`, 'i') },
//     })
//     if (!user) {
//       const response = NextResponse.json(
//         {
//           success: false,
//           message: 'User not found',
//           availableUsers: allUsers.map(u => u.username),
//           searchedFor: username,
//         },
//         { status: 404 }
//       )
//       const headers = corsHeaders(origin)
//       Object.entries(headers).forEach(([key, value]) => {
//         response.headers.set(key, value)
//       })
//       return response
//     }

//     console.log('Found user:', user.username)

//     // Update password (will be automatically hashed by the User model's pre-save hook)
//     user.password = newPassword
//     await user.save()

//     const response = NextResponse.json({
//       success: true,
//       message: 'Password force-reset successfully',
//     })

//     const headers = corsHeaders(origin)
//     Object.entries(headers).forEach(([key, value]) => {
//       response.headers.set(key, value)
//     })

//     return response
//   } catch (error) {
//     console.error('Force password reset error:', error)
//     const response = NextResponse.json(
//       { success: false, message: 'Server error', error: error.message },
//       { status: 500 }
//     )
//     const headers = corsHeaders(origin)
//     Object.entries(headers).forEach(([key, value]) => {
//       response.headers.set(key, value)
//     })
//     return response
//   }
// }
