import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { GlassCard } from '../GlassCard';
import { ErrorBoundary } from '../ErrorBoundary';

// Import individual games
import { TicTacToeGame } from './TicTacToeGame';
import { SlidingPuzzleGame } from './SlidingPuzzleGame';
import { DrawGuessGame } from './DrawGuessGame';
import { HangmanGame } from './HangmanGame';
import { RiddlesGame } from './RiddlesGame';
import { MemoryCardsGame } from './MemoryCardsGame';
import { SudokuGame } from './SudokuGame';
import { Game2048 } from './Game2048';
import { ConnectFourGame } from './ConnectFourGame';
import { WordSearchGame } from './WordSearchGame';

export type GameType = 'tic-tac-toe' | 'sliding-puzzle' | 'draw-guess' | 'hangman' | 'riddles' | 'memory-cards' | 'sudoku' | '2048' | 'connect-four' | 'word-search';

interface GameContainerProps {
  gameType: GameType;
  onClose: () => void;
}

const gameInfo = {
  'tic-tac-toe': { title: 'Tic-Tac-Toe', emoji: '⭕' },
  'sliding-puzzle': { title: 'Sliding Puzzle', emoji: '🧩' },
  'draw-guess': { title: 'Draw & Guess', emoji: '🎨' },
  hangman: { title: 'Advanced Hangman', emoji: '🔤' },
  riddles: { title: 'Brain Riddles', emoji: '🧠' },
  'memory-cards': { title: 'Memory Cards', emoji: '🃏' },
  sudoku: { title: 'Sudoku 8x8', emoji: '🔢' },
  '2048': { title: '2048', emoji: '🎯' },
  'connect-four': { title: 'Connect Four', emoji: '🔴' },
  'word-search': { title: 'Word Search', emoji: '🔍' }
};

export function GameContainer({ gameType, onClose }: GameContainerProps) {
  const [gameState, setGameState] = useState<'playing' | 'completed' | 'paused'>('playing');
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  
  const info = gameInfo[gameType];

  const handleExit = () => {
    if (gameState === 'playing') {
      setShowConfirmExit(true);
    } else {
      onClose();
    }
  };

  const confirmExit = () => {
    setShowConfirmExit(false);
    onClose();
  };

  const renderGame = () => {
    switch (gameType) {
      case 'tic-tac-toe':
        return <TicTacToeGame onComplete={() => setGameState('completed')} />;
      case 'sliding-puzzle':
        return <SlidingPuzzleGame onComplete={() => setGameState('completed')} />;
      case 'draw-guess':
        return <DrawGuessGame onComplete={() => setGameState('completed')} />;
      case 'hangman':
        return <HangmanGame onComplete={() => setGameState('completed')} />;
      case 'riddles':
        return <RiddlesGame onComplete={() => setGameState('completed')} />;
      case 'memory-cards':
        return <MemoryCardsGame onComplete={() => setGameState('completed')} />;
      case 'sudoku':
        return <SudokuGame onComplete={() => setGameState('completed')} />;
      case '2048':
        return <Game2048 onComplete={() => setGameState('completed')} />;
      case 'connect-four':
        return <ConnectFourGame onComplete={() => setGameState('completed')} />;
      case 'word-search':
        return <WordSearchGame onComplete={() => setGameState('completed')} />;
      default:
        return <div>Game not found</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient flex items-center justify-center p-4">
      {/* Header Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{info.emoji}</div>
          <h1 className="text-xl font-semibold text-gradient-primary">{info.title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExit}
          >
            <X className="w-4 h-4" />
            Exit Game
          </Button>
        </div>
      </div>

      {/* Game Content */}
      <div className="w-full max-w-4xl mx-auto mt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={gameType}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <ErrorBoundary
              onError={(error) => {
                console.error(`Error in ${gameType} game:`, error);
              }}
              fallback={
                <GlassCard className="p-8 text-center max-w-md mx-auto">
                  <h3 className="text-xl font-bold mb-4 text-gradient-primary">
                    Game Error
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    This game encountered an error. Please try another game or refresh the page.
                  </p>
                  <Button onClick={onClose} className="w-full">
                    Back to Break Mode
                  </Button>
                </GlassCard>
              }
            >
              {renderGame()}
            </ErrorBoundary>
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
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmExit(false)}
                    className="flex-1"
                  >
                    Continue Playing
                  </Button>
                  <Button
                    variant="default"
                    onClick={confirmExit}
                    className="flex-1"
                  >
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
                <h3 className="text-2xl font-semibold mb-3 text-gradient-primary">
                  Great Job!
                </h3>
                <p className="text-muted-foreground mb-6">
                  You've completed the {info.title.toLowerCase()}! Ready for another round or back to your break?
                </p>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGameState('playing');
                      // Reset game state would go here
                    }}
                    className="flex-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Play Again
                  </Button>
                  <Button
                    variant="default"
                    onClick={onClose}
                    className="flex-1"
                  >
                    <Home className="w-4 h-4" />
                    Back to Break
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