import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { Check, Crown, Zap } from 'lucide-react'

interface Subscription {
  id: string
  plan: string
  status: string
  current_period_end: string
}

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    features: [
      '1 website',
      '5 pages per site',
      'Basic templates',
      'WebForge subdomain',
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    name: 'Pro',
    price: '₹299',
    period: 'month',
    features: [
      '5 websites',
      'Unlimited pages',
      'Premium templates',
      'Custom domain',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    name: 'Business',
    price: '₹999',
    period: 'month',
    features: [
      'Unlimited websites',
      'Unlimited pages',
      'All templates',
      'Custom domain',
      'White-label option',
      '24/7 support',
    ],
    cta: 'Upgrade to Business',
    popular: false,
  },
]

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setSubscription(data)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Call Supabase Edge Function to create Cashfree order
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          plan: planName.toLowerCase(),
          userId: user.id,
        }
      })

      if (error) throw error

      // Redirect to Cashfree checkout
      if (data.paymentLink) {
        window.location.href = data.paymentLink
      }
    } catch (error) {
      console.error('Error creating payment:', error)
      alert('Error processing payment. Please try again.')
    }
  }

  const getCurrentPlan = () => {
    if (!subscription) return 'free'
    return subscription.plan
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="mt-4 text-xl text-gray-600">
          Scale your web presence with the right plan for you
        </p>
      </div>

      {subscription && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-800">
              You're currently on the <strong>{subscription.plan}</strong> plan.
              {subscription.current_period_end && (
                <span className="ml-1">
                  Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {plans.map((plan) => {
          const currentPlan = getCurrentPlan()
          const isCurrentPlan = plan.name.toLowerCase() === currentPlan
          
          return (
            <div
              key={plan.name}
              className={`relative rounded-2xl border ${
                plan.popular
                  ? 'border-primary-500 shadow-lg'
                  : 'border-gray-200'
              } bg-white p-8`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-primary-500 text-white">
                    <Crown className="w-4 h-4 mr-1" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="ml-1 text-xl text-gray-500">/{plan.period}</span>
                </div>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.cta}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-16 bg-gray-50 rounded-2xl p-8">
        <div className="text-center">
          <Zap className="mx-auto h-12 w-12 text-primary-500" />
          <h3 className="mt-4 text-2xl font-bold text-gray-900">
            Need something custom?
          </h3>
          <p className="mt-2 text-gray-600">
            Contact us for enterprise solutions and custom pricing.
          </p>
          <button className="mt-6 btn-primary">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  )
}