import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LuxuryButton } from '../LuxuryButton';
import { GlassCard } from '../GlassCard';
import { CheckCircle, RotateCcw, Eraser } from 'lucide-react';

interface SudokuGameProps {
  onComplete: () => void;
}

type SudokuGrid = (number | null)[][];

// Example 8x8 puzzle
const initialPuzzle: SudokuGrid = [
  [null, 2, null, 4, 5, null, 7, null],
  [5, null, 7, null, null, 2, null, 1],
  [null, 1, null, 2, null, 3, null, 4],
  [7, null, 5, null, 1, null, 2, null],
  [null, 6, null, 3, null, 4, null, 7],
  [3, null, 1, null, 6, null, 5, null],
  [null, 7, null, 5, null, 8, null, 2],
  [1, null, 6, null, 7, null, 4, null],
];

// Example solution
const solution: SudokuGrid = [
  [6,2,1,4,5,8,7,3],
  [5,3,7,6,4,2,8,1],
  [8,1,4,2,7,3,6,4],
  [7,4,5,8,1,6,2,9],
  [2,6,8,3,9,4,1,7],
  [3,5,1,7,6,9,5,8],
  [4,7,3,5,2,8,9,2],
  [1,8,6,9,7,1,4,5],
];

export function SudokuGame({ onComplete }: SudokuGameProps) {
  const [grid, setGrid] = useState<SudokuGrid>(initialPuzzle.map(row => [...row]));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());

  const isInitialCell = (row: number, col: number): boolean => {
    return initialPuzzle[row][col] !== null;
  };

  const validateMove = (row: number, col: number, num: number): boolean => {
    const size = 8;
    const boxRows = 2;
    const boxCols = 4;

    // Row & Column check
    for (let i = 0; i < size; i++) {
      if ((i !== col && grid[row][i] === num) || (i !== row && grid[i][col] === num)) return false;
    }

    // Subgrid check
    const startRow = Math.floor(row / boxRows) * boxRows;
    const startCol = Math.floor(col / boxCols) * boxCols;

    for (let r = startRow; r < startRow + boxRows; r++) {
      for (let c = startCol; c < startCol + boxCols; c++) {
        if ((r !== row || c !== col) && grid[r][c] === num) return false;
      }
    }

    return true;
  };

  const handleCellClick = (row: number, col: number) => {
    if (isInitialCell(row, col) || isComplete) return;
    setSelectedCell([row, col]);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || isComplete) return;
    const [row, col] = selectedCell;
    if (isInitialCell(row, col)) return;

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = num;

    if (validateMove(row, col, num)) {
      setErrors(prev => {
        const newErrors = new Set(prev);
        newErrors.delete(`${row}-${col}`);
        return newErrors;
      });
    } else {
      setErrors(prev => new Set(prev).add(`${row}-${col}`));
    }

    setGrid(newGrid);
    checkCompletion(newGrid);
  };

  const clearCell = () => {
    if (!selectedCell || isComplete) return;
    const [row, col] = selectedCell;
    if (isInitialCell(row, col)) return;

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = null;
    setGrid(newGrid);
    setErrors(prev => {
      const newErrors = new Set(prev);
      newErrors.delete(`${row}-${col}`);
      return newErrors;
    });
  };

  const checkCompletion = (currentGrid: SudokuGrid) => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (currentGrid[row][col] === null) return;
        if (currentGrid[row][col] !== solution[row][col]) return;
      }
    }

    setIsComplete(true);
    setTimeout(onComplete, 1500);
  };

  const resetGame = () => {
    setGrid(initialPuzzle.map(row => [...row]));
    setSelectedCell(null);
    setIsComplete(false);
    setErrors(new Set());
  };

  return (
    <GlassCard className="p-6 max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Sudoku 8x8</h2>
        <p className="text-muted-foreground">Fill each row, column, and 2x4 box with numbers 1–8</p>
      </div>

      {/* Sudoku Grid */}
      <div className="grid grid-cols-8 gap-1 mb-6 max-w-2xl mx-auto border-2 border-border rounded-lg overflow-hidden p-2 bg-white/5">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isSelected = selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex;
            const isInitial = isInitialCell(rowIndex, colIndex);
            const hasError = errors.has(`${rowIndex}-${colIndex}`);
            const isThickBorder = {
              right: colIndex === 3,
              bottom: rowIndex === 1 || rowIndex === 3 || rowIndex === 5
            };

            return (
              <motion.button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`
                  aspect-square flex items-center justify-center text-lg font-medium
                  border border-border/30 rounded
                  ${isSelected ? 'bg-primary-solid/20 ring-2 ring-primary-solid' : 'bg-card/50'}
                  ${isInitial ? 'bg-muted/50 font-bold text-primary-solid' : 'hover:bg-primary-solid/10'}
                  ${hasError ? 'text-red-500 bg-red-500/10 ring-2 ring-red-500/50' : ''}
                  ${isThickBorder.right ? 'border-r-2 border-r-border' : ''}
                  ${isThickBorder.bottom ? 'border-b-2 border-b-border' : ''}
                  transition-all duration-200
                `}
                whileHover={!isInitial ? { scale: 1.05 } : {}}
                whileTap={!isInitial ? { scale: 0.95 } : {}}
                disabled={isInitial || isComplete}
              >
                {cell || ''}
              </motion.button>
            );
          })
        )}
      </div>

      {/* Success Message */}
      {isComplete && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-green-500">Puzzle Solved!</h3>
          <p className="text-muted-foreground">Excellent work on completing the Sudoku!</p>
        </motion.div>
      )}

      {/* Number Input */}
      <div className="grid grid-cols-8 gap-2 mb-6 max-w-2xl mx-auto">
        {[1,2,3,4,5,6,7,8].map(num => (
          <LuxuryButton key={num} variant="outline" onClick={() => handleNumberInput(num)} disabled={!selectedCell || isComplete} className="aspect-square">
            {num}
          </LuxuryButton>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        <LuxuryButton variant="outline" onClick={clearCell} icon={<Eraser className="w-4 h-4" />} disabled={!selectedCell || isComplete}>
          Clear
        </LuxuryButton>
        <LuxuryButton variant="outline" onClick={resetGame} icon={<RotateCcw className="w-4 h-4" />}>
          Reset
        </LuxuryButton>
      </div>
    </GlassCard>
  );
}
