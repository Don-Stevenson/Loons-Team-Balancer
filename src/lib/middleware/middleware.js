import { NextResponse } from 'next/server'

const allowedOrigins = [
  'http://localhost:3000', // local dev
  'https://create-teams.vercel.app', // main production URL
  // Allow all Vercel preview deploys for this project:
  /^https:\/\/create-teams-git-.*\.vercel\.app$/,
  // Allow other Vercel domains for this app
  /^https:\/\/.*-dons-projects-6c94f9e9\.vercel\.app$/,
]

function isAllowedOrigin(origin) {
  if (!origin) return true // Allow requests without origin (same origin)

  return allowedOrigins.some((allowedOrigin) => {
    if (typeof allowedOrigin === 'string') {
      return allowedOrigin === origin
    }
    return allowedOrigin.test(origin)
  })
}

export function middleware(request) {
  // Only handle API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 })

      if (isAllowedOrigin(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Credentials', 'true')
        response.headers.set(
          'Access-Control-Allow-Methods',
          'GET, POST, PUT, DELETE, OPTIONS'
        )
        response.headers.set(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization, Cookie, X-Requested-With'
        )
      }

      return response
    }

    // For all other requests, continue to the API route
    // but we'll let individual routes handle their own CORS headers
    // since we've already set them up
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
