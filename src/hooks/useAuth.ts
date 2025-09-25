import { useState, useEffect } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  username: string
  avatar_url?: string
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

useEffect(() => {
  console.log('🔐 Initializing authentication...')

  const init = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        if (!error.message.includes('Invalid login credentials') &&
            !error.message.includes('session')) {
          console.error('Error getting session:', error)
          setError(error.message)
        } else {
          console.debug('Auth session check:', error.message)
        }
      }

      setSession(session)

      if (session?.user) {
        await fetchUserProfile(session.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Unexpected error during session fetch:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setUser(null)
    } finally {
      // 🚨 this ensures we don’t get stuck forever
      setLoading(false)
    }
  }

  init()

  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      console.log('Auth state changed:', _event, session)
      setSession(session)
      setError(null)

      if (session?.user) {
        await fetchUserProfile(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    }
  )

  return () => subscription.unsubscribe()
}, [])

  useEffect(() => {
  const timeout = setTimeout(() => {
    setLoading(false)
  }, 5000) // fallback after 5s
  return () => clearTimeout(timeout)
}, [])


  const fetchUserProfile = async (authUser: User) => {
    try {
      setLoading(true)
      
      // Check if profile exists - with fallback if profiles table doesn't exist
      let profile: any = null;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const newProfile = {
            id: authUser.id,
            email: authUser.email!,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'Scholar',
            avatar_url: authUser.user_metadata?.avatar_url || null
          }

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single()

          if (createError) {
            console.error('Error creating profile:', createError)
            // Fallback to auth user data
            profile = {
              id: authUser.id,
              email: authUser.email!,
              full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
              username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'Scholar',
              avatar_url: authUser.user_metadata?.avatar_url || null
            };
          } else {
            profile = createdProfile;
          }
        } else if (error) {
          console.error('Error fetching profile:', error)
          // Fallback to auth user data
          profile = {
            id: authUser.id,
            email: authUser.email!,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'Scholar',
            avatar_url: authUser.user_metadata?.avatar_url || null
          };
        } else {
          profile = data;
        }
      } catch (tableError) {
        console.error('Profiles table not found, using fallback auth data:', tableError);
        // Table doesn't exist, use auth user data directly
        profile = {
          id: authUser.id,
          email: authUser.email!,
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'Scholar',
          avatar_url: authUser.user_metadata?.avatar_url || null
        };
      }

      setUser({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name || 'User',
        username: profile.username || 'Scholar',
        avatar_url: profile.avatar_url || undefined
      })
    } catch (err) {
      console.error('Error in fetchUserProfile:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Authentication not configured. Please set up your Supabase credentials.' }
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: fullName.split(' ')[0] || 'Scholar'
          }
        }
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      if (data.user && !data.user.email_confirmed_at) {
        return { 
          success: true, 
          needsVerification: true,
          message: 'Check your email to verify your account before logging in.' 
        }
      }

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Authentication not configured. Please set up your Supabase credentials.' }
    }

    try {
      setLoading(true)
      setError(null)
      console.log('🔐 Attempting to sign in user:', email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        // Log auth errors as warnings instead of errors since they're often user input issues
        console.warn('🔐 Sign in failed:', error.message)
        let errorMessage = error.message;
        
        if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email before logging in. Check your inbox for the verification link.';
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many sign-in attempts. Please wait a moment before trying again.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email address. Please sign up first.';
        }
        
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }

      // Additional check for email verification
      if (data.user && !data.user.email_confirmed_at) {
        console.warn('🔐 Email not verified for user:', email)
        setError('Please verify your email before logging in. Check your inbox for the verification link.')
        return { 
          success: false, 
          error: 'Please verify your email before logging in. Check your inbox for the verification link.' 
        }
      }

      if (data.user) {
        console.log('✅ Sign in successful for user:', data.user.email)
      }

      return { success: true }
    } catch (err) {
      console.error('❌ Unexpected sign in error:', err)
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Authentication not configured. Please set up your Supabase credentials.' }
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }
      setUser(null)
      setSession(null)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) return { success: false, error: 'No user logged in' }

    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          username: updates.username,
          avatar_url: updates.avatar_url
        })
        .eq('id', user.id)

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile
  }
}