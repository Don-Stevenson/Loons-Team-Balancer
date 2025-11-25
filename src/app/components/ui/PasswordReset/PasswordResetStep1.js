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

  const handleSubmit = async e => {
    e.preventDefault()
    setIsVerifying(true)
    setError(false)

    try {
      // Verify credentials without logging in
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

  // If credentials verified, show Step 2
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
      <div className="flex flex-col items-center justify-center mt-20 gap-2">
        <Logo />
        <h1 className="text-2xl text-center">Password Reset</h1>
        <p className="text-sm text-gray-600 mb-2">
          Step 1: Verify your identity
        </p>
        <div className="flex flex-col justify-center xs:flex-row gap-3 mb-3 text-sm">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onFocus={() => setError(false)}
            placeholder="Username"
            required
            disabled={isVerifying}
            autoComplete="username"
            className="border border-gray-300 rounded w-40 h-8 text-center focus:outline-none focus:ring-2 focus:ring-loonsRed disabled:opacity-50"
          />
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              onFocus={() => setError(false)}
              placeholder="Current Password"
              required
              disabled={isVerifying}
              autoComplete="current-password"
              className="border border-gray-300 rounded w-40 h-8 text-center focus:outline-none focus:ring-2 focus:ring-loonsRed disabled:opacity-50 pr-8"
            />
            <button
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
        <div className="flex justify-center items-center">
          <Button
            variant="secondary"
            text="Next"
            loadingMessage="Verifying..."
            isLoading={isVerifying}
            testId="verify-credentials-button"
          />
        </div>
      </div>
      <div className="flex justify-center text-center items-center h-10 text-xs gap-2">
        <BackArrow />
        <Link href="/login">Back to login</Link>
      </div>
      <div className="flex justify-center text-center items-center text-loonsRed h-10">
        {error ? 'Invalid credentials. Please try again' : ''}
      </div>
    </form>
  )
}
