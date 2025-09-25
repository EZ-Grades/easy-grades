// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from '../utils/supabase/info'

// Build Supabase URL
const supabaseUrl = projectId ? `https://${projectId}.supabase.co` : ''
const supabaseAnonKey = publicAnonKey || ''

// Check if Supabase credentials exist
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

// Log status
if (isSupabaseConfigured()) {
  console.log('✅ Supabase credentials configured successfully!')
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Key configured:', !!supabaseAnonKey)
} else {
  console.error('❌ Supabase is NOT configured. Please check your projectId and anon key.')
}

// Create the client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : (null as any) // Avoids crash if unconfigured

// Database type definitions
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
