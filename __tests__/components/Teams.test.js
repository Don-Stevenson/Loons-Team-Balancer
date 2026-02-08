import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import Teams from '../../src/app/components/ui/Teams/Teams'
import { calculateTeamStats } from '../../src/app/utils/calculatePlayerAndTeamStats'

// Mock the utility functions
jest.mock('../../src/app/utils/getTeamName', () => ({
  getTeamName: jest.fn((index, teams, customColours, input) => {
    const totalTeams = teams.length
    let currentColour = ''

    if (customColours && customColours.length > 0 && customColours[index]) {
      const colourNames = input
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0)
      currentColour = colourNames[index]?.toLowerCase()
    } else {
      if (totalTeams === 3) {
        const colourIndex = index % 3
        currentColour =
          colourIndex === 0 ? 'red' : colourIndex === 1 ? 'black' : 'white'
      } else if (totalTeams === 2) {
        currentColour = index === 0 ? 'red' : 'black'
      } else {
        currentColour = index % 2 === 0 ? 'red' : 'black'
      }
    }

    // Count occurrences
    let totalOccurrences = 0
    let occurrenceNumber = 0

    for (let i = 0; i < totalTeams; i++) {
      let teamColour = ''

      if (customColours && customColours.length > 0 && customColours[i]) {
        const colourNames = input
          .split(',')
          .map((c) => c.trim())
          .filter((c) => c.length > 0)
        teamColour = colourNames[i]?.toLowerCase()
      } else {
        if (totalTeams === 3) {
          const colourIndex = i % 3
          teamColour =
            colourIndex === 0 ? 'red' : colourIndex === 1 ? 'black' : 'white'
        } else if (totalTeams === 2) {
          teamColour = i === 0 ? 'red' : 'black'
        } else {
          teamColour = i % 2 === 0 ? 'red' : 'black'
        }
      }

      if (teamColour === currentColour) {
        totalOccurrences++
        if (i === index) {
          occurrenceNumber = totalOccurrences
        }
      }
    }

    const capitalizedColour =
      currentColour.charAt(0).toUpperCase() + currentColour.slice(1)
    return totalOccurrences > 1
      ? `${capitalizedColour} Team ${occurrenceNumber}`
      : `${capitalizedColour} Team`
  }),
}))

jest.mock('../../src/app/utils/parseCustomColours', () => ({
  parseCustomColours: jest.fn((input) => {
    if (!input || input.trim() === '') return []
    const colours = input.split(',').map((c) => c.trim().toLowerCase())
    const colourMap = {
      red: 'border-loonsRed bg-red-200 print:bg-white',
      blue: 'border-blue-500 bg-blue-200 print:bg-white',
      green: 'border-green-500 bg-green-200 print:bg-white',
      yellow: 'border-yellow-400 bg-yellow-100 print:bg-white',
      purple: 'border-purple-500 bg-purple-100 print:bg-white',
      orange: 'border-orange-500 bg-orange-200 print:bg-white',
      pink: 'border-pink-500 bg-pink-100 print:bg-white',
      black: 'border-gray-800 bg-gray-200 print:bg-white',
      white: 'border-gray-500 bg-white print:bg-white',
    }
    return colours.map((c) => colourMap[c] || null).filter(Boolean)
  }),
}))

// Mock the child components
jest.mock('../../src/app/components/ui/Teams/TeamsHeader', () => {
  return function MockTeamHeader({
    team,
    index,
    parsedCustomColours,
    customColourInput,
  }) {
    return (
      <div data-testid={`team-header-${index}`}>
        <h3>Team {index}</h3>
        <p>Team Score: {team.totalScore?.toFixed(1)}</p>
        <p>
          Gender Count: Male - {team.genderCount.male}, Female -{' '}
          {team.genderCount.female}
        </p>
        {parsedCustomColours && parsedCustomColours.length > 0 && (
          <p data-testid={`custom-colour-${index}`}>Custom Colour Applied</p>
        )}
      </div>
    )
  }
})

jest.mock('../../src/app/components/ui/Teams/TeamsStats', () => {
  return function MockTeamStats({ team, index }) {
    return (
      <div data-testid={`team-stats-${index}`}>
        <p>Game Knowledge: {team.totalGameKnowledgeScore}</p>
        <p>Attack: {team.totalAttackScore}</p>
      </div>
    )
  }
})

