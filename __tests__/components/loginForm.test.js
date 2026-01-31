import { screen, fireEvent, waitFor, createEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter } from 'next/navigation'
import LoginForm from '../../src/app/components/ui/LoginForm/LoginForm'
import { apiService } from '../../utils/FEapi'
import { renderWithQuery } from '../utils/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLogin } from '../../src/app/hooks/useApi'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }) => <>{children}</>,
  }
})

jest.mock('next/image', () => {
  return function Image({ src, alt, ...props }) {
    return <img src={src} alt={alt} {...props} />
  }
})

// Mock the API service
jest.mock('../../utils/FEapi', () => ({
  apiService: {
    auth: {
      login: jest.fn(),
    },
  },
}))

// Mock React Query hooks
jest.mock('../../src/app/hooks/useApi', () => ({
  useLogin: jest.fn(),
  queryKeys: {
    players: ['players'],
    player: (id) => ['players', id],
    games: ['games'],
    gameRsvps: (gameId) => ['games', gameId, 'rsvps'],
    auth: ['auth'],
  },
}))

describe('LoginForm', () => {
  const mockPush = jest.fn()
  const mockRefresh = jest.fn()
  const originalConsoleError = console.error
  let mockError

  beforeEach(() => {
    jest.clearAllMocks()
    mockError = jest.fn()
    console.error = mockError

    useRouter.mockImplementation(() => ({
      push: mockPush,
      refresh: mockRefresh,
    }))

    // Mock useLogin hook
    useLogin.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: false,
      error: null,
    })
  })

  afterEach(() => {
    console.error = originalConsoleError
  })

  it('renders all form elements correctly', () => {
    renderWithQuery(<LoginForm />)

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()

    expect(
      screen.getByAltText('Toronto Walking Soccer Loons Club Logo')
    ).toBeInTheDocument()

    expect(screen.getByText('Loons Team Balancer')).toBeInTheDocument()
  })

  it('updates input values on change', () => {
    renderWithQuery(<LoginForm />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpass' } })

    expect(usernameInput.value).toBe('testuser')
    expect(passwordInput.value).toBe('testpass')
  })

  it('handles successful login correctly', async () => {
    let capturedOnSuccess

    // Mock useLogin to capture the onSuccess callback
    useLogin.mockImplementation(({ onSuccess, onError }) => {
      capturedOnSuccess = onSuccess
      return {
        mutate: jest.fn(async (credentials) => {
          // Simulate successful login by calling the captured onSuccess
          await capturedOnSuccess({ success: true })
        }),
        isPending: false,
        isError: false,
        error: null,
      }
    })

    renderWithQuery(<LoginForm />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpass' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/create-teams')
    })

    expect(
      screen.queryByText("There's been an error. Please try again")
    ).not.toBeInTheDocument()
  })

  it('handles failed login correctly', async () => {
    const mockMutate = jest.fn((credentials) => {
      // Simulate failed login by calling onSuccess with failure
      const mockOnSuccess = useLogin.mock.calls[0][0].onSuccess
      mockOnSuccess({ success: false })
    })

    useLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    })

    renderWithQuery(<LoginForm />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText("There's been an error. Please try again")
      ).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('clears error message when input is focused', async () => {
    const mockMutate = jest.fn((credentials) => {
      // Simulate failed login by calling onSuccess with failure
      const mockOnSuccess = useLogin.mock.calls[0][0].onSuccess
      mockOnSuccess({ success: false })
    })

    useLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    })

    renderWithQuery(<LoginForm />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpass' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText("There's been an error. Please try again")
      ).toBeInTheDocument()
    })

    fireEvent.focus(usernameInput)

    expect(
      screen.queryByText("There's been an error. Please try again")
    ).not.toBeInTheDocument()

    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(
        screen.getByText("There's been an error. Please try again")
      ).toBeInTheDocument()
    })

    fireEvent.focus(passwordInput)
    expect(
      screen.queryByText("There's been an error. Please try again")
    ).not.toBeInTheDocument()
  })

  it('prevents default form submission', () => {
    renderWithQuery(<LoginForm />)

    const form = screen.getByTestId('login-form')
    const submitEvent = createEvent.submit(form)

    fireEvent(form, submitEvent)

    expect(submitEvent.defaultPrevented).toBeTruthy()
  })

  it('handles network errors correctly', async () => {
    const mockMutate = jest.fn((credentials) => {
      // Simulate network error by calling onError
      const mockOnError = useLogin.mock.calls[0][0].onError
      mockOnError(new Error('Network error'))
    })

    useLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    })

    renderWithQuery(<LoginForm />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText("There's been an error. Please try again")
      ).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows loading state while login is in progress', async () => {
    // Mock the login mutation to be in pending state
    const mockMutate = jest.fn()
    useLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isError: false,
      error: null,
    })

    renderWithQuery(<LoginForm />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: /logging in/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpass' } })

    // The button should be disabled during loading
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent('Logging in')

    // Inputs should also be disabled
    expect(usernameInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
  })
})
