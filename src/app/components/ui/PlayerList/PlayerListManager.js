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
        <h2 className="mb-4 text-center text-2xl font-bold text-loonsDarkBrown print:hidden">
          Player List
        </h2>
        <div className="sticky top-0 z-10 mb-4 flex justify-center print:hidden">
          <span className="relative rounded-lg bg-white p-2 text-xl font-bold opacity-70">
            <p clasname=" text-gray-800">
              {`Total Players Selected: ${selectedPlayerCount}`}
            </p>
          </span>
        </div>
        <div className="mb-4 flex items-center justify-center">
          <Button
            variant="primary"
            onClick={onTogglePlayerList}
            text={openPlayerList ? 'Hide Player List' : 'Show Player List'}
            testId="toggle-player-list-button"
          />
        </div>
        {openPlayerList && (
          <>
            <div className="mb-4 flex justify-center print:hidden">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-loonsRed"
                  checked={selectAll}
                  onChange={onSelectAll}
                  disabled={bulkUpdateMutation.isPending}
                />
                <span className="ml-2 text-sm text-gray-700">
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
