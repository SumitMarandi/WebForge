import { useState } from 'react'
import { Crown, Zap, Star, ArrowRight, AlertTriangle, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { 
  SUBSCRIPTION_LIMITS, 
  getPlanDisplayName, 
  getPlanColor,
  getUpgradeMessage 
} from '@/utils/subscription'

interface SubscriptionStatusProps {
  websiteCount: number
  className?: string
}

export default function SubscriptionStatus({ websiteCount, className = '' }: SubscriptionStatusProps) {
  const { subscription } = useSubscription()
  const [showDetails, setShowDetails] = useState(false)

  if (!subscription) return null

  const limits = SUBSCRIPTION_LIMITS[subscription.plan]
  const planColor = getPlanColor(subscription.plan)
  
  const getPlanIcon = () => {
    switch (subscription.plan) {
      case 'free':
        return <Star className="w-4 h-4" />
      case 'pro':
        return <Zap className="w-4 h-4" />
      case 'business':
        return <Crown className="w-4 h-4" />
    }
  }

  const isNearLimit = (current: number, max: number) => {
    if (max === -1) return false // Unlimited
    return current >= max * 0.8 // 80% of limit
  }

  const isAtLimit = (current: number, max: number) => {
    if (max === -1) return false // Unlimited
    return current >= max
  }

  const websiteUsage = {
    current: websiteCount,
    max: limits.maxWebsites,
    percentage: limits.maxWebsites === -1 ? 0 : (websiteCount / limits.maxWebsites) * 100
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${planColor} mr-3`}>
              {getPlanIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{getPlanDisplayName(subscription.plan)}</h3>
              <p className="text-sm text-gray-600">
                {subscription.status === 'trial' ? 'Trial Period' : 'Active Subscription'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowRight className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Usage Overview */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Website Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Websites</span>
              <span className="text-sm text-gray-600">
                {websiteUsage.current} / {websiteUsage.max === -1 ? '∞' : websiteUsage.max}
              </span>
            </div>
            {websiteUsage.max !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isAtLimit(websiteUsage.current, websiteUsage.max)
                      ? 'bg-red-500'
                      : isNearLimit(websiteUsage.current, websiteUsage.max)
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(websiteUsage.percentage, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Limit Warning */}
          {isAtLimit(websiteUsage.current, websiteUsage.max) && (
            <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-red-700 font-medium">Website limit reached</p>
                <p className="text-red-600 mt-1">
                  {getUpgradeMessage(subscription.plan, 'create more websites')}
                </p>
              </div>
            </div>
          )}

          {/* Near Limit Warning */}
          {isNearLimit(websiteUsage.current, websiteUsage.max) && !isAtLimit(websiteUsage.current, websiteUsage.max) && (
            <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-yellow-700 font-medium">Approaching limit</p>
                <p className="text-yellow-600 mt-1">
                  Consider upgrading to avoid hitting your website limit.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Features */}
      {showDetails && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-3">Plan Features</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { key: 'maxPagesPerSite', label: 'Pages per site', value: limits.maxPagesPerSite === -1 ? 'Unlimited' : limits.maxPagesPerSite },
              { key: 'hasAdvancedTemplates', label: 'Advanced templates', value: limits.hasAdvancedTemplates },
              { key: 'hasPrioritySupport', label: 'Priority support', value: limits.hasPrioritySupport },
              { key: 'hasNoWatermark', label: 'No watermark', value: limits.hasNoWatermark },
              { key: 'hasDownloadAccess', label: 'Download code', value: limits.hasDownloadAccess },
              { key: 'has24x7Support', label: '24/7 support', value: limits.has24x7Support }
            ].map((feature) => (
              <div key={feature.key} className="flex items-center text-sm">
                {typeof feature.value === 'boolean' ? (
                  <>
                    {feature.value ? (
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <div className="w-4 h-4 mr-2" />
                    )}
                    <span className={feature.value ? 'text-gray-700' : 'text-gray-400'}>
                      {feature.label}
                    </span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-gray-700">
                      {feature.label}: {feature.value}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade CTA */}
      {subscription.plan !== 'business' && (
        <div className="border-t border-gray-200 p-4">
          <Link
            to="/pricing"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center group"
          >
            Upgrade Plan
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  )
}