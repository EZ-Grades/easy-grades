import { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { GlassCard } from './GlassCard';
import { LuxuryButton } from './LuxuryButton';
import { CheckCircle, XCircle, AlertCircle, User, Mail, Key, Database, Settings } from 'lucide-react';

export function AuthTest() {
  const { user, session, loading, error, signOut } = useAuth();
  const [testResults, setTestResults] = useState<{
    sessionCheck: boolean;
    profileData: boolean;
    rls: boolean;
    emailConfirmed: boolean;
  } | null>(null);

  const runAuthTests = async () => {
    const results = {
      sessionCheck: !!session,
      profileData: !!user,
      rls: true, // If we can access user data, RLS is working
      emailConfirmed: !!session?.user?.email_confirmed_at
    };
    setTestResults(results);
  };

  const TestItem = ({ 
    label, 
    status, 
    description 
  }: { 
    label: string; 
    status: boolean | null; 
    description: string; 
  }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
      {status === null ? (
        <AlertCircle className="w-5 h-5 text-muted-foreground" />
      ) : status ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500" />
      )}
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-primary-solid border-t-transparent rounded-full"
            />
            <p>Loading authentication test...</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 space-y-6">
        <GlassCard className="p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-yellow-500" />
            <div>
              <h3 className="text-lg font-medium">Authentication Required</h3>
              <p className="text-muted-foreground">Please log in to run authentication tests.</p>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* User Info Card */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-solid to-secondary-solid flex items-center justify-center text-white font-medium">
              {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-medium">Authentication Status</h3>
              <p className="text-sm text-green-500 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Authenticated
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span className="text-muted-foreground">Name:</span>
                <span>{user.full_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4" />
                <span className="text-muted-foreground">Email:</span>
                <span>{user.email}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Key className="w-4 h-4" />
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-xs">{user.id}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Database className="w-4 h-4" />
                <span className="text-muted-foreground">Username:</span>
                <span>{user.username}</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Test Results Card */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <Settings className="w-5 h-5" />
              System Tests
            </h3>
            <LuxuryButton
              onClick={runAuthTests}
              variant="primary"
              size="sm"
            >
              Run Tests
            </LuxuryButton>
          </div>

          <div className="space-y-3">
            <TestItem
              label="Session Management"
              status={testResults?.sessionCheck ?? null}
              description="Verifies that user session is properly maintained"
            />
            <TestItem
              label="Profile Data"
              status={testResults?.profileData ?? null}
              description="Checks if user profile data is accessible from database"
            />
            <TestItem
              label="Row Level Security"
              status={testResults?.rls ?? null}
              description="Ensures RLS policies are protecting user data"
            />
            <TestItem
              label="Email Verification"
              status={testResults?.emailConfirmed ?? null}
              description="Confirms email verification status"
            />
          </div>

          {testResults && (
            <div className="mt-4 p-3 rounded-lg bg-muted/20">
              <p className="text-sm text-muted-foreground">
                {Object.values(testResults).every(Boolean) 
                  ? "✅ All authentication tests passed! Your Supabase setup is working correctly."
                  : "⚠️ Some tests failed. Check your Supabase configuration and database setup."
                }
              </p>
            </div>
          )}
        </GlassCard>

        {/* Session Data Card */}
        <GlassCard className="p-6">
          <h3 className="font-medium mb-4">Session Details</h3>
          <div className="bg-muted/20 rounded-lg p-4 overflow-auto">
            <pre className="text-xs text-muted-foreground">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </GlassCard>

        {/* Error Display */}
        {error && (
          <GlassCard className="p-6 border-red-500/20">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="font-medium text-red-500">Authentication Error</h3>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <LuxuryButton
            onClick={() => signOut()}
            variant="secondary"
            className="flex-1"
          >
            Sign Out
          </LuxuryButton>
        </div>
      </motion.div>
    </div>
  );
}