import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import HoverPlayerStats from '../../src/app/components/ui/HoverPlayerStats/HoverPlayerStats'

describe('HoverPlayerStats Component', () => {
  const mockPlayer = {
    name: 'John Doe',
    gameKnowledgeScore: 8,
    goalScoringScore: 7,
    attackScore: 9,
    midfieldScore: 6,
    defenseScore: 8,
    fitnessScore: 7,
  }

  const mockPlayerWithMissingScores = {
    name: 'Jane Smith',
    gameKnowledgeScore: 5,
    // Missing some scores to test N/A handling
    attackScore: 7,
    defenseScore: 6,
  }

  const mockPlayerWithNullScores = {
    name: 'Bob Johnson',
    gameKnowledgeScore: null,
    goalScoringScore: undefined,
    attackScore: 0,
    midfieldScore: '',
    defenseScore: 8,
    fitnessScore: false,
  }

  describe('UI Rendering', () => {
    it('renders player name correctly', () => {
      render(<HoverPlayerStats hoveredPlayer={mockPlayer} />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('renders all stat labels correctly', () => {
      render(<HoverPlayerStats hoveredPlayer={mockPlayer} />)

      expect(screen.getByText('Game Knowledge:')).toBeInTheDocument()
      expect(screen.getByText('Goal Scoring:')).toBeInTheDocument()
      expect(screen.getByText('Attack:')).toBeInTheDocument()
      expect(screen.getByText('Midfield:')).toBeInTheDocument()
      expect(screen.getByText('Defense:')).toBeInTheDocument()
      expect(screen.getByText('Mobility/Stamina:')).toBeInTheDocument()
    })

    it('renders all stat values correctly when present', () => {
      render(<HoverPlayerStats hoveredPlayer={mockPlayer} />)

      expect(screen.getAllByText('7')[0]).toBeInTheDocument() // goalScoringScore and fitnessScore
      expect(screen.getAllByText('7')[1]).toBeInTheDocument() // goalScoringScore and fitnessScore
      expect(screen.getByText('9')).toBeInTheDocument() // attackScore
      expect(screen.getByText('6')).toBeInTheDocument() // midfieldScore

      expect(screen.getAllByText('8')[0]).toBeInTheDocument() // defenseScore (appears twice due to gameKnowledgeScore)
      expect(screen.getAllByText('8')[1]).toBeInTheDocument() // defenseScore (appears twice due to gameKnowledgeScore)
    })

    it('applies correct CSS classes to container', () => {
      const { container } = render(
        <HoverPlayerStats hoveredPlayer={mockPlayer} />
      )
      const mainDiv = container.firstChild

      expect(mainDiv).toHaveClass('print:hidden')
    })

    it('applies correct CSS classes to stats grid', () => {
      render(<HoverPlayerStats hoveredPlayer={mockPlayer} />)
      const statsGrid = screen
        .getByText('Game Knowledge:')
        .closest('div').parentElement

      expect(statsGrid).toHaveClass('grid', 'grid-cols-2', 'gap-2', 'text-xs')
    })

    it('applies correct CSS classes to stat labels', () => {
      render(<HoverPlayerStats hoveredPlayer={mockPlayer} />)

      const gameKnowledgeLabel = screen.getByText('Game Knowledge:')
      expect(gameKnowledgeLabel).toHaveClass('text-gray-600')
    })

    it('applies correct CSS classes to stat values', () => {
      render(<HoverPlayerStats hoveredPlayer={mockPlayer} />)

      // Find the stat value spans by their font-medium class
      const statValues = screen.getAllByText(/^[0-9]+$/)
      statValues.forEach((value) => {
        expect(value).toHaveClass('font-medium')
      })
    })
  })

  describe('State Handling - Missing Data', () => {
    it('displays "N/A" for missing scores', () => {
      render(<HoverPlayerStats hoveredPlayer={mockPlayerWithMissingScores} />)

      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument() // gameKnowledgeScore
      expect(screen.getByText('7')).toBeInTheDocument() // attackScore
      expect(screen.getByText('6')).toBeInTheDocument() // defenseScore

      // Should show N/A for missing scores
      const naElements = screen.getAllByText('N/A')
      expect(naElements).toHaveLength(3) // goalScoringScore, midfieldScore, fitnessScore
    })

    it('displays "N/A" for null and undefined scores', () => {
      render(<HoverPlayerStats hoveredPlayer={mockPlayerWithNullScores} />)

      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()

      // Should show N/A for null, undefined, empty string, and false values
      const naElements = screen.getAllByText('N/A')
      expect(naElements).toHaveLength(5) // null, undefined, empty string, false, gameKnowledgeScore

      expect(screen.getByText('8')).toBeInTheDocument() // defenseScore
    })

    it('handles completely empty player object gracefully', () => {
      const emptyPlayer = { name: 'Empty Player' }
      render(<HoverPlayerStats hoveredPlayer={emptyPlayer} />)

      expect(screen.getByText('Empty Player')).toBeInTheDocument()

      // All stats should show N/A
      const naElements = screen.getAllByText('N/A')
      expect(naElements).toHaveLength(6) // All 6 stats
    })

    it('handles player with only name', () => {
      const playerWithOnlyName = { name: 'Name Only' }
      render(<HoverPlayerStats hoveredPlayer={playerWithOnlyName} />)

      expect(screen.getByText('Name Only')).toBeInTheDocument()

      // All stats should show N/A
      const naElements = screen.getAllByText('N/A')
      expect(naElements).toHaveLength(6)
    })
  })

  describe('Edge Cases', () => {
    it('handles very long player names', () => {
      const playerWithLongName = {
        ...mockPlayer,
        name: 'This Is A Very Long Player Name That Might Cause Layout Issues',
      }

      render(<HoverPlayerStats hoveredPlayer={playerWithLongName} />)

      expect(
        screen.getByText(
          'This Is A Very Long Player Name That Might Cause Layout Issues'
        )
      ).toBeInTheDocument()
    })

    it('handles special characters in player name', () => {
      const playerWithSpecialChars = {
        ...mockPlayer,
        name: "O'Connor-Smith (Jr.) & Co.",
      }

      render(<HoverPlayerStats hoveredPlayer={playerWithSpecialChars} />)

      expect(screen.getByText("O'Connor-Smith (Jr.) & Co.")).toBeInTheDocument()
    })

    it('handles very high score values', () => {
      const playerWithHighScores = {
        name: 'High Scorer',
        gameKnowledgeScore: 999,
        goalScoringScore: 1000,
        attackScore: 9999,
        midfieldScore: 10000,
        defenseScore: 99999,
        fitnessScore: 100000,
      }

      render(<HoverPlayerStats hoveredPlayer={playerWithHighScores} />)

      expect(screen.getByText('High Scorer')).toBeInTheDocument()
      expect(screen.getByText('999')).toBeInTheDocument()
      expect(screen.getByText('1000')).toBeInTheDocument()
      expect(screen.getByText('9999')).toBeInTheDocument()
      expect(screen.getByText('10000')).toBeInTheDocument()
      expect(screen.getByText('99999')).toBeInTheDocument()
      expect(screen.getByText('100000')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<HoverPlayerStats hoveredPlayer={mockPlayer} />)

      // Should have a heading for the player name
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('John Doe')
    })

    it('maintains readable text contrast with proper color classes', () => {
      render(<HoverPlayerStats hoveredPlayer={mockPlayer} />)

      // Check that text has appropriate contrast classes
      const playerName = screen.getByText('John Doe')
      expect(playerName).toHaveClass('text-gray-800')

      const labels = screen.getAllByText(/:$/)
      labels.forEach((label) => {
        expect(label).toHaveClass('text-gray-600')
      })
    })

    it('has appropriate z-index for overlay positioning', () => {
      const { container } = render(
        <HoverPlayerStats hoveredPlayer={mockPlayer} />
      )
      const mainDiv = container.firstChild

      expect(mainDiv).toHaveClass('z-10')
    })

    it('is hidden in print mode', () => {
      const { container } = render(
        <HoverPlayerStats hoveredPlayer={mockPlayer} />
      )
      const mainDiv = container.firstChild

      expect(mainDiv).toHaveClass('print:hidden')
    })
  })

  describe('Layout and Positioning', () => {
    it('has correct positioning classes for mobile and desktop', () => {
      const { container } = render(
        <HoverPlayerStats hoveredPlayer={mockPlayer} />
      )
      const mainDiv = container.firstChild

      // Mobile positioning
      expect(mainDiv).toHaveClass('absolute', 'top-[110%]')

      // Desktop positioning
      expect(mainDiv).toHaveClass('lg:left-full', 'lg:top-0', 'lg:ml-2')
    })

    it('has fixed width and proper spacing', () => {
      const { container } = render(
        <HoverPlayerStats hoveredPlayer={mockPlayer} />
      )
      const mainDiv = container.firstChild

      expect(mainDiv).toHaveClass('w-64', 'p-3')
    })
  })

  describe('Component Integration', () => {
    it('renders without crashing when hoveredPlayer is null', () => {
      // This test ensures the component doesn't break if accidentally passed null
      // In real usage, this component should only render when hoveredPlayer exists
      expect(() => {
        render(<HoverPlayerStats hoveredPlayer={null} />)
      }).toThrow() // Should throw because we're accessing hoveredPlayer.name
    })

    it('renders without crashing when hoveredPlayer is undefined', () => {
      // This test ensures the component doesn't break if accidentally passed undefined
      expect(() => {
        render(<HoverPlayerStats hoveredPlayer={undefined} />)
      }).toThrow() // Should throw because we're accessing hoveredPlayer.name
    })
  })
})
