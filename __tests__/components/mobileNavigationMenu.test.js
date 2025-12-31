import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MobileNavigatonMenu } from '../../src/app/components/ui/Navbar/MobileNavigatonMenu'

// Create a mock onClick handler that we can track
const mockLogoutClick = jest.fn()

// Mock the Logout component
jest.mock('../../src/app/components/ui/Logout/Logout', () => {
  return function MockLogout({ variant }) {
    return (
      <button onClick={mockLogoutClick} data-testid="logout-button">
        Logout
      </button>
    )
  }
})

describe('MobileNavigationMenu', () => {
  let mockSetIsMobileMenuOpen
  let mockIsMobileMenuOpen

  beforeEach(() => {
    mockSetIsMobileMenuOpen = jest.fn()
    mockIsMobileMenuOpen = false
    mockLogoutClick.mockClear()
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the MobileNavigationMenu component', () => {
    render(<MobileNavigatonMenu />)
    expect(
      screen.getByRole('navigation', { name: 'Mobile navigation menu' })
    ).toBeInTheDocument()
  })

  it('renders the MobileNavigationMenu component with required props', () => {
    render(
      <MobileNavigatonMenu
        isMobileMenuOpen={mockIsMobileMenuOpen}
        setIsMobileMenuOpen={mockSetIsMobileMenuOpen}
      />
    )
    expect(
      screen.getByRole('navigation', { name: 'Mobile navigation menu' })
    ).toBeInTheDocument()
  })
  it('links to the correct pages', () => {
    render(
      <MobileNavigatonMenu
        isMobileMenuOpen={mockIsMobileMenuOpen}
        setIsMobileMenuOpen={mockSetIsMobileMenuOpen}
      />
    )
    const createTeamsLink = screen.getByRole('link', { name: 'Create Teams' })
    const managePlayersLink = screen.getByRole('link', {
      name: 'Manage Players',
    })
    const aboutLink = screen.getByRole('link', { name: 'About' })
    expect(createTeamsLink).toHaveAttribute('href', '/create-teams')
    expect(managePlayersLink).toHaveAttribute('href', '/players')
    expect(aboutLink).toHaveAttribute('href', '/about')
  })

  it('calls setIsMobileMenuOpen with false when a link is clicked', () => {
    render(
      <MobileNavigatonMenu
        isMobileMenuOpen={mockIsMobileMenuOpen}
        setIsMobileMenuOpen={mockSetIsMobileMenuOpen}
      />
    )
    const createTeamsLink = screen.getByRole('link', { name: 'Create Teams' })
    fireEvent.click(createTeamsLink)
    expect(mockSetIsMobileMenuOpen).toHaveBeenCalledTimes(1)
    expect(mockSetIsMobileMenuOpen).toHaveBeenCalledWith(false)
  })
  it('renders the Logout component', () => {
    render(
      <MobileNavigatonMenu
        isMobileMenuOpen={mockIsMobileMenuOpen}
        setIsMobileMenuOpen={mockSetIsMobileMenuOpen}
      />
    )
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
  })
  it('calls logout when the Logout button is clicked', () => {
    render(
      <MobileNavigatonMenu
        isMobileMenuOpen={mockIsMobileMenuOpen}
        setIsMobileMenuOpen={mockSetIsMobileMenuOpen}
      />
    )
    const logoutButton = screen.getByTestId('logout-button')
    fireEvent.click(logoutButton)
    expect(mockLogoutClick).toHaveBeenCalledTimes(1)
  })
})
