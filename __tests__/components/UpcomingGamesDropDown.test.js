import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import UpcomingGamesDropDown from '../../src/app/components/ui/GamesSelector/UpcomingGamesDropDown/UpcomingGamesDropDown'

describe('UpcomingGamesDropDown', () => {
  const mockUpcomingGames = [
    { value: 'game1', label: 'Game 1' },
    { value: 'game2', label: 'Game 2' },
  ]
  const mockOnSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the dropdown with default text', () => {
    render(
      <UpcomingGamesDropDown
        upcomingGames={mockUpcomingGames}
        onSelect={mockOnSelect}
      />
    )
    expect(screen.getByText('Select an upcoming game')).toBeInTheDocument()
  })

  it('opens dropdown when clicked', () => {
    render(
      <UpcomingGamesDropDown
        upcomingGames={mockUpcomingGames}
        onSelect={mockOnSelect}
      />
    )

    const trigger = screen.getByText('Select an upcoming game')
    fireEvent.click(trigger)

    expect(screen.getByText('Game 1')).toBeInTheDocument()
    expect(screen.getByText('Game 2')).toBeInTheDocument()
  })

  it('closes dropdown when clicking outside', () => {
    render(
      <UpcomingGamesDropDown
        upcomingGames={mockUpcomingGames}
        onSelect={mockOnSelect}
      />
    )

    // Open dropdown
    const trigger = screen.getByText('Select an upcoming game')
    fireEvent.click(trigger)

    // Click outside
    fireEvent.mouseDown(document.body)

    expect(screen.queryByText('Game 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Game 2')).not.toBeInTheDocument()
  })

  it('selects a game and calls onSelect with correct value', () => {
    render(
      <UpcomingGamesDropDown
        upcomingGames={mockUpcomingGames}
        onSelect={mockOnSelect}
      />
    )

    // Open dropdown
    const trigger = screen.getByText('Select an upcoming game')
    fireEvent.click(trigger)

    // Select a game
    const gameOption = screen.getByText('Game 1')
    fireEvent.click(gameOption)

    // Check if onSelect was called with correct value
    expect(mockOnSelect).toHaveBeenCalledWith('game1')

    // Check if dropdown is closed and selected value is displayed
    expect(screen.getByText('Game 1')).toBeInTheDocument()
    expect(screen.queryByText('Game 2')).not.toBeInTheDocument()
  })

  it('maintains selected value after reopening dropdown', () => {
    render(
      <UpcomingGamesDropDown
        upcomingGames={mockUpcomingGames}
        onSelect={mockOnSelect}
      />
    )

    // Open dropdown and select a game
    const trigger = screen.getByText('Select an upcoming game')
    fireEvent.click(trigger)
    fireEvent.click(screen.getByText('Game 1'))

    // Reopen dropdown
    fireEvent.click(screen.getByText('Game 1'))

    // There should be two elements with 'Game 1': the button and the option
    const game1Elements = screen.getAllByText('Game 1')
    expect(game1Elements.length).toBe(2)
    expect(screen.getByText('Game 2')).toBeInTheDocument()
  })

  it('handles empty games list gracefully', () => {
    render(<UpcomingGamesDropDown upcomingGames={[]} onSelect={mockOnSelect} />)

    const trigger = screen.getByText('Select an upcoming game')
    expect(trigger).toBeInTheDocument()

    // Should still be able to click without errors
    fireEvent.click(trigger)
    expect(mockOnSelect).not.toHaveBeenCalled()
  })

  it('handles null or undefined props gracefully', () => {
    render(
      <UpcomingGamesDropDown upcomingGames={null} onSelect={mockOnSelect} />
    )

    // Should still render without crashing
    expect(screen.getByText('Select an upcoming game')).toBeInTheDocument()
  })

  it('correctly passes event data when games are selected', () => {
    render(
      <UpcomingGamesDropDown
        upcomingGames={mockUpcomingGames}
        onSelect={mockOnSelect}
      />
    )

    const trigger = screen.getByText('Select an upcoming game')
    fireEvent.click(trigger)

    // Select the second game
    const game2Option = screen.getByText('Game 2')
    fireEvent.click(game2Option)

    // Should call onSelect with the correct value
    expect(mockOnSelect).toHaveBeenCalledWith('game2')
  })

  describe('Heja Error Handling', () => {
    it('displays error message when gamesError is true', () => {
      render(
        <UpcomingGamesDropDown
          upcomingGames={[]}
          onSelect={mockOnSelect}
          gamesError={true}
          gamesErrorMessage="Heja is currently unavailable. Please try again later."
        />
      )

      // Open dropdown
      const trigger = screen.getByText('Select an upcoming game')
      fireEvent.click(trigger)

      // Should display error message
      expect(
        screen.getByText('⚠️ Heja Service Unavailable')
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Heja is currently unavailable/i)
      ).toBeInTheDocument()
    })

    it('displays default error message when gamesError is true but no message provided', () => {
      render(
        <UpcomingGamesDropDown
          upcomingGames={[]}
          onSelect={mockOnSelect}
          gamesError={true}
        />
      )

      // Open dropdown
      const trigger = screen.getByText('Select an upcoming game')
      fireEvent.click(trigger)

      // Should display default error message
      expect(
        screen.getByText(/⚠️ Heja Service Unavailable/i)
      ).toBeInTheDocument()
      expect(screen.getByText(/Please try again later./i)).toBeInTheDocument()
    })

    it('shows error message instead of games list when error occurs', () => {
      render(
        <UpcomingGamesDropDown
          upcomingGames={mockUpcomingGames}
          onSelect={mockOnSelect}
          gamesError={true}
          gamesErrorMessage="Service error occurred"
        />
      )

      // Open dropdown
      const trigger = screen.getByText('Select an upcoming game')
      fireEvent.click(trigger)

      // Should show error, not games
      expect(
        screen.getByText(/⚠️ Heja Service Unavailable/i)
      ).toBeInTheDocument()
      expect(screen.getByText('Service error occurred')).toBeInTheDocument()
      expect(screen.queryByText('Game 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Game 2')).not.toBeInTheDocument()
    })

    it('does not allow selecting games when error is shown', () => {
      render(
        <UpcomingGamesDropDown
          upcomingGames={[]}
          onSelect={mockOnSelect}
          gamesError={true}
          gamesErrorMessage="Error message"
        />
      )

      // Open dropdown
      const trigger = screen.getByText('Select an upcoming game')
      fireEvent.click(trigger)

      // Error message is not clickable (it's in an <li> but shouldn't trigger selection)
      const errorElement = screen.getByText('⚠️ Heja Service Unavailable')
      fireEvent.click(errorElement)

      // onSelect should not be called
      expect(mockOnSelect).not.toHaveBeenCalled()
    })

    it('shows "No upcoming games available" when no error and empty games list', () => {
      render(
        <UpcomingGamesDropDown
          upcomingGames={[]}
          onSelect={mockOnSelect}
          gamesError={false}
        />
      )

      // Open dropdown
      const trigger = screen.getByText('Select an upcoming game')
      fireEvent.click(trigger)

      // Should show empty state message, not error
      expect(
        screen.getByText('No upcoming games available')
      ).toBeInTheDocument()
      expect(
        screen.queryByText('⚠️ Heja Service Unavailable')
      ).not.toBeInTheDocument()
    })

    it('prioritizes error display over empty games list', () => {
      render(
        <UpcomingGamesDropDown
          upcomingGames={[]}
          onSelect={mockOnSelect}
          gamesError={true}
          gamesErrorMessage="API is down"
        />
      )

      // Open dropdown
      const trigger = screen.getByText('Select an upcoming game')
      fireEvent.click(trigger)

      // Should show error, not empty state
      expect(
        screen.getByText('⚠️ Heja Service Unavailable')
      ).toBeInTheDocument()
      expect(screen.getByText('API is down')).toBeInTheDocument()
      expect(
        screen.queryByText('No upcoming games available')
      ).not.toBeInTheDocument()
    })

    it('applies correct styling to error message', () => {
      render(
        <UpcomingGamesDropDown
          upcomingGames={[]}
          onSelect={mockOnSelect}
          gamesError={true}
        />
      )

      // Open dropdown
      const trigger = screen.getByText('Select an upcoming game')
      fireEvent.click(trigger)

      // Check if error message has the correct classes
      const errorContainer = screen
        .getByText('⚠️ Heja Service Unavailable')
        .closest('li')
      expect(errorContainer).toHaveClass(
        'px-4',
        'py-3',
        'text-red-600',
        'bg-red-50'
      )
    })
  })
})
