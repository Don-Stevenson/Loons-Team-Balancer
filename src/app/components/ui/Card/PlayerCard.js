import React from 'react'
import { Button } from '../Button/Button'
import { ScoreItem } from './ScoreItem'

const PlayerCard = ({ player, onEditPlayer, onDeletePlayer }) => {
  const scores = [
    { label: 'K', value: player.gameKnowledgeScore },
    { label: 'S', value: player.goalScoringScore },
    { label: 'A', value: player.attackScore },
    { label: 'Md', value: player.midfieldScore },
    { label: 'D', value: player.defenseScore },
    { label: 'M/S', value: player.fitnessScore },
  ]

  return (
    <div className="flex max-h-[6rem] w-full min-w-[16rem] max-w-[17.5rem] items-center justify-between gap-2 rounded border-2 border-gray-200 p-3 hover:border-[#c1d2f1] hover:bg-[#edf2f8]">
      <div className="mx-1 min-w-0 flex-1">
        <div className="mb-1 truncate text-[0.9rem]">{player.name}</div>
        <div className="flex justify-between gap-1">
          {scores.slice(0, 3).map((score, index) => (
            <ScoreItem key={index} label={score.label} value={score.value} />
          ))}
        </div>
        <div className="flex justify-between gap-1">
          {scores.slice(3).map((score, index) => (
            <ScoreItem
              key={index + 3}
              label={score.label}
              value={score.value}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center justify-center gap-1 pt-3.5">
        <Button
          onClick={() => onEditPlayer(player._id)}
          variant="quaternary"
          testId="edit-player"
          text="Edit"
        />
        <Button
          onClick={() => onDeletePlayer(player._id)}
          variant="tertiary"
          testId="delete-player"
          text="Delete"
        />
      </div>
    </div>
  )
}

export default PlayerCard
