import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { LuxuryButton } from '../LuxuryButton';
import { GlassCard } from '../GlassCard';
import { CheckCircle, RotateCcw, Palette, Trash2, Sparkles } from 'lucide-react';

interface DrawGuessGameProps {
  onComplete: () => void;
}

const drawingPrompts = [
  'cat', 'house', 'car', 'tree', 'sun', 'flower', 'bird', 'fish', 
  'apple', 'star', 'moon', 'cloud', 'butterfly', 'dog', 'heart'
];

export function DrawGuessGame({ onComplete }: DrawGuessGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [aiGuess, setAiGuess] = useState('');
  const [isGuessing, setIsGuessing] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameComplete, setGameComplete] = useState(false);
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#000000');

  useEffect(() => {
    startNewRound();
  }, []);

  const startNewRound = () => {
    const randomPrompt = drawingPrompts[Math.floor(Math.random() * drawingPrompts.length)];
    setCurrentPrompt(randomPrompt);
    setAiGuess('');
    clearCanvas();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = brushColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const simulateAIGuess = async () => {
    setIsGuessing(true);
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simple AI simulation - sometimes gets it right, sometimes wrong
    const accuracy = 0.6; // 60% accuracy for more challenge
    const isCorrect = Math.random() < accuracy;
    
    if (isCorrect) {
      setAiGuess(currentPrompt);
      setScore(score + 10);
    } else {
      // Pick a random wrong answer
      const wrongAnswers = drawingPrompts.filter(p => p !== currentPrompt);
      const wrongGuess = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
      setAiGuess(wrongGuess);
    }
    
    setIsGuessing(false);
    
    // Check if game is complete
    if (round >= 3) {
      setGameComplete(true);
      setTimeout(onComplete, 2000);
    }
  };

  const nextRound = () => {
    setRound(round + 1);
    startNewRound();
  };

  const resetGame = () => {
    setRound(1);
    setScore(0);
    setGameComplete(false);
    startNewRound();
  };

  // Initialize canvas with white background
  useEffect(() => {
    clearCanvas();
  }, []);

  return (
    <GlassCard className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Draw & Guess</h2>
        <p className="text-muted-foreground mb-2">Draw the prompt and see if AI can guess it!</p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <span>Round: {round}/3</span>
          <span>Score: {score}</span>
        </div>
      </div>

      {/* Current Prompt */}
      <div className="text-center mb-6">
        <div className="glass-card p-4 inline-block">
          <h3 className="text-lg font-semibold text-gradient-primary">
            Draw: <span className="capitalize">{currentPrompt}</span>
          </h3>
        </div>
      </div>

      {/* Drawing Canvas */}
      <div className="mb-6">
        <div className="border-2 border-border rounded-lg overflow-hidden mx-auto bg-white" style={{ width: 'fit-content' }}>
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            className="block cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </div>

      {/* Drawing Controls */}
      <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="w-8 h-8 rounded border-0 cursor-pointer"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm">Size:</span>
          <input
            type="range"
            min="1"
            max="10"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm w-4">{brushSize}</span>
        </div>
        
        <LuxuryButton
          variant="outline"
          size="sm"
          onClick={clearCanvas}
          icon={<Trash2 className="w-4 h-4" />}
        >
          Clear
        </LuxuryButton>
      </div>

      {/* AI Guess Section */}
      {aiGuess && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className={`glass-card p-4 ${aiGuess === currentPrompt ? 'ring-2 ring-green-500' : 'ring-2 ring-red-500'}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary-solid" />
              <h4 className="font-semibold">AI Guess:</h4>
            </div>
            <p className={`text-lg capitalize ${aiGuess === currentPrompt ? 'text-green-500' : 'text-red-500'}`}>
              {aiGuess}
            </p>
            {aiGuess === currentPrompt ? (
              <div className="flex items-center justify-center gap-2 mt-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-500 font-medium">Correct! +10 points</span>
              </div>
            ) : (
              <p className="text-red-500 mt-2">
                Not quite right! The answer was: <span className="capitalize font-medium">{currentPrompt}</span>
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Game Complete */}
      {gameComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-6"
        >
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-green-500">Game Complete!</h3>
          <p className="text-muted-foreground">Final Score: {score}/30</p>
          <p className="text-sm text-muted-foreground">
            {score >= 25 ? "Amazing artist! 🎨" : 
             score >= 15 ? "Great creativity! ✨" : 
             "Keep practicing your drawing! 🖌️"}
          </p>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex gap-3 justify-center flex-wrap">
        {!aiGuess && !isGuessing && !gameComplete && (
          <LuxuryButton
            variant="primary"
            onClick={simulateAIGuess}
            disabled={isGuessing}
            icon={<Sparkles className="w-4 h-4" />}
          >
            {isGuessing ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                />
                AI is thinking...
              </span>
            ) : (
              'Let AI Guess'
            )}
          </LuxuryButton>
        )}
        
        {aiGuess && !gameComplete && round < 3 && (
          <LuxuryButton
            variant="primary"
            onClick={nextRound}
          >
            Next Round ({round + 1}/3)
          </LuxuryButton>
        )}
        
        <LuxuryButton
          variant="outline"
          onClick={resetGame}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          New Game
        </LuxuryButton>
      </div>
    </GlassCard>
  );
}