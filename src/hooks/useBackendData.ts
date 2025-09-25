import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Database } from '../types/database'
import { toast } from 'sonner@2.0.3'

// Type definitions
type Tables = Database['public']['Tables']

export interface Task extends Tables['tasks']['Row'] {}
export interface Note extends Tables['notes']['Row'] {}
export interface StudySession extends Tables['focus_sessions']['Row'] {}
export interface CalendarEvent extends Tables['calendar_events']['Row'] {}
export interface StudyRoom extends Tables['study_rooms']['Row'] {}
export interface Course extends Tables['courses']['Row'] {}
export interface Certification extends Tables['certifications']['Row'] {}
export interface UserStats extends Tables['user_stats']['Row'] {}
export interface Achievement extends Tables['achievements']['Row'] {}
export interface UserAchievement extends Tables['user_achievements']['Row'] {}

// Tasks Hook
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setTasks(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: Tables['tasks']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single()
      
      if (error) throw error
      await fetchTasks()
      return { success: true, task: data }
    } catch (err) {
      console.error('Error creating task:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create task' }
    }
  }

  const updateTask = async (id: string, updates: Tables['tasks']['Update']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
      await fetchTasks()
      return { success: true }
    } catch (err) {
      console.error('Error updating task:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update task' }
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await fetchTasks()
      return { success: true }
    } catch (err) {
      console.error('Error deleting task:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete task' }
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks
  }
}

// Notes Hook
export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          note_categories (
            id,
            name,
            color,
            icon
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setNotes(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching notes:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch notes')
    } finally {
      setLoading(false)
    }
  }

  const createNote = async (noteData: Tables['notes']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([noteData])
        .select()
        .single()
      
      if (error) throw error
      await fetchNotes()
      return { success: true, note: data }
    } catch (err) {
      console.error('Error creating note:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create note' }
    }
  }

  const updateNote = async (id: string, updates: Tables['notes']['Update']) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
      await fetchNotes()
      return { success: true }
    } catch (err) {
      console.error('Error updating note:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update note' }
    }
  }

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await fetchNotes()
      return { success: true }
    } catch (err) {
      console.error('Error deleting note:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete note' }
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes
  }
}

// Focus Sessions Hook
export function useFocusSessions() {
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .order('start_time', { ascending: false })
      
      if (error) throw error
      setSessions(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching focus sessions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch focus sessions')
    } finally {
      setLoading(false)
    }
  }

  const createSession = async (sessionData: Tables['focus_sessions']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .insert([sessionData])
        .select()
        .single()
      
      if (error) throw error
      await fetchSessions()
      return { success: true, session: data }
    } catch (err) {
      console.error('Error creating session:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create session' }
    }
  }

  const updateSession = async (id: string, updates: Tables['focus_sessions']['Update']) => {
    try {
      const { error } = await supabase
        .from('focus_sessions')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
      await fetchSessions()
      return { success: true }
    } catch (err) {
      console.error('Error updating session:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update session' }
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  return {
    sessions,
    loading,
    error,
    createSession,
    updateSession,
    refetch: fetchSessions
  }
}

// Calendar Events Hook
export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_time', { ascending: true })
      
      if (error) throw error
      setEvents(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching calendar events:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch calendar events')
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async (eventData: Tables['calendar_events']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([eventData])
        .select()
        .single()
      
      if (error) throw error
      await fetchEvents()
      return { success: true, event: data }
    } catch (err) {
      console.error('Error creating event:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create event' }
    }
  }

  const updateEvent = async (id: string, updates: Tables['calendar_events']['Update']) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
      await fetchEvents()
      return { success: true }
    } catch (err) {
      console.error('Error updating event:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update event' }
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await fetchEvents()
      return { success: true }
    } catch (err) {
      console.error('Error deleting event:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete event' }
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents
  }
}

