import { useState, useRef } from 'react'
import { calculateTeamStats } from '../../../utils/teamStats'
import TeamHeader from './TeamsHeader'
import TeamStats from './TeamsStats'
import TeamsPlayerList from './TeamsPlayerList'
import GameMeetDate, { todaysDate } from '../GamesSelector/GameMeetDate'

// Custom hook for drag and drop functionality (supports both mouse and touch)
const useDragAndDrop = (balancedTeams, setBalancedTeams) => {
  const [draggedPlayer, setDraggedPlayer] = useState(null)
  const [touchState, setTouchState] = useState({
    isDragging: false,
    startY: 0,
    startX: 0,
    currentElement: null,
    ghostElement: null,
  })
  const autoScrollIntervalRef = useRef(null)

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

    e.currentTarget.classList.add('drag-over-highlight')
  }

  const handleDragLeave = e => {
    e.currentTarget.classList.remove('drag-over-highlight')
  }

  const handleDrop = (e, destTeamIndex) => {
    e.preventDefault()

    e.currentTarget.classList.remove('drag-over-highlight')

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

  // Touch event handlers for mobile
  const handleTouchStart = (e, teamIndex, playerIndex, playerId) => {
    const touch = e.touches[0]
    const element = e.currentTarget

    // Only start drag if it's a long press (will be handled in touchmove)
    // Store initial position to detect if it's a scroll or drag
    setTouchState({
      isDragging: false,
      startY: touch.clientY,
      startX: touch.clientX,
      currentElement: element,
      ghostElement: null,
      teamIndex,
      playerIndex,
      playerId,
    })

    // Store the dragged player info
    setDraggedPlayer({ teamIndex, playerIndex, playerId })
  }

  const handleTouchMove = (e, teamIndex) => {
    // Don't interfere if we don't have touch state initialized
    if (!touchState.currentElement || touchState.startY === 0) {
      return
    }

    const touch = e.touches[0]
    if (!touch) return

    // Calculate movement distance
    const deltaY = Math.abs(touch.clientY - touchState.startY)
    const deltaX = Math.abs(touch.clientX - touchState.startX)

    // If moved more than 15px, determine if it's a drag or scroll
    if (!touchState.isDragging && (deltaY > 15 || deltaX > 15)) {
      // If horizontal movement is dominant (60% more horizontal than vertical), it's a drag
      if (deltaX > deltaY * 1.6) {
        e.preventDefault() // Prevent scrolling only when dragging

        // Create ghost element
        const ghostElement = touchState.currentElement.cloneNode(true)
        ghostElement.id = 'touch-drag-ghost'
        ghostElement.style.position = 'fixed'
        ghostElement.style.zIndex = '9999'
        ghostElement.style.pointerEvents = 'none'
        ghostElement.style.opacity = '0.8'
        ghostElement.style.transform = 'scale(1.05)'
        ghostElement.style.transition = 'none'
        ghostElement.style.width = `${touchState.currentElement.offsetWidth}px`
        ghostElement.style.left = `${
          touch.clientX - touchState.currentElement.offsetWidth / 2
        }px`
        ghostElement.style.top = `${
          touch.clientY - touchState.currentElement.offsetHeight / 2
        }px`
        document.body.appendChild(ghostElement)

        setTouchState(prev => ({ ...prev, isDragging: true, ghostElement }))

        // Add visual feedback to original element
        if (touchState.currentElement) {
          touchState.currentElement.classList.add('opacity-30')
          touchState.currentElement.classList.add('border-indigo-500')
        }
      } else {
        // Vertical movement - clear state and allow scrolling
        // Clear auto-scroll interval if it exists
        if (autoScrollIntervalRef.current) {
          clearInterval(autoScrollIntervalRef.current)
          autoScrollIntervalRef.current = null
        }
        setTouchState({
          isDragging: false,
          startY: 0,
          startX: 0,
          currentElement: null,
          ghostElement: null,
        })
        setDraggedPlayer(null)
        return
      }
    }

    // Continue dragging
    if (touchState.isDragging) {
      e.preventDefault() // Prevent scrolling while dragging

      // Update ghost element position
      if (touchState.ghostElement) {
        touchState.ghostElement.style.left = `${
          touch.clientX - touchState.ghostElement.offsetWidth / 2
        }px`
        touchState.ghostElement.style.top = `${
          touch.clientY - touchState.ghostElement.offsetHeight / 2
        }px`
      }

      // Auto-scroll logic: scroll the page when near edges
      const scrollThreshold = 80 // pixels from edge to trigger scroll
      const scrollSpeed = 8 // pixels per frame
      const viewportHeight = window.innerHeight

      // Clear any existing auto-scroll interval
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
        autoScrollIntervalRef.current = null
      }

      // Check if touch is near top or bottom edge
      if (touch.clientY < scrollThreshold) {
        // Near top - scroll up
        autoScrollIntervalRef.current = setInterval(() => {
          window.scrollBy(0, -scrollSpeed)
        }, 16) // ~60fps
      } else if (touch.clientY > viewportHeight - scrollThreshold) {
        // Near bottom - scroll down
        autoScrollIntervalRef.current = setInterval(() => {
          window.scrollBy(0, scrollSpeed)
        }, 16) // ~60fps
      }

      // Find the team container under the touch point
      const elementAtPoint = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      )
      const teamContainer = elementAtPoint?.closest('[data-team-drop-zone]')

      // Remove highlight from all team containers
      document.querySelectorAll('[data-team-drop-zone]').forEach(el => {
        el.classList.remove('drag-over-highlight')
      })

      // Add highlight to the current team container
      if (teamContainer) {
        teamContainer.classList.add('drag-over-highlight')
      }
    }
  }

  const handleTouchEnd = (e, currentTeamIndex) => {
    // Clear auto-scroll interval
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current)
      autoScrollIntervalRef.current = null
    }

    // Clean up visual feedback if exists
    if (touchState.currentElement) {
      touchState.currentElement.classList.remove('opacity-30')
      touchState.currentElement.classList.remove('opacity-50')
      touchState.currentElement.classList.remove('border-indigo-500')
    }

    // Remove ghost element
    if (touchState.ghostElement) {
      touchState.ghostElement.remove()
    }

    // Remove highlight from all team containers
    document.querySelectorAll('[data-team-drop-zone]').forEach(el => {
      el.classList.remove('drag-over-highlight')
    })

    if (!touchState.isDragging) {
      // It was just a tap, not a drag
      setDraggedPlayer(null)
      setTouchState({
        isDragging: false,
        startY: 0,
        startX: 0,
        currentElement: null,
        ghostElement: null,
      })
      return
    }

    // Get the last touch position
    const touch = e.changedTouches[0]
    if (!touch) {
      // Reset state if no touch data
      setDraggedPlayer(null)
      setTouchState({
        isDragging: false,
        startY: 0,
        startX: 0,
        currentElement: null,
        ghostElement: null,
      })
      return
    }

    // Find the team container under the touch point
    const elementAtPoint = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    )
    const teamContainer = elementAtPoint?.closest('[data-team-drop-zone]')

    if (teamContainer && draggedPlayer) {
      const destTeamIndex = parseInt(
        teamContainer.getAttribute('data-team-index'),
        10
      )
      const sourceTeamIndex = draggedPlayer.teamIndex
      const playerIndex = draggedPlayer.playerIndex

      if (sourceTeamIndex !== destTeamIndex) {
        // Create a copy of teams to work with
        const newBalancedTeams = Array.from(balancedTeams)

        const movedPlayer =
          newBalancedTeams[sourceTeamIndex].players[playerIndex]

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
    }

    setDraggedPlayer(null)
    setTouchState({
      isDragging: false,
      startY: 0,
      startX: 0,
      currentElement: null,
      ghostElement: null,
    })
  }

  return {
    draggedPlayer,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
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
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
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
                data-team-drop-zone="true"
                data-team-index={actualIndex}
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
                  handleTouchStart={handleTouchStart}
                  handleTouchMove={handleTouchMove}
                  handleTouchEnd={handleTouchEnd}
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
