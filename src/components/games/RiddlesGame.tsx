import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LuxuryButton } from '../LuxuryButton';
import { GlassCard } from '../GlassCard';
import { CheckCircle, RotateCcw, Lightbulb, ArrowRight } from 'lucide-react';

interface RiddlesGameProps {
  onComplete: () => void;
}

interface Riddle {
  question: string;
  answer: string;
  hint: string;
  options: string[];
}

const riddles: Riddle[] = [
  {
    question: "I'm tall when I'm young and short when I'm old. What am I?",
    answer: "Candle",
    hint: "I give light and melt as I'm used",
    options: ["Tree", "Candle", "Person", "Building"]
  },
  {
    question: "What has keys but no locks, space but no room, and you can enter but not go inside?",
    answer: "Keyboard",
    hint: "You use me to type",
    options: ["Piano", "Keyboard", "House", "Car"]
  },
  {
    question: "What gets wetter the more it dries?",
    answer: "Towel",
    hint: "You use me after a shower",
    options: ["Sponge", "Cloth", "Towel", "Paper"]
  },
  {
    question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
    answer: "Map",
    hint: "I show you directions and locations",
    options: ["Globe", "Map", "Book", "Picture"]
  },
  {
    question: "What can travel around the world while staying in a corner?",
    answer: "Stamp",
    hint: "I go on letters and packages",
    options: ["Stamp", "Coin", "Photo", "Sticker"]
  },
  {
    question: "What has hands but cannot clap?",
    answer: "Clock",
    hint: "I tell you what time it is",
    options: ["Robot", "Clock", "Statue", "Doll"]
  },
  {
    question: "What goes up but never comes down?",
    answer: "Age",
    hint: "Everyone has this and it increases over time",
    options: ["Balloon", "Age", "Temperature", "Prices"]
  },
  {
    question: "What has one eye but cannot see?",
    answer: "Needle",
    hint: "I'm used for sewing",
    options: ["Needle", "Cyclops", "Camera", "Button"]
  }
];

export function RiddlesGame({ onComplete }: RiddlesGameProps) {
  const [currentRiddleIndex, setCurrentRiddleIndex] = useState<number>(0);
  const [usedRiddles, setUsedRiddles] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const pickNewRiddleIndex = (): number | undefined => {
    const availableIndexes = riddles
      .map((_, i) => i)
      .filter(i => !usedRiddles.includes(i));

    if (availableIndexes.length === 0) return undefined;

    const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    setUsedRiddles([...usedRiddles, randomIndex]);
    return randomIndex;
  };

  const nextRiddle = () => {
    const nextIndex = pickNewRiddleIndex();
    if (nextIndex !== undefined) {
      setCurrentRiddleIndex(nextIndex);
      setSelectedAnswer('');
      setShowResult(false);
      setShowHint(false);
    } else {
      setGameComplete(true);
      setTimeout(onComplete, 1500);
    }
  };

  const resetGame = () => {
    setUsedRiddles([]);
    const firstIndex = Math.floor(Math.random() * riddles.length);
    setCurrentRiddleIndex(firstIndex);
    setSelectedAnswer('');
    setShowResult(false);
    setScore(0);
    setShowHint(false);
    setGameComplete(false);
    setUsedRiddles([firstIndex]);
  };

  const currentRiddle = riddles[currentRiddleIndex];
  const isCorrect = selectedAnswer === currentRiddle.answer;

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    if (answer === currentRiddle.answer) setScore(score + 10);
  };

  useEffect(() => {
    // Initialize first riddle randomly
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GlassCard className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Brain Riddles</h2>
        <p className="text-muted-foreground mb-2">Test your wit with these challenging riddles</p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <span>Riddle {usedRiddles.length}/{riddles.length}</span>
          <span>Score: {score}/{riddles.length * 10}</span>
        </div>
      </div>

      {/* Current Riddle */}
      <div className="mb-8">
        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-medium text-center mb-4">{currentRiddle.question}</h3>

          {/* Hint */}
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4"
            >
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-500 mb-1">Hint:</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">{currentRiddle.hint}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {currentRiddle.options.map((option, idx) => {
            let buttonClass = 'glass-card border-border hover:glow-primary';
            if (showResult) {
              if (option === currentRiddle.answer) buttonClass = 'bg-green-500/20 border-green-500 text-green-500 glow-green';
              else if (option === selectedAnswer && option !== currentRiddle.answer) buttonClass = 'bg-red-500/20 border-red-500 text-red-500';
              else buttonClass = 'glass-card border-border opacity-50';
            }
            return (
              <motion.button
                key={idx}
                onClick={() => handleAnswerSelect(option)}
                disabled={showResult}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${buttonClass}`}
                whileHover={!showResult ? { scale: 1.02 } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
              >
                <span className="font-medium">{option}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Result Message */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            {isCorrect ? (
              <div className="flex items-center justify-center gap-2 text-green-500">
                <CheckCircle className="w-6 h-6" />
                <span className="font-semibold">Correct! +10 points</span>
              </div>
            ) : (
              <div className="text-red-500">
                <p className="font-semibold">Not quite right!</p>
                <p className="text-sm">The answer was: {currentRiddle.answer}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Game Complete */}
      {gameComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-6"
        >
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-green-500">All Riddles Complete!</h3>
          <p className="text-muted-foreground">
            Final Score: {score}/{riddles.length * 10} ({Math.round((score / (riddles.length * 10)) * 100)}%)
          </p>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        {!showResult && !gameComplete && (
          <LuxuryButton variant="outline" onClick={() => setShowHint(!showHint)} icon={<Lightbulb className="w-4 h-4" />}>
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </LuxuryButton>
        )}

        {showResult && !gameComplete && (
          <LuxuryButton variant="primary" onClick={nextRiddle} icon={<ArrowRight className="w-4 h-4" />}>
            Next Riddle
          </LuxuryButton>
        )}

        <LuxuryButton variant="outline" onClick={resetGame} icon={<RotateCcw className="w-4 h-4" />}>
          New Game
        </LuxuryButton>
      </div>
    </GlassCard>
  );
}
