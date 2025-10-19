import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Download, 
  Undo, 
  Redo, 
  Trash2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Type,
  Palette,
  Move,
  Maximize2
} from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import html2canvas from 'html2canvas';

interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface JournalState {
  text: string;
  stickers: Sticker[];
}

interface FocusJournalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialText?: string;
  onSave?: (content: string) => void;
  embedded?: boolean; // New prop for embedded mode
  className?: string;
}

// Aesthetic sticker collection - Comprehensive emoji library
const STICKER_CATEGORIES = {
  animals: [
    '🐰', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵',
    '🐶', '🐱', '🦊', '🦝', '🐭', '🐹', '🦄', '🦋', '🐝', '🐞',
    '🦢', '🦩', '🦚', '🐥', '🐣', '🦆', '🐧', '🦉', '🦜', '🐢',
    '🦎', '🐍', '🐊', '🦕', '🦖', '🐙', '🦑', '🦐', '🦞', '🦀',
    '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🦭', '🦦',
    '🦥', '🦘', '🦌', '🐪', '🐫', '🦙', '🦒', '🐘', '🦏', '🦛'
  ],
  nature: [
    '🌸', '🌺', '🌻', '🌷', '🌹', '🏵️', '💐', '🌼', '🌿', '🍀',
    '🌱', '🌾', '🌵', '🌴', '🌳', '🌲', '🍁', '🍂', '🍃', '🪴',
    '🌾', '☘️', '🎋', '🎍', '🪷', '🌕', '🌙', '⭐', '✨', '💫',
    '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌚', '🌝', '🌛',
    '🌜', '🌞', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️',
    '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '🌪️', '🌫️', '🌈'
  ],
  hearts: [
    '💗', '💖', '💕', '💓', '💞', '💝', '❤️', '🧡', '💛', '💚',
    '💙', '💜', '🤍', '🤎', '🖤', '❣️', '💔', '❤️‍🔥', '💘', '💌',
    '💟', '♥️', '💑', '💏', '👩‍❤️‍👨', '👨‍❤️‍👨', '👩‍❤️‍👩', '💋', '💍', '💐'
  ],
  celestial: [
    '⭐', '🌟', '✨', '💫', '🌠', '☀️', '🌤️', '⛅', '🌥️', '☁️',
    '🌦️', '🌈', '🌙', '🌛', '🌜', '🌚', '🌝', '🌞', '⚡', '🔥',
    '💥', '✴️', '🌃', '🌌', '🌉', '🌁', '🪐', '🌎', '🌍', '🌏',
    '🔆', '🔅', '☄️', '🌪️', '🌊', '💧', '💦', '☔', '⛱️', '🌂'
  ],
  food: [
    '🍓', '🍒', '🍑', '🍊', '🍋', '🍌', '🍉', '🍇', '🍈', '🍏',
    '🍎', '🍐', '🥝', '🍍', '🥥', '🫐', '🍰', '🧁', '🍪', '🍩',
    '🍦', '🍨', '🍧', '🥧', '🎂', '🍮', '🍭', '🍬', '🍫', '🍯',
    '🍿', '🧈', '🧂', '🧇', '🥞', '🥖', '🥨', '🥯', '🥐', '🍞',
    '🥗', '🥙', '🥪', '🌮', '🌯', '🫔', '🥚', '🍳', '🧀', '🍕',
    '🍔', '🍟', '🌭', '🥓', '🍖', '🍗', '🥩', '🍱', '🍘', '🍙'
  ],
  decorative: [
    '🎀', '🎁', '🎈', '🎉', '🎊', '🎋', '🎐', '🎏', '🪄', '💎',
    '👑', '🔮', '🪩', '🎨', '🖼️', '🌺', '🎭', '🎪', '🎠', '🎡',
    '🎢', '🎪', '🗿', '🏛️', '⛩️', '🕌', '🛕', '🗼', '🗽', '🎑',
    '🧵', '🧶', '🪡', '🪢', '🧸', '🪆', '🖼️', '🪭', '🎀', '🎗️'
  ],
  faces: [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚',
    '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭',
    '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄',
    '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
    '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳'
  ],
  activities: [
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
    '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳',
    '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷',
    '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺',
    '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏊', '🤽', '🚣', '🧗', '🚴'
  ],
  objects: [
    '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💽', '💾', '💿',
    '📀', '📷', '📸', '📹', '🎥', '📞', '☎️', '📟', '📠', '📺',
    '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⏳',
    '⌛', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️',
    '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰'
  ],
  symbols: [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '✨', '⭐',
    '🌟', '💫', '💥', '💦', '💨', '💢', '💬', '💭', '💤', '💮',
    '♨️', '💈', '🛑', '🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕',
    '✅', '☑️', '✔️', '✖️', '❌', '➕', '➖', '➗', '✏️', '📝'
  ],
  travel: [
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
    '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵',
    '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟',
    '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇',
    '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🚁', '🛰️', '🚀'
  ],
  clothes: [
    '👕', '👔', '👗', '👘', '🥻', '🩱', '🩲', '🩳', '👙', '👚',
    '👛', '👜', '👝', '🎒', '🩴', '👞', '👟', '🥾', '🥿', '👠',
    '👡', '👢', '👑', '👒', '🎩', '🎓', '🧢', '⛑️', '🪖', '💄',
    '💍', '💼', '🩸', '🦴', '🦷', '🦾', '🦿', '👣', '🧠', '🫀'
  ],
  fantasy: [
    '🦄', '🐉', '🐲', '🧚', '🧜', '🧞', '🧝', '🧙', '🧛', '🧟',
    '👻', '👽', '👾', '🤖', '💀', '☠️', '👹', '👺', '🎃', '😈',
    '👿', '🔮', '🪄', '✨', '💫', '⭐', '🌟', '💥', '🔥', '💧'
  ]
};

