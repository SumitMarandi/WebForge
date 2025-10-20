// Subscription management utilities

export type SubscriptionPlan = 'free' | 'pro' | 'business'

export interface SubscriptionLimits {
  maxWebsites: number
  maxPagesPerSite: number
  hasAdvancedTemplates: boolean
  hasPrioritySupport: boolean
  hasNoWatermark: boolean
  hasDownloadAccess: boolean
  hasCustomDomain: boolean
  hasAnalytics: boolean
  hasTeamCollaboration: boolean
  has24x7Support: boolean
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionPlan, SubscriptionLimits> = {
  free: {
    maxWebsites: 3,
    maxPagesPerSite: 3,
    hasAdvancedTemplates: false,
    hasPrioritySupport: false,
    hasNoWatermark: false,
    hasDownloadAccess: false,
    hasCustomDomain: false,
    hasAnalytics: false,
    hasTeamCollaboration: false,
    has24x7Support: false
  },
  pro: {
    maxWebsites: 10,
    maxPagesPerSite: 5,
    hasAdvancedTemplates: true,
    hasPrioritySupport: true,
    hasNoWatermark: true,
    hasDownloadAccess: true,
    hasCustomDomain: true,
    hasAnalytics: true,
    hasTeamCollaboration: false,
    has24x7Support: false
  },
  business: {
    maxWebsites: -1, // Unlimited
    maxPagesPerSite: -1, // Unlimited
    hasAdvancedTemplates: true,
    hasPrioritySupport: true,
    hasNoWatermark: true,
    hasDownloadAccess: true,
    hasCustomDomain: true,
    hasAnalytics: true,
    hasTeamCollaboration: true,
    has24x7Support: true
  }
}

export interface UserSubscription {
  plan: SubscriptionPlan
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  currentPeriodEnd: string
  trialEnd?: string
  websiteCount: number
}

export const checkLimit = (
  subscription: UserSubscription,
  limitType: keyof SubscriptionLimits,
  currentCount?: number
): boolean => {
  const limits = SUBSCRIPTION_LIMITS[subscription.plan]
  const limit = limits[limitType]

  // For boolean limits, just return the value
  if (typeof limit === 'boolean') {
    return limit
  }

  // For numeric limits, check against current count
  if (typeof limit === 'number' && currentCount !== undefined) {
    return limit === -1 || currentCount < limit // -1 means unlimited
  }

  return false
}

export const canCreateWebsite = (subscription: UserSubscription): boolean => {
  return checkLimit(subscription, 'maxWebsites', subscription.websiteCount)
}

export const canCreatePage = (subscription: UserSubscription, currentPageCount: number): boolean => {
  return checkLimit(subscription, 'maxPagesPerSite', currentPageCount)
}

export const canDownloadCode = (subscription: UserSubscription): boolean => {
  return checkLimit(subscription, 'hasDownloadAccess')
}

export const hasAdvancedFeatures = (subscription: UserSubscription): boolean => {
  return checkLimit(subscription, 'hasAdvancedTemplates')
}

export const getPlanDisplayName = (plan: SubscriptionPlan): string => {
  switch (plan) {
    case 'free':
      return 'Free Plan'
    case 'pro':
      return 'Pro Plan'
    case 'business':
      return 'Business Plan'
    default:
      return 'Unknown Plan'
  }
}

export const getPlanColor = (plan: SubscriptionPlan): string => {
  switch (plan) {
    case 'free':
      return 'text-gray-600 bg-gray-100'
    case 'pro':
      return 'text-blue-600 bg-blue-100'
    case 'business':
      return 'text-purple-600 bg-purple-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export const getUpgradeMessage = (
  currentPlan: SubscriptionPlan,
  feature: string
): string => {
  if (currentPlan === 'free') {
    return `Upgrade to Pro or Business plan to ${feature}`
  }
  if (currentPlan === 'pro') {
    return `Upgrade to Business plan to ${feature}`
  }
  return ''
}

export const formatPrice = (plan: SubscriptionPlan, billing: 'monthly' | 'yearly'): string => {
  const prices = {
    free: { monthly: '₹0', yearly: '₹0' },
    pro: { monthly: '₹299', yearly: '₹2,990' },
    business: { monthly: '₹999', yearly: '₹9,990' }
  }
  
  return prices[plan][billing]
}

// Mock function to get user subscription - replace with actual API call
export const getUserSubscription = async (userId: string): Promise<UserSubscription> => {
  // This would typically fetch from your backend/Supabase
  // For now, return a mock free subscription
  return {
    plan: 'free',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    websiteCount: 0
  }
}

// Mock function to update subscription - replace with actual API call
export const updateSubscription = async (
  userId: string,
  newPlan: SubscriptionPlan
): Promise<UserSubscription> => {
  // This would typically call your payment processor and update the database
  console.log(`Updating subscription for user ${userId} to ${newPlan}`)
  
  return {
    plan: newPlan,
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    websiteCount: 0
  }
}