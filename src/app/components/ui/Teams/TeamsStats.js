const TeamStats = ({ team }) => {
  const statsClasses =
    'flex justify-between border gap-1 border-gray-400 bg-gray-100 rounded py-1 px-3'
  return (
    <div className="mt-2 grid grid-cols-1 gap-2 xs:grid-cols-2 print:hidden">
      <div className="flex flex-col gap-2 print:flex-col">
        <div className={statsClasses}>
          <p className="text-xxs">Game Knowledge:</p>
          <p className="text-xxs">{team.totalGameKnowledgeScore}</p>
        </div>
        <div className={statsClasses}>
          <p className="text-xxs">Goal Scoring:</p>
          <p className="text-xxs">{team.totalGoalScoringScore}</p>
        </div>
        <div className={statsClasses}>
          <p className="text-xxs">Attack:</p>
          <p className="text-xxs">{team.totalAttackScore}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 print:flex-col">
        <div className={statsClasses}>
          <p className="text-xxs">Midfield:</p>
          <p className="text-xxs">{team.totalMidfieldScore}</p>
        </div>
        <div className={statsClasses}>
          <p className="text-xxs">Defense:</p>
          <p className="text-xxs">{team.totalDefenseScore}</p>
        </div>
        <div className={statsClasses}>
          <p className="text-xxs">Mobility/Stamina:</p>
          <p className="text-xxs">{team.fitnessScore}</p>
        </div>
      </div>
    </div>
  )
}

export default TeamStats
