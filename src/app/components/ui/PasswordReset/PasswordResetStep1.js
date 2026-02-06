'use client'

import { useState } from 'react'
import { Button } from '../Button/Button'
import { Logo } from '../Logo/Logo'
import Link from 'next/link'
import { BackArrow } from '../BackArrow/BackArrow'
import PasswordResetStep2 from './PasswordResetStep2'
import { apiService } from '../../../../../utils/FEapi'

import { PasswordEyeClosed } from '../../../assets/img/svgs/PasswordEyeClosed'
import { PasswordEyeOpened } from '../../../assets/img/svgs/PasswordEyeOpened'

export default function PasswordResetStep1() {
  const [username, setUsername] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [error, setError] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [credentialsVerified, setCredentialsVerified] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsVerifying(true)
    setError(false)

    try {
      const response = await apiService.auth.verifyCredentials({
        username,
        password: currentPassword,
      })

      if (response.success) {
        setCredentialsVerified(true)
        setError(false)
      } else {
        setError(response.message || 'Invalid credentials')
        console.error('Credential verification error:', response.message)
      }
    } catch (err) {
      setError('Invalid credentials. Please try again.')
      console.error('Credential verification error:', err)
    } finally {
      setIsVerifying(false)
    }
  }

  if (credentialsVerified) {
    return (
      <PasswordResetStep2
        username={username}
        currentPassword={currentPassword}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <div className="mt-20 flex flex-col items-center justify-center gap-2">
        <Logo />
        <h1 className="text-center text-2xl">Password Reset</h1>
        <p className="mb-2 text-sm text-gray-600">
          Step 1: Verify your identity
        </p>
        <div className="mb-3 flex flex-col items-center justify-center gap-3 text-sm sm:flex-row">
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={() => setError(false)}
            placeholder="Username / Email"
            required
            disabled={isVerifying}
            autoComplete="username"
            className="h-8 w-40 rounded border border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-loonsRed disabled:opacity-50"
          />
          <div className="relative flex items-center justify-between">
            <input
              id="current-password"
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              onFocus={() => setError(false)}
              placeholder="Current Password"
              required
              disabled={isVerifying}
              autoComplete="current-password"
              className="h-8 w-40 rounded border border-gray-300 pr-1 text-center focus:outline-none focus:ring-2 focus:ring-loonsRed disabled:opacity-50"
            />
            <button
              id="toggle password button"
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              disabled={isVerifying}
              aria-label={
                showCurrentPassword ? 'Hide password' : 'Show password'
              }
            >
              {showCurrentPassword ? (
                <PasswordEyeOpened />
              ) : (
                <PasswordEyeClosed />
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Button
            variant="secondary"
            text="Next"
            loadingMessage="Verifying"
            isLoading={isVerifying}
            testId="verify-credentials-button"
          />
        </div>
      </div>
      <div className="flex h-10 items-center justify-center gap-2 text-center text-xs">
        <BackArrow />
        <Link href="/login">Back to login</Link>
      </div>
      <div className="flex h-4 items-center justify-center text-center text-sm text-loonsRed">
        {error ? 'Invalid credentials. Please try again' : ''}
      </div>
    </form>
  )
}
