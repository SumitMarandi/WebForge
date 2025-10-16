import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/utils/supabase'
import { User } from '@supabase/supabase-js'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import EditorPage from '@/pages/EditorPage'
import BillingPage from '@/pages/BillingPage'
import ProfilePage from '@/pages/ProfilePage'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Layout user={user}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={user ? <DashboardPage /> : <LoginPage />} />
        <Route path="/editor/:siteId" element={user ? <EditorPage /> : <LoginPage />} />
        <Route path="/billing" element={user ? <BillingPage /> : <LoginPage />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <LoginPage />} />
      </Routes>
    </Layout>
  )
}

export default App