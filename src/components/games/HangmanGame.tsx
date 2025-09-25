import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LuxuryButton } from '../LuxuryButton';
import { GlassCard } from '../GlassCard';
import { CheckCircle, RotateCcw, AlertTriangle } from 'lucide-react';

interface HangmanGameProps {
  onComplete: () => void;
}

const words = [
  'JAVASCRIPT', 'PYTHON', 'COMPUTER', 'KEYBOARD', 'MONITOR', 'INTERNET',
  'BROWSER', 'WEBSITE', 'DATABASE', 'NETWORK', 'SECURITY', 'PASSWORD',
  'ALGORITHM', 'FUNCTION', 'VARIABLE', 'LIBRARY', 'FRAMEWORK', 'DEVELOPMENT'
];

const maxWrongGuesses = 8;
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Hangman SVG parts
const HangmanSVG = ({ wrong }: { wrong: number }) => (
  <svg viewBox="0 0 120 160" className="w-40 h-40 mx-auto">
    <line x1="10" y1="150" x2="110" y2="150" stroke="black" strokeWidth="4" />
    <line x1="30" y1="150" x2="30" y2="10" stroke="black" strokeWidth="4" />
    <line x1="30" y1="10" x2="80" y2="10" stroke="black" strokeWidth="4" />
    <line x1="80" y1="10" x2="80" y2="30" stroke="black" strokeWidth="4" />
    {wrong > 0 && <circle cx="80" cy="40" r="10" stroke="black" strokeWidth="3" fill="none" />}
    {wrong > 1 && <line x1="80" y1="50" x2="80" y2="90" stroke="black" strokeWidth="3" />}
    {wrong > 2 && <line x1="80" y1="60" x2="60" y2="80" stroke="black" strokeWidth="3" />}
    {wrong > 3 && <line x1="80" y1="60" x2="100" y2="80" stroke="black" strokeWidth="3" />}
    {wrong > 4 && <line x1="80" y1="90" x2="60" y2="110" stroke="black" strokeWidth="3" />}
    {wrong > 5 && <line x1="80" y1="90" x2="100" y2="110" stroke="black" strokeWidth="3" />}
  </svg>
);

export function HangmanGame({ onComplete }: HangmanGameProps) {
  const [currentWord, setCurrentWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGameStatus('playing');
  };

  const guessLetter = (letter: string) => {
    if (guessedLetters.has(letter) || gameStatus !== 'playing') return;
    const newGuessedLetters = new Set(guessedLetters).add(letter);
    setGuessedLetters(newGuessedLetters);

    if (!currentWord.includes(letter)) {
      const newWrong = wrongGuesses + 1;
      setWrongGuesses(newWrong);
      if (newWrong >= maxWrongGuesses) setGameStatus('lost');
    } else {
      const complete = currentWord.split('').every(char => newGuessedLetters.has(char));
      if (complete) {
        setScore(score + 10);
        setGameStatus('won');
      }
    }
  };

  const getDisplayWord = () =>
    currentWord.split('').map(l => (guessedLetters.has(l) ? l : '_')).join(' ');

  const nextRound = () => {
    if (round >= 3) {
      onComplete();
    } else {
      setRound(round + 1);
      startNewGame();
    }
  };

  return (
    <GlassCard className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Hangman</h2>
        <p className="text-muted-foreground mb-2">Round {round}/3 - Score: {score}</p>
      </div>

      <HangmanSVG wrong={wrongGuesses} />

      <div className="text-center text-3xl font-mono my-4">{getDisplayWord()}</div>

      <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-9 gap-2 mb-6">
        {alphabet.map(letter => (
          <motion.button
            key={letter}
            onClick={() => guessLetter(letter)}
            disabled={guessedLetters.has(letter) || gameStatus !== 'playing'}
            className={`aspect-square flex items-center justify-center font-medium rounded-lg
              transition-all duration-200 border-2
              ${guessedLetters.has(letter)
                ? currentWord.includes(letter)
                  ? 'bg-green-500/20 border-green-500 text-green-500'
                  : 'bg-red-500/20 border-red-500 text-red-500 opacity-50'
                : 'glass-card border-border hover:glow-primary hover:scale-105 cursor-pointer'
              }`}
            whileHover={!guessedLetters.has(letter) && gameStatus === 'playing' ? { scale: 1.05 } : {}}
            whileTap={!guessedLetters.has(letter) && gameStatus === 'playing' ? { scale: 0.95 } : {}}
          >
            {letter}
          </motion.button>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        {gameStatus !== 'playing' && (
          <LuxuryButton variant="primary" onClick={nextRound}>
            {round >= 3 ? 'Finish Game' : 'Next Word'}
          </LuxuryButton>
        )}
        <LuxuryButton variant="outline" onClick={startNewGame}>
          <RotateCcw className="w-4 h-4" /> New Word
        </LuxuryButton>
      </div>

      <AnimatePresence>
        {gameStatus === 'won' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="text-center mt-6"
          >
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-green-500">You guessed it!</h3>
            <p className="text-muted-foreground">{currentWord}</p>
          </motion.div>
        )}

        {gameStatus === 'lost' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="text-center mt-6"
          >
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-red-500">Game Over!</h3>
            <p className="text-muted-foreground">The word was: {currentWord}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
