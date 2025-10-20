import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { 
  UserSubscription, 
  getUserSubscription, 
  updateSubscription,
  SubscriptionPlan 
} from '@/utils/subscription'

interface SubscriptionContextType {
  subscription: UserSubscription | null
  loading: boolean
  updateUserSubscription: (newPlan: SubscriptionPlan) => Promise<void>
  refreshSubscription: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

interface SubscriptionProviderProps {
  children: React.ReactNode
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const userSubscription = await getUserSubscription(user.id)
        setSubscription(userSubscription)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserSubscription = async (newPlan: SubscriptionPlan) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const updatedSubscription = await updateSubscription(user.id, newPlan)
        setSubscription(updatedSubscription)
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      throw error
    }
  }

  const refreshSubscription = async () => {
    setLoading(true)
    await fetchSubscription()
  }

  useEffect(() => {
    fetchSubscription()

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          fetchSubscription()
        } else if (event === 'SIGNED_OUT') {
          setSubscription(null)
          setLoading(false)
        }
      }
    )

    return () => {
      authSubscription.unsubscribe()
    }
  }, [])

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        updateUserSubscription,
        refreshSubscription
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}