import { screen, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import AuthRedirect from '../../src/app/components/features/auth/AuthRedirect'
import { renderWithQueryAndAuth } from '../utils/test-utils'

const mockPush = jest.fn()
const mockUseAuthCheck = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

jest.mock('../../src/app/hooks/useApi', () => ({
  useAuthCheck: (options) => mockUseAuthCheck(options),
}))

describe('Home Page / balance teams', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
    mockUseAuthCheck.mockClear()
    // Mock localStorage to ensure consistent test environment
    const mockLocalStorage = {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })
  })

  it('renders without crashing', async () => {
    mockUseAuthCheck.mockReturnValue({
      data: true,
      isLoading: true,
      error: null,
    })

    await act(async () => {
      renderWithQueryAndAuth(<AuthRedirect />)
    })

    expect(screen.getByText('Loading Loons Team Balancer')).toBeInTheDocument()
  })

  it('shows loading message initially', async () => {
    mockUseAuthCheck.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    })

    await act(async () => {
      renderWithQueryAndAuth(<AuthRedirect />)
    })

    expect(screen.getByText('Loading Loons Team Balancer')).toBeInTheDocument()
  })

  it('checks authentication on mount', async () => {
    mockUseAuthCheck.mockReturnValue({
      data: true,
      isLoading: false,
      error: null,
    })

    await act(async () => {
      renderWithQueryAndAuth(<AuthRedirect />)
    })

    expect(mockUseAuthCheck).toHaveBeenCalled()
  })

  it('redirects to /create-teams when authenticated', async () => {
    mockUseAuthCheck.mockReturnValue({
      data: { username: 'testuser' },
      isLoading: false,
      error: null,
    })

    await act(async () => {
      renderWithQueryAndAuth(<AuthRedirect />)
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/create-teams')
    })
  })

  it('redirects to /login when not authenticated', async () => {
    mockUseAuthCheck.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    })

    await act(async () => {
      renderWithQueryAndAuth(<AuthRedirect />)
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('handles authentication error', async () => {
    mockUseAuthCheck.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Network error'),
    })

    await act(async () => {
      renderWithQueryAndAuth(<AuthRedirect />)
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('does not redirect while loading', async () => {
    mockUseAuthCheck.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    })

    await act(async () => {
      renderWithQueryAndAuth(<AuthRedirect />)
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('renders null when not loading', async () => {
    mockUseAuthCheck.mockReturnValue({
      data: true,
      isLoading: false,
      error: null,
    })

    const { container } = renderWithQueryAndAuth(<AuthRedirect />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled()
    })

    // After redirect, component renders null
    expect(container.firstChild).toBeNull()
  })
})
