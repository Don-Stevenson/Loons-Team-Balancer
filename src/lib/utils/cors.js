// CORS utility for Next.js API routes
import { NextResponse } from 'next/server'

const allowedOrigins = [
  'http://localhost:3000', // local dev
  'https://create-teams.vercel.app', // main production URL
  // Allow all Vercel preview deploys for this project:
  /^https:\/\/create-teams-git-.*\.vercel\.app$/,
  // Allow other Vercel domains for this app
  /^https:\/\/.*-dons-projects-6c94f9e9\.vercel\.app$/,
]

export function corsHeaders(origin) {
  const isAllowed = allowedOrigins.some((allowedOrigin) => {
    if (typeof allowedOrigin === 'string') {
      return allowedOrigin === origin
    }
    return allowedOrigin.test(origin)
  })

  if (isAllowed) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    }
  }

  return {}
}

export function withCors(handler) {
  return async (request, context) => {
    const origin = request.headers.get('origin')

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: corsHeaders(origin),
      })
    }

    // Handle actual requests
    const response = await handler(request, context)

    // Add CORS headers to the response
    const headers = corsHeaders(origin)
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }
}
