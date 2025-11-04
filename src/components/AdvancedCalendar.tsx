import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Download,
  Sparkles,
  Star,
  Heart,
  Moon,
  Sun,
  Leaf,
  Flower,
  Flower2,
  Crown,
  Anchor,
  Flag,
  Ship,
  Gift,
  Snowflake,
  Cloud,
  BookOpen,
  Coffee,
  Camera,
  Ghost,
  Cat,
  Diamond,
  Key,
  Music,
  Palette,
  Type,
  Check,
  X,
  Cherry,
  Skull,
  Sparkle,
  Zap,
  Wand2,
  Compass,
  Bug,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useIsMobile } from './ui/use-mobile';
import { AddEventDialog } from './AddEventDialog';
import { getCalendarEvents, CalendarEvent } from '../services/calendarService';

// Available icons for events
const ICON_OPTIONS = [
  { value: 'sparkles', label: 'Sparkles', icon: Sparkles, color: '#FFD700' },
  { value: 'star', label: 'Star', icon: Star, color: '#FFA500' },
  { value: 'heart', label: 'Heart', icon: Heart, color: '#FF69B4' },
  { value: 'moon', label: 'Moon', icon: Moon, color: '#9370DB' },
  { value: 'sun', label: 'Sun', icon: Sun, color: '#FFD700' },
  { value: 'leaf', label: 'Leaf', icon: Leaf, color: '#90EE90' },
  { value: 'cherry', label: 'Cherry', icon: Cherry, color: '#DC143C' },
  { value: 'flower', label: 'Flower', icon: Flower, color: '#FF69B4' },
  { value: 'flower2', label: 'Blossom', icon: Flower2, color: '#FFB6C1' },
  { value: 'crown', label: 'Crown', icon: Crown, color: '#FFD700' },
  { value: 'anchor', label: 'Anchor', icon: Anchor, color: '#4682B4' },
  { value: 'flag', label: 'Flag', icon: Flag, color: '#FF6347' },
  { value: 'skull', label: 'Skull', icon: Skull, color: '#696969' },
  { value: 'ship', label: 'Ship', icon: Ship, color: '#4682B4' },
  { value: 'compass', label: 'Balloon', icon: Compass, color: '#FF69B4' },
  { value: 'gift', label: 'Gift', icon: Gift, color: '#FF1493' },
  { value: 'sparkle', label: 'Fireworks', icon: Sparkle, color: '#FF4500' },
  { value: 'zap', label: 'Lantern', icon: Zap, color: '#FFA500' },
  { value: 'snowflake', label: 'Snowflake', icon: Snowflake, color: '#87CEEB' },
  { value: 'cloud', label: 'Cloud', icon: Cloud, color: '#87CEEB' },
  { value: 'book', label: 'Book', icon: BookOpen, color: '#8B4513' },
  { value: 'coffee', label: 'Coffee', icon: Coffee, color: '#8B4513' },
  { value: 'camera', label: 'Camera', icon: Camera, color: '#696969' },
  { value: 'ghost', label: 'Ghost', icon: Ghost, color: '#F0F0F0' },
  { value: 'cat', label: 'Cat', icon: Cat, color: '#FF69B4' },
  { value: 'bug', label: 'Wolf', icon: Bug, color: '#696969' },
  { value: 'diamond', label: 'Diamond', icon: Diamond, color: '#00CED1' },
  { value: 'key', label: 'Key', icon: Key, color: '#FFD700' },
  { value: 'music', label: 'Music', icon: Music, color: '#9370DB' },
  { value: 'wand', label: 'Magic Wand', icon: Wand2, color: '#FF00FF' },
];

