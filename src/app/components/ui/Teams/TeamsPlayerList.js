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
    <ul className="relative list-disc pl-5 print:mt-1 print:list-none print:pl-4">
      {team.players
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((player, playerIndex) => (
          <li
            key={`${player.name}-${playerIndex}`}
            draggable="true"
            onDragStart={(e) =>
              handleDragStart(e, teamIndex, playerIndex, player._id)
            }
            onDragEnd={handleDragEnd}
            onTouchStart={(e) =>
              handleTouchStart(e, teamIndex, playerIndex, player._id)
            }
            onTouchMove={(e) => handleTouchMove(e, teamIndex)}
            onTouchEnd={(e) => handleTouchEnd(e, teamIndex)}
            onContextMenu={(e) => e.preventDefault()}
            onMouseEnter={() => handleMouseEnter(player)}
            onMouseLeave={handleMouseLeave}
            className="relative ml-4 max-w-[190px] cursor-grab select-none list-disc rounded border-[2.5px] border-transparent px-1 [-webkit-touch-callout:none] [-webkit-user-select:none] [touch-action:pan-y] hover:border-indigo-300 active:cursor-grabbing print:max-w-none print:border-0 print:text-xl"
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
