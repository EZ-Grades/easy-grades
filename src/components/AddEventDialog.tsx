import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Calendar as CalendarIcon,
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
  Cat,
  Diamond,
  Key,
  Music,
  Loader2,
  AlertCircle,
  Cherry,
  Skull,
  Sparkle,
  Zap,
  Ghost,
  Wand2,
  Compass,
  Bug,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { createCalendarEvent, CalendarEventInsert } from '../services/calendarService';

// Icon mapping for event types - All requested icons
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
  { value: 'fireworks', label: 'Fireworks', icon: Sparkle, color: '#FF4500' },
  { value: 'lantern', label: 'Lantern', icon: Zap, color: '#FFA500' },
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

interface AddEventDialogProps {
  onEventCreated?: () => void;
  defaultDate?: Date;
  triggerButton?: React.ReactNode;
}

export function AddEventDialog({ onEventCreated, defaultDate, triggerButton }: AddEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventType, setEventType] = useState<CalendarEventInsert['event_type']>('other');
  const [selectedIcon, setSelectedIcon] = useState('sparkles');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Initialize dates when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    
    if (isOpen && defaultDate) {
      // Format date in local timezone to avoid date shifting
      const year = defaultDate.getFullYear();
      const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
      const day = String(defaultDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      setStartDate(dateStr);
      setEndDate(dateStr);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (!endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (startDate && startTime && endDate && endTime) {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);

      if (endDateTime <= startDateTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);

      const iconOption = ICON_OPTIONS.find(opt => opt.value === selectedIcon);

      const eventData: CalendarEventInsert = {
        title: title.trim(),
        description: description.trim() || undefined,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        event_type: eventType,
        icon: selectedIcon,
        color_hex: iconOption?.color,
        priority,
      };

      const { data, error } = await createCalendarEvent(eventData);

      if (error) {
        throw error;
      }

      if (data) {
        toast.success('Event created successfully!');
        resetForm();
        setOpen(false);
        onEventCreated?.();
      }
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
    setEventType('other');
    setSelectedIcon('sparkles');
    setPriority('medium');
    setErrors({});
  };

  const SelectedIcon = ICON_OPTIONS.find(opt => opt.value === selectedIcon)?.icon || Sparkles;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" className="w-full gradient-primary text-white border-0">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glassmorphism max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Create New Event
          </DialogTitle>
          <DialogDescription>
            Schedule a new event on your calendar. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="event-title">
              Title <span className="text-error-solid">*</span>
            </Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
              placeholder="e.g., Study Session, Assignment Due"
              disabled={loading}
              className={errors.title ? 'border-error-solid' : ''}
            />
            {errors.title && (
              <p className="text-sm text-error-solid flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Event Type & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-type">Event Type</Label>
              <Select value={eventType} onValueChange={(value: any) => setEventType(value)} disabled={loading}>
                <SelectTrigger id="event-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="study">Study Session</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="break">Break</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-priority">Priority</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)} disabled={loading}>
                <SelectTrigger id="event-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">
                Start Date <span className="text-error-solid">*</span>
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (errors.startDate) setErrors({ ...errors, startDate: '' });
                  // Auto-set end date if not set
                  if (!endDate) setEndDate(e.target.value);
                }}
                disabled={loading}
                className={errors.startDate ? 'border-error-solid' : ''}
              />
              {errors.startDate && (
                <p className="text-sm text-error-solid flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.startDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-time">
                Start Time <span className="text-error-solid">*</span>
              </Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (errors.startTime) setErrors({ ...errors, startTime: '' });
                }}
                disabled={loading}
                className={errors.startTime ? 'border-error-solid' : ''}
              />
              {errors.startTime && (
                <p className="text-sm text-error-solid flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.startTime}
                </p>
              )}
            </div>
          </div>

          {/* End Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="end-date">
                End Date <span className="text-error-solid">*</span>
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (errors.endDate) setErrors({ ...errors, endDate: '' });
                }}
                disabled={loading}
                className={errors.endDate ? 'border-error-solid' : ''}
              />
              {errors.endDate && (
                <p className="text-sm text-error-solid flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.endDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">
                End Time <span className="text-error-solid">*</span>
              </Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  if (errors.endTime) setErrors({ ...errors, endTime: '' });
                }}
                disabled={loading}
                className={errors.endTime ? 'border-error-solid' : ''}
              />
              {errors.endTime && (
                <p className="text-sm text-error-solid flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.endTime}
                </p>
              )}
            </div>
          </div>

          {/* Icon Picker */}
          <div className="space-y-2">
            <Label>Event Icon</Label>
            <div className="grid grid-cols-7 gap-2">
              {ICON_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedIcon === option.value;
                
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedIcon(option.value)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      p-3 rounded-lg border-2 transition-all
                      ${isSelected 
                        ? 'border-primary-solid bg-primary-solid/10' 
                        : 'border-border hover:border-primary-solid/50'
                      }
                    `}
                    disabled={loading}
                  >
                    <Icon 
                      className="w-5 h-5 mx-auto" 
                      style={{ color: isSelected ? option.color : 'currentColor' }}
                    />
                  </motion.button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Selected: {ICON_OPTIONS.find(opt => opt.value === selectedIcon)?.label}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="gradient-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Create Event
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
