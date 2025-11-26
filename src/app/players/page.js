'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import PlayerList from '../components/ui/PlayerList/PlayerList.js'
import EditPlayerModal from '../components/ui/Modal/EditPlayerModal.js'
import api from '../../../utils/FEapi.js'
import withAuth from '../components/features/auth/withAuthWrapper.js'
import DeleteConfirmationModal from '../components/ui/Modal/DeleteConfirmationModal.js'
import AddPlayerModal from '../components/ui/Modal/AddPlayerModal.js'
import { PulseLoader } from 'react-spinners'
// React Query hooks for background caching only
import {
  usePlayers,
  useCreatePlayer,
  useUpdatePlayer,
  useDeletePlayer,
} from '../hooks/useApi.js'
import { Button } from '../components/ui/Button/Button.js'

function Players() {
  // React Query hooks working silently in background for caching
  usePlayers()
  useCreatePlayer()
  useUpdatePlayer()
  useDeletePlayer()

  const [players, setPlayers] = useState([])
  const [playerToEdit, setPlayerToEdit] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false)
  const [showLoadingMessage, setShowLoadingMessage] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)

  const [successMessage, setSuccessMessage] = useState(null)

  const [deleteState, setDeleteState] = useState({
    isDeleting: false,
    playerToDelete: null,
  })

  const lastFetchRef = useRef(0)
  const fetchTimeoutRef = useRef(null)
  const FETCH_COOLDOWN = 5000

  useEffect(() => {
    let timer
    if (dataLoaded) {
      timer = setTimeout(() => {
        setShowLoadingMessage(false)
        setIsLoading(false)
      }, 400)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [dataLoaded])

  const fetchPlayers = useCallback(async (force = false) => {
    const now = Date.now()

    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
    }

    if (!force && now - lastFetchRef.current < FETCH_COOLDOWN) {
      const timeToWait = FETCH_COOLDOWN - (now - lastFetchRef.current)
      fetchTimeoutRef.current = setTimeout(() => fetchPlayers(true), timeToWait)
      return
    }

    try {
      setIsLoading(true)
      setShowLoadingMessage(true)

      const minimumDuration = new Promise(resolve => setTimeout(resolve, 400))

      const [res] = await Promise.all([api.get('/players'), minimumDuration])

      setPlayers(
        res.data.map(player => ({
          ...player,
          isPlayingThisWeek: Boolean(player.isPlayingThisWeek),
        }))
      )
      lastFetchRef.current = Date.now()
      setDataLoaded(true)

      setIsLoading(false)
      setShowLoadingMessage(false)
    } catch (error) {
      console.error('Failed to fetch players:', error)
      setIsLoading(false)
      setShowLoadingMessage(false)
    }
  }, [])

  useEffect(() => {
    fetchPlayers(true)

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
    }
  }, [fetchPlayers])

  const addPlayer = async newPlayer => {
    try {
      const response = await api.post('/players', newPlayer)
      if (response?.data) {
        const formattedPlayer = {
          ...response.data,
          isPlayingThisWeek: Boolean(response.data.isPlayingThisWeek),
          gameKnowledgeScore: parseInt(response.data.gameKnowledgeScore),
          goalScoringScore: parseInt(response.data.goalScoringScore),
          attackScore: parseInt(response.data.attackScore),
          midfieldScore: parseInt(response.data.midfieldScore),
          defenseScore: parseInt(response.data.defenseScore),
          fitnessScore: parseInt(response.data.fitnessScore),
        }

        setPlayers(prevPlayers => {
          const newPlayers = [...prevPlayers, formattedPlayer]
          return newPlayers.sort((a, b) => a.name.localeCompare(b.name))
        })

        setIsAddPlayerModalOpen(false)
        showSuccessMessage('Player added successfully!')

        return formattedPlayer
      }
      throw new Error('Invalid response format')
    } catch (error) {
      console.error('Failed to add player:', error)
    }
  }

  const onDeletePlayer = async playerId => {
    try {
      await api.delete(`/players/${playerId}`)

      setPlayers(prevPlayers =>
        prevPlayers.filter(player => player._id !== playerId)
      )
    } catch (error) {
      if (error.response?.status === 404) {
        console.error('Player not found')
      } else if (error.response?.status === 403) {
        console.error('You do not have permission to delete this player')
      } else {
        console.error('Failed to delete player')
      }
      console.error('Failed to delete player:', error)
    }
  }

  const confirmDelete = async () => {
    if (deleteState.playerToDelete) {
      try {
        await onDeletePlayer(deleteState.playerToDelete._id)
        showSuccessMessage('Player deleted successfully!')
      } catch (error) {
        console.error('Delete failed', error)
      } finally {
        setDeleteState({
          isDeleting: false,
          playerToDelete: null,
        })
      }
    }
  }

  const handlePlayerUpdate = async updatedPlayer => {
    try {
      const playerData = {
        ...updatedPlayer,
        gameKnowledgeScore: parseInt(updatedPlayer.gameKnowledgeScore, 10),
        goalScoringScore: parseInt(updatedPlayer.goalScoringScore, 10),
        attackScore: parseInt(updatedPlayer.attackScore, 10),
        midfieldScore: parseInt(updatedPlayer.midfieldScore, 10),
        defenseScore: parseInt(updatedPlayer.defenseScore, 10),
        fitnessScore: parseInt(updatedPlayer.fitnessScore, 10),
        isPlayingThisWeek: updatedPlayer.isPlayingThisWeek.toString(),
      }

      const res = await api.put(
        `/players/${updatedPlayer._id}/playerInfo`,
        playerData
      )

      const updatedPlayerData = {
        ...res.data,
        isPlayingThisWeek: Boolean(res.data.isPlayingThisWeek),
      }

      setPlayers(prevPlayers =>
        prevPlayers.map(player =>
          player._id === updatedPlayer._id ? updatedPlayerData : player
        )
      )

      setIsEditModalOpen(false)
      setPlayerToEdit(null)
      await fetchPlayers(true)
      showSuccessMessage('Player updated successfully!')
    } catch (error) {
      console.error('Failed to update player:', error)
    }
  }

  const handleEditPlayer = playerId => {
    const playerToEdit = players.find(p => p._id === playerId)
    setPlayerToEdit(playerToEdit)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setPlayerToEdit(null)
  }

  const handleDeleteConfirmation = playerId => {
    const playerToDelete = players.find(p => p._id === playerId)
    setDeleteState({
      isDeleting: true,
      playerToDelete,
    })
  }

  const cancelDelete = () => {
    setDeleteState({
      isDeleting: false,
      playerToDelete: null,
    })
  }

  const showSuccessMessage = message => {
    setSuccessMessage(message)
    setTimeout(() => {
      setSuccessMessage(null)
    }, 2500)
  }

  const SuccessMessage = ({ isVisible, message, marginTop = 'mt-4' }) => (
    <p
      className={`italic ${marginTop} h-6 ${
        isVisible ? 'text-green-600' : 'text-transparent'
      }`}
    >
      {isVisible && message ? message : ''}
    </p>
  )

  const sortedPlayers = [...players].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  return (
    <div className="mx-6">
      <div className="flex-col py-8">
        <h1 className="text-3xl font-bold mb-8 text-loonsDarkBrown">
          Manage Players
        </h1>
        <div>
          <Button
            variant="primary"
            onClick={() => setIsAddPlayerModalOpen(true)}
            text="Add A New Player"
            loadingMessage="Adding player"
            testId="add-player-button"
          />
          <AddPlayerModal
            isOpen={isAddPlayerModalOpen}
            onAddPlayer={addPlayer}
            playerAdded={!!successMessage}
            onClose={() => setIsAddPlayerModalOpen(false)}
          />
          <SuccessMessage
            isVisible={!!successMessage}
            message={successMessage}
          />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-black">
            List of Players
          </h2>
          <div className="flex-col text-black mb-4 gap-1">
            <p className="text-sm">
              Legend: <br />
              K: Game Knowledge, S: Goal Scoring, A: Attack, Md: Midfield, D:
              Defense, M/S: Mobility/Stamina
            </p>
          </div>
          {showLoadingMessage && players.length === 0 ? (
            <div className="flex justify-center items-center gap-2 text-gray-700 text-xl py-4">
              Loading players
              <PulseLoader color="black" size={6} />
            </div>
          ) : (
            <PlayerList
              players={sortedPlayers}
              onEditPlayer={handleEditPlayer}
              onDeletePlayer={handleDeleteConfirmation}
            />
          )}
        </div>
      </div>
      {isEditModalOpen && playerToEdit && (
        <EditPlayerModal
          player={playerToEdit}
          onUpdatePlayer={handlePlayerUpdate}
          onClose={closeEditModal}
        />
      )}
      <DeleteConfirmationModal
        isOpen={deleteState.isDeleting}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        playerName={deleteState.playerToDelete?.name}
      />
    </div>
  )
}

export default withAuth(Players)
