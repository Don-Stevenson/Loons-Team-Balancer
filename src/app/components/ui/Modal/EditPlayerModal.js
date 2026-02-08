// components/editPlayerModal
import React, { useState, useEffect } from 'react'
import { Button } from '../Button/Button'

const EditPlayerModal = ({ player, onUpdatePlayer, onClose }) => {
  const [editedPlayer, setEditedPlayer] = useState(player)

  useEffect(() => {
    setEditedPlayer(player)
  }, [player])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedPlayer((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onUpdatePlayer(editedPlayer)
  }

  // Form fields data for cleaner rendering
  const formFields = [
    { name: 'name', label: 'Name', type: 'text' },
    {
      name: 'gameKnowledgeScore',
      label: 'Game Knowledge Score (1-10)',
      type: 'number',
      min: 1,
      max: 10,
    },
    {
      name: 'goalScoringScore',
      label: 'Goal Scoring Score (1-10)',
      type: 'number',
      min: 1,
      max: 10,
    },
    {
      name: 'attackScore',
      label: 'Attack Score (1-10)',
      type: 'number',
      min: 1,
      max: 10,
    },
    {
      name: 'midfieldScore',
      label: 'Midfield Score (1-10)',
      type: 'number',
      min: 1,
      max: 10,
    },
    {
      name: 'defenseScore',
      label: 'Defense Score (1-10)',
      type: 'number',
      min: 1,
      max: 10,
    },
    {
      name: 'fitnessScore',
      label: 'Mobility/Stamina Score (1-10)',
      type: 'number',
      min: 1,
      max: 10,
    },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      data-testid="edit-player-modal"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Edit Player
          </h2>
        </div>

        {/* Scrollable Content */}
        <form
          onSubmit={handleSubmit}
          data-testid="edit-player-form"
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="space-y-3 overflow-y-auto px-4 py-4 sm:space-y-4 sm:px-6">
            {formFields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="mb-1 block text-xs font-semibold text-gray-700 sm:text-sm"
                >
                  {field.label}
                </label>
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={editedPlayer[field.name] || ''}
                  onChange={handleInputChange}
                  min={field.min}
                  max={field.max}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            ))}
          </div>

          {/* Footer - Fixed */}
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
            <div className="flex flex-col items-center justify-around gap-2 sm:flex-row sm:gap-3">
              <Button
                onClick={onClose}
                text="Cancel"
                variant="secondary"
                testid="cancel-button"
                classes="text-sm w-full"
              />
              <Button
                type="submit"
                text="Save Changes"
                variant="primary"
                testid="save-changes-button"
                classes="text-sm w-full"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPlayerModal
