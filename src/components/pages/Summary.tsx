import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Star, 
  Award, 
  Flame,
  BookOpen,
  Coffee,
  Zap,
  Trophy,
  Calendar,
  BarChart3
} from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { LuxuryButton } from '../LuxuryButton';
import { LuxuryBadge } from '../LuxuryBadge';
import { ProgressRing } from '../ProgressRing';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly' | 'milestone';
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  celebrationEmoji: string;
  achievedAt: string;
  points: number;
}

export function Summary() {
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const todayStats = {
    studyTime: 4.5,
    tasksCompleted: 8,
    streakDays: 12,
    focusScore: 87,
    breaksTaken: 3,
    coursesProgress: 2
  };

  const weekStats = {
    studyTime: 28.5,
    tasksCompleted: 42,
    averageFocus: 85,
    coursesCompleted: 1,
    quizzesTaken: 5,
    certificatesEarned: 1
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Early Bird',
      description: 'Started studying before 8 AM',
      icon: '🌅',
      type: 'daily',
      unlocked: true,
      unlockedAt: '2024-01-20T07:30:00Z'
    },
    {
      id: '2',
      title: 'Focus Master',
      description: 'Maintained focus for 2+ hours straight',
      icon: '🎯',
      type: 'daily',
      unlocked: true,
      unlockedAt: '2024-01-20T14:15:00Z'
    },
    {
      id: '3',
      title: 'Task Destroyer',
      description: 'Complete 10 tasks in one day',
      icon: '💪',
      type: 'daily',
      unlocked: false,
      progress: 8,
      target: 10
    },
    {
      id: '4',
      title: 'Week Warrior',
      description: 'Study every day this week',
      icon: '🏆',
      type: 'weekly',
      unlocked: false,
      progress: 5,
      target: 7
    },
    {
      id: '5',
      title: 'Knowledge Seeker',
      description: 'Complete 5 courses',
      icon: '📚',
      type: 'milestone',
      unlocked: false,
      progress: 3,
      target: 5
    },
    {
      id: '6',
      title: 'Streak Legend',
      description: 'Maintain a 30-day study streak',
      icon: '🔥',
      type: 'milestone',
      unlocked: false,
      progress: 12,
      target: 30
    }
  ];

  const milestones: Milestone[] = [
    {
      id: '1',
      title: 'First Course Complete!',
      description: 'Completed Advanced JavaScript Concepts',
      icon: '🎓',
      celebrationEmoji: '🎉',
      achievedAt: '2024-01-18T16:30:00Z',
      points: 500
    },
    {
      id: '2',
      title: '10-Day Streak!',
      description: 'Studied consistently for 10 days in a row',
      icon: '🔥',
      celebrationEmoji: '✨',
      achievedAt: '2024-01-15T20:00:00Z',
      points: 300
    },
    {
      id: '3',
      title: 'Quiz Master',
      description: 'Scored 90%+ on 5 different quizzes',
      icon: '🧠',
      celebrationEmoji: '🌟',
      achievedAt: '2024-01-12T11:45:00Z',
      points: 250
    }
  ];

  const chartData = [
    { day: 'Mon', studyTime: 3.5, tasks: 6 },
    { day: 'Tue', studyTime: 4.2, tasks: 8 },
    { day: 'Wed', studyTime: 2.8, tasks: 5 },
    { day: 'Thu', studyTime: 5.1, tasks: 9 },
    { day: 'Fri', studyTime: 4.8, tasks: 7 },
    { day: 'Sat', studyTime: 3.9, tasks: 6 },
    { day: 'Sun', studyTime: 4.2, tasks: 8 }
  ];

  const getAchievementVariant = (type: string) => {
    switch (type) {
      case 'daily': return 'primary';
      case 'weekly': return 'secondary';
      case 'milestone': return 'highlight';
      default: return 'primary';
    }
  };

  useEffect(() => {
    // Trigger celebration for new achievements
    const newAchievements = achievements.filter(a => 
      a.unlocked && a.unlockedAt && 
      new Date(a.unlockedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );
    if (newAchievements.length > 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, []);

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
            <span className="text-gradient-highlight">Daily Summary</span> 📊
          </h1>
          <p className="text-lg text-muted-foreground">Your learning journey at a glance</p>
        </motion.div>

        {/* Period Selector */}
        <div className="flex justify-center mb-8">
          <div className="glass-card p-2 flex gap-2">
            {[
              { id: 'today', label: 'Today', icon: Calendar },
              { id: 'week', label: 'This Week', icon: BarChart3 },
              { id: 'month', label: 'This Month', icon: TrendingUp }
            ].map((period) => {
              const Icon = period.icon;
              return (
                <motion.button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id as any)}
                  className={`
                    px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2
                    ${selectedPeriod === period.id
                      ? 'gradient-primary text-white shadow-lg'
                      : 'hover:bg-white/10 text-foreground/80 hover:text-foreground'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4" />
                  {period.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Stats Overview */}
        {selectedPeriod === 'today' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: 'Study Time', value: `${todayStats.studyTime}h`, icon: Clock, color: 'primary' },
              { label: 'Tasks Done', value: todayStats.tasksCompleted, icon: Target, color: 'secondary' },
              { label: 'Streak', value: `${todayStats.streakDays} days`, icon: Flame, color: 'highlight' },
              { label: 'Focus Score', value: `${todayStats.focusScore}%`, icon: Zap, color: 'primary' },
              { label: 'Breaks', value: todayStats.breaksTaken, icon: Coffee, color: 'secondary' },
              { label: 'Courses', value: `+${todayStats.coursesProgress}`, icon: BookOpen, color: 'highlight' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard gradient={stat.color as any} className="text-center" size="sm">
                    <Icon className="w-6 h-6 mx-auto mb-2 text-current" />
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Achievements */}
          <div className="lg:col-span-2">
            <GlassCard size="lg">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-5 h-5 text-highlight-solid" />
                <h2 className="text-xl font-semibold text-gradient-highlight">Achievements</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-300
                      ${achievement.unlocked 
                        ? 'bg-highlight-solid/10 border-highlight-solid/50 glow-highlight' 
                        : 'bg-muted/20 border-muted/50'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-lg
                          ${achievement.unlocked ? 'gradient-highlight' : 'bg-muted'}
                        `}>
                          {achievement.icon}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${achievement.unlocked ? '' : 'text-muted-foreground'}`}>
                            {achievement.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                      
                      <LuxuryBadge 
                        variant={getAchievementVariant(achievement.type) as any}
                        size="sm"
                        shimmer={achievement.unlocked}
                      >
                        {achievement.type}
                      </LuxuryBadge>
                    </div>

                    {!achievement.unlocked && achievement.progress !== undefined && achievement.target && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-xs font-medium">
                            {achievement.progress}/{achievement.target}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="gradient-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Streak and Recent Milestones */}
          <div className="space-y-6">
            {/* Streak Counter */}
            <GlassCard gradient="highlight">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4 text-gradient-highlight">
                  Study Streak
                </h3>
                
                <ProgressRing 
                  progress={(todayStats.streakDays / 30) * 100} 
                  size={120} 
                  strokeWidth={8}
                  gradient="highlight"
                >
                  <div className="text-center">
                    <div className="text-2xl">🔥</div>
                    <div className="text-2xl font-bold">{todayStats.streakDays}</div>
                    <div className="text-sm text-muted-foreground">days</div>
                  </div>
                </ProgressRing>

                <p className="text-sm text-muted-foreground mt-4">
                  Keep it up! You're {30 - todayStats.streakDays} days away from Streak Legend
                </p>
              </div>
            </GlassCard>

            {/* Recent Milestones */}
            <GlassCard>
              <h3 className="text-lg font-semibold mb-4 text-gradient-primary">
                Recent Milestones
              </h3>
              
              <div className="space-y-3">
                {milestones.slice(0, 3).map((milestone, index) => (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
                  >
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-sm">
                      {milestone.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{milestone.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(milestone.achievedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <LuxuryBadge variant="highlight" size="sm">
                      +{milestone.points}
                    </LuxuryBadge>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Study Time Chart */}
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <GlassCard size="lg">
            <h2 className="text-xl font-semibold mb-6 text-gradient-secondary">
              Weekly Study Overview
            </h2>
            
            <div className="grid grid-cols-7 gap-4">
              {chartData.map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="mb-2">
                    <div 
                      className="gradient-secondary rounded-lg mx-auto transition-all duration-500 hover:glow-secondary"
                      style={{ 
                        height: `${Math.max(day.studyTime * 20, 20)}px`,
                        width: '40px'
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">{day.day}</div>
                  <div className="text-sm font-medium">{day.studyTime}h</div>
                  <div className="text-xs text-muted-foreground">{day.tasks} tasks</div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Celebration Animation */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="text-center">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 1] 
                  }}
                  transition={{ 
                    duration: 0.5, 
                    repeat: Infinity,
                    repeatType: 'reverse' 
                  }}
                  className="text-8xl mb-4"
                >
                  🎉
                </motion.div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-3xl font-bold text-gradient-highlight"
                >
                  Achievement Unlocked!
                </motion.h2>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}