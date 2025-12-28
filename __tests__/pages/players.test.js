import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import Players from '../../src/app/players/page'
import { renderWithQuery } from '../utils/test-utils'
import PlayerList from '../../src/app/components/ui/PlayerList/PlayerList'

// Mock the API utility
jest.mock('../../utils/FEapi', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

jest.mock('../../src/app/components/features/auth/withAuthWrapper', () => {
  return jest.fn(Component => {
    const WithAuthComponent = props => <Component {...props} />
    WithAuthComponent.displayName = `WithAuth(${
      Component.displayName || Component.name || 'Component'
    })`
    return WithAuthComponent
  })
})

jest.mock('../../src/app/components/layout/ClientLayout', () => {
  return jest.fn(({ children }) => (
    <div data-testid="mock-layout">{children}</div>
  ))
})

// Mock the React Query hooks to prevent warnings
jest.mock('../../src/app/hooks/useApi', () => ({
  usePlayers: jest.fn(() => ({ data: [], isLoading: false, error: null })),
  useCreatePlayer: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
  useUpdatePlayer: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
  useDeletePlayer: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
}))

// Mock react-spinners
jest.mock('react-spinners', () => ({
  PulseLoader: () => <div data-testid="pulse-loader">Loading...</div>,
}))

// Import the mocked API
import api from '../../utils/FEapi'

const mockPlayers = [
  {
    _id: '1',
    name: 'John Doe',
    attackScore: 6,
    defenseScore: 7,
    fitnessScore: 8,
    isPlayingThisWeek: true,
  },
  {
    _id: '2',
    name: 'Alice Smith',
    attackScore: 7,
    defenseScore: 8,
    fitnessScore: 9,
    isPlayingThisWeek: false,
  },
]

describe('Players Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    api.get.mockResolvedValue({ data: mockPlayers })
  })

  describe('Rendering', () => {
    it('renders the page with correct headings', async () => {
      await act(async () => {
        renderWithQuery(<Players />)
      })

      // Wait for the initial loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading players')).not.toBeInTheDocument()
      })

      expect(screen.getByText('Manage Players')).toBeInTheDocument()
      expect(screen.getByText('Add A New Player')).toBeInTheDocument()
      expect(screen.getByText('List of Players')).toBeInTheDocument()
    })

    it('fetches and displays players on mount', async () => {
      await act(async () => {
        renderWithQuery(<Players />)
      })

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/players')
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('shows loading message when initially loading', async () => {
      // Make the API call take some time
      api.get.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ data: mockPlayers }), 100)
          )
      )

      await act(async () => {
        renderWithQuery(<Players />)
      })

      expect(screen.getByText('Loading players')).toBeInTheDocument()
    })

    it('hides loading message after players are loaded', async () => {
      await act(async () => {
        renderWithQuery(<Players />)
      })

      await waitFor(() => {
        expect(screen.queryByText('Loading players')).not.toBeInTheDocument()
      })
    })

    it('handles loading state during data fetch', async () => {
      const delay = new Promise(resolve => setTimeout(resolve, 100))
      api.get.mockImplementationOnce(() =>
        delay.then(() => ({ data: mockPlayers }))
      )

      await act(async () => {
        renderWithQuery(<Players />)
      })

      expect(screen.getByText('Loading players')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText('Loading players')).not.toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })
    })

    it('handles error during loading gracefully', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      api.get.mockRejectedValueOnce(new Error('Failed to fetch'))

      await act(async () => {
        renderWithQuery(<Players />)
      })

      await waitFor(() => {
        expect(screen.queryByText('Loading players')).not.toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })
  })

  describe('Add Player Functionality', () => {
    let user

    beforeEach(() => {
      user = userEvent.setup()
      jest.clearAllMocks()
    })

    it('toggles add player form visibility', async () => {
      await act(async () => {
        renderWithQuery(<Players />)
      })

      // Wait for the initial loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading players')).not.toBeInTheDocument()
      })

      await act(async () => {
        const addButton = screen.getByText('Add A New Player')
        await user.click(addButton)
      })

      expect(screen.getByTestId('add-player-form')).toBeInTheDocument()

      await act(async () => {
        await user.click(screen.getAllByTestId('cancel-button')[0])
      })

      expect(screen.queryByTestId('add-player-form')).not.toBeInTheDocument()
    })

    it('adds a new player successfully', async () => {
      const newPlayer = {
        _id: '3',
        name: 'New Player',
        gameKnowledgeScore: 2,
        goalScoringScore: 2,
        attackScore: 2,
        midfieldScore: 2,
        defenseScore: 2,
        fitnessScore: 2,
        gender: 'male',
        isPlayingThisWeek: true,
      }

      api.post.mockResolvedValueOnce({ data: newPlayer })

      await act(async () => {
        renderWithQuery(<Players />)
      })

      // Wait for the initial loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading players')).not.toBeInTheDocument()
      })

      const addButton = screen.getByText('Add A New Player')
      await act(async () => {
        await user.click(addButton)
      })

      await act(async () => {
        await user.type(screen.getByLabelText(/name/i), newPlayer.name)
        await user.type(
          screen.getByLabelText(/game knowledge score/i),
          newPlayer.gameKnowledgeScore.toString()
        )
        await user.type(
          screen.getByLabelText(/goal scoring score/i),
          newPlayer.goalScoringScore.toString()
        )
        await user.type(
          screen.getByLabelText(/attack score/i),
          newPlayer.attackScore.toString()
        )
        await user.type(
          screen.getByLabelText(/midfield score/i),
          newPlayer.midfieldScore.toString()
        )
        await user.type(
          screen.getByLabelText(/defense score/i),
          newPlayer.defenseScore.toString()
        )
        await user.type(
          screen.getByLabelText(/mobility\/stamina/i),
          newPlayer.fitnessScore.toString()
        )
      })

      const form = screen.getByTestId('add-player-form')
      await act(async () => {
        fireEvent.submit(form)
      })

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(
          '/players',
          expect.objectContaining({
            name: newPlayer.name,
            gameKnowledgeScore: newPlayer.gameKnowledgeScore.toString(),
            goalScoringScore: newPlayer.goalScoringScore.toString(),
            attackScore: newPlayer.attackScore.toString(),
            midfieldScore: newPlayer.midfieldScore.toString(),
            defenseScore: newPlayer.defenseScore.toString(),
            fitnessScore: newPlayer.fitnessScore.toString(),
            isPlayingThisWeek: true,
          })
        )
      })
    })
  })

  describe('Edit Player Functionality', () => {
    it('opens edit modal when edit button is clicked', async () => {
      await act(async () => {
        renderWithQuery(<Players />)
      })

      await waitFor(() => {
        const editButton = screen.getAllByTestId('edit-player')[0]
        fireEvent.click(editButton)
      })

      expect(screen.getByTestId('edit-player-modal')).toBeInTheDocument()
    })

    describe('PlayerList', () => {
      it('calls onEditPlayer when edit button is clicked', async () => {
        const mockOnEditPlayer = jest.fn()
        await act(async () => {
          renderWithQuery(
            <PlayerList
              players={mockPlayers}
              onEditPlayer={mockOnEditPlayer}
              onDeletePlayer={() => {}}
              fetchPlayers={() => {}}
            />
          )
        })

        const editButton = screen.getAllByTestId('edit-player')[0]
        await act(async () => {
          fireEvent.click(editButton)
        })

        expect(mockOnEditPlayer).toHaveBeenCalledWith('2')
      })
    })
  })

  describe('Success Message Functionality', () => {
    it('shows success message after adding a player', async () => {
      const newPlayer = {
        _id: '3',
        name: 'New Player',
        gameKnowledgeScore: 5,
        goalScoringScore: 6,
        attackScore: 7,
        midfieldScore: 8,
        defenseScore: 9,
        fitnessScore: 10,
        isPlayingThisWeek: true,
      }

      api.post.mockResolvedValueOnce({ data: newPlayer })

      await act(async () => {
        renderWithQuery(<Players />)
      })

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Open add player modal
      const addButton = screen.getByText('Add A New Player')
      await act(async () => {
        userEvent.click(addButton)
      })

      await waitFor(() => {
        expect(screen.getByTestId('add-player-form')).toBeInTheDocument()
      })

      // Fill out form
      const nameInput = screen.getByLabelText(/name/i)
      const gameKnowledgeInput = screen.getByLabelText(/game knowledge score/i)
      const goalScoringInput = screen.getByLabelText(/goal scoring score/i)
      const attackInput = screen.getByLabelText(/attack score/i)
      const midfieldInput = screen.getByLabelText(/midfield score/i)
      const defenseInput = screen.getByLabelText(/defense score/i)
      const fitnessInput = screen.getByLabelText(/mobility\/stamina/i)

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: newPlayer.name } })
        fireEvent.change(gameKnowledgeInput, {
          target: { value: newPlayer.gameKnowledgeScore.toString() },
        })
        fireEvent.change(goalScoringInput, {
          target: { value: newPlayer.goalScoringScore.toString() },
        })
        fireEvent.change(attackInput, {
          target: { value: newPlayer.attackScore.toString() },
        })
        fireEvent.change(midfieldInput, {
          target: { value: newPlayer.midfieldScore.toString() },
        })
        fireEvent.change(defenseInput, {
          target: { value: newPlayer.defenseScore.toString() },
        })
        fireEvent.change(fitnessInput, {
          target: { value: newPlayer.fitnessScore.toString() },
        })
      })

      const form = screen.getByTestId('add-player-form')
      await act(async () => {
        fireEvent.submit(form)
      })

      // Check that success message appears
      await waitFor(() => {
        expect(
          screen.getByText('Player added successfully!')
        ).toBeInTheDocument()
      })
    })

    it('only one success message container exists', async () => {
      await act(async () => {
        renderWithQuery(<Players />)
      })

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Find all success message containers
      const container = screen.getByText('Manage Players').closest('div')
      const successMessageElements = container.querySelectorAll('p.italic.h-6')

      expect(successMessageElements).toHaveLength(1)
    })

    it('shows success message after editing a player', async () => {
      const updatedPlayer = {
        _id: '1',
        name: 'John Doe Updated',
        gameKnowledgeScore: 5,
        goalScoringScore: 6,
        attackScore: 7,
        midfieldScore: 8,
        defenseScore: 9,
        fitnessScore: 10,
        isPlayingThisWeek: true,
      }

      api.put.mockResolvedValueOnce({ data: updatedPlayer })
      // Mock the fetchPlayers(true) call that happens after update
      api.get.mockResolvedValueOnce({ data: [updatedPlayer, mockPlayers[1]] })

      await act(async () => {
        renderWithQuery(<Players />)
      })

      await waitFor(() => {
        expect(screen.getByText('John Doe Updated')).toBeInTheDocument()
      })

      // Click edit button for John Doe (the second one in the list, since Alice comes first alphabetically)
      const editButtons = screen.getAllByTestId('edit-player')
      const johnEditButton = editButtons[1] // John Doe is second in alphabetical order
      await act(async () => {
        fireEvent.click(johnEditButton)
      })

      await waitFor(() => {
        expect(screen.getByTestId('edit-player-modal')).toBeInTheDocument()
      })

      // Update player name
      const nameInput = screen.getByLabelText('Name')
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: updatedPlayer.name } })
      })

      // Submit the form
      const saveButton = screen.getByText(/Save Changes/i)
      await act(async () => {
        fireEvent.click(saveButton)
      })

      // Check that success message appears
      await waitFor(() => {
        expect(
          screen.getByText('Player updated successfully!')
        ).toBeInTheDocument()
      })
    })

    it('shows success message after deleting a player', async () => {
      api.delete.mockResolvedValueOnce({})

      await act(async () => {
        renderWithQuery(<Players />)
      })

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      })

      // Click delete button for Alice Smith (the first one in the list alphabetically)
      const deleteButtons = screen.getAllByTestId('delete-player')
      const aliceDeleteButton = deleteButtons[0] // Alice Smith is first in alphabetical order
      await act(async () => {
        fireEvent.click(aliceDeleteButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Confirm Deletion')).toBeInTheDocument()
      })

      // Click confirm delete button in the modal
      const modal = screen.getByText('Confirm Deletion').closest('div')
      const confirmButton = modal.querySelector('.bg-loonsRed')
      await act(async () => {
        fireEvent.click(confirmButton)
      })

      // Check that success message appears
      await waitFor(() => {
        expect(
          screen.getByText('Player deleted successfully!')
        ).toBeInTheDocument()
      })
    })

    it('success message disappears after timeout', async () => {
      jest.useFakeTimers()

      const newPlayer = {
        _id: '3',
        name: 'New Player',
        gameKnowledgeScore: 5,
        goalScoringScore: 6,
        attackScore: 7,
        midfieldScore: 8,
        defenseScore: 9,
        fitnessScore: 10,
        isPlayingThisWeek: true,
      }

      api.post.mockResolvedValueOnce({ data: newPlayer })

      await act(async () => {
        renderWithQuery(<Players />)
      })

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Open add player modal and add player
      const addButton = screen.getByText('Add A New Player')
      await act(async () => {
        userEvent.click(addButton)
      })

      await waitFor(() => {
        expect(screen.getByTestId('add-player-form')).toBeInTheDocument()
      })

      // Fill out form quickly
      const nameInput = screen.getByLabelText(/name/i)
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: newPlayer.name } })
        fireEvent.change(screen.getByLabelText(/game knowledge score/i), {
          target: { value: newPlayer.gameKnowledgeScore.toString() },
        })
        fireEvent.change(screen.getByLabelText(/goal scoring score/i), {
          target: { value: newPlayer.goalScoringScore.toString() },
        })
        fireEvent.change(screen.getByLabelText(/attack score/i), {
          target: { value: newPlayer.attackScore.toString() },
        })
        fireEvent.change(screen.getByLabelText(/midfield score/i), {
          target: { value: newPlayer.midfieldScore.toString() },
        })
        fireEvent.change(screen.getByLabelText(/defense score/i), {
          target: { value: newPlayer.defenseScore.toString() },
        })
        fireEvent.change(screen.getByLabelText(/mobility\/stamina/i), {
          target: { value: newPlayer.fitnessScore.toString() },
        })
      })

      const form = screen.getByTestId('add-player-form')
      await act(async () => {
        fireEvent.submit(form)
      })

      // Check that success message appears
      await waitFor(() => {
        expect(
          screen.getByText('Player added successfully!')
        ).toBeInTheDocument()
      })

      // Fast forward time to trigger timeout
      act(() => {
        jest.advanceTimersByTime(2500)
      })

      // Check that success message disappears
      await waitFor(() => {
        expect(
          screen.queryByText('Player added successfully!')
        ).not.toBeInTheDocument()
      })

      jest.useRealTimers()
    })
  })

  describe('Error Handling', () => {
    it('handles fetch error gracefully', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      api.get.mockRejectedValue(new Error('Failed to fetch'))

      await act(async () => {
        renderWithQuery(<Players />)
      })

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/players')
      })

      consoleSpy.mockRestore()
    })

    it('handles update error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const mockPlayers = [
        {
          _id: '1',
          name: 'John Doe',
          attackScore: 2,
          defenseScore: 2,
          fitnessScore: 2,
          isPlayingThisWeek: true,
        },
      ]

      api.get.mockResolvedValue({ data: mockPlayers })
      const mockError = new Error('Update failed')
      api.put.mockRejectedValue(mockError)

      await act(async () => {
        renderWithQuery(<Players />)
      })

      await screen.findByText('John Doe')
      const editButton = screen.getByTestId('edit-player')

      await act(async () => {
        fireEvent.click(editButton)
      })

      const modal = await screen.findByTestId('edit-player-modal')
      expect(modal).toBeInTheDocument()

      const nameInput = screen.getByLabelText('Name')
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'John Doe Updated' } })
      })

      const saveChangesButton = screen.getByText(/Save Changes/i)
      await act(async () => {
        fireEvent.submit(saveChangesButton)
      })

      await waitFor(() => {
        expect(api.put).toHaveBeenCalled()
      })

      consoleSpy.mockRestore()
    })
  })

  it('matches snapshot', async () => {
    await act(async () => {
      const { container } = renderWithQuery(<Players />)
      expect(container).toMatchSnapshot()
    })
  })
})
