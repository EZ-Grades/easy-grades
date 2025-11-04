import { useState } from 'react';
import { Plus, BookOpen, Loader2, X, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import backendService from '../services/backendService';

interface AddNoteDialogProps {
  userId?: string;
  onNoteAdded?: (note: any) => void;
}

export function AddNoteDialog({ userId, onNoteAdded }: AddNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!noteTitle.trim()) {
      toast.error('Please enter a note title');
      return;
    }

    if (!noteContent.trim()) {
      toast.error('Please enter note content');
      return;
    }

    setLoading(true);

    try {
      if (userId) {
        // LOGGED-IN USER - Save to backend
        const { data, error } = await backendService.notes.addNote(
          userId,
          {
            title: noteTitle.trim(),
            content: noteContent.trim()
          }
        );

        if (error) {
          throw new Error(error.message || 'Failed to save note');
        }

        if (data) {
          toast.success('Note saved! 📝');
          onNoteAdded?.(data);
          resetForm();
          setOpen(false);
        }
      } else {
        // GUEST USER - Create local note
        const guestNote = {
          id: `guest-note-${Date.now()}`,
          title: noteTitle.trim(),
          content: noteContent.trim(),
          created_at: new Date().toISOString()
        };
        
        toast.success('Note saved! (Guest mode - resets on reload)');
        onNoteAdded?.(guestNote);
        resetForm();
        setOpen(false);
      }
    } catch (error: any) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNoteTitle('');
    setNoteContent('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gradient-secondary text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </DialogTrigger>
      <DialogContent className="glassmorphism sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Create New Note
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="note-title">Note Title</Label>
            <Input
              id="note-title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g., Study Notes, Meeting Notes..."
              disabled={loading}
              autoFocus
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note-content">Content</Label>
            <Textarea
              id="note-content"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your note here..."
              rows={6}
              disabled={loading}
              className="resize-none"
              maxLength={5000}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="gradient-secondary" 
              disabled={loading || !noteTitle.trim() || !noteContent.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Note
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
