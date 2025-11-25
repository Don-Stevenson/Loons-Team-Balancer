import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useResetPassword } from '../../src/app/hooks/useApi'
import { apiService } from '../../utils/FEapi'

// Mock the API service
jest.mock('../../utils/FEapi', () => ({
  apiService: {
    auth: {
      resetPassword: jest.fn(),
    },
  },
}))

describe('useResetPassword', () => {
  let queryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    })
    jest.clearAllMocks()
  })

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should successfully reset password', async () => {
    const mockResponse = {
      success: true,
      message: 'Password reset successfully',
    }

    apiService.auth.resetPassword.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useResetPassword(), { wrapper })

    const resetData = {
      username: 'testuser',
      currentPassword: 'oldPassword',
      newPassword: 'newPassword123',
    }

    result.current.mutate(resetData)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiService.auth.resetPassword).toHaveBeenCalledWith(resetData)
    expect(result.current.data).toEqual(mockResponse)
  })

  it('should handle reset password error', async () => {
    const mockError = new Error('Invalid credentials')
    apiService.auth.resetPassword.mockRejectedValue(mockError)

    const { result } = renderHook(() => useResetPassword(), { wrapper })

    const resetData = {
      username: 'testuser',
      currentPassword: 'wrongPassword',
      newPassword: 'newPassword123',
    }

    result.current.mutate(resetData)

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(apiService.auth.resetPassword).toHaveBeenCalledWith(resetData)
    expect(result.current.error).toEqual(mockError)
  })

  it('should call onSuccess callback when provided', async () => {
    const mockResponse = {
      success: true,
      message: 'Password reset successfully',
    }
    const onSuccessMock = jest.fn()

    apiService.auth.resetPassword.mockResolvedValue(mockResponse)

    const { result } = renderHook(
      () =>
        useResetPassword({
          onSuccess: onSuccessMock,
        }),
      { wrapper }
    )

    const resetData = {
      username: 'testuser',
      currentPassword: 'oldPassword',
      newPassword: 'newPassword123',
    }

    result.current.mutate(resetData)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // React Query mutation onSuccess receives (data, variables, context)
    expect(onSuccessMock).toHaveBeenCalledWith(
      mockResponse,
      resetData,
      undefined
    )
  })

  it('should call onError callback when provided', async () => {
    const mockError = new Error('Server error')
    const onErrorMock = jest.fn()

    apiService.auth.resetPassword.mockRejectedValue(mockError)

    const { result } = renderHook(
      () =>
        useResetPassword({
          onError: onErrorMock,
        }),
      { wrapper }
    )

    const resetData = {
      username: 'testuser',
      currentPassword: 'oldPassword',
      newPassword: 'newPassword123',
    }

    result.current.mutate(resetData)

    await waitFor(() => expect(result.current.isError).toBe(true))

    // React Query mutation onError receives (error, variables, context)
    expect(onErrorMock).toHaveBeenCalledWith(
      mockError,
      resetData,
      undefined
    )
  })

  it('should track isPending state correctly', async () => {
    let resolveReset
    const resetPromise = new Promise(resolve => {
      resolveReset = resolve
    })

    apiService.auth.resetPassword.mockReturnValue(resetPromise)

    const { result } = renderHook(() => useResetPassword(), { wrapper })

    expect(result.current.isPending).toBe(false)

    const resetData = {
      username: 'testuser',
      currentPassword: 'oldPassword',
      newPassword: 'newPassword123',
    }

    result.current.mutate(resetData)

    await waitFor(() => expect(result.current.isPending).toBe(true))

    resolveReset({ success: true })

    await waitFor(() => expect(result.current.isPending).toBe(false))
  })

  it('should handle multiple reset attempts', async () => {
    apiService.auth.resetPassword
      .mockResolvedValueOnce({ success: false, message: 'Invalid password' })
      .mockResolvedValueOnce({ success: true, message: 'Password reset successfully' })

    const { result } = renderHook(() => useResetPassword(), { wrapper })

    // First attempt
    const resetData1 = {
      username: 'testuser',
      currentPassword: 'wrongPassword',
      newPassword: 'newPassword123',
    }

    result.current.mutate(resetData1)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ success: false, message: 'Invalid password' })

    // Second attempt
    const resetData2 = {
      username: 'testuser',
      currentPassword: 'correctPassword',
      newPassword: 'newPassword123',
    }

    result.current.mutate(resetData2)

    await waitFor(() => {
      expect(result.current.data).toEqual({
        success: true,
        message: 'Password reset successfully',
      })
    })

    expect(apiService.auth.resetPassword).toHaveBeenCalledTimes(2)
  })

  it('should reset mutation state correctly', async () => {
    apiService.auth.resetPassword.mockRejectedValue(new Error('Test error'))

    const { result } = renderHook(() => useResetPassword(), { wrapper })

    const resetData = {
      username: 'testuser',
      currentPassword: 'oldPassword',
      newPassword: 'newPassword123',
    }

    result.current.mutate(resetData)

    await waitFor(() => expect(result.current.isError).toBe(true))

    // Reset the mutation
    result.current.reset()

    await waitFor(() => {
      expect(result.current.isError).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.data).toBeUndefined()
    })
  })

  it('should handle network timeout errors', async () => {
    const timeoutError = new Error('Network timeout')
    timeoutError.code = 'ETIMEDOUT'

    apiService.auth.resetPassword.mockRejectedValue(timeoutError)

    const { result } = renderHook(() => useResetPassword(), { wrapper })

    const resetData = {
      username: 'testuser',
      currentPassword: 'oldPassword',
      newPassword: 'newPassword123',
    }

    result.current.mutate(resetData)

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error.code).toBe('ETIMEDOUT')
  })
})

