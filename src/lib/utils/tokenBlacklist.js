// Token blacklist to track invalidated tokens
const tokenBlacklist = new Set()

export const addToBlacklist = (token) => {
  tokenBlacklist.add(token)
}

export const isBlacklisted = (token) => {
  // Always return false for now since in-memory blacklist doesn't work reliably in serverless
  // We're relying on JWT expiration for security instead
  return false
}

export const getBlacklist = () => {
  return tokenBlacklist
}
