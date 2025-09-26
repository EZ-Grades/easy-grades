import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Lightbulb, CheckCircle, Clock, Trophy, Star } from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface SudokuGameProps {
  onComplete: () => void;
}

type SudokuGrid = (number | null)[][];

const GRID_SIZE = 8;
const BOX_SIZE = 4; // 4x2 boxes for 8x8 grid

export function SudokuGame({ onComplete }: SudokuGameProps) {
  const [grid, setGrid] = useState<SudokuGrid>(() => {
    try {
      return generatePuzzle();
    } catch (error) {
      console.error('Error generating Sudoku puzzle:', error);
      return createEmptyGrid();
    }
  });
  const [originalGrid, setOriginalGrid] = useState<SudokuGrid>(() => {
    try {
      return generatePuzzle();
    } catch (error) {
      console.error('Error generating original Sudoku grid:', error);
      return createEmptyGrid();
    }
  });
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Helper function to create empty grid
  function createEmptyGrid(): SudokuGrid {
    return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
  }

  // Generate a valid 8x8 Sudoku puzzle
  function generatePuzzle(): SudokuGrid {
    // Start with a solved grid
    const solvedGrid = generateSolvedGrid();
    
    // Remove numbers to create puzzle (keeping about 40-50% filled)
    const puzzle = solvedGrid.map(row => [...row]);
    const cellsToRemove = Math.floor(GRID_SIZE * GRID_SIZE * 0.6);
    
    for (let i = 0; i < cellsToRemove; i++) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      puzzle[row][col] = null;
    }
    
    return puzzle;
  }

  function generateSolvedGrid(): SudokuGrid {
    const grid: SudokuGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    
    // Simple pattern generation for 8x8 with numbers 1-8
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        // Create a valid Latin square pattern
        grid[row][col] = ((row * 3 + row / 2 + col) % GRID_SIZE) + 1;
      }
    }
    
    // Shuffle to make it more random
    shuffleGrid(grid);
    return grid;
  }

  function shuffleGrid(grid: SudokuGrid) {
    // Shuffle rows within box groups
    for (let boxRow = 0; boxRow < 2; boxRow++) {
      const startRow = boxRow * 4;
      for (let i = 0; i < 10; i++) {
        const row1 = startRow + Math.floor(Math.random() * 4);
        const row2 = startRow + Math.floor(Math.random() * 4);
        [grid[row1], grid[row2]] = [grid[row2], grid[row1]];
      }
    }
    
    // Shuffle columns within box groups
    for (let boxCol = 0; boxCol < 2; boxCol++) {
      const startCol = boxCol * 4;
      for (let i = 0; i < 10; i++) {
        const col1 = startCol + Math.floor(Math.random() * 4);
        const col2 = startCol + Math.floor(Math.random() * 4);
        for (let row = 0; row < GRID_SIZE; row++) {
          [grid[row][col1], grid[row][col2]] = [grid[row][col2], grid[row][col1]];
        }
      }
    }
  }

  useEffect(() => {
    const newPuzzle = generatePuzzle();
    setGrid(newPuzzle);
    setOriginalGrid(newPuzzle.map(row => [...row]));
    setIsComplete(false);
    setErrors(new Set());
    setHintsUsed(0);
    setTimeElapsed(0);
    setGameStarted(false);
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !isComplete) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, isComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isInitialCell = (row: number, col: number): boolean => {
    return originalGrid[row][col] !== null;
  };

  const getBoxIndex = (row: number, col: number): number => {
    return Math.floor(row / 2) * 2 + Math.floor(col / 4);
  };

  const validateMove = useCallback((row: number, col: number, num: number): boolean => {
    try {
      // Safety checks
      if (!grid || row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
        return false;
      }

      // Check row
      for (let c = 0; c < GRID_SIZE; c++) {
        if (c !== col && grid[row] && grid[row][c] === num) return false;
      }

      // Check column
      for (let r = 0; r < GRID_SIZE; r++) {
        if (r !== row && grid[r] && grid[r][col] === num) return false;
      }

      // Check 4x2 box
      const boxRowStart = Math.floor(row / 2) * 2;
      const boxColStart = Math.floor(col / 4) * 4;
      
      for (let r = boxRowStart; r < boxRowStart + 2; r++) {
        for (let c = boxColStart; c < boxColStart + 4; c++) {
          if ((r !== row || c !== col) && grid[r] && grid[r][c] === num) return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in validateMove:', error);
      return false;
    }
  }, [grid]);

  const handleCellClick = (row: number, col: number) => {
    if (isInitialCell(row, col) || isComplete) return;
    
    if (!gameStarted) setGameStarted(true);
    setSelectedCell([row, col]);
  };

  const handleNumberInput = (num: number) => {
    try {
      if (!selectedCell || isComplete) return;
      
      const [row, col] = selectedCell;
      if (isInitialCell(row, col)) return;

      // Safety checks
      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
        console.warn('Invalid cell coordinates:', row, col);
        return;
      }

      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = num;

      // Validate the move
      const errorKey = `${row}-${col}`;
      const newErrors = new Set(errors);

      if (!validateMove(row, col, num)) {
        newErrors.add(errorKey);
      } else {
        newErrors.delete(errorKey);
      }

      setGrid(newGrid);
      setErrors(newErrors);

      // Check if puzzle is complete
      if (isPuzzleComplete(newGrid) && newErrors.size === 0) {
        setIsComplete(true);
        setTimeout(() => onComplete(), 2000);
      }
    } catch (error) {
      console.error('Error in handleNumberInput:', error);
    }
  };

  const handleClear = () => {
    if (!selectedCell || isComplete) return;
    
    const [row, col] = selectedCell;
    if (isInitialCell(row, col)) return;

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = null;
    setGrid(newGrid);

    const errorKey = `${row}-${col}`;
    const newErrors = new Set(errors);
    newErrors.delete(errorKey);
    setErrors(newErrors);
  };

  const isPuzzleComplete = (currentGrid: SudokuGrid): boolean => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (currentGrid[row][col] === null) return false;
      }
    }
    return true;
  };

  const getHint = () => {
    if (!selectedCell || isComplete || hintsUsed >= 3) return;
    
    const [row, col] = selectedCell;
    if (isInitialCell(row, col)) return;

    // Find the correct number for this cell
    for (let num = 1; num <= GRID_SIZE; num++) {
      if (validateMove(row, col, num)) {
        const newGrid = grid.map(r => [...r]);
        newGrid[row][col] = num;
        setGrid(newGrid);
        setHintsUsed(prev => prev + 1);
        
        // Remove error if it exists
        const errorKey = `${row}-${col}`;
        const newErrors = new Set(errors);
        newErrors.delete(errorKey);
        setErrors(newErrors);
        break;
      }
    }
  };

  const resetGame = () => {
    const newPuzzle = generatePuzzle();
    setGrid(newPuzzle);
    setOriginalGrid(newPuzzle.map(row => [...row]));
    setSelectedCell(null);
    setIsComplete(false);
    setErrors(new Set());
    setHintsUsed(0);
    setTimeElapsed(0);
    setGameStarted(false);
  };

  const getCellClassName = (row: number, col: number) => {
    const isSelected = selectedCell && selectedCell[0] === row && selectedCell[1] === col;
    const isOriginal = isInitialCell(row, col);
    const hasError = errors.has(`${row}-${col}`);
    const isInSameRow = selectedCell && selectedCell[0] === row;
    const isInSameCol = selectedCell && selectedCell[1] === col;
    const isInSameBox = selectedCell && getBoxIndex(row, col) === getBoxIndex(selectedCell[0], selectedCell[1]);
    
    let className = 'w-8 h-8 flex items-center justify-center text-sm font-bold cursor-pointer transition-all border-r border-b border-gray-300 dark:border-gray-600 ';
    
    // Box borders
    if (col % 4 === 3) className += 'border-r-2 border-r-gray-600 dark:border-r-gray-400 ';
    if (row % 2 === 1) className += 'border-b-2 border-b-gray-600 dark:border-b-gray-400 ';
    
    if (hasError) {
      className += 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ';
    } else if (isSelected) {
      className += 'bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200 ';
    } else if (isInSameRow || isInSameCol || isInSameBox) {
      className += 'bg-blue-50 dark:bg-blue-900/20 ';
    } else if (isOriginal) {
      className += 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 ';
    } else {
      className += 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 ';
    }
    
    return className;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <GlassCard className="p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gradient-primary mb-2">Sudoku 8×8</h2>
          <p className="text-muted-foreground">
            Fill the grid with numbers 1-8 following Sudoku rules
          </p>
        </div>

        {/* Game Stats */}
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Time</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{formatTime(timeElapsed)}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Lightbulb className="w-4 h-4" />
              <span>Hints</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{3 - hintsUsed}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4" />
              <span>Errors</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{errors.size}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Grid */}
          <div className="lg:col-span-2">
            <div className="relative">
              <div className="grid grid-cols-8 border-2 border-gray-600 dark:border-gray-400 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <motion.div
                      key={`${rowIndex}-${colIndex}`}
                      className={getCellClassName(rowIndex, colIndex)}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {cell || ''}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Game Completion Overlay */}
              <AnimatePresence>
                {isComplete && (
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
                        🎉
                      </motion.div>
                      <div className="text-3xl font-bold mb-2">Puzzle Solved!</div>
                      <div className="text-lg mb-2">Time: {formatTime(timeElapsed)}</div>
                      <div className="text-base">Hints used: {hintsUsed}/3</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Number Input */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Numbers</h3>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    onClick={() => handleNumberInput(num)}
                    disabled={!selectedCell || isComplete}
                    className="h-10 font-bold"
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleClear}
                variant="outline"
                disabled={!selectedCell || isComplete}
                className="w-full"
              >
                Clear Cell
              </Button>
              
              <Button
                onClick={getHint}
                variant="outline"
                disabled={!selectedCell || isComplete || hintsUsed >= 3}
                className="w-full flex items-center gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                Hint ({3 - hintsUsed} left)
              </Button>
              
              <Button
                onClick={resetGame}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                New Game
              </Button>
            </div>

            {/* Rules */}
            <div className="text-sm text-muted-foreground">
              <h4 className="font-semibold mb-2">Rules:</h4>
              <ul className="space-y-1">
                <li>• Fill each row with numbers 1-8</li>
                <li>• Fill each column with numbers 1-8</li>
                <li>• Fill each 4×2 box with numbers 1-8</li>
                <li>• No repeating numbers in rows, columns, or boxes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Achievements */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-2 mt-6"
          >
            <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-800">
              <Trophy className="w-3 h-3 mr-1" />
              Solved!
            </Badge>
            {timeElapsed <= 300 && (
              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-800">
                <Star className="w-3 h-3 mr-1" />
                Speed Solver
              </Badge>
            )}
            {hintsUsed === 0 && (
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-800">
                <Star className="w-3 h-3 mr-1" />
                No Hints!
              </Badge>
            )}
          </motion.div>
        )}
      </GlassCard>
    </div>
  );
}