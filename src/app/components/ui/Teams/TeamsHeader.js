import { getTeamName } from '../../../utils/getTeamName'

const TeamHeader = ({
  team,
  index,
  balancedTeams,
  parsedCustomColours,
  customColourInput,
}) => {
  return (
    <>
      <h3 className="text-center text-xl font-semibold text-black print:mb-[2px] print:text-lg">
        {getTeamName(
          index,
          balancedTeams,
          parsedCustomColours,
          customColourInput
        )}
      </h3>
      <p className="text-sm underline print:hidden">Team Totals</p>
      <p className="pb-1 text-xxs xs:text-sm print:hidden">
        Team Score: {team.totalScore?.toFixed(2)}
      </p>
      <p className="text-xxs xs:text-xs print:flex print:items-center print:justify-center">
        No of Players:{' '}
        {team.genderCount.male +
          team.genderCount.female +
          team.genderCount.nonBinary}
      </p>
      <p className="text-xxs xs:text-xs print:hidden">
        Gender Count: Male - {team.genderCount.male}, Female -{' '}
        {team.genderCount.female}
        {team.genderCount.nonBinary
          ? `, Non Binary - ${team.genderCount.nonBinary}`
          : ''}
      </p>
    </>
  )
}

export default TeamHeader
