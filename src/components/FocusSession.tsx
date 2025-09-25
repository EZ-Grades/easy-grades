import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Coffee, Zap, Image as ImageIcon, Settings, Palette } from 'lucide-react';
import { ProgressRing } from './ProgressRing';
import { LuxuryButton } from './LuxuryButton';
import { CustomBackgroundUploader } from './CustomBackgroundUploader';
import { useAuth } from '../hooks/useAuth';
import backendService from '../services/backendService';
import { toast } from 'sonner@2.0.3';

interface AmbienceMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  bgClass: string;
}

interface FocusSessionProps {
  initialDuration: number; // in minutes
  onEnd: () => void;
  onCancel?: () => void;
  ambienceMode?: AmbienceMode;
  customBackground?: string | null;
}

export function FocusSession({ initialDuration, onEnd, onCancel, ambienceMode, customBackground }: FocusSessionProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialDuration * 60); // convert to seconds
  const [isRunning, setIsRunning] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showBackgroundChanger, setShowBackgroundChanger] = useState(false);
  const [currentBackground, setCurrentBackground] = useState<string | null>(customBackground || null);
  const [backgroundTransition, setBackgroundTransition] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  
  const { user } = useAuth();

  const totalTime = initialDuration * 60;
  const progress = ((totalTime - timeRemaining) / totalTime) * 100;

  // Load user's saved background preference
  useEffect(() => {
    const loadUserBackground = async () => {
      if (user && !backgroundLoaded) {
        try {
          const userSettings = await backendService.userSettings.getUserSettings(user.id);
          if (userSettings?.focus_background && !customBackground) {
            setCurrentBackground(userSettings.focus_background);
          }
          setBackgroundLoaded(true);
        } catch (error) {
          console.log('No saved background preference found');
          setBackgroundLoaded(true);
        }
      } else if (!user) {
        setBackgroundLoaded(true);
      }
    };

    loadUserBackground();
  }, [user, backgroundLoaded, customBackground]);

  // Predefined background images for different ambiences
  const ambienceBackgrounds = {
    forest: {
      url: 'https://images.unsplash.com/photo-1611782185218-5fa8d1f8b7f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjBuYXR1cmUlMjBwZWFjZWZ1bCUyMHN0dWR5fGVufDF8fHx8MTc1ODcyODUyNHww&ixlib=rb-4.1.0&q=80&w=1920',
      name: 'Forest 🌲',
      description: 'Peaceful woodland ambience'
    },
    ocean: {
      url: 'https://images.unsplash.com/photo-1758459104805-5aec82ed372b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHdhdmVzJTIwY2FsbSUyMHJlbGF4aW5nfGVufDF8fHx8MTc1ODYzNjYyNHww&ixlib=rb-4.1.0&q=80&w=1920',
      name: 'Ocean 🌊',
      description: 'Calming waves and serenity'
    },
    'night-sky': {
      url: 'https://images.unsplash.com/photo-1555338803-7f006cfbcd94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMHNreSUyMHN0YXJzJTIwY296eSUyMGRhcmt8ZW58MXx8fHwxNzU4NzI4NTMwfDA&ixlib=rb-4.1.0&q=80&w=1920',
      name: 'Night Sky 🌌',
      description: 'Starry sky inspiration'
    },
    cafe: {
      url: 'https://images.unsplash.com/photo-1755275402110-9e8eb8592814?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwY2FmZSUyMHN0dWR5JTIwY29mZmVlJTIwd2FybXxlbnwxfHx8fDE3NTg3Mjg1MzN8MA&ixlib=rb-4.1.0&q=80&w=1920',
      name: 'Study Café ☕',
      description: 'Cozy coffee shop vibes'
    },
    minimal: {
      url: 'https://images.unsplash.com/photo-1570416221922-6c1579c36086?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwd2hpdGUlMjBjbGVhbiUyMGJyaWdodHxlbnwxfHx8fDE3NTg3Mjg1MzZ8MA&ixlib=rb-4.1.0&q=80&w=1920',
      name: 'Minimal White 🕊️',
      description: 'Clean and bright focus'
    }
  };

  // Get background for current ambience or use custom
  const getBackgroundImage = () => {
    if (currentBackground) return currentBackground;
    if (ambienceMode?.id && ambienceBackgrounds[ambienceMode.id as keyof typeof ambienceBackgrounds]) {
      return ambienceBackgrounds[ambienceMode.id as keyof typeof ambienceBackgrounds].url;
    }
    return null;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, onEnd]);

  // Prevent scrolling and navigation during focus session
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block most keyboard shortcuts except essential ones
      if (e.key === 'F5' || 
          (e.ctrlKey && ['r', 'n', 't', 'w'].includes(e.key.toLowerCase())) ||
          (e.altKey && e.key === 'Tab') ||
          e.key === 'F11') {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCancel = () => {
    if (showCancelConfirm) {
      onCancel?.();
    } else {
      setShowCancelConfirm(true);
      // Auto-hide confirmation after 5 seconds
      setTimeout(() => setShowCancelConfirm(false), 5000);
    }
  };

  const getPhaseMessage = () => {
    const progressPercent = progress;
    if (progressPercent < 25) return "Getting into the zone...";
    if (progressPercent < 50) return "Deep focus mode activated";
    if (progressPercent < 75) return "You're in the flow state";
    if (progressPercent < 90) return "Final stretch - stay strong";
    return "Almost there - finish strong!";
  };

  const handleBackgroundChange = async (imageUrl: string | null) => {
    setBackgroundTransition(true);
    
    // Preload image if it's a URL to ensure smooth transition
    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        setTimeout(() => {
          setCurrentBackground(imageUrl);
          setBackgroundTransition(false);
        }, 200);
      };
      img.onerror = () => {
        setTimeout(() => {
          setCurrentBackground(imageUrl);
          setBackgroundTransition(false);
        }, 200);
      };
      img.src = imageUrl;
    } else {
      // No preloading needed for null (default gradient)
      setTimeout(() => {
        setCurrentBackground(imageUrl);
        setBackgroundTransition(false);
      }, 200);
    }

    // Save to user settings if logged in
    if (user) {
      try {
        await backendService.userSettings.updateUserSettings(user.id, {
          focus_background: imageUrl
        });
        toast.success(imageUrl ? 'Background changed!' : 'Reset to default background');
      } catch (error) {
        console.error('Error saving background preference:', error);
        toast.error('Failed to save background preference');
      }
    } else {
      toast.success(imageUrl ? 'Background changed!' : 'Reset to default background');
    }
  };

  const handleChangeBackground = () => {
    setShowBackgroundChanger(!showBackgroundChanger);
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-500 ${backgroundTransition ? 'opacity-75' : 'opacity-100'}`}>
      
      {/* Background Transition Indicator */}
      {backgroundTransition && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10001] glass-card p-4 rounded-full"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-primary-solid border-t-transparent rounded-full"
          />
        </motion.div>
      )}
      {/* Background Image or Gradient */}
      {getBackgroundImage() ? (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${getBackgroundImage()})` }}
        >
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ) : (
        <div className={`absolute inset-0 ${ambienceMode?.bgClass || 'bg-gradient'}`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(125, 74, 225, 0.1) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(58, 176, 160, 0.1) 0%, transparent 50%)`
            }} />
          </div>
        </div>
      )}

      {/* Ambience Indicator */}
      {ambienceMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed top-8 left-8 glass-card p-3 flex items-center gap-2"
        >
          <span className="text-xl">{ambienceMode.icon}</span>
          <span className="text-sm font-medium">{ambienceMode.name}</span>
        </motion.div>
      )}

      {/* Top Controls */}
      <div className="fixed top-8 right-8 z-10 flex items-center gap-3">
        {/* Change Background Button */}
        <motion.button
          onClick={handleChangeBackground}
          className="relative p-3 rounded-full glass-card hover:glow-secondary transition-all duration-300 group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          title="Change Background"
        >
          <Palette className="w-6 h-6" />
          {/* Subtle pulse animation */}
          <motion.div
            className="absolute inset-0 rounded-full bg-secondary-solid/20"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0, 0.3]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.button>

        {/* Cancel Button */}
        <motion.button
          onClick={handleCancel}
          className={`
            p-3 rounded-full transition-all duration-300
            ${showCancelConfirm 
              ? 'bg-error-solid text-white glow-error' 
              : 'glass-card hover:glow-primary'
            }
          `}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <X className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Cancel Confirmation */}
      {showCancelConfirm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-24 right-8 glass-card p-4 max-w-xs z-10"
        >
          <p className="text-sm text-error-solid mb-2">
            Are you sure you want to end your focus session?
          </p>
          <p className="text-xs text-mused-foreground">
            Click the X button again to confirm
          </p>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="text-center space-y-8">
        {/* Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <ProgressRing
            progress={progress}
            size={300}
            strokeWidth={16}
            gradient="primary"
          >
            <div className="text-center">
              <motion.div 
                className="text-6xl font-bold text-foreground mb-2"
                key={timeRemaining} // Re-trigger animation on time change
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {formatTime(timeRemaining)}
              </motion.div>
              <div className="text-lg text-muted-foreground">
                {isRunning ? 'Deep Focus Mode' : 'Paused'}
              </div>
            </div>
          </ProgressRing>
        </motion.div>

        {/* Phase Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-2"
        >
          <h2 className="text-2xl font-semibold text-gradient-primary">
            {getPhaseMessage()}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Stay focused and avoid distractions. You're building your concentration muscle.
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex items-center justify-center gap-2"
        >
          {Array.from({ length: 4 }, (_, i) => (
            <motion.div
              key={i}
              className={`
                w-3 h-3 rounded-full transition-all duration-500
                ${progress > (i + 1) * 25 
                  ? 'gradient-primary glow-primary' 
                  : 'bg-muted'
                }
              `}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
            />
          ))}
        </motion.div>

        {/* Pause/Resume Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <LuxuryButton
            variant={isRunning ? "outline" : "primary"}
            onClick={() => setIsRunning(!isRunning)}
            icon={isRunning ? <Coffee className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
            size="lg"
          >
            {isRunning ? 'Take a Break' : 'Resume Focus'}
          </LuxuryButton>
        </motion.div>

        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="max-w-lg mx-auto"
        >
          <blockquote className="text-lg italic text-muted-foreground">
            "The successful warrior is the average person with laser-like focus."
          </blockquote>
          <cite className="text-sm text-muted-foreground mt-2 block">
            — Bruce Lee
          </cite>
        </motion.div>
      </div>

      {/* Background Changer Sidebar */}
      {showBackgroundChanger && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          className="fixed top-0 right-0 w-96 h-full bg-black/80 backdrop-blur-lg z-[10000] p-6 overflow-y-auto"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Change Background</h3>
              <motion.button
                onClick={() => setShowBackgroundChanger(false)}
                className="p-2 rounded-full glass-card hover:glow-primary transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {/* Custom Background Uploader */}
            <CustomBackgroundUploader
              onBackgroundChange={handleBackgroundChange}
              currentBackground={currentBackground}
            />

            {/* Predefined Backgrounds */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Ambience Backgrounds</h4>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(ambienceBackgrounds).map(([key, background]) => (
                  <motion.button
                    key={key}
                    onClick={() => handleBackgroundChange(background.url)}
                    className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all group ${
                      currentBackground === background.url 
                        ? 'border-primary-solid glow-primary' 
                        : 'border-transparent hover:border-white/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img
                      src={background.url}
                      alt={background.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-3">
                      <div className="text-sm text-white font-medium">
                        {background.name}
                      </div>
                      <div className="text-xs text-white/80">
                        {background.description}
                      </div>
                    </div>
                    {/* Selection indicator */}
                    {currentBackground === background.url && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-2 right-2 w-6 h-6 bg-primary-solid rounded-full flex items-center justify-center"
                      >
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Default Background Option */}
            <div className="space-y-3">
              <h4 className="text-lg font-medium text-white">Default Option</h4>
              <motion.button
                onClick={() => handleBackgroundChange(null)}
                className={`relative w-full h-16 rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center ${
                  !currentBackground 
                    ? 'border-primary-solid glow-primary bg-gradient-to-r from-purple-500/20 to-blue-500/20' 
                    : 'border-transparent hover:border-white/50 bg-gradient-to-r from-gray-500/20 to-gray-600/20'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <div className="text-sm text-white font-medium mb-1">
                    ✨ Default Gradient
                  </div>
                  <div className="text-xs text-white/80">
                    Elegant background with focus patterns
                  </div>
                </div>
                {/* Selection indicator */}
                {!currentBackground && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-primary-solid rounded-full flex items-center justify-center"
                  >
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </motion.div>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Session Complete Notification */}
      {timeRemaining === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10"
        >
          <div className="glass-card p-8 text-center max-w-md">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gradient-primary mb-2">
              Focus Session Complete!
            </h2>
            <p className="text-muted-foreground mb-6">
              Congratulations! You've successfully completed your {initialDuration}-minute focus session.
            </p>
            <LuxuryButton
              variant="primary"
              onClick={onEnd}
              fullWidth
            >
              Continue
            </LuxuryButton>
          </div>
        </motion.div>
      )}
    </div>
  );
}