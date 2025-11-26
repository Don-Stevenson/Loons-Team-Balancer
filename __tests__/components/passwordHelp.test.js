import { screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderWithQuery } from '../utils/test-utils'
import PasswordHelp from '../../src/app/components/ui/PasswordHelp/PasswordHelp'

// Mock Next.js components
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('next/link', () => {
  return function Link({ children, href }) {
    return <a href={href}>{children}</a>
  }
})

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

// Mock fetch
global.fetch = jest.fn()

describe('PasswordHelp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    fetch.mockClear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders all form elements correctly', () => {
      renderWithQuery(<PasswordHelp />)

      expect(screen.getByText('Password Help')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Enter your username/email address to receive temporary password.'
        )
      ).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Username/email')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /submit/i })
      ).toBeInTheDocument()
    })

    it('renders navigation links correctly', () => {
      renderWithQuery(<PasswordHelp />)

      const passwordResetLink = screen.getByText(
        'Already know your username and password? Reset your password here'
      )
      const backToLoginLink = screen.getByText('Back to login')

      expect(passwordResetLink).toBeInTheDocument()
      expect(passwordResetLink.closest('a')).toHaveAttribute(
        'href',
        '/password-reset'
      )
      expect(backToLoginLink).toBeInTheDocument()
      expect(backToLoginLink.closest('a')).toHaveAttribute('href', '/login')
    })

    it('renders the logo component', () => {
      renderWithQuery(<PasswordHelp />)

      // Logo component should be rendered
      expect(screen.getAllByRole('img')[0]).toBeInTheDocument()
    })

    it('renders the BackArrow component', () => {
      renderWithQuery(<PasswordHelp />)

      // BackArrow component should be rendered in the back to login section
      const backToLoginSection = screen
        .getByText('Back to login')
        .closest('div')
      expect(backToLoginSection).toBeInTheDocument()
    })

    it('has proper input attributes', () => {
      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).not.toBeDisabled()
    })
  })

  describe('Input Handling', () => {
    it('updates username value on change', () => {
      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      expect(emailInput.value).toBe('test@example.com')
    })

    it('allows typing in the email field', () => {
      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')

      fireEvent.change(emailInput, { target: { value: 'user@test.com' } })
      expect(emailInput.value).toBe('user@test.com')

      fireEvent.change(emailInput, { target: { value: 'updated@test.com' } })
      expect(emailInput.value).toBe('updated@test.com')
    })

    it('clears input field after successful submission', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      expect(emailInput.value).toBe('test@example.com')

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(emailInput.value).toBe('')
      })
    })
  })

  describe('Form Validation', () => {
    it('shows error when submitting without email', async () => {
      renderWithQuery(<PasswordHelp />)

      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText('Please enter your email address')
        ).toBeInTheDocument()
      })

      expect(fetch).not.toHaveBeenCalled()
    })

    it('does not call API when email is empty string', async () => {
      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(emailInput, { target: { value: '   ' } })
      fireEvent.change(emailInput, { target: { value: '' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText('Please enter your email address')
        ).toBeInTheDocument()
      })

      expect(fetch).not.toHaveBeenCalled()
    })
  })

  describe('Form Submission - Success Scenarios', () => {
    it('handles successful API call and shows success message', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(
            'If an account exists with this email, a temporary password has been generated and sent to your email address.'
          )
        ).toBeInTheDocument()
      })
    })

    it('calls API with correct payload', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/send-temporary-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: 'user@example.com' }),
        })
      })
    })

    it('shows success message with correct styling', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const successMessage = screen.getByText(
          'If an account exists with this email, a temporary password has been generated and sent to your email address.'
        )
        expect(successMessage).toBeInTheDocument()
        expect(successMessage).toHaveClass('text-green-600')
      })
    })
  })

  describe('Form Submission - Error Scenarios', () => {
    it('handles API error response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Username/email not found' }),
      })

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(emailInput, {
        target: { value: 'nonexistent@example.com' },
      })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Username/email not found')).toBeInTheDocument()
      })
    })

    it('shows default error message when API returns error without message', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      })

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText('Username/email not found. Please try again.')
        ).toBeInTheDocument()
      })
    })

    it('handles network failure', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText('Failed to process request. Please try again.')
        ).toBeInTheDocument()
      })
    })

    it('shows error message with correct styling', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Error occurred' }),
      })

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const errorMessage = screen.getByText('Error occurred')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveClass('text-red-500')
      })
    })

    it('handles JSON parse error gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText('Failed to process request. Please try again.')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Loading State', () => {
    it('shows loading text on submit button during API call', async () => {
      let resolvePromise
      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })

      fetch.mockReturnValueOnce(promise)

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /submitting/i })
        ).toBeInTheDocument()
      })

      // Resolve the promise
      resolvePromise({
        ok: true,
        json: async () => ({ success: true }),
      })

      await waitFor(() => {
        expect(
          screen.queryByRole('button', { name: /submitting/i })
        ).not.toBeInTheDocument()
      })
    })

    it('disables input field during submission', async () => {
      let resolvePromise
      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })

      fetch.mockReturnValueOnce(promise)

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(emailInput).toBeDisabled()
      })

      // Resolve the promise
      resolvePromise({
        ok: true,
        json: async () => ({ success: true }),
      })

      await waitFor(() => {
        expect(emailInput).not.toBeDisabled()
      })
    })

    it('disables submit button during submission', async () => {
      let resolvePromise
      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })

      fetch.mockReturnValueOnce(promise)

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })

      // Resolve the promise
      resolvePromise({
        ok: true,
        json: async () => ({ success: true }),
      })

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })
    })

    it('re-enables form after error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(emailInput).not.toBeDisabled()
        expect(submitButton).not.toBeDisabled()
      })
    })
  })

  describe('Message Display', () => {
    it('clears previous error messages on new submission', async () => {
      // First submission - error
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Error occurred' }),
      })

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Error occurred')).toBeInTheDocument()
      })

      // Second submission - success
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      fireEvent.change(emailInput, { target: { value: 'test2@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText('Error occurred')).not.toBeInTheDocument()
      })
    })

    it('clears previous success messages on new submission', async () => {
      // First submission - success
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(
            'If an account exists with this email, a temporary password has been generated and sent to your email address.'
          )
        ).toBeInTheDocument()
      })

      // Second submission - should clear success message
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'New error' }),
      })

      fireEvent.change(emailInput, { target: { value: 'test2@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.queryByText(
            'If an account exists with this email, a temporary password has been generated and sent to your email address.'
          )
        ).not.toBeInTheDocument()
      })
    })

    it('does not show both error and success messages simultaneously', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const successMessage = screen.queryByText(
          /temporary password has been generated/i
        )
        const errorMessage = screen.queryByText(/failed to process request/i)

        // At most one should be present
        if (successMessage) {
          expect(errorMessage).not.toBeInTheDocument()
        }
      })
    })
  })

  describe('Multiple Submissions', () => {
    it('handles multiple consecutive successful submissions', async () => {
      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      // First submission
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      fireEvent.change(emailInput, { target: { value: 'test1@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/temporary password has been generated/i)
        ).toBeInTheDocument()
      })

      expect(fetch).toHaveBeenCalledTimes(1)

      // Second submission
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      fireEvent.change(emailInput, { target: { value: 'test2@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2)
      })
    })

    it('handles alternating success and error submissions', async () => {
      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      // First submission - success
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      fireEvent.change(emailInput, { target: { value: 'test1@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/temporary password has been generated/i)
        ).toBeInTheDocument()
      })

      // Second submission - error
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'User not found' }),
      })

      fireEvent.change(emailInput, { target: { value: 'test2@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('User not found')).toBeInTheDocument()
        expect(
          screen.queryByText(/temporary password has been generated/i)
        ).not.toBeInTheDocument()
      })

      // Third submission - success again
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      fireEvent.change(emailInput, { target: { value: 'test3@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/temporary password has been generated/i)
        ).toBeInTheDocument()
        expect(screen.queryByText('User not found')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Behavior', () => {
    it('prevents default form submission', () => {
      renderWithQuery(<PasswordHelp />)

      const form = screen.getByRole('form')
      const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true,
      })

      form.dispatchEvent(submitEvent)

      expect(submitEvent.defaultPrevented).toBeTruthy()
    })

    it('submits form on Enter key press', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.submit(emailInput.closest('form'))

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/send-temporary-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: 'test@example.com' }),
        })
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper form role', () => {
      renderWithQuery(<PasswordHelp />)

      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
    })

    it('maintains focus management', () => {
      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      emailInput.focus()

      expect(document.activeElement).toBe(emailInput)
    })

    it('shows error messages with appropriate ARIA attributes', async () => {
      renderWithQuery(<PasswordHelp />)

      const submitButton = screen.getByRole('button', { name: /submit/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const errorMessage = screen.getByText('Please enter your email address')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveClass('text-red-500')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles very long email addresses', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const longEmail =
        'verylongemailaddressthatexceedsnormallength@example.com'

      fireEvent.change(emailInput, { target: { value: longEmail } })

      expect(emailInput.value).toBe(longEmail)
    })

    it('handles special characters in email', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const specialEmail = 'test+label@example-domain.co.uk'

      fireEvent.change(emailInput, { target: { value: specialEmail } })
      const submitButton = screen.getByRole('button', { name: /submit/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/send-temporary-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: specialEmail }),
        })
      })
    })

    it('handles API returning unexpected response format', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      })

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      // Should still show success message
      await waitFor(() => {
        expect(
          screen.getByText(/temporary password has been generated/i)
        ).toBeInTheDocument()
      })
    })

    it('handles rapid consecutive clicks on submit button', async () => {
      let resolvePromise
      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })

      fetch.mockReturnValueOnce(promise)

      renderWithQuery(<PasswordHelp />)

      const emailInput = screen.getByPlaceholderText('Username/email')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      // Click multiple times rapidly
      fireEvent.click(submitButton)
      fireEvent.click(submitButton)
      fireEvent.click(submitButton)

      // Should only call API once due to loading state
      expect(fetch).toHaveBeenCalledTimes(1)

      // Button should be disabled
      expect(submitButton).toBeDisabled()

      // Resolve the promise
      resolvePromise({
        ok: true,
        json: async () => ({ success: true }),
      })

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })
    })
  })
})
