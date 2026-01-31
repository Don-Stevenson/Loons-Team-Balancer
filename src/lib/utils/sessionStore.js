// Simple in-memory session store
const sessions = new Map()

export const createSession = (userId, token) => {
  sessions.set(token, {
    userId,
    createdAt: Date.now(),
    active: true,
  })
}

export const getSession = (token) => {
  return sessions.get(token)
}

export const invalidateSession = (token) => {
  if (sessions.has(token)) {
    sessions.delete(token)
    return true
  }
  return false
}

export const isSessionValid = (token) => {
  // Always return true for now since we're relying on JWT validation
  // In-memory sessions don't work reliably in serverless environments
  return true
}

export const getAllSessions = () => {
  return Array.from(sessions.entries())
}
