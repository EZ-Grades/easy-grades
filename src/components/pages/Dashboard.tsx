import React, { useState, useEffect } from 'react';
import { CheckSquare, BookOpen, Target, Clock, TrendingUp, Plus, Play, Sparkles, Timer, Quote } from 'lucide-react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog"
import { Label } from "../ui/label"

import { toast } from 'sonner@2.0.3';
import { Badge } from "../ui/badge";
import { MotivationalQuotes } from '../features/MotivationalQuotes';
import { DrawingCanvas } from '../features/DrawingCanvas';
import { CalendarWidget } from '../CalendarWidget';
import { useTasks, useNotes, useStudySessions } from '../../hooks/useBackendData';
import { mockDataService } from '../../services/mockDataService';
import backendService from '../../services/backendService';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

interface DashboardProps {
  user?: any;
}



export function Dashboard({ user }: DashboardProps) {
  const [currentStreak, setCurrentStreak] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [timerMinutes, setTimerMinutes] = useState(25)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, percentage: 0 })
  const [completedSessions, setCompletedSessions] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  
  // Calendar integration states
  const [calendarEvents, setCalendarEvents] = useState<any[]>([
    { id: '1', title: 'Study Session', date: new Date(), emoji: '📚' },
    { id: '2', title: 'Break Time', date: new Date(Date.now() + 86400000), emoji: '☕' },
  ])


  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length

  // Load user data when component mounts or user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Load tasks with fallback
        try {
          const tasksResult = await backendService.tasks.getUserTasks(user.id);
          if (tasksResult.data) {
            setTasks(tasksResult.data.map(task => ({
              id: task.id,
              title: task.title,
              completed: task.completed,
              createdAt: new Date(task.created_at)
            })));
          }
        } catch (error) {
          console.error('Error loading tasks:', error);
          // Set demo tasks for demo purposes
          setTasks([
            { id: '1', title: 'Complete React tutorial', completed: false, createdAt: new Date() },
            { id: '2', title: 'Review JavaScript concepts', completed: true, createdAt: new Date() },
            { id: '3', title: 'Practice coding exercises', completed: false, createdAt: new Date() },
          ]);
        }

        // Load task stats with fallback
        try {
          const statsResult = await backendService.tasks.getTaskStats(user.id);
          if (statsResult.data) {
            setTaskStats(statsResult.data);
          }
        } catch (error) {
          console.error('Error loading task stats:', error);
          setTaskStats({ total: 3, completed: 1, percentage: 33 });
        }

        // Load notes with fallback
        try {
          const notesResult = await backendService.notes.getUserNotes(user.id);
          if (notesResult.data) {
            setNotes(notesResult.data.map(note => ({
              id: note.id,
              title: note.title,
              content: note.content || '',
              createdAt: new Date(note.created_at)
            })));
          }
        } catch (error) {
          console.error('Error loading notes:', error);
          // Set demo note
          setNotes([
            { id: '1', title: 'Study Notes', content: 'Remember to review the key concepts from today\'s session.', createdAt: new Date() },
          ]);
        }



        // Load focus session stats for streak with fallback
        try {
          const focusStatsResult = await backendService.focusSessions.getSessionStats(user.id);
          if (focusStatsResult.data) {
            setCurrentStreak(focusStatsResult.data.currentStreak);
            setCompletedSessions(focusStatsResult.data.totalSessions);
          }
        } catch (error) {
          console.error('Error loading focus stats:', error);
          setCurrentStreak(7); // Demo streak
          setCompletedSessions(12); // Demo sessions
        }

      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && (timerMinutes > 0 || timerSeconds > 0)) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(timerSeconds - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes(timerMinutes - 1);
          setTimerSeconds(59);
        }
      }, 1000);
    } else if (isTimerRunning && timerMinutes === 0 && timerSeconds === 0) {
      setIsTimerRunning(false);
      toast.success('Focus session completed! Great job!');
      
      // Update daily session stats if user is logged in
      if (user) {
        backendService.dailySessions.updateDailyStats(user.id, completedSessions + 1, (completedSessions + 1) * 25)
          .catch(error => console.error('Error updating daily stats:', error));
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerMinutes, timerSeconds, isTimerRunning, user, completedSessions]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    if (!user) {
      toast.error('Please log in to add tasks');
      return;
    }

    try {
      const result = await backendService.tasks.addTask(user.id, newTaskTitle.trim());
      if (result.success && result.data) {
        const newTask: Task = {
          id: result.data.id,
          title: result.data.title,
          completed: result.data.completed,
          createdAt: new Date(result.data.created_at)
        };
        setTasks([...tasks, newTask]);
        setNewTaskTitle('');
        setIsTaskDialogOpen(false);
        toast.success('Task added successfully!');

        // Update task stats
        const statsResult = await backendService.tasks.getTaskStats(user.id);
        if (statsResult.data) {
          setTaskStats(statsResult.data);
        }
      } else {
        toast.error(result.error?.message || 'Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const handleAddNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    
    if (!user) {
      toast.error('Please log in to add notes');
      return;
    }

    try {
      const result = await backendService.notes.addNote(user.id, newNoteTitle.trim(), newNoteContent.trim());
      if (result.success && result.data) {
        const newNote: Note = {
          id: result.data.id,
          title: result.data.title,
          content: result.data.content || '',
          createdAt: new Date(result.data.created_at)
        };
        setNotes([...notes, newNote]);
        setNewNoteTitle('');
        setNewNoteContent('');
        setIsNoteDialogOpen(false);
        toast.success('Note added successfully!');
      } else {
        toast.error(result.error?.message || 'Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !user) return;

    try {
      const result = await backendService.tasks.updateTaskCompletion(taskId, !task.completed);
      if (result.success) {
        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ));
        
        // Update task stats
        const statsResult = await backendService.tasks.getTaskStats(user.id);
        if (statsResult.data) {
          setTaskStats(statsResult.data);
        }
        
        toast.success(task.completed ? 'Task marked as incomplete' : 'Task completed!');
      } else {
        toast.error(result.error?.message || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    toast.success('Focus session started!');
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    toast.info('Focus session paused');
  };

  const resetTimer = () => {
    setTimerMinutes(25);
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };



  const handleQuickAction = (action: string, user?: any) => {
    switch (action) {
      case 'start-session':
        startTimer();
        break;
      case 'schedule':
        // Navigate to calendar/schedule feature
        toast.info('Calendar feature is now available in the dashboard!', {
          description: 'Use the calendar widget to track your study schedule.',
        });
        break;
      case 'generate-flashcards':
        if (user) {
          // Navigate to StudyHub for flashcard generation
          toast.success('Redirecting to StudyHub for AI flashcard generation!');
          // Dispatch custom event to navigate to StudyHub
          const event = new CustomEvent('navigate-to-studyhub');
          window.dispatchEvent(event);
        } else {
          toast.info('Sign in to access AI flashcard generation', {
            action: {
              label: 'Sign In',
              onClick: () => {
                const event = new CustomEvent('navigate-to-login');
                window.dispatchEvent(event);
              }
            }
          });
        }
        break;
      default:
        toast.info('Feature coming soon!');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl mb-2 text-gradient-primary">
          Welcome back{user ? `, ${user.full_name?.split(' ')[0] || user.email.split('@')[0]}` : ''}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Ready to make today productive? Let's continue your learning journey.
        </p>
      </motion.div>



      {/* Stats Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="glassmorphism border-0 hover:glow-highlight">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold text-gradient-highlight">{currentStreak} days</p>
                </div>
                <Target className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="glassmorphism border-0 hover:glow-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Focus Time</p>
                  <p className="text-2xl font-bold text-gradient-primary">{Math.round((completedSessions * 25) / 60)}h</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="glassmorphism border-0 hover:glow-secondary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tasks Completed</p>
                  <p className="text-2xl font-bold text-gradient-secondary">{completedTasks}/{totalTasks}</p>
                </div>
                <CheckSquare className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="glassmorphism border-0 hover:glow-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Study Sessions</p>
                  <p className="text-2xl font-bold text-gradient-primary">{completedSessions}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content Grid - Timer, Tasks, Notes */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8"
      >
        {/* Column 1 - Timer */}
        <div className="space-y-6">
          {/* Focus Timer */}
          <Card className="glassmorphism border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Focus Timer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-6xl font-mono font-bold text-center mb-4 text-gradient-primary">
                  {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                </div>
                <Progress 
                  value={((25 * 60) - (timerMinutes * 60 + timerSeconds)) / (25 * 60) * 100} 
                  className="h-2" 
                />
                <div className="flex justify-center gap-2">
                  {!isTimerRunning ? (
                    <Button onClick={startTimer} className="gradient-primary">
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  ) : (
                    <Button onClick={stopTimer} variant="outline">
                      <Clock className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Button onClick={resetTimer} variant="outline" size="sm">
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 2 - Tasks */}
        <div className="space-y-6">
          <Card className="glassmorphism border-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" />
                  Tasks ({tasks.filter(t => !t.completed).length} pending)
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gradient-primary text-white border-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="glassmorphism">
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                    <DialogDescription>
                      Create a new task to add to your daily todo list.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="task-title">Task Title</Label>
                      <Input
                        id="task-title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Enter task title..."
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddTask} className="gradient-primary flex-1">
                        Add Task
                      </Button>
                      <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        task.completed 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                          : 'bg-white/50 dark:bg-white/5 border-border'
                      }`}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          task.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {task.completed && <CheckSquare className="w-3 h-3" />}
                      </button>
                      <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Your tasks will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 3 - Notes */}
        <div className="space-y-6">
          <Card className="glassmorphism border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Quick Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gradient-secondary text-white border-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Note
                  </Button>
                </DialogTrigger>
                <DialogContent className="glassmorphism">
                  <DialogHeader>
                    <DialogTitle>Add New Note</DialogTitle>
                    <DialogDescription>
                      Create a quick note to remember important information.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="note-title">Note Title</Label>
                      <Input
                        id="note-title"
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        placeholder="Enter note title..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="note-content">Content</Label>
                      <Textarea
                        id="note-content"
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder="Enter note content..."
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddNote} className="gradient-secondary flex-1">
                        Add Note
                      </Button>
                      <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notes.length > 0 ? (
                  notes.map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-border"
                    >
                      <h4 className="font-medium mb-1">{note.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Your notes will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Calendar & Drawing Canvas Section - Centered Below */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
      >
        {/* Cute Calendar Widget - Pinterest Style */}
        <div className="flex justify-center">
          <CalendarWidget 
            events={calendarEvents}
            onEventAdd={(event) => {
              const newEvent = {
                ...event,
                id: Date.now().toString()
              };
              setCalendarEvents(prev => [...prev, newEvent]);
              toast.success('Event added!');
            }}
            onEventUpdate={(id, updates) => {
              setCalendarEvents(prev => 
                prev.map(event => 
                  event.id === id ? { ...event, ...updates } : event
                )
              );
            }}
            className="w-full max-w-md"
          />
        </div>

        {/* Creative Drawing Canvas */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <DrawingCanvas width={350} height={250} />
          </div>
        </div>
      </motion.div>

      {/* Daily Inspiration - Moved to Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8"
      >
        <MotivationalQuotes />
      </motion.div>
    </div>
  )
}