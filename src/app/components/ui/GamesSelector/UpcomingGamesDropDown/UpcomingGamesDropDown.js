import React, { useState, useRef, useEffect } from 'react'
import ChevronDownIcon from '../../Chevron/ChevronDownIcon'

const UpcomingGamesDropDown = ({
  upcomingGames,
  onSelect,
  gamesError,
  gamesErrorMessage,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState('')
  const dropdownRef = useRef(null)

  const handleTriggerClick = () => {
    setIsOpen(!isOpen)
  }

  const handleOptionClick = (option) => {
    setSelectedValue(option.label)
    setIsOpen(false)
    onSelect(option.value)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div
      className="z-50 w-[80%] rounded-md border-[1px] border-black px-3 py-1 md:w-[65%] lg:w-[75%]"
      ref={dropdownRef}
    >
      <button
        onClick={handleTriggerClick}
        className="flex w-full items-center justify-between text-lg font-bold text-black"
      >
        {selectedValue || 'Select an upcoming game'}
        <ChevronDownIcon />
      </button>
      {isOpen && (
        <ul className="absolute left-1/2 z-50 mt-1 w-[80%] max-w-[450px] -translate-x-1/2 rounded-md border border-black bg-white shadow-lg md:w-[60%] lg:w-[40%]">
          {gamesError ? (
            <li className="flex w-full items-center gap-2 rounded-md bg-red-50 px-4 py-3 text-red-600">
              <div className="mb-1 text-center font-semibold">
                ⚠️ Heja Service Unavailable
              </div>
              <div className="text-sm">
                {gamesErrorMessage || 'Please try again later.'}
              </div>
            </li>
          ) : upcomingGames.length === 0 ? (
            <li className="px-4 py-3 text-gray-600">
              No upcoming games available
            </li>
          ) : (
            upcomingGames.map((game) => (
              <li
                className="w-full cursor-pointer list-inside list-disc rounded-md border-2 border-white px-4 hover:border-2 hover:bg-[#cedaf0]"
                key={game.value}
                onClick={() => handleOptionClick(game)}
              >
                {game.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

export default UpcomingGamesDropDown
