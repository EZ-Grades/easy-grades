import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LuxuryButton } from '../LuxuryButton';
import { GlassCard } from '../GlassCard';
import { CheckCircle, RotateCcw, Trophy, Timer, Star, Brain, Zap, Target } from 'lucide-react';

interface MemoryCardsGameProps {
  onComplete: () => void;
}

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

type Difficulty = 'easy' | 'medium' | 'hard';

const cardEmojis = [
  '🎯', '🎨', '🎭', '🎪', '🎨', '🎺', '🎸', '🎹',
  '🎮', '🎲', '🎳', '🎯', '⚡', '🔥', '💎', '⭐',
  '🚀', '🌟', '🎊', '🎉', '🏆', '🎖️', '🥇', '👑',
  '🦄', '🐉', '🦋', '🌈', '🔮', '✨', '💫', '🌠'
];

const difficultySettings = {
  easy: { pairs: 6, gridCols: 4, timeLimit: 120 },
  medium: { pairs: 8, gridCols: 4, timeLimit: 100 },
  hard: { pairs: 12, gridCols: 6, timeLimit: 80 }
};

export function MemoryCardsGame({ onComplete }: MemoryCardsGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const currentSettings = difficultySettings[difficulty];

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && timeLeft > 0 && gameStatus === 'playing') {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameStatus('lost');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, timeLeft, gameStatus]);

  // Check win condition
  useEffect(() => {
    if (matchedPairs === currentSettings.pairs && gameStatus === 'playing') {
      setGameStatus('won');
      const finalTime = currentSettings.timeLimit - timeLeft;
      if (!bestTime || finalTime < bestTime) {
        setBestTime(finalTime);
      }
      
      // Calculate score
      const timeBonus = Math.max(0, timeLeft * 10);
      const moveBonus = Math.max(0, (currentSettings.pairs * 2 - moves) * 50);
      const difficultyMultiplier = difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1;
      const finalScore = (timeBonus + moveBonus + 1000) * difficultyMultiplier;
      
      setScore(prev => prev + finalScore);
      setStreak(prev => prev + 1);
      
      setTimeout(onComplete, 2000);
    }
  }, [matchedPairs, currentSettings.pairs, gameStatus, timeLeft, moves, difficulty, bestTime]);

  const initializeGame = () => {
    const selectedEmojis = cardEmojis.slice(0, currentSettings.pairs);
    const pairedEmojis = [...selectedEmojis, ...selectedEmojis];
    
    // Shuffle the cards
    const shuffledCards = pairedEmojis
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimeLeft(currentSettings.timeLimit);
    setGameStarted(false);
    setGameStatus('playing');
  };

  const startGame = () => {
    setGameStarted(true);
  };

  const showCardsPreview = () => {
    setShowPreview(true);
    // Temporarily show all cards
    setCards(prev => prev.map(card => ({ ...card, isFlipped: true })));
    
    setTimeout(() => {
      setCards(prev => prev.map(card => ({ ...card, isFlipped: false })));
      setShowPreview(false);
      startGame();
    }, 3000);
  };

  const flipCard = (cardId: number) => {
    try {
      if (!gameStarted || gameStatus !== 'playing') return;
      if (flippedCards.length >= 2) return;
      if (flippedCards.includes(cardId)) return;
      if (!cards[cardId] || cards[cardId].isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstCard, secondCard] = newFlippedCards.map(id => cards[id]);
      
      if (firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            newFlippedCards.includes(card.id) 
              ? { ...card, isMatched: true, isFlipped: true }
              : card
          ));
          setMatchedPairs(prev => prev + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            newFlippedCards.includes(card.id) 
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
    } catch (error) {
      console.error('Error in flipCard:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const percentage = (timeLeft / currentSettings.timeLimit) * 100;
    if (percentage > 50) return 'text-green-500';
    if (percentage > 25) return 'text-yellow-500';
    return 'text-red-500';
  };

  const resetGame = () => {
    setStreak(0);
    setScore(0);
    initializeGame();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-8 h-8 text-primary-solid" />
          <h2 className="text-3xl font-bold text-gradient-primary">Memory Cards</h2>
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
          {bestTime && (
            <div className="text-center">
              <div className="text-2xl font-bold text-highlight-solid">{formatTime(bestTime)}</div>
              <div className="text-sm text-muted-foreground">Best Time</div>
            </div>
          )}
        </div>
      </div>

      {/* Game Controls */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-2">
            <LuxuryButton
              variant={difficulty === 'easy' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setDifficulty('easy')}
              disabled={gameStarted}
            >
              Easy (6 pairs)
            </LuxuryButton>
            <LuxuryButton
              variant={difficulty === 'medium' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setDifficulty('medium')}
              disabled={gameStarted}
            >
              Medium (8 pairs)
            </LuxuryButton>
            <LuxuryButton
              variant={difficulty === 'hard' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setDifficulty('hard')}
              disabled={gameStarted}
            >
              Hard (12 pairs)
            </LuxuryButton>
          </div>
          
          <div className="flex gap-2">
            {!gameStarted && !showPreview && (
              <LuxuryButton
                variant="secondary"
                onClick={showCardsPreview}
                icon={<Target className="w-4 h-4" />}
              >
                Start Game
              </LuxuryButton>
            )}
            
            <LuxuryButton
              variant="outline"
              onClick={resetGame}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Reset
            </LuxuryButton>
          </div>
        </div>
      </GlassCard>

      {/* Game Stats */}
      {gameStarted && (
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getTimeColor()}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-muted-foreground">Time Left</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{moves}</div>
            <div className="text-sm text-muted-foreground">Moves</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {matchedPairs}/{currentSettings.pairs}
            </div>
            <div className="text-sm text-muted-foreground">Pairs Found</div>
          </div>
        </div>
      )}

      {/* Game Board */}
      <GlassCard className="p-6">
        {showPreview && (
          <div className="text-center mb-4">
            <p className="text-lg font-semibold text-primary-solid">
              Memorize the cards! Game starts in 3 seconds...
            </p>
          </div>
        )}
        
        <div 
          className={`grid gap-3 max-w-2xl mx-auto`}
          style={{ 
            gridTemplateColumns: `repeat(${currentSettings.gridCols}, minmax(0, 1fr))` 
          }}
        >
          {cards.map((card) => (
            <motion.button
              key={card.id}
              onClick={() => flipCard(card.id)}
              disabled={card.isMatched || flippedCards.includes(card.id) || !gameStarted || gameStatus !== 'playing'}
              className={`
                aspect-square rounded-xl border-2 transition-all duration-300
                flex items-center justify-center text-3xl font-bold
                ${card.isFlipped || card.isMatched
                  ? card.isMatched 
                    ? 'bg-green-500/20 border-green-500 glow-secondary' 
                    : 'bg-primary-solid/20 border-primary-solid'
                  : 'glass-card border-border hover:glow-primary cursor-pointer'
                }
                ${!gameStarted || gameStatus !== 'playing' ? 'cursor-not-allowed opacity-60' : ''}
              `}
              whileHover={
                !card.isMatched && !flippedCards.includes(card.id) && gameStarted && gameStatus === 'playing' 
                  ? { scale: 1.05 } 
                  : {}
              }
              whileTap={
                !card.isMatched && !flippedCards.includes(card.id) && gameStarted && gameStatus === 'playing'
                  ? { scale: 0.95 } 
                  : {}
              }
              initial={{ rotateY: 0 }}
              animate={{ 
                rotateY: card.isFlipped || card.isMatched ? 180 : 0 
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ 
                  rotateY: card.isFlipped || card.isMatched ? 180 : 0 
                }}
                transition={{ duration: 0.3 }}
                style={{ backfaceVisibility: 'hidden' }}
              >
                {card.isFlipped || card.isMatched ? card.emoji : '❓'}
              </motion.div>
            </motion.button>
          ))}
        </div>
      </GlassCard>

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
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-green-500 mb-2">Perfect Memory!</h3>
              <p className="text-muted-foreground mb-4">
                You matched all {currentSettings.pairs} pairs!
              </p>
              <div className="space-y-2 text-sm mb-6">
                <div>Time: {formatTime(currentSettings.timeLimit - timeLeft)}</div>
                <div>Moves: {moves}</div>
                <div>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</div>
              </div>
              <div className="flex gap-3">
                <LuxuryButton
                  variant="primary"
                  onClick={initializeGame}
                  icon={<RotateCcw className="w-4 h-4" />}
                  className="flex-1"
                >
                  Play Again
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
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Timer className="w-16 h-16 text-red-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-red-500 mb-2">Time's Up!</h3>
              <p className="text-muted-foreground mb-4">
                You found {matchedPairs} out of {currentSettings.pairs} pairs
              </p>
              <div className="flex gap-3">
                <LuxuryButton
                  variant="primary"
                  onClick={initializeGame}
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