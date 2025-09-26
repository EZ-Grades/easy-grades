import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coffee,
  Play,
  Pause,
  Wind,
  Target,
  Brain,
  Sparkles,
  Zap,
  Puzzle,
  Gamepad2,
  Grid3X3,
  Search,
  Trophy,
  Clock,
  Star,
  ChevronRight,
  RotateCcw,
  Dumbbell,
  Timer
} from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { GameContainer, GameType } from '../games/GameContainer';

interface MiniGame {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Memory' | 'Puzzle' | 'Strategy' | 'Word' | 'Reflex';
  icon: any;
  gradient: string;
  gameType: GameType;
  features: string[];
}

interface StretchExercise {
  id: string;
  name: string;
  duration: number;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  instructions: string[];
}

export function BreakMode() {
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingTimer, setBreathingTimer] = useState(0);
  const [breathingCycle, setBreathingCycle] = useState(0);
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<StretchExercise | null>(null);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [exerciseActive, setExerciseActive] = useState(false);

  const miniGames: MiniGame[] = [
    {
      id: '1',
      title: 'Tic-Tac-Toe',
      description: 'Classic strategy game with AI opponent or extended 4x4 grid',
      duration: '2-5 min',
      difficulty: 'Easy',
      category: 'Strategy',
      icon: Target,
      gradient: 'from-purple-500 via-purple-600 to-indigo-600',
      gameType: 'tic-tac-toe',
      features: ['AI Opponent', '3x3 & 4x4 Grids', 'Score Tracking']
    },
    {
      id: '2',
      title: 'Memory Cards',
      description: 'Match pairs of cards to test and improve your memory',
      duration: '2-5 min',
      difficulty: 'Medium',
      category: 'Memory',
      icon: Brain,
      gradient: 'from-pink-500 via-rose-600 to-red-600',
      gameType: 'memory-cards',
      features: ['Multiple Themes', 'Timer Challenge', 'Progressive Difficulty']
    },
    {
      id: '3',
      title: 'Sudoku 8x8',
      description: 'Advanced number puzzle with auto-check validation',
      duration: '5-15 min',
      difficulty: 'Hard',
      category: 'Puzzle',
      icon: Grid3X3,
      gradient: 'from-blue-500 via-cyan-600 to-teal-600',
      gameType: 'sudoku',
      features: ['8x8 Grid', 'Auto-Validation', 'Hint System']
    },
    {
      id: '4',
      title: 'Hangman',
      description: 'Word guessing with categories, hints, and difficulty levels',
      duration: '2-4 min',
      difficulty: 'Medium',
      category: 'Word',
      icon: Zap,
      gradient: 'from-green-500 via-emerald-600 to-cyan-600',
      gameType: 'hangman',
      features: ['Multiple Categories', 'Hint System', 'SVG Animations']
    },
    {
      id: '5',
      title: '2048',
      description: 'Slide and merge tiles to reach the elusive 2048 tile',
      duration: '3-10 min',
      difficulty: 'Medium',
      category: 'Puzzle',
      icon: Puzzle,
      gradient: 'from-orange-500 via-amber-600 to-yellow-600',
      gameType: '2048',
      features: ['Smooth Animations', 'Score System', 'Undo Moves']
    },
    {
      id: '6',
      title: 'Brain Teasers',
      description: 'Mind-bending riddles and logic puzzles to challenge yourself',
      duration: '1-3 min',
      difficulty: 'Hard',
      category: 'Puzzle',
      icon: Brain,
      gradient: 'from-indigo-500 via-purple-600 to-pink-600',
      gameType: 'riddles',
      features: ['Logic Puzzles', 'Multiple Choice', 'Progressive Difficulty']
    },
    {
      id: '7',
      title: 'Connect Four',
      description: 'Strategic game - align 4 pieces vertically, horizontally, or diagonally',
      duration: '3-8 min',
      difficulty: 'Medium',
      category: 'Strategy',
      icon: Gamepad2,
      gradient: 'from-red-500 via-pink-600 to-rose-600',
      gameType: 'connect-four',
      features: ['AI Opponent', 'Animated Drops', 'Win Detection']
    },
    {
      id: '8',
      title: 'Word Search',
      description: 'Find hidden words in a grid with highlighting and themes',
      duration: '3-7 min',
      difficulty: 'Easy',
      category: 'Word',
      icon: Search,
      gradient: 'from-teal-500 via-cyan-600 to-blue-600',
      gameType: 'word-search',
      features: ['Themed Words', 'Highlight Selection', 'Timer Mode']
    }
  ];

  const stretchExercises: StretchExercise[] = [
    {
      id: '1',
      name: 'Neck Tension Relief',
      duration: 30,
      description: 'Gentle neck movements to release built-up tension',
      difficulty: 'Easy',
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
      difficulty: 'Easy',
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
      difficulty: 'Medium',
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
      difficulty: 'Easy',
      instructions: [
        'Look far into the distance',
        'Focus on a near object',
        'Blink slowly and deliberately',
        'Roll eyes in gentle circles'
      ]
    },
    {
      id: '5',
      name: 'Wrist & Finger Stretches',
      duration: 25,
      description: 'Prevent repetitive strain from typing',
      difficulty: 'Easy',
      instructions: [
        'Extend arms forward, palms down',
        'Gently pull fingers back with other hand',
        'Hold for 10 seconds each hand',
        'Make fists and rotate wrists'
      ]
    },
    {
      id: '6',
      name: 'Hip Flexor Stretch',
      duration: 40,
      description: 'Counter the effects of prolonged sitting',
      difficulty: 'Medium',
      instructions: [
        'Stand and step one foot forward',
        'Lower into a lunge position',
        'Keep back leg straight',
        'Hold and switch sides'
      ]
    }
  ];

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'border-green-400 text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400';
      case 'Medium': return 'border-yellow-400 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400';
      case 'Hard': return 'border-red-400 text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400';
      default: return 'border-gray-400 text-gray-600 bg-gray-50 dark:bg-gray-950/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Memory': return 'text-pink-600 dark:text-pink-400';
      case 'Puzzle': return 'text-blue-600 dark:text-blue-400';
      case 'Strategy': return 'text-purple-600 dark:text-purple-400';
      case 'Word': return 'text-green-600 dark:text-green-400';
      case 'Reflex': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const playGame = (gameType: GameType) => {
    setSelectedGame(gameType);
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
    <div className="min-h-screen pb-8 px-4 md:px-6 pt-4 md:pt-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
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
            Recharge your mind with fun mini-games and relaxing activities
          </p>
        </motion.div>

        {/* Quick Stats Bar */}
        <motion.div
          className="flex items-center justify-center gap-4 md:gap-8 py-4 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span>8 Games + 6 Exercises</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>15 sec - 15 min</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="w-4 h-4 text-purple-500" />
            <span>All skill levels</span>
          </div>
        </motion.div>

        {/* Games Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {miniGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onHoverStart={() => setHoveredGame(game.id)}
              onHoverEnd={() => setHoveredGame(null)}
              className="relative group"
            >
              <motion.div
                whileHover={{ 
                  scale: 1.02,
                  y: -5
                }}
                whileTap={{ scale: 0.98 }}
                className="h-full"
              >
                <GlassCard className="h-full p-6 relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${game.gradient} text-white shadow-lg`}>
                        <game.icon className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-medium ${getDifficultyColor(game.difficulty)}`}
                        >
                          {game.difficulty}
                        </Badge>
                        <span className={`text-xs font-medium ${getCategoryColor(game.category)}`}>
                          {game.category}
                        </span>
                      </div>
                    </div>

                    {/* Game Info */}
                    <div className="flex-1 space-y-3">
                      <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                        {game.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {game.description}
                      </p>
                      
                      {/* Features */}
                      <div className="space-y-1">
                        {game.features.slice(0, 2).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-1 h-1 rounded-full bg-current" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{game.duration}</span>
                        </div>
                        
                        <Button
                          onClick={() => playGame(game.gameType)}
                          size="sm"
                          className={`bg-gradient-to-r ${game.gradient} text-white border-0 hover:shadow-lg transition-all duration-300`}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Play
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <AnimatePresence>
                    {hoveredGame === game.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            </motion.div>
          ))}
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
                <h3 className="text-2xl font-bold mb-2 text-gradient-primary">{selectedExercise.name}</h3>
                <div className="text-6xl font-bold text-gradient-secondary mb-4">
                  {formatTime(selectedExercise.duration - exerciseTimer)}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(exerciseTimer / selectedExercise.duration) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
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

        {/* Stretch Exercises Section */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gradient-secondary mb-2">
              Stretch & Movement
            </h2>
            <p className="text-muted-foreground">
              Combat study fatigue with targeted exercises
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stretchExercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full"
                >
                  <GlassCard className="h-full p-6 relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300" />
                    
                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                          <Dumbbell className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}
                          >
                            {exercise.difficulty}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Timer className="w-3 h-3" />
                            <span>{exercise.duration}s</span>
                          </div>
                        </div>
                      </div>

                      {/* Exercise Info */}
                      <div className="flex-1 space-y-3">
                        <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                          {exercise.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {exercise.description}
                        </p>
                        
                        {/* Instructions Preview */}
                        <div className="space-y-1">
                          {exercise.instructions.slice(0, 2).map((instruction, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="w-1 h-1 rounded-full bg-current" />
                              <span className="line-clamp-1">{instruction}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pt-4 border-t border-border/50">
                        <Button
                          onClick={() => startExercise(exercise)}
                          size="sm"
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 hover:shadow-lg transition-all duration-300"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Start Exercise
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Breathing Exercise Section */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gradient-secondary mb-2">
              Quick Relaxation
            </h2>
            <p className="text-muted-foreground">
              Take a moment to reset with guided breathing
            </p>
          </div>

          <div className="max-w-md mx-auto px-4 md:px-0">
            <GlassCard className="text-center relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-green-500" />
              </div>
              
              <div className="relative z-10 p-8">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Wind className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-semibold text-gradient-secondary">
                    4-7-8 Breathing
                  </h3>
                </div>
                
                <div className="relative mb-8">
                  <motion.div
                    className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center relative shadow-2xl"
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
                      <div className="text-sm capitalize mb-1">
                        {breathingActive ? breathingPhase : 'Ready'}
                      </div>
                      <div className="text-2xl">
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
                      <span>Cycles completed</span>
                      <span>{breathingCycle}</span>
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}
