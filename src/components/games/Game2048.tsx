import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Trophy, Star, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useIsMobile } from '../ui/use-mobile';

interface Game2048Props {
  onComplete: () => void;
}

type Board = (number | null)[][];
type Direction = 'up' | 'down' | 'left' | 'right';

export function Game2048({ onComplete }: Game2048Props) {
  const isMobile = useIsMobile();
  const [board, setBoard] = useState<Board>(() => initializeBoard());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('2048-best-score');
    return saved ? parseInt(saved) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);

  function initializeBoard(): Board {
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(null));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    return newBoard;
  }

  function addRandomTile(board: Board): void {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === null) {
          emptyCells.push([i, j]);
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const [row, col] = emptyCells[randomIndex];
      board[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  const move = useCallback((direction: Direction) => {
    if (gameOver) return;

    const newBoard = board.map(row => [...row]);
    let scoreIncrease = 0;
    let moved = false;

    const moveRow = (row: (number | null)[]): { row: (number | null)[], score: number, moved: boolean } => {
      const filtered = row.filter(cell => cell !== null) as number[];
      const merged: number[] = [];
      let i = 0;
      let rowScore = 0;
      let rowMoved = false;

      while (i < filtered.length) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          const mergedValue = filtered[i] * 2;
          merged.push(mergedValue);
          rowScore += mergedValue;
          if (mergedValue === 2048 && !won) {
            setWon(true);
          }
          i += 2;
        } else {
          merged.push(filtered[i]);
          i++;
        }
      }

      while (merged.length < 4) {
        merged.push(null);
      }

      // Check if row changed
      for (let j = 0; j < 4; j++) {
        if (row[j] !== merged[j]) {
          rowMoved = true;
          break;
        }
      }

      return { row: merged, score: rowScore, moved: rowMoved };
    };

    if (direction === 'left') {
      for (let i = 0; i < 4; i++) {
        const result = moveRow(newBoard[i]);
        newBoard[i] = result.row;
        scoreIncrease += result.score;
        if (result.moved) moved = true;
      }
    } else if (direction === 'right') {
      for (let i = 0; i < 4; i++) {
        const reversed = [...newBoard[i]].reverse();
        const result = moveRow(reversed);
        newBoard[i] = result.row.reverse();
        scoreIncrease += result.score;
        if (result.moved) moved = true;
      }
    } else if (direction === 'up') {
      for (let j = 0; j < 4; j++) {
        const column = [newBoard[0][j], newBoard[1][j], newBoard[2][j], newBoard[3][j]];
        const result = moveRow(column);
        for (let i = 0; i < 4; i++) {
          newBoard[i][j] = result.row[i];
        }
        scoreIncrease += result.score;
        if (result.moved) moved = true;
      }
    } else if (direction === 'down') {
      for (let j = 0; j < 4; j++) {
        const column = [newBoard[3][j], newBoard[2][j], newBoard[1][j], newBoard[0][j]];
        const result = moveRow(column);
        for (let i = 0; i < 4; i++) {
          newBoard[3 - i][j] = result.row[i];
        }
        scoreIncrease += result.score;
        if (result.moved) moved = true;
      }
    }

    if (moved) {
      addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(prev => prev + scoreIncrease);
      setMoves(prev => prev + 1);

      // Check if game is over
      if (isGameOver(newBoard)) {
        setGameOver(true);
        setTimeout(() => onComplete(), 2000);
      }
    }
  }, [board, gameOver, won, onComplete]);

  function isGameOver(board: Board): boolean {
    // Check for empty cells
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === null) return false;
      }
    }

    // Check for possible merges
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const current = board[i][j];
        if (
          (i < 3 && board[i + 1][j] === current) ||
          (j < 3 && board[i][j + 1] === current)
        ) {
          return false;
        }
      }
    }

    return true;
  }

  const resetGame = () => {
    setBoard(initializeBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
    setMoves(0);
  };

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('2048-best-score', score.toString());
    }
  }, [score, bestScore]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          move('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          move('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          move('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          move('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [move]);

  const getTileColor = (value: number | null) => {
    if (!value) return 'bg-gray-200 dark:bg-gray-700';
    
    const colors: Record<number, string> = {
      2: 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200',
      4: 'bg-gray-200 dark:bg-gray-500 text-gray-800 dark:text-gray-200',
      8: 'bg-orange-300 text-white',
      16: 'bg-orange-400 text-white',
      32: 'bg-red-400 text-white',
      64: 'bg-red-500 text-white',
      128: 'bg-yellow-400 text-white',
      256: 'bg-yellow-500 text-white',
      512: 'bg-yellow-600 text-white',
      1024: 'bg-yellow-700 text-white',
      2048: 'bg-yellow-800 text-white',
    };
    
    return colors[value] || 'bg-pink-500 text-white';
  };

  const getTileSize = (value: number | null) => {
    if (!value) return 'text-lg';
    if (value >= 1000) return 'text-sm';
    if (value >= 100) return 'text-base';
    return 'text-lg';
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <GlassCard className="p-4 md:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gradient-primary mb-2">2048</h2>
          <p className="text-muted-foreground">
            Combine tiles to reach 2048!
          </p>
        </div>

        {/* Score Section */}
        <div className="flex justify-center gap-4 mb-6">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Score</div>
            <div className="text-2xl font-bold text-gradient-secondary">{score.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Best</div>
            <div className="text-2xl font-bold text-yellow-600">{bestScore.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Moves</div>
            <div className="text-2xl font-bold text-blue-600">{moves}</div>
          </div>
        </div>

        {/* Game Board */}
        <div className="relative mb-6">
          <div className="grid grid-cols-4 gap-2 p-4 bg-gray-300 dark:bg-gray-600 rounded-lg">
            {board.map((row, i) =>
              row.map((cell, j) => (
                <motion.div
                  key={`${i}-${j}-${cell}`}
                  className={`w-16 h-16 rounded flex items-center justify-center font-bold transition-all duration-200 ${getTileColor(cell)} ${getTileSize(cell)}`}
                  initial={cell ? { scale: 0 } : false}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {cell || ''}
                </motion.div>
              ))
            )}
          </div>

          {/* Win/Game Over Overlay */}
          <AnimatePresence>
            {(won || gameOver) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-lg"
              >
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">
                    {won ? '🎉' : '😔'}
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    {won ? 'You Win!' : 'Game Over!'}
                  </div>
                  <div className="text-lg">
                    Final Score: {score.toLocaleString()}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Mobile Controls */}
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto sm:hidden">
            <div></div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => move('up')}
              disabled={gameOver}
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
            <div></div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => move('left')}
              disabled={gameOver}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div></div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => move('right')}
              disabled={gameOver}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
            <div></div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => move('down')}
              disabled={gameOver}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
            <div></div>
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">Use arrow keys {isMobile ? 'or buttons ' : ''}to move tiles</p>
            <p>When two tiles with the same number touch, they merge!</p>
          </div>

          {/* Reset Button */}
          <div className="flex justify-center">
            <Button
              onClick={resetGame}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              New Game
            </Button>
          </div>

          {/* Achievements */}
          {(won || score >= 1000) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center gap-2"
            >
              {won && (
                <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                  <Trophy className="w-3 h-3 mr-1" />
                  Winner!
                </Badge>
              )}
              {score >= 1000 && (
                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-800">
                  <Star className="w-3 h-3 mr-1" />
                  High Score
                </Badge>
              )}
            </motion.div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}