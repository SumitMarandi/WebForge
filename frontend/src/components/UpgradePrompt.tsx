import { Crown, Zap, ArrowRight, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SubscriptionPlan } from '@/utils/subscription'

interface UpgradePromptProps {
  currentPlan: SubscriptionPlan
  feature: string
  description: string
  onClose?: () => void
  className?: string
}

export default function UpgradePrompt({ 
  currentPlan, 
  feature, 
  description, 
  onClose,
  className = '' 
}: UpgradePromptProps) {
  const getRecommendedPlan = () => {
    if (currentPlan === 'free') {
      return {
        name: 'Pro Plan',
        price: '₹299/month',
        icon: <Zap className="w-5 h-5" />,
        color: 'from-blue-600 to-blue-700'
      }
    }
    return {
      name: 'Business Plan',
      price: '₹999/month',
      icon: <Crown className="w-5 h-5" />,
      color: 'from-purple-600 to-purple-700'
    }
  }

  const recommendedPlan = getRecommendedPlan()

  return (
    <div className={`bg-gradient-to-r ${recommendedPlan.color} rounded-lg p-6 text-white ${className}`}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      
      <div className="flex items-start">
        <div className="bg-white/20 p-3 rounded-lg mr-4 flex-shrink-0">
          {recommendedPlan.icon}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">
            Upgrade to {feature}
          </h3>
          <p className="text-white/90 mb-4 text-sm">
            {description}
          </p>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Upgrade to</p>
              <p className="font-semibold">{recommendedPlan.name}</p>
              <p className="text-white/80 text-sm">{recommendedPlan.price}</p>
            </div>
            
            <Link
              to="/pricing"
              className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center group"
            >
              Upgrade Now
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Specific upgrade prompts for common scenarios
export const WebsiteLimitPrompt = ({ currentPlan, onClose }: { currentPlan: SubscriptionPlan, onClose?: () => void }) => (
  <UpgradePrompt
    currentPlan={currentPlan}
    feature="Create More Websites"
    description="You've reached your website limit. Upgrade to create unlimited websites and unlock advanced features."
    onClose={onClose}
  />
)

export const PageLimitPrompt = ({ currentPlan, onClose }: { currentPlan: SubscriptionPlan, onClose?: () => void }) => (
  <UpgradePrompt
    currentPlan={currentPlan}
    feature="Add More Pages"
    description="You've reached the page limit for this website. Upgrade to add more pages and enhance your site."
    onClose={onClose}
  />
)

export const DownloadPrompt = ({ currentPlan, onClose }: { currentPlan: SubscriptionPlan, onClose?: () => void }) => (
  <UpgradePrompt
    currentPlan={currentPlan}
    feature="Download Your Code"
    description="Download HTML, CSS & JavaScript files to host your website anywhere. Available with Pro and Business plans."
    onClose={onClose}
  />
)

export const AdvancedTemplatesPrompt = ({ currentPlan, onClose }: { currentPlan: SubscriptionPlan, onClose?: () => void }) => (
  <UpgradePrompt
    currentPlan={currentPlan}
    feature="Access Advanced Templates"
    description="Unlock premium templates designed by professionals. Get access to exclusive designs and layouts."
    onClose={onClose}
  />
)