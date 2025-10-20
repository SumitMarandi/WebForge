import React, { useState, useEffect } from 'react'
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react'

interface SessionWarningProps {
  isVisible: boolean
  onExtendSession: () => void
  onLogout: () => void
  warningDuration?: number // in milliseconds
}

export default function SessionWarning({ 
  isVisible, 
  onExtendSession, 
  onLogout,
  warningDuration = 30 * 60 * 1000 // 30 minutes
}: SessionWarningProps) {
  const [timeLeft, setTimeLeft] = useState(warningDuration)

  useEffect(() => {
    if (!isVisible) {
      setTimeLeft(warningDuration)
      return
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          onLogout()
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isVisible, warningDuration, onLogout])

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Session Expiring Soon
            </h3>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            Your session will expire due to inactivity. You'll be automatically logged out in:
          </p>
          
          <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
            <Clock className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-2xl font-mono font-bold text-gray-900">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Why am I seeing this?</strong><br />
            For security reasons, we automatically log out users after 2 days of inactivity.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onExtendSession}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Stay Logged In
          </button>
          <button
            onClick={onLogout}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Logout Now
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-3 text-center">
          Any unsaved changes will be lost if you're logged out.
        </p>
      </div>
    </div>
  )
}