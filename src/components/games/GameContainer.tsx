import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { GlassCard } from '../GlassCard';

// Import individual games
import { TicTacToe } from './TicTacToe';
import { SudokuGame } from './SudokuGame';
import { DrawGuessGame } from './DrawGuessGame';
import { HangmanGame } from './HangmanGame';
import { RiddlesGame } from './RiddlesGame';
import { MemoryCardGame } from './MemoryGame';

export type GameType = 'Tic Tac Toe' | 'sudoku' | 'draw-guess' | 'hangman' | 'riddles' | 'Memory Test';

interface GameContainerProps {
  gameType: GameType;
  onClose: () => void;
}

const gameInfo = {
  chess: { title: 'Chess Puzzle', emoji: '♟️' },
  sudoku: { title: 'Sudoku', emoji: '🔢' },
  'draw-guess': { title: 'Draw & Guess', emoji: '🎨' },
  hangman: { title: 'Hangman', emoji: '🔤' },
  riddles: { title: 'Brain Riddles', emoji: '🧩' },
  'song-guess': { title: 'Song Guessing', emoji: '🎵' }
};

export function GameContainer({ gameType, onClose }: GameContainerProps) {
  const [gameState, setGameState] = useState<'playing' | 'completed' | 'paused'>('playing');
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [gameKey, setGameKey] = useState(0); // force remount on restart
  const [currentScore, setCurrentScore] = useState<number | null>(null); // optional dynamic score
  const info = gameInfo[gameType];

  const handleExit = () => {
    if (gameState === 'playing') setShowConfirmExit(true);
    else onClose();
  };

  const confirmExit = () => {
    setShowConfirmExit(false);
    onClose();
  };

  const restartGame = () => {
    setGameKey(prev => prev + 1);
    setGameState('playing');
    setCurrentScore(null);
  };

  const renderGame = () => {
    switch (gameType) {
      case 'chess':
        return <TicTacToe key={gameKey} onComplete={() => setGameState('completed')} />;
      case 'sudoku':
        return <SudokuGame key={gameKey} onComplete={() => setGameState('completed')} />;
      case 'draw-guess':
        return <DrawGuessGame key={gameKey} onComplete={() => setGameState('completed')} />;
      case 'hangman':
        return <HangmanGame key={gameKey} onComplete={() => setGameState('completed')} />;
      case 'riddles':
        return <RiddlesGame key={gameKey} onComplete={() => setGameState('completed')} />;
      case 'song-guess':
        return <MemoryCardGame key={gameKey} onComplete={() => setGameState('completed')} />;
      default:
        return <div>Game not found</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 overflow-auto">
      
      {/* Header Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{info.emoji}</div>
          <h1 className="text-xl font-semibold text-gradient-primary">{info.title}</h1>
          {currentScore !== null && <span className="ml-2 text-sm text-muted-foreground">Score: {currentScore}</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExit}>
            <X className="w-4 h-4" /> Exit Game
          </Button>
        </div>
      </div>

      {/* Game Content */}
      <div className="w-full max-w-4xl mx-auto mt-20 px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={gameKey} // forces remount when key changes
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {renderGame()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showConfirmExit && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowConfirmExit(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative"
            >
              <GlassCard className="p-6 max-w-sm mx-4">
                <h3 className="text-lg font-semibold mb-3">Exit Game?</h3>
                <p className="text-muted-foreground mb-6">
                  Are you sure you want to exit? Your progress will be lost.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowConfirmExit(false)} className="flex-1">
                    Continue Playing
                  </Button>
                  <Button variant="default" onClick={confirmExit} className="flex-1">
                    Exit Game
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Game Completion Modal */}
      <AnimatePresence>
        {gameState === 'completed' && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative"
            >
              <GlassCard className="p-8 max-w-md mx-4 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-semibold mb-3 text-gradient-primary">Great Job!</h3>
                <p className="text-muted-foreground mb-6">
                  You've completed the {info.title.toLowerCase()}! Ready for another round or back to your break?
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Button variant="outline" onClick={restartGame} className="flex-1">
                    <RotateCcw className="w-4 h-4" /> Play Again
                  </Button>
                  <Button variant="default" onClick={onClose} className="flex-1">
                    <Home className="w-4 h-4" /> Back to Break
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
