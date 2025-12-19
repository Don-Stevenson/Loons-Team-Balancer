import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { addToBlacklist } from '../../../lib/utils/tokenBlacklist'
import { invalidateSession } from '../../../lib/utils/sessionStore'

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const currentToken = cookieStore.get('token')?.value

    if (currentToken) {
      addToBlacklist(currentToken)
      invalidateSession(currentToken)
    }

    const isProduction = process.env.NODE_ENV === 'production'

    const response = NextResponse.json({
      success: true,
      message: 'All auth state cleared',
    })

    response.cookies.set('token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      expires: new Date(0),
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Force clear auth error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
}
