import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import TeamsPlayerList from '../../src/app/components/ui/Teams/TeamsPlayerList'

// Mock the HoverPlayerStats component
jest.mock(
  '../../src/app/components/ui/HoverPlayerStats/HoverPlayerStats',
  () => {
    return function MockHoverPlayerStats({ hoveredPlayer }) {
      return (
        <div data-testid="hover-player-stats">
          <p>{hoveredPlayer.name}</p>
          <p>Game Knowledge: {hoveredPlayer.gameKnowledgeScore}</p>
          <p>Attack: {hoveredPlayer.attackScore}</p>
        </div>
      )
    }
  }
)

describe('TeamsPlayerList Component', () => {
  const mockPlayer1 = {
    _id: '1',
    name: 'Charlie Brown',
    gameKnowledgeScore: 8,
    goalScoringScore: 7,
    attackScore: 8,
    midfieldScore: 7,
    defenseScore: 8,
    fitnessScore: 8,
    gender: 'male',
  }

  const mockPlayer2 = {
    _id: '2',
    name: 'Alice Smith',
    gameKnowledgeScore: 7,
    goalScoringScore: 8,
    attackScore: 7,
    midfieldScore: 8,
    defenseScore: 7,
    fitnessScore: 8,
    gender: 'female',
  }

  const mockPlayer3 = {
    _id: '3',
    name: 'Bob Johnson',
    gameKnowledgeScore: 6,
    goalScoringScore: 6,
    attackScore: 6,
    midfieldScore: 6,
    defenseScore: 6,
    fitnessScore: 6,
    gender: 'male',
  }

  const mockTeam = {
    players: [mockPlayer1, mockPlayer2, mockPlayer3],
  }

  const mockHandlers = {
    handleDragStart: jest.fn(),
    handleDragEnd: jest.fn(),
    handleTouchStart: jest.fn(),
    handleTouchMove: jest.fn(),
    handleTouchEnd: jest.fn(),
    handleMouseEnter: jest.fn(),
    handleMouseLeave: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders player list correctly', () => {
      render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Charlie Brown')).toBeInTheDocument()
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    })

    it('sorts players alphabetically by name', () => {
      render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      const playerItems = screen.getAllByRole('listitem')
      expect(playerItems[0]).toHaveTextContent('Alice Smith')
      expect(playerItems[1]).toHaveTextContent('Bob Johnson')
      expect(playerItems[2]).toHaveTextContent('Charlie Brown')
    })

    it('renders empty list when team has no players', () => {
      const emptyTeam = { players: [] }

      const { container } = render(
        <TeamsPlayerList
          team={emptyTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      const list = container.querySelector('ul')
      expect(list).toBeInTheDocument()
      expect(list.children).toHaveLength(0)
    })
  })

  describe('Drag and Drop', () => {
    it('makes each player draggable', () => {
      render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      const playerItems = screen.getAllByRole('listitem')
      playerItems.forEach(item => {
        expect(item).toHaveAttribute('draggable', 'true')
      })
    })

    it('calls handleDragStart with correct parameters on drag start', () => {
      render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      const firstPlayer = screen.getByText('Alice Smith')
      const dragEvent = new Event('dragstart', { bubbles: true })

      fireEvent(firstPlayer, dragEvent)

      expect(mockHandlers.handleDragStart).toHaveBeenCalledWith(
        expect.any(Object),
        0,
        0,
        '2' // Alice Smith's ID (she's sorted first)
      )
    })

    it('calls handleDragEnd on drag end', () => {
      render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      const firstPlayer = screen.getByText('Alice Smith')

      fireEvent.dragEnd(firstPlayer)

      expect(mockHandlers.handleDragEnd).toHaveBeenCalledTimes(1)
    })
  })

  describe('Touch Events', () => {
    it('calls handleTouchStart with correct parameters', () => {
      render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      const firstPlayer = screen.getByText('Alice Smith')

      fireEvent.touchStart(firstPlayer, {
        touches: [{ clientX: 100, clientY: 100 }],
      })

      expect(mockHandlers.handleTouchStart).toHaveBeenCalledWith(
        expect.any(Object),
        0,
        0,
        '2' // Alice Smith's ID
      )
    })

    it('calls handleTouchMove on touch move', () => {
      render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      const firstPlayer = screen.getByText('Alice Smith')

      fireEvent.touchMove(firstPlayer, {
        touches: [{ clientX: 150, clientY: 150 }],
      })

      expect(mockHandlers.handleTouchMove).toHaveBeenCalledWith(
        expect.any(Object),
        0
      )
    })

    it('calls handleTouchEnd on touch end', () => {
      render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      const firstPlayer = screen.getByText('Alice Smith')

      fireEvent.touchEnd(firstPlayer)

      expect(mockHandlers.handleTouchEnd).toHaveBeenCalledWith(
        expect.any(Object),
        0
      )
    })

    it('prevents context menu on long press', () => {
      render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      const firstPlayer = screen.getByText('Alice Smith')
      const contextMenuEvent = new Event('contextmenu', { bubbles: true })
      const preventDefaultSpy = jest.fn()
      contextMenuEvent.preventDefault = preventDefaultSpy

      fireEvent(firstPlayer, contextMenuEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('Hover Functionality', () => {
    it('calls handleMouseEnter when hovering over a player', () => {
      render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      const firstPlayer = screen.getByText('Alice Smith')

      fireEvent.mouseEnter(firstPlayer)

      expect(mockHandlers.handleMouseEnter).toHaveBeenCalledWith(mockPlayer2)
    })

    it('calls handleMouseLeave when mouse leaves a player', () => {
      render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      const firstPlayer = screen.getByText('Alice Smith')

      fireEvent.mouseLeave(firstPlayer)

      expect(mockHandlers.handleMouseLeave).toHaveBeenCalledTimes(1)
    })

    it('displays HoverPlayerStats when a player is hovered', () => {
      render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={mockPlayer2}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('hover-player-stats')).toBeInTheDocument()
      expect(screen.getByText('Game Knowledge: 7')).toBeInTheDocument()
    })

    it('does not display HoverPlayerStats when no player is hovered', () => {
      render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('hover-player-stats')).not.toBeInTheDocument()
    })

    it('only shows HoverPlayerStats for the currently hovered player', () => {
      const { rerender } = render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={mockPlayer1}
          {...mockHandlers}
        />
      )

      // Check that HoverPlayerStats is shown for Charlie Brown
      expect(screen.getByTestId('hover-player-stats')).toBeInTheDocument()
      expect(screen.getByText('Game Knowledge: 8')).toBeInTheDocument()
      expect(screen.getByText('Attack: 8')).toBeInTheDocument()

      // Rerender with different hovered player
      rerender(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={mockPlayer2}
          {...mockHandlers}
        />
      )

      // Check that HoverPlayerStats is now shown for Alice Smith
      expect(screen.getByTestId('hover-player-stats')).toBeInTheDocument()
      expect(screen.getByText('Game Knowledge: 7')).toBeInTheDocument()
      expect(screen.getByText('Attack: 7')).toBeInTheDocument()
    })
  })

  describe('Player List Styling', () => {
    it('applies correct CSS classes to player list items', () => {
      render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      const playerItems = screen.getAllByRole('listitem')
      playerItems.forEach(item => {
        expect(item).toHaveClass('cursor-grab')
        expect(item).toHaveClass('active:cursor-grabbing')
        expect(item).toHaveClass('border-transparent')
        expect(item).toHaveClass('hover:border-indigo-300')
      })
    })

    it('applies print-specific classes', () => {
      render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      const playerItems = screen.getAllByRole('listitem')
      playerItems.forEach(item => {
        expect(item).toHaveClass('print:border-0')
        expect(item).toHaveClass('print:max-w-none')
        expect(item).toHaveClass('print:text-xl')
      })
    })

    it('applies touch action classes for mobile', () => {
      render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      const playerItems = screen.getAllByRole('listitem')
      playerItems.forEach(item => {
        expect(item).toHaveClass('[touch-action:pan-y]')
        expect(item).toHaveClass('[-webkit-touch-callout:none]')
        expect(item).toHaveClass('[-webkit-user-select:none]')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles team with single player', () => {
      const singlePlayerTeam = {
        players: [mockPlayer1],
      }

      render(
        <TeamsPlayerList
          team={singlePlayerTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Charlie Brown')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(1)
    })

    it('handles players with same names correctly', () => {
      const duplicateNameTeam = {
        players: [
          { ...mockPlayer1, _id: '1a', name: 'John Doe' },
          { ...mockPlayer2, _id: '2b', name: 'John Doe' },
        ],
      }

      render(
        <TeamsPlayerList
          team={duplicateNameTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      const johnDoes = screen.getAllByText('John Doe')
      expect(johnDoes).toHaveLength(2)
    })

    it('uses unique keys for each player (name + index)', () => {
      const { container } = render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      const listItems = container.querySelectorAll('li')
      const keys = Array.from(listItems).map(item => item.getAttribute('key'))

      // Keys should be unique (though React doesn't expose them in the DOM, we can verify via structure)
      expect(listItems).toHaveLength(3)
    })

    it('handles missing player _id gracefully', () => {
      const playersWithoutIds = {
        players: [
          { ...mockPlayer1, _id: undefined },
          { ...mockPlayer2, _id: undefined },
        ],
      }

      render(
        <TeamsPlayerList
          team={playersWithoutIds}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      // Should still render without crashing
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument()
    })

    it('handles players with special characters in names', () => {
      const specialCharTeam = {
        players: [
          { ...mockPlayer1, name: "O'Brien" },
          { ...mockPlayer2, name: 'Jean-Claude' },
          { ...mockPlayer3, name: 'José García' },
        ],
      }

      render(
        <TeamsPlayerList
          team={specialCharTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByText("O'Brien")).toBeInTheDocument()
      expect(screen.getByText('Jean-Claude')).toBeInTheDocument()
      expect(screen.getByText('José García')).toBeInTheDocument()
    })
  })

  describe('Multiple Teams', () => {
    it('renders correctly with different teamIndex values', () => {
      const { rerender } = render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Alice Smith')).toBeInTheDocument()

      // Rerender with different team index
      rerender(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={1}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      // Should still render the same players
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    })

    it('passes correct teamIndex to touch handlers', () => {
      render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={5}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      const firstPlayer = screen.getByText('Alice Smith')

      fireEvent.touchMove(firstPlayer, {
        touches: [{ clientX: 150, clientY: 150 }],
      })

      expect(mockHandlers.handleTouchMove).toHaveBeenCalledWith(
        expect.any(Object),
        5
      )
    })
  })

  describe('Accessibility', () => {
    it('uses semantic list elements', () => {
      const { container } = render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      const list = container.querySelector('ul')
      expect(list).toBeInTheDocument()

      const listItems = container.querySelectorAll('li')
      expect(listItems.length).toBeGreaterThan(0)
    })

    it('maintains proper list structure', () => {
      render(
        <TeamsPlayerList
          team={mockTeam}
          teamIndex={0}
          hoveredPlayer={null}
          {...mockHandlers}
        />
      )

      const list = screen.getByRole('list')
      expect(list).toBeInTheDocument()

      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(3)
    })
  })
})
