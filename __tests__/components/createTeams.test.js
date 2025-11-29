import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import CreateTeams from '../../src/app/components/ui/Teams/CreateTeams'

// Mock axios
jest.mock('axios', () => ({
  create: () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
  }),
}))

// Mock the api module from utils/FEapi
jest.mock('../../utils/FEapi', () => {
  const mockApi = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }

  const mockApiService = {
    players: {
      getAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      bulkUpdate: jest.fn(),
    },
    games: {
      getUpcoming: jest.fn(),
      getRsvps: jest.fn(),
    },
    teams: {
      balance: jest.fn(),
    },
  }

  return {
    __esModule: true,
    default: mockApi,
    apiService: mockApiService,
  }
})

// Mock React Query hooks
jest.mock('../../src/app/hooks/useApi', () => ({
  usePlayers: jest.fn(),
  useUpcomingGames: jest.fn(),
  useGameRsvps: jest.fn(),
  useBulkUpdatePlayers: jest.fn(),
  useBalanceTeams: jest.fn(),
}))

// Import the mocked api and hooks
import api, { apiService } from '../../utils/FEapi'
import {
  usePlayers,
  useUpcomingGames,
  useGameRsvps,
  useBulkUpdatePlayers,
  useBalanceTeams,
} from '../../src/app/hooks/useApi'

// Mock the child components
jest.mock(
  '../../src/app/components/ui/PlayerList/PlayerListToggleIsPlaying',
  () => {
    return function MockPlayerListToggleIsPlaying({
      players,
      onTogglePlayingThisWeek,
    }) {
      return (
        <div data-testid="player-list">
          {players.map(player => (
            <div key={player._id} data-testid={`player-${player._id}`}>
              <button onClick={() => onTogglePlayingThisWeek(player._id)}>
                Toggle {player.name}
              </button>
            </div>
          ))}
        </div>
      )
    }
  }
)

