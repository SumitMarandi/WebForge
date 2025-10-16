import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/utils/supabase'
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, User, Phone, Briefcase } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        // Show success message briefly before redirecting
        if (data.user) {
          setError('') // Clear any previous errors
          setSuccess(true)
          // Add a small delay to show success state
          setTimeout(() => {
            navigate('/dashboard')
          }, 1000)
        }
      } else {
        // Validate signup fields
        if (!name.trim()) {
          throw new Error('Name is required')
        }
        if (!phone.trim()) {
          throw new Error('Phone number is required')
        }
        if (!role.trim()) {
          throw new Error('Role is required')
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              phone: phone,
              role: role,
            }
          }
        })
        if (error) throw error

        if (data.user) {
          if (data.user.email_confirmed_at) {
            // User is immediately confirmed, redirect to dashboard
            setSuccess(true)
            setTimeout(() => {
              navigate('/dashboard')
            }, 1000)
          } else {
            // User needs to confirm email
            setError('✅ Account created! Check your email for the confirmation link.')
          }
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-gradient-to-br from-pink-400 to-red-600 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>

        {/* Geometric shapes */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-blue-400 rounded-full opacity-60 animate-bounce"></div>
        <div className="absolute top-40 right-40 w-3 h-3 bg-purple-400 rounded-full opacity-60 animate-bounce animation-delay-1000"></div>
        <div className="absolute bottom-32 right-20 w-5 h-5 bg-pink-400 rounded-full opacity-60 animate-bounce animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-2 h-2 bg-indigo-400 rounded-full opacity-60 animate-bounce animation-delay-3000"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Main card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 space-y-8 animate-float" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)' }}>
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Sparkles className="text-white h-8 w-8" />
            </div>
            <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {isLogin ? 'Welcome back!' : 'Join WebForge'}
            </h2>
            <p className="mt-2 text-gray-600">
              {isLogin ? 'Sign in to continue building amazing websites' : 'Create your account and start building'}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name field - only for signup */}
              {!isLogin && (
                <div className="relative group">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="relative group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Phone field - only for signup */}
              {!isLogin && (
                <div className="relative group">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Role field - only for signup */}
              {!isLogin && (
                <div className="relative group">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Role / Profession
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <select
                      id="role"
                      name="role"
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 appearance-none"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
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
                    {/* Custom dropdown arrow */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Password field */}
              <div className="relative group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
            </div>

            {/* Success message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-600 text-sm text-center flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Login successful! Taking you to dashboard...</span>
                </p>
              </div>
            )}

            {/* Error message */}
            {error && !success && (
              <div className={`border rounded-xl p-4 animate-shake ${error.startsWith('✅')
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
                }`}>
                <p className={`text-sm text-center ${error.startsWith('✅') ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {error}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || success}
              className={`w-full py-3 px-4 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed transform transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${success
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-[1.02] disabled:opacity-50'
                }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : success ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Success! Redirecting...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign in' : 'Create account'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between login/signup */}
          <div className="text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                {isLogin ? 'Sign up for free' : 'Sign in instead'}
              </button>
            </p>
          </div>

          {/* Features preview for signup */}
          {!isLogin && (
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl">🚀</div>
                  <p className="text-xs text-gray-600">Fast Setup</p>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl">🎨</div>
                  <p className="text-xs text-gray-600">Beautiful Design</p>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl">📱</div>
                  <p className="text-xs text-gray-600">Mobile Ready</p>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl">⚡</div>
                  <p className="text-xs text-gray-600">Lightning Fast</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Secure authentication powered by Supabase
          </p>
        </div>
      </div>
    </div>
  )
}