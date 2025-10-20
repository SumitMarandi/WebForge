import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  CreditCard, 
  Download, 
  Crown, 
  Zap, 
  Star,
  ArrowLeft,
  Receipt,
  Shield,
  Check,
  Plus,
  Edit3,
  Trash2,
  TrendingUp,
  Globe,
  FileText
} from 'lucide-react'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { 
  SubscriptionPlan 
} from '@/utils/subscription'
import { supabase } from '@/utils/supabase'
import SubscriptionStatus from '@/components/SubscriptionStatus'

interface BillingHistory {
  id: string
  date: string
  amount: string
  status: 'paid' | 'pending' | 'failed'
  plan: string
  period: string
  invoice_url?: string
}

interface PaymentMethod {
  id: string
  type: 'card' | 'upi' | 'netbanking'
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

interface UsageStats {
  websites: number
  totalPages: number
  storageUsed: number
  bandwidthUsed: number
}

export default function BillingPage() {
  const { subscription, loading: subscriptionLoading } = useSubscription()
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'billing' | 'payment'>('overview')
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [usageStats, setUsageStats] = useState<UsageStats>({ websites: 0, totalPages: 0, storageUsed: 0, bandwidthUsed: 0 })
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch usage stats
      const { data: sites } = await supabase
        .from('sites')
        .select('id')
        .eq('user_id', user.id)

      const { data: pages } = await supabase
        .from('pages')
        .select('id')
        .in('site_id', sites?.map(s => s.id) || [])

      setUsageStats({
        websites: sites?.length || 0,
        totalPages: pages?.length || 0,
        storageUsed: Math.floor(Math.random() * 500), // Mock data
        bandwidthUsed: Math.floor(Math.random() * 1000) // Mock data
      })

      // Mock billing history
      setBillingHistory([
        {
          id: '1',
          date: '2024-01-15',
          amount: '₹299',
          status: 'paid',
          plan: 'Pro',
          period: 'Monthly',
          invoice_url: '#'
        },
        {
          id: '2',
          date: '2023-12-15',
          amount: '₹299',
          status: 'paid',
          plan: 'Pro',
          period: 'Monthly',
          invoice_url: '#'
        }
      ])

      // Mock payment methods
      setPaymentMethods([
        {
          id: '1',
          type: 'card',
          last4: '4242',
          brand: 'Visa',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true
        }
      ])

    } catch (error) {
      console.error('Error fetching billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planName: SubscriptionPlan) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Call Supabase Edge Function to create Cashfree order
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          plan: planName,
          userId: user.id,
          billing: billingCycle
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

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return
    }

    try {
      // Implementation for canceling subscription
      console.log('Canceling subscription...')
      alert('Subscription cancellation requested. You will receive a confirmation email.')
    } catch (error) {
      console.error('Error canceling subscription:', error)
      alert('Error canceling subscription. Please contact support.')
    }
  }

