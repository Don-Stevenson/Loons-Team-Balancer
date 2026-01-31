import { PulseLoader } from 'react-spinners'
import UpcomingGamesDropDown from './UpcomingGamesDropDown/UpcomingGamesDropDown'

export default function GameSelector({
  upcomingGames,
  selectedGameId,
  queryRsvpsForGame,
  rsvpsLoading,
  players,
  onGameSelect,
  normalizeName,
  gamesError,
  gamesErrorMessage,
}) {
  const handleGameSelect = (gameId) => {
    onGameSelect(gameId)
  }

  return (
    <div className="flex items-center justify-center mt-4 mb-4 print:hidden">
      <div className="flex flex-col justify-center items-center">
        <div className="text-lg mb-4 text-center">
          Choose an upcoming game to see the players RSVP'd from Heja for that
          game
        </div>
        <UpcomingGamesDropDown
          upcomingGames={upcomingGames.map((game) => ({
            value: game._id,
            label: `${game.title} - ${new Date(
              game.meetdate
            ).toLocaleDateString()}`,
          }))}
          onSelect={handleGameSelect}
          gamesError={gamesError}
          gamesErrorMessage={gamesErrorMessage}
        />
        {selectedGameId && (
          <div className="mt-4 items-center justify-center">
            <h3 className="text-xl font-bold text-loonsRed my-6">
              {queryRsvpsForGame.length} Players RSVP'd for this game on Heja
            </h3>
            {rsvpsLoading ? (
              <p className="flex justify-start items-center gap-2 text-gray-700 text-xl py-4">
                Loading RSVPs and updating player list{' '}
                <PulseLoader color="black" size={6} />
              </p>
            ) : queryRsvpsForGame.length > 0 ? (
              <div className="flex flex-col">
                <ul className="list-disc pl-5 grid grid-cols-1 sm:grid-cols-2 gap-2 items-center justify-center">
                  {queryRsvpsForGame
                    .sort((a, b) => a.localeCompare(b))
                    .map((player, index) => {
                      // Check if the player exists in the players list
                      const playerExists = players.some(
                        (p) => normalizeName(p.name) === normalizeName(player)
                      )
                      return (
                        <li
                          key={index}
                          className={`text-gray-700 ${
                            !playerExists
                              ? 'text-loonsRed font-bold bg-red-200 rounded-md p-1 max-w-[16.5rem]'
                              : ''
                          }`}
                        >
                          {player}
                          {!playerExists && (
                            <span className=" text-loonsRed text-[0.6rem] ml-2">
                              * Not in the player list below
                            </span>
                          )}
                        </li>
                      )
                    })}
                </ul>
                {queryRsvpsForGame.some(
                  (player) =>
                    !players.some(
                      (p) => normalizeName(p.name) === normalizeName(player)
                    )
                ) && (
                  <div className="text-red-600 text-xs max-w-sm mt-5">
                    * please double check the player name spelling; the spelling
                    in Heja and in this application must match. Alternately,
                    this player may need to be added to the loons team balancer.
                  </div>
                )}
              </div>
            ) : (
              <p>No players have RSVP'd for this game yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
