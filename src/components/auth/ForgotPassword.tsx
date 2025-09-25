import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { GlassCard } from '../GlassCard';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for a password reset link.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8 space-y-6">
          <h2 className="text-xl font-bold text-center">Forgot Password</h2>

          {(message || error) && (
            <GlassCard
              className={`p-4 ${
                error
                  ? 'border-red-200 bg-red-50/50 dark:bg-red-950/20'
                  : 'border-green-200 bg-green-50/50 dark:bg-green-950/20'
              }`}
            >
              <div
                className={`flex items-center gap-2 ${
                  error ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                }`}
              >
                {error ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                <span className="text-sm">{error || message}</span>
              </div>
            </GlassCard>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="text-center">
            <button onClick={onBackToLogin} className="text-sm text-muted-foreground hover:text-primary-solid">
              Back to login
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
