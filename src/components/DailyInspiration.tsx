import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Quote, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getDailyInspirationWithCache, Inspiration } from '../services/inspirationsService';

interface DailyInspirationProps {
  className?: string;
  showIcon?: boolean;
}

export function DailyInspiration({ className, showIcon = true }: DailyInspirationProps) {
  const [inspiration, setInspiration] = useState<Inspiration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInspiration();
    
    // Check for new inspiration every hour
    const interval = setInterval(() => {
      loadInspiration();
    }, 60 * 60 * 1000); // 1 hour
    
    return () => clearInterval(interval);
  }, []);

  const loadInspiration = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: err } = await getDailyInspirationWithCache();
      
      if (err) {
        console.error('Error loading inspiration:', err);
        setError('Failed to load inspiration');
      } else if (data) {
        setInspiration(data);
      }
    } catch (err: any) {
      console.error('Error loading inspiration:', err);
      setError('Failed to load inspiration');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={`glassmorphism border-0 ${className}`}>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary-solid" />
        </CardContent>
      </Card>
    );
  }

  if (error || !inspiration) {
    return (
      <Card className={`glassmorphism border-0 ${className}`}>
        <CardContent className="py-8 flex flex-col items-center justify-center space-y-2">
          <Quote className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {error || 'No inspiration available'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="glassmorphism border-0 hover:glow-highlight transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {showIcon && <Sparkles className="w-5 h-5 text-highlight-solid" />}
            Daily Inspiration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative"
          >
            {/* Quote mark decoration */}
            <Quote className="absolute -top-2 -left-2 w-8 h-8 text-highlight-solid opacity-20" />
            
            <blockquote className="relative pl-6">
              <p className="text-lg italic leading-relaxed">
                "{inspiration.content}"
              </p>
              
              {inspiration.author && (
                <footer className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">—</span>
                  <cite className="text-sm font-medium not-italic text-gradient-highlight">
                    {inspiration.author}
                  </cite>
                </footer>
              )}
            </blockquote>
          </motion.div>

          {/* Category badge */}
          {inspiration.category && (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-highlight/10 border border-highlight-solid/20">
                <span className="text-xs font-medium text-highlight-solid capitalize">
                  {inspiration.category}
                </span>
              </div>
            </div>
          )}

                  </CardContent>
      </Card>
    </motion.div>
  );
}
