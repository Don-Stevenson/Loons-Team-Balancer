import { useState } from 'react'
import Select from 'react-select'
import { Button } from '../Button/Button'

export default function AddPlayerModal({
  onAddPlayer,
  onClose,
  isOpen,
  isLoading,
}) {
  const [playerData, setPlayerData] = useState({
    name: '',
    gameKnowledgeScore: '',
    goalScoringScore: '',
    attackScore: '',
    defenseScore: '',
    midfieldScore: '',
    fitnessScore: '',
    gender: '',
    isPlayingThisWeek: true,
  })
  const [error, setError] = useState(null)

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'nonBinary', label: 'Non Binary' },
  ]

  // Form fields data for cleaner rendering
  const formFields = [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'Enter name' },
    {
      name: 'gameKnowledgeScore',
      label: 'Game Knowledge Score (1-10)',
      type: 'number',
      placeholder: '1-10',
      min: 1,
      max: 10,
    },
    {
      name: 'goalScoringScore',
      label: 'Goal Scoring Score (1-10)',
      type: 'number',
      placeholder: '1-10',
      min: 1,
      max: 10,
    },
    {
      name: 'attackScore',
      label: 'Attack Score (1-10)',
      type: 'number',
      placeholder: '1-10',
      min: 1,
      max: 10,
    },
    {
      name: 'midfieldScore',
      label: 'Midfield Score (1-10)',
      type: 'number',
      placeholder: '1-10',
      min: 1,
      max: 10,
    },
    {
      name: 'defenseScore',
      label: 'Defense Score (1-10)',
      type: 'number',
      placeholder: '1-10',
      min: 1,
      max: 10,
    },
    {
      name: 'fitnessScore',
      label: 'Mobility/Stamina Score (1-10)',
      type: 'number',
      placeholder: '1-10',
      min: 1,
      max: 10,
    },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await onAddPlayer(playerData)
      setPlayerData({
        name: '',
        gameKnowledgeScore: '',
        goalScoringScore: '',
        attackScore: '',
        midfieldScore: '',
        defenseScore: '',
        fitnessScore: '',
        gender: '',
        isPlayingThisWeek: true,
      })
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Error. Please double check your input values'
      )
    }
  }

  const handleChange = (e) => {
    setPlayerData({ ...playerData, [e.target.name]: e.target.value })
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Add Player
          </h2>
        </div>

        {/* Scrollable Content */}
        <form
          onSubmit={handleSubmit}
          data-testid="add-player-form"
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
                  data-testid={field.name}
                  name={field.name}
                  value={playerData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  min={field.min}
                  max={field.max}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            ))}

            {/* Gender Select */}
            <div>
              <label
                id="gender-label"
                className="mb-1 block text-xs font-semibold text-gray-700 sm:text-sm"
              >
                Gender
              </label>
              <Select
                name="gender"
                aria-labelledby="gender-label"
                options={genderOptions}
                className="text-xs sm:text-sm"
                value={genderOptions.find(
                  (option) => option.value === playerData.gender
                )}
                onChange={(selectedOption) =>
                  setPlayerData({
                    ...playerData,
                    gender: selectedOption ? selectedOption.value : '',
                  })
                }
                placeholder="Select Gender"
                isClearable
                required
              />
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
            <div className="flex flex-col-reverse items-center justify-around gap-2 sm:flex-row sm:gap-3">
              <Button
                onClick={onClose}
                text="Cancel"
                variant="secondary"
                testId="cancel-button"
                isLoading={isLoading}
                classes="text-sm w-full sm:w-auto"
              />
              <Button
                type="submit"
                text="Add Player"
                variant="primary"
                testId="add-player-button"
                isLoading={isLoading}
                classes="text-sm w-full sm:w-auto"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
