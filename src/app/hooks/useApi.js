import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../../../utils/FEapi'

// Query Keys - centralized for cache management
export const queryKeys = {
  players: ['players'],
  player: id => ['players', id],
  games: ['games'],
  gameRsvps: gameId => ['games', gameId, 'rsvps'],
  auth: ['auth'],
}

// Players Hooks
export const usePlayers = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.players,
    queryFn: apiService.players.getAll,
    ...options,
  })
}

export const usePlayer = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.player(id),
    queryFn: () => apiService.players.getById(id),
    enabled: !!id,
    ...options,
  })
}

export const useCreatePlayer = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiService.players.create,
    onSuccess: newPlayer => {
      // Add the new player to the cache
      queryClient.setQueryData(queryKeys.players, (oldPlayers = []) => {
        const newPlayers = [...oldPlayers, newPlayer]
        return newPlayers.sort((a, b) => a.name.localeCompare(b.name))
      })
    },
    ...options,
  })
}

export const useUpdatePlayer = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiService.players.update,
    onSuccess: updatedPlayer => {
      // Update the player in the cache
      queryClient.setQueryData(queryKeys.players, (oldPlayers = []) =>
        oldPlayers.map(player =>
          player._id === updatedPlayer._id ? updatedPlayer : player
        )
      )

      // Update individual player cache if it exists
      queryClient.setQueryData(
        queryKeys.player(updatedPlayer._id),
        updatedPlayer
      )
    },
    ...options,
  })
}

export const useDeletePlayer = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiService.players.delete,
    onSuccess: (_, playerId) => {
      // Remove the player from the cache
      queryClient.setQueryData(queryKeys.players, (oldPlayers = []) =>
        oldPlayers.filter(player => player._id !== playerId)
      )

      // Remove individual player cache
      queryClient.removeQueries({ queryKey: queryKeys.player(playerId) })
    },
    ...options,
  })
}

export const useBulkUpdatePlayers = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiService.players.bulkUpdate,
    // Don't automatically invalidate cache to prevent excessive refetching
    // The UI will handle state updates manually for better performance
    ...options,
  })
}

// Games Hooks
export const useUpcomingGames = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.games,
    queryFn: apiService.games.getUpcoming,
    ...options,
  })
}

export const useGameRsvps = (gameId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.gameRsvps(gameId),
    queryFn: () => apiService.games.getRsvps(gameId),
    enabled: !!gameId,
    ...options,
  })
}

// Teams Hooks
export const useBalanceTeams = (options = {}) => {
  return useMutation({
    mutationFn: apiService.teams.balance,
    ...options,
  })
}

// Auth Hooks
export const useAuthCheck = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.auth,
    queryFn: apiService.auth.check,
    retry: false, // Don't retry auth checks
    staleTime: 2 * 60 * 1000, // Auth status is fresh for 2 minutes
    ...options,
  })
}

export const useLogin = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiService.auth.login,
    onSuccess: () => {
      // Mark auth as successful
      queryClient.setQueryData(queryKeys.auth, true)
    },
    ...options,
  })
}

export const useResetPassword = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: apiService.auth.resetPassword,
    ...options,
  })
}

export const useLogout = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiService.auth.logout,
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear()
    },
    ...options,
  })
}
