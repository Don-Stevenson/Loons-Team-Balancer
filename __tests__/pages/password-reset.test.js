import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import PasswordResetPage from '../../src/app/password-reset/page'
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

describe('PasswordResetPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the password reset page', () => {
    renderWithQuery(<PasswordResetPage />)

    expect(screen.getByText('Password Reset')).toBeInTheDocument()
    expect(screen.getByText('Step 1: Verify your identity')).toBeInTheDocument()
  })

  it('renders PasswordResetStep1 component', () => {
    renderWithQuery(<PasswordResetPage />)

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Current Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('has back to login link', () => {
    renderWithQuery(<PasswordResetPage />)

    const backLink = screen.getByText('Back to login')
    expect(backLink).toBeInTheDocument()
    expect(backLink.closest('a')).toHaveAttribute('href', '/login')
  })

  it('renders the logo', () => {
    renderWithQuery(<PasswordResetPage />)

    const logo = screen.getByAltText('Toronto Walking Soccer Loons Club Logo')
    expect(logo).toBeInTheDocument()
  })
})
