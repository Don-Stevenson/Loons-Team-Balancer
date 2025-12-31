import React from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../src/app/components/features/auth/AuthContext'

// Create a test query client with disabled retry and no cache time for faster tests
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

// Wrapper component for tests that need React Query
export const QueryWrapper = ({ children, queryClient }) => {
  const testQueryClient = queryClient || createTestQueryClient()

  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  )
}

// Wrapper component for tests that need React Query AND Auth
export const QueryAuthWrapper = ({ children, queryClient }) => {
  const testQueryClient = queryClient || createTestQueryClient()

  return (
    <QueryClientProvider client={testQueryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}

// Custom render function that includes React Query provider
export const renderWithQuery = (ui, options = {}) => {
  const { queryClient, ...renderOptions } = options
  const testQueryClient = queryClient || createTestQueryClient()

  const Wrapper = ({ children }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  )

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient: testQueryClient,
  }
}

// Custom render function that includes React Query AND Auth providers
export const renderWithQueryAndAuth = (ui, options = {}) => {
  const { queryClient, ...renderOptions } = options
  const testQueryClient = queryClient || createTestQueryClient()

  const Wrapper = ({ children }) => (
    <QueryClientProvider client={testQueryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient: testQueryClient,
  }
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
