import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LuxuryButton } from '../LuxuryButton';
import { GlassCard } from '../GlassCard';
import { CheckCircle, RotateCcw, AlertTriangle, Trophy, Zap, Target, BookOpen, Gamepad2, Brain, Star } from 'lucide-react';

interface HangmanGameProps {
  onComplete: () => void;
}

interface WordCategory {
  name: string;
  icon: any;
  words: { word: string; hint: string; difficulty: 'easy' | 'medium' | 'hard' }[];
}

const wordCategories: WordCategory[] = [
  {
    name: 'Technology',
    icon: Zap,
    words: [
      { word: 'JAVASCRIPT', hint: 'Popular web programming language', difficulty: 'medium' },
      { word: 'PYTHON', hint: 'Programming language named after a snake', difficulty: 'easy' },
      { word: 'COMPUTER', hint: 'Electronic device for processing data', difficulty: 'easy' },
      { word: 'ALGORITHM', hint: 'Step-by-step problem-solving procedure', difficulty: 'hard' },
      { word: 'DATABASE', hint: 'Organized collection of data', difficulty: 'medium' },
      { word: 'ENCRYPTION', hint: 'Process of encoding information', difficulty: 'hard' },
      { word: 'BANDWIDTH', hint: 'Data transfer capacity', difficulty: 'medium' },
      { word: 'FIREWALL', hint: 'Network security system', difficulty: 'medium' }
    ]
  },
  {
    name: 'Science',
    icon: Target,
    words: [
      { word: 'GRAVITY', hint: 'Force that attracts objects', difficulty: 'easy' },
      { word: 'PHOTOSYNTHESIS', hint: 'How plants make food', difficulty: 'hard' },
      { word: 'MOLECULE', hint: 'Smallest unit of a compound', difficulty: 'medium' },
      { word: 'QUANTUM', hint: 'Related to subatomic particles', difficulty: 'hard' },
      { word: 'ECOSYSTEM', hint: 'Community of living organisms', difficulty: 'medium' },
      { word: 'CHROMOSOME', hint: 'DNA-containing structure', difficulty: 'hard' },
      { word: 'CATALYST', hint: 'Substance that speeds reactions', difficulty: 'medium' }
    ]
  },
  {
    name: 'Geography',
    icon: BookOpen,
    words: [
      { word: 'MOUNTAIN', hint: 'Large natural elevation', difficulty: 'easy' },
      { word: 'ARCHIPELAGO', hint: 'Group of islands', difficulty: 'hard' },
      { word: 'PENINSULA', hint: 'Land surrounded by water on three sides', difficulty: 'medium' },
      { word: 'EQUATOR', hint: 'Imaginary line around Earth', difficulty: 'easy' },
      { word: 'LONGITUDE', hint: 'Vertical lines on maps', difficulty: 'medium' },
      { word: 'TUNDRA', hint: 'Cold, treeless biome', difficulty: 'medium' },
      { word: 'CONTINENTAL', hint: 'Related to large landmasses', difficulty: 'medium' }
    ]
  }
];

// Enhanced SVG Hangman Components
const HangmanSVG = ({ stage }: { stage: number }) => {
  return (
    <div className="relative w-48 h-56 mx-auto">
      <svg viewBox="0 0 200 240" className="w-full h-full">
        {/* Base */}
        <motion.rect
          x="10" y="220" width="180" height="15" 
          fill="currentColor" 
          className="text-muted-foreground"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: stage >= 1 ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
        
        {/* Pole */}
        <motion.rect
          x="40" y="30" width="8" height="190" 
          fill="currentColor" 
          className="text-muted-foreground"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: stage >= 2 ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
        
        {/* Top beam */}
        <motion.rect
          x="48" y="30" width="100" height="8" 
          fill="currentColor" 
          className="text-muted-foreground"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: stage >= 3 ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        />
        
        {/* Noose */}
        <motion.rect
          x="145" y="38" width="3" height="25" 
          fill="currentColor" 
          className="text-muted-foreground"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: stage >= 4 ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        />
        
        {/* Head */}
        <motion.circle
          cx="146" cy="78" r="15" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3"
          className="text-red-500"
          initial={{ scale: 0 }}
          animate={{ scale: stage >= 5 ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.9 }}
        />
        
        {/* Body */}
        <motion.line
          x1="146" y1="93" x2="146" y2="160" 
          stroke="currentColor" 
          strokeWidth="3"
          className="text-red-500"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: stage >= 6 ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 1.1 }}
        />
        
        {/* Left arm */}
        <motion.line
          x1="146" y1="115" x2="120" y2="140" 
          stroke="currentColor" 
          strokeWidth="3"
          className="text-red-500"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: stage >= 7 ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 1.3 }}
        />
        
        {/* Right arm */}
        <motion.line
          x1="146" y1="115" x2="172" y2="140" 
          stroke="currentColor" 
          strokeWidth="3"
          className="text-red-500"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: stage >= 8 ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 1.5 }}
        />
        
        {/* Left leg */}
        <motion.line
          x1="146" y1="160" x2="125" y2="190" 
          stroke="currentColor" 
          strokeWidth="3"
          className="text-red-500"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: stage >= 9 ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 1.7 }}
        />
        
        {/* Right leg */}
        <motion.line
          x1="146" y1="160" x2="167" y2="190" 
          stroke="currentColor" 
          strokeWidth="3"
          className="text-red-500"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: stage >= 10 ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 1.9 }}
        />
        
        {/* Face details for game over */}
        {stage >= 10 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 2.1 }}
          >
            {/* X eyes */}
            <line x1="140" y1="73" x2="144" y2="77" stroke="currentColor" strokeWidth="2" className="text-red-600" />
            <line x1="144" y1="73" x2="140" y2="77" stroke="currentColor" strokeWidth="2" className="text-red-600" />
            <line x1="148" y1="73" x2="152" y2="77" stroke="currentColor" strokeWidth="2" className="text-red-600" />
            <line x1="152" y1="73" x2="148" y2="77" stroke="currentColor" strokeWidth="2" className="text-red-600" />
            
            {/* Frown */}
            <path d="M 140 82 Q 146 86 152 82" stroke="currentColor" strokeWidth="2" fill="none" className="text-red-600" />
          </motion.g>
        )}
      </svg>
    </div>
  );
};

