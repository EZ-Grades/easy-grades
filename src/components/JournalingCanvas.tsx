import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Star, Heart, Moon, Sun, Leaf, Cherry, Flower, Crown, 
  Anchor, Flag, Skull, Ship, Gift, Snowflake, Cloud, BookOpen, 
  Coffee, Camera, Ghost, Cat, Dog, Diamond, Key, Music as MusicNote, 
  Download, Undo, Redo, Trash2, X, RotateCw, ZoomIn, ZoomOut, 
  Ribbon, Wand2, PartyPopper, Flame, Lightbulb
} from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../hooks/useAuth';
import html2canvas from 'html2canvas';

interface Sticker {
  id: string;
  icon: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface JournalEntry {
  id: string;
  text: string;
  stickers: Sticker[];
  created_at: Date;
  updated_at: Date;
}

const STICKER_ICONS = [
  { name: 'Sparkles', Icon: Sparkles, color: 'text-yellow-500' },
  { name: 'Star', Icon: Star, color: 'text-yellow-400' },
  { name: 'Heart', Icon: Heart, color: 'text-red-500' },
  { name: 'Moon', Icon: Moon, color: 'text-indigo-400' },
  { name: 'Sun', Icon: Sun, color: 'text-orange-500' },
  { name: 'Leaf', Icon: Leaf, color: 'text-green-500' },
  { name: 'Cherry', Icon: Cherry, color: 'text-red-400' },
  { name: 'Flower', Icon: Flower, color: 'text-pink-500' },
  { name: 'Crown', Icon: Crown, color: 'text-yellow-600' },
  { name: 'Anchor', Icon: Anchor, color: 'text-blue-600' },
  { name: 'Flag', Icon: Flag, color: 'text-purple-500' },
  { name: 'Skull', Icon: Skull, color: 'text-gray-600' },
  { name: 'Ship', Icon: Ship, color: 'text-blue-500' },
  { name: 'Balloon', Icon: PartyPopper, color: 'text-pink-400' },
  { name: 'Gift', Icon: Gift, color: 'text-purple-600' },
  { name: 'Fireworks', Icon: PartyPopper, color: 'text-orange-400' },
  { name: 'Lantern', Icon: Lightbulb, color: 'text-amber-500' },
  { name: 'Snowflake', Icon: Snowflake, color: 'text-cyan-400' },
  { name: 'Cloud', Icon: Cloud, color: 'text-blue-300' },
  { name: 'BookOpen', Icon: BookOpen, color: 'text-amber-800' },
  { name: 'Coffee', Icon: Coffee, color: 'text-amber-700' },
  { name: 'Camera', Icon: Camera, color: 'text-gray-700' },
  { name: 'Ghost', Icon: Ghost, color: 'text-purple-300' },
  { name: 'Cat', Icon: Cat, color: 'text-orange-600' },
  { name: 'Wolf', Icon: Dog, color: 'text-gray-700' },
  { name: 'Diamond', Icon: Diamond, color: 'text-cyan-500' },
  { name: 'Key', Icon: Key, color: 'text-yellow-700' },
  { name: 'MusicNote', Icon: MusicNote, color: 'text-purple-500' },
  { name: 'Bow', Icon: Ribbon, color: 'text-pink-600' },
  { name: 'MagicWand', Icon: Wand2, color: 'text-purple-400' },
];

export function JournalingCanvas() {
  const [text, setText] = useState('');
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [draggedSticker, setDraggedSticker] = useState<string | null>(null);
  const [history, setHistory] = useState<JournalEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showStickerPalette, setShowStickerPalette] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  // Load journal entry from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('journal_entry');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setText(parsed.text || '');
        setStickers(parsed.stickers || []);
      } catch (err) {
        console.error('Error loading journal entry:', err);
      }
    }
  }, []);

  // Autosave to localStorage (and database for authenticated users)
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      const entry = {
        text,
        stickers,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem('journal_entry', JSON.stringify(entry));
      
      // TODO: Add database save for authenticated users
      // if (user) {
      //   autosaveJournal(null, {
      //     title: 'Focus Mode Journal',
      //     content_text: text,
      //     canvas_data: { stickers }
      //   });
      // }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [text, stickers, user]);

  // Add to history for undo/redo
  const addToHistory = useCallback(() => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      text,
      stickers: JSON.parse(JSON.stringify(stickers)),
      created_at: new Date(),
      updated_at: new Date(),
    };

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newEntry);
      return newHistory.slice(-20); // Keep last 20 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 19));
  }, [text, stickers, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setText(prevState.text);
      setStickers(prevState.stickers);
      setHistoryIndex(prev => prev - 1);
      toast.success('Undone');
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setText(nextState.text);
      setStickers(nextState.stickers);
      setHistoryIndex(prev => prev + 1);
      toast.success('Redone');
    }
  };

  const addSticker = (iconName: string) => {
    const newSticker: Sticker = {
      id: `${iconName}-${Date.now()}`,
      icon: iconName,
      x: Math.random() * 60 + 20, // 20-80% of width
      y: Math.random() * 60 + 20, // 20-80% of height
      scale: 1,
      rotation: 0,
    };

    setStickers(prev => [...prev, newSticker]);
    addToHistory();
    toast.success('Sticker added!');
  };

  const removeSticker = (id: string) => {
    setStickers(prev => prev.filter(s => s.id !== id));
    setSelectedSticker(null);
    addToHistory();
    toast.success('Sticker removed');
  };

  const updateSticker = (id: string, updates: Partial<Sticker>) => {
    setStickers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleStickerDragStart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggedSticker(id);
    setSelectedSticker(id);
  };

  const handleStickerDrag = useCallback((e: MouseEvent) => {
    if (!draggedSticker || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    updateSticker(draggedSticker, {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }, [draggedSticker]);

  const handleStickerDragEnd = useCallback(() => {
    if (draggedSticker) {
      setDraggedSticker(null);
      addToHistory();
    }
  }, [draggedSticker, addToHistory]);

  useEffect(() => {
    if (draggedSticker) {
      document.addEventListener('mousemove', handleStickerDrag);
      document.addEventListener('mouseup', handleStickerDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleStickerDrag);
        document.removeEventListener('mouseup', handleStickerDragEnd);
      };
    }
  }, [draggedSticker, handleStickerDrag, handleStickerDragEnd]);

  const exportAsPNG = async () => {
    if (!canvasRef.current) return;

    try {
      toast.info('Preparing export...');
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `journal-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success('Journal exported as PNG!');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export journal');
    }
  };

  const clearCanvas = () => {
    if (confirm('Are you sure you want to clear everything?')) {
      setText('');
      setStickers([]);
      setSelectedSticker(null);
      addToHistory();
      toast.success('Canvas cleared');
    }
  };

  const selectedStickerData = stickers.find(s => s.id === selectedSticker);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="glassmorphism p-4">
        <div className="flex flex-wrap items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStickerPalette(!showStickerPalette)}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {showStickerPalette ? 'Hide' : 'Show'} Stickers
            </Button>
          </motion.div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsPNG}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export PNG
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCanvas}
              className="gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Sticker Palette */}
      <AnimatePresence>
        {showStickerPalette && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="glassmorphism p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Sticker Palette
              </h3>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {STICKER_ICONS.map(({ name, Icon, color }) => (
                  <motion.button
                    key={name}
                    onClick={() => addSticker(name)}
                    className={`
                      p-3 rounded-lg border-2 border-transparent
                      hover:border-purple-500/50 hover:bg-purple-500/10
                      transition-all duration-200
                      ${color}
                    `}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title={name}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Journal Canvas */}
      <Card className="glassmorphism relative overflow-hidden min-h-[600px]">
        <div
          ref={canvasRef}
          className="relative bg-gradient-to-br from-white/50 to-purple-50/30 dark:from-slate-900/50 dark:to-purple-900/20 p-8 min-h-[600px]"
          onClick={() => setSelectedSticker(null)}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }} />
          </div>

          {/* Text Area */}
          <div className="relative z-10 mb-6">
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                addToHistory();
              }}
              placeholder="Write your thoughts here... ✨"
              className="min-h-[300px] text-lg bg-transparent border-0 focus-visible:ring-0 resize-none"
              style={{ fontFamily: 'Georgia, serif' }}
            />
          </div>

          {/* Stickers Layer */}
          <div className="absolute inset-0 pointer-events-none">
            {stickers.map((sticker) => {
              const stickerIcon = STICKER_ICONS.find(s => s.name === sticker.icon);
              if (!stickerIcon) return null;

              const { Icon, color } = stickerIcon;
              const isSelected = selectedSticker === sticker.id;

              return (
                <motion.div
                  key={sticker.id}
                  className={`
                    absolute pointer-events-auto cursor-move
                    ${isSelected ? 'z-50' : 'z-10'}
                  `}
                  style={{
                    left: `${sticker.x}%`,
                    top: `${sticker.y}%`,
                    transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
                  }}
                  onMouseDown={(e) => handleStickerDragStart(sticker.id, e)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSticker(sticker.id);
                  }}
                  whileHover={{ scale: sticker.scale * 1.1 }}
                  animate={isSelected ? { scale: [sticker.scale, sticker.scale * 1.05, sticker.scale] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`
                    relative p-2 rounded-lg transition-all
                    ${isSelected ? 'bg-purple-500/20 ring-2 ring-purple-500' : ''}
                  `}>
                    <Icon className={`w-8 h-8 ${color} drop-shadow-lg`} />
                    
                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSticker(sticker.id);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Sticker Controls (when selected) */}
      <AnimatePresence>
        {selectedStickerData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="glassmorphism p-4">
              <h3 className="font-medium mb-3">Sticker Controls</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Scale */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <ZoomIn className="w-4 h-4" />
                    Size: {Math.round(selectedStickerData.scale * 100)}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={selectedStickerData.scale * 100}
                    onChange={(e) => {
                      updateSticker(selectedStickerData.id, {
                        scale: parseInt(e.target.value) / 100
                      });
                    }}
                    onMouseUp={addToHistory}
                    className="w-full"
                  />
                </div>

                {/* Rotation */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <RotateCw className="w-4 h-4" />
                    Rotation: {selectedStickerData.rotation}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedStickerData.rotation}
                    onChange={(e) => {
                      updateSticker(selectedStickerData.id, {
                        rotation: parseInt(e.target.value)
                      });
                    }}
                    onMouseUp={addToHistory}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-save indicator */}
      <div className="text-center text-xs text-muted-foreground">
        💾 Auto-saving to local storage
        {user && ' • Sync with account coming soon'}
      </div>
    </div>
  );
}
