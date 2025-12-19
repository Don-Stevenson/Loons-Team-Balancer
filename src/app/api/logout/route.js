import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { addToBlacklist } from '../../../lib/utils/tokenBlacklist'
import { invalidateSession } from '../../../lib/utils/sessionStore'
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
    const cookieStore = await cookies()
    const currentToken = cookieStore.get('token')?.value

    if (currentToken) {
      addToBlacklist(currentToken)
      invalidateSession(currentToken)
    }

    const isProduction = process.env.NODE_ENV === 'production'

    const response = NextResponse.json({ success: true })

    // Add CORS headers
    const headers = corsHeaders(origin)
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    response.cookies.set('token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax', // Use 'lax' for better compatibility
      expires: new Date(0),
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
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