// Courses Hook
export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          user_course_enrollments (
            id,
            progress_percentage,
            completed_at,
            enrolled_at
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setCourses(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching courses:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  const enrollInCourse = async (courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_course_enrollments')
        .insert([{
          user_id: user.id,
          course_id: courseId,
          progress_percentage: 0
        }])
        .select()
        .single()
      
      if (error) throw error
      await fetchCourses()
      return { success: true, enrollment: data }
    } catch (err) {
      console.error('Error enrolling in course:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to enroll in course' }
    }
  }

  const updateCourseProgress = async (courseId: string, progress: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const updates: any = { progress_percentage: progress }
      if (progress >= 100) {
        updates.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_course_enrollments')
        .update(updates)
        .eq('user_id', user.id)
        .eq('course_id', courseId)
      
      if (error) throw error
      await fetchCourses()
      return { success: true }
    } catch (err) {
      console.error('Error updating course progress:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update progress' }
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  return {
    courses,
    loading,
    error,
    enrollInCourse,
    updateCourseProgress,
    refetch: fetchCourses
  }
}

// User Stats Hook
export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
      
      // If no stats exist, create default stats
      if (!data) {
        const { data: newStats, error: createError } = await supabase
          .from('user_stats')
          .insert([{
            user_id: user.id,
            total_focus_minutes: 0,
            total_sessions: 0,
            current_streak_days: 0,
            longest_streak_days: 0,
            courses_completed: 0,
            certifications_earned: 0,
            total_points: 0
          }])
          .select()
          .single()
        
        if (createError) throw createError
        setStats(newStats)
      } else {
        setStats(data)
      }
      
      setError(null)
    } catch (err) {
      console.error('Error fetching user stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch user stats')
    } finally {
      setLoading(false)
    }
  }

  const updateStats = async (updates: Partial<UserStats>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('user_stats')
        .update(updates)
        .eq('user_id', user.id)
      
      if (error) throw error
      await fetchStats()
      return { success: true }
    } catch (err) {
      console.error('Error updating user stats:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update stats' }
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    updateStats,
    refetch: fetchStats
  }
}

// User Preferences Hook
export function useUserPreferences() {
  const [preferences, setPreferences] = useState<Tables['user_preferences']['Row'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPreferences = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      
      // If no preferences exist, create default preferences
      if (!data) {
        const { data: newPrefs, error: createError } = await supabase
          .from('user_preferences')
          .insert([{
            user_id: user.id,
            theme: 'system' as const,
            default_focus_duration: 25,
            default_break_duration: 5,
            notification_enabled: true,
            sound_enabled: true,
            auto_start_break: false,
            auto_start_focus: false
          }])
          .select()
          .single()
        
        if (createError) throw createError
        setPreferences(newPrefs)
      } else {
        setPreferences(data)
      }
      
      setError(null)
    } catch (err) {
      console.error('Error fetching preferences:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch preferences')
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (updates: Tables['user_preferences']['Update']) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id)
      
      if (error) throw error
      await fetchPreferences()
      return { success: true }
    } catch (err) {
      console.error('Error updating preferences:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update preferences' }
    }
  }

  useEffect(() => {
    fetchPreferences()
  }, [])

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refetch: fetchPreferences
  }
}

// Achievements Hook
export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAchievements = async () => {
    try {
      setLoading(true)
      
      // Fetch all achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (achievementsError) throw achievementsError
      
      // Fetch user's earned achievements
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: earnedAchievements, error: userAchievementsError } = await supabase
          .from('user_achievements')
          .select(`
            *,
            achievements (*)
          `)
          .eq('user_id', user.id)
        
        if (userAchievementsError) throw userAchievementsError
        setUserAchievements(earnedAchievements || [])
      }
      
      setAchievements(allAchievements || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching achievements:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch achievements')
    } finally {
      setLoading(false)
    }
  }

  const earnAchievement = async (achievementId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_achievements')
        .insert([{
          user_id: user.id,
          achievement_id: achievementId
        }])
        .select()
        .single()
      
      if (error) throw error
      await fetchAchievements()
      
      // Show toast notification
      const achievement = achievements.find(a => a.id === achievementId)
      if (achievement) {
        toast.success(`Achievement Unlocked: ${achievement.name}!`)
      }
      
      return { success: true, userAchievement: data }
    } catch (err) {
      console.error('Error earning achievement:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to earn achievement' }
    }
  }

  useEffect(() => {
    fetchAchievements()
  }, [])

  return {
    achievements,
    userAchievements,
    loading,
    error,
    earnAchievement,
    refetch: fetchAchievements
  }
}