import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, ExternalLink, Copy, Check } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { LuxuryButton } from './LuxuryButton';

interface SupabaseSetupBannerProps {
  onDismiss?: () => void;
}

export function SupabaseSetupBanner({ onDismiss }: SupabaseSetupBannerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const handleCopy = (text: string, stepNumber: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepNumber);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const setupSteps = [
    {
      title: "Create Supabase Project",
      description: "Go to supabase.com and create a new project",
      link: "https://supabase.com/dashboard"
    },
    {
      title: "Get Project URL",
      description: "Copy from Settings > API",
      copyText: "VITE_SUPABASE_URL=your_project_url_here"
    },
    {
      title: "Get Anon Key", 
      description: "Copy from Settings > API",
      copyText: "VITE_SUPABASE_ANON_KEY=your_anon_key_here"
    },
    {
      title: "Update .env.local",
      description: "Replace placeholder values in your .env.local file",
      copyText: `VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`
    },
    {
      title: "Run Database Setup",
      description: "Execute the SQL schema in your Supabase dashboard",
      link: "/SUPABASE_SETUP.md"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-4 right-4 z-50 max-w-4xl mx-auto"
    >
      <GlassCard className="border-yellow-500/30 bg-yellow-500/10">
        <div className="flex items-start gap-3 p-4">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-yellow-600 dark:text-yellow-400">
                Supabase Setup Required
              </h3>
              <div className="flex items-center gap-2">
                <LuxuryButton
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs"
                >
                  {showDetails ? 'Hide' : 'Show'} Setup Guide
                </LuxuryButton>
                {onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="p-1 rounded hover:bg-yellow-500/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Authentication features are disabled. Please configure your Supabase credentials to enable login, signup, and StudyHub access.
            </p>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {setupSteps.map((step, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                            {index + 1}. {step.title}
                          </span>
                          {step.link && (
                            <a
                              href={step.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded hover:bg-yellow-500/20 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {step.description}
                        </p>
                        {step.copyText && (
                          <button
                            onClick={() => handleCopy(step.copyText!, index)}
                            className="w-full text-left p-2 rounded bg-muted/20 hover:bg-muted/30 transition-colors text-xs font-mono flex items-center justify-between group"
                          >
                            <span className="truncate flex-1">
                              {step.copyText.split('\n')[0]}
                              {step.copyText.includes('\n') && '...'}
                            </span>
                            {copiedStep === index ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <LuxuryButton
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                      className="text-xs"
                    >
                      Open Supabase Dashboard
                    </LuxuryButton>
                    <LuxuryButton
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open('/SUPABASE_SETUP.md', '_blank')}
                      className="text-xs"
                    >
                      View Full Setup Guide
                    </LuxuryButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}