import {
  calculatePlayerScore,
  calculateTeamStats,
} from '../../src/app/utils/teamStats'

const WEIGHTS = {
  gameKnowledge: 0.2,
  goalScoring: 0.2,
  attack: 0.135,
  midfield: 0.133,
  defense: 0.133,
  fitness: 0.1,
}

describe('calculatePlayerScore', () => {
  const mockPlayer = {
    gameKnowledgeScore: 80,
    goalScoringScore: 75,
    attackScore: 70,
    midfieldScore: 85,
    defenseScore: 65,
    fitnessScore: 90,
  }

  it('should calculate player score correctly using weights', () => {
    const expectedScore =
      mockPlayer.gameKnowledgeScore * WEIGHTS.gameKnowledge +
      mockPlayer.goalScoringScore * WEIGHTS.goalScoring +
      mockPlayer.attackScore * WEIGHTS.attack +
      mockPlayer.midfieldScore * WEIGHTS.midfield +
      mockPlayer.defenseScore * WEIGHTS.defense +
      mockPlayer.fitnessScore * WEIGHTS.fitness

    const result = calculatePlayerScore(mockPlayer)
    expect(result).toBeCloseTo(69.4, 3)
    expect(mockPlayer.totalScore).toBeCloseTo(69.4, 3)
  })

  it('should handle zero scores', () => {
    const zeroPlayer = {
      gameKnowledgeScore: 0,
      goalScoringScore: 0,
      attackScore: 0,
      midfieldScore: 0,
      defenseScore: 0,
      fitnessScore: 0,
    }

    const result = calculatePlayerScore(zeroPlayer)
    expect(result).toBe(0)
  })

  it('should handle perfect scores', () => {
    const perfectPlayer = {
      gameKnowledgeScore: 100,
      goalScoringScore: 100,
      attackScore: 100,
      midfieldScore: 100,
      defenseScore: 100,
      fitnessScore: 100,
    }

    const result = calculatePlayerScore(perfectPlayer)
    expect(result).toBe(90.1)
  })
})

describe('calculateTeamStats', () => {
  const mockTeam = {
    name: 'Test Team',
    players: [
      {
        name: 'Player 1',
        gender: 'male',
        gameKnowledgeScore: 80,
        goalScoringScore: 75,
        attackScore: 70,
        midfieldScore: 85,
        defenseScore: 65,
        fitnessScore: 90,
      },
      {
        name: 'Player 2',
        gender: 'female',
        gameKnowledgeScore: 90,
        goalScoringScore: 85,
        attackScore: 80,
        midfieldScore: 75,
        defenseScore: 70,
        fitnessScore: 95,
      },
      {
        name: 'Player 3',
        gender: 'nonBinary',
        gameKnowledgeScore: 85,
        goalScoringScore: 80,
        attackScore: 75,
        midfieldScore: 70,
        defenseScore: 85,
        fitnessScore: 80,
      },
    ],
  }

  it('should calculate team total scores correctly', () => {
    const result = calculateTeamStats(mockTeam)

    expect(
      result.players.every((player) => typeof player.totalScore === 'number')
    ).toBe(true)

    expect(result.totalGameKnowledgeScore).toBe(255)
    expect(result.totalGoalScoringScore).toBe(240)
    expect(result.totalAttackScore).toBe(225)
    expect(result.totalMidfieldScore).toBe(230)
    expect(result.totalDefenseScore).toBe(220)
    expect(result.totalFitnessScore).toBe(265)
  })

  it('should calculate gender counts correctly', () => {
    const result = calculateTeamStats(mockTeam)

    expect(result.genderCount).toEqual({
      male: 1,
      female: 1,
      nonBinary: 1,
    })
  })

  it('should handle empty team', () => {
    const emptyTeam = {
      name: 'Empty Team',
      players: [],
    }

    const result = calculateTeamStats(emptyTeam)

    expect(result.totalScore).toBe(0)
    expect(result.genderCount).toEqual({
      male: 0,
      female: 0,
      nonBinary: 0,
    })
  })

  it('should preserve original team properties', () => {
    const result = calculateTeamStats(mockTeam)

    expect(result.name).toBe(mockTeam.name)
    expect(result.players).toBe(mockTeam.players)
  })

  it('should handle team with single player', () => {
    const singlePlayerTeam = {
      name: 'Single Player Team',
      players: [mockTeam.players[0]],
    }

    const result = calculateTeamStats(singlePlayerTeam)

    expect(result.genderCount).toEqual({
      male: 1,
      female: 0,
      nonBinary: 0,
    })
    expect(result.totalGameKnowledgeScore).toBe(80)
  })
})
