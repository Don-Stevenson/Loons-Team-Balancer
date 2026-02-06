import { useState } from 'react'
import Link from 'next/link'
import { BackArrow } from '../BackArrow/BackArrow'
import { Button } from '../Button/Button'
import { Logo } from '../Logo/Logo'

const PasswordHelp = () => {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    if (!username) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }

    // call the api to send the temporary password

    try {
      const response = await fetch('/api/send-temporary-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(
          'If an account exists with this email, a temporary password has been generated and sent to your email address.'
        )
        setUsername('')
      } else {
        setError(data.message || 'Username/email not found. Please try again.')
      }
    } catch (err) {
      setError('Failed to process request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-20 flex flex-col items-center justify-center gap-2"
      role="form"
    >
      <Logo />
      <h1 className="text-center text-2xl">Password Help</h1>
      <p className="mb-2 text-center text-sm text-gray-600">
        Enter your username/email address to receive temporary password.
      </p>
      <input
        type="email"
        placeholder="Username/email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
        className="h-8 w-40 rounded border border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-loonsRed disabled:opacity-50"
      />
      <Button
        variant="secondary"
        text="Submit"
        disabled={loading}
        isLoading={loading}
        classes="max-w-[100px] flex justify-center items-center"
        loadingMessage="Submitting"
        testId="submit-button"
      />
      {error && (
        <p className="h-4 max-w-xs text-center text-sm text-red-500">
          {'' || error}
        </p>
      )}
      {message && (
        <p className="h-12 max-w-xs text-center text-sm text-green-600">
          {'' || message}
        </p>
      )}
      <div className="mt-10 flex items-center justify-center text-lg text-loonsRed transition-colors duration-300 hover:cursor-pointer hover:text-[#f38686]">
        <Link href="/password-reset" className="text-center text-lg">
          Already know your username and password? Reset your password here
        </Link>
      </div>

      <div className="flex h-10 items-center justify-center gap-2 text-center text-xs">
        <BackArrow />
        <Link href="/login">Back to login</Link>
      </div>
    </form>
  )
}

export default PasswordHelp
