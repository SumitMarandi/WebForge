import { useState, useEffect } from 'react'
import { Clock, Shield, RefreshCw } from 'lucide-react'
import { sessionStorage } from '@/utils/sessionStorage'

interface SessionStatusProps {
  onExtendSession?: () => void
}

export default function SessionStatus({ onExtendSession }: SessionStatusProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [lastActivity, setLastActivity] = useState<Date | null>(null)

  useEffect(() => {
    const updateStatus = () => {
      const lastActivityTime = sessionStorage.getLastActivity()
      if (lastActivityTime) {
        setLastActivity(new Date(lastActivityTime))
        const remaining = sessionStorage.getRemainingTime(2 * 24 * 60 * 60 * 1000) // 2 days
        setTimeRemaining(remaining)
      }
    }

    // Update immediately
    updateStatus()

    // Update every minute
    const interval = setInterval(updateStatus, 60000)

    return () => clearInterval(interval)
  }, [])

  const formatTimeRemaining = (ms: number) => {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000))
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const getStatusColor = () => {
    const hoursRemaining = timeRemaining / (60 * 60 * 1000)
    if (hoursRemaining < 1) return 'text-red-600 bg-red-50 border-red-200'
    if (hoursRemaining < 24) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          Session Status
        </h3>
        {onExtendSession && (
          <button
            onClick={onExtendSession}
            className="btn-secondary text-sm flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Extend
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className={`p-3 rounded-lg border ${getStatusColor()}`}>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              Session expires in: {formatTimeRemaining(timeRemaining)}
            </span>
          </div>
        </div>

        {lastActivity && (
          <div className="text-sm text-gray-600">
            <p>Last activity: {lastActivity.toLocaleString()}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <p>
            <strong>Security Notice:</strong> For your protection, you'll be automatically 
            logged out after 2 days of inactivity. You'll receive a 30-minute warning 
            before logout.
          </p>
        </div>
      </div>
    </div>
  )
}