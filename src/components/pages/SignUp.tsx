import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Mail, Lock, User, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { GlassCard } from '../GlassCard';
import { supabase } from '../../lib/supabase';

interface SignUpProps {
  onSwitchToLogin: () => void;
  loading?: boolean;
}

export function SignUp({ onSwitchToLogin, loading = false }: SignUpProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const passwordRequirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[a-z]/.test(password), text: 'One lowercase letter' },
    { met: /\d/.test(password), text: 'One number' },
  ];

  const isPasswordValid = passwordRequirements.every(req => req.met);
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid || !doPasswordsMatch || isLoading || loading) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: supabaseError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });

      if (supabaseError) {
        if (supabaseError.message.includes('already registered')) {
          setError('Account already exists. Please log in instead.');
        } else {
          setError(supabaseError.message);
        }
        return;
      }

      setSuccess('Account created successfully! Please check your email to verify your account.');
      setTimeout(() => onSwitchToLogin(), 3000);
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (isLoading || loading) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (googleError) setError(googleError.message || 'Google sign up failed');
      else setSuccess('Redirecting to Google...');
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <GlassCard className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <h1 className="text-gradient-primary">Join EZ Grades</h1>
              <p className="text-muted-foreground">Create your account to get started</p>
            </motion.div>
          </div>

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

          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" className="pl-10 glass-card border-0" required />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="pl-10 glass-card border-0" required />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" className="pl-10 pr-10 glass-card border-0" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="glass-card p-3 space-y-1">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className={`w-3 h-3 rounded-full flex items-center justify-center ${req.met ? 'bg-green-500' : 'bg-muted'}`}>
                        {req.met && <Check className="w-2 h-2 text-white" />}
                      </div>
                      <span className={req.met ? 'text-green-500' : 'text-muted-foreground'}>{req.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" className="pl-10 pr-10 glass-card border-0" required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && !doPasswordsMatch && <p className="text-xs text-red-500">Passwords do not match</p>}
            </div>

            {/* Create Account Button */}
            <Button type="submit" disabled={isLoading || !isPasswordValid || !doPasswordsMatch} className="w-full gradient-primary text-white border-0 glow-primary hover:glow-primary disabled:opacity-50">
              {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : 'Create Account'}
            </Button>
          </motion.form>

          {/* Google Signup */}
          <Button type="button" onClick={handleGoogleSignUp} disabled={isLoading} variant="outline" className="w-full mt-4 glass-card border-border hover:glow-secondary">
            {isLoading ? 'Connecting...' : 'Sign up with Google'}
          </Button>

          <p className="text-center text-muted-foreground mt-4">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-gradient-primary hover:underline">Sign in</button>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
