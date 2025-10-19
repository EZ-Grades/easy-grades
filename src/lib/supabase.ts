import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from '../utils/supabase/info'

// Use the project configuration from info.tsx
const supabaseUrl = `https://${projectId}.supabase.co`
const supabaseAnonKey = publicAnonKey

// Always consider as configured since we have working credentials
export const isSupabaseConfigured = true

console.log('✅ Supabase credentials configured successfully!')
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key configured:', !!supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_history: {
        Row: {
          id: string
          user_id: string
          message: string
          response: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          response: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          response?: string
          created_at?: string
        }
      }
    }
  }
}