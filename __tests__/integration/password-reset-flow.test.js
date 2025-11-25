import { screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter } from 'next/navigation'
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
      resetPassword: jest.fn(),
    },
  },
}))

// Mock the useResetPassword hook
jest.mock('../../src/app/hooks/useApi', () => ({
  useResetPassword: jest.fn(({ onSuccess, onError }) => ({
    mutate: jest.fn(data => {
      // Call the mocked resetPassword API
      apiService.auth
        .resetPassword(data)
        .then(response => onSuccess && onSuccess(response))
        .catch(error => onError && onError(error))
    }),
    isPending: false,
    isError: false,
    error: null,
  })),
}))

describe('Password Reset Flow Integration Test', () => {
  const mockPush = jest.fn()
  const originalConsoleError = console.error
  let mockError

  beforeEach(() => {
    jest.clearAllMocks()
    mockError = jest.fn()
    console.error = mockError

    useRouter.mockImplementation(() => ({
      push: mockPush,
    }))

    jest.useFakeTimers()
  })

  afterEach(() => {
    console.error = originalConsoleError
    jest.useRealTimers()
  })

  it('completes full password reset flow successfully', async () => {
    // Mock successful credential verification
    apiService.auth.verifyCredentials.mockResolvedValue({
      success: true,
      message: 'Credentials verified',
    })

    // Mock successful password reset
    apiService.auth.resetPassword.mockResolvedValue({
      success: true,
      message: 'Password reset successfully',
    })

    // Start at Step 1
    renderWithQuery(<PasswordResetStep1 />)

    expect(screen.getByText('Step 1: Verify your identity')).toBeInTheDocument()

    // Fill in Step 1 credentials
    const usernameInput = screen.getByPlaceholderText('Username')
    const currentPasswordInput = screen.getByPlaceholderText('Current Password')
    const nextButton = screen.getByRole('button', { name: /next/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(currentPasswordInput, { target: { value: 'oldPassword123' } })
    fireEvent.click(nextButton)

    // Verify credentials were checked
    await waitFor(() => {
      expect(apiService.auth.verifyCredentials).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'oldPassword123',
      })
    })

    // Should progress to Step 2
    await waitFor(() => {
      expect(screen.getByText('Step 2: Enter your new password')).toBeInTheDocument()
    })

    // Fill in new password
    const newPasswordInput = screen.getByPlaceholderText('New Password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New PW')
    const resetButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(newPasswordInput, { target: { value: 'newPassword456' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword456' } })
    fireEvent.click(resetButton)

    // Verify password reset was called
    await waitFor(() => {
      expect(apiService.auth.resetPassword).toHaveBeenCalledWith({
        username: 'testuser',
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      })
    })

    // Should show success message
    await waitFor(() => {
      expect(
        screen.getByText('Password reset successful! Redirecting to login...')
      ).toBeInTheDocument()
    })

    // Fast-forward time to trigger redirect
    jest.advanceTimersByTime(2000)

    // Should redirect to login page
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('handles credential verification failure in Step 1', async () => {
    // Mock failed credential verification
    apiService.auth.verifyCredentials.mockResolvedValue({
      success: false,
      message: 'Invalid credentials',
    })

    renderWithQuery(<PasswordResetStep1 />)

    // Fill in Step 1 credentials
    const usernameInput = screen.getByPlaceholderText('Username')
    const currentPasswordInput = screen.getByPlaceholderText('Current Password')
    const nextButton = screen.getByRole('button', { name: /next/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(currentPasswordInput, { target: { value: 'wrongPassword' } })
    fireEvent.click(nextButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials. Please try again')).toBeInTheDocument()
    })

    // Should remain on Step 1
    expect(screen.getByText('Step 1: Verify your identity')).toBeInTheDocument()

    // Should not progress to Step 2
    expect(screen.queryByText('Step 2: Enter your new password')).not.toBeInTheDocument()
  })

  it('handles password mismatch in Step 2', async () => {
    // Mock successful credential verification
    apiService.auth.verifyCredentials.mockResolvedValue({
      success: true,
      message: 'Credentials verified',
    })

    renderWithQuery(<PasswordResetStep1 />)

    // Complete Step 1
    const usernameInput = screen.getByPlaceholderText('Username')
    const currentPasswordInput = screen.getByPlaceholderText('Current Password')
    const nextButton = screen.getByRole('button', { name: /next/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(currentPasswordInput, { target: { value: 'oldPassword123' } })
    fireEvent.click(nextButton)

    // Wait for Step 2
    await waitFor(() => {
      expect(screen.getByText('Step 2: Enter your new password')).toBeInTheDocument()
    })

    // Try to submit with mismatched passwords
    const newPasswordInput = screen.getByPlaceholderText('New Password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New PW')
    const resetButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(newPasswordInput, { target: { value: 'newPassword456' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentPassword' } })
    fireEvent.click(resetButton)

    // Should show error
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })

    // Should not call reset password API
    expect(apiService.auth.resetPassword).not.toHaveBeenCalled()

    // Should not redirect
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('handles password too short in Step 2', async () => {
    // Mock successful credential verification
    apiService.auth.verifyCredentials.mockResolvedValue({
      success: true,
      message: 'Credentials verified',
    })

    renderWithQuery(<PasswordResetStep1 />)

    // Complete Step 1
    const usernameInput = screen.getByPlaceholderText('Username')
    const currentPasswordInput = screen.getByPlaceholderText('Current Password')
    const nextButton = screen.getByRole('button', { name: /next/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(currentPasswordInput, { target: { value: 'oldPassword123' } })
    fireEvent.click(nextButton)

    // Wait for Step 2
    await waitFor(() => {
      expect(screen.getByText('Step 2: Enter your new password')).toBeInTheDocument()
    })

    // Try to submit with password that's too short
    const newPasswordInput = screen.getByPlaceholderText('New Password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New PW')
    const resetButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(newPasswordInput, { target: { value: 'short' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'short' } })
    fireEvent.click(resetButton)

    // Should show error
    await waitFor(() => {
      expect(
        screen.getByText('Password must be at least 6 characters long')
      ).toBeInTheDocument()
    })

    // Should not call reset password API
    expect(apiService.auth.resetPassword).not.toHaveBeenCalled()
  })

  it('handles password reset API failure in Step 2', async () => {
    // Mock successful credential verification
    apiService.auth.verifyCredentials.mockResolvedValue({
      success: true,
      message: 'Credentials verified',
    })

    // Mock failed password reset
    apiService.auth.resetPassword.mockResolvedValue({
      success: false,
      message: 'Failed to reset password',
    })

    renderWithQuery(<PasswordResetStep1 />)

    // Complete Step 1
    const usernameInput = screen.getByPlaceholderText('Username')
    const currentPasswordInput = screen.getByPlaceholderText('Current Password')
    const nextButton = screen.getByRole('button', { name: /next/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(currentPasswordInput, { target: { value: 'oldPassword123' } })
    fireEvent.click(nextButton)

    // Wait for Step 2
    await waitFor(() => {
      expect(screen.getByText('Step 2: Enter your new password')).toBeInTheDocument()
    })

    // Fill in new password
    const newPasswordInput = screen.getByPlaceholderText('New Password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New PW')
    const resetButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(newPasswordInput, { target: { value: 'newPassword456' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword456' } })
    fireEvent.click(resetButton)

    // Should show error from API
    await waitFor(() => {
      expect(screen.getByText('Failed to reset password')).toBeInTheDocument()
    })

    // Should not redirect
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('allows retrying after error in Step 1', async () => {
    // Mock first attempt fails, second succeeds
    apiService.auth.verifyCredentials
      .mockResolvedValueOnce({
        success: false,
        message: 'Invalid credentials',
      })
      .mockResolvedValueOnce({
        success: true,
        message: 'Credentials verified',
      })

    renderWithQuery(<PasswordResetStep1 />)

    const usernameInput = screen.getByPlaceholderText('Username')
    const currentPasswordInput = screen.getByPlaceholderText('Current Password')
    const nextButton = screen.getByRole('button', { name: /next/i })

    // First attempt with wrong password
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(currentPasswordInput, { target: { value: 'wrongPassword' } })
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials. Please try again')).toBeInTheDocument()
    })

    // Clear error by focusing input
    fireEvent.focus(currentPasswordInput)

    expect(screen.queryByText('Invalid credentials. Please try again')).not.toBeInTheDocument()

    // Second attempt with correct password
    fireEvent.change(currentPasswordInput, { target: { value: 'correctPassword' } })
    fireEvent.click(nextButton)

    // Should progress to Step 2
    await waitFor(() => {
      expect(screen.getByText('Step 2: Enter your new password')).toBeInTheDocument()
    })

    expect(apiService.auth.verifyCredentials).toHaveBeenCalledTimes(2)
  })

  it('maintains user credentials between Step 1 and Step 2', async () => {
    // Mock successful credential verification
    apiService.auth.verifyCredentials.mockResolvedValue({
      success: true,
      message: 'Credentials verified',
    })

    // Mock successful password reset
    apiService.auth.resetPassword.mockResolvedValue({
      success: true,
      message: 'Password reset successfully',
    })

    renderWithQuery(<PasswordResetStep1 />)

    const testUsername = 'testuser123'
    const testCurrentPassword = 'oldPassword456'

    // Complete Step 1
    const usernameInput = screen.getByPlaceholderText('Username')
    const currentPasswordInput = screen.getByPlaceholderText('Current Password')
    const nextButton = screen.getByRole('button', { name: /next/i })

    fireEvent.change(usernameInput, { target: { value: testUsername } })
    fireEvent.change(currentPasswordInput, { target: { value: testCurrentPassword } })
    fireEvent.click(nextButton)

    // Wait for Step 2
    await waitFor(() => {
      expect(screen.getByText('Step 2: Enter your new password')).toBeInTheDocument()
    })

    // Complete Step 2
    const newPasswordInput = screen.getByPlaceholderText('New Password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New PW')
    const resetButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(newPasswordInput, { target: { value: 'newPassword789' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword789' } })
    fireEvent.click(resetButton)

    // Verify that Step 1 credentials were passed to Step 2
    await waitFor(() => {
      expect(apiService.auth.resetPassword).toHaveBeenCalledWith({
        username: testUsername,
        currentPassword: testCurrentPassword,
        newPassword: 'newPassword789',
      })
    })
  })
})