const FONT_FAMILIES = [
  { value: 'system', label: 'System Default', fontFamily: 'inherit' },
  { value: 'great-vibes', label: 'Great Vibes', fontFamily: "'Great Vibes', cursive", googleFont: 'Great+Vibes' },
  { value: 'allura', label: 'Allura', fontFamily: "'Allura', cursive", googleFont: 'Allura' },
  { value: 'dancing-script', label: 'Dancing Script', fontFamily: "'Dancing Script', cursive", googleFont: 'Dancing+Script' },
  { value: 'parisienne', label: 'Parisienne', fontFamily: "'Parisienne', cursive", googleFont: 'Parisienne' },
  { value: 'satisfy', label: 'Satisfy', fontFamily: "'Satisfy', cursive", googleFont: 'Satisfy' },
  { value: 'pacifico', label: 'Pacifico', fontFamily: "'Pacifico', cursive", googleFont: 'Pacifico' },
  { value: 'shantell-sans', label: 'Shantell Sans', fontFamily: "'Shantell Sans', sans-serif", googleFont: 'Shantell+Sans' },
  { value: 'caveat', label: 'Caveat', fontFamily: "'Caveat', cursive", googleFont: 'Caveat' },
  { value: 'kalam', label: 'Kalam', fontFamily: "'Kalam', cursive", googleFont: 'Kalam' },
  { value: 'gloria-hallelujah', label: 'Gloria Hallelujah', fontFamily: "'Gloria Hallelujah', cursive", googleFont: 'Gloria+Hallelujah' },
  { value: 'lora', label: 'Lora', fontFamily: "'Lora', serif", googleFont: 'Lora' },
  { value: 'playfair-display', label: 'Playfair Display', fontFamily: "'Playfair Display', serif", googleFont: 'Playfair+Display' },
  { value: 'cormorant-garamond', label: 'Cormorant Garamond', fontFamily: "'Cormorant Garamond', serif", googleFont: 'Cormorant+Garamond' },
  { value: 'quicksand', label: 'Quicksand', fontFamily: "'Quicksand', sans-serif", googleFont: 'Quicksand' },
  { value: 'nunito', label: 'Nunito', fontFamily: "'Nunito', sans-serif", googleFont: 'Nunito' },
  { value: 'dm-sans', label: 'DM Sans', fontFamily: "'DM Sans', sans-serif", googleFont: 'DM+Sans' },
  { value: 'raleway', label: 'Raleway', fontFamily: "'Raleway', sans-serif", googleFont: 'Raleway' },
  { value: 'manrope', label: 'Manrope', fontFamily: "'Manrope', sans-serif", googleFont: 'Manrope' },
  { value: 'inter', label: 'Inter', fontFamily: "'Inter', sans-serif", googleFont: 'Inter' },
  { value: 'outfit', label: 'Outfit', fontFamily: "'Outfit', sans-serif", googleFont: 'Outfit' },
  { value: 'assistant', label: 'Assistant', fontFamily: "'Assistant', sans-serif", googleFont: 'Assistant' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarSettings {
  fontFamily: string;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  showIcons: boolean;
  compactMode: boolean;
}

export function AdvancedCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isMobile = useIsMobile();
  const calendarRef = useRef<HTMLDivElement>(null);

  // Calendar settings - Default to theme-aware colors
  const getDefaultTextColor = () => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? '#E8F1F5' : '#0F1E2E';
    }
    return '#0F1E2E';
  };

  const getDefaultBgColor = () => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? '#1A2942' : '#FFFFFF';
    }
    return '#FFFFFF';
  };

  const [settings, setSettings] = useState<CalendarSettings>({
    fontFamily: 'system',
    fontSize: 14,
    textColor: getDefaultTextColor(),
    backgroundColor: getDefaultBgColor(),
    showIcons: true,
    compactMode: false,
  });

  const currentFont = FONT_FAMILIES.find(f => f.value === settings.fontFamily) || FONT_FAMILIES[0];

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  // Load Google Font dynamically
  useEffect(() => {
    const font = FONT_FAMILIES.find(f => f.value === settings.fontFamily);
    if (font && font.googleFont) {
      // Check if font is already loaded
      const existingLink = document.querySelector(`link[href*="${font.googleFont}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${font.googleFont}:wght@400;500;600;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }
  }, [settings.fontFamily]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const { data, error } = await getCalendarEvents(startOfMonth, endOfMonth);
      
      if (error) {
        console.error('Error loading events:', error);
      } else if (data) {
        setEvents(data);
      }
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const generateMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const totalDays = settings.compactMode ? 35 : 42;
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.start_time);
        return isSameDay(eventDate, date);
      });
      
      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: isToday(date),
        events: dayEvents,
        hasEvents: dayEvents.length > 0
      });
    }
    
    return days;
  };

  const getEventIcon = (iconName: string) => {
    const option = ICON_OPTIONS.find(opt => opt.value === iconName);
    return option ? option.icon : Sparkles;
  };

  const downloadAsPNG = async () => {
    try {
      // Dynamic import to avoid bundle size issues
      const html2canvas = (await import('html2canvas')).default;

      if (!calendarRef.current) return;

      // Store the current toast message
      const monthYear = currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });

      // Create canvas from calendar with high quality
      const sourceCanvas = await html2canvas(calendarRef.current, {
        scale: 3, // Higher scale for crisp, clear output
        logging: false,
        backgroundColor: settings.backgroundColor === 'transparent' ? '#ffffff' : settings.backgroundColor,
        useCORS: true,
        allowTaint: true,
        windowWidth: calendarRef.current.scrollWidth,
        windowHeight: calendarRef.current.scrollHeight,
        imageTimeout: 0,
        removeContainer: true,
      });

      // Create a new canvas with rounded corners and padding
      const finalCanvas = document.createElement('canvas');
      const ctx = finalCanvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size with padding for rounded corners
      const padding = 60; // More padding for better aesthetics
      const borderRadius = 32; // Larger rounded corners
      finalCanvas.width = sourceCanvas.width + (padding * 2);
      finalCanvas.height = sourceCanvas.height + (padding * 2);

      // Fill background with white or custom color
      const bgColor = settings.backgroundColor === 'transparent' ? '#ffffff' : settings.backgroundColor;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

      // Draw rounded rectangle with shadow
      ctx.save();
      
      // Add shadow before clipping
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;
      
      // Create rounded rectangle path
      ctx.beginPath();
      ctx.moveTo(padding + borderRadius, padding);
      ctx.lineTo(finalCanvas.width - padding - borderRadius, padding);
      ctx.quadraticCurveTo(finalCanvas.width - padding, padding, finalCanvas.width - padding, padding + borderRadius);
      ctx.lineTo(finalCanvas.width - padding, finalCanvas.height - padding - borderRadius);
      ctx.quadraticCurveTo(finalCanvas.width - padding, finalCanvas.height - padding, finalCanvas.width - padding - borderRadius, finalCanvas.height - padding);
      ctx.lineTo(padding + borderRadius, finalCanvas.height - padding);
      ctx.quadraticCurveTo(padding, finalCanvas.height - padding, padding, finalCanvas.height - padding - borderRadius);
      ctx.lineTo(padding, padding + borderRadius);
      ctx.quadraticCurveTo(padding, padding, padding + borderRadius, padding);
      ctx.closePath();
      
      // Fill the rounded rectangle
      ctx.fillStyle = bgColor;
      ctx.fill();
      
      // Clip to rounded rectangle
      ctx.clip();

      // Reset shadow for image drawing
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw the source canvas onto the final canvas
      ctx.drawImage(sourceCanvas, padding, padding);
      ctx.restore();

      // Add a subtle border around the rounded corners
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(padding + borderRadius, padding);
      ctx.lineTo(finalCanvas.width - padding - borderRadius, padding);
      ctx.quadraticCurveTo(finalCanvas.width - padding, padding, finalCanvas.width - padding, padding + borderRadius);
      ctx.lineTo(finalCanvas.width - padding, finalCanvas.height - padding - borderRadius);
      ctx.quadraticCurveTo(finalCanvas.width - padding, finalCanvas.height - padding, finalCanvas.width - padding - borderRadius, finalCanvas.height - padding);
      ctx.lineTo(padding + borderRadius, finalCanvas.height - padding);
      ctx.quadraticCurveTo(padding, finalCanvas.height - padding, padding, finalCanvas.height - padding - borderRadius);
      ctx.lineTo(padding, padding + borderRadius);
      ctx.quadraticCurveTo(padding, padding, padding + borderRadius, padding);
      ctx.closePath();
      ctx.stroke();

      // Convert to data URL and download
      const link = document.createElement('a');
      link.download = `EZ-Grades-Calendar-${monthYear}.png`;
      link.href = finalCanvas.toDataURL('image/png', 1.0);
      link.click();

      // Show success toast
      import('sonner@2.0.3').then(({ toast }) => {
        toast.success(`Calendar exported as ${monthYear}.png`);
      });
    } catch (error) {
      console.error('Error generating PNG:', error);
      import('sonner@2.0.3').then(({ toast }) => {
        toast.error('Failed to generate PNG. Please try again.');
      });
    }
  };

  const dayEvents = selectedDate ? events.filter(event => {
    const eventDate = new Date(event.start_time);
    return isSameDay(eventDate, selectedDate);
  }) : [];

  return (
    <Card className="glassmorphism border-0 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-5 h-5" style={{ color: settings.textColor }} />
            </motion.div>
            <span className="text-gradient-primary">Calendar</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadAsPNG}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {!isMobile && 'PNG'}
            </Button>
            
            <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  {!isMobile && 'Customize'}
                </Button>
              </SheetTrigger>
              <SheetContent className="glassmorphism overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Calendar Settings</SheetTitle>
                  <SheetDescription>
                    Customize your calendar appearance
                  </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-6 mt-6">
                  {/* Font Family */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Font Family
                    </Label>
                    <Select
                      value={settings.fontFamily}
                      onValueChange={(value) => setSettings({ ...settings, fontFamily: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_FAMILIES.map(font => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-2">
                    <Label>Font Size: {settings.fontSize}px</Label>
                    <Input
                      type="range"
                      min="10"
                      max="20"
                      value={settings.fontSize}
                      onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* Custom Colors */}
                  <div className="space-y-4 p-4 rounded-lg glass-card-enhanced">
                    <Label className="flex items-center gap-2 font-semibold">
                      <Palette className="w-5 h-5 text-primary" />
                      Color Customization
                    </Label>
                    
                    {/* Text Color */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Text Color</Label>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Input
                            type="color"
                            value={settings.textColor}
                            onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                            className="w-20 h-12 p-1 cursor-pointer rounded-lg border-2 border-border"
                          />
                        </div>
                        <Input
                          type="text"
                          value={settings.textColor.toUpperCase()}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                              setSettings({ ...settings, textColor: value });
                            }
                          }}
                          className="flex-1 font-mono"
                          placeholder="#0F1E2E"
                          maxLength={7}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Sets the color for calendar text and dates</p>
                    </div>
                    
                    {/* Background Color */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Background Color</Label>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Input
                            type="color"
                            value={settings.backgroundColor === 'transparent' ? '#FFFFFF' : settings.backgroundColor}
                            onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                            className="w-20 h-12 p-1 cursor-pointer rounded-lg border-2 border-border"
                          />
                        </div>
                        <Input
                          type="text"
                          value={settings.backgroundColor === 'transparent' ? 'transparent' : settings.backgroundColor.toUpperCase()}
                          onChange={(e) => {
                            const value = e.target.value.toLowerCase();
                            if (value === 'transparent' || /^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                              setSettings({ ...settings, backgroundColor: value });
                            }
                          }}
                          className="flex-1 font-mono"
                          placeholder="#FFFFFF or transparent"
                          maxLength={11}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Background color for exported calendar images</p>
                    </div>
                  </div>

                  {/* Icon Display */}
                  <div className="space-y-2">
                    <Label className="flex items-center justify-between">
                      <span>Show Event Icons</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSettings({ ...settings, showIcons: !settings.showIcons })}
                      >
                        {settings.showIcons ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                      </Button>
                    </Label>
                  </div>

                  {/* Compact Mode */}
                  <div className="space-y-2">
                    <Label className="flex items-center justify-between">
                      <span>Compact Mode</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSettings({ ...settings, compactMode: !settings.compactMode })}
                      >
                        {settings.compactMode ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                      </Button>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Show only 5 weeks instead of 6
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div
          ref={calendarRef}
          style={{
            fontFamily: currentFont.fontFamily,
            fontSize: `${settings.fontSize}px`,
            backgroundColor: settings.backgroundColor,
            padding: '1rem',
            borderRadius: '0.75rem',
          }}
          className="space-y-4"
        >
          {/* Header with Month/Year and Navigation */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xl" style={{ color: settings.textColor }}>
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h3>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" style={{ color: settings.textColor }} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" style={{ color: settings.textColor }} />
              </Button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-medium">
            {WEEKDAYS.map((day, index) => (
              <div 
                key={`weekday-${index}`} 
                className="py-2 rounded-lg"
                style={{ 
                  color: settings.textColor,
                  opacity: 0.7
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {generateMonthDays().map((day, index) => {
              const Icon = day.events.length > 0 && settings.showIcons && day.events[0].icon 
                ? getEventIcon(day.events[0].icon)
                : null;
              
              return (
                <motion.button
                  key={`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`}
                  onClick={() => setSelectedDate(day.date)}
                  className={`
                    relative p-3 rounded-xl text-center transition-all duration-300 min-h-[60px] group
                    ${day.isCurrentMonth 
                      ? 'hover:scale-105' 
                      : 'opacity-40'
                    }
                    ${day.isToday 
                      ? 'shadow-lg border-2' 
                      : 'border border-transparent'
                    }
                    ${selectedDate && isSameDay(selectedDate, day.date)
                      ? 'border-2'
                      : ''
                    }
                  `}
                  style={{
                    background: day.isToday 
                      ? 'rgba(147, 197, 253, 0.3)'
                      : selectedDate && isSameDay(selectedDate, day.date)
                      ? 'rgba(219, 234, 254, 0.5)'
                      : 'transparent',
                    borderColor: day.isToday 
                      ? '#3b82f6'
                      : selectedDate && isSameDay(selectedDate, day.date)
                      ? '#60a5fa'
                      : 'transparent',
                    color: settings.textColor,
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                >
                  {/* Date Number */}
                  <div 
                    className="font-semibold mb-1"
                    style={{ 
                      color: day.isToday ? settings.textColor : 
                             day.isCurrentMonth ? settings.textColor : 'var(--muted-foreground)' 
                    }}
                  >
                    {day.date.getDate()}
                  </div>
                  
                  {/* Event Icon */}
                  {Icon && day.hasEvents && settings.showIcons && (
                    <motion.div
                      className="flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Icon 
                        className="w-6 h-6" 
                        style={{ 
                          color: day.events[0].color_hex || settings.textColor,
                          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
                        }}
                      />
                    </motion.div>
                  )}
                  
                  {/* Event indicator dot when icons are hidden */}
                  {!settings.showIcons && day.hasEvents && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {day.events.slice(0, 3).map((event, idx) => (
                        <div
                          key={idx}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ 
                            backgroundColor: event.color_hex || '#3b82f6',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                          }}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Event Count Badge */}
                  {day.events.length > 1 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      style={{ 
                        backgroundColor: '#3b82f6',
                        color: 'white'
                      }}
                    >
                      {day.events.length}
                    </Badge>
                  )}
                  
                  {/* Today Sparkle */}
                  {day.isToday && (
                    <motion.div
                      className="absolute -top-1 -left-1"
                      animate={{ 
                        scale: [1, 1.3, 1], 
                        rotate: [0, 15, 0] 
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        repeatDelay: 1 
                      }}
                    >
                      <Star 
                        className="w-3 h-3 fill-current" 
                        style={{ color: '#fbbf24' }}
                      />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Selected Date Events */}
          <AnimatePresence>
            {selectedDate && dayEvents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 p-4 rounded-xl"
                style={{ 
                  background: 'rgba(219, 234, 254, 0.3)',
                  color: settings.textColor 
                }}
              >
                <div 
                  className="font-semibold text-sm"
                  style={{ color: settings.textColor }}
                >
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                
                <div className="space-y-2">
                  {dayEvents.map((event, index) => {
                    const Icon = event.icon ? getEventIcon(event.icon) : Sparkles;
                    
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg glassmorphism"
                      >
                        {settings.showIcons && (
                          <Icon 
                            className="w-5 h-5 flex-shrink-0" 
                            style={{ color: event.color_hex || settings.textColor }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{event.title}</div>
                          {event.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {event.description}
                            </div>
                          )}
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="text-xs flex-shrink-0"
                          style={{ 
                            backgroundColor: `${event.color_hex || '#3b82f6'}20`,
                            color: event.color_hex || '#3b82f6'
                          }}
                        >
                          {new Date(event.start_time).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Add Event Button */}
        <AddEventDialog
          onEventCreated={loadEvents}
          defaultDate={selectedDate || undefined}
          triggerButton={
            <Button
              variant="outline"
              size="sm"
              className="w-full hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}
