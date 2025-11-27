import HoverPlayerStats from '../HoverPlayerStats/HoverPlayerStats'

const TeamsPlayerList = ({
  team,
  teamIndex,
  handleDragStart,
  handleDragEnd,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  hoveredPlayer,
  handleMouseEnter,
  handleMouseLeave,
}) => {
  return (
    <ul className="list-disc pl-5 print:pl-4 print:mt-1 print:list-none relative">
      {team.players
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((player, playerIndex) => (
          <li
            key={`${player.name}-${playerIndex}`}
            draggable="true"
            onDragStart={e =>
              handleDragStart(e, teamIndex, playerIndex, player._id)
            }
            onDragEnd={handleDragEnd}
            onTouchStart={e =>
              handleTouchStart(e, teamIndex, playerIndex, player._id)
            }
            onTouchMove={e => handleTouchMove(e, teamIndex)}
            onTouchEnd={e => handleTouchEnd(e, teamIndex)}
            onMouseEnter={() => handleMouseEnter(player)}
            onMouseLeave={handleMouseLeave}
            className="list-disc ml-4 border-[2.5px] border-transparent hover:border-indigo-300 max-w-[190px] rounded px-1 print:border-0 print:max-w-none print:text-xl cursor-grab active:cursor-grabbing relative"
          >
            {player.name}
            {hoveredPlayer && hoveredPlayer === player && (
              <HoverPlayerStats hoveredPlayer={hoveredPlayer} />
            )}
          </li>
        ))}
    </ul>
  )
}

export default TeamsPlayerList
