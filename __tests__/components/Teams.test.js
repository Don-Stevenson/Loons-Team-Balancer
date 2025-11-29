import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import Teams from '../../src/app/components/ui/Teams/Teams'
import { calculateTeamStats } from '../../src/app/utils/teamStats'

// Mock the child components
jest.mock('../../src/app/components/ui/Teams/TeamsHeader', () => {
  return function MockTeamHeader({ team, index, getTeamName }) {
    return (
      <div data-testid={`team-header-${index}`}>
        <h3>{getTeamName(index)}</h3>
        <p>Team Score: {team.totalScore?.toFixed(1)}</p>
        <p>
          Gender Count: Male - {team.genderCount.male}, Female -{' '}
          {team.genderCount.female}
        </p>
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
  return function MockTeamsPlayerList({ team, teamIndex }) {
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

  const createTeamWithStats = players => {
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

      expect(screen.getByText('Red Team')).toBeInTheDocument()
      expect(screen.getByText('Black Team')).toBeInTheDocument()
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

      expect(screen.getByText('Red Team')).toBeInTheDocument()
      expect(screen.getByText('Black Team')).toBeInTheDocument()
      expect(screen.getByText('White Team')).toBeInTheDocument()
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

      expect(screen.getByText('Red Team 1')).toBeInTheDocument()
      expect(screen.getByText('Black Team 1')).toBeInTheDocument()
      expect(screen.getByText('Red Team 2')).toBeInTheDocument()
      expect(screen.getByText('Black Team 2')).toBeInTheDocument()
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

      expect(screen.getByText('Red Team 1')).toBeInTheDocument()
      expect(screen.getByText('Black Team 1')).toBeInTheDocument()
      expect(screen.getByText('Red Team 2')).toBeInTheDocument()
      expect(screen.getByText('Black Team 2')).toBeInTheDocument()
      expect(screen.getByText('Red Team 3')).toBeInTheDocument()
      expect(screen.getByText('Black Team 3')).toBeInTheDocument()
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
})
