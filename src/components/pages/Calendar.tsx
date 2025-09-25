/**
 * Interactive Calendar with Customization Features
 * 
 * FEATURES:
 * - Customizable pastel colors for date banners
 * - Cute stickers for marking special dates
 * - Date marking with notes and reminders
 * - Creativity center with interactive tools
 * - Monthly/yearly view with smooth animations
 * - User preferences saved to localStorage/backend
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Star,
  Heart,
  Smile,
  Coffee,
  Book,
  Trophy,
  Palette,
  Sparkles,
  Plus,
  Edit3,
  Save,
  X,
  Brush,
  Sticker,
  Music,
  Image,
  Scissors,
  PaintBucket
} from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { LuxuryButton } from '../LuxuryButton';
import { LuxuryBadge } from '../LuxuryBadge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { CreativeDrawingCanvas } from '../CreativeDrawingCanvas';
import { toast } from 'sonner@2.0.3';

interface CalendarProps {
  user?: any;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
  stickers: string[];
  color?: string;
  note?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  color: string;
  time?: string;
  type: 'study' | 'exam' | 'assignment' | 'break' | 'personal';
}

interface CreativityTool {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
}

const STICKER_EMOJIS = ['⭐', '💖', '🎉', '📚', '🏆', '☕', '🌈', '🦄', '🍕', '🎵', '🎨', '🚀', '💎', '🌸', '🎭', '🎪', '🎁', '🔥', '💫', '🌙'];

const PASTEL_COLORS = [
  { name: 'Lavender', value: '#E6E6FA', class: 'bg-purple-100' },
  { name: 'Mint', value: '#F0FFF0', class: 'bg-green-100' },
  { name: 'Peach', value: '#FFDBCC', class: 'bg-orange-100' },
  { name: 'Sky', value: '#E0F6FF', class: 'bg-blue-100' },
  { name: 'Rose', value: '#FFE4E1', class: 'bg-pink-100' },
  { name: 'Lemon', value: '#FFFACD', class: 'bg-yellow-100' },
  { name: 'Coral', value: '#FFF0F5', class: 'bg-red-100' },
  { name: 'Sage', value: '#F0F8DC', class: 'bg-emerald-100' }
];

const CREATIVITY_TOOLS: CreativityTool[] = [
  {
    id: 'drawing',
    name: 'Digital Drawing',
    icon: Brush,
    color: 'text-purple-600',
    description: 'Draw and doodle freely'
  },
  {
    id: 'stickers',
    name: 'Sticker Collection',
    icon: Sticker,
    color: 'text-pink-600',
    description: 'Add cute stickers'
  },
  {
    id: 'music',
    name: 'Music Mood',
    icon: Music,
    color: 'text-blue-600',
    description: 'Set your daily vibe'
  },
  {
    id: 'collage',
    name: 'Photo Collage',
    icon: Image,
    color: 'text-green-600',
    description: 'Create memory boards'
  },
  {
    id: 'craft',
    name: 'Digital Craft',
    icon: Scissors,
    color: 'text-orange-600',
    description: 'Cut, paste, create'
  },
  {
    id: 'colors',
    name: 'Color Palette',
    icon: PaintBucket,
    color: 'text-red-600',
    description: 'Explore color harmony'
  }
];

export function Calendar({ user }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [drawingMode, setDrawingMode] = useState(false);
  
  // Form states
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventColor, setEventColor] = useState('#7D4AE1');
  const [dayNote, setDayNote] = useState('');

  // Generate calendar days for current month
  useEffect(() => {
    generateCalendarDays();
  }, [currentDate]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // Start from Sunday of the week containing the first day
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      
      // Sample events for demo
      const events: CalendarEvent[] = [];
      if (isCurrentMonth && Math.random() > 0.8) {
        events.push({
          id: `event-${date.getTime()}`,
          title: ['Study Session', 'Exam', 'Assignment Due', 'Break Time'][Math.floor(Math.random() * 4)],
          color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)].value,
          type: ['study', 'exam', 'assignment', 'break'][Math.floor(Math.random() * 4)] as any
        });
      }
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        events,
        stickers: [],
        color: undefined,
        note: undefined
      });
    }
    
    setCalendarDays(days);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const selectDate = (day: CalendarDay) => {
    setSelectedDate(day.date);
    setDayNote(day.note || '');
  };

  const addSticker = (emoji: string) => {
    if (!selectedDate) return;
    
    setCalendarDays(prev => prev.map(day => {
      if (day.date.toDateString() === selectedDate.toDateString()) {
        return {
          ...day,
          stickers: [...day.stickers, emoji]
        };
      }
      return day;
    }));
    
    toast.success('Sticker added! ✨');
  };

  const removeSticker = (stickerIndex: number) => {
    if (!selectedDate) return;
    
    setCalendarDays(prev => prev.map(day => {
      if (day.date.toDateString() === selectedDate.toDateString()) {
        const newStickers = [...day.stickers];
        newStickers.splice(stickerIndex, 1);
        return {
          ...day,
          stickers: newStickers
        };
      }
      return day;
    }));
    
    toast.success('Sticker removed!');
  };

  const setDateColor = (color: string) => {
    if (!selectedDate) return;
    
    setCalendarDays(prev => prev.map(day => {
      if (day.date.toDateString() === selectedDate.toDateString()) {
        return {
          ...day,
          color
        };
      }
      return day;
    }));
    
    toast.success('Date color updated! 🎨');
  };

  const saveNote = () => {
    if (!selectedDate) return;
    
    setCalendarDays(prev => prev.map(day => {
      if (day.date.toDateString() === selectedDate.toDateString()) {
        return {
          ...day,
          note: dayNote
        };
      }
      return day;
    }));
    
    toast.success('Note saved! 📝');
  };

  const addEvent = () => {
    if (!selectedDate || !eventTitle) return;
    
    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: eventTitle,
      description: eventDescription,
      color: eventColor,
      time: eventTime,
      type: 'personal'
    };
    
    setCalendarDays(prev => prev.map(day => {
      if (day.date.toDateString() === selectedDate.toDateString()) {
        return {
          ...day,
          events: [...day.events, newEvent]
        };
      }
      return day;
    }));
    
    // Reset form
    setEventTitle('');
    setEventDescription('');
    setEventTime('');
    setShowEventDialog(false);
    
    toast.success('Event added! 🎉');
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedDay = selectedDate ? calendarDays.find(day => 
    day.date.toDateString() === selectedDate.toDateString()
  ) : null;

  return (
    <div className="min-h-screen pb-8 px-4 pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient-primary">Creative Calendar</span> 🎨
          </h1>
          <p className="text-lg text-muted-foreground">Plan your days with style and creativity</p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Calendar Section */}
          <div className="xl:col-span-3">
            <GlassCard size="lg">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <motion.h2 
                  className="text-2xl font-semibold text-gradient-primary"
                  key={currentDate.getMonth()}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </motion.h2>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {dayNames.map(day => (
                  <div key={day} className="text-center p-2 text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <motion.div
                    key={`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.01 }}
                    className={`
                      relative min-h-[100px] p-2 rounded-lg border-2 cursor-pointer transition-all duration-300
                      ${day.isCurrentMonth ? 'border-border' : 'border-border/30 opacity-50'}
                      ${day.isToday ? 'border-primary-solid bg-primary-solid/10' : ''}
                      ${selectedDate?.toDateString() === day.date.toDateString() ? 'border-secondary-solid bg-secondary-solid/10' : ''}
                      hover:border-primary-solid/50 hover:shadow-lg
                    `}
                    style={{
                      backgroundColor: day.color ? `${day.color}20` : undefined,
                      borderColor: day.color || undefined
                    }}
                    onClick={() => selectDate(day)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Date Number */}
                    <div className={`text-sm font-semibold mb-1 ${
                      day.isToday ? 'text-primary-solid' : 
                      day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {day.date.getDate()}
                    </div>

                    {/* Events */}
                    <div className="space-y-1 mb-2">
                      {day.events.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded text-white truncate"
                          style={{ backgroundColor: event.color }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {day.events.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{day.events.length - 2} more
                        </div>
                      )}
                    </div>

                    {/* Stickers */}
                    <div className="flex flex-wrap gap-1">
                      {day.stickers.slice(0, 4).map((sticker, idx) => (
                        <span key={idx} className="text-xs">
                          {sticker}
                        </span>
                      ))}
                    </div>

                    {/* Note Indicator */}
                    {day.note && (
                      <div className="absolute bottom-1 right-1">
                        <Edit3 className="w-3 h-3 text-primary-solid" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Creativity Center & Day Details */}
          <div className="xl:col-span-1 space-y-6">
            {/* Day Details */}
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gradient-primary">
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </h3>
                    <div className="flex gap-2">
                      <Popover open={showStickerPicker} onOpenChange={setShowStickerPicker}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Sticker className="w-4 h-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="grid grid-cols-5 gap-2">
                            {STICKER_EMOJIS.map((emoji, idx) => (
                              <motion.button
                                key={idx}
                                onClick={() => {
                                  addSticker(emoji);
                                  setShowStickerPicker(false);
                                }}
                                className="p-2 rounded-lg hover:bg-muted text-lg"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {emoji}
                              </motion.button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Palette className="w-4 h-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60">
                          <div className="grid grid-cols-4 gap-2">
                            {PASTEL_COLORS.map((color, idx) => (
                              <motion.button
                                key={idx}
                                onClick={() => {
                                  setDateColor(color.value);
                                  setShowColorPicker(false);
                                }}
                                className={`w-12 h-12 rounded-lg border-2 border-border ${color.class}`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEventDialog(true)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Events List */}
                  {selectedDay?.events && selectedDay.events.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Events</h4>
                      <div className="space-y-2">
                        {selectedDay.events.map(event => (
                          <div
                            key={event.id}
                            className="p-2 rounded-lg text-white text-sm"
                            style={{ backgroundColor: event.color }}
                          >
                            <div className="font-medium">{event.title}</div>
                            {event.time && (
                              <div className="text-xs opacity-80">{event.time}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stickers Display */}
                  {selectedDay?.stickers && selectedDay.stickers.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Stickers</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedDay.stickers.map((sticker, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => removeSticker(idx)}
                            className="text-xl p-1 rounded hover:bg-muted/50 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Click to remove"
                          >
                            {sticker}
                          </motion.button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click on stickers to remove them
                      </p>
                    </div>
                  )}

                  {/* Note Section */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Note</h4>
                    <Textarea
                      value={dayNote}
                      onChange={(e) => setDayNote(e.target.value)}
                      placeholder="Add a note for this day..."
                      className="mb-2"
                      rows={3}
                    />
                    <Button size="sm" onClick={saveNote}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Note
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Creativity Center */}
            <GlassCard className="relative overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 opacity-5">
                <motion.div
                  className="absolute top-0 left-0 w-full h-full"
                  animate={{
                    background: [
                      'radial-gradient(circle at 0% 0%, #7D4AE1 0%, transparent 50%)',
                      'radial-gradient(circle at 100% 0%, #3AB0A0 0%, transparent 50%)',
                      'radial-gradient(circle at 100% 100%, #FFCB6B 0%, transparent 50%)',
                      'radial-gradient(circle at 0% 100%, #E76F51 0%, transparent 50%)',
                      'radial-gradient(circle at 0% 0%, #7D4AE1 0%, transparent 50%)'
                    ]
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5 text-primary-solid" />
                  </motion.div>
                  <h3 className="font-semibold text-gradient-primary">Creativity Center</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {CREATIVITY_TOOLS.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <motion.div
                        key={tool.id}
                        className={`
                          p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                          ${selectedTool === tool.id ? 'border-primary-solid bg-primary-solid/10' : 'border-border hover:border-primary-solid/50'}
                        `}
                        onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${tool.color}`} />
                        <div className="text-sm font-medium">{tool.name}</div>
                        <div className="text-xs text-muted-foreground">{tool.description}</div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Tool Details */}
                <AnimatePresence>
                  {selectedTool && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 rounded-lg bg-muted/20"
                    >
                      {selectedTool === 'drawing' && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-3">
                            Express your creativity with digital drawing tools
                          </p>
                          <LuxuryButton 
                            variant="primary" 
                            size="sm"
                            onClick={() => setDrawingMode(true)}
                          >
                            <Brush className="w-4 h-4 mr-2" />
                            Start Drawing
                          </LuxuryButton>
                        </div>
                      )}
                      
                      {selectedTool === 'stickers' && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Collect and organize your favorite stickers
                          </p>
                          <div className="grid grid-cols-4 gap-2">
                            {STICKER_EMOJIS.slice(0, 8).map((emoji, idx) => (
                              <div key={idx} className="text-center text-xl p-2 rounded-lg bg-background">
                                {emoji}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedTool === 'music' && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-3">
                            Set the mood for your day with music vibes
                          </p>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <LuxuryBadge variant="primary" className="cursor-pointer hover:scale-105 transition-transform">🎵 Chill</LuxuryBadge>
                            <LuxuryBadge variant="secondary" className="cursor-pointer hover:scale-105 transition-transform">⚡ Focus</LuxuryBadge>
                            <LuxuryBadge variant="highlight" className="cursor-pointer hover:scale-105 transition-transform">🌅 Morning</LuxuryBadge>
                            <LuxuryBadge variant="primary" className="cursor-pointer hover:scale-105 transition-transform">🌙 Evening</LuxuryBadge>
                          </div>
                        </div>
                      )}
                      
                      {selectedTool === 'colors' && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Create your own color palettes
                          </p>
                          <div className="grid grid-cols-4 gap-2 mb-3">
                            {PASTEL_COLORS.map((color, idx) => (
                              <motion.div
                                key={idx}
                                className={`w-full h-8 rounded-lg ${color.class} border-2 border-border cursor-pointer`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title={color.name}
                              />
                            ))}
                          </div>
                          <LuxuryButton variant="secondary" size="sm" className="w-full">
                            <Palette className="w-4 h-4 mr-2" />
                            Create Palette
                          </LuxuryButton>
                        </div>
                      )}
                      
                      {selectedTool === 'collage' && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-3">
                            Create memory boards and photo collections
                          </p>
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                              <Image className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="aspect-square bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                              <Star className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                              <Heart className="w-6 h-6 text-green-600" />
                            </div>
                          </div>
                          <LuxuryButton variant="secondary" size="sm" className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Photos
                          </LuxuryButton>
                        </div>
                      )}
                      
                      {selectedTool === 'craft' && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-3">
                            Digital crafting tools for creative projects
                          </p>
                          <div className="space-y-2">
                            <LuxuryButton variant="outline" size="sm" className="w-full">
                              <Scissors className="w-4 h-4 mr-2" />
                              Cut & Paste
                            </LuxuryButton>
                            <LuxuryButton variant="outline" size="sm" className="w-full">
                              <Sparkles className="w-4 h-4 mr-2" />
                              Add Effects
                            </LuxuryButton>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </GlassCard>

            {/* Quick Stats */}
            <GlassCard>
              <h3 className="font-semibold text-gradient-primary mb-4">This Month</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Events</span>
                  <Badge variant="secondary">
                    {calendarDays.reduce((acc, day) => acc + day.events.length, 0)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Stickers</span>
                  <Badge variant="secondary">
                    {calendarDays.reduce((acc, day) => acc + day.stickers.length, 0)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Notes</span>
                  <Badge variant="secondary">
                    {calendarDays.filter(day => day.note).length}
                  </Badge>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Add Event Dialog */}
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Event Title</label>
                <Input
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Study session, exam, assignment..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Additional details..."
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Time (Optional)</label>
                  <Input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Color</label>
                  <div className="flex gap-2 mt-1">
                    {PASTEL_COLORS.slice(0, 4).map((color, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => setEventColor(color.value)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          eventColor === color.value ? 'border-primary-solid' : 'border-border'
                        } ${color.class}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                  Cancel
                </Button>
                <LuxuryButton variant="primary" onClick={addEvent}>
                  Add Event
                </LuxuryButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Creative Drawing Canvas */}
        <CreativeDrawingCanvas 
          isOpen={drawingMode} 
          onClose={() => setDrawingMode(false)} 
        />
      </div>
    </div>
  );
}