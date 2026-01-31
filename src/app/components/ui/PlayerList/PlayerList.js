import React from 'react'
import PlayerCard from '../Card/PlayerCard'

const PlayerList = ({ players, onEditPlayer, onDeletePlayer }) => {
  const playersByInitial = players.reduce((acc, player) => {
    const initial = player.name.charAt(0).toUpperCase()
    if (!acc[initial]) {
      acc[initial] = []
    }
    acc[initial].push(player)
    return acc
  }, {})

  const sortedInitials = Object.keys(playersByInitial).sort()

  return (
    <div className="flex flex-col gap-4">
      {sortedInitials.map((initial) => (
        <div key={initial} className="flex flex-col gap-1">
          <div className="text-2xl font-bold text-slate-700 px-2">
            {initial}
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,_minmax(16rem,_1fr))] xl:grid-cols-[repeat(auto-fill,_minmax(17.5rem,_max-content))] gap-4 w-full p-2">
            {playersByInitial[initial].map((player) => (
              <PlayerCard
                key={player._id}
                player={player}
                onEditPlayer={onEditPlayer}
                onDeletePlayer={onDeletePlayer}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default PlayerList
