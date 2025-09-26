import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LuxuryButton } from '../LuxuryButton';
import { GlassCard } from '../GlassCard';
import { CheckCircle, RotateCcw, Shuffle, Target, Timer } from 'lucide-react';

interface SlidingPuzzleGameProps {
  onComplete: () => void;
}

type Tile = number | null;
type Board = Tile[];

const SOLVED_BOARD: Board = [1, 2, 3, 4, 5, 6, 7, 8, null];

export function SlidingPuzzleGame({ onComplete }: SlidingPuzzleGameProps) {
  const [board, setBoard] = useState<Board>(SOLVED_BOARD);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime && !isComplete) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isComplete]);

  // Check if puzzle is solved
  useEffect(() => {
    const checkSolved = () => {
      for (let i = 0; i < SOLVED_BOARD.length; i++) {
        if (board[i] !== SOLVED_BOARD[i]) {
          return false;
        }
      }
      return true;
    };

    if (moves > 0 && checkSolved()) {
      setIsComplete(true);
      setTimeout(onComplete, 1500);
    }
  }, [board, moves]);

  const getEmptyIndex = (currentBoard: Board = board): number => {
    return currentBoard.findIndex(tile => tile === null);
  };

  const getAdjacentIndices = (index: number): number[] => {
    const adjacent: number[] = [];
    const row = Math.floor(index / 3);
    const col = index % 3;

    // Up
    if (row > 0) adjacent.push(index - 3);
    // Down
    if (row < 2) adjacent.push(index + 3);
    // Left
    if (col > 0) adjacent.push(index - 1);
    // Right
    if (col < 2) adjacent.push(index + 1);

    return adjacent;
  };

  const canMoveTile = (tileIndex: number): boolean => {
    const emptyIndex = getEmptyIndex();
    return getAdjacentIndices(emptyIndex).includes(tileIndex);
  };

  const moveTile = (tileIndex: number) => {
    if (!canMoveTile(tileIndex) || isComplete || isShuffling) return;

    const emptyIndex = getEmptyIndex();
    const newBoard = [...board];
    
    // Swap tile with empty space
    [newBoard[tileIndex], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[tileIndex]];
    
    setBoard(newBoard);
    setMoves(prev => prev + 1);
    
    // Start timer on first move
    if (moves === 0) {
      setStartTime(new Date());
    }
  };

  const shuffleBoard = async () => {
    setIsShuffling(true);
    setMoves(0);
    setElapsedTime(0);
    setStartTime(null);
    setIsComplete(false);

    let currentBoard = [...SOLVED_BOARD];
    
    // Perform valid moves to shuffle
    for (let i = 0; i < 100; i++) {
      const emptyIndex = getEmptyIndex(currentBoard);
      const adjacentIndices = getAdjacentIndices(emptyIndex);
      const randomIndex = adjacentIndices[Math.floor(Math.random() * adjacentIndices.length)];
      
      // Swap
      [currentBoard[emptyIndex], currentBoard[randomIndex]] = [currentBoard[randomIndex], currentBoard[emptyIndex]];
      
      // Visual feedback during shuffle
      if (i % 10 === 0) {
        setBoard([...currentBoard]);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    setBoard(currentBoard);
    setIsShuffling(false);
  };

  const resetPuzzle = () => {
    setBoard(SOLVED_BOARD);
    setMoves(0);
    setElapsedTime(0);
    setStartTime(null);
    setIsComplete(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTilePosition = (index: number) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    return { row, col };
  };

  return (
    <GlassCard className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
          <Target className="w-6 h-6 text-blue-500" />
          8-Puzzle Challenge
        </h2>
        <p className="text-muted-foreground">Slide tiles to arrange them in order!</p>
      </div>

      {/* Game Stats */}
      <div className="flex justify-center gap-8 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-solid">{moves}</div>
          <div className="text-sm text-muted-foreground">Moves</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-secondary-solid">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-sm text-muted-foreground">Time</div>
        </div>
      </div>

      {/* Puzzle Board */}
      <div className="grid grid-cols-3 gap-2 mb-6 max-w-xs mx-auto">
        {board.map((tile, index) => {
          const isEmpty = tile === null;
          const isMovable = !isEmpty && canMoveTile(index);
          const position = getTilePosition(index);
          
          return (
            <motion.button
              key={`${index}-${tile}`}
              onClick={() => moveTile(index)}
              disabled={isEmpty || !isMovable || isComplete || isShuffling}
              className={`
                aspect-square flex items-center justify-center text-2xl font-bold
                border-2 rounded-lg transition-all duration-300
                ${isEmpty 
                  ? 'bg-transparent border-dashed border-muted-foreground/30' 
                  : isMovable 
                    ? 'glass-card border-primary-solid hover:glow-primary cursor-pointer hover:scale-105' 
                    : 'glass-card border-border cursor-not-allowed opacity-60'
                }
                ${isComplete && !isEmpty ? 'bg-green-500/20 border-green-500 text-green-500' : ''}
              `}
              whileHover={isMovable && !isComplete ? { scale: 1.05 } : {}}
              whileTap={isMovable && !isComplete ? { scale: 0.95 } : {}}
              layout
              layoutId={`tile-${tile}`}
            >
              {!isEmpty && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={isComplete ? 'text-green-500' : 'text-foreground'}
                >
                  {tile}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Completion Message */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-green-500">Puzzle Solved!</h3>
          <p className="text-muted-foreground">
            Completed in {moves} moves and {formatTime(elapsedTime)}
          </p>
          <div className="mt-2">
            {moves <= 20 && (
              <span className="inline-block bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-sm font-medium">
                🏆 Excellent! Under 20 moves!
              </span>
            )}
            {moves > 20 && moves <= 40 && (
              <span className="inline-block bg-blue-500/20 text-blue-500 px-2 py-1 rounded text-sm font-medium">
                👍 Good job!
              </span>
            )}
            {moves > 40 && (
              <span className="inline-block bg-green-500/20 text-green-500 px-2 py-1 rounded text-sm font-medium">
                ✨ Practice makes perfect!
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Hint */}
      {moves === 0 && !isShuffling && board.every((tile, index) => tile === SOLVED_BOARD[index]) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card p-4 mb-6"
        >
          <div className="flex items-start gap-2">
            <Timer className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">How to Play:</h4>
              <p className="text-sm text-muted-foreground">
                Click tiles adjacent to the empty space to move them. Arrange the numbers 1-8 in order with the empty space in the bottom right.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        <LuxuryButton
          variant="primary"
          onClick={shuffleBoard}
          icon={<Shuffle className="w-4 h-4" />}
          disabled={isShuffling}
        >
          {isShuffling ? 'Shuffling...' : 'Shuffle'}
        </LuxuryButton>
        
        <LuxuryButton
          variant="outline"
          onClick={resetPuzzle}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Reset
        </LuxuryButton>
      </div>
    </GlassCard>
  );
}