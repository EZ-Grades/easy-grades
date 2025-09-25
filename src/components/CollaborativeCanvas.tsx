import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Brush, RotateCcw, Save, Download, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

interface CollaborativeCanvasProps {
  width?: number;
  height?: number;
  className?: string;
  participantCount?: number;
}

interface DrawingStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  brushSize: number;
  userId: string;
}

export function CollaborativeCanvas({ 
  width = 800, 
  height = 400, 
  className = '',
  participantCount = 1 
}: CollaborativeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [selectedColor, setSelectedColor] = useState('#7D4AE1');
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);

  const colors = [
    '#7D4AE1', // Primary purple
    '#3AB0A0', // Secondary teal
    '#FFCB6B', // Highlight yellow
    '#E76F51', // Error red
    '#000000', // Black
    '#FFFFFF', // White
    '#6B7280', // Gray
    '#10B981', // Green
    '#F59E0B', // Orange
    '#EF4444', // Red
  ];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;

    // Clear canvas with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Redraw all strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    [...strokes, currentStroke].filter(Boolean).forEach((stroke) => {
      if (!stroke || stroke.points.length < 2) return;

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.brushSize;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  }, [strokes, currentStroke]);

  // Redraw canvas when strokes change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];

    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (pos: { x: number; y: number }) => {
    setIsDrawing(true);
    const newStroke: DrawingStroke = {
      id: Date.now().toString(),
      points: [pos],
      color: selectedColor,
      brushSize: brushSize,
      userId: 'current-user',
    };
    setCurrentStroke(newStroke);
  };

  const draw = (pos: { x: number; y: number }) => {
    if (!isDrawing || !currentStroke) return;

    setCurrentStroke(prev => prev ? {
      ...prev,
      points: [...prev.points, pos]
    } : null);
  };

  const stopDrawing = () => {
    if (currentStroke && currentStroke.points.length > 1) {
      setStrokes(prev => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
    setIsDrawing(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pos = getMousePos(e);
    startDrawing(pos);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getMousePos(e);
    draw(pos);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pos = getTouchPos(e);
    startDrawing(pos);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getTouchPos(e);
    draw(pos);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke(null);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    toast.success('Canvas cleared!');
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `study-canvas-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.success('Canvas saved as image!');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drawing Tools */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-muted/20 rounded-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Brush className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Size:</span>
            <div className="w-20">
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--primary-solid) 0%, var(--primary-solid) ${((brushSize - 1) / 19) * 100}%, var(--muted) ${((brushSize - 1) / 19) * 100}%, var(--muted) 100%)`
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-6">{brushSize}px</span>
          </div>

          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Color:</span>
            <div className="flex gap-1 flex-wrap">
              {colors.map((color) => (
                <motion.button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? 'border-primary-solid scale-110 shadow-lg'
                      : 'border-white/20 hover:border-white/50'
                  }`}
                  style={{ backgroundColor: color }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={clearCanvas}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={saveCanvas}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full bg-white dark:bg-gray-50 rounded-lg border-2 border-muted-foreground/20 cursor-crosshair touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ maxHeight: height }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-lg pointer-events-none" />
        
        {/* Collaborative Indicators */}
        {participantCount > 1 && (
          <motion.div
            className="absolute top-4 left-4 flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            ✏️ {participantCount - 1} others drawing
          </motion.div>
        )}

        {/* Drawing indicator */}
        {isDrawing && (
          <motion.div
            className="absolute top-4 right-4 flex items-center gap-1 bg-primary-solid text-white px-2 py-1 rounded-full text-xs"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            🎨 You're drawing
          </motion.div>
        )}
      </div>

      <div className="text-xs text-muted-foreground text-center">
        💡 Draw together in real-time! Everyone can see your strokes as you create them.
      </div>
    </div>
  );
}