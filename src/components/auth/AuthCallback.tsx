import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { motion } from 'motion/react'
import { EZGradesLogo } from '../EZGradesLogo'
import { ThemeToggle } from '../ThemeToggle'

interface AuthCallbackProps {
  onAuthComplete: (success: boolean, error?: string) => void
}

export function AuthCallback({ onAuthComplete }: AuthCallbackProps) {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔐 Processing OAuth callback...')
        
        // Get the session from the URL parameters
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error in auth callback:', error)
          onAuthComplete(false, error.message)
          return
        }

        if (data.session) {
          console.log('✅ OAuth authentication successful')
          onAuthComplete(true)
        } else {
          console.log('❌ No session found in OAuth callback')
          onAuthComplete(false, 'Authentication failed - no session created')
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err)
        onAuthComplete(false, 'Authentication failed - unexpected error')
      }
    }

    // Small delay to ensure URL parameters are processed
    const timeout = setTimeout(handleAuthCallback, 100)
    return () => clearTimeout(timeout)
  }, [onAuthComplete])

  return (
    <div className="min-h-screen bg-gradient flex items-center justify-center">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        {/* Enhanced loading animation with logo */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto border-4 border-primary-solid border-t-transparent rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center glow-primary">
              <EZGradesLogo size="lg" animated={false} />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-gradient-primary">EZ Grades</h1>
          <p className="text-muted-foreground">Completing authentication...</p>
        </div>
      </motion.div>
    </div>
  )
}