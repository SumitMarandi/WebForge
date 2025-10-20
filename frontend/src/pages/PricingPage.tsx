import { useState } from 'react'
import { Check, Star, Zap, Crown, ArrowRight, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PricingPlan {
  id: string
  name: string
  price: string
  period: string
  description: string
  features: string[]
  limitations?: string[]
  popular?: boolean
  icon: React.ReactNode
  buttonText: string
  buttonStyle: string
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Perfect for getting started with website building',
      features: [
        '3 websites maximum',
        '3 pages per website',
        'Basic templates',
        'Standard support',
        'WebForge watermark',
        'Basic customization'
      ],
      limitations: [
        'Limited to 3 websites',
        'Maximum 3 pages per site',
        'WebForge branding included',
        'No download functionality'
      ],
      icon: <Star className="w-6 h-6" />,
      buttonText: 'Get Started Free',
      buttonStyle: 'btn-secondary'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingCycle === 'monthly' ? '₹299' : '₹2,990',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'Most popular choice for professionals and small businesses',
      features: [
        'Everything in Free',
        '10 websites maximum',
        '5 pages per website',
        'Advanced pre-built templates',
        'Priority support',
        'No watermark',
        'Download HTML/CSS/JS',
        'Custom domain support',
        'Advanced customization',
        'SEO optimization tools'
      ],
      popular: true,
      icon: <Zap className="w-6 h-6" />,
      buttonText: 'Start Pro Plan',
      buttonStyle: 'btn-primary'
    },
    {
      id: 'business',
      name: 'Business',
      price: billingCycle === 'monthly' ? '₹999' : '₹9,990',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'For agencies and businesses with unlimited needs',
      features: [
        'Everything in Pro',
        'Unlimited websites',
        'Unlimited pages',
        '24/7 priority support',
        'White-label solution',
        'Advanced analytics',
        'Team collaboration',
        'Custom integrations',
        'Dedicated account manager',
        'Custom templates'
      ],
      icon: <Crown className="w-6 h-6" />,
      buttonText: 'Start Business Plan',
      buttonStyle: 'btn-primary'
    }
  ]



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Start building amazing websites today. Upgrade anytime as your needs grow.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12">
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
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-blue-500 scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
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

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limitations */}
                {plan.limitations && (
                  <div className="border-t border-gray-200 pt-6 mb-8">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Plan Limitations:</h4>
                    <div className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          <span className="text-gray-600 text-sm">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <Link
                  to={plan.id === 'free' ? '/dashboard' : '/profile?tab=billing'}
                  className={`w-full ${plan.buttonStyle} flex items-center justify-center group`}
                >
                  {plan.buttonText}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Solution */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Need Something Custom?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Looking for enterprise features, custom integrations, or have specific requirements? 
            Let's discuss a tailored solution for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/contact"
              className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Sales
            </Link>
            <a
              href="mailto:sales@webforge.com"
              className="text-gray-300 hover:text-white transition-colors"
            >
              sales@webforge.com
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                q: "Can I upgrade or downgrade my plan anytime?",
                a: "Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the next billing cycle."
              },
              {
                q: "What happens if I exceed my plan limits?",
                a: "We'll notify you when you're approaching your limits. You can upgrade your plan or remove some content to stay within limits."
              },
              {
                q: "Is there a free trial for paid plans?",
                a: "Yes, all paid plans come with a 14-day free trial. No credit card required to start."
              },
              {
                q: "Can I cancel my subscription anytime?",
                a: "Absolutely. You can cancel your subscription at any time from your account settings. Your websites will remain active until the end of your billing period."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}