import balanceTeams from '../../src/lib/utils/balanceTeams'

const makePlayer = (name, gender, scores = {}, playing = true) => ({
  name,
  gender,
  gameKnowledgeScore: scores.gameKnowledge ?? 7,
  goalScoringScore: scores.goalScoring ?? 7,
  attackScore: scores.attack ?? 7,
  midfieldScore: scores.midfield ?? 7,
  defenseScore: scores.defense ?? 7,
  fitnessScore: scores.fitness ?? 7,
  isPlayingThisWeek: playing,
})

const makeMale = (name, scores) => makePlayer(name, 'male', scores)
const makeFemale = (name, scores) => makePlayer(name, 'female', scores)

const allPlayerNames = (result) =>
  result.teams.flatMap((t) => t.players.map((p) => p.name))

describe('balanceTeams', () => {
  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5)
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('input validation', () => {
    it('throws when players is null', () => {
      expect(() => balanceTeams(null, 2)).toThrow('Invalid players data')
    })

    it('throws when players is undefined', () => {
      expect(() => balanceTeams(undefined, 2)).toThrow('Invalid players data')
    })

    it('throws when players is not an array', () => {
      expect(() => balanceTeams('not-array', 2)).toThrow('Invalid players data')
    })

    it('throws when numTeams is 0', () => {
      expect(() => balanceTeams([], 0)).toThrow('Invalid number of teams')
    })

    it('throws when numTeams is 1', () => {
      expect(() => balanceTeams([], 1)).toThrow('Invalid number of teams')
    })

    it('throws when numTeams exceeds 20', () => {
      expect(() => balanceTeams([], 21)).toThrow('Invalid number of teams')
    })

    it('throws when numTeams is negative', () => {
      expect(() => balanceTeams([], -1)).toThrow('Invalid number of teams')
    })

    it('throws when all players are invalid', () => {
      const players = [
        makePlayer('Bad1', 'male', { gameKnowledge: 'abc' }),
        makePlayer('Bad2', 'invalidGender', {}),
      ]
      // First player has valid scores but second has invalid gender;
      // first will pass but second won't — unless the score conversion catches it.
      // Let's use truly invalid data:
      const badPlayers = [
        { name: 'P1', gender: 'male', isPlayingThisWeek: true },
      ]
      expect(() => balanceTeams(badPlayers, 2)).toThrow(
        'No valid players provided'
      )
    })
  })

  describe('player filtering', () => {
    it('excludes players with NaN scores', () => {
      const players = [
        makeMale('Valid1'),
        makeMale('Valid2'),
        {
          name: 'Invalid',
          gender: 'male',
          gameKnowledgeScore: 'not-a-number',
          goalScoringScore: 7,
          attackScore: 7,
          midfieldScore: 7,
          defenseScore: 7,
          fitnessScore: 7,
          isPlayingThisWeek: true,
        },
        makeMale('Valid3'),
        makeMale('Valid4'),
      ]

      const result = balanceTeams(players, 2)
      const names = allPlayerNames(result)

      expect(names).not.toContain('Invalid')
      expect(result.totalPlayersPlaying).toBe(4)
    })

    it('excludes players with invalid gender', () => {
      const players = [
        makeMale('Valid1'),
        makeMale('Valid2'),
        makePlayer('BadGender', 'other'),
        makeMale('Valid3'),
        makeMale('Valid4'),
      ]

      const result = balanceTeams(players, 2)
      expect(allPlayerNames(result)).not.toContain('BadGender')
      expect(result.totalPlayersPlaying).toBe(4)
    })

    it('excludes players not playing this week', () => {
      const players = [
        makeMale('Playing1'),
        makeMale('Playing2'),
        makePlayer('Benched', 'male', {}, false),
        makeMale('Playing3'),
        makeMale('Playing4'),
      ]

      const result = balanceTeams(players, 2)
      expect(allPlayerNames(result)).not.toContain('Benched')
      expect(result.totalPlayersPlaying).toBe(4)
    })

    it('accepts isPlayingThisWeek as string "true"', () => {
      const player = {
        ...makeMale('StringTrue'),
        isPlayingThisWeek: 'true',
      }
      const players = [player, makeMale('Other1'), makeMale('Other2')]
      const result = balanceTeams(players, 2)
      expect(allPlayerNames(result)).toContain('StringTrue')
    })

    it('accepts isPlayingThisWeek as numeric 1', () => {
      const player = {
        ...makeMale('NumericOne'),
        isPlayingThisWeek: 1,
      }
      const players = [player, makeMale('Other1'), makeMale('Other2')]
      const result = balanceTeams(players, 2)
      expect(allPlayerNames(result)).toContain('NumericOne')
    })

    it('accepts isPlayingThisWeek as string "1"', () => {
      const player = {
        ...makeMale('StringOne'),
        isPlayingThisWeek: '1',
      }
      const players = [player, makeMale('Other1'), makeMale('Other2')]
      const result = balanceTeams(players, 2)
      expect(allPlayerNames(result)).toContain('StringOne')
    })

    it('converts string scores to numbers', () => {
      const players = [
        {
          name: 'StringScores',
          gender: 'male',
          gameKnowledgeScore: '8',
          goalScoringScore: '7',
          attackScore: '6',
          midfieldScore: '5',
          defenseScore: '4',
          fitnessScore: '3',
          isPlayingThisWeek: true,
        },
        makeMale('Other1'),
        makeMale('Other2'),
      ]

      const result = balanceTeams(players, 2)
      expect(allPlayerNames(result)).toContain('StringScores')
    })
  })

  describe('team sizes', () => {
    it('distributes players evenly across teams', () => {
      const players = Array.from({ length: 12 }, (_, i) =>
        makeMale(`Player${i}`)
      )

      const result = balanceTeams(players, 3)
      const sizes = result.teams.map((t) => t.players.length)

      expect(sizes).toEqual([4, 4, 4])
    })

    it('differs by at most 1 player when not evenly divisible', () => {
      const players = Array.from({ length: 11 }, (_, i) =>
        makeMale(`Player${i}`)
      )

      const result = balanceTeams(players, 3)
      const sizes = result.teams.map((t) => t.players.length)

      expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1)
      expect(sizes.reduce((a, b) => a + b, 0)).toBe(11)
    })

    it('handles 2 players into 2 teams', () => {
      const players = [makeMale('P1'), makeMale('P2')]
      const result = balanceTeams(players, 2)

      expect(result.teams[0].players).toHaveLength(1)
      expect(result.teams[1].players).toHaveLength(1)
    })

    it('handles many teams with few players per team', () => {
      const players = Array.from({ length: 10 }, (_, i) =>
        makeMale(`Player${i}`)
      )
      const result = balanceTeams(players, 5)
      const sizes = result.teams.map((t) => t.players.length)

      expect(sizes.every((s) => s === 2)).toBe(true)
    })
  })

  describe('all players accounted for', () => {
    it('no players lost or duplicated with even split', () => {
      const players = Array.from({ length: 20 }, (_, i) =>
        makeMale(`Player${i}`)
      )

      const result = balanceTeams(players, 4)
      const names = allPlayerNames(result)

      expect(names).toHaveLength(20)
      expect(new Set(names).size).toBe(20)
    })

    it('no players lost or duplicated with uneven split', () => {
      const players = Array.from({ length: 13 }, (_, i) =>
        makeMale(`Player${i}`)
      )

      const result = balanceTeams(players, 3)
      const names = allPlayerNames(result)

      expect(names).toHaveLength(13)
      expect(new Set(names).size).toBe(13)
    })

    it('reports correct totalPlayersPlaying', () => {
      const players = [
        ...Array.from({ length: 8 }, (_, i) => makeMale(`Active${i}`)),
        makePlayer('Inactive', 'male', {}, false),
      ]

      const result = balanceTeams(players, 2)
      expect(result.totalPlayersPlaying).toBe(8)
    })
  })

  describe('score balance', () => {
    it('produces teams with similar average scores for uniform players', () => {
      const players = Array.from({ length: 10 }, (_, i) =>
        makeMale(`Player${i}`)
      )

      const result = balanceTeams(players, 2)
      const avgs = result.teams.map(
        (t) => t.totalScore / t.players.length
      )

      expect(Math.abs(avgs[0] - avgs[1])).toBeLessThan(1)
    })

    it('balances teams with varied skill levels', () => {
      const players = [
        makeMale('Star1', { gameKnowledge: 10, goalScoring: 10, attack: 10, midfield: 10, defense: 10, fitness: 10 }),
        makeMale('Star2', { gameKnowledge: 9, goalScoring: 9, attack: 9, midfield: 9, defense: 9, fitness: 9 }),
        makeMale('Mid1', { gameKnowledge: 5, goalScoring: 5, attack: 5, midfield: 5, defense: 5, fitness: 5 }),
        makeMale('Mid2', { gameKnowledge: 5, goalScoring: 5, attack: 5, midfield: 5, defense: 5, fitness: 5 }),
        makeMale('Low1', { gameKnowledge: 2, goalScoring: 2, attack: 2, midfield: 2, defense: 2, fitness: 2 }),
        makeMale('Low2', { gameKnowledge: 1, goalScoring: 1, attack: 1, midfield: 1, defense: 1, fitness: 1 }),
      ]

      const result = balanceTeams(players, 2)
      const avgs = result.teams.map(
        (t) => t.totalScore / t.players.length
      )

      // With the swap-optimization phase, the difference should be small
      expect(Math.abs(avgs[0] - avgs[1])).toBeLessThan(2)
    })

    it('balances 3 teams reasonably', () => {
      const players = [
        makeMale('S1', { gameKnowledge: 10, goalScoring: 10, attack: 10, midfield: 10, defense: 10, fitness: 10 }),
        makeMale('S2', { gameKnowledge: 9, goalScoring: 9, attack: 9, midfield: 9, defense: 9, fitness: 9 }),
        makeMale('S3', { gameKnowledge: 8, goalScoring: 8, attack: 8, midfield: 8, defense: 8, fitness: 8 }),
        makeMale('M1', { gameKnowledge: 5, goalScoring: 5, attack: 5, midfield: 5, defense: 5, fitness: 5 }),
        makeMale('M2', { gameKnowledge: 5, goalScoring: 5, attack: 5, midfield: 5, defense: 5, fitness: 5 }),
        makeMale('M3', { gameKnowledge: 4, goalScoring: 4, attack: 4, midfield: 4, defense: 4, fitness: 4 }),
        makeMale('L1', { gameKnowledge: 2, goalScoring: 2, attack: 2, midfield: 2, defense: 2, fitness: 2 }),
        makeMale('L2', { gameKnowledge: 2, goalScoring: 2, attack: 2, midfield: 2, defense: 2, fitness: 2 }),
        makeMale('L3', { gameKnowledge: 1, goalScoring: 1, attack: 1, midfield: 1, defense: 1, fitness: 1 }),
      ]

      const result = balanceTeams(players, 3)
      const avgs = result.teams.map(
        (t) => t.totalScore / t.players.length
      )
      const maxDiff = Math.max(...avgs) - Math.min(...avgs)

      expect(maxDiff).toBeLessThan(3)
    })
  })

  describe('gender distribution', () => {
    it('distributes female players evenly across 2 teams', () => {
      const players = [
        makeFemale('F1', { gameKnowledge: 8 }),
        makeFemale('F2', { gameKnowledge: 6 }),
        makeMale('M1'),
        makeMale('M2'),
        makeMale('M3'),
        makeMale('M4'),
      ]

      const result = balanceTeams(players, 2)
      const femaleCounts = result.teams.map((t) => t.genderCount.female)

      expect(femaleCounts).toEqual([1, 1])
    })

    it('distributes female players evenly across 3 teams', () => {
      const players = [
        makeFemale('F1'),
        makeFemale('F2'),
        makeFemale('F3'),
        makeMale('M1'),
        makeMale('M2'),
        makeMale('M3'),
        makeMale('M4'),
        makeMale('M5'),
        makeMale('M6'),
      ]

      const result = balanceTeams(players, 3)
      const femaleCounts = result.teams.map((t) => t.genderCount.female)

      expect(femaleCounts).toEqual([1, 1, 1])
    })

    it('distributes females as evenly as possible when not perfectly divisible', () => {
      const players = [
        makeFemale('F1'),
        makeFemale('F2'),
        makeMale('M1'),
        makeMale('M2'),
        makeMale('M3'),
        makeMale('M4'),
        makeMale('M5'),
        makeMale('M6'),
        makeMale('M7'),
      ]

      const result = balanceTeams(players, 3)
      const femaleCounts = result.teams.map((t) => t.genderCount.female)

      // 2 females across 3 teams — at most 1 difference
      expect(Math.max(...femaleCounts) - Math.min(...femaleCounts)).toBeLessThanOrEqual(1)
      expect(femaleCounts.reduce((a, b) => a + b, 0)).toBe(2)
    })

    it('handles nonBinary players in the same distribution phase as female', () => {
      const players = [
        makeFemale('F1'),
        makePlayer('NB1', 'nonBinary'),
        makeMale('M1'),
        makeMale('M2'),
        makeMale('M3'),
        makeMale('M4'),
      ]

      const result = balanceTeams(players, 2)
      const fnbCounts = result.teams.map(
        (t) => t.genderCount.female + t.genderCount.nonBinary
      )

      expect(fnbCounts).toEqual([1, 1])
    })

    it('preserves gender balance during swap optimization', () => {
      const players = [
        makeFemale('F1', { gameKnowledge: 10, goalScoring: 10, attack: 10, midfield: 10, defense: 10, fitness: 10 }),
        makeFemale('F2', { gameKnowledge: 1, goalScoring: 1, attack: 1, midfield: 1, defense: 1, fitness: 1 }),
        makeMale('M1', { gameKnowledge: 10, goalScoring: 10, attack: 10, midfield: 10, defense: 10, fitness: 10 }),
        makeMale('M2', { gameKnowledge: 1, goalScoring: 1, attack: 1, midfield: 1, defense: 1, fitness: 1 }),
      ]

      const result = balanceTeams(players, 2)
      const femaleCounts = result.teams.map((t) => t.genderCount.female)

      // Swaps only happen within same gender, so each team keeps 1 female
      expect(femaleCounts).toEqual([1, 1])
    })

    it('works with all-male roster', () => {
      const players = Array.from({ length: 8 }, (_, i) =>
        makeMale(`M${i}`)
      )

      const result = balanceTeams(players, 2)

      result.teams.forEach((t) => {
        expect(t.genderCount.female).toBe(0)
        expect(t.genderCount.nonBinary).toBe(0)
      })
      expect(result.totalPlayersPlaying).toBe(8)
    })

    it('works with all-female roster', () => {
      const players = Array.from({ length: 6 }, (_, i) =>
        makeFemale(`F${i}`)
      )

      const result = balanceTeams(players, 3)
      const femaleCounts = result.teams.map((t) => t.genderCount.female)

      expect(femaleCounts).toEqual([2, 2, 2])
      result.teams.forEach((t) => {
        expect(t.genderCount.male).toBe(0)
      })
    })
  })

  describe('output structure', () => {
    const players = [
      makeFemale('F1'),
      makeMale('M1'),
      makeMale('M2'),
      makeMale('M3'),
    ]

    it('returns teams array and totalPlayersPlaying', () => {
      const result = balanceTeams(players, 2)

      expect(result).toHaveProperty('teams')
      expect(result).toHaveProperty('totalPlayersPlaying')
      expect(Array.isArray(result.teams)).toBe(true)
      expect(result.teams).toHaveLength(2)
    })

    it('each team has the expected stat fields', () => {
      const result = balanceTeams(players, 2)

      result.teams.forEach((team) => {
        expect(team).toHaveProperty('players')
        expect(team).toHaveProperty('totalScore')
        expect(team).toHaveProperty('totalGameKnowledgeScore')
        expect(team).toHaveProperty('totalGoalScoringScore')
        expect(team).toHaveProperty('totalAttackScore')
        expect(team).toHaveProperty('totalMidfieldScore')
        expect(team).toHaveProperty('totalDefenseScore')
        expect(team).toHaveProperty('totalFitnessScore')
        expect(team).toHaveProperty('genderCount')
        expect(team.genderCount).toHaveProperty('male')
        expect(team.genderCount).toHaveProperty('female')
        expect(team.genderCount).toHaveProperty('nonBinary')
      })
    })

    it('stat totals are rounded to 2 decimal places', () => {
      const result = balanceTeams(players, 2)

      result.teams.forEach((team) => {
        const decimalPlaces = (n) => {
          const str = String(n)
          return str.includes('.') ? str.split('.')[1].length : 0
        }
        expect(decimalPlaces(team.totalScore)).toBeLessThanOrEqual(2)
        expect(decimalPlaces(team.totalGameKnowledgeScore)).toBeLessThanOrEqual(2)
        expect(decimalPlaces(team.totalGoalScoringScore)).toBeLessThanOrEqual(2)
        expect(decimalPlaces(team.totalAttackScore)).toBeLessThanOrEqual(2)
        expect(decimalPlaces(team.totalMidfieldScore)).toBeLessThanOrEqual(2)
        expect(decimalPlaces(team.totalDefenseScore)).toBeLessThanOrEqual(2)
        expect(decimalPlaces(team.totalFitnessScore)).toBeLessThanOrEqual(2)
      })
    })

    it('stat totals match the sum of player attributes', () => {
      const result = balanceTeams(players, 2)

      result.teams.forEach((team) => {
        const expectedGK = team.players.reduce(
          (sum, p) => sum + p.gameKnowledgeScore,
          0
        )
        const expectedGS = team.players.reduce(
          (sum, p) => sum + p.goalScoringScore,
          0
        )
        expect(team.totalGameKnowledgeScore).toBeCloseTo(expectedGK, 1)
        expect(team.totalGoalScoringScore).toBeCloseTo(expectedGS, 1)
      })
    })

    it('gender counts match actual players on each team', () => {
      const result = balanceTeams(players, 2)

      result.teams.forEach((team) => {
        const actualMale = team.players.filter((p) => p.gender === 'male').length
        const actualFemale = team.players.filter((p) => p.gender === 'female').length
        const actualNB = team.players.filter((p) => p.gender === 'nonBinary').length

        expect(team.genderCount.male).toBe(actualMale)
        expect(team.genderCount.female).toBe(actualFemale)
        expect(team.genderCount.nonBinary).toBe(actualNB)
      })
    })
  })

  describe('edge cases', () => {
    it('handles the minimum valid case: 2 players, 2 teams', () => {
      const players = [makeMale('P1'), makeMale('P2')]
      const result = balanceTeams(players, 2)

      expect(result.teams).toHaveLength(2)
      expect(result.totalPlayersPlaying).toBe(2)
      expect(allPlayerNames(result).sort()).toEqual(['P1', 'P2'])
    })

    it('handles players with identical scores', () => {
      const players = Array.from({ length: 6 }, (_, i) =>
        makeMale(`Clone${i}`, { gameKnowledge: 5, goalScoring: 5, attack: 5, midfield: 5, defense: 5, fitness: 5 })
      )

      const result = balanceTeams(players, 2)
      const avgs = result.teams.map(
        (t) => t.totalScore / t.players.length
      )

      expect(Math.abs(avgs[0] - avgs[1])).toBeLessThan(0.01)
    })

    it('handles players with zero scores', () => {
      const players = Array.from({ length: 4 }, (_, i) =>
        makeMale(`Zero${i}`, { gameKnowledge: 0, goalScoring: 0, attack: 0, midfield: 0, defense: 0, fitness: 0 })
      )

      const result = balanceTeams(players, 2)

      result.teams.forEach((team) => {
        expect(team.totalScore).toBe(0)
      })
    })

    it('handles maximum 20 teams', () => {
      const players = Array.from({ length: 40 }, (_, i) =>
        makeMale(`Player${i}`)
      )

      const result = balanceTeams(players, 20)

      expect(result.teams).toHaveLength(20)
      expect(allPlayerNames(result)).toHaveLength(40)
    })

    it('handles more teams than players gracefully by leaving some empty', () => {
      const players = Array.from({ length: 3 }, (_, i) =>
        makeMale(`Player${i}`)
      )

      const result = balanceTeams(players, 3)

      expect(result.teams).toHaveLength(3)
      expect(allPlayerNames(result)).toHaveLength(3)
    })

    it('handles mixed valid and invalid players', () => {
      const players = [
        makeMale('Good1'),
        makeMale('Good2'),
        makePlayer('NotPlaying', 'male', {}, false),
        { name: 'NoScores', gender: 'male', isPlayingThisWeek: true },
        makePlayer('BadGender', 'unknown'),
        makeMale('Good3'),
        makeMale('Good4'),
      ]

      const result = balanceTeams(players, 2)
      const names = allPlayerNames(result)

      expect(names).toContain('Good1')
      expect(names).toContain('Good2')
      expect(names).toContain('Good3')
      expect(names).toContain('Good4')
      expect(names).not.toContain('NotPlaying')
      expect(names).not.toContain('NoScores')
      expect(names).not.toContain('BadGender')
      expect(result.totalPlayersPlaying).toBe(4)
    })
  })

  describe('randomness (fudge factor)', () => {
    it('produces deterministic results when Math.random is fixed', () => {
      const players = Array.from({ length: 10 }, (_, i) =>
        makeMale(`Player${i}`, {
          gameKnowledge: (i + 1) * 1,
          goalScoring: (i + 1) * 1,
          attack: (i + 1) * 1,
          midfield: (i + 1) * 1,
          defense: (i + 1) * 1,
          fitness: (i + 1) * 1,
        })
      )

      const result1 = balanceTeams(
        players.map((p) => ({ ...p })),
        2
      )
      const result2 = balanceTeams(
        players.map((p) => ({ ...p })),
        2
      )

      const names1 = result1.teams.map((t) =>
        t.players.map((p) => p.name).sort()
      )
      const names2 = result2.teams.map((t) =>
        t.players.map((p) => p.name).sort()
      )

      expect(names1).toEqual(names2)
    })

    it('still balances well with real randomness', () => {
      jest.restoreAllMocks()

      const players = [
        makeMale('S1', { gameKnowledge: 10, goalScoring: 10, attack: 10, midfield: 10, defense: 10, fitness: 10 }),
        makeMale('S2', { gameKnowledge: 9, goalScoring: 9, attack: 9, midfield: 9, defense: 9, fitness: 9 }),
        makeMale('M1', { gameKnowledge: 5, goalScoring: 5, attack: 5, midfield: 5, defense: 5, fitness: 5 }),
        makeMale('M2', { gameKnowledge: 5, goalScoring: 5, attack: 5, midfield: 5, defense: 5, fitness: 5 }),
        makeMale('L1', { gameKnowledge: 2, goalScoring: 2, attack: 2, midfield: 2, defense: 2, fitness: 2 }),
        makeMale('L2', { gameKnowledge: 1, goalScoring: 1, attack: 1, midfield: 1, defense: 1, fitness: 1 }),
      ]

      for (let run = 0; run < 10; run++) {
        const result = balanceTeams(
          players.map((p) => ({ ...p })),
          2
        )
        const avgs = result.teams.map(
          (t) => t.totalScore / t.players.length
        )

        expect(Math.abs(avgs[0] - avgs[1])).toBeLessThan(3)
        expect(allPlayerNames(result)).toHaveLength(6)
      }
    })
  })
})
