'use client'

import { createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthCheck } from '../../../hooks/useApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const router = useRouter()
  const { data: authResult, isLoading, error } = useAuthCheck()

  // Note: We don't block rendering during auth check
  // The layout (header/footer) should always show
  // Individual pages using withAuth will handle their own loading states

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!authResult, isLoading, user: authResult }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
