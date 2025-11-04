import { useState } from 'react';
import { Plus, CheckSquare, Loader2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import backendService from '../services/backendService';

interface AddTaskDialogProps {
  userId?: string;
  onTaskAdded?: (task: any) => void;
}

export function AddTaskDialog({ userId, onTaskAdded }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taskName, setTaskName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskName.trim()) {
      toast.error('Please enter a task name');
      return;
    }

    setLoading(true);

    try {
      if (userId) {
        // LOGGED-IN USER - Save to backend
        const { data, error } = await backendService.tasks.addTask(
          userId,
          {
            title: taskName.trim(),
            completed: false
          }
        );

        if (error) {
          throw new Error(error.message || 'Failed to add task');
        }

        if (data) {
          toast.success('Task added! ✅');
          onTaskAdded?.(data);
          setTaskName('');
          setOpen(false);
        }
      } else {
        // GUEST USER - Create local task
        const guestTask = {
          id: `guest-task-${Date.now()}`,
          title: taskName.trim(),
          completed: false,
          created_at: new Date().toISOString()
        };
        
        toast.success('Task added! (Guest mode - resets on reload)');
        onTaskAdded?.(guestTask);
        setTaskName('');
        setOpen(false);
      }
    } catch (error: any) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gradient-primary text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="glassmorphism sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Add New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="task-name">Task Name</Label>
            <Input
              id="task-name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g., Complete homework, Study for exam..."
              disabled={loading}
              autoFocus
              maxLength={200}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTaskName('');
                setOpen(false);
              }}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="gradient-primary" 
              disabled={loading || !taskName.trim()}
            >
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
