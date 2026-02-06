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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[260px] rounded-lg bg-white p-6 sm:w-[350px]">
        <h2 className="mb-4 text-xl font-bold">Confirm Deletion</h2>
        <p>Are you sure you want to delete {playerName}?</p>
        <div className="mt-4 flex flex-col justify-between gap-2 sm:flex-row sm:justify-end">
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
