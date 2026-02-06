'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useResetPassword } from '../../../hooks/useApi'
import { Button } from '../Button/Button'
import { Logo } from '../Logo/Logo'
import Link from 'next/link'
import { BackArrow } from '../BackArrow/BackArrow'
import { PasswordEyeClosed } from '@/app/assets/img/svgs/PasswordEyeClosed'
import { PasswordEyeOpened } from '@/app/assets/img/svgs/PasswordEyeOpened'

export default function PasswordResetStep2({ username, currentPassword }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const resetPasswordMutation = useResetPassword({
    onSuccess: (data) => {
      if (data.success) {
        setSuccess(true)
        setError('')
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(data.message || 'Failed to reset password')
      }
    },
    onError: (err) => {
      setError('An error occurred. Please try again')
      console.error('Password reset error:', err)
    },
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (newPassword === currentPassword) {
      setError('New password cannot be the same as the current password')
      return
    }

    // check if password includes at least one uppercase letter, one lowercase letter, one number
    if (
      !newPassword.match(/[A-Z]/) ||
      !newPassword.match(/[a-z]/) ||
      !newPassword.match(/[0-9]/)
    ) {
      setError(
        'Password must include at least one uppercase letter, one lowercase letter, and one number'
      )
      return
    }

    // Submit the password reset
    resetPasswordMutation.mutate({
      username,
      currentPassword,
      newPassword,
    })
  }

  return (
    <form onSubmit={handleSubmit} data-testid="password-reset-step2-form">
      <div className="mt-20 flex flex-col items-center justify-center gap-2">
        <Logo />
        <h1 className="text-center text-2xl">Password Reset</h1>
        <p className="mb-2 text-sm text-gray-600">
          Step 2: Enter your new password
        </p>
        <div className="mb-3 flex flex-col justify-center gap-3 text-sm sm:flex-row">
          <div className="relative flex items-center justify-between">
            <input
              id="new-password"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onFocus={() => setError('')}
              placeholder="New Password"
              required
              disabled={resetPasswordMutation.isPending || success}
              autoComplete="new-password"
              className="h-8 w-40 rounded border border-gray-300 pr-8 text-center focus:outline-none focus:ring-2 focus:ring-loonsRed disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              disabled={resetPasswordMutation.isPending || success}
              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
            >
              {showNewPassword ? <PasswordEyeOpened /> : <PasswordEyeClosed />}
            </button>
          </div>

          <div className="relative flex items-center justify-between">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              onFocus={() => setError('')}
              placeholder="Confirm New PW"
              required
              disabled={resetPasswordMutation.isPending || success}
              autoComplete="new-password"
              className="h-8 w-40 rounded border border-gray-300 pr-8 text-center focus:outline-none focus:ring-2 focus:ring-loonsRed disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              disabled={resetPasswordMutation.isPending || success}
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
            >
              {showConfirmPassword ? (
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
            text="Reset Password"
            loadingMessage="Resetting"
            isLoading={resetPasswordMutation.isPending}
            testId="reset-password-button"
            disabled={success}
          />
        </div>
      </div>
      <div className="flex h-10 items-center justify-center gap-2 text-center text-xs">
        <BackArrow />
        <Link href="/login">Back to login</Link>
      </div>
      <div className="flex h-10 items-center justify-center text-center text-green-600">
        {success ? 'Password reset successful! Redirecting to login...' : ''}
      </div>
      <div className="flex h-10 items-center justify-center text-center text-loonsRed">
        {error ? error : ''}
      </div>
    </form>
  )
}