export function HangmanGame({ onComplete }: HangmanGameProps) {
  const [currentWord, setCurrentWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [hint, setHint] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WordCategory>(wordCategories[0]);
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [currentWordData, setCurrentWordData] = useState<{ word: string; hint: string; difficulty: 'easy' | 'medium' | 'hard' } | null>(null);

  const maxWrongGuesses = 10;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    startNewGame();
  }, [selectedCategory, difficulty]);

  const getFilteredWords = () => {
    let words = selectedCategory.words;
    if (difficulty !== 'all') {
      words = words.filter(w => w.difficulty === difficulty);
    }
    return words;
  };

  const startNewGame = () => {
    const availableWords = getFilteredWords();
    if (availableWords.length === 0) return;
    
    const randomWordData = availableWords[Math.floor(Math.random() * availableWords.length)];
    setCurrentWord(randomWordData.word);
    setCurrentWordData(randomWordData);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGameStatus('playing');
    setHint(randomWordData.hint);
    setGamesPlayed(prev => prev + 1);
  };

  const guessLetter = (letter: string) => {
    if (guessedLetters.has(letter) || gameStatus !== 'playing') return;

    const newGuessedLetters = new Set(guessedLetters).add(letter);
    setGuessedLetters(newGuessedLetters);

    if (!currentWord.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      
      if (newWrongGuesses >= maxWrongGuesses) {
        setGameStatus('lost');
        setStreak(0);
        setTimeout(() => {
          if (gamesPlayed >= 3) {
            onComplete();
          }
        }, 2500);
      }
    } else {
      // Check if word is complete
      const isComplete = currentWord.split('').every(char => newGuessedLetters.has(char));
      if (isComplete) {
        setGameStatus('won');
        
        // Calculate score based on difficulty and remaining guesses
        const difficultyMultiplier = currentWordData?.difficulty === 'hard' ? 3 : currentWordData?.difficulty === 'medium' ? 2 : 1;
        const guessBonus = Math.max(0, (maxWrongGuesses - wrongGuesses) * 10);
        const wordScore = (currentWord.length * 5 + guessBonus) * difficultyMultiplier;
        
        setScore(prev => prev + wordScore);
        setStreak(prev => {
          const newStreak = prev + 1;
          setBestStreak(current => Math.max(current, newStreak));
          return newStreak;
        });
        
        setTimeout(() => {
          if (gamesPlayed >= 3) {
            onComplete();
          }
        }, 2500);
      }
    }
  };

  const getDisplayWord = () => {
    return currentWord
      .split('')
      .map(letter => guessedLetters.has(letter) ? letter : '_')
      .join(' ');
  };

  const getLetterStatus = (letter: string) => {
    if (!guessedLetters.has(letter)) return 'available';
    return currentWord.includes(letter) ? 'correct' : 'wrong';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header with Stats */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gamepad2 className="w-8 h-8 text-primary-solid" />
          <h2 className="text-3xl font-bold text-gradient-primary">Advanced Hangman</h2>
        </div>
        
        <div className="flex justify-center gap-6 flex-wrap">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-solid">{score}</div>
            <div className="text-sm text-muted-foreground">Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-solid">{streak}</div>
            <div className="text-sm text-muted-foreground">Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-highlight-solid">{bestStreak}</div>
            <div className="text-sm text-muted-foreground">Best</div>
          </div>
        </div>
      </div>

      {/* Category and Difficulty Selection */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <div className="flex gap-2 flex-wrap">
              {wordCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <LuxuryButton
                    key={category.name}
                    variant={selectedCategory.name === category.name ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    icon={<IconComponent className="w-4 h-4" />}
                  >
                    {category.name}
                  </LuxuryButton>
                );
              })}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Difficulty</label>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                <LuxuryButton
                  key={diff}
                  variant={difficulty === diff ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setDifficulty(diff)}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </LuxuryButton>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hangman Drawing */}
        <GlassCard className="p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold mb-2">The Gallows</h3>
            <div className="text-sm text-muted-foreground mb-4">
              Wrong guesses: {wrongGuesses}/{maxWrongGuesses}
            </div>
          </div>
          
          <div className="bg-gradient-to-b from-muted/20 to-muted/40 rounded-xl p-6">
            <HangmanSVG stage={wrongGuesses} />
          </div>
          
          {/* Lives remaining */}
          <div className="flex justify-center gap-1 mt-4">
            {Array.from({ length: maxWrongGuesses }, (_, i) => (
              <motion.div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < wrongGuesses ? 'bg-red-500' : 'bg-green-500'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
              />
            ))}
          </div>
        </GlassCard>

        {/* Game Area */}
        <div className="space-y-6">
          {/* Word and Hint */}
          <GlassCard className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                {currentWordData && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    currentWordData.difficulty === 'hard' ? 'bg-red-500/20 text-red-500' :
                    currentWordData.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-green-500/20 text-green-500'
                  }`}>
                    {currentWordData.difficulty.toUpperCase()}
                  </span>
                )}
              </div>
              
              <div className="text-4xl font-mono font-bold tracking-wider mb-4 min-h-[3rem] flex items-center justify-center">
                {getDisplayWord()}
              </div>
              
              <div className="glass-card p-4">
                <div className="flex items-start gap-2">
                  <Brain className="w-5 h-5 text-primary-solid flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">Hint:</p>
                    <p className="text-sm text-muted-foreground">{hint}</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Alphabet */}
          <GlassCard className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-center">Choose a Letter</h3>
            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-9 gap-2">
              {alphabet.map(letter => {
                const status = getLetterStatus(letter);
                return (
                  <motion.button
                    key={letter}
                    onClick={() => guessLetter(letter)}
                    disabled={guessedLetters.has(letter) || gameStatus !== 'playing'}
                    className={`
                      aspect-square flex items-center justify-center font-medium rounded-lg
                      transition-all duration-200 border-2
                      ${status === 'available' 
                        ? 'glass-card border-border hover:glow-primary hover:scale-105' 
                        : status === 'correct'
                        ? 'bg-green-500/20 border-green-500 text-green-500'
                        : 'bg-red-500/20 border-red-500 text-red-500 opacity-50'
                      }
                      ${gameStatus !== 'playing' ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    whileHover={status === 'available' && gameStatus === 'playing' ? { scale: 1.05 } : {}}
                    whileTap={status === 'available' && gameStatus === 'playing' ? { scale: 0.95 } : {}}
                  >
                    {letter}
                  </motion.button>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Game Status Overlay */}
      <AnimatePresence>
        {gameStatus === 'won' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <GlassCard className="p-8 text-center max-w-md mx-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-green-500 mb-2">Fantastic!</h3>
              <p className="text-muted-foreground mb-4">
                You guessed: <span className="font-bold text-green-500">{currentWord}</span>
              </p>
              {currentWordData && (
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground mb-2">Score Breakdown:</div>
                  <div className="space-y-1 text-sm">
                    <div>Word Length: {currentWord.length} × 5 = {currentWord.length * 5}</div>
                    <div>Lives Bonus: {Math.max(0, (maxWrongGuesses - wrongGuesses) * 10)}</div>
                    <div>Difficulty: {currentWordData.difficulty} (×{currentWordData.difficulty === 'hard' ? 3 : currentWordData.difficulty === 'medium' ? 2 : 1})</div>
                  </div>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <LuxuryButton
                  variant="primary"
                  onClick={startNewGame}
                  icon={<RotateCcw className="w-4 h-4" />}
                  className="flex-1"
                >
                  Next Word
                </LuxuryButton>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {gameStatus === 'lost' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <GlassCard className="p-8 text-center max-w-md mx-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2 }}
              >
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-red-500 mb-2">Game Over!</h3>
              <p className="text-muted-foreground mb-4">
                The word was: <span className="font-bold text-red-500">{currentWord}</span>
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Hint: {hint}
              </p>
              <div className="flex gap-3">
                <LuxuryButton
                  variant="primary"
                  onClick={startNewGame}
                  icon={<RotateCcw className="w-4 h-4" />}
                  className="flex-1"
                >
                  Try Again
                </LuxuryButton>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}