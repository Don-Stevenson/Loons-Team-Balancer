'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query' // Add this import
import { useLogin, queryKeys } from '../../../hooks/useApi' // Import queryKeys
import { Button } from '../Button/Button'
import { Logo } from '../Logo/Logo'
import Link from 'next/link'
import { PasswordEyeOpened } from '../../../assets/img/svgs/PasswordEyeOpened'
import { PasswordEyeClosed } from '../../../assets/img/svgs/PasswordEyeClosed'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient() // Add this line

  const loginMutation = useLogin({
    onSuccess: async (data) => {
      if (data.success) {
        setError(false)
        // invalidate the auth query
        await queryClient.invalidateQueries({ queryKey: queryKeys.auth })

        router.push('/create-teams')
      } else {
        setError(true)
      }
    },
    onError: (error) => {
      setError(true)
      console.error('Login error:', error)
    },
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    loginMutation.mutate({ username, password })
  }

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <div className="mt-20 flex flex-col items-center justify-center gap-2">
        <Logo />
        <div className="mb-3 flex flex-col justify-center gap-3 xs:flex-row">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={() => setError(false)}
            placeholder="Username"
            required
            disabled={loginMutation.isPending}
            autoComplete="current-username"
            className="h-8 w-40 rounded border border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-loonsRed disabled:opacity-50"
          />
          <div className="relative flex items-center">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setError(false)}
              placeholder="Password"
              required
              disabled={loginMutation.isPending}
              autoComplete="current-password"
              className="h-8 w-40 rounded border border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-loonsRed disabled:opacity-50"
            />
            <button
              id="toggle-password-button"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              disabled={loginMutation.isPending}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <PasswordEyeOpened /> : <PasswordEyeClosed />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Button
            variant="secondary"
            text="Login"
            loadingMessage="Logging in"
            classes="max-w-[100px] flex justify-center items-center"
            isLoading={loginMutation.isPending}
            testId="login-button"
          />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center text-center text-xs text-loonsBrown transition-colors duration-300 hover:cursor-pointer hover:text-[#f38686]">
        <Link href="/password-help">Need help with your password?</Link>
      </div>
      <div className="flex h-10 items-center justify-center text-center text-loonsRed">
        {error ? "There's been an error. Please try again" : ''}
      </div>
    </form>
  )
}
