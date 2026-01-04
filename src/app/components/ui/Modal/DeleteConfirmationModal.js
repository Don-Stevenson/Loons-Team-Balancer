import React from 'react'
import { Button } from '../Button/Button'

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  playerName,
  isLoading,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="p-6 rounded-lg bg-white w-[260px] sm:w-[350px]">
        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p>Are you sure you want to delete {playerName}?</p>
        <div className="flex flex-col sm:flex-row sm:justify-end justify-between mt-4 gap-2">
          <Button
            onClick={onClose}
            text="Cancel"
            variant="secondary"
            testId="cancel-button"
            classes="text-sm bg-white"
          />
          <Button
            text="Delete"
            onClick={() => {
              onConfirm()
            }}
            variant="primary"
            testId="delete-button"
            isLoading={isLoading}
            classes="text-sm"
          />
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal
