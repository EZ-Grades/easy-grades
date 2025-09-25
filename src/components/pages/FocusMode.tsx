import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Volume2, 
  VolumeX, 
  Timer, 
  Coffee,
  Zap,
  Eye,
  EyeOff,
  Settings,
  Play,
  Minus,
  Plus
} from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { ProgressRing } from '../ProgressRing';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FocusSession } from '../FocusSession';

import { useAuth } from '../../hooks/useAuth';
import backendService from '../../services/backendService';
import { toast } from 'sonner@2.0.3';

interface AmbientSound {
  id: string;
  name: string;
  volume: number;
  enabled: boolean;
  icon: string;
}



export function FocusMode() {
  const [focusTimer, setFocusTimer] = useState(50 * 60); // 50 minutes
  const [focusDuration, setFocusDuration] = useState(50); // Duration in minutes for fullscreen session
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFullscreenSession, setIsFullscreenSession] = useState(false);
  const [distractionBlockEnabled, setDistractionBlockEnabled] = useState(false);
  const [showBlockedSites, setShowBlockedSites] = useState(false);
  const [selectedAmbience, setSelectedAmbience] = useState('cafe');
  const [showAmbienceSelector, setShowAmbienceSelector] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [ambientSounds, setAmbientSounds] = useState<AmbientSound[]>([]);
  const [ambienceModes, setAmbienceModes] = useState<any[]>([]);
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  
  const { user } = useAuth();

  // Helper function to get icon for sound name
  const getIconForSound = (name: string) => {
    const iconMap: { [key: string]: string } = {
      'Rain': '🌧️',
      'Forest': '🌲', 
      'Coffee Shop': '☕',
      'Ocean': '🌊',
      'White Noise': '⚪',
      'Fire': '🔥'
    };
    return iconMap[name] || '🎵';
  };

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      const timeout = setTimeout(() => {
        console.warn('Focus mode data loading timeout, using fallback data');
        setLoading(false);
      }, 10000); // 10 second timeout
      
      try {
        setLoading(true);
        
        // Define fallback data at the top level
        const fallbackSounds = [
          { id: '1', name: 'Rain', volume: 50, enabled: false, icon: '🌧️' },
          { id: '2', name: 'Forest', volume: 30, enabled: true, icon: '🌲' },
          { id: '3', name: 'Coffee Shop', volume: 40, enabled: false, icon: '☕' },
          { id: '4', name: 'Ocean Waves', volume: 60, enabled: false, icon: '🌊' },
          { id: '5', name: 'White Noise', volume: 35, enabled: false, icon: '⚪' },
          { id: '6', name: 'Fireplace', volume: 45, enabled: false, icon: '🔥' }
        ];

        const fallbackModes = [
          { id: 'cafe', name: 'Café', description: 'Warm coffee shop atmosphere', icon: '☕', bg_class: 'bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 dark:from-amber-900 dark:via-orange-800 dark:to-yellow-900' },
          { id: 'library', name: 'Library', description: 'Classic study environment', icon: '📚', bg_class: 'bg-gradient-to-br from-slate-100 via-gray-50 to-blue-100 dark:from-slate-900 dark:via-gray-800 dark:to-blue-900' },
          { id: 'forest', name: 'Forest', description: 'Natural green scenery', icon: '🌲', bg_class: 'bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 dark:from-green-900 dark:via-emerald-800 dark:to-teal-900' },
          { id: 'mountain', name: 'Mountain', description: 'Peaceful mountain scenery', icon: '🏔️', bg_class: 'bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 dark:from-blue-900 dark:via-indigo-800 dark:to-purple-900' },
          { id: 'beach', name: 'Beach', description: 'Calming ocean waves', icon: '🏖️', bg_class: 'bg-gradient-to-br from-cyan-100 via-blue-50 to-teal-100 dark:from-cyan-900 dark:via-blue-800 dark:to-teal-900' },
          { id: 'zen', name: 'Minimalist/Zen', description: 'Clean and distraction-free', icon: '🧘', bg_class: 'bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-800' }
        ];

        const fallbackBlockedSites = [
          'facebook.com',
          'twitter.com',
          'instagram.com',
          'youtube.com',
          'reddit.com',
          'netflix.com',
          'tiktok.com',
          'twitch.tv'
        ];
        
        // Try to load ambient sounds from backend first
        try {
          const soundsResult = await backendService.ambientSounds.getAllAmbientSounds();
          if (soundsResult.data && soundsResult.data.length > 0) {
            const mappedSounds = soundsResult.data.map(sound => ({
              id: sound.id,
              name: sound.name,
              volume: Math.round((sound.volume || 0.5) * 100),
              enabled: false,
              icon: getIconForSound(sound.name)
            }));
            setAmbientSounds(mappedSounds);
          } else {
            setAmbientSounds(fallbackSounds);
          }
        } catch (error) {
          console.warn('Ambient sounds table not available, using fallback data');
          setAmbientSounds(fallbackSounds);
        }

        // Try to load ambience modes from backend
        try {
          const modesResult = await backendService.ambienceModes.getAllAmbienceModes();
          if (modesResult.data && modesResult.data.length > 0) {
            setAmbienceModes(modesResult.data);
          } else {
            setAmbienceModes(fallbackModes);
          }
        } catch (error) {
          console.warn('Ambience modes table not available, using fallback data');
          setAmbienceModes(fallbackModes);
        }

        // Load user-specific data if logged in
        if (user) {
          try {
            // Load user ambient settings
            const userSoundsResult = await backendService.ambientSounds.getUserAmbientSettings(user.id);
            if (userSoundsResult.data && userSoundsResult.data.length > 0) {
              const userSounds = userSoundsResult.data.map(setting => ({
                id: setting.ambient_sound_id,
                name: setting.ambient_sounds.name,
                volume: setting.volume,
                enabled: setting.enabled,
                icon: setting.ambient_sounds.icon || '🔊'
              }));
              setAmbientSounds(userSounds);
            }

            // Load distraction blocker settings
            const userSettingsResult = await backendService.distractionBlocker.getUserSettings(user.id);
            if (userSettingsResult.data) {
              setDistractionBlockEnabled(userSettingsResult.data.distraction_block_enabled);
              setShowBlockedSites(userSettingsResult.data.show_blocked_sites);
            }

            // Load blocked sites
            const blockedSitesResult = await backendService.distractionBlocker.getBlockedSites(user.id);
            if (blockedSitesResult.data && blockedSitesResult.data.length > 0) {
              setBlockedSites(blockedSitesResult.data.map(site => site.url));
            } else {
              setBlockedSites(fallbackBlockedSites);
            }

            // Load user background preference
            try {
              const userSettingsResult = await backendService.userSettings.getUserSettings(user.id);
              if (userSettingsResult.data?.focus_background) {
                setCustomBackground(userSettingsResult.data.focus_background);
              }
            } catch (error) {
              console.error('Error loading user background preference:', error);
            }
          } catch (error) {
            console.error('Error loading user-specific data:', error);
            setBlockedSites(fallbackBlockedSites);
          }
        } else {
          setBlockedSites(fallbackBlockedSites);
        }
      } catch (error) {
        console.error('Error loading focus mode data:', error);
        // Don't show error toast for expected missing tables
        if (!error?.message?.includes('not found') && !error?.message?.includes('table')) {
          toast.error('Failed to load focus mode data');
        }
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const totalFocusTime = focusDuration * 60;
  const focusProgress = ((totalFocusTime - focusTimer) / totalFocusTime) * 100;

  // Update timer when duration changes (but only if not running)
  useEffect(() => {
    if (!isTimerRunning) {
      setFocusTimer(focusDuration * 60);
    }
  }, [focusDuration, isTimerRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && focusTimer > 0) {
      interval = setInterval(() => {
        setFocusTimer((prev) => {
          const newTime = prev - 1;
          
          // Update session progress in backend if user is logged in
          if (user && currentSessionId) {
            const completedMinutes = Math.floor((totalFocusTime - newTime) / 60);
            backendService.focusSessions.updateSessionProgress(currentSessionId, completedMinutes)
              .catch(error => console.error('Error updating session progress:', error));
          }
          
          return newTime;
        });
      }, 1000);
    } else if (isTimerRunning && focusTimer === 0) {
      // Session completed
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, focusTimer, user, currentSessionId, totalFocusTime]);

  const startFocusSession = async () => {
    if (!user) {
      toast.error('Please log in to start a focus session');
      return;
    }

    try {
      const selectedMode = ambienceModes.find(mode => mode.id === selectedAmbience);
      const result = await backendService.focusSessions.startSession(
        user.id, 
        focusDuration,
        selectedMode?.name,
        isFullscreenSession
      );
      
      if (result.success && result.data) {
        setCurrentSessionId(result.data.id);
        setSessionStartTime(new Date());
        setIsTimerRunning(true);
        toast.success('Focus session started!');
      } else {
        toast.error(result.error?.message || 'Failed to start session');
      }
    } catch (error) {
      console.error('Error starting focus session:', error);
      toast.error('Failed to start session');
    }
  };

  const handleSessionComplete = async () => {
    if (user && currentSessionId) {
      try {
        await backendService.focusSessions.endSession(currentSessionId, focusDuration);
        toast.success('Focus session completed! Great job! 🎉');
      } catch (error) {
        console.error('Error completing session:', error);
      }
    }
    
    setIsTimerRunning(false);
    setCurrentSessionId(null);
    setSessionStartTime(null);
    setFocusTimer(focusDuration * 60);
  };

  const stopFocusSession = async () => {
    if (user && currentSessionId) {
      try {
        const completedMinutes = Math.floor((totalFocusTime - focusTimer) / 60);
        await backendService.focusSessions.endSession(currentSessionId, completedMinutes);
        toast.info('Focus session stopped');
      } catch (error) {
        console.error('Error stopping session:', error);
      }
    }
    
    setIsTimerRunning(false);
    setCurrentSessionId(null);
    setSessionStartTime(null);
    setFocusTimer(focusDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleSound = async (id: string) => {
    const updatedSounds = ambientSounds.map(sound => 
      sound.id === id ? { ...sound, enabled: !sound.enabled } : sound
    );
    setAmbientSounds(updatedSounds);

    // Save to backend if user is logged in
    if (user) {
      try {
        const sound = updatedSounds.find(s => s.id === id);
        if (sound) {
          await backendService.ambientSounds.updateUserAmbientSetting(
            user.id, 
            id, 
            sound.enabled, 
            sound.volume
          );
        }
      } catch (error) {
        console.error('Error updating ambient sound setting:', error);
      }
    }
  };

  const updateSoundVolume = async (id: string, volume: number) => {
    const updatedSounds = ambientSounds.map(sound => 
      sound.id === id ? { ...sound, volume } : sound
    );
    setAmbientSounds(updatedSounds);

    // Save to backend if user is logged in
    if (user) {
      try {
        const sound = updatedSounds.find(s => s.id === id);
        if (sound) {
          await backendService.ambientSounds.updateUserAmbientSetting(
            user.id, 
            id, 
            sound.enabled, 
            volume
          );
        }
      } catch (error) {
        console.error('Error updating ambient sound volume:', error);
      }
    }
  };

  // Show ambience selector before starting fullscreen session
  if (showAmbienceSelector) {
    return (
      <div className="min-h-screen pb-8 px-4 pt-8">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gradient-primary">Choose Your Ambience</span> 🎯
            </h1>
            <p className="text-lg text-muted-foreground">Select the perfect background for your focus session</p>
          </motion.div>

          <GlassCard size="lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ambienceModes.map((ambience, index) => (
                <motion.div
                  key={ambience.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    p-6 rounded-lg border-2 transition-all duration-300 cursor-pointer
                    ${selectedAmbience === ambience.id 
                      ? 'border-primary-solid bg-primary-solid/10 glow-primary' 
                      : 'border-muted hover:border-primary-solid/50'
                    }
                  `}
                  onClick={() => setSelectedAmbience(ambience.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{ambience.icon}</div>
                    <h3 className="font-semibold mb-2">{ambience.name}</h3>
                    <p className="text-sm text-muted-foreground">{ambience.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setShowAmbienceSelector(false)}
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  setShowAmbienceSelector(false);
                  setIsFullscreenSession(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Focus Session
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // Show fullscreen focus session
  if (isFullscreenSession) {
    const selectedAmbienceMode = ambienceModes.find(a => a.id === selectedAmbience);
    return (
      <FocusSession
        initialDuration={focusDuration}
        onEnd={() => setIsFullscreenSession(false)}
        onCancel={() => setIsFullscreenSession(false)}
        ambienceMode={selectedAmbienceMode}
        customBackground={customBackground}
      />
    );
  }

  return (
    <div className="min-h-screen pb-8 px-4 pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient-primary">Deep Focus</span> 🎯
          </h1>
          <p className="text-lg text-muted-foreground">Enter the zone of maximum productivity</p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Focus Timer */}
          <div className="xl:col-span-1">
            <GlassCard size="lg" gradient="primary">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-6 text-gradient-primary">
                  <Timer className="inline w-5 h-5 mr-2" />
                  Focus Session
                </h2>
                
                {/* Duration Selector for Fullscreen Focus */}
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-3">Set focus duration</p>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <motion.button
                      onClick={() => setFocusDuration(Math.max(5, focusDuration - 5))}
                      className="glass-card p-2 rounded-lg hover:glow-primary transition-all duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{focusDuration}</div>
                      <div className="text-xs text-muted-foreground">minutes</div>
                    </div>
                    <motion.button
                      onClick={() => setFocusDuration(Math.min(180, focusDuration + 5))}
                      className="glass-card p-2 rounded-lg hover:glow-primary transition-all duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <ProgressRing 
                    progress={focusProgress} 
                    size={180} 
                    strokeWidth={12}
                    gradient="primary"
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground mb-1">
                        {formatTime(focusTimer)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isTimerRunning ? 'Deep Focus' : 'Ready'}
                      </div>
                    </div>
                  </ProgressRing>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => setShowAmbienceSelector(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Fullscreen Focus
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="w-full"
                  >
                    {isTimerRunning ? (
                      <>
                        <Timer className="w-4 h-4 mr-2" />
                        Pause Focus
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Start Normal Focus
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setFocusTimer(focusDuration * 60);
                    }}
                  >
                    Reset Timer
                  </Button>
                </div>
              </div>
            </GlassCard>

            {/* Distraction Blocker */}
            <GlassCard className="mt-6" gradient="secondary">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-secondary-solid" />
                  <h3 className="font-semibold text-gradient-secondary">Distraction Blocker</h3>
                </div>
                <motion.button
                  onClick={async () => {
                    const newValue = !distractionBlockEnabled;
                    setDistractionBlockEnabled(newValue);
                    
                    // Save to backend if user is logged in
                    if (user) {
                      try {
                        await backendService.distractionBlocker.updateUserSettings(
                          user.id, 
                          newValue, 
                          showBlockedSites
                        );
                        toast.success(`Distraction blocker ${newValue ? 'enabled' : 'disabled'}`);
                      } catch (error) {
                        console.error('Error updating distraction blocker:', error);
                        // Revert on error
                        setDistractionBlockEnabled(!newValue);
                        toast.error('Failed to update distraction blocker');
                      }
                    }
                  }}
                  className={`
                    relative w-12 h-6 rounded-full transition-all duration-300
                    ${distractionBlockEnabled ? 'gradient-secondary' : 'bg-muted'}
                  `}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                    animate={{ x: distractionBlockEnabled ? 26 : 2 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  />
                </motion.button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Block distracting websites during focus sessions
              </p>

              <div className="flex items-center justify-between">
                <Badge 
                  className={distractionBlockEnabled ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-950/30' : 'border-red-500 text-red-600 bg-red-50 dark:bg-red-950/30'}
                >
                  {distractionBlockEnabled ? 'Active' : 'Inactive'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBlockedSites(!showBlockedSites)}
                >
                  {showBlockedSites ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Hide Sites
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Show Sites
                    </>
                  )}
                </Button>
              </div>

              {showBlockedSites && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 space-y-2"
                >
                  {blockedSites.slice(0, 3).map((site, index) => (
                    <div key={index} className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                      {site}
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground text-center">
                    +{blockedSites.length - 3} more sites
                  </div>
                </motion.div>
              )}
            </GlassCard>
          </div>

          {/* Ambient Sounds & Customization */}
          <div className="xl:col-span-2 space-y-6">
            {/* Ambient Sounds */}
            <GlassCard size="lg">
              <div className="flex items-center gap-2 mb-6">
                <Volume2 className="w-5 h-5 text-highlight-solid" />
                <h2 className="text-xl font-semibold text-gradient-highlight">Ambient Sounds</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ambientSounds.map((sound) => (
                  <motion.div
                    key={sound.id}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer
                      ${sound.enabled 
                        ? 'bg-highlight-solid/10 border-highlight-solid/50 glow-highlight' 
                        : 'bg-muted/30 border-muted hover:border-muted-foreground/30'
                      }
                    `}
                    onClick={() => toggleSound(sound.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{sound.icon}</span>
                        <span className="font-medium">{sound.name}</span>
                      </div>
                      {sound.enabled ? (
                        <Volume2 className="w-4 h-4 text-highlight-solid" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>

                    {sound.enabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span>Volume</span>
                          <span>{sound.volume}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={sound.volume}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateSoundVolume(sound.id, Number(e.target.value));
                          }}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <div className="text-sm text-muted-foreground">
                  💡 Tip: Combine multiple sounds for a unique atmosphere. Studies show that ambient sounds can improve focus by up to 70%.
                </div>
              </div>
            </GlassCard>
          </div>
        </div>


      </div>
    </div>
  );
}