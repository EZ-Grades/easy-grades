import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useSearchParams } from 'react-router-dom';
import { GlassCard } from '../GlassCard';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const accessToken = searchParams.get('access_token');

  useEffect(() => {
    if (!accessToken) {
      setError('Invalid or missing reset token.');
    }
  }, [accessToken]);

  const handleReset = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser(
        { password },
        { accessToken }
      );

        if (error) {
            setError(error.message);
        }
        else {
            if (!error) {
                setMessage('Password updated successfully! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
            }
        }

    }
    catch (err: any) {
      setError(err.message || 'Unexpected error occurred.');
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
          <h2 className="text-xl font-bold text-center">Reset Password</h2>

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

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button onClick={handleReset} disabled={isLoading} className="w-full">
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
