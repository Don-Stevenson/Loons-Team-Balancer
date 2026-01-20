import { applyPreBalanceRules, applyPostBalanceRules } from '../../src/app/utils/playerTeamRequests'
const PERSON1 = process.env.PERSON1
const PERSON2 = process.env.PERSON2
const PERSON3 = process.env.PERSON3
const PERSON4 = process.env.PERSON4
const PERSON5 = process.env.PERSON5
const PERSON6 = process.env.PERSON6
const PERSON7 = process.env.PERSON7
const PERSON8 = process.env.PERSON8
// Mock the teamStats module
jest.mock('../../src/app/utils/teamStats', () => ({
  calculatePlayerScore: jest.fn((player) => {
    // Simple mock calculation: base 50 + shooting + skating + checking + hands
    const base = 50
    return base + 
      (player.gameKnowledgeScore || 0) + 
      (player.goalScoringScore || 0) + 
      (player.attackScore || 0) + 
      (player.midfieldScore || 0) + 
      (player.defenseScore || 0) + 
      (player.fitnessScore || 0)
  })
}))

describe('playerTeamRequests', () => {
  describe('applyPreBalanceRules', () => {
    let allPlayers, playingPlayers

    beforeEach(() => {
      // Setup common test data
      allPlayers = [
        { 
          _id: '1', 
          name: PERSON1, 
          gender: 'male',
          shooting: 3, 
          skating: 3, 
          checking: 3, 
          hands: 3 
        },
        { 
          _id: '2', 
          name: PERSON2, 
          gender: 'female',
          gameKnowledgeScore: 3, 
          goalScoringScore: 3, 
          attackScore: 3, 
          midfieldScore: 3, 
          defenseScore: 3, 
          fitnessScore: 3, 
        },
        { 
          _id: '3', 
          name: PERSON3, 
          gender: 'male',
          gameKnowledgeScore: 4, 
          goalScoringScore: 4, 
          attackScore: 4, 
          midfieldScore: 4, 
          defenseScore: 4, 
          fitnessScore: 4, 
        },
        { 
          _id: '4', 
          name: PERSON4, 
          gender: 'female',
          gameKnowledgeScore: 2, 
          goalScoringScore: 2, 
          attackScore: 2, 
          midfieldScore: 2, 
          defenseScore: 2, 
          fitnessScore: 2, 
        }
      ]

      playingPlayers = []
    })

    it('should add PERSON2 when PERSON1 is playing', () => {
      playingPlayers = [
        { 
          _id: '1', 
          name: PERSON1,  
          gender: 'male',
          shooting: 3, 
          goalScoringScore: 3, 
          attackScore: 3, 
          midfieldScore: 3, 
          defenseScore: 3, 
          fitnessScore: 3, 
        },
        { 
          _id: '3', 
          name: PERSON3, 
          gender: 'male',
          gameKnowledgeScore: 4, 
          goalScoringScore: 4, 
          attackScore: 4, 
          midfieldScore: 4, 
          defenseScore: 4, 
          fitnessScore: 4, 
        }
      ]

      const result = applyPreBalanceRules(allPlayers, playingPlayers)

      expect(result).toHaveLength(3)
      expect(result.find(p => p.name === PERSON2)).toBeDefined()
      expect(result.find(p => p.name === PERSON2)?.isPlayingThisWeek).toBe(true)
    })

    it('should not add PERSON2 if she is already playing', () => {
      playingPlayers = [
        { 
          _id: '1', 
          name: PERSON1, 
          gender: 'male',
          gameKnowledgeScore: 3, 
          goalScoringScore: 3, 
          attackScore: 3, 
          midfieldScore: 3, 
          defenseScore: 3, 
          fitnessScore: 3, 
        },
        { 
          _id: '2', 
          name: PERSON2, 
          gender: 'female',
          gameKnowledgeScore: 3, 
          goalScoringScore: 3, 
          attackScore: 3, 
          midfieldScore: 3, 
          defenseScore: 3, 
          fitnessScore: 3, 
        }
      ]

      const result = applyPreBalanceRules(allPlayers, playingPlayers)

      // Should not add duplicate
      expect(result).toHaveLength(2)
      expect(result.filter(p => p.name === PERSON2)).toHaveLength(1)
    })

    it('should not modify players when PERSON1 is not playing', () => {
      playingPlayers = [
        { 
          _id: '3', 
          name: PERSON3, 
          gender: 'male',
          gameKnowledgeScore: 4, 
          goalScoringScore: 4, 
          attackScore: 4, 
          midfieldScore: 4, 
          defenseScore: 4, 
          fitnessScore: 4, 
        },
        { 
          _id: '4', 
          name: PERSON4, 
          gender: 'female',
          gameKnowledgeScore: 2, 
          goalScoringScore: 2, 
          attackScore: 2, 
          midfieldScore: 2, 
          defenseScore: 2, 
          fitnessScore: 2, 
        }
      ]

      const result = applyPreBalanceRules(allPlayers, playingPlayers)

      expect(result).toHaveLength(2)
      expect(result).toEqual(playingPlayers)
    })

    it('should handle when PERSON2 is not in the database', () => {
      const limitedAllPlayers = allPlayers.filter(p => p.name !== PERSON2)
      playingPlayers = [
        { 
          _id: '1', 
          name: PERSON1, 
          gender: 'male',
          gameKnowledgeScore: 3, 
          goalScoringScore: 3, 
          attackScore: 3, 
          midfieldScore: 3, 
          defenseScore: 3, 
          fitnessScore: 3, 
        }
      ]

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const result = applyPreBalanceRules(limitedAllPlayers, playingPlayers)

      expect(result).toHaveLength(1)
      expect(result.find(p => p.name === PERSON2)).toBeUndefined()
      expect(consoleSpy).toHaveBeenCalledWith(PERSON2 + ' not found in player database')

      consoleSpy.mockRestore()
    })

    it('should handle invalid allPlayers input', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      expect(applyPreBalanceRules(null, playingPlayers)).toEqual(playingPlayers)
      expect(applyPreBalanceRules(undefined, playingPlayers)).toEqual(playingPlayers)
      expect(applyPreBalanceRules('invalid', playingPlayers)).toEqual(playingPlayers)

      expect(consoleSpy).toHaveBeenCalledTimes(3)
      consoleSpy.mockRestore()
    })

    it('should handle invalid playingPlayers input', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      expect(applyPreBalanceRules(allPlayers, null)).toEqual(null)
      expect(applyPreBalanceRules(allPlayers, undefined)).toEqual(undefined)
      expect(applyPreBalanceRules(allPlayers, 'invalid')).toEqual('invalid')

      expect(consoleSpy).toHaveBeenCalledTimes(3)
      consoleSpy.mockRestore()
    })

    it('should handle errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      // Create a scenario that will cause an error by making playingPlayers.find throw
      const brokenPlayingPlayers = [
        { name: 'Test Player' }
      ]
      Object.defineProperty(brokenPlayingPlayers, 'find', {
        get() {
          throw new Error('Test error')
        }
      })

      const result = applyPreBalanceRules(allPlayers, brokenPlayingPlayers)

      expect(result).toEqual(brokenPlayingPlayers)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('applyPostBalanceRules', () => {
    let players, teams

    beforeEach(() => {
      players = [
        { 
          _id: '1', 
          name: PERSON2, 
          gender: 'female',
          gameKnowledgeScore: 3, 
          goalScoringScore: 3, 
          attackScore: 3, 
          midfieldScore: 3, 
          defenseScore: 3, 
          fitnessScore: 3, 
        },
        { 
          _id: '2', 
          name: PERSON3, 
          gender: 'male',
          gameKnowledgeScore: 4, 
          goalScoringScore: 4, 
          attackScore: 4, 
          midfieldScore: 4, 
          defenseScore: 4, 
          fitnessScore: 4, 
        },
        { 
          _id: '3', 
          name: PERSON4, 
          gender: 'female',
          shootingScore: 2, 
          goalScoringScore: 2, 
          attackScore: 2, 
          midfieldScore: 2, 
          defenseScore: 2, 
          fitnessScore: 2, 
        },
        { 
          _id: '4', 
          name: PERSON5, 
          gender: 'male',
          gameKnowledgeScore: 3, 
          goalScoringScore: 3, 
          attackScore: 3, 
          midfieldScore: 3, 
          defenseScore: 3, 
          fitnessScore: 3, 
        },
        { 
          _id: '5', 
          name: PERSON6, 
          gender: 'male',
          gameKnowledgeScore: 3, 
          goalScoringScore: 3, 
          attackScore: 3, 
          midfieldScore: 3, 
          defenseScore: 3, 
          fitnessScore: 3, 
        },
        { 
          _id: '6', 
          name: PERSON8, 
          gender: 'male',
          gameKnowledgeScore: 4, 
          goalScoringScore: 4, 
          attackScore: 4, 
          midfieldScore: 4, 
          defenseScore: 4, 
          fitnessScore: 4, 
        },
        { 
          _id: '7', 
          name: PERSON7, 
          gender: 'male',
          goalScoringScore: 3, 
          attackScore: 3, 
          midfieldScore: 3, 
          defenseScore: 3, 
          fitnessScore: 3, 
        },
        { 
          _id: '8', 
          name: 'Player A', 
          gender: 'male',
          goalScoringScore: 3, 
          attackScore: 3, 
          midfieldScore: 3, 
          defenseScore: 3, 
          fitnessScore: 3, 
        },
        { 
          _id: '9', 
          name: 'Player B', 
          gender: 'female',
          goalScoringScore: 3, 
          attackScore: 3, 
          midfieldScore: 3, 
          defenseScore: 3, 
          fitnessScore: 3, 
        }
      ]

      teams = [
        {
          name: 'Team A',
          players: []
        },
        {
          name: 'Team B',
          players: []
        }
      ]
    })

    describe('Rule 2: PERSON2 and PERSON3 separation', () => {  
      it('should separate PERSON2 and PERSON3 when on same team', () => {
        const person2 = players.find(p => p.name === PERSON2)
        const person3 = players.find(p => p.name === PERSON3)
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [person2, person3]
        teams[1].players = [playerA, playerB]

        const result = applyPostBalanceRules(players, teams)

        const person2Team = result.find(t => t.players.some(p => p.name === PERSON2))
        const person3Team = result.find(t => t.players.some(p => p.name === PERSON3))

        expect(person2Team).not.toBe(person3Team)
      })

      it('should not modify teams when PERSON2 and PERSON3 are already on different teams', () => {
        const person2 = players.find(p => p.name === PERSON2)
        const person3 = players.find(p => p.name === PERSON3)
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [person2, playerA]
        teams[1].players = [person3, playerB]

        const result = applyPostBalanceRules(players, teams)

        expect(result[0].players.some(p => p.name === PERSON2)).toBe(true)
        expect(result[1].players.some(p => p.name === PERSON3)).toBe(true)
      })

      it('should not apply rule when only PERSON2 is playing', () => {
        const person2 = players.find(p => p.name === PERSON2)
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [person2, playerA]
        teams[1].players = [playerB]

        const playersWithoutPerson3 = players.filter(p => p.name !== PERSON3)
        const result = applyPostBalanceRules(playersWithoutPerson3, teams)

        expect(result[0].players).toHaveLength(2)
        expect(result[1].players).toHaveLength(1)
      })

      it('should not apply rule when only PERSON3 is playing', () => {
        const person3 = players.find(p => p.name === PERSON3)
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [person3, playerA]
        teams[1].players = [playerB]

        const playersWithoutPerson2 = players.filter(p => p.name !== PERSON2)
        const result = applyPostBalanceRules(playersWithoutPerson2, teams)

        expect(result[0].players).toHaveLength(2)
        expect(result[1].players).toHaveLength(1)
      })
    })

    describe('Rule 3: PERSON4 and PERSON5 together', () => {
      it('should put PERSON4 and PERSON5 on same team', () => {
        const person4 = players.find(p => p.name === PERSON4)
        const person5 = players.find(p => p.name === PERSON5)
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [person4, playerA]
        teams[1].players = [person5, playerB]

        const result = applyPostBalanceRules(players, teams)

        const person4Team = result.find(t => t.players.some(p => p.name === PERSON4))
        const person5Team = result.find(t => t.players.some(p => p.name === PERSON5))

        expect(person4Team).toBe(person5Team)
      })

      it('should not modify teams when PERSON4 and PERSON5 are already together', () => {
        const person4 = players.find(p => p.name === PERSON4)
        const person5 = players.find(p => p.name === PERSON5)
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [person4, person5]
        teams[1].players = [playerA, playerB]

        const result = applyPostBalanceRules(players, teams)

        expect(result[0].players.some(p => p.name === PERSON4)).toBe(true)
        expect(result[0].players.some(p => p.name === PERSON5)).toBe(true)
      })

      it('should not apply rule when only PERSON4 is playing', () => {
        const person4 = players.find(p => p.name === PERSON4)
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [person4, playerA]
        teams[1].players = [playerB]

        const playersWithoutPerson5 = players.filter(p => p.name !== PERSON5)
        const result = applyPostBalanceRules(playersWithoutPerson5, teams)

        expect(result[0].players).toHaveLength(2)
        expect(result[1].players).toHaveLength(1)
      })
    })

    describe('Rule 4: PERSON6 separation from PERSON8 and PERSON7', () => {
      it('should separate PERSON6 when on same team with both PERSON8 and PERSON7', () => {
        const person6 = players.find(p => p.name === PERSON6)
        const person8 = players.find(p => p.name === PERSON8)
        const person7 = players.find(p => p.name === PERSON7)
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [person6, person8, person7]
        teams[1].players = [playerA, playerB]

        const result = applyPostBalanceRules(players, teams)

        const person6Team = result.find(t => t.players.some(p => p.name === PERSON6))
        const person8Team = result.find(t => t.players.some(p => p.name === PERSON8))
        const person7Team = result.find(t => t.players.some(p => p.name === PERSON7))

        // PERSON6 should not be on same team with BOTH PERSON8 and PERSON7
        const allOnSameTeam = person6Team === person8Team && person6Team === person7Team
        expect(allOnSameTeam).toBe(false)
      })

      it('should not apply rule when PERSON6 is only with PERSON8 (not PERSON7)', () => {
        const person6 = players.find(p => p.name === PERSON6)
        const person8 = players.find(p => p.name === PERSON8)
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [person6, person8]
        teams[1].players = [playerA, playerB]

        const playersWithoutJoe = players.filter(p => p.name !== PERSON7)
        const result = applyPostBalanceRules(playersWithoutJoe, teams)

        // Should not modify - PERSON6 can be with PERSON8 or PERSON7, just not both PERSON8 and PERSON7
        expect(result[0].players.some(p => p.name === PERSON6)).toBe(true)
        expect(result[0].players.some(p => p.name === PERSON8)).toBe(true)
      })

      it('should not apply rule when PERSON6 is only with PERSON7 (not PERSON8)', () => {  
        const person6 = players.find(p => p.name === PERSON6)
        const person7 = players.find(p => p.name === PERSON7)
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [person6, person7]
        teams[1].players = [playerA, playerB]

        const playersWithoutPerson8 = players.filter(p => p.name !== PERSON8)
        const result = applyPostBalanceRules(playersWithoutPerson8, teams)

        // Should not modify - PERSON6 can be with PERSON8 or PERSON7, just not both PERSON8 and PERSON7
        expect(result[0].players.some(p => p.name === PERSON6)).toBe(true)
        expect(result[0].players.some(p => p.name === PERSON7)).toBe(true)
      })

      it('should not apply rule when not all three are playing', () => {
        const person6 = players.find(p => p.name === PERSON6)
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [person6, playerA]
        teams[1].players = [playerB]

        const limitedPlayers = players.filter(
          p => p.name !== PERSON8 && p.name !== PERSON7
        )
        const result = applyPostBalanceRules(limitedPlayers, teams)

        expect(result[0].players).toHaveLength(2)
        expect(result[1].players).toHaveLength(1)
      })
    })


    describe('Rule 4: PERSON6 separation from PERSON8 and PERSON7', () => {  
        it('should separate PERSON6 when on same team with both PERSON8 and PERSON7', () => {
          const person6 = players.find(p => p.name === PERSON6)
          const person8 = players.find(p => p.name === PERSON8) 
          const person7 = players.find(p => p.name === PERSON7) 
          const playerA = players.find(p => p.name === 'Player A')
          const playerB = players.find(p => p.name === 'Player B')
  
          teams[0].players = [person6, person8, person7]
          teams[1].players = [playerA, playerB]
  
          const result = applyPostBalanceRules(players, teams)
  
          const person6Team = result.find(t => t.players.some(p => p.name === PERSON6))
          const person8Team = result.find(t => t.players.some(p => p.name === PERSON8))
          const person7Team = result.find(t => t.players.some(p => p.name === PERSON7))
  
          // PERSON6 should not be on same team with BOTH PERSON8 and PERSON7
          const allOnSameTeam = person6Team === person8Team && person6Team === person7Team
          expect(allOnSameTeam).toBe(false)
        })
  
        it('should not apply rule when PERSON6 is only with PERSON7 (not PERSON8)', () => {
          const person6 = players.find(p => p.name === PERSON6)
          const person7 = players.find(p => p.name === PERSON7)
          const playerA = players.find(p => p.name === 'Player A')
          const playerB = players.find(p => p.name === 'Player B')
  
          teams[0].players = [person6, person7]
          teams[1].players = [playerA, playerB]
  
          const playersWithoutPerson8 = players.filter(p => p.name !== PERSON8)
          const result = applyPostBalanceRules(playersWithoutPerson8, teams)
  
          // Should not modify - PERSON6 can be with PERSON8 or PERSON7, just not both PERSON8 and PERSON7
          expect(result[0].players.some(p => p.name === PERSON6)).toBe(true)
          expect(result[0].players.some(p => p.name === PERSON7)).toBe(true)
        })
         
      })

    describe('Edge cases and error handling', () => {
      it('should handle empty players array', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

        const result = applyPostBalanceRules([], teams)

        expect(result).toEqual(teams)
        expect(consoleSpy).toHaveBeenCalledWith('applyPostBalanceRules: Invalid or empty players array')

        consoleSpy.mockRestore()
      })

      it('should handle invalid players input', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

        expect(applyPostBalanceRules(null, teams)).toEqual(teams)
        expect(applyPostBalanceRules(undefined, teams)).toEqual(teams)
        expect(applyPostBalanceRules('invalid', teams)).toEqual(teams)

        expect(consoleSpy).toHaveBeenCalledTimes(3)
        consoleSpy.mockRestore()
      })

      it('should handle empty teams array', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

        const result = applyPostBalanceRules(players, [])

        expect(result).toEqual([])
        expect(consoleSpy).toHaveBeenCalledWith('applyPostBalanceRules: Invalid or empty teams array')

        consoleSpy.mockRestore()
      })

      it('should handle invalid teams input', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

        expect(applyPostBalanceRules(players, null)).toEqual(null)
        expect(applyPostBalanceRules(players, undefined)).toEqual(undefined)
        expect(applyPostBalanceRules(players, 'invalid')).toEqual('invalid')

        expect(consoleSpy).toHaveBeenCalledTimes(3)
        consoleSpy.mockRestore()
      })

      it('should return deep copy of teams to prevent mutations', () => {
        const person2 = players.find(p => p.name === PERSON2)
        const playerA = players.find(p => p.name === 'Player A')

        teams[0].players = [person2]
        teams[1].players = [playerA]

        const result = applyPostBalanceRules(players, teams)

        expect(result).not.toBe(teams)
        expect(result[0]).not.toBe(teams[0])
        expect(result[0].players).not.toBe(teams[0].players)
      })

      it('should handle errors gracefully', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        
        // Create scenario that will cause an error in the processing logic
        const problematicPlayers = [...players]
        const validTeams = [
          { name: 'Team A', players: [players[0], players[1]] },
          { name: 'Team B', players: [players[2], players[3]] }
        ]

        // Mock the teams.find method to throw an error
        const teamsWithError = [...validTeams]
        const originalFind = teamsWithError.find
        teamsWithError.find = function() {
          throw new Error('Test error in find operation')
        }

        const result = applyPostBalanceRules(problematicPlayers, teamsWithError)

        // Should return the teams even if error occurred
        expect(result).toBeDefined()
        expect(Array.isArray(result)).toBe(true)
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
      })

      it('should handle when no suitable swap candidate exists', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
        
        const person2 = players.find(p => p.name === PERSON2)
        const person3 = players.find(p => p.name === PERSON3)

        // Create scenario with no other team to swap to
        const singleTeam = [
          {
            name: 'Team A',
            players: [person2, person3]
          }
        ]

        const result = applyPostBalanceRules(players, singleTeam)

        // Should still return the teams even if swap couldn't happen
        expect(result).toHaveLength(1)
        
        consoleSpy.mockRestore()
      })
    })

    describe('Multiple rules interaction', () => {
      it('should apply multiple rules when multiple conditions are met', () => {
        // Setup scenario where multiple rules apply
        const person2 = players.find(p => p.name === PERSON2)
        const person3 = players.find(p => p.name === PERSON3)
        const person4 = players.find(p => p.name === PERSON4)
        const person5 = players.find(p => p.name === PERSON5)
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [person2, person3, person4]
        teams[1].players = [person5, playerA, playerB]

        const result = applyPostBalanceRules(players, teams)

        // Rule 2: PERSON2 and PERSON3 should be separated
        const person2Team = result.find(t => t.players.some(p => p.name === PERSON2))
        const person3Team = result.find(t => t.players.some(p => p.name === PERSON3))
        expect(person2Team).not.toBe(person3Team)

        // Rule 3: PERSON4 and PERSON5 should be together
        const person4Team = result.find(t => t.players.some(p => p.name === PERSON4))
        const person5Team = result.find(t => t.players.some(p => p.name === PERSON5))
        expect(person4Team).toBe(person5Team)
      })
    })
  })
})