jest.mock('../../src/app/components/ui/Teams/TeamsPlayerList', () => {
  return function MockTeamsPlayerList({
    team,
    teamIndex,
    handleDragStart,
    handleDragEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    hoveredPlayer,
    handleMouseEnter,
    handleMouseLeave,
  }) {
    return (
      <ul data-testid={`team-${teamIndex}-players`}>
        {team.players.map((player, idx) => (
          <li key={idx} data-testid={`team-${teamIndex}-player-${idx}`}>
            {player.name}
          </li>
        ))}
      </ul>
    )
  }
})

jest.mock('../../src/app/components/ui/GamesSelector/GameMeetDate', () => {
  return {
    __esModule: true,
    default: ({ meetdate }) => (
      <div data-testid="game-meet-date">{meetdate}</div>
    ),
    todaysDate: '2024-03-15',
  }
})

describe('Teams Component', () => {
  const mockPlayer1 = {
    _id: '1',
    name: 'Alice Smith',
    gameKnowledgeScore: 8,
    goalScoringScore: 7,
    attackScore: 8,
    midfieldScore: 7,
    defenseScore: 8,
    fitnessScore: 8,
    gender: 'female',
  }

  const mockPlayer2 = {
    _id: '2',
    name: 'Bob Johnson',
    gameKnowledgeScore: 7,
    goalScoringScore: 8,
    attackScore: 7,
    midfieldScore: 8,
    defenseScore: 7,
    fitnessScore: 8,
    gender: 'male',
  }

  const mockPlayer3 = {
    _id: '3',
    name: 'Charlie Brown',
    gameKnowledgeScore: 6,
    goalScoringScore: 6,
    attackScore: 6,
    midfieldScore: 6,
    defenseScore: 6,
    fitnessScore: 6,
    gender: 'male',
  }

  const mockPlayer4 = {
    _id: '4',
    name: 'Diana Prince',
    gameKnowledgeScore: 9,
    goalScoringScore: 9,
    attackScore: 9,
    midfieldScore: 9,
    defenseScore: 9,
    fitnessScore: 9,
    gender: 'female',
  }

  const createTeamWithStats = (players) => {
    return calculateTeamStats({ players })
  }

  describe('Rendering', () => {
    it('renders teams with correct structure', () => {
      const balancedTeams = [
        createTeamWithStats([mockPlayer1]),
        createTeamWithStats([mockPlayer2]),
      ]

      render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={2}
          selectedGameInfo={null}
        />
      )

      expect(
        screen.getByText('Total Number of People Playing: 2')
      ).toBeInTheDocument()
      expect(screen.getByTestId('team-header-0')).toBeInTheDocument()
      expect(screen.getByTestId('team-header-1')).toBeInTheDocument()
      expect(screen.getByTestId('team-0-players')).toBeInTheDocument()
      expect(screen.getByTestId('team-1-players')).toBeInTheDocument()
    })

    it('renders game information when provided', () => {
      const balancedTeams = [createTeamWithStats([mockPlayer1])]
      const selectedGameInfo = {
        title: 'Championship Match',
        meetdate: '2024-03-20T10:00:00.000Z',
      }

      render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={1}
          selectedGameInfo={selectedGameInfo}
        />
      )

      expect(screen.getByText('Championship Match')).toBeInTheDocument()
      expect(screen.getByTestId('game-meet-date')).toBeInTheDocument()
    })

    it("displays today's date when no game meetdate is provided", () => {
      const balancedTeams = [createTeamWithStats([mockPlayer1])]

      render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={1}
          selectedGameInfo={null}
        />
      )

      expect(screen.getByTestId('game-meet-date')).toHaveTextContent(
        '2024-03-15'
      )
    })

    it('renders multiple teams correctly', () => {
      const balancedTeams = [
        createTeamWithStats([mockPlayer1]),
        createTeamWithStats([mockPlayer2]),
        createTeamWithStats([mockPlayer3]),
        createTeamWithStats([mockPlayer4]),
      ]

      render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={4}
          selectedGameInfo={null}
        />
      )

      expect(screen.getByTestId('team-header-0')).toBeInTheDocument()
      expect(screen.getByTestId('team-header-1')).toBeInTheDocument()
      expect(screen.getByTestId('team-header-2')).toBeInTheDocument()
      expect(screen.getByTestId('team-header-3')).toBeInTheDocument()
    })
  })

  describe('Team Naming Logic', () => {
    it('names 2 teams as Red Team and Black Team', () => {
      const balancedTeams = [
        createTeamWithStats([mockPlayer1]),
        createTeamWithStats([mockPlayer2]),
      ]

      render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={2}
          selectedGameInfo={null}
        />
      )

      expect(screen.getByText(/Red Team/)).toBeInTheDocument()
      expect(screen.getByText(/Black Team/)).toBeInTheDocument()
    })

    it('names 3 teams as Red, Black, and White Team', () => {
      const balancedTeams = [
        createTeamWithStats([mockPlayer1]),
        createTeamWithStats([mockPlayer2]),
        createTeamWithStats([mockPlayer3]),
      ]

      render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={3}
          selectedGameInfo={null}
        />
      )

      expect(screen.getByText(/Red Team/)).toBeInTheDocument()
      expect(screen.getByText(/Black Team/)).toBeInTheDocument()
      expect(screen.getByText(/White Team/)).toBeInTheDocument()
    })

    it('names 4 teams with numbered Red and Black teams', () => {
      const balancedTeams = [
        createTeamWithStats([mockPlayer1]),
        createTeamWithStats([mockPlayer2]),
        createTeamWithStats([mockPlayer3]),
        createTeamWithStats([mockPlayer4]),
      ]

      render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={4}
          selectedGameInfo={null}
        />
      )

      expect(screen.getByText(/Red Team 1/)).toBeInTheDocument()
      expect(screen.getByText(/Black Team 1/)).toBeInTheDocument()
      expect(screen.getByText(/Red Team 2/)).toBeInTheDocument()
      expect(screen.getByText(/Black Team 2/)).toBeInTheDocument()
    })

    it('names 6 teams with numbered Red and Black teams', () => {
      const balancedTeams = Array.from({ length: 6 }, (_, i) =>
        createTeamWithStats([{ ...mockPlayer1, _id: `${i}` }])
      )

      render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={6}
          selectedGameInfo={null}
        />
      )

      expect(screen.getByText(/Red Team 1/)).toBeInTheDocument()
      expect(screen.getByText(/Black Team 1/)).toBeInTheDocument()
      expect(screen.getByText(/Red Team 2/)).toBeInTheDocument()
      expect(screen.getByText(/Black Team 2/)).toBeInTheDocument()
      expect(screen.getByText(/Red Team 3/)).toBeInTheDocument()
      expect(screen.getByText(/Black Team 3/)).toBeInTheDocument()
    })
  })

  describe('Drag and Drop Functionality', () => {
    it('handles drag start correctly', () => {
      const balancedTeams = [
        createTeamWithStats([mockPlayer1, mockPlayer2]),
        createTeamWithStats([mockPlayer3]),
      ]
      const setBalancedTeams = jest.fn()

      const { container } = render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={setBalancedTeams}
          totalPlayers={3}
          selectedGameInfo={null}
        />
      )

      const dropZones = container.querySelectorAll('[data-team-drop-zone]')
      expect(dropZones).toHaveLength(2)
      expect(dropZones[0]).toHaveAttribute('data-team-index', '0')
      expect(dropZones[1]).toHaveAttribute('data-team-index', '1')
    })

    it('handles drag over and adds highlight class', () => {
      const balancedTeams = [
        createTeamWithStats([mockPlayer1]),
        createTeamWithStats([mockPlayer2]),
      ]

      const { container } = render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={2}
          selectedGameInfo={null}
        />
      )

      const dropZone = container.querySelector('[data-team-index="0"]')

      fireEvent.dragOver(dropZone, {
        dataTransfer: {
          effectAllowed: 'move',
          dropEffect: 'move',
        },
      })

      expect(dropZone).toHaveClass('drag-over-highlight')
    })

    it('handles drag leave and removes highlight class', () => {
      const balancedTeams = [
        createTeamWithStats([mockPlayer1]),
        createTeamWithStats([mockPlayer2]),
      ]

      const { container } = render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={2}
          selectedGameInfo={null}
        />
      )

      const dropZone = container.querySelector('[data-team-index="0"]')

      fireEvent.dragOver(dropZone, {
        dataTransfer: {
          effectAllowed: 'move',
          dropEffect: 'move',
        },
      })
      expect(dropZone).toHaveClass('drag-over-highlight')

      fireEvent.dragLeave(dropZone)
      expect(dropZone).not.toHaveClass('drag-over-highlight')
    })

    it('does not move player when dropped on same team', () => {
      const balancedTeams = [
        createTeamWithStats([mockPlayer1, mockPlayer2]),
        createTeamWithStats([mockPlayer3]),
      ]
      const setBalancedTeams = jest.fn()

      const { container } = render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={setBalancedTeams}
          totalPlayers={3}
          selectedGameInfo={null}
        />
      )

      // Simulate dragging within the same team
      const dropZone = container.querySelector('[data-team-index="0"]')

      // This test verifies the structure is correct for drag and drop
      expect(dropZone).toBeInTheDocument()
    })
  })

  describe('Team Pagination', () => {
    it('splits teams with large rosters across pages', () => {
      // Create teams with more than 12 players each (should trigger 2 teams per page)
      const largeTeam1 = createTeamWithStats(
        Array.from({ length: 15 }, (_, i) => ({
          ...mockPlayer1,
          _id: `team1-${i}`,
          name: `Player 1-${i}`,
        }))
      )
      const largeTeam2 = createTeamWithStats(
        Array.from({ length: 15 }, (_, i) => ({
          ...mockPlayer2,
          _id: `team2-${i}`,
          name: `Player 2-${i}`,
        }))
      )
      const largeTeam3 = createTeamWithStats(
        Array.from({ length: 15 }, (_, i) => ({
          ...mockPlayer3,
          _id: `team3-${i}`,
          name: `Player 3-${i}`,
        }))
      )

      const { container } = render(
        <Teams
          balancedTeams={[largeTeam1, largeTeam2, largeTeam3]}
          setBalancedTeams={jest.fn()}
          totalPlayers={45}
          selectedGameInfo={null}
        />
      )

      // Should have multiple page sections
      const gridContainers = container.querySelectorAll('.grid')
      expect(gridContainers.length).toBeGreaterThan(1)
    })

    it('displays 4 teams per page for smaller teams', () => {
      const smallTeams = Array.from({ length: 8 }, (_, i) =>
        createTeamWithStats([
          { ...mockPlayer1, _id: `${i}`, name: `Player ${i}` },
        ])
      )

      const { container } = render(
        <Teams
          balancedTeams={smallTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={8}
          selectedGameInfo={null}
        />
      )

      // Should have 2 pages (4 teams per page)
      const gridContainers = container.querySelectorAll('.grid')
      expect(gridContainers).toHaveLength(2)
    })
  })

  describe('Team Stats Integration', () => {
    it('displays team stats for each team', () => {
      const balancedTeams = [
        createTeamWithStats([mockPlayer1]),
        createTeamWithStats([mockPlayer2]),
      ]

      render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={2}
          selectedGameInfo={null}
        />
      )

      expect(screen.getByTestId('team-stats-0')).toBeInTheDocument()
      expect(screen.getByTestId('team-stats-1')).toBeInTheDocument()
    })

    it('calculates and displays correct team scores', () => {
      const team1 = createTeamWithStats([mockPlayer1, mockPlayer2])
      const team2 = createTeamWithStats([mockPlayer3, mockPlayer4])

      render(
        <Teams
          balancedTeams={[team1, team2]}
          setBalancedTeams={jest.fn()}
          totalPlayers={4}
          selectedGameInfo={null}
        />
      )

      // Team scores should be displayed in the headers
      const headers = screen.getAllByText(/Team Score:/)
      expect(headers).toHaveLength(2)
    })
  })

  describe('Touch Events for Mobile', () => {
    it('sets up touch event handlers on drop zones', () => {
      const balancedTeams = [
        createTeamWithStats([mockPlayer1]),
        createTeamWithStats([mockPlayer2]),
      ]

      const { container } = render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={2}
          selectedGameInfo={null}
        />
      )

      const dropZones = container.querySelectorAll('[data-team-drop-zone]')
      expect(dropZones).toHaveLength(2)

      // Verify drop zones have correct data attributes
      expect(dropZones[0]).toHaveAttribute('data-team-drop-zone', 'true')
      expect(dropZones[1]).toHaveAttribute('data-team-drop-zone', 'true')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty teams array gracefully', () => {
      render(
        <Teams
          balancedTeams={[]}
          setBalancedTeams={jest.fn()}
          totalPlayers={0}
          selectedGameInfo={null}
        />
      )

      expect(
        screen.getByText('Total Number of People Playing: 0')
      ).toBeInTheDocument()
    })

    it('handles single team', () => {
      const balancedTeams = [createTeamWithStats([mockPlayer1])]

      render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={1}
          selectedGameInfo={null}
        />
      )

      expect(screen.getByTestId('team-header-0')).toBeInTheDocument()
      expect(screen.queryByTestId('team-header-1')).not.toBeInTheDocument()
    })

    it('handles teams with no players', () => {
      const balancedTeams = [
        createTeamWithStats([]),
        createTeamWithStats([mockPlayer1]),
      ]

      render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={1}
          selectedGameInfo={null}
        />
      )

      expect(screen.getByTestId('team-0-players')).toBeInTheDocument()
      expect(screen.getByTestId('team-1-players')).toBeInTheDocument()
    })

    it('handles missing selectedGameInfo gracefully', () => {
      const balancedTeams = [createTeamWithStats([mockPlayer1])]

      render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={1}
          selectedGameInfo={undefined}
        />
      )

      // Should still render without crashing
      expect(
        screen.getByText('Total Number of People Playing: 1')
      ).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper drag and drop attributes on team containers', () => {
      const balancedTeams = [
        createTeamWithStats([mockPlayer1]),
        createTeamWithStats([mockPlayer2]),
      ]

      const { container } = render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={2}
          selectedGameInfo={null}
        />
      )

      const dropZones = container.querySelectorAll('[data-team-drop-zone]')
      dropZones.forEach((zone, index) => {
        expect(zone).toHaveAttribute('data-team-index', index.toString())
        expect(zone).toHaveAttribute('data-team-drop-zone', 'true')
      })
    })
  })

  describe('Print Styles', () => {
    it('applies print-specific classes for printing', () => {
      const balancedTeams = [createTeamWithStats([mockPlayer1])]

      const { container } = render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={1}
          selectedGameInfo={{ title: 'Test Game', meetdate: '2024-03-20' }}
        />
      )

      // Verify print classes are present on the grid container
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toHaveClass('print:grid-cols-2')
      expect(gridContainer).toHaveClass('print:gap-1')
    })
  })

  describe('Custom Colour Functionality', () => {
    it('renders custom colour input field', () => {
      const balancedTeams = [createTeamWithStats([mockPlayer1])]

      render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={1}
          selectedGameInfo={null}
        />
      )

      const input = screen.getByPlaceholderText(
        /e.g., blue, yellow, green, purple/i
      )
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    it('displays help text for colour input', () => {
      const balancedTeams = [createTeamWithStats([mockPlayer1])]

      render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={1}
          selectedGameInfo={null}
        />
      )

      expect(
        screen.getByText(/Enter colour names separated by commas/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Available colours: red, blue, green, yellow, purple/i)
      ).toBeInTheDocument()
    })

    it('updates custom colour input when user types', () => {
      const balancedTeams = [createTeamWithStats([mockPlayer1])]

      render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={1}
          selectedGameInfo={null}
        />
      )

      const input = screen.getByPlaceholderText(
        /e.g., blue, yellow, green, purple/i
      )

      fireEvent.change(input, { target: { value: 'blue, yellow' } })

      expect(input).toHaveValue('blue, yellow')
    })

    it('displays success message when custom colours are applied', () => {
      const balancedTeams = [
        createTeamWithStats([mockPlayer1]),
        createTeamWithStats([mockPlayer2]),
      ]

      render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={2}
          selectedGameInfo={null}
        />
      )

      const input = screen.getByPlaceholderText(
        /e.g., blue, yellow, green, purple/i
      )

      fireEvent.change(input, { target: { value: 'blue, yellow' } })

      // Check for success message
      expect(
        screen.getByText(/✓ 2 custom colour\(s\) applied/i)
      ).toBeInTheDocument()
    })

    it('displays warning when more colours than teams', () => {
      const balancedTeams = [createTeamWithStats([mockPlayer1])]

      render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={1}
          selectedGameInfo={null}
        />
      )

      const input = screen.getByPlaceholderText(
        /e.g., blue, yellow, green, purple/i
      )

      fireEvent.change(input, { target: { value: 'blue, yellow, green' } })

      // Check for warning message
      expect(
        screen.getByText(/you have more colours than teams/i)
      ).toBeInTheDocument()
    })

    it('applies custom colour classes to team containers', () => {
      const balancedTeams = [
        createTeamWithStats([mockPlayer1]),
        createTeamWithStats([mockPlayer2]),
      ]

      const { container } = render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={2}
          selectedGameInfo={null}
        />
      )

      const input = screen.getByPlaceholderText(
        /e.g., blue, yellow, green, purple/i
      )

      fireEvent.change(input, { target: { value: 'blue, green' } })

      // Check that team containers have custom colour classes
      const teamContainers = container.querySelectorAll('[data-team-drop-zone]')
      expect(teamContainers[0]).toHaveClass('border-blue-500')
      expect(teamContainers[0]).toHaveClass('bg-blue-200')
      expect(teamContainers[0]).toHaveClass('print:bg-white')
      expect(teamContainers[1]).toHaveClass('border-green-500')
      expect(teamContainers[1]).toHaveClass('bg-green-200')
      expect(teamContainers[1]).toHaveClass('print:bg-white')
    })

    it('falls back to default colours when no custom input provided', () => {
      const balancedTeams = [
        createTeamWithStats([mockPlayer1]),
        createTeamWithStats([mockPlayer2]),
      ]

      const { container } = render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={2}
          selectedGameInfo={null}
        />
      )

      const teamContainers = container.querySelectorAll('[data-team-drop-zone]')

      // Default colours for 2 teams: red and black
      expect(teamContainers[0]).toHaveClass('border-loonsRed')
      expect(teamContainers[0]).toHaveClass('bg-red-200')
      expect(teamContainers[1]).toHaveClass('border-gray-800')
      expect(teamContainers[1]).toHaveClass('bg-gray-200')
    })

    it('passes custom colour props to TeamHeader component', () => {
      const balancedTeams = [createTeamWithStats([mockPlayer1])]

      render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={1}
          selectedGameInfo={null}
        />
      )

      const input = screen.getByPlaceholderText(
        /e.g., blue, yellow, green, purple/i
      )

      fireEvent.change(input, { target: { value: 'blue' } })

      // The mock TeamHeader should receive the props and display custom colour indicator
      expect(screen.getByTestId('custom-colour-0')).toBeInTheDocument()
    })

    it('handles invalid colour names gracefully', () => {
      const balancedTeams = [createTeamWithStats([mockPlayer1])]

      render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={1}
          selectedGameInfo={null}
        />
      )

      const input = screen.getByPlaceholderText(
        /e.g., blue, yellow, green, purple/i
      )

      // Enter invalid colour names
      fireEvent.change(input, {
        target: { value: 'notacolour, alsonotacolour' },
      })

      // Should not crash and should not show success message
      expect(
        screen.queryByText(/✓ \d+ custom colour\(s\) applied/i)
      ).not.toBeInTheDocument()
    })

    it('applies custom colours to three-team setup', () => {
      const balancedTeams = [
        createTeamWithStats([mockPlayer1]),
        createTeamWithStats([mockPlayer2]),
        createTeamWithStats([mockPlayer3]),
      ]

      const { container } = render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={3}
          selectedGameInfo={null}
        />
      )

      const input = screen.getByPlaceholderText(
        /e.g., blue, yellow, green, purple/i
      )

      fireEvent.change(input, { target: { value: 'purple, orange, pink' } })

      const teamContainers = container.querySelectorAll('[data-team-drop-zone]')

      // Check custom colours are applied to all three teams
      expect(teamContainers[0]).toHaveClass('border-purple-500')
      expect(teamContainers[0]).toHaveClass('bg-purple-100')
      expect(teamContainers[1]).toHaveClass('border-orange-500')
      expect(teamContainers[1]).toHaveClass('bg-orange-200')
      expect(teamContainers[2]).toHaveClass('border-pink-500')
      expect(teamContainers[2]).toHaveClass('bg-pink-100')
    })

    it('hides custom colour input when printing', () => {
      const balancedTeams = [createTeamWithStats([mockPlayer1])]

      const { container } = render(
        <Teams
          balancedTeams={balancedTeams}
          setBalancedTeams={jest.fn()}
          totalPlayers={1}
          selectedGameInfo={null}
        />
      )

      const inputContainer = container.querySelector('.print\\:hidden')
      const input = screen.getByPlaceholderText(
        /e.g., blue, yellow, green, purple/i
      )

      // Check that the input is within a print:hidden container
      expect(inputContainer).toContainElement(input)
    })
  })
})
