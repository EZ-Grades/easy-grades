import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, Star, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useIsMobile } from './ui/use-mobile';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  emoji?: string;
}

interface CalendarWidgetProps {
  events?: CalendarEvent[];
  onEventAdd?: (event: Omit<CalendarEvent, 'id'>) => void;
  onEventUpdate?: (id: string, event: Partial<CalendarEvent>) => void;
  className?: string;
}

const CUTE_EMOJIS = ['🌟', '📘', '🎯', '☕', '🎉', '📚', '💫', '🌸', '🦄', '🌈', '💎', '🎨'];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function CalendarWidget({ 
  events = [], 
  onEventAdd, 
  onEventUpdate, 
  className = '' 
}: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🌟');
  const [viewMode, setViewMode] = useState<'month' | 'twoweek'>('month');
  const isMobile = useIsMobile();

  // Automatically switch to mobile view on smaller screens
  useEffect(() => {
    setViewMode(isMobile ? 'twoweek' : 'month');
  }, [isMobile]);

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

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      const days = direction === 'prev' ? -7 : 7;
      newDate.setDate(prev.getDate() + days);
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
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayEvents = events.filter(event => isSameDay(event.date, date));
      
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

  const generateTwoWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dayEvents = events.filter(event => isSameDay(event.date, date));
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isToday(date),
        events: dayEvents,
        hasEvents: dayEvents.length > 0
      });
    }
    
    return days;
  };

  const getDaysToRender = () => {
    return viewMode === 'month' ? generateMonthDays() : generateTwoWeekDays();
  };

  const handleAddEvent = () => {
    if (!newEventTitle.trim() || !selectedDate) return;
    
    const newEvent = {
      title: newEventTitle.trim(),
      date: selectedDate,
      time: newEventTime || undefined,
      emoji: selectedEmoji
    };
    
    onEventAdd?.(newEvent);
    setNewEventTitle('');
    setNewEventTime('');
    setSelectedEmoji('🌟');
    setShowEventForm(false);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    if (isMobile && !events.some(event => isSameDay(event.date, date))) {
      setShowEventForm(true);
    }
  };

  const dayEvents = selectedDate ? events.filter(event => isSameDay(event.date, selectedDate)) : [];

  return (
    <Card className={`glassmorphism border-0 overflow-hidden ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-5 h-5 text-primary-solid" />
            </motion.div>
            <span className="text-gradient-primary">Calendar</span>
          </div>
          
          {!isMobile && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === 'month' ? 'twoweek' : 'month')}
                className="text-xs"
              >
                {viewMode === 'month' ? '2 Weeks' : 'Month'}
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Header with Month/Year and Navigation */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            {currentDate.toLocaleDateString('en-US', { 
              month: 'long', 
              ...(viewMode === 'month' ? { year: 'numeric' } : {})
            })}
          </h3>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => viewMode === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
              className="h-8 w-8 p-0 hover:bg-primary-solid/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              className="text-xs px-2 h-8 hover:bg-primary-solid/10"
            >
              Today
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => viewMode === 'month' ? navigateMonth('next') : navigateWeek('next')}
              className="h-8 w-8 p-0 hover:bg-primary-solid/10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Day Headers */}
        <div className={`grid gap-1 text-center text-xs font-medium text-muted-foreground ${
          viewMode === 'month' ? 'grid-cols-7' : 'grid-cols-7'
        }`}>
          {(isMobile && viewMode === 'twoweek' ? WEEKDAYS_SHORT : WEEKDAYS).map((day, index) => (
            <div key={`weekday-${index}`} className="py-2">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className={`grid gap-1 ${
          viewMode === 'month' ? 'grid-cols-7' : 'grid-cols-7'
        }`}>
          {getDaysToRender().map((day, index) => (
            <motion.button
              key={`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`}
              onClick={() => handleDayClick(day.date)}
              className={`
                relative p-2 rounded-xl text-center transition-all duration-200 min-h-[44px] group
                ${day.isCurrentMonth 
                  ? 'hover:bg-primary-solid/10 hover:scale-105' 
                  : 'opacity-40 hover:opacity-60'
                }
                ${day.isToday 
                  ? 'bg-gradient-to-br from-primary-solid/20 to-secondary-solid/20 text-primary-solid shadow-lg border-2 border-primary-solid/30' 
                  : ''
                }
                ${selectedDate && isSameDay(selectedDate, day.date)
                  ? 'bg-secondary-solid/20 border-2 border-secondary-solid/50'
                  : 'border border-transparent'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
            >
              {/* Date Number */}
              <div className={`text-sm font-medium ${
                day.isToday ? 'text-primary-solid' : 
                day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {day.date.getDate()}
              </div>
              
              {/* Event Indicators */}
              {day.hasEvents && (
                <div className="flex items-center justify-center mt-1">
                  {day.events.slice(0, 3).map((event, idx) => (
                    <motion.span
                      key={`${event.id}-${idx}`}
                      className="text-xs mx-0.5"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                    >
                      {event.emoji || '📘'}
                    </motion.span>
                  ))}
                  {day.events.length > 3 && (
                    <span className="text-xs text-primary-solid">+{day.events.length - 3}</span>
                  )}
                </div>
              )}
              
              {/* Cute sparkle effect for today */}
              {day.isToday && (
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ 
                    scale: [1, 1.2, 1], 
                    rotate: [0, 10, 0] 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    repeatDelay: 1 
                  }}
                >
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Selected Date Events */}
        <AnimatePresence>
          {selectedDate && dayEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 p-3 bg-muted/20 rounded-xl"
            >
              <div className="text-sm font-medium text-primary-solid">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              
              <div className="space-y-1">
                {dayEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 p-2 bg-white/50 dark:bg-white/5 rounded-lg"
                  >
                    <span className="text-sm">{event.emoji || '📘'}</span>
                    <span className="text-sm flex-1">{event.title}</span>
                    {event.time && (
                      <Badge variant="secondary" className="text-xs">
                        {event.time}
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Event Button */}
        <Popover open={showEventForm} onOpenChange={setShowEventForm}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full gradient-primary text-white border-0 hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-80 glassmorphism" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Title</label>
                <Input
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Enter event title..."
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Time (optional)</label>
                <Input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <div className="grid grid-cols-6 gap-1">
                  {CUTE_EMOJIS.map((emoji) => (
                    <motion.button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`p-2 rounded-lg text-lg transition-all ${
                        selectedEmoji === emoji 
                          ? 'bg-primary-solid/20 scale-110' 
                          : 'hover:bg-muted/50'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleAddEvent}
                  className="flex-1 gradient-primary"
                  disabled={!newEventTitle.trim() || !selectedDate}
                >
                  Add Event
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEventForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
}