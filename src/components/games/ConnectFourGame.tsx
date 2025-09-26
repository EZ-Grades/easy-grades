import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, User, Bot, Trophy } from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ConnectFourGameProps {
  onComplete: () => void;
}

type Player = 'red' | 'yellow' | null;
type Board = Player[][];
type GameStatus = 'playing' | 'won' | 'draw';

const ROWS = 6;
const COLS = 7;

export function ConnectFourGame({ onComplete }: ConnectFourGameProps) {
  const [board, setBoard] = useState<Board>(() => 
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<'red' | 'yellow'>('red');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [winner, setWinner] = useState<Player>(null);
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);
  const [moves, setMoves] = useState(0);
  const [scores, setScores] = useState({ red: 0, yellow: 0 });
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const checkWinner = useCallback((board: Board): { winner: Player; cells: [number, number][] } => {
    // Check horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        const player = board[row][col];
        if (player && 
            board[row][col + 1] === player &&
            board[row][col + 2] === player &&
            board[row][col + 3] === player) {
          return {
            winner: player,
            cells: [[row, col], [row, col + 1], [row, col + 2], [row, col + 3]]
          };
        }
      }
    }

    // Check vertical
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS; col++) {
        const player = board[row][col];
        if (player && 
            board[row + 1][col] === player &&
            board[row + 2][col] === player &&
            board[row + 3][col] === player) {
          return {
            winner: player,
            cells: [[row, col], [row + 1, col], [row + 2, col], [row + 3, col]]
          };
        }
      }
    }

    // Check diagonal (top-left to bottom-right)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        const player = board[row][col];
        if (player && 
            board[row + 1][col + 1] === player &&
            board[row + 2][col + 2] === player &&
            board[row + 3][col + 3] === player) {
          return {
            winner: player,
            cells: [[row, col], [row + 1, col + 1], [row + 2, col + 2], [row + 3, col + 3]]
          };
        }
      }
    }

    // Check diagonal (top-right to bottom-left)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 3; col < COLS; col++) {
        const player = board[row][col];
        if (player && 
            board[row + 1][col - 1] === player &&
            board[row + 2][col - 2] === player &&
            board[row + 3][col - 3] === player) {
          return {
            winner: player,
            cells: [[row, col], [row + 1, col - 1], [row + 2, col - 2], [row + 3, col - 3]]
          };
        }
      }
    }

    return { winner: null, cells: [] };
  }, []);

  const makeMove = useCallback((col: number) => {
    if (gameStatus !== 'playing' || isAIThinking) return false;

    // Find the lowest empty row in the column
    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === null) {
        row = r;
        break;
      }
    }

    if (row === -1) return false; // Column is full

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    setMoves(prev => prev + 1);

    // Check for winner
    const { winner: gameWinner, cells } = checkWinner(newBoard);
    if (gameWinner) {
      setGameStatus('won');
      setWinner(gameWinner);
      setWinningCells(cells);
      setScores(prev => ({
        ...prev,
        [gameWinner]: prev[gameWinner] + 1
      }));
      setTimeout(() => onComplete(), 2000);
      return true;
    }

    // Check for draw
    if (newBoard.every(row => row.every(cell => cell !== null))) {
      setGameStatus('draw');
      setTimeout(() => onComplete(), 2000);
      return true;
    }

    // Switch player
    setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red');
    return true;
  }, [board, currentPlayer, gameStatus, isAIThinking, checkWinner, onComplete]);

  // Simple AI for yellow player
  const makeAIMove = useCallback(() => {
    if (currentPlayer !== 'yellow' || gameStatus !== 'playing') return;

    setIsAIThinking(true);

    setTimeout(() => {
      // Simple AI: Try to win, block player, or make random move
      const tryMove = (player: Player): number | null => {
        for (let col = 0; col < COLS; col++) {
          // Find the row where the piece would land
          let row = -1;
          for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r][col] === null) {
              row = r;
              break;
            }
          }
          
          if (row !== -1) {
            // Simulate the move
            const testBoard = board.map(r => [...r]);
            testBoard[row][col] = player;
            const { winner } = checkWinner(testBoard);
            if (winner === player) {
              return col;
            }
          }
        }
        return null;
      };

      // Try to win first
      let aiCol = tryMove('yellow');
      
      // If can't win, try to block player
      if (aiCol === null) {
        aiCol = tryMove('red');
      }
      
      // If no strategic move, choose center columns first, then random
      if (aiCol === null) {
        const preferredCols = [3, 2, 4, 1, 5, 0, 6];
        for (const col of preferredCols) {
          if (board[0][col] === null) {
            aiCol = col;
            break;
          }
        }
      }

      if (aiCol !== null) {
        makeMove(aiCol);
      }
      
      setIsAIThinking(false);
    }, 500 + Math.random() * 500); // Random delay for more natural feel
  }, [board, currentPlayer, gameStatus, checkWinner, makeMove]);

  useEffect(() => {
    if (currentPlayer === 'yellow' && gameStatus === 'playing') {
      makeAIMove();
    }
  }, [currentPlayer, gameStatus, makeAIMove]);

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setCurrentPlayer('red');
    setGameStatus('playing');
    setWinner(null);
    setWinningCells([]);
    setMoves(0);
    setIsAIThinking(false);
    setHoveredCol(null);
  };

  const getDropPreview = (col: number): number | null => {
    if (gameStatus !== 'playing' || isAIThinking || currentPlayer !== 'red') return null;
    
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] === null) {
        return row;
      }
    }
    return null;
  };

  const getCellColor = (row: number, col: number) => {
    const cell = board[row][col];
    const isWinning = winningCells.some(([r, c]) => r === row && c === col);
    const isPreview = hoveredCol === col && getDropPreview(col) === row;
    
    if (isPreview) {
      return 'bg-red-300 border-red-400 animate-pulse';
    }
    
    if (!cell) {
      return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
    }
    
    const baseColor = cell === 'red' 
      ? 'bg-red-500 border-red-600' 
      : 'bg-yellow-400 border-yellow-500';
    
    const glowEffect = isWinning ? 'shadow-lg shadow-white/50 animate-pulse' : '';
    
    return `${baseColor} ${glowEffect}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <GlassCard className="p-4 md:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gradient-primary mb-2">Connect Four</h2>
          <p className="text-muted-foreground">
            Connect four pieces in a row to win!
          </p>
        </div>

        {/* Score and Status */}
        <div className="flex justify-center items-center gap-8 mb-6">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-red-500" />
            <div className="text-center">
              <div className="text-sm text-muted-foreground">You</div>
              <div className="text-2xl font-bold text-red-500">{scores.red}</div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-muted-foreground">Moves</div>
            <div className="text-xl font-semibold">{moves}</div>
          </div>

          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-yellow-500" />
            <div className="text-center">
              <div className="text-sm text-muted-foreground">AI</div>
              <div className="text-2xl font-bold text-yellow-500">{scores.yellow}</div>
            </div>
          </div>
        </div>

        {/* Current Player Indicator */}
        <div className="flex justify-center mb-6">
          {gameStatus === 'playing' && (
            <Badge 
              variant="outline" 
              className={`px-4 py-2 ${
                currentPlayer === 'red' 
                  ? 'border-red-300 bg-red-50 text-red-700 dark:bg-red-950/30' 
                  : 'border-yellow-300 bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {currentPlayer === 'red' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                {isAIThinking ? 'AI is thinking...' : 
                 currentPlayer === 'red' ? 'Your turn' : 'AI\'s turn'}
              </div>
            </Badge>
          )}
        </div>

        {/* Game Board */}
        <div className="relative mb-6">
          <div className="bg-blue-600 p-4 rounded-lg shadow-lg">
            <div className="grid grid-cols-7 gap-2">
              {board.map((row, rowIndex) =>
                row.map((_, colIndex) => (
                  <motion.button
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-200 ${getCellColor(rowIndex, colIndex)}`}
                    onClick={() => makeMove(colIndex)}
                    onHoverStart={() => setHoveredCol(colIndex)}
                    onHoverEnd={() => setHoveredCol(null)}
                    disabled={gameStatus !== 'playing' || isAIThinking || currentPlayer !== 'red'}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={board[rowIndex][colIndex] ? { scale: 0, y: -50 } : false}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 30,
                      duration: 0.3 
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Game Over Overlay */}
          <AnimatePresence>
            {gameStatus !== 'playing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-lg"
              >
                <div className="text-center text-white">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-6xl mb-4"
                  >
                    {gameStatus === 'won' ? '🎉' : '🤝'}
                  </motion.div>
                  <div className="text-3xl font-bold mb-2">
                    {gameStatus === 'won' 
                      ? (winner === 'red' ? 'You Win!' : 'AI Wins!')
                      : 'It\'s a Draw!'
                    }
                  </div>
                  <div className="text-lg">
                    Game completed in {moves} moves
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-muted-foreground mb-6">
          <p>Click on a column to drop your piece</p>
          <p>Connect four pieces horizontally, vertically, or diagonally to win!</p>
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
        {scores.red > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-2 mt-4"
          >
            {scores.red >= 3 && (
              <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                <Trophy className="w-3 h-3 mr-1" />
                Champion!
              </Badge>
            )}
          </motion.div>
        )}
      </GlassCard>
    </div>
  );
}