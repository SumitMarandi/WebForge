import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fallback for development when Supabase is not configured
const defaultUrl = 'https://placeholder.supabase.co'
const defaultKey = 'placeholder-key'

export const supabase = createClient(
  supabaseUrl || defaultUrl,
  supabaseAnonKey || defaultKey
)

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== defaultUrl && supabaseAnonKey !== defaultKey)

export type Database = {
  public: {
    Tables: {
      sites: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          description: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slug: string
          description?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          slug?: string
          description?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pages: {
        Row: {
          id: string
          site_id: string
          title: string
          slug: string
          content: any
          is_home: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          title: string
          slug: string
          content?: any
          is_home?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          title?: string
          slug?: string
          content?: any
          is_home?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: string
          status: string
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: string
          status: string
          current_period_start: string
          current_period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}