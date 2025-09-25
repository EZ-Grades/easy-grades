import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { GlassCard } from '../GlassCard';
import { ForgotPassword } from '../auth/ForgotPassword';
import { supabase } from '../../lib/supabase';

interface LoginProps {
  onSwitchToSignup?: () => void;
  onLoginSuccess?: () => void;
}

export function Login({ onSwitchToSignup, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        let msg = signInError.message;
        if (msg.includes('Invalid login credentials')) msg = 'Invalid email or password.';
        else if (msg.includes('Email not confirmed')) msg = 'Please verify your email before signing in.';
        setError(msg);
      } else {
        setSuccess('Successfully signed in! Redirecting...');
        if (onLoginSuccess) onLoginSuccess();
        else setTimeout(() => window.location.href = '/dashboard', 2000);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (oauthError) setError(oauthError.message);
      else setSuccess('Redirecting to Google...');
    } catch {
      setError('Google login failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <GlassCard className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <h1 className="text-gradient-primary">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to your EZ Grades account</p>
            </motion.div>
          </div>

          {/* Error/Success */}
          {(error || success) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4">
              <GlassCard className={`p-4 ${error ? 'border-red-200 bg-red-50/50 dark:bg-red-950/20' : 'border-green-200 bg-green-50/50 dark:bg-green-950/20'}`}>
                <div className={`flex items-center gap-2 ${error ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {error ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                  <span className="text-sm">{error || success}</span>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Form */}
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="pl-10 glass-card border-0" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="pl-10 pr-10 glass-card border-0" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-muted-foreground hover:text-primary-solid transition-colors">
                Forgot password?
              </button>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" disabled={isLoading} className="w-full gradient-primary text-white border-0 glow-primary hover:glow-primary">
                {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : 'Sign In'}
              </Button>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.25 }} className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border opacity-30"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card-solid px-2 text-muted-foreground">Or continue with</span></div>
          </motion.div>

          {/* Google login */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="button" onClick={handleGoogleLogin} disabled={isLoading} variant="outline" className="w-full glass-card border-border hover:glow-secondary transition-all duration-300">
              {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full mr-2" /> : 'Continue with Google'}
            </Button>
          </motion.div>

          {/* Switch to Sign Up */}
          <div className="text-center mt-4">
            <span className="text-sm text-muted-foreground">Don't have an account?</span>
            <button type="button" onClick={onSwitchToSignup} className="ml-2 text-sm text-primary-solid hover:underline">
              Sign Up
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
