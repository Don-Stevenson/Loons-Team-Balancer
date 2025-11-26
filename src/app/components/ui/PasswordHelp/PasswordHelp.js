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

  const handleSubmit = async e => {
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
          'If an account exists with this email, a temporary password has been generated. Please contact your administrator to receive it.'
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
      className="flex flex-col items-center justify-center mt-20 gap-2"
      role="form"
    >
      <Logo />
      <h1 className="text-2xl text-center">Password Help</h1>
      <p className="text-sm text-gray-600 mb-2 text-center">
        Enter your username/email address to receive temporary password.
      </p>
      <input
        type="email"
        placeholder="Username/email"
        value={username}
        onChange={e => setUsername(e.target.value)}
        disabled={loading}
        className="border border-gray-300 rounded w-40 h-8 text-center focus:outline-none focus:ring-2 focus:ring-loonsRed disabled:opacity-50"
      />
      <Button
        variant="secondary"
        text={loading ? 'Submitting' : 'Submit'}
        disabled={loading}
      />
      {error && (
        <p className="text-red-500 text-sm text-center max-w-xs">
          {'' || error}
        </p>
      )}
      {message && (
        <p className="text-green-600 text-sm text-center max-w-xs">
          {'' || message}
        </p>
      )}
      <div className="flex justify-center items-center text-loonsRed hover:cursor-pointer hover:text-[#f38686] transition-colors duration-300 text-lg mt-10">
        <Link href="/password-reset" className="text-lg text-center">
          Already know your username and password? Reset your password here
        </Link>
      </div>

      <div className="flex justify-center text-center items-center h-10 text-xs gap-2">
        <BackArrow />
        <Link href="/login">Back to login</Link>
      </div>
    </form>
  )
}

export default PasswordHelp
