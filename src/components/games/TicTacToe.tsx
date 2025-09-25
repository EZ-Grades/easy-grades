import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../GlassCard';
import { LuxuryButton } from '../LuxuryButton';
import { CheckCircle, RotateCcw } from 'lucide-react';

type Player = 'X' | 'O' | null;

const winningCombos = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diagonals
];

export function TicTacToe({ onComplete }: { onComplete: () => void }) {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [playerTurn, setPlayerTurn] = useState(true); // true = player X
  const [winner, setWinner] = useState<Player | 'Draw'>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  // Bot move
  useEffect(() => {
    if (!playerTurn && !winner) {
      const emptyIndexes = board.map((v,i) => v === null ? i : null).filter(v => v !== null) as number[];
      if (emptyIndexes.length > 0) {
        const move = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
        const newBoard = [...board];
        newBoard[move] = 'O';
        setTimeout(() => {
          setBoard(newBoard);
          setPlayerTurn(true);
        }, 400); // bot thinking delay
      }
    }
  }, [playerTurn, board, winner]);

  // Check winner
  useEffect(() => {
    for (let combo of winningCombos) {
      const [a,b,c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        setWinningLine(combo);
        return;
      }
    }
    if (board.every(cell => cell !== null)) setWinner('Draw');
  }, [board]);

  const handleClick = (index: number) => {
    if (board[index] || !playerTurn || winner) return;
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setPlayerTurn(false);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine(null);
    setPlayerTurn(true);
  };

  return (
    <GlassCard className="p-6 max-w-md mx-auto text-center">
      <h2 className="text-xl font-semibold mb-4">Tic-Tac-Toe</h2>

      {/* Status */}
      {!winner && (
        <p className="mb-4 text-muted-foreground">
          {playerTurn ? 'Your turn (X)' : 'Bot is thinking...'}
        </p>
      )}
      {winner && winner !== 'Draw' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 mb-4 text-green-500 font-semibold"
        >
          <CheckCircle className="w-6 h-6" /> {winner} Wins!
        </motion.div>
      )}
      {winner === 'Draw' && <p className="mb-4 text-yellow-500 font-semibold">It's a Draw!</p>}

      {/* Board */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {board.map((cell, idx) => {
          const isWinningCell = winningLine?.includes(idx);
          return (
            <motion.button
              key={idx}
              onClick={() => handleClick(idx)}
              whileHover={{ scale: cell ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                aspect-square flex items-center justify-center text-3xl font-bold
                rounded-lg border-2 border-border bg-gradient-to-br from-gray-100 to-gray-200
                dark:from-gray-700 dark:to-gray-800
                ${isWinningCell ? 'bg-green-400 text-white' : ''}
              `}
            >
              {cell}
            </motion.button>
          )
        })}
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        <LuxuryButton
          variant="outline"
          onClick={resetGame}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Reset Game
        </LuxuryButton>
        {winner && (
          <LuxuryButton variant="default" onClick={onComplete}>
            Done
          </LuxuryButton>
        )}
      </div>
    </GlassCard>
  );
}
