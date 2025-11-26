import { screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import PasswordResetStep1 from '../../src/app/components/ui/PasswordReset/PasswordResetStep1'
import { apiService } from '../../utils/FEapi'
import { renderWithQuery } from '../utils/test-utils'

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
      verifyCredentials: jest.fn(),
    },
  },
}))

describe('PasswordResetStep1', () => {
  const originalConsoleError = console.error
  let mockError

  beforeEach(() => {
    jest.clearAllMocks()
    mockError = jest.fn()
    console.error = mockError
  })

  afterEach(() => {
    console.error = originalConsoleError
  })

  it('renders all form elements correctly', () => {
    renderWithQuery(<PasswordResetStep1 />)

    expect(screen.getByText('Password Reset')).toBeInTheDocument()
    expect(screen.getByText('Step 1: Verify your identity')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Current Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByText('Back to login')).toBeInTheDocument()
  })

  it('updates input values on change', () => {
    renderWithQuery(<PasswordResetStep1 />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Current Password')

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpass' } })

    expect(usernameInput.value).toBe('testuser')
    expect(passwordInput.value).toBe('testpass')
  })

  it('toggles password visibility when eye icon is clicked', () => {
    renderWithQuery(<PasswordResetStep1 />)

    const passwordInput = screen.getByPlaceholderText('Current Password')
    const toggleButton = screen.getByLabelText('Show password')

    expect(passwordInput.type).toBe('password')

    fireEvent.click(toggleButton)
    expect(passwordInput.type).toBe('text')

    fireEvent.click(toggleButton)
    expect(passwordInput.type).toBe('password')
  })

  it('handles successful credential verification', async () => {
    apiService.auth.verifyCredentials.mockResolvedValue({
      success: true,
      message: 'Credentials verified',
    })

    renderWithQuery(<PasswordResetStep1 />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Current Password')
    const submitButton = screen.getByRole('button', { name: /next/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpass' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(apiService.auth.verifyCredentials).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'testpass',
      })
    })

    // After successful verification, should show Step 2
    await waitFor(() => {
      expect(
        screen.getByText('Step 2: Enter your new password')
      ).toBeInTheDocument()
    })
  })

  it('handles failed credential verification', async () => {
    apiService.auth.verifyCredentials.mockResolvedValue({
      success: false,
      message: 'Invalid credentials',
    })

    renderWithQuery(<PasswordResetStep1 />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Current Password')
    const submitButton = screen.getByRole('button', { name: /next/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Invalid credentials. Please try again')
      ).toBeInTheDocument()
    })

    // Should still be on Step 1
    expect(screen.getByText('Step 1: Verify your identity')).toBeInTheDocument()
  })

  it('handles network errors', async () => {
    apiService.auth.verifyCredentials.mockRejectedValue(
      new Error('Network error')
    )

    renderWithQuery(<PasswordResetStep1 />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Current Password')
    const submitButton = screen.getByRole('button', { name: /next/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpass' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Invalid credentials. Please try again')
      ).toBeInTheDocument()
    })
  })

  it('clears error message when input is focused', async () => {
    apiService.auth.verifyCredentials.mockResolvedValue({
      success: false,
      message: 'Invalid credentials',
    })

    renderWithQuery(<PasswordResetStep1 />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Current Password')
    const submitButton = screen.getByRole('button', { name: /next/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Invalid credentials. Please try again')
      ).toBeInTheDocument()
    })

    fireEvent.focus(usernameInput)

    expect(
      screen.queryByText('Invalid credentials. Please try again')
    ).not.toBeInTheDocument()

    // Error should appear again after another failed attempt
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(
        screen.getByText('Invalid credentials. Please try again')
      ).toBeInTheDocument()
    })

    // Clearing error by focusing password field
    fireEvent.focus(passwordInput)
    expect(
      screen.queryByText('Invalid credentials. Please try again')
    ).not.toBeInTheDocument()
  })

  it('disables form inputs while verifying credentials', async () => {
    let resolveVerification
    const verificationPromise = new Promise(resolve => {
      resolveVerification = resolve
    })
    apiService.auth.verifyCredentials.mockReturnValue(verificationPromise)

    renderWithQuery(<PasswordResetStep1 />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Current Password')
    const submitButton = screen.getByRole('button', { name: /next/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpass' } })
    fireEvent.click(submitButton)

    // Inputs and button should be disabled during verification
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /verifying/i })
      ).toBeInTheDocument()
    })

    expect(usernameInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()

    // Resolve the promise to complete the test
    resolveVerification({ success: true })
  })

  it('requires both username and password fields', () => {
    renderWithQuery(<PasswordResetStep1 />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Current Password')

    expect(usernameInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('required')
  })

  it('has proper autocomplete attributes', () => {
    renderWithQuery(<PasswordResetStep1 />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Current Password')

    expect(usernameInput).toHaveAttribute('autocomplete', 'username')
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password')
  })

  it('has proper aria-label for password toggle button', () => {
    renderWithQuery(<PasswordResetStep1 />)

    const toggleButton = screen.getByLabelText('Show password')

    expect(toggleButton).toBeInTheDocument()

    fireEvent.click(toggleButton)

    expect(screen.getByLabelText('Hide password')).toBeInTheDocument()
  })

  it('prevents default form submission', () => {
    renderWithQuery(<PasswordResetStep1 />)

    const form = screen.getByTestId('login-form')
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true })

    form.dispatchEvent(submitEvent)

    expect(submitEvent.defaultPrevented).toBeTruthy()
  })
})
