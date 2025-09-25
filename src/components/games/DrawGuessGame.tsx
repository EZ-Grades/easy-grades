import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { LuxuryButton } from '../LuxuryButton';
import { GlassCard } from '../GlassCard';
import { CheckCircle, RotateCcw, Palette, Trash2, Sparkles, PartyPopper } from 'lucide-react';
interface DrawGuessGameProps {
  onComplete: () => void;
}

const drawingPrompts = [
  'cat', 'house', 'car', 'tree', 'sun', 'flower', 'bird', 'fish',
  'apple', 'star', 'moon', 'cloud', 'butterfly', 'dog', 'heart'
];

const TOTAL_ROUNDS = 5;

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
  const [timer, setTimer] = useState(45);

  // Brush cursor position
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Initialize round
  useEffect(() => {
    startNewRound();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) {
      simulateAIGuess();
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    if (isGuessing || gameComplete) clearInterval(interval);
    return () => clearInterval(interval);
  }, [timer, isGuessing, gameComplete]);

  const startNewRound = () => {
    const randomPrompt = drawingPrompts[Math.floor(Math.random() * drawingPrompts.length)];
    setCurrentPrompt(randomPrompt);
    setAiGuess('');
    setTimer(45);
    clearCanvas();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setCursorPos({ x, y });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (!isDrawing) return;
    ctx.lineTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setCursorPos(null);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
  };

  const simulateAIGuess = async () => {
    setIsGuessing(true);
    const thinkingTexts = ["Analyzing...", "Hmm...", "Could it be...", "Almost there..."];
    for (let t of thinkingTexts) {
      setAiGuess(t);
      await new Promise(r => setTimeout(r, 500));
    }

    // AI accuracy increases over rounds
    const accuracy = 0.5 + round * 0.1; 
    const correct = Math.random() < accuracy;
    if (correct) {
      setAiGuess(currentPrompt);
      setScore(prev => prev + 10);
    } else {
      const wrong = drawingPrompts.filter(p => p !== currentPrompt);
      setAiGuess(wrong[Math.floor(Math.random() * wrong.length)]);
    }

    setIsGuessing(false);

    if (round >= TOTAL_ROUNDS) {
      setGameComplete(true);
      setTimeout(onComplete, 2000);
    }
  };

  const nextRound = () => {
    setRound(prev => prev + 1);
    startNewRound();
  };

  const resetGame = () => {
    setRound(1);
    setScore(0);
    setGameComplete(false);
    startNewRound();
  };

  return (
    <GlassCard className="p-6 max-w-2xl mx-auto relative">
      {cursorPos && (
        <motion.div
          style={{
            position: 'absolute',
            top: cursorPos.y - brushSize,
            left: cursorPos.x - brushSize,
            width: brushSize * 2,
            height: brushSize * 2,
            borderRadius: '50%',
            background: brushColor,
            pointerEvents: 'none'
          }}
          animate={{ scale: 1 }}
        />
      )}

      {gameComplete && <PartyPopper width={400} height={300} />}

      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Draw & Guess</h2>
        <p className="text-muted-foreground mb-2">Draw the prompt and see if AI can guess it!</p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <span>Round: {round}/{TOTAL_ROUNDS}</span>
          <span>Score: {score}</span>
          <span>Time: {timer}s</span>
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="glass-card p-4 inline-block">
          <h3 className="text-lg font-semibold text-gradient-primary">
            Draw: <span className="capitalize">{currentPrompt}</span>
          </h3>
        </div>
      </div>

      {/* Canvas */}
      <div className="mb-6">
        <div className="border-2 border-border rounded-lg overflow-hidden mx-auto bg-white" style={{ width: 'fit-content' }}>
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            className="block cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Size:</span>
          <input type="range" min="1" max="10" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-20" />
          <span className="text-sm w-4">{brushSize}</span>
        </div>
        <LuxuryButton variant="outline" size="sm" onClick={clearCanvas} icon={<Trash2 className="w-4 h-4" />}>Clear</LuxuryButton>
      </div>

      {/* AI Guess */}
      {aiGuess && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
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
              <p className="text-red-500 mt-2">Not quite right! The answer was: <span className="capitalize font-medium">{currentPrompt}</span></p>
            )}
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex gap-3 justify-center flex-wrap">
        {!aiGuess && !isGuessing && !gameComplete && (
          <LuxuryButton variant="primary" onClick={simulateAIGuess} icon={<Sparkles className="w-4 h-4" />}>
            {isGuessing ? 'AI is thinking...' : 'Let AI Guess'}
          </LuxuryButton>
        )}
        {aiGuess && !gameComplete && round < TOTAL_ROUNDS && (
          <LuxuryButton variant="primary" onClick={nextRound}>
            Next Round ({round + 1}/{TOTAL_ROUNDS})
          </LuxuryButton>
        )}
        <LuxuryButton variant="outline" onClick={resetGame} icon={<RotateCcw className="w-4 h-4" />}>New Game</LuxuryButton>
      </div>
    </GlassCard>
  );
}
