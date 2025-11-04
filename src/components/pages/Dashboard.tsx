import React, { useState, useEffect } from 'react';
import { CheckSquare, BookOpen, Target, Clock, TrendingUp, Plus, Play, Pause, Timer, Flame, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { toast } from 'sonner@2.0.3';
import { DailyInspiration } from '../DailyInspiration';
import { DrawingCanvas } from '../features/DrawingCanvas';
import { AdvancedCalendar } from '../AdvancedCalendar';
import { AddTaskDialog } from '../AddTaskDialog';
import { AddNoteDialog } from '../AddNoteDialog';
import { ProgressRing } from '../ProgressRing';
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
        const { data, error } = await backendService.tasks.toggleTaskCompletion(taskId, !task.completed);
        if (error) {
          throw error;
        }
        
        if (data) {
          // Update UI
          setTasks(tasks.map(t => 
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ));
          toast.success(task.completed ? 'Task marked as incomplete 🔁' : 'Task completed! ✅');
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl mb-1 text-gradient-primary">
          Welcome back{user ? `, ${user.full_name?.split(' ')[0] || user.email?.split('@')[0]}` : ''}
        </h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
              </motion.div>

      {/* Stats - Only show for logged-in users */}
      {user && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {/* Current Streak */}
          <Card className="glass-card-enhanced overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Streak</p>
                  <p className="text-2xl font-medium text-gradient-highlight">{currentStreak}</p>
                  <p className="text-xs text-muted-foreground">days</p>
                </div>
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30">
                  <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Focus Hours */}
          <Card className="glass-card-enhanced overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Focus</p>
                  <p className="text-2xl font-medium text-gradient-primary">{focusHours}</p>
                  <p className="text-xs text-muted-foreground">hours</p>
                </div>
                <div className="p-2 rounded-lg gradient-primary">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          <Card className="glass-card-enhanced overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tasks</p>
                  <p className="text-2xl font-medium text-gradient-primary">{completedTasks}/{totalTasks}</p>
                  <p className="text-xs text-muted-foreground">done</p>
                </div>
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                  <CheckSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Study Sessions */}
          <Card className="glass-card-enhanced overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sessions</p>
                  <p className="text-2xl font-medium text-gradient-secondary">{completedSessions}</p>
                  <p className="text-xs text-muted-foreground">total</p>
                </div>
                <div className="p-2 rounded-lg gradient-secondary">
                  <Target className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content Grid - Timer, Tasks, Notes */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8"
      >
        {/* Focus Timer */}
        <Card className="glass-card-enhanced flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-md gradient-primary">
                <Timer className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl text-gradient-primary">Focus Timer</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center pt-2">
            <div className="text-center w-full">
              {/* Minimal Circle Timer */}
              <div className="mb-6 flex justify-center">
                <ProgressRing 
                  progress={((25 * 60) - (timerMinutes * 60 + timerSeconds)) / (25 * 60) * 100} 
                  size={160} 
                  strokeWidth={6}
                  gradient="primary"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-1 font-mono text-foreground tabular-nums">
                      {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-muted-foreground font-normal">
                      {isTimerRunning ? 'Focusing' : 'Ready'}
                    </div>
                  </div>
                </ProgressRing>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center gap-2">
                {!isTimerRunning ? (
                  <Button onClick={startTimer} size="sm" className="gradient-primary text-white">
                    <Play className="w-3.5 h-3.5 mr-1.5" />
                    Start
                  </Button>
                ) : (
                  <Button onClick={pauseTimer} size="sm" variant="outline">
                    <Pause className="w-3.5 h-3.5 mr-1.5" />
                    Pause
                  </Button>
                )}
                <Button onClick={resetTimer} size="sm" variant="ghost">
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card className="glass-card-enhanced flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                  <CheckSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xl text-gradient-primary">Tasks</span>
              </div>
              <span className="text-xs font-normal text-muted-foreground">
                {tasks.filter(t => !t.completed).length} pending
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 flex flex-col pt-2">
            <AddTaskDialog 
              userId={user?.id} 
              onTaskAdded={handleTaskAdded}
            />
            
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all ${
                      task.completed 
                        ? 'bg-muted/30 border-border/50 opacity-60' 
                        : 'glass-card hover:border-primary/50 hover:shadow-lg'
                    }`}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        task.completed
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground/30 hover:border-primary'
                      }`}
                    >
                      {task.completed && <CheckSquare className="w-2.5 h-2.5 text-white" />}
                    </button>
                    <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No tasks yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="glass-card-enhanced flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-md gradient-highlight">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl text-gradient-highlight">Quick Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 flex flex-col pt-2">
            <AddNoteDialog 
              userId={user?.id} 
              onNoteAdded={handleNoteAdded}
            />
            
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-2.5 rounded-lg glass-card hover:border-primary/50 hover:shadow-lg transition-all"
                  >
                    <h4 className="text-sm font-medium mb-0.5">{note.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{note.content}</p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No notes yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Calendar & Drawing Canvas */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8"
      >
        <AdvancedCalendar />
        <DrawingCanvas width={672} height={550} />
      </motion.div>

      {/* Daily Inspiration */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <DailyInspiration />
      </motion.div>
    </div>
  );
}
