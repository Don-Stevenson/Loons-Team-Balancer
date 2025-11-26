'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '../../../../../utils/FEapi'
import { Button } from '../Button/Button'

export default function Logout({ variant }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      text="Logout"
      testId="logout-button"
      classes="font-semibold w-full"
      isLoading={isLoading}
    />
  )
}
