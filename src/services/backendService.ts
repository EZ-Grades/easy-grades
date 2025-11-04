import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

// Type definitions for our database tables
type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];
type Note = Database['public']['Tables']['notes']['Row'];
type NoteInsert = Database['public']['Tables']['notes']['Insert'];
type NoteUpdate = Database['public']['Tables']['notes']['Update'];
type FocusSession = Database['public']['Tables']['focus_sessions']['Row'];
type FocusSessionInsert = Database['public']['Tables']['focus_sessions']['Insert'];
type FocusSessionUpdate = Database['public']['Tables']['focus_sessions']['Update'];
type DailyStat = Database['public']['Tables']['daily_stats']['Row'];
type WeeklyGoal = Database['public']['Tables']['weekly_goals']['Row'];
type Track = Database['public']['Tables']['tracks']['Row'];
type AmbientSound = Database['public']['Tables']['ambient_sounds']['Row'];

// ==========================================
// BREAK MODE - TRACKS SERVICE
// ==========================================

export const tracksService = {
  /**
   * Fetch all tracks with optional ordering and filtering
   */
  async getAllTracks(orderBy: 'title' | 'mood' | 'created_at' = 'title', mood?: string) {
    try {
      let query = supabase
        .from('tracks')
        .select('*')
        .eq('is_active', true); // Only active tracks

      if (mood) {
        query = query.eq('mood', mood);
      }

      query = query.order(orderBy);

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching tracks:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error in getAllTracks:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get track by ID
   */
  async getTrackById(id: string) {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error('Error fetching track:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Get tracks by mood
   */
  async getTracksByMood(mood: string) {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('mood', mood)
      .eq('is_active', true)
      .order('title');
    
    if (error) {
      console.error('Error fetching tracks by mood:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Get tracks by genre
   */
  async getTracksByGenre(genre: string) {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('genre', genre)
      .eq('is_active', true)
      .order('title');
    
    if (error) {
      console.error('Error fetching tracks by genre:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },
};

// ==========================================
// PLAYBACK STATE SERVICE
// ==========================================

export const playbackService = {
  /**
   * Get user's playback state
   */
  async getPlaybackState(userId: string) {
    const { data, error } = await supabase
      .from('playback_state')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error fetching playback state:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Update playback state
   */
  async updatePlaybackState(userId: string, state: Partial<Database['public']['Tables']['playback_state']['Update']>) {
    const { data, error } = await supabase
      .from('playback_state')
      .upsert({
        user_id: userId,
        ...state,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error updating playback state:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },
};

// ==========================================
// AMBIENT SOUNDS SERVICE
// ==========================================

export const ambientSoundsService = {
  /**
   * Get all ambient sounds
   */
  async getAllAmbientSounds() {
    const { data, error } = await supabase
      .from('ambient_sounds')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Error fetching ambient sounds:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Get user's ambient sound settings
   */
  async getUserSoundSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_sound_settings')
      .select(`
        *,
        ambient_sounds (*)
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user sound settings:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Update user sound setting
   */
  async updateSoundSetting(userId: string, ambientSoundId: string, enabled: boolean, volume: number) {
    const { data, error } = await supabase
      .from('user_sound_settings')
      .upsert({
        user_id: userId,
        ambient_sound_id: ambientSoundId,
        enabled,
        volume,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error updating sound setting:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },
};

// ==========================================
// TASKS SERVICE
// ==========================================

export const tasksService = {
  /**
   * Get all tasks for a user
   */
  async getUserTasks(userId: string, includeCompleted: boolean = true) {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null); // Exclude soft deleted

    if (!includeCompleted) {
      query = query.eq('completed', false);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Add a new task
   */
  async addTask(userId: string, task: Omit<TaskInsert, 'user_id' | 'id'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        ...task
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding task:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Update task
   */
  async updateTask(taskId: string, updates: TaskUpdate) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating task:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Toggle task completion
   */
  async toggleTaskCompletion(taskId: string, completed: boolean) {
    const updates: TaskUpdate = {
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) {
      console.error('Error toggling task completion:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Soft delete a task
   */
  async deleteTask(taskId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) {
      console.error('Error deleting task:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },
};

// ==========================================
// NOTES SERVICE
// ==========================================

export const notesService = {
  /**
   * Get all notes for a user
   */
  async getUserNotes(userId: string) {
    const { data, error } = await supabase
      .from('notes')
      .select(`
        *,
        note_categories (*)
      `)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notes:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Add a new note
   */
  async addNote(userId: string, note: Omit<NoteInsert, 'user_id' | 'id'>) {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        ...note
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding note:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Update note
   */
  async updateNote(noteId: string, updates: NoteUpdate) {
    const { data, error } = await supabase
      .from('notes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating note:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Soft delete a note
   */
  async deleteNote(noteId: string) {
    const { data, error } = await supabase
      .from('notes')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .select()
      .single();
    
    if (error) {
      console.error('Error deleting note:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Get note categories for a user
   */
  async getUserNoteCategories(userId: string) {
    const { data, error } = await supabase
      .from('note_categories')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    
    if (error) {
      console.error('Error fetching note categories:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },
};

// ==========================================
// FOCUS SESSIONS SERVICE
// ==========================================

export const focusSessionsService = {
  /**
   * Start a new focus session
   */
  async startSession(userId: string, durationMinutes: number, ambienceMode?: string) {
    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({
        user_id: userId,
        planned_duration: durationMinutes,
        duration_minutes: durationMinutes,
        status: 'active',
        focus_mode: ambienceMode || 'pomodoro',
        start_time: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error starting focus session:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Update session progress
   */
  async updateSession(sessionId: string, updates: FocusSessionUpdate) {
    const { data, error } = await supabase
      .from('focus_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating session:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Complete a session
   */
  async completeSession(sessionId: string, completedMinutes: number) {
    const { data, error } = await supabase
      .from('focus_sessions')
      .update({
        completed_minutes: completedMinutes,
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) {
      console.error('Error completing session:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Get user's recent sessions
   */
  async getUserSessions(userId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching sessions:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Get session statistics for a user
   */
  async getSessionStats(userId: string) {
    try {
      // Get all completed sessions
      const { data: sessions, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('start_time', { ascending: false });
      
      if (error) {
        console.error('Error fetching session stats:', error);
        return { data: null, error };
      }

      if (!sessions || sessions.length === 0) {
        return {
          data: {
            totalSessions: 0,
            totalMinutes: 0,
            currentStreak: 0,
            longestStreak: 0,
            averageSessionLength: 0,
            todaysSessions: 0,
            thisWeekSessions: 0,
          },
          error: null
        };
      }

      // Calculate total sessions and minutes
      const totalSessions = sessions.length;
      const totalMinutes = sessions.reduce((sum, s) => sum + (s.completed_minutes || 0), 0);
      const averageSessionLength = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

      // Calculate today's sessions
      const today = new Date().toISOString().split('T')[0];
      const todaysSessions = sessions.filter(s => 
        s.start_time && s.start_time.startsWith(today)
      ).length;

      // Calculate this week's sessions
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekSessions = sessions.filter(s => 
        s.start_time && new Date(s.start_time) >= oneWeekAgo
      ).length;

      // Calculate streak
      const sessionDates = [...new Set(
        sessions
          .filter(s => s.start_time)
          .map(s => s.start_time!.split('T')[0])
      )].sort().reverse();

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      if (sessionDates.length > 0) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Check if streak is still active (today or yesterday)
        if (sessionDates[0] === todayStr || sessionDates[0] === yesterdayStr) {
          let expectedDate = new Date(sessionDates[0]);
          
          for (const dateStr of sessionDates) {
            const sessionDate = new Date(dateStr);
            const expectedStr = expectedDate.toISOString().split('T')[0];
            
            if (dateStr === expectedStr) {
              currentStreak++;
              tempStreak++;
              longestStreak = Math.max(longestStreak, tempStreak);
              expectedDate.setDate(expectedDate.getDate() - 1);
            } else {
              tempStreak = 1;
              expectedDate = new Date(dateStr);
              expectedDate.setDate(expectedDate.getDate() - 1);
            }
          }
        } else {
          // Calculate longest streak even if current streak is broken
          let expectedDate = new Date(sessionDates[0]);
          
          for (const dateStr of sessionDates) {
            const sessionDate = new Date(dateStr);
            const expectedStr = expectedDate.toISOString().split('T')[0];
            
            if (dateStr === expectedStr) {
              tempStreak++;
              longestStreak = Math.max(longestStreak, tempStreak);
              expectedDate.setDate(expectedDate.getDate() - 1);
            } else {
              tempStreak = 1;
              expectedDate = new Date(dateStr);
              expectedDate.setDate(expectedDate.getDate() - 1);
            }
          }
        }
      }

      return {
        data: {
          totalSessions,
          totalMinutes,
          currentStreak,
          longestStreak,
          averageSessionLength,
          todaysSessions,
          thisWeekSessions,
        },
        error: null
      };
    } catch (error) {
      console.error('Error calculating session stats:', error);
      return { data: null, error: error as Error };
    }
  },
};

// ==========================================
// DAILY STATS SERVICE (renamed from daily_sessions)
// ==========================================

export const dailyStatsService = {
  /**
   * Get daily stats for a specific date
   */
  async getDailyStats(userId: string, date: string) {
    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('stat_date', date)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching daily stats:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Update or create daily stats
   */
  async updateDailyStats(userId: string, date: string, stats: Partial<Database['public']['Tables']['daily_stats']['Update']>) {
    const { data, error } = await supabase
      .from('daily_stats')
      .upsert({
        user_id: userId,
        stat_date: date,
        ...stats,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error updating daily stats:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Get stats for a date range
   */
  async getStatsRange(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .gte('stat_date', startDate)
      .lte('stat_date', endDate)
      .order('stat_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching stats range:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },
};

// ==========================================
// WEEKLY GOALS SERVICE
// ==========================================

export const weeklyGoalsService = {
  /**
   * Get weekly goal
   */
  async getWeeklyGoal(userId: string, weekStartDate: string) {
    const { data, error } = await supabase
      .from('weekly_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start_date', weekStartDate)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching weekly goal:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Create or update weekly goal
   */
  async upsertWeeklyGoal(userId: string, weekStartDate: string, targetHours: number, achievedHours?: number) {
    const { data, error } = await supabase
      .from('weekly_goals')
      .upsert({
        user_id: userId,
        week_start_date: weekStartDate,
        target_hours: targetHours,
        achieved_hours: achievedHours || 0,
        is_achieved: achievedHours ? achievedHours >= targetHours : false,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error upserting weekly goal:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Update goal progress
   */
  async updateGoalProgress(userId: string, weekStartDate: string, achievedHours: number) {
    // First get the goal to check target
    const { data: goal } = await this.getWeeklyGoal(userId, weekStartDate);
    
    const { data, error } = await supabase
      .from('weekly_goals')
      .update({
        achieved_hours: achievedHours,
        is_achieved: goal ? achievedHours >= goal.target_hours : false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('week_start_date', weekStartDate)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating goal progress:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },
};

// ==========================================
// USER PREFERENCES SERVICE
// ==========================================

export const userPreferencesService = {
  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user preferences:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: string, preferences: Partial<Database['public']['Tables']['user_preferences']['Update']>) {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user preferences:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },
};

// ==========================================
// USER STATS SERVICE
// ==========================================

export const userStatsService = {
  /**
   * Get user stats
   */
  async getUserStats(userId: string) {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user stats:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Update user stats
   */
  async updateUserStats(userId: string, stats: Partial<Database['public']['Tables']['user_stats']['Update']>) {
    const { data, error } = await supabase
      .from('user_stats')
      .update({
        ...stats,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user stats:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },
};

// Export all services
export const backendService = {
  tracks: tracksService,
  playback: playbackService,
  ambientSounds: ambientSoundsService,
  tasks: tasksService,
  notes: notesService,
  focusSessions: focusSessionsService,
  dailyStats: dailyStatsService,
  weeklyGoals: weeklyGoalsService,
  userPreferences: userPreferencesService,
  userStats: userStatsService,
};

export default backendService;
