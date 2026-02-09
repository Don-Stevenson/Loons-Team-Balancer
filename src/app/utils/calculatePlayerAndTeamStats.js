const WEIGHTS = {
  gameKnowledge: 0.235,
  goalScoring: 0.233,
  attack: 0.133,
  midfield: 0.133,
  defense: 0.133,
  fitness: 0.133,
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
  return {
    ...team,
    ...stats,
    totalScore: Number(stats.totalScore.toFixed(2)),
    totalGameKnowledgeScore: Number(stats.totalGameKnowledgeScore.toFixed(2)),
    totalGoalScoringScore: Number(stats.totalGoalScoringScore.toFixed(2)),
    totalAttackScore: Number(stats.totalAttackScore.toFixed(2)),
    totalMidfieldScore: Number(stats.totalMidfieldScore.toFixed(2)),
    totalDefenseScore: Number(stats.totalDefenseScore.toFixed(2)),
    totalFitnessScore: Number(stats.totalFitnessScore.toFixed(2)),
  }
}
