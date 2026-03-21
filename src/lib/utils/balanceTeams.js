const WEIGHTS = {
  gameKnowledge: 0.235,
  goalScoring: 0.233,
  attack: 0.133,
  midfield: 0.133,
  defense: 0.133,
  fitness: 0.133,
}

// Add randomization to prevent identical team formations
const fudge = (score) => score + (Math.random() - 0.5) * 0.3

// Helper function to calculate weighted player score
const calculatePlayerScore = (player) => {
  return (
    player.gameKnowledgeScore * WEIGHTS.gameKnowledge +
    player.goalScoringScore * WEIGHTS.goalScoring +
    player.attackScore * WEIGHTS.attack +
    player.midfieldScore * WEIGHTS.midfield +
    player.defenseScore * WEIGHTS.defense +
    player.fitnessScore * WEIGHTS.fitness
  )
}

// Helper function to calculate fudged player score for sorting
const calculateFudgedPlayerScore = (player) => {
  return fudge(calculatePlayerScore(player))
}

function balanceTeams(players, numTeams) {
  // Validate input
  if (!players || !Array.isArray(players)) {
    console.error('Invalid players data:', players)
    throw new Error('Invalid players data')
  }
  if (!numTeams || numTeams < 2 || numTeams > 20) {
    console.error('Invalid number of teams:', numTeams)
    throw new Error('Invalid number of teams')
  }

  // Ensure all required player properties exist and are of correct type
  const validPlayers = players.filter((player) => {
    // Convert all numeric fields to numbers
    const gameKnowledgeScore = Number(player.gameKnowledgeScore)
    const goalScoringScore = Number(player.goalScoringScore)
    const attackScore = Number(player.attackScore)
    const midfieldScore = Number(player.midfieldScore)
    const defenseScore = Number(player.defenseScore)
    const fitnessScore = Number(player.fitnessScore)

    // Check if any numeric fields are NaN
    if (
      isNaN(gameKnowledgeScore) ||
      isNaN(goalScoringScore) ||
      isNaN(attackScore) ||
      isNaN(midfieldScore) ||
      isNaN(defenseScore) ||
      isNaN(fitnessScore)
    ) {
      console.warn('Player has invalid numeric scores:', {
        player,
        scores: {
          gameKnowledgeScore,
          goalScoringScore,
          attackScore,
          midfieldScore,
          defenseScore,
          fitnessScore,
        },
      })
      return false
    }

    // Check if gender is valid
    if (!['male', 'female', 'nonBinary'].includes(player.gender)) {
      console.warn('Player has invalid gender:', {
        player,
        gender: player.gender,
      })
      return false
    }

    // Check if isPlayingThisWeek is true (handle both boolean and string values)
    const isPlaying =
      player.isPlayingThisWeek === true ||
      player.isPlayingThisWeek === 'true' ||
      player.isPlayingThisWeek === 1 ||
      player.isPlayingThisWeek === '1'
    if (!isPlaying) {
      console.warn('Player is not marked as playing this week:', {
        player,
        isPlayingThisWeek: player.isPlayingThisWeek,
        type: typeof player.isPlayingThisWeek,
      })
      return false
    }

    // Create a clean player object with all required fields
    const cleanPlayer = {
      name: player.name,
      gameKnowledgeScore,
      goalScoringScore,
      attackScore,
      midfieldScore,
      defenseScore,
      fitnessScore,
      gender: player.gender,
      isPlayingThisWeek: true,
    }

    // Update the original player object with cleaned values
    Object.assign(player, cleanPlayer)

    return true
  })

  if (validPlayers.length === 0) {
    throw new Error('No valid players provided')
  }

  // Initialize teams
  const teams = Array.from({ length: numTeams }, () => ({
    players: [],
    totalScore: 0,
    totalGameKnowledgeScore: 0,
    totalGoalScoringScore: 0,
    totalAttackScore: 0,
    totalMidfieldScore: 0,
    totalDefenseScore: 0,
    totalFitnessScore: 0,
    fitnessScore: 0,
    genderCount: {
      male: 0,
      female: 0,
      nonBinary: 0,
    },
  }))

  // Separate players by gender to distribute women and non-binary first
  const femaleAndNonBinaryPlayers = validPlayers.filter((player) =>
    ['female', 'nonBinary'].includes(player.gender)
  )
  const malePlayers = validPlayers.filter((player) => player.gender === 'male')

  // Combine lists so female and non-binary players are added first
  const sortedPlayers = [...femaleAndNonBinaryPlayers, ...malePlayers]

  const totalAllScores = sortedPlayers.reduce(
    (sum, p) => sum + calculatePlayerScore(p),
    0
  )
  const globalAvg = totalAllScores / sortedPlayers.length
  const baseSize = Math.floor(sortedPlayers.length / numTeams)
  const extraPlayers = sortedPlayers.length % numTeams
  // Teams 0..(extraPlayers-1) will have (baseSize + 1) players, the rest get baseSize
  const targetTotals = teams.map((_, i) => {
    const expectedSize = i < extraPlayers ? baseSize + 1 : baseSize
    return expectedSize * globalAvg
  })

  // Phase 1: Round-robin distribute female/nonBinary players
  femaleAndNonBinaryPlayers.sort(
    (a, b) => calculateFudgedPlayerScore(b) - calculateFudgedPlayerScore(a)
  )
  for (let i = 0; i < femaleAndNonBinaryPlayers.length; i++) {
    const player = femaleAndNonBinaryPlayers[i]
    const round = Math.floor(i / numTeams)
    const posInRound = i % numTeams
    // Snake draft: even rounds go left-to-right, odd rounds go right-to-left
    const teamIndex = round % 2 === 0 ? posInRound : numTeams - 1 - posInRound
    const team = teams[teamIndex]

    team.players.push(player)
    team.totalScore += calculatePlayerScore(player)
    team.totalGameKnowledgeScore += player.gameKnowledgeScore
    team.totalGoalScoringScore += player.goalScoringScore
    team.totalAttackScore += player.attackScore
    team.totalMidfieldScore += player.midfieldScore
    team.totalDefenseScore += player.defenseScore
    team.totalFitnessScore += player.fitnessScore
    team.genderCount[player.gender]++
  }
  // Phase 2: Distribute male players using score-deficit balancing
  malePlayers.sort(
    (a, b) => calculateFudgedPlayerScore(b) - calculateFudgedPlayerScore(a)
  )
  for (let i = 0; i < malePlayers.length; i++) {
    const player = malePlayers[i]
    const eligibleTeams = teams.filter(
      (team) =>
        team.players.length === Math.min(...teams.map((t) => t.players.length))
    )
    const targetTeam = eligibleTeams.reduce((best, team) => {
      const teamIdx = teams.indexOf(team)
      const bestIdx = teams.indexOf(best)
      const teamDeficit = targetTotals[teamIdx] - team.totalScore
      const bestDeficit = targetTotals[bestIdx] - best.totalScore
      return teamDeficit > bestDeficit ? team : best
    })
    targetTeam.players.push(player)
    targetTeam.totalScore += calculatePlayerScore(player)
    targetTeam.totalGameKnowledgeScore += player.gameKnowledgeScore
    targetTeam.totalGoalScoringScore += player.goalScoringScore
    targetTeam.totalAttackScore += player.attackScore
    targetTeam.totalMidfieldScore += player.midfieldScore
    targetTeam.totalDefenseScore += player.defenseScore
    targetTeam.totalFitnessScore += player.fitnessScore
    targetTeam.genderCount[player.gender]++
  }

  let improved = true
  let iterations = 0
  while (improved && iterations < 100) {
    improved = false
    iterations++
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const avgI = teams[i].totalScore / teams[i].players.length
        const avgJ = teams[j].totalScore / teams[j].players.length
        const currentImbalance =
          Math.abs(avgI - globalAvg) + Math.abs(avgJ - globalAvg)
        for (let pi = 0; pi < teams[i].players.length; pi++) {
          for (let pj = 0; pj < teams[j].players.length; pj++) {
            // Only swap players of the same gender to preserve gender balance
            if (teams[i].players[pi].gender !== teams[j].players[pj].gender)
              continue

            const scoreI = calculatePlayerScore(teams[i].players[pi])
            const scoreJ = calculatePlayerScore(teams[j].players[pj])
            const newTotalI = teams[i].totalScore - scoreI + scoreJ
            const newTotalJ = teams[j].totalScore - scoreJ + scoreI
            const newAvgI = newTotalI / teams[i].players.length
            const newAvgJ = newTotalJ / teams[j].players.length
            const newImbalance =
              Math.abs(newAvgI - globalAvg) + Math.abs(newAvgJ - globalAvg)
            if (newImbalance < currentImbalance - 0.01) {
              const temp = teams[i].players[pi]
              teams[i].players[pi] = teams[j].players[pj]
              teams[j].players[pj] = temp
              teams[i].totalScore = newTotalI
              teams[j].totalScore = newTotalJ
              improved = true
              break
            }
          }
          if (improved) break
        }
        if (improved) break
      }
    }
  }

  const finalTeams = teams.map((team) => {
    const stats = team.players.reduce(
      (acc, player) => ({
        totalScore: acc.totalScore + calculatePlayerScore(player),
        totalGameKnowledgeScore:
          acc.totalGameKnowledgeScore + player.gameKnowledgeScore,
        totalGoalScoringScore:
          acc.totalGoalScoringScore + player.goalScoringScore,
        totalAttackScore: acc.totalAttackScore + player.attackScore,
        totalMidfieldScore: acc.totalMidfieldScore + player.midfieldScore,
        totalDefenseScore: acc.totalDefenseScore + player.defenseScore,
        totalFitnessScore: acc.totalFitnessScore + player.fitnessScore,
        genderCount: {
          ...acc.genderCount,
          [player.gender]: (acc.genderCount[player.gender] || 0) + 1,
        },
      }),
      {
        totalScore: 0,
        totalGameKnowledgeScore: 0,
        totalGoalScoringScore: 0,
        totalAttackScore: 0,
        totalMidfieldScore: 0,
        totalDefenseScore: 0,
        totalFitnessScore: 0,
        genderCount: { male: 0, female: 0, nonBinary: 0 },
      }
    )
    return {
      players: team.players,
      totalScore: Number(stats.totalScore.toFixed(2)),
      totalGameKnowledgeScore: Number(stats.totalGameKnowledgeScore.toFixed(2)),
      totalGoalScoringScore: Number(stats.totalGoalScoringScore.toFixed(2)),
      totalAttackScore: Number(stats.totalAttackScore.toFixed(2)),
      totalMidfieldScore: Number(stats.totalMidfieldScore.toFixed(2)),
      totalDefenseScore: Number(stats.totalDefenseScore.toFixed(2)),
      totalFitnessScore: Number(stats.totalFitnessScore.toFixed(2)),
      genderCount: stats.genderCount,
    }
  })

  return { teams: finalTeams, totalPlayersPlaying: validPlayers.length }
}

export default balanceTeams
