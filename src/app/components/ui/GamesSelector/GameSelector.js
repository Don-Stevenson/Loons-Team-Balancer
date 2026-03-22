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
    <div className="mb-4 mt-4 flex w-full items-center justify-center print:hidden">
      <div className="flex flex-col items-center justify-center">
        <div className="mb-4 text-center text-lg">
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
            <h3 className="my-6 text-center text-xl font-bold text-loonsRed">
              {queryRsvpsForGame.length} Players RSVP'd for this game on Heja
            </h3>
            {rsvpsLoading ? (
              <p className="flex items-center justify-start gap-2 py-4 text-xl text-gray-700">
                Loading RSVPs and updating player list{' '}
                <PulseLoader color="black" size={6} />
              </p>
            ) : queryRsvpsForGame.length > 0 ? (
              <div className="flex flex-col items-center justify-center">
                <ul className="grid list-disc grid-cols-1 items-center justify-center gap-y-2 pl-5 sm:grid-cols-3 sm:gap-x-7 md:grid-cols-4 md:gap-x-10">
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
                              ? 'max-w-[16.5rem] rounded-md bg-red-200 p-1 font-bold text-loonsRed'
                              : ''
                          }`}
                        >
                          {player}
                          {!playerExists && (
                            <span className="ml-2 text-[0.6rem] text-loonsRed">
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
                  <div className="mt-5 max-w-sm text-xs text-red-600">
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
