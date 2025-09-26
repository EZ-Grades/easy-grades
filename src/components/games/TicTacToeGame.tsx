import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { LuxuryButton } from '../LuxuryButton';
import { GlassCard } from '../GlassCard';
import { CheckCircle, RotateCcw, Trophy, Zap } from 'lucide-react';
import { useGameState, useTurnBasedGame } from '../../hooks/useGameState';

interface TicTacToeGameProps {
  onComplete: () => void;
}

type Player = 'X' | 'O' | null;
type Board = Player[];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6] // diagonals
];

export function TicTacToeGame({ onComplete }: TicTacToeGameProps) {
  const [board, setBoard, resetBoard] = useGameState<Board>(Array(9).fill(null));
  const [winner, setWinner] = useState<Player | 'tie'>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameMode, setGameMode] = useState<'ai' | 'human'>('ai');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  
  // Use the turn-based game hook for safer player management
  const { currentPlayer, gameActive, switchPlayer, resetGame: resetTurnGame, endGame } = useTurnBasedGame<'X' | 'O'>('X', ['X', 'O']);

  // Simplified makeMove function using the safe game state hooks
  const makeMove = useCallback((index: number) => {
    if (!gameActive || winner) return;
    
    setBoard(prev => {
      // Check if move is valid
      if (prev[index]) return prev;
      
      const newBoard = [...prev];
      newBoard[index] = currentPlayer;
      return newBoard;
    });
    
    // Switch to next player
    switchPlayer();
  }, [currentPlayer, winner, gameActive, setBoard, switchPlayer]);

  // Check for winner
  useEffect(() => {
    const checkWinner = (currentBoard: Board): { winner: Player | 'tie', line: number[] } => {
      // Check winning combinations
      for (const combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
          return { winner: currentBoard[a], line: combination };
        }
      }
      
      // Check for tie
      if (currentBoard.every(cell => cell !== null)) {
        return { winner: 'tie', line: [] };
      }
      
      return { winner: null, line: [] };
    };

    const result = checkWinner(board);
    if (result.winner && gameActive) {
      setWinner(result.winner);
      setWinningLine(result.line);
      endGame(); // End the game to prevent further moves
      
      if (result.winner === 'X') {
        setPlayerScore(prev => prev + 1);
      } else if (result.winner === 'O') {
        setAiScore(prev => prev + 1);
      }
      
      setTimeout(() => {
        if (playerScore + aiScore >= 2) {
          onComplete();
        }
      }, 2000);
    }
  }, [board, playerScore, aiScore, gameActive, endGame]);

  // AI Move - using safe state management
  useEffect(() => {
    if (currentPlayer === 'O' && gameMode === 'ai' && !winner && gameActive) {
      const timer = setTimeout(() => {
        setBoard(prevBoard => {
          const aiMove = getAIMove(prevBoard, difficulty);
          if (aiMove !== -1 && !prevBoard[aiMove]) {
            const newBoard = [...prevBoard];
            newBoard[aiMove] = 'O';
            return newBoard;
          }
          return prevBoard;
        });
        
        // Switch player after AI move
        setTimeout(() => {
          switchPlayer();
        }, 100);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, winner, gameMode, difficulty, gameActive, setBoard, switchPlayer]);

  const getAIMove = (currentBoard: Board, aiDifficulty: 'easy' | 'medium' | 'hard'): number => {
    const availableMoves = currentBoard
      .map((cell, index) => cell === null ? index : null)
      .filter(val => val !== null) as number[];

    if (availableMoves.length === 0) return -1;

    if (aiDifficulty === 'easy') {
      // Random move
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    if (aiDifficulty === 'medium') {
      // 70% optimal, 30% random
      if (Math.random() < 0.3) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      }
    }

    // Optimal move using minimax
    return getBestMove(currentBoard);
  };

  const getBestMove = (currentBoard: Board): number => {
    const minimax = (board: Board, depth: number, isMaximizing: boolean): number => {
      const result = checkGameEnd(board);
      
      if (result === 'O') return 10 - depth;
      if (result === 'X') return depth - 10;
      if (result === 'tie') return 0;

      if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
          if (board[i] === null) {
            board[i] = 'O';
            const score = minimax(board, depth + 1, false);
            board[i] = null;
            bestScore = Math.max(score, bestScore);
          }
        }
        return bestScore;
      } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
          if (board[i] === null) {
            board[i] = 'X';
            const score = minimax(board, depth + 1, true);
            board[i] = null;
            bestScore = Math.min(score, bestScore);
          }
        }
        return bestScore;
      }
    };

    let bestMove = -1;
    let bestScore = -Infinity;
    
    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = 'O';
        const score = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    
    return bestMove;
  };

  const checkGameEnd = (currentBoard: Board): Player | 'tie' | null => {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return currentBoard[a];
      }
    }
    
    if (currentBoard.every(cell => cell !== null)) {
      return 'tie';
    }
    
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner || !gameActive || (gameMode === 'ai' && currentPlayer === 'O')) {
      return;
    }
    
    makeMove(index);
  };

  const resetGame = () => {
    resetBoard();
    resetTurnGame();
    setWinner(null);
    setWinningLine([]);
  };

  const resetScores = () => {
    setPlayerScore(0);
    setAiScore(0);
    resetGame();
  };

  const getCellContent = (index: number) => {
    const value = board[index];
    if (!value) return '';
    
    return (
      <motion.span
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.3, type: "spring" }}
        className={`text-4xl font-bold ${
          value === 'X' ? 'text-blue-500' : 'text-red-500'
        }`}
      >
        {value}
      </motion.span>
    );
  };

  return (
    <GlassCard className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          Tic-Tac-Toe Challenge
        </h2>
        <p className="text-muted-foreground">Beat the AI or play with a friend!</p>
      </div>

      {/* Game Mode & Difficulty */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <LuxuryButton
          variant={gameMode === 'ai' ? 'primary' : 'outline'}
          onClick={() => {
            setGameMode('ai');
            resetGame();
          }}
          size="sm"
        >
          vs AI
        </LuxuryButton>
        <LuxuryButton
          variant={gameMode === 'human' ? 'primary' : 'outline'}
          onClick={() => {
            setGameMode('human');
            resetGame();
          }}
          size="sm"
        >
          2 Player
        </LuxuryButton>
        
        {gameMode === 'ai' && (
          <>
            <LuxuryButton
              variant={difficulty === 'easy' ? 'secondary' : 'outline'}
              onClick={() => setDifficulty('easy')}
              size="sm"
            >
              Easy
            </LuxuryButton>
            <LuxuryButton
              variant={difficulty === 'medium' ? 'secondary' : 'outline'}
              onClick={() => setDifficulty('medium')}
              size="sm"
            >
              Medium
            </LuxuryButton>
            <LuxuryButton
              variant={difficulty === 'hard' ? 'secondary' : 'outline'}
              onClick={() => setDifficulty('hard')}
              size="sm"
            >
              Hard
            </LuxuryButton>
          </>
        )}
      </div>

      {/* Score Display */}
      <div className="flex justify-center gap-8 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">{playerScore}</div>
          <div className="text-sm text-muted-foreground">You (X)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500">{aiScore}</div>
          <div className="text-sm text-muted-foreground">
            {gameMode === 'ai' ? 'AI (O)' : 'Player 2 (O)'}
          </div>
        </div>
      </div>

      {/* Current Turn */}
      {!winner && (
        <div className="text-center mb-6">
          <p className="text-lg">
            <span className={`font-bold ${currentPlayer === 'X' ? 'text-blue-500' : 'text-red-500'}`}>
              {currentPlayer}
            </span>
            's turn
            {gameMode === 'ai' && currentPlayer === 'O' && (
              <span className="text-muted-foreground ml-2">(AI thinking...)</span>
            )}
          </p>
        </div>
      )}

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-2 mb-6 max-w-xs mx-auto">
        {board.map((cell, index) => {
          const isWinningCell = winningLine.includes(index);
          
          return (
            <motion.button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={!!cell || !!winner || !gameActive || (gameMode === 'ai' && currentPlayer === 'O')}
              className={`
                aspect-square flex items-center justify-center text-2xl font-bold
                glass-card border-2 transition-all duration-300
                ${isWinningCell 
                  ? 'border-yellow-400 bg-yellow-400/20 glow-highlight' 
                  : 'border-border hover:border-primary-solid hover:glow-primary'
                }
                ${cell ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
              whileHover={!cell && !winner ? { scale: 1.05 } : {}}
              whileTap={!cell && !winner ? { scale: 0.95 } : {}}
            >
              {getCellContent(index)}
            </motion.button>
          );
        })}
      </div>

      {/* Game Result */}
      {winner && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          {winner === 'tie' ? (
            <div className="space-y-2">
              <CheckCircle className="w-12 h-12 text-yellow-500 mx-auto" />
              <h3 className="text-lg font-semibold text-yellow-500">It's a Tie!</h3>
              <p className="text-muted-foreground">Great game! Try again?</p>
            </div>
          ) : winner === 'X' ? (
            <div className="space-y-2">
              <Trophy className="w-12 h-12 text-blue-500 mx-auto" />
              <h3 className="text-lg font-semibold text-blue-500">You Win!</h3>
              <p className="text-muted-foreground">Excellent strategy!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <CheckCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h3 className="text-lg font-semibold text-red-500">
                {gameMode === 'ai' ? 'AI Wins!' : 'Player 2 Wins!'}
              </h3>
              <p className="text-muted-foreground">Better luck next time!</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        <LuxuryButton
          variant="outline"
          onClick={resetGame}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          New Game
        </LuxuryButton>
        
        {(playerScore > 0 || aiScore > 0) && (
          <LuxuryButton
            variant="outline"
            onClick={resetScores}
          >
            Reset Scores
          </LuxuryButton>
        )}
      </div>
    </GlassCard>
  );
}