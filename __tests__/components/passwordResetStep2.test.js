import { screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter } from 'next/navigation'
import PasswordResetStep2 from '../../src/app/components/ui/PasswordReset/PasswordResetStep2'
import { renderWithQuery } from '../utils/test-utils'
import { useResetPassword } from '../../src/app/hooks/useApi'

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

// Mock React Query hooks
jest.mock('../../src/app/hooks/useApi', () => ({
  useResetPassword: jest.fn(),
}))

describe('PasswordResetStep2', () => {
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

    // Mock useResetPassword hook with default values
    useResetPassword.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: false,
      error: null,
    })

    jest.useFakeTimers()
  })

  afterEach(() => {
    console.error = originalConsoleError
    jest.useRealTimers()
  })

  it('renders all form elements correctly', () => {
    renderWithQuery(
      <PasswordResetStep2 username="testuser" currentPassword="oldpass" />
    )

    expect(screen.getByText('Password Reset')).toBeInTheDocument()
    expect(
      screen.getByText('Step 2: Enter your new password')
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirm New PW')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /reset password/i })
    ).toBeInTheDocument()
    expect(screen.getByText('Back to login')).toBeInTheDocument()
  })

  it('updates input values on change', () => {
    renderWithQuery(
      <PasswordResetStep2 username="testuser" currentPassword="oldpass" />
    )

    const newPasswordInput = screen.getByPlaceholderText('New Password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New PW')

    fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123' } })

    expect(newPasswordInput.value).toBe('newpass123')
    expect(confirmPasswordInput.value).toBe('newpass123')
  })

  it('toggles new password visibility when eye icon is clicked', () => {
    renderWithQuery(
      <PasswordResetStep2 username="testuser" currentPassword="oldpass" />
    )

    const newPasswordInput = screen.getByPlaceholderText('New Password')
    const toggleButtons = screen.getAllByLabelText('Show password')

    expect(newPasswordInput.type).toBe('password')

    fireEvent.click(toggleButtons[0])
    expect(newPasswordInput.type).toBe('text')

    fireEvent.click(toggleButtons[0])
    expect(newPasswordInput.type).toBe('password')
  })

  it('toggles confirm password visibility when eye icon is clicked', () => {
    renderWithQuery(
      <PasswordResetStep2 username="testuser" currentPassword="oldpass" />
    )

    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New PW')
    const toggleButtons = screen.getAllByLabelText('Show password')

    expect(confirmPasswordInput.type).toBe('password')

    fireEvent.click(toggleButtons[1])
    expect(confirmPasswordInput.type).toBe('text')

    fireEvent.click(toggleButtons[1])
    expect(confirmPasswordInput.type).toBe('password')
  })

  it('fails when new password doesnt contain at least 1 number and 1 uppercase letter', async () => {
    const mockMutate = jest.fn(({ username, currentPassword, newPassword }) => {
      const mockOnSuccess = useResetPassword.mock.calls[0][0].onSuccess
      mockOnSuccess({ success: true })
    })

    useResetPassword.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    })

    renderWithQuery(
      <PasswordResetStep2 username="testuser" currentPassword="oldpass" />
    )

    const newPasswordInput = screen.getByPlaceholderText('New Password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New PW')
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(
          'Password must include at least one uppercase letter, one lowercase letter, and one number'
        )
      ).toBeInTheDocument()
    })
  })

  it('handles successful password reset', async () => {
    const mockMutate = jest.fn(({ username, currentPassword, newPassword }) => {
      const mockOnSuccess = useResetPassword.mock.calls[0][0].onSuccess
      mockOnSuccess({ success: true })
    })

    useResetPassword.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    })

    renderWithQuery(
      <PasswordResetStep2 username="testuser" currentPassword="oldpass" />
    )

    const newPasswordInput = screen.getByPlaceholderText('New Password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New PW')
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123' } })
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'NewPassword123' },
    })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        username: 'testuser',
        currentPassword: 'oldpass',
        newPassword: 'NewPassword123',
      })
    })

    await waitFor(() => {
      expect(
        screen.getByText('Password reset successful! Redirecting to login...')
      ).toBeInTheDocument()
    })

    // Fast-forward time to trigger redirect
    jest.advanceTimersByTime(2000)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('shows error when passwords do not match', async () => {
    renderWithQuery(
      <PasswordResetStep2 username="testuser" currentPassword="oldpass" />
    )

    const newPasswordInput = screen.getByPlaceholderText('New Password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New PW')
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } })
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'differentpass' },
    })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })

    const mockMutate = useResetPassword().mutate
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('shows error when password is too short', async () => {
    renderWithQuery(
      <PasswordResetStep2 username="testuser" currentPassword="oldpass" />
    )

    const newPasswordInput = screen.getByPlaceholderText('New Password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New PW')
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(newPasswordInput, { target: { value: 'short' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'short' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Password must be at least 6 characters long')
      ).toBeInTheDocument()
    })

    const mockMutate = useResetPassword().mutate
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('handles password reset failure from API', async () => {
    const mockMutate = jest.fn(({ username, currentPassword, newPassword }) => {
      const mockOnSuccess = useResetPassword.mock.calls[0][0].onSuccess
      mockOnSuccess({ success: false, message: 'Failed to reset password' })
    })

    useResetPassword.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    })

    renderWithQuery(
      <PasswordResetStep2 username="testuser" currentPassword="oldpass" />
    )

    const newPasswordInput = screen.getByPlaceholderText('New Password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New PW')
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123' } })
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'NewPassword123' },
    })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to reset password')).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('handles network errors', async () => {
    const mockMutate = jest.fn(({ username, currentPassword, newPassword }) => {
      const mockOnError = useResetPassword.mock.calls[0][0].onError
      mockOnError(new Error('Network error'))
    })

    useResetPassword.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    })

    renderWithQuery(
      <PasswordResetStep2 username="testuser" currentPassword="oldpass" />
    )

    const newPasswordInput = screen.getByPlaceholderText('New Password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New PW')
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123' } })
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'NewPassword123' },
    })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('An error occurred. Please try again')
      ).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('clears error message when input is focused', async () => {
    renderWithQuery(
      <PasswordResetStep2 username="testuser" currentPassword="oldpass" />
    )

    const newPasswordInput = screen.getByPlaceholderText('New Password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New PW')
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    // Create a password mismatch error
    fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } })
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'differentpass' },
    })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })

    // Error should clear when focusing on input
    fireEvent.focus(newPasswordInput)

    expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument()
  })

  it('disables form inputs while password is being reset', () => {
    useResetPassword.mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
      isError: false,
      error: null,
    })

    renderWithQuery(
      <PasswordResetStep2 username="testuser" currentPassword="oldpass" />
    )

    const newPasswordInput = screen.getByPlaceholderText('New Password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New PW')
    const submitButton = screen.getByRole('button', { name: /resetting/i })

    expect(newPasswordInput).toBeDisabled()
    expect(confirmPasswordInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })

  it('disables form inputs after successful password reset', async () => {
    const mockMutate = jest.fn(({ username, currentPassword, newPassword }) => {
      const mockOnSuccess = useResetPassword.mock.calls[0][0].onSuccess
      mockOnSuccess({ success: true })
    })

    useResetPassword.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    })

    renderWithQuery(
      <PasswordResetStep2 username="testuser" currentPassword="oldpass" />
    )

    const newPasswordInput = screen.getByPlaceholderText('New Password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New PW')
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123' } })
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'NewPassword123' },
    })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Password reset successful! Redirecting to login...')
      ).toBeInTheDocument()
    })

    // Password inputs should be disabled after success
    await waitFor(() => {
      expect(newPasswordInput).toBeDisabled()
      expect(confirmPasswordInput).toBeDisabled()
    })
  })

  it('requires both password fields', () => {
    renderWithQuery(
      <PasswordResetStep2 username="testuser" currentPassword="oldpass" />
    )

    const newPasswordInput = screen.getByPlaceholderText('New Password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New PW')

    expect(newPasswordInput).toHaveAttribute('required')
    expect(confirmPasswordInput).toHaveAttribute('required')
  })

  it('has proper autocomplete attributes', () => {
    renderWithQuery(
      <PasswordResetStep2 username="testuser" currentPassword="oldpass" />
    )

    const newPasswordInput = screen.getByPlaceholderText('New Password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New PW')

    expect(newPasswordInput).toHaveAttribute('autocomplete', 'new-password')
    expect(confirmPasswordInput).toHaveAttribute('autocomplete', 'new-password')
  })

  it('prevents default form submission', () => {
    renderWithQuery(
      <PasswordResetStep2 username="testuser" currentPassword="oldpass" />
    )

    const form = screen.getByTestId('password-reset-step2-form')
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true })

    form.dispatchEvent(submitEvent)

    expect(submitEvent.defaultPrevented).toBeTruthy()
  })
})