  const plans = [
    {
      id: 'free' as SubscriptionPlan,
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '3 websites maximum',
        '3 pages per website',
        'Basic templates',
        'Standard support',
        'WebForge watermark'
      ],
      icon: <Star className="w-6 h-6" />,
      buttonText: 'Current Plan',
      popular: false
    },
    {
      id: 'pro' as SubscriptionPlan,
      name: 'Pro',
      price: billingCycle === 'monthly' ? '₹299' : '₹2,990',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'Most popular for professionals',
      features: [
        'Everything in Free',
        '10 websites maximum',
        '5 pages per website',
        'Advanced templates',
        'Priority support',
        'No watermark',
        'Download code',
        'Custom domain support'
      ],
      icon: <Zap className="w-6 h-6" />,
      buttonText: 'Upgrade to Pro',
      popular: true
    },
    {
      id: 'business' as SubscriptionPlan,
      name: 'Business',
      price: billingCycle === 'monthly' ? '₹999' : '₹9,990',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'For agencies and businesses',
      features: [
        'Everything in Pro',
        'Unlimited websites',
        'Unlimited pages',
        '24/7 priority support',
        'White-label solution',
        'Advanced analytics',
        'Team collaboration',
        'Custom integrations'
      ],
      icon: <Crown className="w-6 h-6" />,
      buttonText: 'Upgrade to Business',
      popular: false
    }
  ]

  if (subscriptionLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link to="/dashboard" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
              <p className="text-gray-600 mt-1">Manage your subscription, billing, and usage</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: TrendingUp },
                { id: 'plans', name: 'Plans', icon: Crown },
                { id: 'billing', name: 'Billing History', icon: Receipt },
                { id: 'payment', name: 'Payment Methods', icon: CreditCard }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Current Subscription */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <SubscriptionStatus websiteCount={usageStats.websites} />
              </div>
              
              {/* Quick Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/pricing"
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Link>
                  <button
                    onClick={() => setActiveTab('payment')}
                    className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Payment
                  </button>
                  <button
                    onClick={() => setActiveTab('billing')}
                    className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    View Invoices
                  </button>
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Usage Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{usageStats.websites}</div>
                  <div className="text-sm text-gray-600">Websites</div>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{usageStats.totalPages}</div>
                  <div className="text-sm text-gray-600">Total Pages</div>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{usageStats.storageUsed}MB</div>
                  <div className="text-sm text-gray-600">Storage Used</div>
                </div>
                <div className="text-center">
                  <div className="bg-orange-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{usageStats.bandwidthUsed}MB</div>
                  <div className="text-sm text-gray-600">Bandwidth</div>
                </div>
              </div>
            </div>

            {/* Subscription Management */}
            {subscription && subscription.plan !== 'free' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Subscription Management</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">
                      Your subscription will renew on{' '}
                      <span className="font-medium text-gray-900">
                        {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={handleCancelSubscription}
                    className="text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-8">
            {/* Billing Toggle */}
            <div className="flex items-center justify-center">
              <span className={`mr-3 ${billingCycle === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`ml-3 ${billingCycle === 'yearly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Yearly
              </span>
              {billingCycle === 'yearly' && (
                <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  Save 17%
                </span>
              )}
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => {
                const isCurrentPlan = subscription?.plan === plan.id
                
                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${
                      plan.popular 
                        ? 'border-blue-500 scale-105' 
                        : 'border-gray-200 hover:border-gray-300'
                    } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {isCurrentPlan && (
                      <div className="absolute -top-4 right-4">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Current Plan
                        </span>
                      </div>
                    )}

                    <div className="p-8">
                      <div className="text-center mb-8">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                          plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {plan.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                        
                        <div className="mb-4">
                          <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                          <span className="text-gray-600 ml-1">{plan.period}</span>
                        </div>

                        {billingCycle === 'yearly' && plan.id !== 'free' && (
                          <p className="text-sm text-green-600 font-medium">
                            Save ₹{plan.id === 'pro' ? '598' : '1,998'} per year
                          </p>
                        )}
                      </div>

                      <div className="space-y-4 mb-8">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start">
                            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => !isCurrentPlan && handleUpgrade(plan.id)}
                        disabled={isCurrentPlan}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                          isCurrentPlan
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : plan.popular
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        {isCurrentPlan ? 'Current Plan' : plan.buttonText}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Billing History Tab */}
        {activeTab === 'billing' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Billing History</h3>
              <p className="text-gray-600 text-sm mt-1">View and download your past invoices</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {billingHistory.length > 0 ? billingHistory.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(bill.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bill.plan} ({bill.period})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bill.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          bill.status === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : bill.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a
                          href={bill.invoice_url}
                          className="text-blue-600 hover:text-blue-700 flex items-center"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </a>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No billing history available</p>
                        <p className="text-sm mt-1">Your invoices will appear here after your first payment</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Payment Methods</h3>
                  <p className="text-gray-600 text-sm mt-1">Manage your payment methods and billing information</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Method
                </button>
              </div>
              
              <div className="p-6">
                {paymentMethods.length > 0 ? (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="bg-gray-100 rounded-lg p-3 mr-4">
                            <CreditCard className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-900">
                                {method.brand} •••• {method.last4}
                              </span>
                              {method.isDefault && (
                                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="text-gray-400 hover:text-gray-600 p-2">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="text-gray-400 hover:text-red-600 p-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No payment methods added</p>
                    <p className="text-sm text-gray-400 mt-1">Add a payment method to upgrade your plan</p>
                  </div>
                )}
              </div>
            </div>

            {/* Billing Information */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Billing Information</h3>
                <p className="text-gray-600 text-sm mt-1">Update your billing address and tax information</p>
              </div>
              <div className="p-6">
                <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Update Billing Information
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}