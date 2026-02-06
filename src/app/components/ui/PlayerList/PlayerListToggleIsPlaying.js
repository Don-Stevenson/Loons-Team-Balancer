import React from 'react'

const PlayerListToggleIsPlaying = ({ players, onTogglePlayingThisWeek }) => {
  const sortedPlayers = [...players].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const playersByInitial = sortedPlayers.reduce((acc, player) => {
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
        <div key={initial} className="flex flex-col gap-1 print:hidden">
          <div className="px-2 text-2xl font-bold text-slate-700">
            {initial}
          </div>
          <ul className="grid w-full grid-cols-[repeat(auto-fill,_minmax(15rem,_1fr))] gap-4 p-2 xl:grid-cols-[repeat(auto-fill,_minmax(16rem,_max-content))]">
            {playersByInitial[initial].map((player) => (
              <button
                key={player._id}
                className={`flex w-full min-w-[15rem] max-w-[20rem] cursor-pointer items-center gap-4 rounded border-2 border-gray-300 p-3 hover:border-[#b1c1de] ${
                  player.isPlayingThisWeek ? 'bg-gray-100' : 'bg-gray-200'
                }`}
                onClick={() => onTogglePlayingThisWeek(player._id)}
              >
                <div className="min-w-0 flex-1">
                  <span
                    className={`block cursor-pointer truncate ${
                      player.isPlayingThisWeek ? 'text-black' : 'text-gray-500'
                    }`}
                    title={player.name}
                  >
                    {player.name}
                  </span>
                </div>
                <span className="onClick={() => onTogglePlayingThisWeek(player._id)} flex flex-shrink-0 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={player.isPlayingThisWeek}
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    readOnly
                  />
                  <p
                    className={`whitespace-nowrap text-xs ${
                      player.isPlayingThisWeek ? 'text-black' : 'text-gray-500'
                    }`}
                  >
                    Playing
                  </p>
                </span>
              </button>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
export default PlayerListToggleIsPlaying
