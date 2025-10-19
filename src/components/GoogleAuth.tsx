import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { GlassCard } from './GlassCard';

interface GoogleAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: { name: string; email: string; profilePicture?: string }) => void;
}

export function GoogleAuth({ isOpen, onClose, onSuccess }: GoogleAuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'password'>('email');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@gmail.com') && !email.includes('@googlemail.com')) {
      alert('Please enter a valid Gmail address');
      return;
    }
    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate Google OAuth verification
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract name from email (before @)
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Simulate successful authentication
    onSuccess({
      name: name,
      email: email,
      profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7D4AE1&color=fff`
    });

    setIsLoading(false);
    onClose();
  };

  const handleBack = () => {
    setStep('email');
    setPassword('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md mx-4"
        >
          <GlassCard className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <h2 className="text-xl font-semibold">Sign in with Google</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Step */}
            {step === 'email' && (
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleEmailSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="google-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="google-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your Gmail address"
                      className="pl-10 glass-card border-0"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary text-white border-0"
                >
                  Next
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Use your Google account to sign in to EZ Grades
                </p>
              </motion.form>
            )}

            {/* Password Step */}
            {step === 'password' && (
              <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handlePasswordSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back to email
                  </button>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-solid to-secondary-solid flex items-center justify-center text-white text-sm font-medium">
                      {email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{email}</p>
                      <p className="text-xs text-muted-foreground">Google Account</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="google-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pr-10 glass-card border-0"
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
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full gradient-primary text-white border-0"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    'Sign in'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  We'll verify your Google account and sign you in securely
                </p>
              </motion.form>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}