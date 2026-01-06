import { Button } from '../Button/Button'
import PlayerListToggleIsPlaying from './PlayerListToggleIsPlaying'
import { lazy, Suspense } from 'react'

const LoadingPlayers = lazy(() => import('../Loading/LoadingPlayers'))

export default function PlayerListManager({
  players,
  selectedPlayerCount,
  selectAll,
  openPlayerList,
  queryRsvpsForGame,
  bulkUpdateMutation,
  onTogglePlayingThisWeek,
  onSelectAll,
  onTogglePlayerList,
}) {
  return (
    <div className="print:hidden">
      <div className="flex-col flex-wrap">
        <h2 className="text-2xl text-center font-bold mb-4 print:hidden text-loonsDarkBrown">
          Player List
        </h2>
        <div className="flex mb-4 print:hidden sticky top-0 z-10 justify-center">
          <span className="font-bold text-xl bg-white p-2 rounded-lg opacity-70 relative">
            <p clasname=" text-gray-800">
              {`Total Players Selected: ${selectedPlayerCount}`}
            </p>
          </span>
        </div>
        <div className="flex justify-center items-center mb-4">
          <Button
            variant="primary"
            onClick={onTogglePlayerList}
            text={openPlayerList ? 'Hide Player List' : 'Show Player List'}
            testId="toggle-player-list-button"
          />
        </div>
        {openPlayerList && (
          <>
            <div className="flex justify-center mb-4 print:hidden">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-loonsRed"
                  checked={selectAll}
                  onChange={onSelectAll}
                  disabled={bulkUpdateMutation.isPending}
                />
                <span className="ml-2 text-gray-700 text-sm">
                  Toggle All Players Playing / Not Playing
                </span>
              </label>
            </div>
            {players.length !== 0 && (
              <Suspense fallback={<LoadingPlayers />}>
                <PlayerListToggleIsPlaying
                  players={players}
                  rsvpsForGame={queryRsvpsForGame}
                  onTogglePlayingThisWeek={onTogglePlayingThisWeek}
                />
              </Suspense>
            )}
          </>
        )}
      </div>
    </div>
  )
}
