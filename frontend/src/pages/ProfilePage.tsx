import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/utils/supabase'
import { User, Mail, Phone, Briefcase, Save, ArrowLeft, Camera, Shield } from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

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

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      
      if (user) {
        setUser(user)
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
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
      </div>

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

        {/* Main Content */}
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

          {/* Security Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Security
              </h2>
              <p className="text-gray-600 text-sm mt-1">Manage your account security</p>
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
        </div>
      </div>
    </div>
  )
}