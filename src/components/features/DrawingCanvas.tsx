import React, { useRef, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Palette, Eraser, RotateCcw, Download, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface DrawingCanvasProps {
  width?: number;
  height?: number;
}

export function DrawingCanvas({ width = 400, height = 300 }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#E8B4F8'); // Start with pastel lavender
  const [brushSize, setBrushSize] = useState(3);
  const [isErasing, setIsErasing] = useState(false);

  // Pinterest-inspired pastel color palette
  const colors = [
    '#E8B4F8', // Pastel lavender
    '#B4E8D1', // Pastel mint
    '#F8B4C6', // Pastel blush/rose
    '#F8E8B4', // Pastel baby yellow
    '#B4D4F8', // Pastel sky blue
    '#E8D4F8', // Pastel lilac
    '#F8D4B4', // Pastel peach
    '#D4F8B4', // Pastel lime
    '#F8B4E8', // Pastel pink
    '#B4F8E8'  // Pastel aqua
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set white background by default
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    // Set default drawing properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [width, height]);

  const getEventPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        return { x: 0, y: 0 };
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const { x, y } = getEventPos(e);

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const { x, y } = getEventPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    if (isErasing) {
      // Use white color to "erase" by drawing white over the area
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = brushSize * 2;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear everything and set white background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'my-drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Card className="glassmorphism border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Palette className="w-5 h-5 text-primary-solid" />
          </motion.div>
          <span className="text-gradient-primary">Creative Canvas</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pastel Color Palette */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Pastel Colors</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <motion.button
                key={color}
                whileHover={{ scale: 1.15, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setBrushColor(color);
                  setIsErasing(false);
                }}
                className={`w-8 h-8 rounded-full border-3 transition-all shadow-sm ${
                  brushColor === color && !isErasing
                    ? 'border-gray-800 dark:border-white scale-110 shadow-lg'
                    : 'border-white dark:border-gray-700 hover:shadow-md'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Brush Size:</label>
            <input
              type="range"
              min="1"
              max="12"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20 accent-primary-solid"
            />
            <span className="text-sm w-8 text-center font-mono">{brushSize}</span>
          </div>
          
          <Button
            size="sm"
            variant={isErasing ? "default" : "outline"}
            onClick={() => setIsErasing(!isErasing)}
            className={isErasing ? "gradient-secondary" : "hover:glow-secondary"}
          >
            <Eraser className="w-4 h-4 mr-1" />
            Eraser
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={clearCanvas}
            className="hover:glow-highlight"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear All
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={downloadCanvas}
            className="hover:glow-primary"
          >
            <Download className="w-4 h-4 mr-1" />
            Save
          </Button>
        </div>

        {/* Canvas */}
        <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl overflow-hidden bg-white shadow-inner">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="cursor-crosshair block w-full touch-none"
            style={{ maxWidth: '100%', height: 'auto', backgroundColor: '#FFFFFF' }}
          />
        </div>

        <p className="text-xs text-muted-foreground text-center italic">
          ✨ Express your creativity with soft pastel colors ✨
        </p>
      </CardContent>
    </Card>
  );
}