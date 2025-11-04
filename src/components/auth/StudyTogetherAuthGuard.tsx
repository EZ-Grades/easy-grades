import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';

interface StudyTogetherAuthGuardProps {
  children: React.ReactNode;
  onAuthRequired: () => void;
}

export function StudyTogetherAuthGuard({ children, onAuthRequired }: StudyTogetherAuthGuardProps) {
  const [showPrompt, setShowPrompt] = useState(true);

  if (!showPrompt) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen pb-8 px-6 pt-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl w-full"
      >
        <Card className="glassmorphism border-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-solid/5 via-secondary-solid/5 to-highlight-solid/5" />
          
          <CardHeader className="relative text-center space-y-4 pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary-solid to-secondary-solid flex items-center justify-center"
            >
              <Users className="w-10 h-10 text-white" />
            </motion.div>
            
            <div>
              <CardTitle className="text-3xl mb-2">Study Together</CardTitle>
              <p className="text-muted-foreground">
                Collaborative study sessions with real-time features
              </p>
            </div>
          </CardHeader>

          <CardContent className="relative space-y-6">
            <Alert className="border-primary-solid/20 bg-primary-solid/5">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                <strong>Authentication Required</strong>
                <br />
                Sign in to create rooms, join sessions, and collaborate with other students.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-solid" />
                What You Can Do:
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-solid mt-2 flex-shrink-0" />
                  <span><strong>Create Study Rooms:</strong> Set up public or private rooms with unique codes</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-solid mt-2 flex-shrink-0" />
                  <span><strong>Share Room Links:</strong> Invite friends with shareable room codes</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-solid mt-2 flex-shrink-0" />
                  <span><strong>Real-time Collaboration:</strong> Chat, shared timers, and collaborative canvas</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-solid mt-2 flex-shrink-0" />
                  <span><strong>Focus Tracking:</strong> Track study time and stay accountable together</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-solid mt-2 flex-shrink-0" />
                  <span><strong>Ambient Sounds & Music:</strong> Share study playlists and background sounds</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={onAuthRequired}
                className="gradient-primary flex-1 group"
              >
                Sign In to Continue
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="flex-1"
              >
                Go Back
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Don't have an account? Sign up when you click "Sign In to Continue"
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
