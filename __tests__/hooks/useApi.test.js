import { renderHook, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QueryClient } from '@tanstack/react-query'
import { apiService } from '../../utils/FEapi'
import { QueryWrapper } from '../utils/test-utils'
import {
  usePlayers,
  useCreatePlayer,
  useUpdatePlayer,
  useDeletePlayer,
  useLogin,
  useAuthCheck,
} from '../../src/app/hooks/useApi'

// Mock the API service
jest.mock('../../utils/FEapi', () => ({
  apiService: {
    players: {
      getAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    auth: {
      login: jest.fn(),
      check: jest.fn(),
    },
  },
}))

describe('useApi hooks', () => {
  let queryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  describe('usePlayers', () => {
    it('should fetch players successfully', async () => {
      const mockPlayers = [
        { _id: '1', name: 'Player 1' },
        { _id: '2', name: 'Player 2' },
      ]
      apiService.players.getAll.mockResolvedValue(mockPlayers)

      const { result } = renderHook(() => usePlayers(), {
        wrapper: ({ children }) => (
          <QueryWrapper queryClient={queryClient}>{children}</QueryWrapper>
        ),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockPlayers)
      expect(apiService.players.getAll).toHaveBeenCalledTimes(1)
    })

    it('should handle fetch players error', async () => {
      const mockError = new Error('Failed to fetch players')
      apiService.players.getAll.mockRejectedValue(mockError)

      const { result } = renderHook(() => usePlayers(), {
        wrapper: ({ children }) => (
          <QueryWrapper queryClient={queryClient}>{children}</QueryWrapper>
        ),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useCreatePlayer', () => {
    it('should create player successfully', async () => {
      const newPlayer = { name: 'New Player', attackScore: 5 }
      const createdPlayer = { _id: '3', ...newPlayer }
      apiService.players.create.mockResolvedValue(createdPlayer)

      const { result } = renderHook(() => useCreatePlayer(), {
        wrapper: ({ children }) => (
          <QueryWrapper queryClient={queryClient}>{children}</QueryWrapper>
        ),
      })

      await act(async () => {
        result.current.mutate(newPlayer)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(createdPlayer)
      // Verify only the first argument (actual data), ignoring React Query's internal parameters
      expect(apiService.players.create).toHaveBeenCalledTimes(1)
      expect(apiService.players.create.mock.calls[0][0]).toEqual(newPlayer)
    })

    it('should handle create player error', async () => {
      const newPlayer = { name: 'New Player' }
      const mockError = new Error('Failed to create player')
      apiService.players.create.mockRejectedValue(mockError)

      const { result } = renderHook(() => useCreatePlayer(), {
        wrapper: ({ children }) => (
          <QueryWrapper queryClient={queryClient}>{children}</QueryWrapper>
        ),
      })

      await act(async () => {
        result.current.mutate(newPlayer)
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useUpdatePlayer', () => {
    it('should update player successfully', async () => {
      const playerId = '1'
      const updatedData = { name: 'Updated Player' }
      const updatedPlayer = { _id: playerId, ...updatedData }
      apiService.players.update.mockResolvedValue(updatedPlayer)

      const { result } = renderHook(() => useUpdatePlayer(), {
        wrapper: ({ children }) => (
          <QueryWrapper queryClient={queryClient}>{children}</QueryWrapper>
        ),
      })

      await act(async () => {
        result.current.mutate({ id: playerId, ...updatedData })
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(updatedPlayer)
      // Verify only the first argument (actual data), ignoring React Query's internal parameters
      expect(apiService.players.update).toHaveBeenCalledTimes(1)
      expect(apiService.players.update.mock.calls[0][0]).toEqual({
        id: playerId,
        ...updatedData,
      })
    })
  })

  describe('useDeletePlayer', () => {
    it('should delete player successfully', async () => {
      const playerId = '1'
      apiService.players.delete.mockResolvedValue({ success: true })

      const { result } = renderHook(() => useDeletePlayer(), {
        wrapper: ({ children }) => (
          <QueryWrapper queryClient={queryClient}>{children}</QueryWrapper>
        ),
      })

      await act(async () => {
        result.current.mutate(playerId)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Verify only the first argument (actual data), ignoring React Query's internal parameters
      expect(apiService.players.delete).toHaveBeenCalledTimes(1)
      expect(apiService.players.delete.mock.calls[0][0]).toBe(playerId)
    })
  })

  describe('useLogin', () => {
    it('should login successfully', async () => {
      const credentials = { username: 'testuser', password: 'testpass' }
      const loginResponse = { success: true }
      apiService.auth.login.mockResolvedValue(loginResponse)

      const { result } = renderHook(() => useLogin(), {
        wrapper: ({ children }) => (
          <QueryWrapper queryClient={queryClient}>{children}</QueryWrapper>
        ),
      })

      await act(async () => {
        result.current.mutate(credentials)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(loginResponse)
      // Verify only the first argument (actual data), ignoring React Query's internal parameters
      expect(apiService.auth.login).toHaveBeenCalledTimes(1)
      expect(apiService.auth.login.mock.calls[0][0]).toEqual(credentials)
    })

    it('should handle login failure', async () => {
      const credentials = { username: 'testuser', password: 'wrongpass' }
      const mockError = new Error('Invalid credentials')
      apiService.auth.login.mockRejectedValue(mockError)

      const { result } = renderHook(() => useLogin(), {
        wrapper: ({ children }) => (
          <QueryWrapper queryClient={queryClient}>{children}</QueryWrapper>
        ),
      })

      await act(async () => {
        result.current.mutate(credentials)
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useAuthCheck', () => {
    it('should check auth successfully', async () => {
      apiService.auth.check.mockResolvedValue(true)

      const { result } = renderHook(() => useAuthCheck(), {
        wrapper: ({ children }) => (
          <QueryWrapper queryClient={queryClient}>{children}</QueryWrapper>
        ),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBe(true)
      expect(apiService.auth.check).toHaveBeenCalledTimes(1)
    })

    it('should handle auth check failure', async () => {
      apiService.auth.check.mockResolvedValue(false)

      const { result } = renderHook(() => useAuthCheck(), {
        wrapper: ({ children }) => (
          <QueryWrapper queryClient={queryClient}>{children}</QueryWrapper>
        ),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBe(false)
    })
  })

  describe('Optimistic Updates', () => {
    it('should update cache when updating player successfully', async () => {
      const playerId = '1'
      const originalPlayer = { _id: playerId, name: 'Original Player' }
      const updatedData = { name: 'Updated Player' }
      const updatedPlayer = { _id: playerId, ...updatedData }

      // Pre-populate cache with original player data
      queryClient.setQueryData(['players'], [originalPlayer])

      apiService.players.update.mockResolvedValue(updatedPlayer)

      const { result } = renderHook(() => useUpdatePlayer(), {
        wrapper: ({ children }) => (
          <QueryWrapper queryClient={queryClient}>{children}</QueryWrapper>
        ),
      })

      await act(async () => {
        result.current.mutate({ id: playerId, ...updatedData })
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Check that the cache was updated after success
      const cachedPlayers = queryClient.getQueryData(['players'])
      expect(cachedPlayers).toBeDefined()
      expect(Array.isArray(cachedPlayers)).toBe(true)
      expect(cachedPlayers.length).toBe(1)
      expect(cachedPlayers[0].name).toBe('Updated Player')
    })

    it('should not update cache on update error', async () => {
      const playerId = '1'
      const originalPlayer = { _id: playerId, name: 'Original Player' }
      const updatedData = { name: 'Updated Player' }

      // Pre-populate cache with original player data
      queryClient.setQueryData(['players'], [originalPlayer])

      apiService.players.update.mockRejectedValue(new Error('Update failed'))

      const { result } = renderHook(() => useUpdatePlayer(), {
        wrapper: ({ children }) => (
          <QueryWrapper queryClient={queryClient}>{children}</QueryWrapper>
        ),
      })

      await act(async () => {
        result.current.mutate({ id: playerId, ...updatedData })
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      // Check that the cache remains unchanged on error
      const cachedPlayers = queryClient.getQueryData(['players'])
      expect(cachedPlayers).toBeDefined()
      expect(Array.isArray(cachedPlayers)).toBe(true)
      expect(cachedPlayers.length).toBe(1)
      expect(cachedPlayers[0].name).toBe('Original Player')
    })
  })
})
