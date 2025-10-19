import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { GlassCard } from '../GlassCard';
import { supabase } from '../../lib/supabase';

interface ResetPasswordProps {
  onComplete: () => void;
  onBackToLogin: () => void;
}

export function ResetPassword({ onComplete, onBackToLogin }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasValidToken, setHasValidToken] = useState(false);

  // Check if user has a valid reset token on mount
  useEffect(() => {
    const checkToken = async () => {
      // Check for hash params (from email link)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      // Check for password recovery type
      if (type === 'recovery' && accessToken) {
        console.log('✅ Valid password reset token detected');
        setHasValidToken(true);
      } else {
        console.warn('⚠️ No valid password reset token found');
        setError('Invalid or expired password reset link. Please request a new one.');
      }
    };

    checkToken();
  }, []);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        setError(error.message);
      } else {
        console.log('✅ Password updated successfully');
        setSuccess(true);
        
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          onComplete();
        }, 3000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show error if no valid token
  if (!hasValidToken && error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8 space-y-6 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"
            >
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </motion.div>

            <div>
              <h1 className="text-2xl font-bold mb-2 text-gradient-primary">Invalid Reset Link</h1>
              <p className="text-muted-foreground">
                {error}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Password reset links expire after 1 hour for security reasons.
              </p>
              
              <div className="pt-4">
                <Button
                  onClick={onBackToLogin}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // Show success screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8 space-y-6 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </motion.div>

            <div>
              <h1 className="text-2xl font-bold mb-2 text-gradient-primary">Password Updated!</h1>
              <p className="text-muted-foreground">
                Your password has been successfully updated.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You can now sign in with your new password.
              </p>
              
              <div className="pt-4">
                <Button
                  onClick={onComplete}
                  className="w-full gradient-primary text-white border-0 glow-primary"
                >
                  Continue to Sign In
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // Show reset password form
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-gradient-primary text-2xl font-bold">Reset Your Password</h1>
              <p className="text-muted-foreground">
                Enter your new password below
              </p>
            </motion.div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4"
            >
              <GlassCard className="p-4 border-red-200 bg-red-50/50 dark:bg-red-950/20">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="pl-10 pr-10 glass-card border-0"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                At least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="pl-10 pr-10 glass-card border-0"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <div className="flex gap-1">
                  <div className={`h-1 flex-1 rounded ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className={`h-1 flex-1 rounded ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className={`h-1 flex-1 rounded ${/[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {validatePassword(password) === null ? (
                    <span className="text-green-600 dark:text-green-400">✓ Strong password</span>
                  ) : (
                    <span>{validatePassword(password)}</span>
                  )}
                </p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={isLoading || !hasValidToken}
                className="w-full gradient-primary text-white border-0 glow-primary hover:glow-primary"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  'Update Password'
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* Back to Login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center"
          >
            <button
              onClick={onBackToLogin}
              className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
