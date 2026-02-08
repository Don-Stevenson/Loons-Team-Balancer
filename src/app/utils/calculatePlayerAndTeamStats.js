const WEIGHTS = {
  gameKnowledge: 0.2,
  goalScoring: 0.2,
  attack: 0.135,
  midfield: 0.133,
  defense: 0.133,
  fitness: 0.1,
}

export const calculatePlayerScore = (player) => {
  return (player.totalScore =
    player.gameKnowledgeScore * WEIGHTS.gameKnowledge +
    player.goalScoringScore * WEIGHTS.goalScoring +
    player.attackScore * WEIGHTS.attack +
    player.midfieldScore * WEIGHTS.midfield +
    player.defenseScore * WEIGHTS.defense +
    player.fitnessScore * WEIGHTS.fitness)
}

export const calculateTeamStats = (team) => {
  const stats = team.players.reduce(
    (acc, player) => {
      const playerScore = calculatePlayerScore(player)
      console.log('playerScore', acc.totalFitnessScore, player.fitnessScore)
      console.log('player', player.name, player.fitnessScore)
      return {
        totalScore: acc.totalScore + playerScore,
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
      }
    },
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
  return { ...team, ...stats }
}
