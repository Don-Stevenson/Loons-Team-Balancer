// components/editPlayerModal
import React, { useState, useEffect } from 'react'
import { Button } from '../Button/Button'

const EditPlayerModal = ({ player, onUpdatePlayer, onClose }) => {
  const [editedPlayer, setEditedPlayer] = useState(player)

  useEffect(() => {
    setEditedPlayer(player)
  }, [player])

  const handleInputChange = e => {
    const { name, value } = e.target
    setEditedPlayer(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = e => {
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      data-testid="edit-player-modal"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Edit Player
          </h2>
        </div>

        {/* Scrollable Content */}
        <form
          onSubmit={handleSubmit}
          data-testid="edit-player-form"
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="overflow-y-auto px-4 sm:px-6 py-4 space-y-3 sm:space-y-4">
            {formFields.map(field => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="block text-gray-700 font-semibold mb-1 text-xs sm:text-sm"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            ))}
          </div>

          {/* Footer - Fixed */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-around items-center gap-2 sm:gap-3">
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
