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

// Mock types for tables that don't exist yet
interface MockTrack {
  id: string;
  name: string;
  url: string;
  mood: string;
  duration?: number;
  created_at: string;
}

interface MockAmbientSound {
  id: string;
  name: string;
  file_url: string;
  category: string;
  volume: number;
}

interface MockAmbienceMode {
  id: string;
  name: string;
  description: string;
  sounds: string[];
  background_color: string;
}

// ==========================================
// BREAK MODE - TRACKS SERVICE
// ==========================================

export const tracksService = {
  /**
   * Fetch all tracks with optional ordering and filtering
   */
  async getAllTracks(orderBy: 'name' | 'mood' | 'created_at' = 'name', mood?: string) {
    try {
      let query = supabase
        .from('tracks')
        .select('*');

      if (mood) {
        query = query.eq('mood', mood);
      }

      query = query.order(orderBy);

      const { data, error } = await query;
      
      if (error) {
        console.debug('Tracks table not available:', error.message);
        // Return mock data when table doesn't exist
        const mockTracks: MockTrack[] = [
          {
            id: '1',
            name: 'Lofi Hip Hop',
            url: '/music/lofi.mp3',
            mood: 'focus',
            duration: 180,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Nature Sounds',
            url: '/music/nature.mp3',
            mood: 'relaxing',
            duration: 240,
            created_at: new Date().toISOString()
          }
        ];
        const filteredTracks = mood ? mockTracks.filter(track => track.mood === mood) : mockTracks;
        return { data: filteredTracks, error: null };
      }
      
      return { data, error: null };
    } catch (error) {
      console.debug('Tracks table not available:', error);
      const mockTracks: MockTrack[] = [
        {
          id: '1',
          name: 'Lofi Hip Hop',
          url: '/music/lofi.mp3',
          mood: 'focus',
          duration: 180,
          created_at: new Date().toISOString()
        }
      ];
      return { data: mockTracks, error: null };
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
      .single();
    
    if (error) {
      console.error('Error fetching track:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Get track by name
   */
  async getTrackByName(name: string) {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('name', name)
      .single();
    
    if (error) {
      console.error('Error fetching track:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Record track play in history
   */
  async recordPlay(userId: string, trackId: string) {
    const { data, error } = await supabase
      .from('user_play_history')
      .insert({
        user_id: userId,
        track_id: trackId
      });
    
    if (error) {
      console.error('Error recording play:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  },

  /**
   * Get user's play history
   */
  async getPlayHistory(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('user_play_history')
      .select(`
        *,
        tracks (*)
      `)
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching play history:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  }
};

// ==========================================
// VOLUME SETTINGS SERVICE
// ==========================================

export const volumeService = {
  /**
   * Get user volume settings
   */
  async getUserVolumeSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_volume_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // Not found error is OK
      console.error('Error fetching volume settings:', error);
      return { data: null, error };
    }
    
    // Return default settings if not found
    if (!data) {
      return { 
        data: { 
          user_id: userId, 
          master_volume: 70, 
          ambient_volume: 50 
        }, 
        error: null 
      };
    }
    
    return { data, error: null };
  },

  /**
   * Update user volume settings
   */
  async updateVolumeSettings(userId: string, settings: Partial<Database['public']['Tables']['user_volume_settings']['Update']>) {
    const { data, error } = await supabase
      .from('user_volume_settings')
      .upsert({
        user_id: userId,
        ...settings
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error updating volume settings:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  }
};

// ==========================================
// DASHBOARD - TASKS SERVICE
// ==========================================

export const tasksService = {
  /**
   * Get all tasks for a user
   */
  async getUserTasks(userId: string, orderBy: 'created_at' | 'title' = 'created_at') {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order(orderBy, { ascending: orderBy === 'title' });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Add a new task
   */
  async addTask(userId: string, title: string) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title,
        completed: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding task:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  },

  /**
   * Update task completion status
   */
  async updateTaskCompletion(taskId: string, completed: boolean) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating task:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  },

  /**
   * Update task title
   */
  async updateTask(taskId: string, updates: TaskUpdate) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating task:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  },

  /**
   * Delete a task
   */
  async deleteTask(taskId: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    
    if (error) {
      console.error('Error deleting task:', error);
      return { success: false, error };
    }
    
    return { success: true };
  },

  /**
   * Get task statistics for a user
   */
  async getTaskStats(userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('completed')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching task stats:', error);
      return { data: null, error };
    }
    
    const total = data.length;
    const completed = data.filter(task => task.completed).length;
    
    return { 
      data: { total, completed, percentage: total > 0 ? (completed / total) * 100 : 0 }, 
      error: null 
    };
  }
};

// ==========================================
// DASHBOARD - NOTES SERVICE
// ==========================================

export const notesService = {
  /**
   * Get all notes for a user
   */
  async getUserNotes(userId: string, orderBy: 'created_at' | 'title' = 'created_at') {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order(orderBy, { ascending: false });
    
    if (error) {
      console.error('Error fetching notes:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Add a new note
   */
  async addNote(userId: string, title: string, content: string = '') {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        title,
        content
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding note:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  },

  /**
   * Update a note
   */
  async updateNote(noteId: string, updates: NoteUpdate) {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', noteId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating note:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  },

  /**
   * Delete a note
   */
  async deleteNote(noteId: string) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);
    
    if (error) {
      console.error('Error deleting note:', error);
      return { success: false, error };
    }
    
    return { success: true };
  }
};

// ==========================================
// DASHBOARD - WEEKLY GOALS SERVICE
// ==========================================

export const weeklyGoalsService = {
  /**
   * Get weekly goal for a user (current week)
   */
  async getCurrentWeeklyGoal(userId: string) {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekStart = startOfWeek.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('weekly_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start_date', weekStart)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching weekly goal:', error);
      return { data: null, error };
    }
    
    // Create default goal if not found
    if (!data) {
      const { data: newGoal, error: createError } = await supabase
        .from('weekly_goals')
        .insert({
          user_id: userId,
          hours_goal: 40,
          progress_hours: 0,
          week_start_date: weekStart
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating weekly goal:', createError);
        return { data: null, error: createError };
      }
      
      return { data: newGoal, error: null };
    }
    
    return { data, error: null };
  },

  /**
   * Update weekly goal progress
   */
  async updateProgress(userId: string, progressHours: number) {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekStart = startOfWeek.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('weekly_goals')
      .update({ progress_hours: progressHours })
      .eq('user_id', userId)
      .eq('week_start_date', weekStart)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating progress:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  },

  /**
   * Set new weekly goal
   */
  async setWeeklyGoal(userId: string, hoursGoal: number) {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekStart = startOfWeek.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('weekly_goals')
      .upsert({
        user_id: userId,
        hours_goal: hoursGoal,
        week_start_date: weekStart
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error setting weekly goal:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  }
};

// ==========================================
// DASHBOARD - DAILY SESSIONS SERVICE
// ==========================================

export const dailySessionsService = {
  /**
   * Get or create today's session record
   */
  async getTodaySession(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('session_date', today)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching daily session:', error);
      return { data: null, error };
    }
    
    if (!data) {
      const { data: newSession, error: createError } = await supabase
        .from('daily_sessions')
        .insert({
          user_id: userId,
          session_date: today,
          completed_sessions: 0,
          total_minutes: 0
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating daily session:', createError);
        return { data: null, error: createError };
      }
      
      return { data: newSession, error: null };
    }
    
    return { data, error: null };
  },

  /**
   * Update daily session stats
   */
  async updateDailyStats(userId: string, completedSessions: number, totalMinutes: number) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_sessions')
      .upsert({
        user_id: userId,
        session_date: today,
        completed_sessions: completedSessions,
        total_minutes: totalMinutes
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error updating daily stats:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  },

  /**
   * Get weekly session stats
   */
  async getWeeklyStats(userId: string) {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekStart = startOfWeek.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('session_date', weekStart)
      .order('session_date');
    
    if (error) {
      console.error('Error fetching weekly stats:', error);
      return { data: null, error };
    }
    
    const totalSessions = data.reduce((sum, day) => sum + (day.completed_sessions || 0), 0);
    const totalMinutes = data.reduce((sum, day) => sum + (day.total_minutes || 0), 0);
    
    return { 
      data: { 
        sessions: data, 
        totalSessions, 
        totalMinutes,
        totalHours: Math.round(totalMinutes / 60 * 100) / 100
      }, 
      error: null 
    };
  }
};

// ==========================================
// FOCUS MODE - FOCUS SESSIONS SERVICE
// ==========================================

export const focusSessionsService = {
  /**
   * Start a new focus session
   */
  async startSession(userId: string, durationMinutes: number, ambienceMode?: string, fullscreen: boolean = false) {
    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({
        user_id: userId,
        duration_minutes: durationMinutes,
        start_time: new Date().toISOString(),
        ambience_mode: ambienceMode,
        fullscreen,
        completed: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error starting focus session:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  },

  /**
   * Update session progress
   */
  async updateSessionProgress(sessionId: string, completedMinutes: number) {
    const { data, error } = await supabase
      .from('focus_sessions')
      .update({ completed_minutes: completedMinutes })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating session progress:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  },

  /**
   * End a focus session
   */
  async endSession(sessionId: string, completedMinutes?: number) {
    const updates: any = {
      end_time: new Date().toISOString(),
      completed: true
    };
    
    if (completedMinutes !== undefined) {
      updates.completed_minutes = completedMinutes;
    }
    
    const { data, error } = await supabase
      .from('focus_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) {
      console.error('Error ending session:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  },

  /**
   * Get user's focus sessions
   */
  async getUserSessions(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching focus sessions:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Get focus session statistics
   */
  async getSessionStats(userId: string) {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true);
    
    if (error) {
      console.error('Error fetching session stats:', error);
      return { data: null, error };
    }
    
    const totalSessions = data.length;
    const totalFocusTime = data.reduce((sum, session) => sum + (session.completed_minutes || 0), 0);
    const fullscreenSessions = data.filter(session => session.fullscreen).length;
    
    // Calculate current streak
    const today = new Date();
    let currentStreak = 0;
    
    // Sort sessions by date (most recent first)
    const sessionsByDate = data.sort((a, b) => 
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );
    
    // Group by date and check for consecutive days
    const sessionDates = [...new Set(sessionsByDate.map(session => 
      new Date(session.start_time).toDateString()
    ))];
    
    for (let i = 0; i < sessionDates.length; i++) {
      const sessionDate = new Date(sessionDates[i]);
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return { 
      data: { 
        totalSessions, 
        totalFocusTime, 
        fullscreenSessions, 
        currentStreak,
        totalHours: Math.round(totalFocusTime / 60 * 100) / 100
      }, 
      error: null 
    };
  }
};

// ==========================================
// FOCUS MODE - AMBIENT SOUNDS SERVICE
// ==========================================

export const ambientSoundsService = {
  /**
   * Get all ambient sounds
   */
  async getAllAmbientSounds() {
    try {
      const { data, error } = await supabase
        .from('ambient_sounds')
        .select('*')
        .order('name');
      
      if (error) {
        console.debug('Ambient sounds table not available:', error.message);
        // Return mock data when table doesn't exist
        const mockSounds: MockAmbientSound[] = [
          {
            id: '1',
            name: 'Rain Sounds',
            file_url: '/sounds/rain.mp3',
            category: 'nature',
            volume: 70
          },
          {
            id: '2',
            name: 'Forest Ambience',
            file_url: '/sounds/forest.mp3',
            category: 'nature',
            volume: 60
          },
          {
            id: '3',
            name: 'Coffee Shop',
            file_url: '/sounds/cafe.mp3',
            category: 'urban',
            volume: 50
          }
        ];
        return { data: mockSounds, error: null };
      }
      
      return { data, error: null };
    } catch (error) {
      console.debug('Ambient sounds table not available:', error);
      // Return mock data when table doesn't exist
      const mockSounds: MockAmbientSound[] = [
        {
          id: '1',
          name: 'Rain Sounds',
          file_url: '/sounds/rain.mp3',
          category: 'nature',
          volume: 70
        },
        {
          id: '2',
          name: 'Forest Ambience',
          file_url: '/sounds/forest.mp3',
          category: 'nature',
          volume: 60
        }
      ];
      return { data: mockSounds, error: null };
    }
  },

  /**
   * Get user's ambient sound settings
   */
  async getUserAmbientSettings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_ambient_settings')
        .select(`
          *,
          ambient_sounds (*)
        `)
        .eq('user_id', userId);
      
      if (error) {
        console.debug('User ambient settings table not available:', error.message);
        // Return empty array when table doesn't exist
        return { data: [], error: null };
      }
      
      return { data, error: null };
    } catch (error) {
      console.debug('User ambient settings table not available:', error);
      // Return empty array when table doesn't exist
      return { data: [], error: null };
    }
  },

  /**
   * Toggle ambient sound on/off
   */
  async toggleAmbientSound(userId: string, ambientSoundId: string, enabled: boolean, volume: number = 50) {
    try {
      const { data, error } = await supabase
        .from('user_ambient_settings')
        .upsert({
          user_id: userId,
          ambient_sound_id: ambientSoundId,
          enabled,
          volume
        })
        .select()
        .single();
      
      if (error) {
        console.debug('User ambient settings table not available:', error.message);
        // Return mock success when table doesn't exist
        return { 
          success: true, 
          data: { 
            user_id: userId, 
            ambient_sound_id: ambientSoundId, 
            enabled, 
            volume 
          } 
        };
      }
      
      return { success: true, data };
    } catch (error) {
      console.debug('User ambient settings table not available:', error);
      // Return mock success when table doesn't exist
      return { 
        success: true, 
        data: { 
          user_id: userId, 
          ambient_sound_id: ambientSoundId, 
          enabled, 
          volume 
        } 
      };
    }
  },

  /**
   * Update user ambient setting (alias for toggleAmbientSound)
   */
  async updateUserAmbientSetting(userId: string, ambientSoundId: string, enabled: boolean, volume: number) {
    return this.toggleAmbientSound(userId, ambientSoundId, enabled, volume);
  },

  /**
   * Adjust ambient sound volume
   */
  async adjustVolume(userId: string, ambientSoundId: string, volume: number) {
    try {
      const { data, error } = await supabase
        .from('user_ambient_settings')
        .update({ volume })
        .eq('user_id', userId)
        .eq('ambient_sound_id', ambientSoundId)
        .select()
        .single();
      
      if (error) {
        console.error('Error adjusting volume:', error);
        return { success: false, error };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('User ambient settings table not available:', error);
      return { success: false, error };
    }
  }
};

// ==========================================
// FOCUS MODE - DISTRACTION BLOCKER SERVICE
// ==========================================

export const distractionBlockerService = {
  /**
   * Get user settings
   */
  async getUserSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user settings:', error);
      return { data: null, error };
    }
    
    // Return default settings if not found
    if (!data) {
      return { 
        data: { 
          user_id: userId, 
          distraction_block_enabled: false, 
          show_blocked_sites: true 
        }, 
        error: null 
      };
    }
    
    return { data, error: null };
  },

  /**
   * Update user settings
   */
  async updateSettings(userId: string, settings: Partial<UserSettingsUpdate>) {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...settings
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user settings:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  },

  /**
   * Get blocked sites for user
   */
  async getBlockedSites(userId: string) {
    const { data, error } = await supabase
      .from('blocked_sites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching blocked sites:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  /**
   * Add blocked site
   */
  async addBlockedSite(userId: string, url: string) {
    const { data, error } = await supabase
      .from('blocked_sites')
      .insert({
        user_id: userId,
        url
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding blocked site:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  },

  /**
   * Remove blocked site
   */
  async removeBlockedSite(siteId: string) {
    const { error } = await supabase
      .from('blocked_sites')
      .delete()
      .eq('id', siteId);
    
    if (error) {
      console.error('Error removing blocked site:', error);
      return { success: false, error };
    }
    
    return { success: true };
  }
};

// ==========================================
// FOCUS MODE - AMBIENCE MODES SERVICE
// ==========================================

export const ambienceModesService = {
  /**
   * Get all ambience modes
   */
  async getAllAmbienceModes() {
    try {
      const { data, error } = await supabase
        .from('ambience_modes')
        .select('*')
        .order('name');
      
      if (error) {
        console.warn('Ambience modes table not available:', error.message);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.warn('Ambience modes table not available:', error);
      return { data: null, error };
    }
  },

  /**
   * Get ambience mode by ID
   */
  async getAmbienceModeById(id: string) {
    try {
      const { data, error } = await supabase
        .from('ambience_modes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching ambience mode:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Ambience modes table not available:', error);
      return { data: null, error };
    }
  }
};

// Export all services
export const backendService = {
  tracks: tracksService,
  volume: volumeService,
  tasks: tasksService,
  notes: notesService,
  weeklyGoals: weeklyGoalsService,
  dailySessions: dailySessionsService,
  focusSessions: focusSessionsService,
  ambientSounds: ambientSoundsService,
  distractionBlocker: distractionBlockerService,
  ambienceModes: ambienceModesService
};

export default backendService;