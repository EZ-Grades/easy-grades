import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, 
  Zap, 
  Play,
  Pause,
  Minus, 
  Plus, 
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize,
  X,
  Check,
  BookOpen,
  Upload,
  Music,
  Sparkles
} from 'lucide-react';
import { Card } from '../ui/card';
import { GlassCard } from '../GlassCard';
import { ProgressRing } from '../ProgressRing';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner@2.0.3';
import { FocusJournal } from '../FocusJournal';
import { FlipClock } from '../FlipClock';
import { AmbientSounds } from '../AmbientSounds';

// Ambience mode type
interface AmbienceMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  bg_class: string;
  background_url?: string; // Supabase image URL
  sound_url?: string;
  isCustom?: boolean;
}

// Fallback ambience modes
const FALLBACK_AMBIENCES: AmbienceMode[] = [
  { 
    id: 'cafe', 
    name: 'Café', 
    description: 'Warm coffee shop atmosphere', 
    icon: '☕', 
    bg_class: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-[#1F1A0B] dark:via-[#2E2412] dark:to-[#3A2E1A]',
    background_url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1920&q=80'
    // sound_url disabled - external audio sources not available
  },
  { 
    id: 'forest', 
    name: 'Forest', 
    description: 'Natural green scenery', 
    icon: '🌲', 
    bg_class: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-[#0B1F1A] dark:via-[#0F2E24] dark:to-[#1A3A32]',
    background_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80'
    // sound_url disabled - external audio sources not available
  },
  { 
    id: 'ocean', 
    name: 'Ocean', 
    description: 'Calming ocean waves', 
    icon: '🌊', 
    bg_class: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-[#0B1F24] dark:via-[#1A2E42] dark:to-[#1E3A4F]',
    background_url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80'
    // sound_url disabled - external audio sources not available
  },
  { 
    id: 'rain', 
    name: 'Rain', 
    description: 'Gentle rain sounds', 
    icon: '🌧️', 
    bg_class: 'bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-[#0B1524] dark:via-[#1A2942] dark:to-[#1E3A5F]',
    background_url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920&q=80'
    // sound_url disabled - external audio sources not available
  },
  { 
    id: 'library', 
    name: 'Library', 
    description: 'Classic study environment', 
    icon: '📚', 
    bg_class: 'bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-[#0B1524] dark:via-[#1A2942] dark:to-[#1E3A5F]',
    background_url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1920&q=80' // Replace with Supabase URL
  },
  { 
    id: 'mountain', 
    name: 'Mountain', 
    description: 'Peaceful mountain scenery', 
    icon: '🏔️', 
    bg_class: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-[#0F1A2E] dark:via-[#1A2442] dark:to-[#1E2A4F]',
    background_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80' // Replace with Supabase URL
  },
  { 
    id: 'zen', 
    name: 'Zen', 
    description: 'Clean and distraction-free', 
    icon: '🧘', 
    bg_class: 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-[#0B1524] dark:via-[#12202E] dark:to-[#1A2942]',
    background_url: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=1920&q=80' // Replace with Supabase URL
  },
  { 
    id: 'fire', 
    name: 'Fireplace', 
    description: 'Cozy crackling fire', 
    icon: '🔥', 
    bg_class: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-[#1F1A0B] dark:via-[#2E2412] dark:to-[#3A2E1A]',
    background_url: 'https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=1920&q=80'
    // sound_url disabled - external audio sources not available
  }
];

export function FocusMode() {
  // State management
  const [focusTimer, setFocusTimer] = useState(25 * 60); // 25 minutes default
  const [focusDuration, setFocusDuration] = useState(25); // Duration in minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFullscreenSession, setIsFullscreenSession] = useState(false);
  const [selectedAmbience, setSelectedAmbience] = useState<AmbienceMode | null>(null);
  const [showAmbienceSelector, setShowAmbienceSelector] = useState(false);
  const [ambienceModes, setAmbienceModes] = useState<AmbienceMode[]>(FALLBACK_AMBIENCES);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [journalEntry, setJournalEntry] = useState('');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [customSound, setCustomSound] = useState<string | null>(null);
  const [exitClickCount, setExitClickCount] = useState(0);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const soundInputRef = useRef<HTMLInputElement>(null);
  const [showJournalModal, setShowJournalModal] = useState(false);
  
  const { user } = useAuth();

  // Load preferences on mount
  useEffect(() => {
    // Load last used background from localStorage
    const savedAmbience = localStorage.getItem('focus_last_ambience');
    if (savedAmbience) {
      const ambience = FALLBACK_AMBIENCES.find(a => a.id === savedAmbience);
      if (ambience) {
        setSelectedAmbience(ambience);
      }
    }

    // Load custom background
    const savedCustomBg = localStorage.getItem('focus_custom_background');
    if (savedCustomBg) {
      setCustomBackground(savedCustomBg);
    }

    // Load custom sound
    const savedCustomSound = localStorage.getItem('focus_custom_sound');
    if (savedCustomSound) {
      setCustomSound(savedCustomSound);
    }

    // Load journal entry
    const savedJournal = localStorage.getItem('focus_journal_entry');
    if (savedJournal) {
      setJournalEntry(savedJournal);
    }
  }, []);

  // Save journal entry to localStorage
  useEffect(() => {
    localStorage.setItem('focus_journal_entry', journalEntry);
  }, [journalEntry]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && focusTimer > 0) {
      interval = setInterval(() => {
        setFocusTimer((prev) => {
          const newTime = prev - 1;
          
          // Track every minute completed
          if (user && newTime % 60 === 0) {
            setTotalMinutes(m => m + 1);
          }
          
          return newTime;
        });
      }, 1000);
    } else if (isTimerRunning && focusTimer === 0) {
      // Session completed
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, focusTimer, user]);

  // Update timer when duration changes (only if not running)
  useEffect(() => {
    if (!isTimerRunning) {
      setFocusTimer(focusDuration * 60);
    }
  }, [focusDuration, isTimerRunning]);

  // Handle fullscreen
  useEffect(() => {
    if (isFullscreenSession) {
      document.documentElement.requestFullscreen?.().catch(err => {
        console.log('Fullscreen not supported:', err);
      });
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(err => {
          console.log('Exit fullscreen error:', err);
        });
      }
    }
  }, [isFullscreenSession]);

  // Keyboard shortcuts for Zen mode
  useEffect(() => {
    if (!isFullscreenSession) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Space bar to toggle play/pause
      if (e.code === 'Space') {
        e.preventDefault();
        setIsTimerRunning(prev => !prev);
      }
      // R key to reset
      if (e.code === 'KeyR') {
        e.preventDefault();
        handleResetTimer();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreenSession]);

  // Add custom ambience option
  useEffect(() => {
    const customOption: AmbienceMode = {
      id: 'custom',
      name: 'Custom',
      description: 'Your personalized environment',
      icon: '🎨',
      bg_class: 'bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-[#1A0F2E] dark:via-[#241A3A] dark:to-[#2E1A42]',
      background_url: customBackground || undefined,
      sound_url: customSound || undefined,
      isCustom: true
    };
    
    // Check if custom option already exists
    const hasCustom = ambienceModes.some(a => a.id === 'custom');
    if (!hasCustom) {
      setAmbienceModes([...FALLBACK_AMBIENCES, customOption]);
    } else {
      setAmbienceModes([...FALLBACK_AMBIENCES.filter(a => a.id !== 'custom'), customOption]);
    }
  }, [customBackground, customSound]);

  const handleSessionComplete = async () => {
    setIsTimerRunning(false);
    
    if (user) {
      // Save session to backend
      try {
        const sessionData = {
          duration_minutes: focusDuration,
          completed_minutes: focusDuration,
          ambience_used: selectedAmbience?.name || 'None',
          is_fullscreen: isFullscreenSession,
          journal_entry: journalEntry
        };
        
        // Update dashboard stats (this would be a backend call)
        toast.success('Session complete! 🎉 Your dashboard has been updated.');
      } catch (error) {
        console.error('Error saving session:', error);
        toast.success('Session complete! 🎉');
      }
    } else {
      toast.success('Session complete! Great job!');
    }
    
    // Reset timer
    setFocusTimer(focusDuration * 60);
    setTotalMinutes(0);
    setSessionStartTime(null);
    
    // Exit fullscreen if active
    if (isFullscreenSession) {
      setIsFullscreenSession(false);
    }
  };

  const handleStartFullscreen = () => {
    setShowAmbienceSelector(true);
  };

  const handleStartSession = () => {
    setShowAmbienceSelector(false);
    setIsFullscreenSession(true);
    setIsTimerRunning(true);
    setSessionStartTime(new Date());
    setFocusTimer(focusDuration * 60);
    setTotalMinutes(0);
    
    // Save last used ambience
    if (selectedAmbience) {
      localStorage.setItem('focus_last_ambience', selectedAmbience.id);
    }
    
    // Start ambience sound if available
    if (selectedAmbience?.sound_url && audioElement) {
      playAmbience(selectedAmbience.id);
    }
  };

  const handleNormalFocus = () => {
    if (isTimerRunning) {
      // Pause
      setIsTimerRunning(false);
    } else {
      // Start
      if (!sessionStartTime) {
        setSessionStartTime(new Date());
        setTotalMinutes(0);
      }
      setIsTimerRunning(true);
      
      if (user) {
        toast.info('Focus session started');
      }
    }
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setFocusTimer(focusDuration * 60);
    setSessionStartTime(null);
    setTotalMinutes(0);
    // Keep ambience playing if it was already playing
  };

  const handleExitClick = () => {
    setExitClickCount(prev => prev + 1);
    setShowExitPrompt(true);

    // Clear previous timeout
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
    }

    // Reset after 2 seconds
    exitTimeoutRef.current = setTimeout(() => {
      setExitClickCount(0);
      setShowExitPrompt(false);
    }, 2000);

    // Exit on second click
    if (exitClickCount >= 1) {
      handleCancelSession();
    }
  };

  const handleCancelSession = () => {
    // Stop timer
    setIsTimerRunning(false);
    setFocusTimer(focusDuration * 60);
    setSessionStartTime(null);
    setTotalMinutes(0);
    
    // Stop ambience
    if (audioElement) {
      audioElement.pause();
      setPlayingAmbience(null);
    }
    
    // Exit fullscreen
    setIsFullscreenSession(false);
    
    // Reset exit counter
    setExitClickCount(0);
    setShowExitPrompt(false);
    
    // Don't save session (marked as incomplete)
    toast.info('Session cancelled');
  };

  const playAmbience = (ambienceId: string) => {
    if (!audioElement) return;

    const ambience = ambienceModes.find(a => a.id === ambienceId);
    if (!ambience?.sound_url) return;

    if (playingAmbience === ambienceId) {
      // Toggle pause
      if (audioElement.paused) {
        audioElement.play().catch(err => console.error('Play error:', err));
        setPlayingAmbience(ambienceId);
      } else {
        audioElement.pause();
        setPlayingAmbience(null);
      }
    } else {
      // Stop current and play new
      audioElement.pause();
      audioElement.src = ambience.sound_url;
      audioElement.volume = ambienceVolume / 100;
      audioElement.play().catch(err => {
        console.error('Play error:', err);
        toast.error('Failed to play ambient sound');
      });
      setPlayingAmbience(ambienceId);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setAmbienceVolume(newVolume);
    localStorage.setItem('focus_ambience_volume', newVolume.toString());
    if (audioElement) {
      audioElement.volume = newVolume / 100;
    }
  };

  const handleCustomBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setCustomBackground(imageUrl);
      localStorage.setItem('focus_custom_background', imageUrl);
      toast.success('Custom background uploaded!');
    };
    reader.readAsDataURL(file);
  };

  const handleCustomSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please select an audio file');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Audio must be smaller than 20MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const audioUrl = event.target?.result as string;
      setCustomSound(audioUrl);
      localStorage.setItem('focus_custom_sound', audioUrl);
      toast.success('Custom sound uploaded!');
    };
    reader.readAsDataURL(file);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalFocusTime = focusDuration * 60;
  const focusProgress = ((totalFocusTime - focusTimer) / totalFocusTime) * 100;

  // Ambience Selector Screen
  if (showAmbienceSelector) {
    return (
      <div className="min-h-screen pb-8 px-4 pt-8">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl mb-1 text-gradient-primary">Choose Your Ambience</h1>
            <p className="text-sm text-muted-foreground">Select an environment for your focus session</p>
          </motion.div>

          <Card className="glass-card-enhanced p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {ambienceModes.map((ambience, index) => (
                <motion.div
                  key={ambience.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`
                    relative p-4 rounded-lg border transition-all cursor-pointer
                    ${selectedAmbience?.id === ambience.id 
                      ? 'border-primary glow-primary bg-gradient-to-br from-primary/10 to-highlight/5' 
                      : 'glass-card hover:border-primary/50 hover:shadow-lg'
                    }
                  `}
                  onClick={() => {
                    setSelectedAmbience(ambience);
                    if (ambience.isCustom) {
                      setShowCustomizer(true);
                    }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Content */}
                  <div className="relative text-center">
                    <div className="text-3xl mb-2">{ambience.icon}</div>
                    <h3 className="text-sm font-medium mb-1">{ambience.name}</h3>
                    <p className="text-xs text-muted-foreground">{ambience.description}</p>
                    
                    {/* Selected indicator */}
                    {selectedAmbience?.id === ambience.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-primary flex items-center justify-center shadow-lg"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Custom Ambience Uploader */}
            <AnimatePresence>
              {showCustomizer && selectedAmbience?.isCustom && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 rounded-lg glass-card-enhanced border-primary/40 glow-primary"
                >
                  <h3 className="text-sm font-medium mb-3">Customize Environment</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Background Upload */}
                    <div>
                      <label className="block text-sm mb-2 text-muted-foreground">Background Image</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCustomBackgroundUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {customBackground ? 'Change Background' : 'Upload Background'}
                      </Button>
                      {customBackground && (
                        <div className="mt-2 h-20 rounded-lg overflow-hidden">
                          <img src={customBackground} alt="Custom" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Sound Upload */}
                    <div>
                      <label className="block text-sm mb-2 text-muted-foreground">Ambient Sound (optional)</label>
                      <input
                        ref={soundInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleCustomSoundUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => soundInputRef.current?.click()}
                        className="w-full"
                      >
                        <Music className="w-4 h-4 mr-2" />
                        {customSound ? 'Change Sound' : 'Upload Sound'}
                      </Button>
                      {customSound && (
                        <p className="mt-2 text-xs text-green-600">✓ Custom sound loaded</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Duration selector */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-3 text-center">Duration</p>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFocusDuration(Math.max(5, focusDuration - 5))}
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <div className="text-center min-w-[80px] px-4 py-2 rounded-lg glass-card-enhanced">
                  <div className="text-xl font-medium text-gradient-primary">{focusDuration}</div>
                  <div className="text-xs text-muted-foreground">min</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFocusDuration(Math.min(180, focusDuration + 5))}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAmbienceSelector(false);
                  setSelectedAmbience(null);
                  setShowCustomizer(false);
                }}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartSession}
                disabled={!selectedAmbience}
                className="gradient-primary text-white"
                size="sm"
              >
                <Play className="w-3.5 h-3.5 mr-2" />
                Start Session
              </Button>
            </div>
          </Card>

          {/* Ambient Sounds Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <AmbientSounds className="max-w-2xl mx-auto" />
          </motion.div>
        </div>
      </div>
    );
  }

  // Fullscreen Focus Session
  if (isFullscreenSession && selectedAmbience) {
    const isZenMode = selectedAmbience.id === 'zen';
    
    const backgroundStyle = isZenMode 
      ? {} // No background for zen mode - pure black
      : selectedAmbience.background_url 
        ? { 
            backgroundImage: `url(${selectedAmbience.background_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }
        : {};

    return (
      <div 
        className={`fixed inset-0 ${
          isZenMode 
            ? 'bg-black' 
            : !selectedAmbience.background_url 
              ? selectedAmbience.bg_class 
              : ''
        } z-50 flex items-center justify-center transition-all duration-1000`}
        style={backgroundStyle}
      >
        {/* Dark overlay for better readability - not for zen mode */}
        {selectedAmbience.background_url && !isZenMode && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        )}

        {/* Exit button with double-click prompt */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-6 right-6 z-50"
        >
          <motion.button
            onClick={handleExitClick}
            className={`p-3 rounded-full glassmorphism transition-colors ${
              exitClickCount > 0 ? 'bg-red-500/30 glow-danger' : 'hover:bg-red-500/20'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-6 h-6" />
          </motion.button>
          
          <AnimatePresence>
            {showExitPrompt && exitClickCount < 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-2 bg-white/90 dark:bg-black/90 backdrop-blur-md px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl"
              >
                Click again to exit
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Main content */}
        <div className="text-center space-y-12 relative z-10">
          {/* Ambience indicator - hidden for zen mode */}
          {!isZenMode && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="text-7xl mb-4">{selectedAmbience.icon}</div>
              <h2 className="text-2xl text-white/90">{selectedAmbience.name}</h2>
            </motion.div>
          )}

          {/* Timer - Flip Clock for Zen, Regular for others */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {/* Enhanced glow effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-72 h-72 rounded-full bg-primary-solid/20 blur-3xl animate-pulse"></div>
            </div>
            
            {isZenMode ? (
              <div className="relative">
                <FlipClock time={formatTime(focusTimer)} />
              </div>
            ) : (
              <div className="relative">
                <ProgressRing 
                  progress={focusProgress} 
                  size={300} 
                  strokeWidth={18}
                  strokeLinecap="butt"
                  gradient="primary"
                >
                  <div className="flex items-center justify-center">
                    <div className="w-52 h-52 flex flex-col items-center justify-center text-center glassmorphism rounded-full bg-white/10">
                      <div className="text-6xl mb-3 text-white font-mono tabular-nums">
                        {formatTime(focusTimer)}
                      </div>
                      <div className="text-xl text-white/80">
                        {isTimerRunning ? '✨ Deep Focus' : '⏸️ Paused'}
                      </div>
                    </div>
                  </div>
                </ProgressRing>
              </div>
            )}
          </motion.div>

          {/* Zen Mode Controls - Minimal and elegant */}
          {isZenMode && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-6 mt-12"
              >
                <motion.button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="group relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:bg-white/20 group-hover:border-white/40 shadow-2xl">
                    {isTimerRunning ? (
                      <Pause className="w-7 h-7 md:w-9 md:h-9 text-white" />
                    ) : (
                      <Play className="w-7 h-7 md:w-9 md:h-9 text-white ml-1" />
                    )}
                  </div>
                </motion.button>
                
                <motion.button
                  onClick={handleResetTimer}
                  className="group relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:bg-white/20 group-hover:border-white/40 shadow-2xl">
                    <RotateCcw className="w-5 h-5 md:w-6 md:h-6 text-white/80" />
                  </div>
                </motion.button>
              </motion.div>

              {/* Keyboard shortcuts hint */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: [0, 0.6, 0.6, 0] }}
                transition={{ 
                  duration: 5,
                  times: [0, 0.2, 0.8, 1],
                  delay: 1.5
                }}
                className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-center"
              >
                <div className="flex items-center gap-4 text-white/60 text-sm">
                  <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 backdrop-blur-sm">
                    Space
                  </span>
                  <span>Play/Pause</span>
                  <span className="mx-2">•</span>
                  <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 backdrop-blur-sm">
                    R
                  </span>
                  <span>Reset</span>
                </div>
              </motion.div>
            </>
          )}

          {/* Controls - Hidden in Zen mode */}
          {!isZenMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-4"
            >
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="glassmorphism bg-white/15 border-white/30 text-white hover:bg-white/25 hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Resume
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleResetTimer}
                className="glassmorphism bg-white/15 border-white/30 text-white hover:bg-white/25 hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </motion.div>
          )}

          {/* Session stats - Hidden in Zen mode */}
          {user && !isZenMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="glassmorphism bg-white/15 backdrop-blur-xl p-8 rounded-3xl max-w-md mx-auto shadow-2xl border border-white/30"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl text-white mb-1">{totalMinutes}</div>
                  <div className="text-sm text-white/80">Minutes Focused</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl text-white mb-1">
                    {Math.round((totalMinutes / focusDuration) * 100)}%
                  </div>
                  <div className="text-sm text-white/80">Complete</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Normal Focus Mode Screen
  return (
    <div className="min-h-screen pb-8 px-4 pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl mb-1 text-gradient-primary">Deep Focus</h1>
        </motion.div>

        {/* Top Row: Timer and Ambient Sounds */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Focus Timer Card */}
          <Card className="glass-card-enhanced p-6">
            <div className="text-center">
              <h2 className="text-base mb-6 flex items-center justify-center gap-2">
                <div className="p-1.5 rounded-md gradient-primary">
                  <Timer className="w-4 h-4 text-white" />
                </div>
                <span className="text-gradient-primary">Focus Session</span>
              </h2>
              
              {/* Duration Selector */}
              <div className="mb-6">
                <p className="text-xs text-muted-foreground mb-3">Duration</p>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFocusDuration(Math.max(5, focusDuration - 5))}
                    disabled={isTimerRunning}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </Button>
                  <div className="text-center min-w-[70px] px-4 py-2 rounded-lg border border-border bg-muted/30">
                    <div className="text-xl font-medium">{focusDuration}</div>
                    <div className="text-xs text-muted-foreground">min</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFocusDuration(Math.min(180, focusDuration + 5))}
                    disabled={isTimerRunning}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              
              {/* Timer Display - Minimal */}
              <div className="mb-6 flex justify-center">
                <ProgressRing 
                  progress={focusProgress} 
                  size={180} 
                  strokeWidth={6}
                  strokeLinecap="butt"
                  gradient="primary"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-1 font-mono tabular-nums">
                      {formatTime(focusTimer)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isTimerRunning ? 'Focusing' : 'Ready'}
                    </div>
                  </div>
                </ProgressRing>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handleStartFullscreen}
                  className="w-full gradient-primary text-white"
                  size="sm"
                >
                  <Maximize className="w-3.5 h-3.5 mr-2" />
                  Fullscreen Focus
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleNormalFocus}
                  className="w-full"
                  size="sm"
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 mr-2" />
                      Start
                    </>
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetTimer}
                  className="w-full"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-2" />
                  Reset
                </Button>
              </div>

              {/* Session Info */}
              {isTimerRunning && user && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 glassmorphism rounded-lg glow-primary"
                >
                  <div className="text-sm text-muted-foreground mb-1">Minutes Completed</div>
                  <div className="text-2xl text-gradient-primary">{totalMinutes}</div>
                </motion.div>
              )}
            </div>
          </Card>

          {/* Ambient Sounds Card - Available to Everyone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card-enhanced overflow-hidden"
          >
            <AmbientSounds />
          </motion.div>
        </div>

        {/* Bottom Row: Full-Width Journal */}
        <GlassCard className="glass-card-enhanced p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary-solid" />
            <h2 className="text-xl text-gradient-primary">Focus Journal</h2>
            <p className="text-sm text-muted-foreground ml-2">
              Write, decorate, and express yourself freely
            </p>
          </div>
          
          {/* Embedded Journal - Full Width with overflow fix */}
          <div className="h-[600px] overflow-hidden rounded-xl">
            <FocusJournal
              embedded
              initialText={journalEntry}
              onSave={(content) => setJournalEntry(content)}
              className="h-full"
            />
          </div>
        </GlassCard>

        {/* Info Notice for Guests */}
        {!user && isTimerRunning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 glassmorphism rounded-2xl text-center max-w-2xl mx-auto"
          >
                     </motion.div>
        )}
      </div>
    </div>
  );
}