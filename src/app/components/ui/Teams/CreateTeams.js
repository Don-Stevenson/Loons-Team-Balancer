import { useState, useEffect } from 'react'
import GameSelector from '../GamesSelector/GameSelector'
import PlayerListManager from '../PlayerList/PlayerListManager'
import TeamGenerator from './TeamGenerator'
import Teams from './Teams'
import {
  usePlayers,
  useUpcomingGames,
  useGameRsvps,
  useBulkUpdatePlayers,
  useBalanceTeams,
} from '../../../hooks/useApi'
import { applyPreBalanceRules, applyPostBalanceRules } from '../../../utils/playerTeamRequests'
import { calculateTeamStats } from '../../../utils/teamStats'

export default function CreateTeams() {
  const [numTeams, setNumTeams] = useState(2)
  const [balancedTeams, setBalancedTeams] = useState(null)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [error, setError] = useState(null)
  const [players, setPlayers] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [selectedPlayerCount, setSelectedPlayerCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showLoadingMessage, setShowLoadingMessage] = useState(true)
  const [openPlayerList, setOpenPlayerList] = useState(true)
  const [upcomingGames, setUpcomingGames] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedGameId, setSelectedGameId] = useState(null)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [selectedGameInfo, setSelectedGameInfo] = useState(null)

  // React Query hooks
  const {
    data: queryPlayers = [],
    isLoading: playersLoading,
    error: playersError,
  } = usePlayers()
  const { data: queryUpcomingGames = [], isLoading: gamesLoading } =
    useUpcomingGames()

  const gamesError = queryUpcomingGames?.error
  const gamesErrorMessage = queryUpcomingGames?.message
  const upcomingGamesData =
    queryUpcomingGames?.games ||
    (Array.isArray(queryUpcomingGames) ? queryUpcomingGames : [])

  const { data: queryRsvpsForGame = [], isLoading: rsvpsLoading } =
    useGameRsvps(selectedGameId, {
      enabled: !!selectedGameId,
    })
  const bulkUpdateMutation = useBulkUpdatePlayers()
  const balanceTeamsMutation = useBalanceTeams()

  const normalizeName = name => {
    return name.toLowerCase().trim().replace(/\s+/g, ' ')
  }

  // Sync React Query data with local state
  useEffect(() => {
    if (upcomingGamesData.length > 0) {
      setUpcomingGames(upcomingGamesData)
    } else if (gamesError) {
      setUpcomingGames([])
    }
  }, [upcomingGamesData, gamesError])

  useEffect(() => {
    if (queryPlayers.length > 0 || !playersLoading) {
      // Initialize players with their current playing status from the database
      const fetchedPlayers = queryPlayers.map(player => {
        // Default to false unless explicitly set to true in the database
        const isPlaying =
          player.isPlayingThisWeek === true ||
          player.isPlayingThisWeek === 'true'

        return {
          ...player,
          isPlayingThisWeek: isPlaying,
        }
      })

      setPlayers(fetchedPlayers)
      const playingCount = fetchedPlayers.filter(
        player => player.isPlayingThisWeek
      ).length
      setSelectAll(playingCount === fetchedPlayers.length)
      setSelectedPlayerCount(playingCount)
      setIsLoading(false)
      setShowLoadingMessage(false)
      setInitialLoadComplete(true)
    }
  }, [queryPlayers, playersLoading])

  // Use queryRsvpsForGame directly instead of maintaining separate state

  // Track if we've already processed RSVPs for this game to prevent re-processing
  const [processedGameId, setProcessedGameId] = useState(null)

  useEffect(() => {
    // Only process when we have a selected game, RSVP data, and players data
    // and we haven't already processed this game
    if (
      !selectedGameId ||
      !queryRsvpsForGame ||
      players.length === 0 ||
      processedGameId === selectedGameId ||
      rsvpsLoading
    ) {
      return
    }

    const processRsvpsForGame = async () => {
      try {
        // Ensure player list is open at the start
        setOpenPlayerList(true)

        // Don't set isLoadingRsvps to true here - process silently in background
        // This prevents the flashing between loading and list states

        // Create a Set of normalized RSVP'd player names for faster lookup
        const rsvpNames = new Set(
          queryRsvpsForGame.map(name => normalizeName(name))
        )

        // Update local state immediately to prevent re-renders during API calls
        const updatedPlayers = players.map(player => {
          const normalizedName = normalizeName(player.name)
          return {
            ...player,
            isPlayingThisWeek: rsvpNames.has(normalizedName),
          }
        })

        setPlayers(updatedPlayers)
        const selectedCount = updatedPlayers.filter(
          p => p.isPlayingThisWeek
        ).length
        setSelectedPlayerCount(selectedCount)
        setSelectAll(selectedCount === players.length)

        // Mark this game as processed BEFORE making API calls to prevent duplicate processing
        setProcessedGameId(selectedGameId)

        // First, set all players to not playing
        const allPlayerIds = players.map(player => player._id)

        await bulkUpdateMutation.mutateAsync({
          isPlayingThisWeek: false,
          playerIds: allPlayerIds,
        })

        // Then set only RSVP'd players to playing (if any)
        const playingPlayerIds = players
          .filter(player => {
            const normalizedName = normalizeName(player.name)
            return rsvpNames.has(normalizedName)
          })
          .map(player => player._id)

        if (playingPlayerIds.length > 0) {
          await bulkUpdateMutation.mutateAsync({
            isPlayingThisWeek: true,
            playerIds: playingPlayerIds,
          })
        }

        // Ensure player list stays open at the end
        setOpenPlayerList(true)
      } catch (error) {
        console.error('Failed to process RSVPs:', error)
        // Reset processed game ID on error so user can retry
        setProcessedGameId(null)
        // Don't set error state for auth failures, let withAuth handle the redirect
        if (error.response?.status !== 401) {
          setError('Failed to process RSVPs for the selected game')
        }
      }
    }

    // Add a small delay to prevent rapid-fire calls
    const timeoutId = setTimeout(() => {
      processRsvpsForGame()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [selectedGameId, queryRsvpsForGame, rsvpsLoading]) // Removed players.length dependency to prevent infinite loop

  const handleTogglePlayingThisWeek = async playerId => {
    const playerToUpdate = players.find(player => player._id === playerId)
    const newPlayingState = !playerToUpdate.isPlayingThisWeek

    const updatedPlayers = players.map(player =>
      player._id === playerId
        ? { ...player, isPlayingThisWeek: newPlayingState }
        : player
    )

    setPlayers(updatedPlayers)
    setSelectedPlayerCount(
      updatedPlayers.filter(p => p.isPlayingThisWeek).length
    )
    setSelectAll(updatedPlayers.every(player => player.isPlayingThisWeek))

    try {
      await bulkUpdateMutation.mutateAsync({
        isPlayingThisWeek: newPlayingState,
        playerIds: [playerId],
      })
    } catch (error) {
      console.error('Failed to update player:', error)
      // Revert the change on error
      const revertedPlayers = players.map(player =>
        player._id === playerId
          ? { ...player, isPlayingThisWeek: !newPlayingState }
          : player
      )
      setPlayers(revertedPlayers)
      setSelectedPlayerCount(
        revertedPlayers.filter(p => p.isPlayingThisWeek).length
      )
      setSelectAll(revertedPlayers.every(player => player.isPlayingThisWeek))
      setError('Failed to update player status')
    }
  }

  const handleSelectAll = async () => {
    const newSelectAllState = !selectAll

    const updatedPlayers = players.map(player => ({
      ...player,
      isPlayingThisWeek: newSelectAllState,
    }))

    setPlayers(updatedPlayers)
    setSelectAll(newSelectAllState)
    setSelectedPlayerCount(newSelectAllState ? players.length : 0)

    try {
      // Get all player IDs
      const playerIds = players.map(player => player._id)

      await bulkUpdateMutation.mutateAsync({
        isPlayingThisWeek: newSelectAllState,
        playerIds: playerIds,
      })
    } catch (error) {
      console.error('Failed to update all players:', error)
      // Revert the change on error
      const revertedPlayers = players.map(player => ({
        ...player,
        isPlayingThisWeek: !newSelectAllState,
      }))
      setPlayers(revertedPlayers)
      setSelectAll(!newSelectAllState)
      setSelectedPlayerCount(!newSelectAllState ? players.length : 0)
      setError('Failed to update all players')
    }
  }

  const handleBalanceTeams = async () => {
    setError(null)
    try {
      setIsLoading(true)
      setShowLoadingMessage(true)

      // Minimum duration of 2 seconds for loading message
      const minimumDuration = new Promise(resolve => setTimeout(resolve, 2000))

      // Get only the players that are marked as playing
      let playingPlayers = players.filter(player => player.isPlayingThisWeek)

      // PHASE 1: Apply pre-balance rules (e.g., add PERSON2 if PERSON1 is playing)
      playingPlayers = applyPreBalanceRules(players, playingPlayers)

      if (playingPlayers.length === 0) {
        setError('Please select at least one player to create teams')
        setIsLoading(false)
        setShowLoadingMessage(false)
        return
      }

      // Clean up player data to only include necessary fields and ensure correct types
      const cleanPlayers = playingPlayers.map((player, index) => {
        // Validate scores are between 0 and 10
        const validateScore = (score, field) => {
          const num = Number(score || 0)
          if (isNaN(num) || num < 0 || num > 10) {
            throw new Error(
              `Invalid ${field} score for player ${player.name}: ${score}`
            )
          }
          return num
        }

        return {
          name: String(player.name || ''),
          gameKnowledgeScore: validateScore(
            player.gameKnowledgeScore,
            'game knowledge'
          ),
          goalScoringScore: validateScore(
            player.goalScoringScore,
            'goal scoring'
          ),
          attackScore: validateScore(player.attackScore, 'attack'),
          midfieldScore: validateScore(player.midfieldScore, 'midfield'),
          defenseScore: validateScore(player.defenseScore, 'defense'),
          fitnessScore: validateScore(player.fitnessScore, 'fitness'),
          gender: String(player.gender || 'male'),
          isPlayingThisWeek: true,
        }
      })

      try {
        // Send the request using React Query mutation
        const [res] = await Promise.all([
          balanceTeamsMutation.mutateAsync({
            numTeams: parseInt(numTeams, 10),
            players: cleanPlayers,
          }),
          minimumDuration,
        ])

        setTotalPlayers(cleanPlayers.length)

        // PHASE 2: Apply post-balance rules (e.g., separate/group specific players)
        const modifiedTeams = applyPostBalanceRules(cleanPlayers, res.teams)
        const teamsWithUpdatedStats = modifiedTeams.map(team => calculateTeamStats(team))
        setBalancedTeams(teamsWithUpdatedStats)
        setIsLoading(false)
        setShowLoadingMessage(false)
        setOpenPlayerList(false)
      } catch (err) {
        console.error('API Error Details:', {
          status: err.response?.status,
          data: err.response?.data,
          errors: err.response?.data?.errors,
          message: err.message,
          headers: err.response?.headers,
          config: err.config,
        })

        // Log the full error response
        if (err.response) {
          console.error('Error Response:', {
            status: err.response.status,
            statusText: err.response.statusText,
            data: err.response.data,
            headers: err.response.headers,
          })
        }

        let errorMessage = 'An error occurred while creating teams'
        if (err.response?.data?.error) {
          errorMessage = err.response.data.error
        } else if (err.message) {
          errorMessage = err.message
        }

        setError(errorMessage)
        setIsLoading(false)
        setShowLoadingMessage(false)
      }
    } catch (err) {
      console.error('Error creating teams:', err)
      setError(err.message || 'An error occurred while creating teams')
      setIsLoading(false)
      setShowLoadingMessage(false)
    }
  }

  // Handle game selection
  const handleGameSelect = gameId => {
    setOpenPlayerList(true) // Set to true first
    const selectedGame = upcomingGames.find(game => game._id === gameId)
    setSelectedDate(new Date(selectedGame.meetdate))
    setSelectedGameId(gameId)
    setSelectedGameInfo(selectedGame) // Store the full game info for printout
    setProcessedGameId(null) // Reset processed game ID to allow processing of new game
    setBalancedTeams(null)
    setTotalPlayers(0)
  }

  const handleTogglePlayerList = () => {
    setOpenPlayerList(!openPlayerList)
  }

  return (
    <div className="flex flex-col mx-6">
      <h2 className="text-3xl font-semibold mb-4 print:hidden md:justify-center text-loonsDarkBrown mt-6">
        Create Teams
      </h2>
      <GameSelector
        upcomingGames={upcomingGames}
        gamesError={gamesError}
        gamesErrorMessage={gamesErrorMessage}
        selectedGameId={selectedGameId}
        queryRsvpsForGame={queryRsvpsForGame}
        rsvpsLoading={rsvpsLoading}
        players={players}
        onGameSelect={handleGameSelect}
        normalizeName={normalizeName}
      />
      <div className="flex flex-col rounded pt-6 pb-8 mb-4 gap-4 print:pt-0 print:mb-0 print:px-0 print:pb-0">
        {error && (
          <p className="text-center text-red-500 text-sm mt-2">{error}</p>
        )}
        <PlayerListManager
          players={players}
          selectedPlayerCount={selectedPlayerCount}
          selectAll={selectAll}
          openPlayerList={openPlayerList}
          showLoadingMessage={showLoadingMessage}
          queryRsvpsForGame={queryRsvpsForGame}
          bulkUpdateMutation={bulkUpdateMutation}
          onTogglePlayingThisWeek={handleTogglePlayingThisWeek}
          onSelectAll={handleSelectAll}
          onTogglePlayerList={handleTogglePlayerList}
        />
        <TeamGenerator
          numTeams={numTeams}
          isLoading={isLoading}
          error={error}
          onNumTeamsChange={setNumTeams}
          onBalanceTeams={handleBalanceTeams}
        />
        {balancedTeams && (
          <Teams
            players={players}
            balancedTeams={balancedTeams}
            setBalancedTeams={setBalancedTeams}
            totalPlayers={totalPlayers}
            selectedGameInfo={selectedGameInfo}
          />
        )}
      </div>
    </div>
  )
}
