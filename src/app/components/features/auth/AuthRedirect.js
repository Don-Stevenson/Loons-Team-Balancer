'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PulseLoader } from 'react-spinners'
import { useAuth } from './AuthContext'

export default function AuthRedirect() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/create-teams')
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 py-4 text-xl text-gray-700">
        Loading Loons Team Balancer
        <PulseLoader color="black" size={6} />
      </div>
    )
  }

  return null
}
