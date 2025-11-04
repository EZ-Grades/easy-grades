import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, ExternalLink, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { getEnvironmentStatus, getSetupInstructions, getStatusMessage } from '../utils/environmentCheck';

export function SetupGuide() {
  const [status, setStatus] = useState(() => {
    try {
      return getEnvironmentStatus();
    } catch (error) {
      console.error('Error getting environment status:', error);
      return {
        supabase: { configured: false, error: 'Error checking Supabase' },
        perplexity: { configured: false, error: 'Error checking Perplexity' },
        overall: 'missing' as const
      };
    }
  });
  const [isExpanded, setIsExpanded] = useState(status.overall !== 'complete');
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    try {
      const currentStatus = getEnvironmentStatus();
      setStatus(currentStatus);
      setIsExpanded(currentStatus.overall !== 'complete');
    } catch (error) {
      console.error('Error updating environment status:', error);
    }
  }, []);

  // Don't show if everything is configured and user dismissed it
  if (status.overall === 'complete' && isDismissed) {
    return null;
  }

  const instructions = getSetupInstructions(status);
  const statusMessage = getStatusMessage(status);

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6"
        >
          <Alert className={`
            ${status.overall === 'complete' ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}
            ${status.overall === 'partial' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' : ''}
            ${status.overall === 'missing' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : ''}
          `}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {status.overall === 'complete' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                )}
                
                <div className="flex-1">
                  <AlertDescription className="font-medium mb-2">
                    {statusMessage}
                  </AlertDescription>
                  
                  {status.overall !== 'complete' && (
                    <div className="space-y-3 mt-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={status.supabase.configured ? 'default' : 'destructive'}>
                          {status.supabase.configured ? '✓' : '✗'} Supabase
                        </Badge>
                        <Badge variant={status.perplexity.configured ? 'default' : 'destructive'}>
                          {status.perplexity.configured ? '✓' : '✗'} Perplexity AI
                        </Badge>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="h-auto p-0 hover:bg-transparent"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Hide setup instructions
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Show setup instructions
                          </>
                        )}
                      </Button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <Card className="mt-3 bg-white dark:bg-slate-800">
                              <CardHeader>
                                <CardTitle className="text-base">Setup Instructions</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {!status.supabase.configured && (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">1</span>
                                      Configure Supabase
                                    </h4>
                                    <ul className="text-sm space-y-1 ml-8 text-muted-foreground">
                                      <li>• Get your Supabase URL and Anon Key from project dashboard</li>
                                      <li>• Add to <code className="px-1 py-0.5 bg-muted rounded">.env.local</code>:</li>
                                      <li className="ml-4">
                                        <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                                          VITE_SUPABASE_URL=your-url<br/>
                                          VITE_SUPABASE_ANON_KEY=your-key
                                        </code>
                                      </li>
                                    </ul>
                                  </div>
                                )}

                                {!status.perplexity.configured && (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                      <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">
                                        {!status.supabase.configured ? '2' : '1'}
                                      </span>
                                      Configure Perplexity AI
                                    </h4>
                                    <ul className="text-sm space-y-1 ml-8 text-muted-foreground">
                                      <li>• Sign up at <a href="https://www.perplexity.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                                        perplexity.ai <ExternalLink className="w-3 h-3" />
                                      </a></li>
                                      <li>• Generate API key from account settings</li>
                                      <li>• Add to <code className="px-1 py-0.5 bg-muted rounded">.env.local</code>:</li>
                                      <li className="ml-4">
                                        <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                                          VITE_PERPLEXITY_API_KEY=your-api-key
                                        </code>
                                      </li>
                                    </ul>
                                  </div>
                                )}

                                <div className="pt-3 border-t">
                                  <p className="text-sm text-muted-foreground">
                                    📖 Detailed guide: <a href="/docs/STUDYHUB_QUICKSTART.md" className="text-blue-600 hover:underline">
                                      StudyHub Quick Start
                                    </a>
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    💡 Remember to restart your development server after updating environment variables
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDismissed(true)}
                className="ml-2 h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
