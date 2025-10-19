import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, CheckSquare, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import backendService from '../services/backendService';

interface AddTaskDialogProps {
  userId: string;
  onTaskAdded?: (task: any) => void;
  triggerButton?: React.ReactNode;
}

export function AddTaskDialog({ userId, onTaskAdded, triggerButton }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Task title must be at least 3 characters';
    }

    if (dueDate) {
      const due = new Date(dueDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      if (due < now) {
        newErrors.dueDate = 'Due date cannot be in the past';
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
      const result = await backendService.tasks.addTask(
        userId,
        title.trim(),
        description.trim() || undefined,
        dueDate || undefined,
        priority
      );

      if (result.success && result.data) {
        toast.success('Task added successfully!');
        onTaskAdded?.(result.data);
        resetForm();
        setOpen(false);
      } else {
        throw new Error(result.error?.message || 'Failed to add task');
      }
    } catch (error: any) {
      console.error('Error adding task:', error);
      toast.error(error.message || 'Failed to add task');
      
      // Check for offline/network errors
      if (error.message?.includes('network') || error.message?.includes('offline')) {
        toast.error('You appear to be offline. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" className="w-full gradient-primary text-white border-0">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glassmorphism">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Add New Task
          </DialogTitle>
          <DialogDescription>
            Create a new task to add to your daily to-do list. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title">
              Task Title <span className="text-error-solid">*</span>
            </Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
              placeholder="e.g., Complete Chapter 5 homework"
              disabled={loading}
              className={errors.title ? 'border-error-solid' : ''}
              maxLength={200}
            />
            {errors.title && (
              <p className="text-sm text-error-solid flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {title.length}/200 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="task-description">Description (Optional)</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details about this task..."
              rows={3}
              disabled={loading}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)} disabled={loading}>
                <SelectTrigger id="task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      High
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-due-date">Due Date (Optional)</Label>
              <div className="relative">
                <Input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    if (errors.dueDate) setErrors({ ...errors, dueDate: '' });
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  disabled={loading}
                  className={errors.dueDate ? 'border-error-solid' : ''}
                />
              </div>
              {errors.dueDate && (
                <p className="text-sm text-error-solid flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.dueDate}
                </p>
              )}
            </div>
          </div>

          {/* Info box */}
          <div className="p-3 rounded-lg bg-primary-solid/10 border border-primary-solid/20">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Break down large tasks into smaller, manageable steps for better productivity!
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
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
