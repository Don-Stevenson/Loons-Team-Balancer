import { applyPreBalanceRules, applyPostBalanceRules } from '../../src/app/utils/playerTeamRequests'

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
          name: 'Aidan Butterworth', 
          gender: 'male',
          shooting: 3, 
          skating: 3, 
          checking: 3, 
          hands: 3 
        },
        { 
          _id: '2', 
          name: 'Kim Butterworth', 
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
          name: 'Jan Dmowski', 
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
          name: 'Sandra Panajotow', 
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

    it('should add Kim Butterworth when Aidan Butterworth is playing', () => {
      playingPlayers = [
        { 
          _id: '1', 
          name: 'Aidan Butterworth', 
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
          name: 'Jan Dmowski', 
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
      expect(result.find(p => p.name === 'Kim Butterworth')).toBeDefined()
      expect(result.find(p => p.name === 'Kim Butterworth')?.isPlayingThisWeek).toBe(true)
    })

    it('should not add Kim Butterworth if she is already playing', () => {
      playingPlayers = [
        { 
          _id: '1', 
          name: 'Aidan Butterworth', 
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
          name: 'Kim Butterworth', 
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
      expect(result.filter(p => p.name === 'Kim Butterworth')).toHaveLength(1)
    })

    it('should not modify players when Aidan Butterworth is not playing', () => {
      playingPlayers = [
        { 
          _id: '3', 
          name: 'Jan Dmowski', 
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
          name: 'Sandra Panajotow', 
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

    it('should handle when Kim Butterworth is not in the database', () => {
      const limitedAllPlayers = allPlayers.filter(p => p.name !== 'Kim Butterworth')
      playingPlayers = [
        { 
          _id: '1', 
          name: 'Aidan Butterworth', 
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
      expect(result.find(p => p.name === 'Kim Butterworth')).toBeUndefined()
      expect(consoleSpy).toHaveBeenCalledWith('Kim Butterworth not found in player database')

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
          name: 'Kim Butterworth', 
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
          name: 'Jan Dmowski', 
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
          name: 'Sandra Panajotow', 
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
          name: 'Rob Freeman', 
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
          name: 'Lawrence Davis', 
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
          name: 'Sam Masri', 
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
          name: 'Joe Barbieri', 
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

    describe('Rule 2: Kim Butterworth and Jan Dmowski separation', () => {
      it('should separate Kim Butterworth and Jan Dmowski when on same team', () => {
        const kim = players.find(p => p.name === 'Kim Butterworth')
        const jan = players.find(p => p.name === 'Jan Dmowski')
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [kim, jan]
        teams[1].players = [playerA, playerB]

        const result = applyPostBalanceRules(players, teams)

        const kimTeam = result.find(t => t.players.some(p => p.name === 'Kim Butterworth'))
        const janTeam = result.find(t => t.players.some(p => p.name === 'Jan Dmowski'))

        expect(kimTeam).not.toBe(janTeam)
      })

      it('should not modify teams when Kim and Jan are already on different teams', () => {
        const kim = players.find(p => p.name === 'Kim Butterworth')
        const jan = players.find(p => p.name === 'Jan Dmowski')
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [kim, playerA]
        teams[1].players = [jan, playerB]

        const result = applyPostBalanceRules(players, teams)

        expect(result[0].players.some(p => p.name === 'Kim Butterworth')).toBe(true)
        expect(result[1].players.some(p => p.name === 'Jan Dmowski')).toBe(true)
      })

      it('should not apply rule when only Kim is playing', () => {
        const kim = players.find(p => p.name === 'Kim Butterworth')
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [kim, playerA]
        teams[1].players = [playerB]

        const playersWithoutJan = players.filter(p => p.name !== 'Jan Dmowski')
        const result = applyPostBalanceRules(playersWithoutJan, teams)

        expect(result[0].players).toHaveLength(2)
        expect(result[1].players).toHaveLength(1)
      })

      it('should not apply rule when only Jan is playing', () => {
        const jan = players.find(p => p.name === 'Jan Dmowski')
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [jan, playerA]
        teams[1].players = [playerB]

        const playersWithoutKim = players.filter(p => p.name !== 'Kim Butterworth')
        const result = applyPostBalanceRules(playersWithoutKim, teams)

        expect(result[0].players).toHaveLength(2)
        expect(result[1].players).toHaveLength(1)
      })
    })

    describe('Rule 3: Sandra Panajotow and Rob Freeman together', () => {
      it('should put Sandra Panajotow and Rob Freeman on same team', () => {
        const sandra = players.find(p => p.name === 'Sandra Panajotow')
        const rob = players.find(p => p.name === 'Rob Freeman')
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [sandra, playerA]
        teams[1].players = [rob, playerB]

        const result = applyPostBalanceRules(players, teams)

        const sandraTeam = result.find(t => t.players.some(p => p.name === 'Sandra Panajotow'))
        const robTeam = result.find(t => t.players.some(p => p.name === 'Rob Freeman'))

        expect(sandraTeam).toBe(robTeam)
      })

      it('should not modify teams when Sandra and Rob are already together', () => {
        const sandra = players.find(p => p.name === 'Sandra Panajotow')
        const rob = players.find(p => p.name === 'Rob Freeman')
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [sandra, rob]
        teams[1].players = [playerA, playerB]

        const result = applyPostBalanceRules(players, teams)

        expect(result[0].players.some(p => p.name === 'Sandra Panajotow')).toBe(true)
        expect(result[0].players.some(p => p.name === 'Rob Freeman')).toBe(true)
      })

      it('should not apply rule when only Sandra is playing', () => {
        const sandra = players.find(p => p.name === 'Sandra Panajotow')
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [sandra, playerA]
        teams[1].players = [playerB]

        const playersWithoutRob = players.filter(p => p.name !== 'Rob Freeman')
        const result = applyPostBalanceRules(playersWithoutRob, teams)

        expect(result[0].players).toHaveLength(2)
        expect(result[1].players).toHaveLength(1)
      })
    })

    describe('Rule 4: Lawrence Davis separation from Sam and Joe', () => {
      it('should separate Lawrence when on same team with both Sam Masri and Joe Barbieri', () => {
        const lawrence = players.find(p => p.name === 'Lawrence Davis')
        const sam = players.find(p => p.name === 'Sam Masri')
        const joe = players.find(p => p.name === 'Joe Barbieri')
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [lawrence, sam, joe]
        teams[1].players = [playerA, playerB]

        const result = applyPostBalanceRules(players, teams)

        const lawrenceTeam = result.find(t => t.players.some(p => p.name === 'Lawrence Davis'))
        const samTeam = result.find(t => t.players.some(p => p.name === 'Sam Masri'))
        const joeTeam = result.find(t => t.players.some(p => p.name === 'Joe Barbieri'))

        // Lawrence should not be on same team with BOTH Sam and Joe
        const allOnSameTeam = lawrenceTeam === samTeam && lawrenceTeam === joeTeam
        expect(allOnSameTeam).toBe(false)
      })

      it('should not apply rule when Lawrence is only with Sam (not Joe)', () => {
        const lawrence = players.find(p => p.name === 'Lawrence Davis')
        const sam = players.find(p => p.name === 'Sam Masri')
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [lawrence, sam]
        teams[1].players = [playerA, playerB]

        const playersWithoutJoe = players.filter(p => p.name !== 'Joe Barbieri')
        const result = applyPostBalanceRules(playersWithoutJoe, teams)

        // Should not modify - Lawrence can be with Sam or Joe, just not both
        expect(result[0].players.some(p => p.name === 'Lawrence Davis')).toBe(true)
        expect(result[0].players.some(p => p.name === 'Sam Masri')).toBe(true)
      })

      it('should not apply rule when Lawrence is only with Joe (not Sam)', () => {
        const lawrence = players.find(p => p.name === 'Lawrence Davis')
        const joe = players.find(p => p.name === 'Joe Barbieri')
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [lawrence, joe]
        teams[1].players = [playerA, playerB]

        const playersWithoutSam = players.filter(p => p.name !== 'Sam Masri')
        const result = applyPostBalanceRules(playersWithoutSam, teams)

        // Should not modify - Lawrence can be with Sam or Joe, just not both
        expect(result[0].players.some(p => p.name === 'Lawrence Davis')).toBe(true)
        expect(result[0].players.some(p => p.name === 'Joe Barbieri')).toBe(true)
      })

      it('should not apply rule when not all three are playing', () => {
        const lawrence = players.find(p => p.name === 'Lawrence Davis')
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [lawrence, playerA]
        teams[1].players = [playerB]

        const limitedPlayers = players.filter(
          p => p.name !== 'Sam Masri' && p.name !== 'Joe Barbieri'
        )
        const result = applyPostBalanceRules(limitedPlayers, teams)

        expect(result[0].players).toHaveLength(2)
        expect(result[1].players).toHaveLength(1)
      })
    })


    describe('Rule 4: Lawrence Davis separation from Joe', () => {
        it('should separate Lawrence when on same team with both Sam Masri and Joe Barbieri', () => {
          const lawrence = players.find(p => p.name === 'Lawrence Davis')
          const sam = players.find(p => p.name === 'Sam Masri')
          const joe = players.find(p => p.name === 'Joe Barbieri')
          const playerA = players.find(p => p.name === 'Player A')
          const playerB = players.find(p => p.name === 'Player B')
  
          teams[0].players = [lawrence, sam, joe]
          teams[1].players = [playerA, playerB]
  
          const result = applyPostBalanceRules(players, teams)
  
          const lawrenceTeam = result.find(t => t.players.some(p => p.name === 'Lawrence Davis'))
          const samTeam = result.find(t => t.players.some(p => p.name === 'Sam Masri'))
          const joeTeam = result.find(t => t.players.some(p => p.name === 'Joe Barbieri'))
  
          // Lawrence should not be on same team with BOTH Sam and Joe
          const allOnSameTeam = lawrenceTeam === samTeam && lawrenceTeam === joeTeam
          expect(allOnSameTeam).toBe(false)
        })
  
        it('should not apply rule when Lawrence is only with Joe', () => {
          const lawrence = players.find(p => p.name === 'Lawrence Davis')
          const joe = players.find(p => p.name === 'Joe Barbieri')
          const playerA = players.find(p => p.name === 'Player A')
          const playerB = players.find(p => p.name === 'Player B')
  
          teams[0].players = [lawrence, joe]
          teams[1].players = [playerA, playerB]
  
          const playersWithoutSam = players.filter(p => p.name !== 'Sam Masri')
          const result = applyPostBalanceRules(playersWithoutSam, teams)
  
          // Should not modify - Lawrence can be with Sam or Joe, just not both
          expect(result[0].players.some(p => p.name === 'Lawrence Davis')).toBe(true)
          expect(result[0].players.some(p => p.name === 'Joe Barbieri')).toBe(true)
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
        const kim = players.find(p => p.name === 'Kim Butterworth')
        const playerA = players.find(p => p.name === 'Player A')

        teams[0].players = [kim]
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
        
        const kim = players.find(p => p.name === 'Kim Butterworth')
        const jan = players.find(p => p.name === 'Jan Dmowski')

        // Create scenario with no other team to swap to
        const singleTeam = [
          {
            name: 'Team A',
            players: [kim, jan]
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
        const kim = players.find(p => p.name === 'Kim Butterworth')
        const jan = players.find(p => p.name === 'Jan Dmowski')
        const sandra = players.find(p => p.name === 'Sandra Panajotow')
        const rob = players.find(p => p.name === 'Rob Freeman')
        const playerA = players.find(p => p.name === 'Player A')
        const playerB = players.find(p => p.name === 'Player B')

        teams[0].players = [kim, jan, sandra]
        teams[1].players = [rob, playerA, playerB]

        const result = applyPostBalanceRules(players, teams)

        // Rule 2: Kim and Jan should be separated
        const kimTeam = result.find(t => t.players.some(p => p.name === 'Kim Butterworth'))
        const janTeam = result.find(t => t.players.some(p => p.name === 'Jan Dmowski'))
        expect(kimTeam).not.toBe(janTeam)

        // Rule 3: Sandra and Rob should be together
        const sandraTeam = result.find(t => t.players.some(p => p.name === 'Sandra Panajotow'))
        const robTeam = result.find(t => t.players.some(p => p.name === 'Rob Freeman'))
        expect(sandraTeam).toBe(robTeam)
      })
    })
  })
})