import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import { useToast } from './ToastContainer'
import SessionWarning from './SessionWarning'

interface SessionManagerProps {
  children: React.ReactNode
}

export default function SessionManager({ children }: SessionManagerProps) {
  const [showWarning, setShowWarning] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { resetTimeout, logout } = useSessionTimeout({
    timeoutDuration: 2 * 24 * 60 * 60 * 1000, // 2 days
    warningDuration: 30 * 60 * 1000, // 30 minutes warning
    onWarning: () => {
      setShowWarning(true)
    },
    onTimeout: () => {
      setShowWarning(false)
      navigate('/')
      // Show toast notification that session expired
      setTimeout(() => {
        showToast(
          'warning', 
          'Session Expired', 
          'Your session has expired due to inactivity. Please log in again.',
          8000
        )
      }, 500)
    }
  })

  const handleExtendSession = () => {
    setShowWarning(false)
    resetTimeout()
    showToast('success', 'Session Extended', 'Your session has been extended for another 2 days.')
  }

  const handleLogoutNow = () => {
    setShowWarning(false)
    logout()
    navigate('/')
  }

  return (
    <>
      {children}
      <SessionWarning
        isVisible={showWarning}
        onExtendSession={handleExtendSession}
        onLogout={handleLogoutNow}
        warningDuration={30 * 60 * 1000} // 30 minutes
      />
    </>
  )
}