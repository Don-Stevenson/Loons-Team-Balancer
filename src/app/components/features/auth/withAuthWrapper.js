import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PulseLoader } from 'react-spinners'
import { useAuth } from './AuthContext'

export default function withAuth(WrappedComponent, options = {}) {
  const { requireAuth = true } = options

  return function AuthenticatedComponent(props) {
    const router = useRouter()
    const { isAuthenticated, isLoading } = useAuth()

    // Redirect if not authenticated (but only after loading is complete)
    useEffect(() => {
      if (!isLoading && requireAuth && !isAuthenticated) {
        router.push('/login')
      }
    }, [isLoading, isAuthenticated, router])

    // Show loading in content area only (header/footer remain visible)
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2 text-gray-700 text-xl py-4">
            Loading
            <PulseLoader color="black" size={6} />
          </div>
        </div>
      )
    }

    // Don't render anything while redirecting
    if (requireAuth && !isAuthenticated) {
      return null
    }

    // Only pass loggedIn prop when requireAuth is false (for pages that need to know auth state but don't require it)
    const additionalProps = requireAuth ? {} : { loggedIn: isAuthenticated }
    return <WrappedComponent {...props} {...additionalProps} />
  }
}
