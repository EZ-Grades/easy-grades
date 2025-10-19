import React, { useState, useEffect } from 'react';
import { CheckSquare, BookOpen, Target, Clock, TrendingUp, Plus, Play, Pause, Timer, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { toast } from 'sonner@2.0.3';
import { DailyInspiration } from '../DailyInspiration';
import { DrawingCanvas } from '../features/DrawingCanvas';
import { AdvancedCalendar } from '../AdvancedCalendar';
import { AddTaskDialog } from '../AddTaskDialog';
import { AddNoteDialog } from '../AddNoteDialog';
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
  // Stats state
  const [currentStreak, setCurrentStreak] = useState(0);
  const [focusHours, setFocusHours] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  
  // Data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  
  // Timer state
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const [loading, setLoading] = useState(true);

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  // ============================================
  // 1. LOAD DATA ON DASHBOARD MOUNT
  // ============================================
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        // GUEST USER - No backend calls
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // LOGGED-IN USER - Fetch from backend

        // Fetch Tasks
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
        }

        // Fetch Notes
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
        }

        // Fetch Streak & Focus stats
        try {
          const focusStatsResult = await backendService.focusSessions.getSessionStats(user.id);
          if (focusStatsResult.data) {
            setCurrentStreak(focusStatsResult.data.currentStreak || 0);
            setCompletedSessions(focusStatsResult.data.totalSessions || 0);
            setFocusHours(Math.round((focusStatsResult.data.totalSessions || 0) * 25 / 60));
          }
        } catch (error) {
          console.error('Error loading focus stats:', error);
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

  // ============================================
  // 2. FOCUS TIMER - Start / Pause / Resume / Reset
  // ============================================
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
      // Timer reached 00:00
      setIsTimerRunning(false);
      handleSessionComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerMinutes, timerSeconds, isTimerRunning]);

  const handleSessionComplete = async () => {
    toast.success('Focus session completed! 🎉', {
      description: 'Great job staying focused!'
    });

    if (user) {
      // LOGGED-IN USER - Update backend
      try {
        // Record session (increments Study Sessions)
        await backendService.focusSessions.recordSession(user.id, 25);
        
        // Update daily stats (increments Focus Hours)
        const newSessionCount = completedSessions + 1;
        await backendService.dailySessions.updateDailyStats(user.id, newSessionCount, newSessionCount * 25);
        
        // Reload stats to get updated streak and sessions
        const focusStatsResult = await backendService.focusSessions.getSessionStats(user.id);
        if (focusStatsResult.data) {
          setCurrentStreak(focusStatsResult.data.currentStreak || 0);
          setCompletedSessions(focusStatsResult.data.totalSessions || 0);
          setFocusHours(Math.round((focusStatsResult.data.totalSessions || 0) * 25 / 60));
        }
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }
    // GUEST USER - No persistence
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    toast.success('Focus session started! 🎯');
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    toast.info('Focus session paused');
  };

  const resetTimer = () => {
    setTimerMinutes(25);
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  // ============================================
  // 3. ADD NEW TASK
  // ============================================
  const handleTaskAdded = async (task: any) => {
    const newTask: Task = {
      id: task.id,
      title: task.title,
      completed: task.completed || false,
      createdAt: new Date(task.created_at || Date.now())
    };
    
    // Show in UI instantly
    setTasks([...tasks, newTask]);
  };

  // ============================================
  // 4. TOGGLE TASK COMPLETION
  // ============================================
  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (user) {
      // LOGGED-IN USER - Update backend
      try {
        const result = await backendService.tasks.updateTaskCompletion(taskId, !task.completed);
        if (result.success) {
          // Update UI
          setTasks(tasks.map(t => 
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ));
          toast.success(task.completed ? 'Task marked as incomplete 🔁' : 'Task completed! ✅');
        } else {
          toast.error('Failed to update task');
        }
      } catch (error) {
        console.error('Error updating task:', error);
        toast.error('Failed to update task');
      }
    } else {
      // GUEST USER - Toggle locally (no backend)
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ));
      toast.success(task.completed ? 'Task marked as incomplete 🔁' : 'Task completed! ✅');
    }
  };

  // ============================================
  // 5. ADD NEW NOTE
  // ============================================
  const handleNoteAdded = (note: any) => {
    const newNote: Note = {
      id: note.id,
      title: note.title,
      content: note.content || '',
      createdAt: new Date(note.created_at || Date.now())
    };

    // Append to notes list
    setNotes([...notes, newNote]);
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
        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="text-5xl font-bold text-gradient-primary">
            Welcome back{user ? `, ${user.full_name?.split(' ')[0] || user.email?.split('@')[0]}` : ''}!
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Ready to make today productive? Let's continue your learning journey.
        </p>
      </motion.div>

      {/* Stats - Only show for logged-in users */}
      {user && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {/* Current Streak */}
          <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glassmorphism border-0 hover:glow-highlight transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Streak Days</p>
                    <p className="text-3xl font-bold text-gradient-highlight">{currentStreak} days</p>
                  </div>
                  <div className="relative">
                    <Flame className="w-10 h-10 text-orange-500" />
                    {currentStreak > 0 && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Focus Hours */}
          <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glassmorphism border-0 hover:glow-primary transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Focus Hours</p>
                    <p className="text-3xl font-bold text-gradient-primary">{focusHours}h</p>
                  </div>
                  <Clock className="w-10 h-10 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Completed Tasks */}
          <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glassmorphism border-0 hover:glow-secondary transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Tasks</p>
                    <p className="text-3xl font-bold text-gradient-secondary">{completedTasks}/{totalTasks}</p>
                  </div>
                  <CheckSquare className="w-10 h-10 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Study Sessions */}
          <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glassmorphism border-0 hover:glow-primary transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Study Sessions</p>
                    <p className="text-3xl font-bold text-gradient-primary">{completedSessions}</p>
                  </div>
                  <Target className="w-10 h-10 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Main Content Grid - Timer, Tasks, Notes */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8"
      >
        {/* Focus Timer */}
        <Card className="glassmorphism border-0 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Focus Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="text-center space-y-6">
              <div className="text-7xl font-mono font-bold text-gradient-primary">
                {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
              </div>
              <Progress 
                value={((25 * 60) - (timerMinutes * 60 + timerSeconds)) / (25 * 60) * 100} 
                className="h-3" 
              />
              <div className="flex justify-center gap-3">
                {!isTimerRunning ? (
                  <Button onClick={startTimer} className="gradient-primary">
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                ) : (
                  <Button onClick={pauseTimer} variant="outline">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
                <Button onClick={resetTimer} variant="outline">
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card className="glassmorphism border-0 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Tasks ({tasks.filter(t => !t.completed).length} pending)
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <AddTaskDialog 
              userId={user?.id} 
              onTaskAdded={handleTaskAdded}
            />
            
            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      task.completed 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-white/50 dark:bg-white/5 border-border hover:bg-white/70 dark:hover:bg-white/10'
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
                  <p>No tasks yet</p>
                  <p className="text-sm mt-2">Add your first task!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="glassmorphism border-0 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Quick Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <AddNoteDialog 
              userId={user?.id} 
              onNoteAdded={handleNoteAdded}
            />
            
            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-border hover:bg-white/70 dark:hover:bg-white/10 transition-all"
                  >
                    <h4 className="font-medium mb-1">{note.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No notes yet</p>
                  <p className="text-sm mt-2">Create your first note!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 6. Calendar & Drawing Canvas */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
      >
        {/* Calendar - Create events, mark sessions */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <AdvancedCalendar />
          </div>
        </div>

        {/* Drawing Canvas - Edit canvas, save/export */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <DrawingCanvas width={672} height={550} />
          </div>
        </div>
      </motion.div>

      {/* 9. Daily Inspiration - Fetch and display quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-8"
      >
        <DailyInspiration />
      </motion.div>
    </div>
  );
}
