import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Headphones, 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  Gamepad2,
  Dumbbell,
  Coffee,
  Shuffle,
  VolumeX,
  Timer,
  Wind,
  Sparkles,
  Target,
  Brain,
  Zap,
  ChevronRight,
  RotateCcw,
  Music,
  List,
  SkipBack,
  Heart,
  Repeat
} from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Slider } from '../ui/slider';
import { ScrollArea } from '../ui/scroll-area';
import { GameContainer, GameType } from '../games/GameContainer';
import { useAuth } from '../../hooks/useAuth';
import backendService from '../../services/backendService';
import { toast } from 'sonner@2.0.3';

interface Track {
  id: string;
  name: string;
  mood: string;
  genre: string;
  description?: string;
  duration?: number;
  file_url?: string;
  created_at?: string;
}

interface UserTrackPreferences {
  user_id: string;
  track_id: string;
  is_favorite: boolean;
  play_count: number;
  last_played_at: string;
}

interface MiniGame {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: 'memory' | 'puzzle' | 'reflex';
  icon: any;
  gradient: string;
}

interface StretchExercise {
  id: string;
  name: string;
  duration: number;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string[];
}

export function BreakMode() {
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingTimer, setBreathingTimer] = useState(0);
  const [breathingCycle, setBreathingCycle] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeLevel] = useState([70]);
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<StretchExercise | null>(null);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [exerciseActive, setExerciseActive] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showTrackList, setShowTrackList] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserTrackPreferences[]>([]);
  const [isShuffleMode, setIsShuffleMode] = useState(false);
  const [playedTracks, setPlayedTracks] = useState<string[]>([]);
  
  const { user } = useAuth();

  const miniGames: MiniGame[] = [
    {
      id: '1',
      title: 'Tic Tac Toe',
      description: 'Strategic thinking with quick chess puzzles',
      duration: '5-10 min',
      category: 'puzzle',
      icon: Target,
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: '2',
      title: 'Sudoku',
      description: 'Number puzzles to sharpen logical thinking',
      duration: '3-8 min',
      category: 'puzzle',
      icon: Brain,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: '3',
      title: 'Draw & Guess',
      description: 'Creative drawing with AI recognition',
      duration: '2-5 min',
      category: 'reflex',
      icon: Sparkles,
      gradient: 'from-pink-500 to-pink-600'
    },
    {
      id: '4',
      title: 'Hangman',
      description: 'Classic word guessing challenge',
      duration: '2-4 min',
      category: 'memory',
      icon: Zap,
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: '5',
      title: 'Riddles',
      description: 'Mind-bending logic puzzles and brain teasers',
      duration: '1-3 min',
      category: 'puzzle',
      icon: Brain,
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      id: '6',
      title: 'Memory Test',
      description: 'Music recognition and memory game',
      duration: '3-5 min',
      category: 'memory',
      icon: Headphones,
      gradient: 'from-indigo-500 to-indigo-600'
    }
  ];

  const stretchExercises: StretchExercise[] = [
    {
      id: '1',
      name: 'Neck Tension Relief',
      duration: 30,
      description: 'Gentle neck movements to release built-up tension',
      difficulty: 'easy',
      instructions: [
        'Sit up straight with shoulders relaxed',
        'Slowly roll your head in a circle',
        'Hold each position for 2-3 seconds',
        'Repeat in both directions'
      ]
    },
    {
      id: '2',
      name: 'Shoulder Blade Squeeze',
      duration: 20,
      description: 'Release shoulder tension from long study sessions',
      difficulty: 'easy',
      instructions: [
        'Sit tall with arms at your sides',
        'Squeeze shoulder blades together',
        'Hold for 5 seconds',
        'Release and repeat'
      ]
    },
    {
      id: '3',
      name: 'Spinal Twist',
      duration: 45,
      description: 'Improve spinal mobility and reduce back stiffness',
      difficulty: 'medium',
      instructions: [
        'Sit with feet flat on the floor',
        'Place one hand behind you',
        'Gently rotate your spine',
        'Hold and breathe deeply'
      ]
    },
    {
      id: '4',
      name: 'Eye Movement Exercise',
      duration: 15,
      description: 'Rest tired eyes from screen fatigue',
      difficulty: 'easy',
      instructions: [
        'Look far into the distance',
        'Focus on a near object',
        'Blink slowly and deliberately',
        'Roll eyes in gentle circles'
      ]
    }
  ];

  // Load tracks and user preferences from backend on component mount
  useEffect(() => {
    const loadTracksAndPreferences = async () => {
      try {
        setLoading(true);
        
        // Fallback tracks in case backend is not set up
        const fallbackTracks: Track[] = [
          { id: '1', name: 'Birds Chirping', mood: 'Peaceful', genre: 'Nature', description: 'Gentle morning birds in a forest', duration: 180 },
          { id: '2', name: 'Singing Bowls', mood: 'Meditative', genre: 'Meditation', description: 'Tibetan healing bowl tones', duration: 240 },
          { id: '3', name: 'Binaural Beats', mood: 'Focused', genre: 'Brainwave', description: 'Alpha waves for concentration', duration: 300 },
          { id: '4', name: 'Ocean Waves', mood: 'Tranquil', genre: 'Nature', description: 'Gentle waves on sandy shore', duration: 210 },
          { id: '5', name: 'Forest Rain', mood: 'Refreshing', genre: 'Nature', description: 'Light rain through tree canopy', duration: 195 },
          { id: '6', name: 'Deep Space', mood: 'Dreamy', genre: 'Ambient', description: 'Cosmic ambient soundscape', duration: 270 },
          { id: '7', name: 'Mountain Breeze', mood: 'Calm', genre: 'Nature', description: 'Gentle wind through mountain peaks', duration: 225 },
          { id: '8', name: 'Meditation Chimes', mood: 'Peaceful', genre: 'Meditation', description: 'Soft chimes for deep relaxation', duration: 320 }
        ];
        
        try {
          // Load tracks sorted by name
          const tracksResult = await backendService.tracks.getAllTracks('name');
          if (tracksResult.data && tracksResult.data.length > 0) {
            setTracks(tracksResult.data);
            
            // Load user preferences if authenticated
            if (user) {
              try {
                const prefsResult = await backendService.tracks.getUserPreferences(user.id);
                if (prefsResult.data) {
                  setUserPreferences(prefsResult.data);
                  
                  // Set current track to last played or first track
                  const lastPlayed = prefsResult.data.find(p => p.last_played_at);
                  if (lastPlayed) {
                    const track = tracksResult.data.find(t => t.id === lastPlayed.track_id);
                    if (track) {
                      setCurrentTrack(track);
                      setCurrentTrackIndex(tracksResult.data.findIndex(t => t.id === track.id));
                    } else {
                      setCurrentTrack(tracksResult.data[0]);
                      setCurrentTrackIndex(0);
                    }
                  } else {
                    setCurrentTrack(tracksResult.data[0]);
                    setCurrentTrackIndex(0);
                  }
                } else {
                  setCurrentTrack(tracksResult.data[0]);
                  setCurrentTrackIndex(0);
                }
              } catch (error) {
                console.error('Error loading user preferences:', error);
                setCurrentTrack(tracksResult.data[0]);
                setCurrentTrackIndex(0);
              }
            } else {
              setCurrentTrack(tracksResult.data[0]);
              setCurrentTrackIndex(0);
            }
          } else {
            // Use fallback data
            setTracks(fallbackTracks);
            setCurrentTrack(fallbackTracks[0]);
            setCurrentTrackIndex(0);
          }
        } catch (error) {
          console.error('Error loading tracks:', error);
          // Use fallback data
          setTracks(fallbackTracks);
          setCurrentTrack(fallbackTracks[0]);
          setCurrentTrackIndex(0);
        }
      } catch (error) {
        console.error('Error in loadTracksAndPreferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTracksAndPreferences();
  }, [user]);

  // Load user volume settings
  useEffect(() => {
    const loadVolumeSettings = async () => {
      if (!user) return;
      
      try {
        const result = await backendService.volume.getUserVolumeSettings(user.id);
        if (result.data) {
          setVolumeLevel([result.data.master_volume || 70]);
        }
      } catch (error) {
        console.error('Error loading volume settings:', error);
      }
    };

    loadVolumeSettings();
  }, [user]);

  // Save volume settings when changed
  useEffect(() => {
    const saveVolumeSettings = async () => {
      if (!user) return;
      
      try {
        await backendService.volume.updateVolumeSettings(user.id, {
          master_volume: volume[0]
        });
      } catch (error) {
        console.error('Error saving volume settings:', error);
      }
    };

    const timeoutId = setTimeout(saveVolumeSettings, 500);
    return () => clearTimeout(timeoutId);
  }, [volume, user]);

  // Breathing exercise logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathingTimer((prev) => {
          if (breathingPhase === 'inhale' && prev >= 4) {
            setBreathingPhase('hold');
            return 0;
          } else if (breathingPhase === 'hold' && prev >= 7) {
            setBreathingPhase('exhale');
            return 0;
          } else if (breathingPhase === 'exhale' && prev >= 8) {
            setBreathingPhase('inhale');
            setBreathingCycle(cycle => cycle + 1);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathingActive, breathingPhase]);

  // Exercise timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (exerciseActive && selectedExercise) {
      interval = setInterval(() => {
        setExerciseTimer(prev => {
          if (prev >= selectedExercise.duration) {
            setExerciseActive(false);
            setSelectedExercise(null);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [exerciseActive, selectedExercise]);

  const getGameCategoryColor = (category: string) => {
    switch (category) {
      case 'memory': return 'from-green-500 to-emerald-500';
      case 'puzzle': return 'from-blue-500 to-cyan-500';
      case 'reflex': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'border-green-500 text-green-600 bg-green-50 dark:bg-green-950/30';
      case 'medium': return 'border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30';
      case 'hard': return 'border-red-500 text-red-600 bg-red-50 dark:bg-red-950/30';
      default: return 'border-gray-500 text-gray-600 bg-gray-50 dark:bg-gray-950/30';
    }
  };

  const getCurrentTrack = () => {
    return currentTrack || (tracks.length > 0 ? tracks[0] : null);
  };

  const selectTrack = async (track: Track, index: number) => {
    setCurrentTrack(track);
    setCurrentTrackIndex(index);
    setShowTrackList(false);
    
    // Record play history if user is logged in
    if (user) {
      try {
        await backendService.tracks.recordPlay(user.id, track.id);
        // Update last played preference
        await updateUserPreference(track.id, { last_played_at: new Date().toISOString() });
      } catch (error) {
        console.error('Error recording track selection:', error);
      }
    }
  };

  const nextTrack = async () => {
    if (tracks.length === 0) return;
    
    let nextIndex: number;
    let nextTrack: Track;
    
    if (isShuffleMode) {
      // In shuffle mode, avoid recently played tracks if possible
      const availableTracks = tracks.filter(track => !playedTracks.includes(track.id));
      if (availableTracks.length > 0) {
        nextTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
        nextIndex = tracks.findIndex(track => track.id === nextTrack.id);
      } else {
        // Reset played tracks and pick random
        setPlayedTracks([]);
        nextIndex = Math.floor(Math.random() * tracks.length);
        nextTrack = tracks[nextIndex];
      }
    } else {
      nextIndex = (currentTrackIndex + 1) % tracks.length;
      nextTrack = tracks[nextIndex];
    }
    
    setCurrentTrack(nextTrack);
    setCurrentTrackIndex(nextIndex);
    setPlayedTracks(prev => [...prev, nextTrack.id]);
    
    // Record play history if user is logged in
    if (user) {
      try {
        await backendService.tracks.recordPlay(user.id, nextTrack.id);
        await updateUserPreference(nextTrack.id, { last_played_at: new Date().toISOString() });
      } catch (error) {
        console.error('Error recording track play:', error);
      }
    }
  };

  const previousTrack = async () => {
    if (tracks.length === 0) return;
    
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    const prevTrack = tracks[prevIndex];
    setCurrentTrack(prevTrack);
    setCurrentTrackIndex(prevIndex);
    
    // Record play history if user is logged in
    if (user) {
      try {
        await backendService.tracks.recordPlay(user.id, prevTrack.id);
        await updateUserPreference(prevTrack.id, { last_played_at: new Date().toISOString() });
      } catch (error) {
        console.error('Error recording track play:', error);
      }
    }
  };

  const toggleShuffle = () => {
    setIsShuffleMode(!isShuffleMode);
    setPlayedTracks([]); // Reset played tracks when toggling shuffle
    toast.success(isShuffleMode ? 'Shuffle mode disabled' : 'Shuffle mode enabled');
  };

  const playTrack = async () => {
    const track = getCurrentTrack();
    if (!track) return;
    
    setIsPlaying(!isPlaying);
    
    // Record play history if user is logged in and starting to play
    if (user && !isPlaying) {
      try {
        await backendService.tracks.recordPlay(user.id, track.id);
        await updateUserPreference(track.id, { 
          last_played_at: new Date().toISOString(),
          play_count: (getUserPreference(track.id)?.play_count || 0) + 1
        });
      } catch (error) {
        console.error('Error recording track play:', error);
      }
    }
  };

  const toggleFavorite = async (trackId: string) => {
    if (!user) {
      toast.error('Please sign in to favorite tracks');
      return;
    }
    
    const currentPref = getUserPreference(trackId);
    const newFavoriteStatus = !currentPref?.is_favorite;
    
    try {
      await updateUserPreference(trackId, { is_favorite: newFavoriteStatus });
      toast.success(newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error updating favorite status:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const getUserPreference = (trackId: string): UserTrackPreferences | undefined => {
    return userPreferences.find(pref => pref.track_id === trackId);
  };

  const updateUserPreference = async (trackId: string, updates: Partial<UserTrackPreferences>) => {
    if (!user) return;
    
    try {
      await backendService.tracks.updateUserPreference(user.id, trackId, updates);
      
      // Update local state
      setUserPreferences(prev => {
        const existing = prev.find(pref => pref.track_id === trackId);
        if (existing) {
          return prev.map(pref => 
            pref.track_id === trackId 
              ? { ...pref, ...updates } 
              : pref
          );
        } else {
          return [...prev, {
            user_id: user.id,
            track_id: trackId,
            is_favorite: false,
            play_count: 0,
            last_played_at: new Date().toISOString(),
            ...updates
          } as UserTrackPreferences];
        }
      });
    } catch (error) {
      console.error('Error updating user preference:', error);
    }
  };

  const getGameType = (gameTitle: string): GameType => {
    const gameMap: Record<string, GameType> = {
      'Chess': 'chess',
      'Sudoku': 'sudoku',
      'Draw & Guess': 'draw-guess',
      'Hangman': 'hangman',
      'Riddles': 'riddles',
      'Song Guess': 'song-guess'
    };
    return gameMap[gameTitle] || 'chess';
  };

  const playGame = (gameTitle: string) => {
    setSelectedGame(getGameType(gameTitle));
  };

  const startExercise = (exercise: StretchExercise) => {
    setSelectedExercise(exercise);
    setExerciseTimer(0);
    setExerciseActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Show game if one is selected
  if (selectedGame) {
    return (
      <GameContainer
        gameType={selectedGame}
        onClose={() => setSelectedGame(null)}
      />
    );
  }

  return (
    <div className="min-h-screen pb-8 px-6 pt-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Coffee className="w-8 h-8 text-highlight-solid" />
            </motion.div>
            <h1 className="text-5xl font-bold text-gradient-primary">
              Break Time
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Recharge your mind and body with guided activities designed for optimal recovery
          </p>
        </motion.div>

        {/* Exercise Timer Overlay */}
        <AnimatePresence>
          {selectedExercise && exerciseActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            >
              <GlassCard className="text-center max-w-md w-full">
                <h3 className="text-2xl font-bold mb-2">{selectedExercise.name}</h3>
                <div className="text-6xl font-bold text-gradient-secondary mb-4">
                  {formatTime(selectedExercise.duration - exerciseTimer)}
                </div>
                <Progress 
                  value={(exerciseTimer / selectedExercise.duration) * 100} 
                  className="mb-6 h-3"
                />
                <div className="space-y-2 mb-6 text-left">
                  {selectedExercise.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                        {index + 1}
                      </div>
                      <span>{instruction}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => {
                    setExerciseActive(false);
                    setSelectedExercise(null);
                    setExerciseTimer(0);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Stop Exercise
                </Button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Enhanced Breathing Guide */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard className="text-center relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-green-500" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Wind className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-gradient-secondary">
                    Breathing Exercise
                  </h2>
                </div>
                
                <div className="relative mb-8">
                  <motion.div
                    className="w-40 h-40 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center relative shadow-2xl"
                    animate={{
                      scale: breathingActive 
                        ? breathingPhase === 'inhale' ? 1.3 
                          : breathingPhase === 'hold' ? 1.3 
                          : 0.9
                        : 1
                    }}
                    transition={{ 
                      duration: breathingPhase === 'inhale' ? 4 
                              : breathingPhase === 'hold' ? 7 
                              : 8,
                      ease: 'easeInOut'
                    }}
                  >
                    <div className="text-white font-bold text-center">
                      <div className="text-xl capitalize mb-1">
                        {breathingActive ? breathingPhase : 'Ready'}
                      </div>
                      <div className="text-3xl">
                        {breathingActive ? `${breathingTimer}s` : '4-7-8'}
                      </div>
                    </div>
                    
                    {breathingActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-white/30"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.8, 0.3]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </motion.div>
                </div>

                {breathingActive && (
                  <div className="mb-6 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Cycle Progress</span>
                      <span>{breathingCycle} cycles</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Inhale 4s → Hold 7s → Exhale 8s
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={breathingActive ? "outline" : "default"}
                    onClick={() => setBreathingActive(!breathingActive)}
                    className="bg-gradient-to-r from-blue-600 to-green-600 text-white border-0"
                  >
                    {breathingActive ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBreathingActive(false);
                      setBreathingCycle(0);
                      setBreathingTimer(0);
                      setBreathingPhase('inhale');
                    }}
                    disabled={!breathingActive}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Enhanced Music Player */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GlassCard className="relative overflow-hidden">
              {/* Background Visualization */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-6 h-6 text-purple-500" />
                    <h2 className="text-2xl font-bold text-gradient-primary">
                      Relaxing Sounds
                    </h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTrackList(!showTrackList)}
                    className="flex items-center gap-2"
                  >
                    <List className="w-4 h-4" />
                    Tracks
                  </Button>
                </div>
                
                {/* Track List Dropdown */}
                <AnimatePresence>
                  {showTrackList && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 overflow-hidden"
                    >
                      <GlassCard className="p-4">
                        <ScrollArea className="h-48">
                          <div className="space-y-2">
                            {tracks.map((track, index) => (
                              <motion.div
                                key={track.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                  currentTrack?.id === track.id 
                                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30' 
                                    : 'hover:bg-muted/50'
                                }`}
                                onClick={() => selectTrack(track, index)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                                    <Music className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{track.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span>{track.mood}</span>
                                      <span>•</span>
                                      <span>{track.genre}</span>
                                      {track.duration && (
                                        <>
                                          <span>•</span>
                                          <span>{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {user && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(track.id);
                                      }}
                                      className="p-1 h-auto"
                                    >
                                      <Heart 
                                        className={`w-4 h-4 ${
                                          getUserPreference(track.id)?.is_favorite 
                                            ? 'fill-red-500 text-red-500' 
                                            : 'text-muted-foreground'
                                        }`} 
                                      />
                                    </Button>
                                  )}
                                  {currentTrack?.id === track.id && isPlaying && (
                                    <motion.div
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{ duration: 1, repeat: Infinity }}
                                      className="w-2 h-2 rounded-full bg-green-500"
                                    />
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </ScrollArea>
                      </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="text-center mb-6">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <motion.div
                      className="w-full h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-xl"
                      animate={{ rotate: isPlaying ? 360 : 0 }}
                      transition={{ duration: 20, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
                    >
                      {isPlaying ? (
                        <Volume2 className="w-10 h-10 text-white" />
                      ) : (
                        <VolumeX className="w-10 h-10 text-white" />
                      )}
                    </motion.div>
                    
                    {isPlaying && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-purple-400/30"
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [0.3, 0.8, 0.3]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </div>
                  
                  {loading ? (
                    <div className="animate-pulse">
                      <div className="h-6 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded mb-3"></div>
                      <div className="flex gap-2 justify-center mb-4">
                        <div className="h-6 w-16 bg-muted rounded"></div>
                        <div className="h-6 w-16 bg-muted rounded"></div>
                      </div>
                    </div>
                  ) : currentTrack ? (
                    <>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <h3 className="font-bold text-xl">{currentTrack.name}</h3>
                        {user && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(currentTrack.id)}
                            className="p-1 h-auto"
                          >
                            <Heart 
                              className={`w-5 h-5 ${
                                getUserPreference(currentTrack.id)?.is_favorite 
                                  ? 'fill-red-500 text-red-500' 
                                  : 'text-muted-foreground'
                              }`} 
                            />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{currentTrack.description || 'Relaxing background music'}</p>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Badge variant="outline">{currentTrack.mood}</Badge>
                        <Badge variant="secondary">{currentTrack.genre}</Badge>
                        {currentTrack.duration && (
                          <Badge variant="outline">
                            {Math.floor(currentTrack.duration / 60)}:{(currentTrack.duration % 60).toString().padStart(2, '0')}
                          </Badge>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground mb-4">
                      <p>No tracks available</p>
                    </div>
                  )}
                </div>

                {/* Enhanced Playback Controls */}
                <div className="flex justify-center gap-2 mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleShuffle}
                    disabled={!currentTrack || tracks.length <= 1}
                    className={`flex items-center gap-2 ${isShuffleMode ? 'bg-purple-500/20 border-purple-500' : ''}`}
                  >
                    <Shuffle className="w-4 h-4" />
                    {isShuffleMode ? 'On' : 'Off'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousTrack}
                    disabled={!currentTrack || tracks.length <= 1}
                    className="flex items-center gap-2"
                  >
                    <SkipBack className="w-4 h-4" />
                    Prev
                  </Button>
                  <Button
                    onClick={playTrack}
                    disabled={!currentTrack}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center gap-2 px-6"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextTrack}
                    disabled={!currentTrack || tracks.length <= 1}
                    className="flex items-center gap-2"
                  >
                    <SkipForward className="w-4 h-4" />
                    Next
                  </Button>
                </div>

                {/* Volume Control */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Volume</span>
                    <span className="text-muted-foreground">{volume[0]}%</span>
                  </div>
                  <Slider
                    value={volume}
                    onValueChange={setVolumeLevel}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Track Progress Info */}
                {user && currentTrack && (
                  <div className="mt-4 pt-4 border-t border-muted/20">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Track {currentTrackIndex + 1} of {tracks.length}</span>
                      {getUserPreference(currentTrack.id)?.play_count && (
                        <span>Played {getUserPreference(currentTrack.id)?.play_count} times</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Enhanced Mini Games */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Gamepad2 className="w-8 h-8 text-highlight-solid" />
            <h2 className="text-3xl font-bold text-gradient-highlight">Quick Games</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/50 to-transparent" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {miniGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <GlassCard className="h-full relative overflow-hidden">
                  {/* Game Category Accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getGameCategoryColor(game.category)}`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${game.gradient} flex items-center justify-center shadow-lg`}>
                        <game.icon className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {game.category}
                      </Badge>
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {game.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Timer className="w-3 h-3" />
                        <span>{game.duration}</span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => playGame(game.title)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Play Game
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Stretch Exercises */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Dumbbell className="w-8 h-8 text-secondary-solid" />
            <h2 className="text-3xl font-bold text-gradient-secondary">Quick Stretches</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-green-500/50 to-transparent" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stretchExercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <GlassCard className="h-full relative overflow-hidden">
                  {/* Difficulty Accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    exercise.difficulty === 'easy' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                    exercise.difficulty === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                    'bg-gradient-to-r from-red-500 to-red-600'
                  }`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-lg group-hover:text-green-600 transition-colors">
                        {exercise.name}
                      </h3>
                      <div className="flex gap-2">
                        <Badge className={getDifficultyColor(exercise.difficulty)}>
                          {exercise.difficulty}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {exercise.duration}s
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {exercise.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      {exercise.instructions.slice(0, 2).map((instruction, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-600 to-green-700 text-white text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                            {idx + 1}
                          </div>
                          <span>{instruction}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={() => startExercise(exercise)}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Start Exercise
                      <Play className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}