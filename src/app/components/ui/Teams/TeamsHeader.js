import { getTeamName } from '../../../utils/getTeamName'

const TeamHeader = ({ team, index, balancedTeams, parsedCustomColours, customColourInput }) => {
  return (
    <>
      <h3 className="text-xl text-black font-semibold print:text-lg print:mb-[2px] text-center">
        {getTeamName(index, balancedTeams, parsedCustomColours, customColourInput)}
      </h3>
      <p className="text-sm print:hidden underline">Team Totals</p>
      <p className="pb-1 print:hidden text-xxs xs:text-sm">
        Team Score: {team.totalScore?.toFixed(1)}
      </p>
      <p className="text-xxs xs:text-xs print:hidden">
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
