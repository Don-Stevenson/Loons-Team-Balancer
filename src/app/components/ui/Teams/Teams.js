import { useState, useRef } from 'react'
import { calculateTeamStats } from '../../../utils/teamStats'
import TeamHeader from './TeamsHeader'
import TeamStats from './TeamsStats'
import TeamsPlayerList from './TeamsPlayerList'
import GameMeetDate, { todaysDate } from '../GamesSelector/GameMeetDate'

// Custom hook for drag and drop functionality
const useDragAndDrop = (balancedTeams, setBalancedTeams) => {
  const [draggedPlayer, setDraggedPlayer] = useState(null)

  const handleDragStart = (e, teamIndex, playerIndex, playerId) => {
    // Store the dragged player info
    setDraggedPlayer({ teamIndex, playerIndex, playerId })

    // Add visual feedback
    e.target.classList.add('opacity-50')
    e.target.classList.add('border-indigo-500')

    // Set the drag data
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ teamIndex, playerIndex, playerId })
    )
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = e => {
    e.target.classList.remove('opacity-50')
    e.target.classList.remove('border-indigo-500')

    setDraggedPlayer(null)
  }

  const handleDragOver = (e, teamIndex) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    e.currentTarget.classList.add('border-indigo-400')
  }

  const handleDragLeave = e => {
    e.currentTarget.classList.remove('border-indigo-400')
  }

  const handleDrop = (e, destTeamIndex) => {
    e.preventDefault()

    e.currentTarget.classList.remove('border-indigo-400')

    const { teamIndex: sourceTeamIndex, playerIndex } = draggedPlayer

    if (sourceTeamIndex === destTeamIndex) return

    // Create a copy of teams to work with
    const newBalancedTeams = Array.from(balancedTeams)

    const movedPlayer = newBalancedTeams[sourceTeamIndex].players[playerIndex]

    newBalancedTeams[sourceTeamIndex].players.splice(playerIndex, 1)

    newBalancedTeams[destTeamIndex].players.push(movedPlayer)

    newBalancedTeams[sourceTeamIndex] = calculateTeamStats(
      newBalancedTeams[sourceTeamIndex]
    )
    newBalancedTeams[destTeamIndex] = calculateTeamStats(
      newBalancedTeams[destTeamIndex]
    )

    setBalancedTeams(newBalancedTeams)
  }

  return {
    draggedPlayer,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}

const Teams = ({
  balancedTeams,
  setBalancedTeams,
  totalPlayers,
  selectedGameInfo,
}) => {
  const [hoveredPlayer, setHoveredPlayer] = useState(null)
  const hoverTimeoutRef = useRef(null)

  const handleMouseEnter = player => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    // Set a new timeout to show the player stats after 0.5 seconds
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredPlayer(player)
    }, 500)
  }

  const handleMouseLeave = () => {
    // Clear the timeout if mouse leaves before 0.5 seconds
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    // Hide the player stats immediately
    setHoveredPlayer(null)
  }

  const {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop(balancedTeams, setBalancedTeams)

  const getTeamColorClasses = (index, totalTeams) => {
    const isThreeColorSystem = totalTeams === 3

    if (isThreeColorSystem) {
      const colorIndex = index % 3

      if (colorIndex === 0) {
        return 'border-loonsRed bg-red-200 print:bg-red-100'
      }
      if (colorIndex === 1) {
        return 'border-gray-500 bg-gray-200 print:bg-gray-100'
      }
      return 'border-gray-800 bg-white print:bg-gray-50'
    }

    return index % 2 === 0
      ? 'border-loonsRed bg-red-200 print:bg-red-100'
      : 'border-gray-500 bg-gray-200 print:bg-gray-100'
  }

  const getTeamName = index => {
    const totalTeams = balancedTeams.length

    if (totalTeams === 3) {
      const colorIndex = index % 3
      if (colorIndex === 0) return 'Red Team'
      if (colorIndex === 1) return 'Black Team'
      if (colorIndex === 2) return 'White Team'
    }

    if (totalTeams === 2) {
      return index === 0 ? 'Red Team' : 'Black Team'
    }

    const isRedTeam = index % 2 === 0
    const teamNumber = Math.floor(index / 2) + 1
    const color = isRedTeam ? 'Red' : 'Black'

    return `${color} Team ${teamNumber}`
  }

  const hasLargeTeams = balancedTeams.some(team => team.players.length > 12)

  const teamsPerPage = hasLargeTeams ? 2 : 4

  const totalPages = Math.ceil(balancedTeams.length / teamsPerPage)

  const teamGroups = []
  for (let i = 0; i < totalPages; i++) {
    const startIdx = i * teamsPerPage
    const endIdx = Math.min(startIdx + teamsPerPage, balancedTeams.length)
    teamGroups.push(balancedTeams.slice(startIdx, endIdx))
  }

  return (
    <>
      {/* Game name for print - only visible when printing */}
      {selectedGameInfo && (
        <div className="print:block text-center mb-6">
          <h2 className="text-2xl font-bold text-black">
            {selectedGameInfo?.title ? (
              selectedGameInfo.title
            ) : (
              <div className="text-red-500 text-lg print:hidden">
                No game selected{' '}
              </div>
            )}
          </h2>
        </div>
      )}
      <div className="print:block text-center mb-6">
        {selectedGameInfo?.meetdate ? (
          <GameMeetDate meetdate={selectedGameInfo?.meetdate} />
        ) : (
          <GameMeetDate meetdate={todaysDate} />
        )}
      </div>
      <div className="flex justify-center mb-4 flex-wrap text-xl print:hidden text-center sm:text-start">
        Total Number of People Playing: {totalPlayers}
      </div>
      {teamGroups.map((group, pageIndex) => (
        <div
          key={pageIndex}
          className={`grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto px-4 print:grid-cols-2 print:gap-1 print:max-w-none print:px-0 print:py-0 print:m-0 ${
            pageIndex > 0 ? 'print:break-before-page' : ''
          }`}
        >
          {group.map((team, index) => {
            const actualIndex = pageIndex * teamsPerPage + index

            return (
              <div
                key={actualIndex}
                className={`flex flex-col p-2 rounded max-w-[600px] border-4 print:w-full print:p-1 print:text-sm print:border-1 ${getTeamColorClasses(
                  actualIndex,
                  balancedTeams.length
                )}`}
                onDragOver={e => handleDragOver(e, actualIndex)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, actualIndex)}
              >
                <TeamHeader
                  team={team}
                  index={actualIndex}
                  getTeamName={getTeamName}
                />
                <TeamStats
                  team={team}
                  index={actualIndex}
                  totalTeams={balancedTeams.length}
                />
                <h4 className="font-semibold mt-2 print:hidden">
                  {getTeamName(actualIndex)} Players:
                </h4>
                <TeamsPlayerList
                  team={team}
                  teamIndex={actualIndex}
                  handleDragStart={handleDragStart}
                  handleDragEnd={handleDragEnd}
                  hoveredPlayer={hoveredPlayer}
                  handleMouseEnter={handleMouseEnter}
                  handleMouseLeave={handleMouseLeave}
                />
              </div>
            )
          })}
        </div>
      ))}
    </>
  )
}

export default Teams
