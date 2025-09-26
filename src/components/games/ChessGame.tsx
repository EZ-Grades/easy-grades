import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LuxuryButton } from '../LuxuryButton';
import { GlassCard } from '../GlassCard';
import { CheckCircle, RotateCcw, Lightbulb } from 'lucide-react';

interface ChessGameProps {
  onComplete: () => void;
}

type PieceType = 'k' | 'q' | 'r' | 'b' | 'n' | 'p' | 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' | null;
type ChessBoard = PieceType[][];

const pieceSymbols: Record<string, string> = {
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙'
};

// Chess puzzle: White to move and checkmate in 2
const initialBoard: ChessBoard = [
  [null, null, null, null, null, null, null, 'k'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['R', null, null, null, null, null, null, null],
  ['K', null, null, null, null, null, null, 'R']
];

export function ChessGame({ onComplete }: ChessGameProps) {
  const [board, setBoard] = useState<ChessBoard>(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const isValidMove = (from: [number, number], to: [number, number]): boolean => {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    const piece = board[fromRow][fromCol];
    
    if (!piece || piece.toLowerCase() === piece) return false; // Only white pieces can move
    
    // Simple rook movement validation for this puzzle
    if (piece === 'R') {
      return fromRow === toRow || fromCol === toCol;
    }
    
    // Simple king movement validation
    if (piece === 'K') {
      return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
    }
    
    return false;
  };

  const makeMove = (from: [number, number], to: [number, number]) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[from[0]][from[1]];
    
    newBoard[to[0]][to[1]] = piece;
    newBoard[from[0]][from[1]] = null;
    
    setBoard(newBoard);
    setMoveCount(moveCount + 1);
    
    // Check for puzzle completion (simplified - just checking if king is in corner)
    if (moveCount >= 1 && to[0] === 0 && to[1] === 0) {
      setIsComplete(true);
      setTimeout(onComplete, 1500);
    }
  };

  const handleSquareClick = (row: number, col: number) => {
    if (isComplete) return;
    
    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;
      
      if (fromRow === row && fromCol === col) {
        // Deselect if clicking same square
        setSelectedSquare(null);
      } else if (isValidMove(selectedSquare, [row, col])) {
        // Make the move
        makeMove(selectedSquare, [row, col]);
        setSelectedSquare(null);
      } else {
        // Select new piece if it's a white piece
        const piece = board[row][col];
        if (piece && piece === piece.toUpperCase()) {
          setSelectedSquare([row, col]);
        } else {
          setSelectedSquare(null);
        }
      }
    } else {
      // Select piece if it's a white piece
      const piece = board[row][col];
      if (piece && piece === piece.toUpperCase()) {
        setSelectedSquare([row, col]);
      }
    }
  };

  const resetPuzzle = () => {
    setBoard(initialBoard);
    setSelectedSquare(null);
    setMoveCount(0);
    setIsComplete(false);
    setShowHint(false);
  };

  return (
    <GlassCard className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Chess Puzzle</h2>
        <p className="text-muted-foreground">White to move and checkmate in 2 moves</p>
        <p className="text-sm text-muted-foreground mt-1">Moves: {moveCount}/2</p>
      </div>

      {/* Chess Board */}
      <div className="grid grid-cols-8 gap-0 mb-6 max-w-md mx-auto border-2 border-border rounded-lg overflow-hidden">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const isSelected = selectedSquare && selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex;
            
            return (
              <motion.button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                className={`
                  aspect-square flex items-center justify-center text-2xl relative
                  ${isLight ? 'bg-amber-100 dark:bg-amber-200' : 'bg-amber-800 dark:bg-amber-900'}
                  ${isSelected ? 'ring-2 ring-primary-solid' : ''}
                  hover:bg-opacity-80 transition-all duration-200
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isComplete}
              >
                {piece && (
                  <span className="text-gray-800 dark:text-gray-100">
                    {pieceSymbols[piece]}
                  </span>
                )}
                
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 bg-primary-solid/20 rounded"
                  />
                )}
              </motion.button>
            );
          })
        )}
      </div>

      {/* Success Message */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-green-500">Puzzle Solved!</h3>
          <p className="text-muted-foreground">Great job solving the chess puzzle!</p>
        </motion.div>
      )}

      {/* Hint */}
      {showHint && !isComplete && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card p-4 mb-6"
        >
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Hint:</h4>
              <p className="text-sm text-muted-foreground">
                Move your rook to the 8th rank (top row) to deliver checkmate. The black king has no escape squares!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        <LuxuryButton
          variant="outline"
          onClick={() => setShowHint(!showHint)}
          icon={<Lightbulb className="w-4 h-4" />}
          disabled={isComplete}
        >
          {showHint ? 'Hide Hint' : 'Show Hint'}
        </LuxuryButton>
        
        <LuxuryButton
          variant="outline"
          onClick={resetPuzzle}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Reset Puzzle
        </LuxuryButton>
      </div>
    </GlassCard>
  );
}