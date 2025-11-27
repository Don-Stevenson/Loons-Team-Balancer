const TeamStats = ({ team, index, totalTeams }) => {
  const getTeamColorClasses = (index, totalTeams) => {
    const isThreeColorSystem = totalTeams === 3

    if (isThreeColorSystem) {
      const colorIndex = index % 3

      if (colorIndex === 0) {
        return 'border-red-300 bg-red-100'
      }
      if (colorIndex === 1) {
        return 'border-gray-400 bg-gray-100'
      }
      return 'border-gray-800 bg-white'
    }

    return index % 2 === 0
      ? 'border-red-300 bg-red-100'
      : 'border-gray-400 bg-gray-100'
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 mt-2 print:hidden">
      <div className="flex flex-col gap-2 print:flex-col">
        <div
          className={`flex justify-between border gap-1 ${getTeamColorClasses(
            index,
            totalTeams
          )} rounded py-1 px-3`}
        >
          <p className="text-xxs">Game Knowledge:</p>
          <p className="text-xxs">{team.totalGameKnowledgeScore}</p>
        </div>
        <div
          className={`flex justify-between border gap-1 ${getTeamColorClasses(
            index,
            totalTeams
          )}
          } rounded py-1 px-3`}
        >
          <p className="text-xxs">Goal Scoring:</p>
          <p className="text-xxs">{team.totalGoalScoringScore}</p>
        </div>
        <div
          className={`flex justify-between border gap-1 ${getTeamColorClasses(
            index,
            totalTeams
          )} rounded py-1 px-3`}
        >
          <p className="text-xxs">Attack:</p>
          <p className="text-xxs">{team.totalAttackScore}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 print:flex-col">
        <div
          className={`flex justify-between border gap-1 ${getTeamColorClasses(
            index,
            totalTeams
          )} rounded py-1 px-3`}
        >
          <p className="text-xxs">Midfield:</p>
          <p className="text-xxs">{team.totalMidfieldScore}</p>
        </div>
        <div
          className={`flex justify-between border gap-1 ${getTeamColorClasses(
            index,
            totalTeams
          )} rounded py-1 px-3`}
        >
          <p className="text-xxs">Defense:</p>
          <p className="text-xxs">{team.totalDefenseScore}</p>
        </div>
        <div
          className={`flex border justify-between ${getTeamColorClasses(
            index,
            totalTeams
          )} rounded py-1 px-3`}
        >
          <p className="text-xxs">Mobility/Stamina:</p>
          <p className="text-xxs">{team.fitnessScore}</p>
        </div>
      </div>
    </div>
  )
}

export default TeamStats