jest.mock('../../src/app/components/ui/Teams/Teams', () => {
  return function MockTeams({ balancedTeams, totalPlayers }) {
    // Helper function to get team name - matches the actual component logic
    const getTeamName = index => {
      const totalTeams = balancedTeams.length

      if (totalTeams === 3) {
        const colorIndex = index % 3
        if (colorIndex === 0) return 'Red Team'
        if (colorIndex === 1) return 'Black Team'
        if (colorIndex === 2) return 'White Team'
      }

      if (totalTeams === 2) {
        return index === 0 ? 'Red Team' : 'Black Team'
      }

      const isRedTeam = index % 2 === 0
      const teamNumber = Math.floor(index / 2) + 1
      const color = isRedTeam ? 'Red' : 'Black'

      return `${color} Team ${teamNumber}`
    }

    return (
      <div data-testid="teams">
        <div data-testid="total-players">{totalPlayers}</div>
        {balancedTeams?.map((team, index) => (
          <div key={index} data-testid={`team-${index}`}>
            <div data-testid={`team-${index}-name`}>{getTeamName(index)}</div>
            {team.players.map(player => (
              <div
                key={player.name}
                data-testid={`team-${index}-player-${player.name}`}
              >
                {player.name}
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }
})

jest.mock('../../src/app/components/ui/GamesSelector/GameSelector', () => {
  return function MockGameSelector({
    upcomingGames,
    onGameSelect,
    selectedGameId,
    queryRsvpsForGame,
  }) {
    return (
      <div data-testid="upcoming-games">
        <select onChange={e => onGameSelect && onGameSelect(e.target.value)}>
          <option value="">Select a game</option>
          {upcomingGames.map(game => (
            <option key={game._id} value={game._id}>
              {game.title} - {new Date(game.meetdate).toLocaleDateString()}
            </option>
          ))}
        </select>
        {selectedGameId && (
          <div>
            <h3>
              {queryRsvpsForGame.length} Players RSVP'd for this game on Heja
            </h3>
          </div>
        )}
      </div>
    )
  }
})

// This test suite focuses on the CreateTeams parent component integration tests.
// Team naming patterns and team-specific logic are tested in Teams.test.js
// Player list rendering logic is tested in TeamsPlayerList.test.js
describe('CreateTeams Component', () => {
  const mockPlayers = [
    {
      _id: '1',
      name: 'Player 1',
      gameKnowledgeScore: 8,
      goalScoringScore: 7,
      attackScore: 8,
      midfieldScore: 7,
      defenseScore: 8,
      fitnessScore: 8,
      gender: 'male',
      isPlayingThisWeek: false,
    },
    {
      _id: '2',
      name: 'Player 2',
      gameKnowledgeScore: 7,
      goalScoringScore: 8,
      attackScore: 7,
      midfieldScore: 8,
      defenseScore: 7,
      fitnessScore: 8,
      gender: 'male',
      isPlayingThisWeek: false,
    },
  ]

  const mockUpcomingGames = [
    {
      _id: 'game1',
      title: 'Game 1',
      meetdate: '2024-03-20T10:00:00.000Z',
    },
  ]

  const mockRsvps = ['Player 1', 'Player 2']

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    // Mock React Query hooks
    usePlayers.mockReturnValue({
      data: mockPlayers,
      isLoading: false,
      isError: false,
      error: null,
    })

    useUpcomingGames.mockReturnValue({
      data: mockUpcomingGames,
      isLoading: false,
      isError: false,
      error: null,
    })

    useGameRsvps.mockReturnValue({
      data: mockRsvps,
      isLoading: false,
      isError: false,
      error: null,
    })

    useBulkUpdatePlayers.mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn().mockResolvedValue({ success: true }),
      isLoading: false,
      isError: false,
      error: null,
    })

    useBalanceTeams.mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn().mockResolvedValue({
        teams: [{ players: [mockPlayers[0]] }, { players: [mockPlayers[1]] }],
      }),
      isLoading: false,
      isError: false,
      error: null,
    })

    // Mock API responses (keeping for backward compatibility)
    api.get.mockImplementation(url => {
      if (url === '/players') {
        return Promise.resolve({ data: mockPlayers })
      }
      if (url === '/upcoming-games') {
        return Promise.resolve({ data: mockUpcomingGames })
      }
      if (url === '/rsvps-for-game/game1') {
        return Promise.resolve({ data: mockRsvps })
      }
      return Promise.reject(new Error('Not found'))
    })

    api.put.mockImplementation((url, data) => {
      if (url === '/players-bulk-update') {
        return Promise.resolve({ data: { success: true } })
      }
      if (url.startsWith('/players/')) {
        return Promise.resolve({ data: { success: true } })
      }
      return Promise.reject(new Error('Not found'))
    })

    api.post.mockImplementation((url, data) => {
      if (url === '/balance-teams') {
        return Promise.resolve({
          data: {
            teams: [
              { players: [mockPlayers[0]] },
              { players: [mockPlayers[1]] },
            ],
          },
        })
      }
      return Promise.reject(new Error('Not found'))
    })
  })

  it('renders basic component structure when no players are loaded', async () => {
    // Test the component renders properly when there are no players
    usePlayers.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    })

    await act(async () => {
      render(<CreateTeams />)
    })

    // Should render the main headings and structure
    expect(screen.getByText('Create Teams')).toBeInTheDocument()
    expect(screen.getByText('Player List')).toBeInTheDocument()
    expect(screen.getByText('Total Players Selected: 0')).toBeInTheDocument()

    // Player list should be empty since no players
    expect(screen.queryByTestId('player-list')).not.toBeInTheDocument()
  })

  it('loads and displays players after initial load', async () => {
    await act(async () => {
      render(<CreateTeams />)
    })

    await waitFor(
      () => {
        expect(screen.getByTestId('player-list')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    expect(screen.getByText('Total Players Selected: 0')).toBeInTheDocument()
  })

  it('toggles player selection when clicked', async () => {
    await act(async () => {
      render(<CreateTeams />)
    })

    await waitFor(
      () => {
        expect(screen.getByTestId('player-list')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    const toggleButton = screen.getByTestId('player-1').querySelector('button')
    await act(async () => {
      fireEvent.click(toggleButton)
    })

    await waitFor(
      () => {
        expect(
          screen.getByText('Total Players Selected: 1')
        ).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('handles select all functionality', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({ success: true })

    useBulkUpdatePlayers.mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: mockMutateAsync,
      isLoading: false,
      isError: false,
      error: null,
    })

    await act(async () => {
      render(<CreateTeams />)
    })

    await waitFor(
      () => {
        expect(screen.getByTestId('player-list')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    const selectAllCheckbox = screen.getByRole('checkbox')

    // Initially all players should be unselected
    expect(screen.getByText('Total Players Selected: 0')).toBeInTheDocument()
    expect(selectAllCheckbox.checked).toBe(false)

    // Click to select all players
    await act(async () => {
      fireEvent.click(selectAllCheckbox)
    })

    await waitFor(
      () => {
        expect(
          screen.getByText('Total Players Selected: 2')
        ).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Verify React Query mutation was called with correct parameters
    expect(mockMutateAsync).toHaveBeenCalledWith({
      isPlayingThisWeek: true,
      playerIds: ['1', '2'],
    })

    // Checkbox should now be checked
    expect(selectAllCheckbox.checked).toBe(true)
  })

  it('handles toggle all functionality - deselect all', async () => {
    // Start with all players selected by mocking them as playing
    const playingPlayers = mockPlayers.map(player => ({
      ...player,
      isPlayingThisWeek: true,
    }))

    const mockMutateAsync = jest.fn().mockResolvedValue({ success: true })

    usePlayers.mockReturnValue({
      data: playingPlayers,
      isLoading: false,
      isError: false,
      error: null,
    })

    useBulkUpdatePlayers.mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: mockMutateAsync,
      isLoading: false,
      isError: false,
      error: null,
    })

    await act(async () => {
      render(<CreateTeams />)
    })

    await waitFor(
      () => {
        expect(screen.getByTestId('player-list')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Should show all players selected initially
    await waitFor(
      () => {
        expect(
          screen.getByText('Total Players Selected: 2')
        ).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    const selectAllCheckbox = screen.getByRole('checkbox')
    expect(selectAllCheckbox.checked).toBe(true)

    // Click to deselect all players
    await act(async () => {
      fireEvent.click(selectAllCheckbox)
    })

    await waitFor(
      () => {
        expect(
          screen.getByText('Total Players Selected: 0')
        ).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Verify React Query mutation was called with correct parameters to deselect all
    expect(mockMutateAsync).toHaveBeenCalledWith({
      isPlayingThisWeek: false,
      playerIds: ['1', '2'],
    })

    // Checkbox should now be unchecked
    expect(selectAllCheckbox.checked).toBe(false)
  })

  it('handles select all API failure gracefully', async () => {
    // Mock mutation to fail
    const mockMutateAsync = jest.fn().mockRejectedValue(new Error('API Error'))

    useBulkUpdatePlayers.mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: mockMutateAsync,
      isLoading: false,
      isError: false,
      error: null,
    })

    await act(async () => {
      render(<CreateTeams />)
    })

    await waitFor(
      () => {
        expect(screen.getByTestId('player-list')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    const selectAllCheckbox = screen.getByRole('checkbox')

    // Click to select all players
    await act(async () => {
      fireEvent.click(selectAllCheckbox)
    })

    // Should revert the change on error
    await waitFor(
      () => {
        expect(
          screen.getByText('Total Players Selected: 0')
        ).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Should show error message
    await waitFor(
      () => {
        expect(
          screen.getAllByText('Failed to update all players').length
        ).toBeGreaterThan(0)
      },
      { timeout: 3000 }
    )

    // Checkbox should be reverted to unchecked state
    expect(selectAllCheckbox.checked).toBe(false)
  })

  it('creates balanced teams when button is clicked', async () => {
    const mockBulkMutateAsync = jest.fn().mockResolvedValue({ success: true })
    const mockBalanceMutateAsync = jest.fn().mockResolvedValue({
      teams: [{ players: [mockPlayers[0]] }, { players: [mockPlayers[1]] }],
    })

    useBulkUpdatePlayers.mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: mockBulkMutateAsync,
      isLoading: false,
      isError: false,
      error: null,
    })

    useBalanceTeams.mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: mockBalanceMutateAsync,
      isLoading: false,
      isError: false,
      error: null,
    })

    await act(async () => {
      render(<CreateTeams />)
    })

    await waitFor(
      () => {
        expect(screen.getByTestId('player-list')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Select all players first
    const selectAllCheckbox = screen.getByRole('checkbox')
    await act(async () => {
      fireEvent.click(selectAllCheckbox)
    })

    await waitFor(
      () => {
        expect(
          screen.getByText('Total Players Selected: 2')
        ).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Click create teams button
    const createTeamsButton = screen.getByText('Create Balanced Teams')
    await act(async () => {
      fireEvent.click(createTeamsButton)
    })

    await waitFor(
      () => {
        expect(screen.getByTestId('teams')).toBeInTheDocument()
        expect(screen.getByTestId('total-players')).toHaveTextContent('2')
      },
      { timeout: 3000 }
    )
  })

  it('handles game selection and RSVP loading', async () => {
    await act(async () => {
      render(<CreateTeams />)
    })

    await waitFor(
      () => {
        expect(screen.getByTestId('upcoming-games')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Select a game
    const gameSelect = screen
      .getByTestId('upcoming-games')
      .querySelector('select')
    await act(async () => {
      fireEvent.change(gameSelect, { target: { value: 'game1' } })
    })

    await waitFor(
      () => {
        expect(
          screen.getByText("2 Players RSVP'd for this game on Heja")
        ).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('updates number of teams correctly', async () => {
    await act(async () => {
      render(<CreateTeams />)
    })

    await waitFor(
      () => {
        expect(screen.getByTestId('player-list')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    const numTeamsInput = screen.getByLabelText('Number of Teams')
    await act(async () => {
      fireEvent.change(numTeamsInput, { target: { value: '3' } })
    })

    expect(numTeamsInput.value).toBe('3')
  })

  it('toggles player list visibility', async () => {
    await act(async () => {
      render(<CreateTeams />)
    })

    await waitFor(
      () => {
        expect(screen.getByTestId('player-list')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    const toggleButton = screen.getByText('Hide Player List')
    await act(async () => {
      fireEvent.click(toggleButton)
    })

    await waitFor(
      () => {
        expect(screen.queryByTestId('player-list')).not.toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })
})
