import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/utils/supabase'
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Save,
  ArrowLeft,
  Camera,
  Shield,
  CreditCard,
  Receipt,
  Crown,
  Zap,
  Star,
  Check,
  Plus,
  Edit3,
  Trash2,
  TrendingUp,
  Globe,
  FileText,
  Download
} from 'lucide-react'
import SessionStatus from '@/components/SessionStatus'
import { useToast } from '@/components/ToastContainer'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { SubscriptionPlan } from '@/utils/subscription'
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

export default function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { subscription } = useSubscription()

  // Tab management
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'security'>(() => {
    const tab = searchParams.get('tab')
    return (tab === 'billing' || tab === 'security') ? tab : 'profile'
  })

  // Billing state
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [usageStats, setUsageStats] = useState<UsageStats>({ websites: 0, totalPages: 0, storageUsed: 0, bandwidthUsed: 0 })
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    role: '',
    email: ''
  })

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetchUserProfile()
    fetchBillingData()
  }, [])

  useEffect(() => {
    // Update URL when tab changes
    if (activeTab !== 'profile') {
      setSearchParams({ tab: activeTab })
    } else {
      setSearchParams({})
    }
  }, [activeTab, setSearchParams])

  const fetchUserProfile = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error

      if (user) {
        setFormData({
          full_name: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || '',
          role: user.user_metadata?.role || '',
          email: user.email || ''
        })
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role
        }
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setSaving(true)
    setError('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setSuccess(true)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordSection(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSaving(false)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your profile, billing, and security preferences</p>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mt-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'profile', name: 'Profile', icon: User },
              { id: 'billing', name: 'Billing', icon: CreditCard },
              { id: 'security', name: 'Security', icon: Shield }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
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

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                    {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  {formData.full_name || 'User'}
                </h3>
                <p className="text-gray-600">{formData.email}</p>
                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Active Account
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Success/Error Messages */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-600 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Profile updated successfully!
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Profile Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Personal Information
                </h2>
                <p className="text-gray-600 text-sm mt-1">Update your personal details</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  {/* Email (readonly) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                        placeholder="Email address"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role / Profession
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white appearance-none"
                      >
                        <option value="">Select your role</option>
                        <option value="entrepreneur">Entrepreneur</option>
                        <option value="freelancer">Freelancer</option>
                        <option value="small-business">Small Business Owner</option>
                        <option value="developer">Developer</option>
                        <option value="designer">Designer</option>
                        <option value="marketer">Marketer</option>
                        <option value="consultant">Consultant</option>
                        <option value="student">Student</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>


          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
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
                <button
                  onClick={() => setActiveTab('billing')}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </button>
                <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">
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

          {/* Plans */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Subscription Plans</h3>
              <p className="text-gray-600 text-sm">Choose the plan that best fits your needs</p>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-8">
              <span className={`mr-3 text-sm ${billingCycle === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
              <span className={`ml-3 text-sm ${billingCycle === 'yearly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Yearly
              </span>
              {billingCycle === 'yearly' && (
                <span className="ml-3 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  Save 17%
                </span>
              )}
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isCurrentPlan = subscription?.plan === plan.id

                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${plan.popular
                      ? 'border-blue-500'
                      : 'border-gray-200 hover:border-gray-300'
                      } ${isCurrentPlan ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {isCurrentPlan && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Current Plan
                        </span>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="text-center mb-6">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {plan.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                        <div className="mb-4">
                          <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                          <span className="text-gray-600 ml-1">{plan.period}</span>
                        </div>

                        {billingCycle === 'yearly' && plan.id !== 'free' && (
                          <p className="text-sm text-green-600 font-medium">
                            Save ₹{plan.id === 'pro' ? '598' : '1,998'} per year
                          </p>
                        )}
                      </div>

                      <div className="space-y-3 mb-6">
                        {plan.features.slice(0, 4).map((feature, index) => (
                          <div key={index} className="flex items-start">
                            <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => !isCurrentPlan && handleUpgrade(plan.id)}
                        disabled={isCurrentPlan}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${isCurrentPlan
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : plan.popular
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                          }`}
                      >
                        {isCurrentPlan ? '✓ Current Plan' : plan.buttonText}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Billing History */}
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
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${bill.status === 'paid'
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

          {/* Payment Methods */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Payment Methods</h3>
                <p className="text-gray-600 text-sm mt-1">Manage your payment methods</p>
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

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="max-w-2xl space-y-6">
          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-600 text-sm flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Security settings updated successfully!
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Password Change */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Change Password
              </h2>
              <p className="text-gray-600 text-sm mt-1">Update your account password</p>
            </div>

            <div className="p-6">
              {!showPasswordSection ? (
                <button
                  onClick={() => setShowPasswordSection(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Change Password
                </button>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter new password"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordSection(false)
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      }}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Session Status */}
          <SessionStatus
            onExtendSession={() => {
              showToast('success', 'Session Extended', 'Your session has been extended for another 2 days.')
            }}
          />
        </div>
      )}
    </div>
  )
}