// Get all categories for easy access
const ALL_CATEGORIES = Object.keys(STICKER_CATEGORIES) as Array<keyof typeof STICKER_CATEGORIES>;

function JournalContent({ 
  text, 
  setText, 
  stickers, 
  setStickers, 
  selectedSticker, 
  setSelectedSticker,
  history,
  setHistory,
  historyIndex,
  setHistoryIndex,
  onExport,
  onClear,
  embedded = false,
  canvasRef
}: {
  text: string;
  setText: (text: string) => void;
  stickers: Sticker[];
  setStickers: (stickers: Sticker[]) => void;
  selectedSticker: string | null;
  setSelectedSticker: (id: string | null) => void;
  history: JournalState[];
  setHistory: (history: JournalState[]) => void;
  historyIndex: number;
  setHistoryIndex: (index: number) => void;
  onExport: () => void;
  onClear: () => void;
  embedded?: boolean;
  canvasRef: React.RefObject<HTMLDivElement>;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<{ dist: number; angle: number; center: { x: number; y: number }; initialScale: number; initialRotation: number } | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const addToHistory = (newState: JournalState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex];
      setText(state.text);
      setStickers(state.stickers);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex];
      setText(state.text);
      setStickers(state.stickers);
    }
  };

  const addSticker = (emoji: string) => {
    const newSticker: Sticker = {
      id: `sticker-${Date.now()}-${Math.random()}`,
      emoji,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      scale: 100,
      rotation: 0
    };
    const newStickers = [...stickers, newSticker];
    setStickers(newStickers);
    setSelectedSticker(newSticker.id);
    addToHistory({ text, stickers: newStickers });
    toast.success('Sticker added! ✨');
  };

  const updateSticker = (id: string, updates: Partial<Sticker>) => {
    const newStickers = stickers.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    setStickers(newStickers);
  };

  const commitStickerUpdate = (id: string) => {
    addToHistory({ text, stickers });
    // Save notification happens automatically through the auto-save effect
  };

  const deleteSticker = (id: string) => {
    const newStickers = stickers.filter(s => s.id !== id);
    setStickers(newStickers);
    setSelectedSticker(null);
    addToHistory({ text, stickers: newStickers });
    toast.success('Sticker removed');
  };

  const handleStickerMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSticker(id);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedSticker) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      const sticker = stickers.find(s => s.id === selectedSticker);
      if (sticker) {
        updateSticker(selectedSticker, {
          x: sticker.x + dx,
          y: sticker.y + dy
        });
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging && selectedSticker) {
      commitStickerUpdate(selectedSticker);
    }
    setIsDragging(false);
  };

  // Mouse wheel handler for rotation (hold Shift) or scale (hold Ctrl/Cmd)
  const handleWheel = (e: React.WheelEvent, id: string) => {
    if (!selectedSticker || selectedSticker !== id) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const sticker = stickers.find(s => s.id === id);
    if (!sticker) return;
    
    if (e.shiftKey) {
      // Rotate with Shift + Wheel
      const rotationDelta = e.deltaY > 0 ? 5 : -5;
      const newRotation = (sticker.rotation + rotationDelta + 360) % 360;
      updateSticker(id, { rotation: newRotation });
      commitStickerUpdate(id);
    } else if (e.ctrlKey || e.metaKey) {
      // Scale with Ctrl/Cmd + Wheel
      const scaleDelta = e.deltaY > 0 ? -5 : 5;
      const newScale = Math.max(50, Math.min(300, sticker.scale + scaleDelta));
      updateSticker(id, { scale: newScale });
      commitStickerUpdate(id);
    }
  };

  // Touch gesture handlers
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchAngle = (touch1: React.Touch, touch2: React.Touch) => {
    return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180 / Math.PI;
  };

  const getTouchCenter = (touch1: React.Touch, touch2: React.Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    e.stopPropagation();
    setSelectedSticker(id);
    
    const sticker = stickers.find(s => s.id === id);
    if (!sticker) return;
    
    if (e.touches.length === 2) {
      // Two-finger gesture for pinch/rotate
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      const angle = getTouchAngle(e.touches[0], e.touches[1]);
      const center = getTouchCenter(e.touches[0], e.touches[1]);
      setTouchStart({ 
        dist, 
        angle, 
        center,
        initialScale: sticker.scale,
        initialRotation: sticker.rotation
      });
      setIsTransforming(true);
    } else if (e.touches.length === 1) {
      // Single finger for dragging
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!selectedSticker) return;
    
    const sticker = stickers.find(s => s.id === selectedSticker);
    if (!sticker) return;

    if (e.touches.length === 2 && touchStart) {
      // Pinch to zoom and rotate
      e.preventDefault();
      e.stopPropagation();
      
      const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
      const currentAngle = getTouchAngle(e.touches[0], e.touches[1]);
      
      // Calculate scale based on initial values, not cumulative changes
      const scaleRatio = currentDist / touchStart.dist;
      const newScale = Math.max(50, Math.min(300, touchStart.initialScale * scaleRatio));
      
      // Calculate rotation based on initial values
      const angleDiff = currentAngle - touchStart.angle;
      const newRotation = (touchStart.initialRotation + angleDiff + 360) % 360;
      
      updateSticker(selectedSticker, {
        scale: newScale,
        rotation: newRotation
      });
    } else if (e.touches.length === 1 && isDragging) {
      // Single finger drag
      const dx = e.touches[0].clientX - dragStart.x;
      const dy = e.touches[0].clientY - dragStart.y;
      
      updateSticker(selectedSticker, {
        x: sticker.x + dx,
        y: sticker.y + dy
      });
      
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = () => {
    if (selectedSticker) {
      commitStickerUpdate(selectedSticker);
    }
    setIsDragging(false);
    setTouchStart(null);
    setIsTransforming(false);
  };

  const rotateSticker = (id: string, direction: 'left' | 'right') => {
    const sticker = stickers.find(s => s.id === id);
    if (sticker) {
      const newRotation = direction === 'right' 
        ? (sticker.rotation + 15) % 360 
        : (sticker.rotation - 15 + 360) % 360;
      updateSticker(id, { rotation: newRotation });
      commitStickerUpdate(id);
    }
  };

  const scaleSticker = (id: string, direction: 'up' | 'down') => {
    const sticker = stickers.find(s => s.id === id);
    if (sticker) {
      const newScale = direction === 'up'
        ? Math.min(300, sticker.scale + 10)
        : Math.max(50, sticker.scale - 10);
      updateSticker(id, { scale: newScale });
      commitStickerUpdate(id);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    addToHistory({ text: newText, stickers });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl text-gradient-primary">Focus Journal</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleUndo} disabled={historyIndex === 0} title="Undo">
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRedo} disabled={historyIndex === history.length - 1} title="Redo">
              <Redo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="ghost" size="sm" onClick={onClear} title="Clear all">
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      )}

      {/* Embedded toolbar */}
      {embedded && (
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleUndo} disabled={historyIndex === 0} title="Undo">
              <Undo className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRedo} disabled={historyIndex === history.length - 1} title="Redo">
              <Redo className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onExport} title="Export">
              <Download className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClear} title="Clear">
              <Trash2 className="w-3 h-3 text-red-500" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sticker Sidebar */}
        <div className={`${embedded ? 'w-48' : 'w-64'} border-r bg-muted/30 flex flex-col overflow-hidden`}>
          <div className={`${embedded ? 'p-2' : 'p-4'} border-b flex-shrink-0`}>
            <h3 className={`flex items-center gap-2 ${embedded ? 'text-sm' : ''} mb-2`}>
              <Palette className={`${embedded ? 'w-3 h-3' : 'w-4 h-4'} text-purple-500`} />
              <span>Stickers</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              {embedded ? 'Tap & hold to resize/rotate' : 'Click to add • Drag to move • Pinch to resize'}
            </p>
          </div>

          <ScrollArea className="flex-1 overflow-auto">
            <Tabs defaultValue="animals" className="w-full">
              <TabsList className={`w-full grid grid-cols-3 ${embedded ? 'p-0.5' : 'p-1'}`}>
                <TabsTrigger value="animals" className="text-xs">🐰</TabsTrigger>
                <TabsTrigger value="nature" className="text-xs">🌸</TabsTrigger>
                <TabsTrigger value="hearts" className="text-xs">💗</TabsTrigger>
              </TabsList>

              <TabsContent value="animals" className={embedded ? 'p-1' : 'p-2'}>
                <div className={`grid ${embedded ? 'grid-cols-4 gap-1' : 'grid-cols-5 gap-2'}`}>
                  {STICKER_CATEGORIES.animals.map((emoji, i) => (
                    <motion.button
                      key={i}
                      onClick={() => addSticker(emoji)}
                      className={`${embedded ? 'text-xl p-1' : 'text-2xl p-2'} rounded-lg hover:bg-primary-solid/10 transition-all`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="nature" className={embedded ? 'p-1' : 'p-2'}>
                <div className={`grid ${embedded ? 'grid-cols-4 gap-1' : 'grid-cols-5 gap-2'}`}>
                  {STICKER_CATEGORIES.nature.map((emoji, i) => (
                    <motion.button
                      key={i}
                      onClick={() => addSticker(emoji)}
                      className={`${embedded ? 'text-xl p-1' : 'text-2xl p-2'} rounded-lg hover:bg-primary-solid/10 transition-all`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="hearts" className={embedded ? 'p-1' : 'p-2'}>
                <div className={`grid ${embedded ? 'grid-cols-4 gap-1' : 'grid-cols-5 gap-2'}`}>
                  {STICKER_CATEGORIES.hearts.map((emoji, i) => (
                    <motion.button
                      key={i}
                      onClick={() => addSticker(emoji)}
                      className={`${embedded ? 'text-xl p-1' : 'text-2xl p-2'} rounded-lg hover:bg-primary-solid/10 transition-all`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className={`${embedded ? 'p-1' : 'p-2'} space-y-3 mt-4`}>
              <div>
                <h4 className={`${embedded ? 'text-xs' : 'text-xs'} mb-2 px-2 text-muted-foreground`}>☀️ Celestial</h4>
                <div className={`grid ${embedded ? 'grid-cols-4 gap-1' : 'grid-cols-5 gap-2'}`}>
                  {STICKER_CATEGORIES.celestial.map((emoji, i) => (
                    <motion.button
                      key={i}
                      onClick={() => addSticker(emoji)}
                      className={`${embedded ? 'text-xl p-1' : 'text-2xl p-2'} rounded-lg hover:bg-primary-solid/10 transition-all`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className={`${embedded ? 'text-xs' : 'text-xs'} mb-2 px-2 text-muted-foreground`}>🍓 Food</h4>
                <div className={`grid ${embedded ? 'grid-cols-4 gap-1' : 'grid-cols-5 gap-2'}`}>
                  {STICKER_CATEGORIES.food.map((emoji, i) => (
                    <motion.button
                      key={i}
                      onClick={() => addSticker(emoji)}
                      className={`${embedded ? 'text-xl p-1' : 'text-2xl p-2'} rounded-lg hover:bg-primary-solid/10 transition-all`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className={`${embedded ? 'text-xs' : 'text-xs'} mb-2 px-2 text-muted-foreground`}>🎀 Decorative</h4>
                <div className={`grid ${embedded ? 'grid-cols-4 gap-1' : 'grid-cols-5 gap-2'}`}>
                  {STICKER_CATEGORIES.decorative.map((emoji, i) => (
                    <motion.button
                      key={i}
                      onClick={() => addSticker(emoji)}
                      className={`${embedded ? 'text-xl p-1' : 'text-2xl p-2'} rounded-lg hover:bg-primary-solid/10 transition-all`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className={`${embedded ? 'text-xs' : 'text-xs'} mb-2 px-2 text-muted-foreground`}>😀 Faces</h4>
                <div className={`grid ${embedded ? 'grid-cols-4 gap-1' : 'grid-cols-5 gap-2'}`}>
                  {STICKER_CATEGORIES.faces.map((emoji, i) => (
                    <motion.button
                      key={i}
                      onClick={() => addSticker(emoji)}
                      className={`${embedded ? 'text-xl p-1' : 'text-2xl p-2'} rounded-lg hover:bg-primary-solid/10 transition-all`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className={`${embedded ? 'text-xs' : 'text-xs'} mb-2 px-2 text-muted-foreground`}>⚽ Activities</h4>
                <div className={`grid ${embedded ? 'grid-cols-4 gap-1' : 'grid-cols-5 gap-2'}`}>
                  {STICKER_CATEGORIES.activities.map((emoji, i) => (
                    <motion.button
                      key={i}
                      onClick={() => addSticker(emoji)}
                      className={`${embedded ? 'text-xl p-1' : 'text-2xl p-2'} rounded-lg hover:bg-primary-solid/10 transition-all`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className={`${embedded ? 'text-xs' : 'text-xs'} mb-2 px-2 text-muted-foreground`}>📱 Objects</h4>
                <div className={`grid ${embedded ? 'grid-cols-4 gap-1' : 'grid-cols-5 gap-2'}`}>
                  {STICKER_CATEGORIES.objects.map((emoji, i) => (
                    <motion.button
                      key={i}
                      onClick={() => addSticker(emoji)}
                      className={`${embedded ? 'text-xl p-1' : 'text-2xl p-2'} rounded-lg hover:bg-primary-solid/10 transition-all`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className={`${embedded ? 'text-xs' : 'text-xs'} mb-2 px-2 text-muted-foreground`}>✨ Symbols</h4>
                <div className={`grid ${embedded ? 'grid-cols-4 gap-1' : 'grid-cols-5 gap-2'}`}>
                  {STICKER_CATEGORIES.symbols.map((emoji, i) => (
                    <motion.button
                      key={i}
                      onClick={() => addSticker(emoji)}
                      className={`${embedded ? 'text-xl p-1' : 'text-2xl p-2'} rounded-lg hover:bg-primary-solid/10 transition-all`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className={`${embedded ? 'text-xs' : 'text-xs'} mb-2 px-2 text-muted-foreground`}>🚗 Travel</h4>
                <div className={`grid ${embedded ? 'grid-cols-4 gap-1' : 'grid-cols-5 gap-2'}`}>
                  {STICKER_CATEGORIES.travel.map((emoji, i) => (
                    <motion.button
                      key={i}
                      onClick={() => addSticker(emoji)}
                      className={`${embedded ? 'text-xl p-1' : 'text-2xl p-2'} rounded-lg hover:bg-primary-solid/10 transition-all`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className={`${embedded ? 'text-xs' : 'text-xs'} mb-2 px-2 text-muted-foreground`}>👕 Clothes</h4>
                <div className={`grid ${embedded ? 'grid-cols-4 gap-1' : 'grid-cols-5 gap-2'}`}>
                  {STICKER_CATEGORIES.clothes.map((emoji, i) => (
                    <motion.button
                      key={i}
                      onClick={() => addSticker(emoji)}
                      className={`${embedded ? 'text-xl p-1' : 'text-2xl p-2'} rounded-lg hover:bg-primary-solid/10 transition-all`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className={`${embedded ? 'text-xs' : 'text-xs'} mb-2 px-2 text-muted-foreground`}>🦄 Fantasy</h4>
                <div className={`grid ${embedded ? 'grid-cols-4 gap-1' : 'grid-cols-5 gap-2'}`}>
                  {STICKER_CATEGORIES.fantasy.map((emoji, i) => (
                    <motion.button
                      key={i}
                      onClick={() => addSticker(emoji)}
                      className={`${embedded ? 'text-xl p-1' : 'text-2xl p-2'} rounded-lg hover:bg-primary-solid/10 transition-all`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div 
            ref={canvasRef}
            className="flex-1 relative bg-white dark:bg-gray-900 overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => setSelectedSticker(null)}
            style={{
              backgroundImage: `
                linear-gradient(rgba(200, 200, 200, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(200, 200, 200, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          >
            {/* Text Area */}
            <Textarea
              ref={textAreaRef}
              value={text}
              onChange={handleTextChange}
              placeholder="Write your thoughts, goals, and reflections here...&#10;&#10;✨ Express yourself freely&#10;💭 Add stickers for decoration&#10;🎨 Make it uniquely yours"
              className={`absolute inset-4 min-h-[calc(100%-2rem)] bg-transparent border-none resize-none focus:ring-0 ${embedded ? 'text-sm' : 'text-base'} leading-relaxed`}
              style={{ 
                zIndex: 1
              }}
            />

            {/* Stickers Layer */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
              <AnimatePresence>
                {stickers.map((sticker) => (
                  <motion.div
                    key={sticker.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={`absolute pointer-events-auto group ${
                      selectedSticker === sticker.id 
                        ? 'cursor-move' 
                        : 'cursor-pointer'
                    }`}
                    style={{
                      left: sticker.x,
                      top: sticker.y,
                      transformOrigin: 'center center',
                      padding: '12px',
                      touchAction: 'none',
                      minWidth: '48px',
                      minHeight: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseDown={(e) => handleStickerMouseDown(e, sticker.id)}
                    onTouchStart={(e) => handleTouchStart(e, sticker.id)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onWheel={(e) => handleWheel(e, sticker.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSticker(sticker.id);
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {/* Selection Border and Handles */}
                    {selectedSticker === sticker.id && (
                      <div 
                        className={`absolute inset-0 border-2 rounded-lg pointer-events-none transition-all ${
                          isTransforming 
                            ? 'border-pink-500 shadow-lg shadow-pink-500/50' 
                            : 'border-purple-500'
                        }`}
                      >
                        {/* Corner handles for visual feedback */}
                        <div className={`absolute -top-1 -left-1 rounded-full transition-all border-2 border-white shadow-lg ${
                          isTransforming ? 'bg-pink-500 w-4 h-4' : 'bg-purple-500 w-3 h-3'
                        }`}></div>
                        <div className={`absolute -top-1 -right-1 rounded-full transition-all border-2 border-white shadow-lg ${
                          isTransforming ? 'bg-pink-500 w-4 h-4' : 'bg-purple-500 w-3 h-3'
                        }`}></div>
                        <div className={`absolute -bottom-1 -left-1 rounded-full transition-all border-2 border-white shadow-lg ${
                          isTransforming ? 'bg-pink-500 w-4 h-4' : 'bg-purple-500 w-3 h-3'
                        }`}></div>
                        <div className={`absolute -bottom-1 -right-1 rounded-full transition-all border-2 border-white shadow-lg ${
                          isTransforming ? 'bg-pink-500 w-4 h-4' : 'bg-purple-500 w-3 h-3'
                        }`}></div>
                        
                        {/* Icon indicator */}
                        <div className={`absolute -top-10 left-1/2 -translate-x-1/2 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 whitespace-nowrap transition-all ${
                          isTransforming 
                            ? 'bg-pink-500 shadow-lg' 
                            : 'bg-purple-500'
                        }`}>
                          {isTransforming ? (
                            <>
                              <Maximize2 className="w-3 h-3" />
                              <span>Transforming...</span>
                            </>
                          ) : isDragging ? (
                            <>
                              <Move className="w-3 h-3" />
                              <span>Moving...</span>
                            </>
                          ) : (
                            <>
                              <Move className="w-3 h-3" />
                              <span className="hidden sm:inline">Drag • Pinch • Rotate</span>
                              <span className="sm:hidden">Touch to edit</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div 
                      className={`${embedded ? 'text-3xl' : 'text-4xl'} select-none transition-transform`}
                      style={{
                        transform: `scale(${sticker.scale / 100}) rotate(${sticker.rotation}deg)`,
                        transformOrigin: 'center center'
                      }}
                    >
                      {sticker.emoji}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Help hint when no stickers */}
              {stickers.length === 0 && !text && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
                  style={{ zIndex: 5 }}
                >
                  <div className="glassmorphism bg-purple-100/80 dark:bg-purple-900/80 p-6 rounded-2xl backdrop-blur-lg">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                    <h3 className="text-lg mb-2 text-purple-700 dark:text-purple-300">Start Journaling!</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Click stickers on the left to decorate<br />
                      Write your thoughts in the text area<br />
                      <span className="hidden sm:inline">Use mouse wheel or touch gestures to customize</span>
                      <span className="sm:hidden">Use touch gestures to customize</span>
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Sticker Controls */}
          <AnimatePresence>
            {selectedSticker && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className={`${embedded ? 'p-2' : 'p-4'} border-t bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`${embedded ? 'text-xs' : 'text-sm'} text-muted-foreground`}>Selected:</span>
                    <span className={embedded ? 'text-xl' : 'text-2xl'}>
                      {stickers.find(s => s.id === selectedSticker)?.emoji}
                    </span>
                    {!embedded && (
                      <div className="hidden lg:flex items-center gap-1 ml-2 text-xs text-muted-foreground">
                        <kbd className="px-1.5 py-0.5 bg-muted rounded">Shift</kbd>+<kbd className="px-1.5 py-0.5 bg-muted rounded">Wheel</kbd> = Rotate
                        <span className="mx-1">•</span>
                        <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 bg-muted rounded">Wheel</kbd> = Scale
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Size controls */}
                    <div className={`flex items-center gap-1 ${embedded ? 'px-2 py-0.5' : 'px-3 py-1'} rounded-lg bg-white/50 dark:bg-black/50`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          scaleSticker(selectedSticker, 'down');
                        }}
                        title="Shrink"
                      >
                        <ZoomOut className={`${embedded ? 'w-3 h-3' : 'w-4 h-4'}`} />
                      </Button>
                      <span className={`${embedded ? 'text-xs min-w-[30px]' : 'text-xs min-w-[40px]'} text-center`}>
                        {stickers.find(s => s.id === selectedSticker)?.scale}%
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          scaleSticker(selectedSticker, 'up');
                        }}
                        title="Enlarge"
                      >
                        <ZoomIn className={`${embedded ? 'w-3 h-3' : 'w-4 h-4'}`} />
                      </Button>
                    </div>

                    {/* Rotation controls */}
                    <div className={`flex items-center gap-1 ${embedded ? 'px-2 py-0.5' : 'px-3 py-1'} rounded-lg bg-white/50 dark:bg-black/50`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          rotateSticker(selectedSticker, 'left');
                        }}
                        title="Rotate left"
                      >
                        <RotateCw className={`${embedded ? 'w-3 h-3' : 'w-4 h-4'} transform -scale-x-100`} />
                      </Button>
                      <span className={`${embedded ? 'text-xs min-w-[30px]' : 'text-xs min-w-[40px]'} text-center`}>
                        {stickers.find(s => s.id === selectedSticker)?.rotation}°
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          rotateSticker(selectedSticker, 'right');
                        }}
                        title="Rotate right"
                      >
                        <RotateCw className={`${embedded ? 'w-3 h-3' : 'w-4 h-4'}`} />
                      </Button>
                    </div>

                    {/* Delete */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteSticker(selectedSticker);
                      }}
                    >
                      <Trash2 className={`${embedded ? 'w-3 h-3' : 'w-4 h-4'}`} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Stats */}
      <div className={`${embedded ? 'px-2 py-1' : 'px-4 py-2'} border-t bg-muted/30 flex items-center justify-between text-xs text-muted-foreground`}>
        <div className="flex items-center gap-4">
          <span>{text.length} characters</span>
          <span>•</span>
          <span>{stickers.length} stickers</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-600 dark:text-green-400"
          >
            ✓ Auto-saved
          </motion.span>
        </div>
      </div>
    </div>
  );
}

export function FocusJournal({ 
  isOpen = true, 
  onClose, 
  initialText = '', 
  onSave, 
  embedded = false,
  className = ''
}: FocusJournalProps) {
  const [text, setText] = useState(initialText);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [history, setHistory] = useState<JournalState[]>([{ text: initialText, stickers: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Load saved state on mount and when isOpen changes
  useEffect(() => {
    const saved = localStorage.getItem('focus_journal_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setText(state.text || initialText);
        setStickers(state.stickers || []);
        // Update history with loaded state
        setHistory([{ text: state.text || initialText, stickers: state.stickers || [] }]);
        setHistoryIndex(0);
      } catch (e) {
        console.error('Failed to load journal state:', e);
      }
    }
  }, []); // Only run once on mount

  // Update text when initialText prop changes
  useEffect(() => {
    if (initialText && !localStorage.getItem('focus_journal_state')) {
      setText(initialText);
    }
  }, [initialText]);

  // Auto-save state whenever text or stickers change
  useEffect(() => {
    const state = { text, stickers };
    localStorage.setItem('focus_journal_state', JSON.stringify(state));
    if (onSave) {
      onSave(text);
    }
  }, [text, stickers, onSave]);

  const exportAsImage = async () => {
    if (!canvasRef.current) {
      toast.error('Canvas not ready for export');
      return;
    }

    try {
      setIsExporting(true);
      const prevSelected = selectedSticker;
      setSelectedSticker(null);

      // Wait for selection to clear
      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => {
          // Ignore elements that might have problematic colors
          return false;
        },
        onclone: (clonedDoc, clonedElement) => {
          // Set inline styles to override any oklch colors
          const isDark = document.documentElement.classList.contains('dark');
          
          clonedElement.style.backgroundColor = '#ffffff';
          clonedElement.style.color = '#2A2A2A';
          
          // Find and fix text areas
          const textAreas = clonedElement.querySelectorAll('textarea');
          textAreas.forEach((textarea: Element) => {
            if (textarea instanceof HTMLElement) {
              textarea.style.color = '#2A2A2A';
              textarea.style.backgroundColor = 'transparent';
            }
          });
          
          // Find and fix sticker containers
          const stickers = clonedElement.querySelectorAll('[class*="motion"]');
          stickers.forEach((sticker: Element) => {
            if (sticker instanceof HTMLElement) {
              // Ensure stickers are visible
              sticker.style.opacity = '1';
            }
          });
          
          // Override any CSS custom properties that might use oklch
          clonedElement.style.setProperty('--foreground', '#2A2A2A');
          clonedElement.style.setProperty('--background', '#ffffff');
          clonedElement.style.setProperty('--background-solid', '#ffffff');
        }
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `focus-journal-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success('Journal exported as image! 📸');
        } else {
          toast.error('Failed to create image blob');
        }
      }, 'image/png');

      setSelectedSticker(prevSelected);
      setIsExporting(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export journal. Please try again.');
      setIsExporting(false);
    }
  };

  const clearAll = () => {
    if (window.confirm('Clear all content? This cannot be undone.')) {
      setText('');
      setStickers([]);
      setHistory([{ text: '', stickers: [] }]);
      setHistoryIndex(0);
      toast.success('Journal cleared');
    }
  };

  const handleClose = () => {
    if (onSave) {
      onSave(text);
    }
    if (onClose) {
      onClose();
    }
  };

  if (embedded) {
    return (
      <div className={`h-full ${className}`}>
        <JournalContent
          text={text}
          setText={setText}
          stickers={stickers}
          setStickers={setStickers}
          selectedSticker={selectedSticker}
          setSelectedSticker={setSelectedSticker}
          history={history}
          setHistory={setHistory}
          historyIndex={historyIndex}
          setHistoryIndex={setHistoryIndex}
          onExport={exportAsImage}
          onClear={clearAll}
          embedded
          canvasRef={canvasRef}
        />
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden">
        <JournalContent
          text={text}
          setText={setText}
          stickers={stickers}
          setStickers={setStickers}
          selectedSticker={selectedSticker}
          setSelectedSticker={setSelectedSticker}
          history={history}
          setHistory={setHistory}
          historyIndex={historyIndex}
          setHistoryIndex={setHistoryIndex}
          onExport={exportAsImage}
          onClear={clearAll}
          canvasRef={canvasRef}
        />
      </DialogContent>
    </Dialog>
  );
}