'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import Footer from '../ui/Footer/Footer'
import NavBar from '../ui/Navbar/NavBar'
import { AuthProvider } from '../features/auth/AuthContext'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        // Don't retry on 401s (auth errors)
        if (error?.response?.status === 401) return false
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})

export default function ClientLayout({ children }) {
  const [showNavBar, setShowNavBar] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Show NavBar on protected routes (these routes use withAuth HOC which handles authentication)
    // Don't show on login page or root page (which handles its own auth and redirect)
    const protectedRoutes = ['/create-teams', '/players']
    setShowNavBar(protectedRoutes.includes(pathname))
  }, [pathname])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          {showNavBar && <NavBar />}
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </AuthProvider>
      <div className="print:hidden">
        <ReactQueryDevtools initialIsOpen={false} />
      </div>
    </QueryClientProvider>
  )
}
