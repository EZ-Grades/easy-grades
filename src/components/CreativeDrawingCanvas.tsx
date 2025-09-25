/**
 * Creative Drawing Canvas Component
 * 
 * A simple drawing canvas for the creativity center
 * with brush size, colors, and clearing functionality
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Brush, 
  Eraser, 
  RotateCcw, 
  Save, 
  Palette,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface CreativeDrawingCanvasProps {
  isOpen: boolean;
  onClose: () => void;
}

const BRUSH_COLORS = [
  '#7D4AE1', // Primary
  '#3AB0A0', // Secondary  
  '#FFCB6B', // Highlight
  '#E76F51', // Error
  '#FF6B9D', // Pink
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#000000', // Black
  '#FFFFFF'  // White
];

export function CreativeDrawingCanvas({ isOpen, onClose }: CreativeDrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState([5]);
  const [brushColor, setBrushColor] = useState('#7D4AE1');
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set canvas size
        canvas.width = 800;
        canvas.height = 600;
        
        // Set initial canvas background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set drawing properties
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize[0];
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawing = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `ez-grades-drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-gradient-primary">Creative Drawing Canvas</DialogTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex gap-4">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 p-4 bg-muted/20 rounded-lg">
            {/* Tools */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Tools</h4>
              <div className="flex flex-col gap-2">
                <Button
                  variant={tool === 'brush' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTool('brush')}
                >
                  <Brush className="w-4 h-4 mr-2" />
                  Brush
                </Button>
                <Button
                  variant={tool === 'eraser' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTool('eraser')}
                >
                  <Eraser className="w-4 h-4 mr-2" />
                  Eraser
                </Button>
              </div>
            </div>

            {/* Brush Size */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Size: {brushSize[0]}px</h4>
              <Slider
                value={brushSize}
                onValueChange={setBrushSize}
                min={1}
                max={50}
                step={1}
                className="w-32"
              />
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Colors</h4>
              <div className="grid grid-cols-3 gap-2">
                {BRUSH_COLORS.map((color) => (
                  <motion.button
                    key={color}
                    onClick={() => setBrushColor(color)}
                    className={`
                      w-8 h-8 rounded-full border-2 transition-all duration-200
                      ${brushColor === color ? 'border-primary-solid scale-110' : 'border-border'}
                    `}
                    style={{ backgroundColor: color }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Actions</h4>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={clearCanvas}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button variant="outline" size="sm" onClick={saveDrawing}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1">
            <motion.canvas
              ref={canvasRef}
              className="border-2 border-border rounded-lg cursor-crosshair bg-white"
              style={{ maxWidth: '100%', maxHeight: '600px' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Click and drag to draw • Use the eraser tool to remove parts • Save your artwork when finished
        </div>
      </DialogContent>
    </Dialog>
  );
}