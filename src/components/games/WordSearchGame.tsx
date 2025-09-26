import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Clock, Search, Trophy, Star } from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface WordSearchGameProps {
  onComplete: () => void;
}

interface Position {
  row: number;
  col: number;
}

interface FoundWord {
  word: string;
  positions: Position[];
  direction: string;
}

const GRID_SIZE = 12;

const WORD_THEMES = {
  animals: ['CAT', 'DOG', 'BIRD', 'FISH', 'LION', 'BEAR', 'WOLF', 'DEER'],
  colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE', 'PINK', 'BLACK'],
  food: ['PIZZA', 'BURGER', 'PASTA', 'SALAD', 'BREAD', 'CHEESE', 'FRUIT', 'CAKE'],
  nature: ['TREE', 'FLOWER', 'RIVER', 'MOUNTAIN', 'OCEAN', 'FOREST', 'GARDEN', 'SUN'],
  school: ['BOOK', 'PEN', 'DESK', 'CHAIR', 'PAPER', 'BOARD', 'STUDY', 'LEARN']
};

export function WordSearchGame({ onComplete }: WordSearchGameProps) {
  const [grid, setGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [selectedCells, setSelectedCells] = useState<Position[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startCell, setStartCell] = useState<Position | null>(null);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof WORD_THEMES>('animals');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const directions = [
    [0, 1],   // horizontal right
    [0, -1],  // horizontal left
    [1, 0],   // vertical down
    [-1, 0],  // vertical up
    [1, 1],   // diagonal down-right
    [-1, -1], // diagonal up-left
    [1, -1],  // diagonal down-left
    [-1, 1]   // diagonal up-right
  ];

  const generateGrid = useCallback(() => {
    const newGrid: string[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    const themeWords = [...WORD_THEMES[currentTheme]];
    const selectedWords: string[] = [];
    const placedWords: FoundWord[] = [];

    // Function to check if word can be placed at position
    const canPlaceWord = (word: string, row: number, col: number, direction: number[]): boolean => {
      const [dr, dc] = direction;
      for (let i = 0; i < word.length; i++) {
        const newRow = row + i * dr;
        const newCol = col + i * dc;
        if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE) {
          return false;
        }
        if (newGrid[newRow][newCol] !== '' && newGrid[newRow][newCol] !== word[i]) {
          return false;
        }
      }
      return true;
    };

    // Function to place word in grid
    const placeWord = (word: string, row: number, col: number, direction: number[]): Position[] => {
      const [dr, dc] = direction;
      const positions: Position[] = [];
      for (let i = 0; i < word.length; i++) {
        const newRow = row + i * dr;
        const newCol = col + i * dc;
        newGrid[newRow][newCol] = word[i];
        positions.push({ row: newRow, col: newCol });
      }
      return positions;
    };

    // Place words randomly
    let attempts = 0;
    while (selectedWords.length < 6 && attempts < 100) {
      const word = themeWords[Math.floor(Math.random() * themeWords.length)];
      if (selectedWords.includes(word)) {
        attempts++;
        continue;
      }

      const direction = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);

      if (canPlaceWord(word, row, col, direction)) {
        const positions = placeWord(word, row, col, direction);
        selectedWords.push(word);
        placedWords.push({
          word,
          positions,
          direction: `${direction[0]},${direction[1]}`
        });
      }
      attempts++;
    }

    // Fill empty cells with random letters
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (newGrid[row][col] === '') {
          newGrid[row][col] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }

    setGrid(newGrid);
    setWords(selectedWords);
    setFoundWords([]);
    setGameStarted(false);
    setGameCompleted(false);
    setTimeElapsed(0);
  }, [currentTheme]);

  useEffect(() => {
    generateGrid();
  }, [generateGrid]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSelectedWord = useCallback(() => {
    if (selectedCells.length === 0) return '';
    
    // Sort cells by order of selection to form word
    return selectedCells.map(cell => grid[cell.row]?.[cell.col] || '').join('');
  }, [selectedCells, grid]);

  const getPositionsInLine = (start: Position, end: Position): Position[] => {
    const positions: Position[] = [];
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    const distance = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
    
    if (distance === 0) return [start];
    
    const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
    const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
    
    // Check if it's a valid straight line (horizontal, vertical, or diagonal)
    if (Math.abs(rowDiff) !== 0 && Math.abs(colDiff) !== 0 && Math.abs(rowDiff) !== Math.abs(colDiff)) {
      return [];
    }
    
    for (let i = 0; i <= distance; i++) {
      positions.push({
        row: start.row + i * rowStep,
        col: start.col + i * colStep
      });
    }
    
    return positions;
  };

  const handleMouseDown = (row: number, col: number) => {
    if (!gameStarted) setGameStarted(true);
    
    setIsDragging(true);
    setStartCell({ row, col });
    setSelectedCells([{ row, col }]);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isDragging || !startCell) return;
    
    const positions = getPositionsInLine(startCell, { row, col });
    setSelectedCells(positions);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const selectedWord = getSelectedWord();
    const reversedWord = selectedWord.split('').reverse().join('');
    
    // Check if selected word is in our word list
    const foundWord = words.find(word => word === selectedWord || word === reversedWord);
    
    if (foundWord && !foundWords.some(fw => fw.word === foundWord)) {
      const newFoundWord: FoundWord = {
        word: foundWord,
        positions: [...selectedCells],
        direction: 'found'
      };
      
      const newFoundWords = [...foundWords, newFoundWord];
      setFoundWords(newFoundWords);
      
      // Check if all words are found
      if (newFoundWords.length === words.length) {
        setGameCompleted(true);
        setTimeout(() => onComplete(), 2000);
      }
    }
    
    setSelectedCells([]);
    setStartCell(null);
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const isCellFound = (row: number, col: number) => {
    return foundWords.some(fw => 
      fw.positions.some(pos => pos.row === row && pos.col === col)
    );
  };

  const resetGame = () => {
    generateGrid();
  };

  const changeTheme = (theme: keyof typeof WORD_THEMES) => {
    setCurrentTheme(theme);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <GlassCard className="p-4 md:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gradient-primary mb-2">Word Search</h2>
          <p className="text-muted-foreground">
            Find all the hidden words in the grid!
          </p>
        </div>

        {/* Theme Selector */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {Object.keys(WORD_THEMES).map((theme) => (
            <Button
              key={theme}
              variant={currentTheme === theme ? "default" : "outline"}
              size="sm"
              onClick={() => changeTheme(theme as keyof typeof WORD_THEMES)}
              className="capitalize"
            >
              {theme}
            </Button>
          ))}
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
              <Search className="w-4 h-4" />
              <span>Found</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {foundWords.length}/{words.length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Word List */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Find these words:</h3>
            <div className="space-y-2">
              {words.map((word, index) => {
                const isFound = foundWords.some(fw => fw.word === word);
                return (
                  <motion.div
                    key={word}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-2 rounded text-center font-semibold transition-all ${
                      isFound
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 line-through'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {word}
                    {isFound && <span className="ml-2">✓</span>}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Game Grid */}
          <div className="lg:col-span-3">
            <div className="relative">
              <div 
                className="grid gap-1 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg select-none"
                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
                onMouseLeave={() => {
                  if (isDragging) {
                    handleMouseUp();
                  }
                }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((letter, colIndex) => (
                    <motion.div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold rounded cursor-pointer transition-all
                        ${isCellFound(rowIndex, colIndex)
                          ? 'bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200'
                          : isCellSelected(rowIndex, colIndex)
                          ? 'bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200'
                          : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }
                      `}
                      onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                      onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                      onMouseUp={handleMouseUp}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {letter}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Game Completion Overlay */}
              <AnimatePresence>
                {gameCompleted && (
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
                      <div className="text-3xl font-bold mb-2">Congratulations!</div>
                      <div className="text-lg mb-2">All words found!</div>
                      <div className="text-base">Time: {formatTime(timeElapsed)}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Instructions */}
            <div className="text-center text-sm text-muted-foreground mt-4">
              <p>Click and drag to select words horizontally, vertically, or diagonally</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-6">
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
        {gameCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-2 mt-4"
          >
            <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-800">
              <Trophy className="w-3 h-3 mr-1" />
              All Found!
            </Badge>
            {timeElapsed <= 120 && (
              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-800">
                <Star className="w-3 h-3 mr-1" />
                Speed Finder
              </Badge>
            )}
          </motion.div>
        )}
      </GlassCard>
    </div>
  );
}