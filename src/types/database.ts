export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_history: {
        Row: {
          id: string
          user_id: string
          message: string
          response: string
          session_id: string | null
          message_type: 'user' | 'assistant' | 'system'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          response: string
          session_id?: string | null
          message_type?: 'user' | 'assistant' | 'system'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          response?: string
          session_id?: string | null
          message_type?: 'user' | 'assistant' | 'system'
          created_at?: string
        }
      }
      ai_chat_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          context_type: 'general' | 'study_help' | 'course_specific' | 'homework_help'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          context_type?: 'general' | 'study_help' | 'course_specific' | 'homework_help'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          context_type?: 'general' | 'study_help' | 'course_specific' | 'homework_help'
          created_at?: string
          updated_at?: string
        }
      }
      tracks: {
        Row: {
          id: string
          name: string
          mood: string
          genre: string
          description: string | null
          url: string
          cover_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          mood: string
          genre: string
          description?: string | null
          url: string
          cover_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          mood?: string
          genre?: string
          description?: string | null
          url?: string
          cover_url?: string | null
          created_at?: string
        }
      }
      user_play_history: {
        Row: {
          id: string
          user_id: string
          track_id: string
          played_at: string
        }
        Insert: {
          id?: string
          user_id: string
          track_id: string
          played_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          track_id?: string
          played_at?: string
        }
      }
      user_volume_settings: {
        Row: {
          user_id: string
          master_volume: number
          ambient_volume: number
          updated_at: string
        }
        Insert: {
          user_id: string
          master_volume?: number
          ambient_volume?: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          master_volume?: number
          ambient_volume?: number
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          priority: 'low' | 'medium' | 'high'
          due_date: string | null
          category: string | null
          tags: string[] | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          category?: string | null
          tags?: string[] | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          category?: string | null
          tags?: string[] | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string | null
          category_id: string | null
          tags: string[] | null
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: string | null
          category_id?: string | null
          tags?: string[] | null
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string | null
          category_id?: string | null
          tags?: string[] | null
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      note_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string | null
          icon?: string | null
          created_at?: string
        }
      }
      weekly_goals: {
        Row: {
          id: string
          user_id: string
          hours_goal: number
          progress_hours: number
          week_start_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          hours_goal?: number
          progress_hours?: number
          week_start_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          hours_goal?: number
          progress_hours?: number
          week_start_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      daily_sessions: {
        Row: {
          id: string
          user_id: string
          session_date: string
          completed_sessions: number
          total_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_date: string
          completed_sessions?: number
          total_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_date?: string
          completed_sessions?: number
          total_minutes?: number
          created_at?: string
          updated_at?: string
        }
      }
      focus_sessions: {
        Row: {
          id: string
          user_id: string
          duration_minutes: number
          completed_minutes: number
          start_time: string
          end_time: string | null
          ambience_mode: string | null
          fullscreen: boolean
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          duration_minutes: number
          completed_minutes?: number
          start_time: string
          end_time?: string | null
          ambience_mode?: string | null
          fullscreen?: boolean
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          duration_minutes?: number
          completed_minutes?: number
          start_time?: string
          end_time?: string | null
          ambience_mode?: string | null
          fullscreen?: boolean
          completed?: boolean
          created_at?: string
        }
      }
      ambient_sounds: {
        Row: {
          id: string
          name: string
          default_volume: number
          icon: string | null
          audio_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          default_volume?: number
          icon?: string | null
          audio_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          default_volume?: number
          icon?: string | null
          audio_url?: string | null
          created_at?: string
        }
      }
      user_ambient_settings: {
        Row: {
          id: string
          user_id: string
          ambient_sound_id: string
          enabled: boolean
          volume: number
        }
        Insert: {
          id?: string
          user_id: string
          ambient_sound_id: string
          enabled?: boolean
          volume?: number
        }
        Update: {
          id?: string
          user_id?: string
          ambient_sound_id?: string
          enabled?: boolean
          volume?: number
        }
      }
      blocked_sites: {
        Row: {
          id: string
          user_id: string
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          distraction_block_enabled: boolean
          show_blocked_sites: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          distraction_block_enabled?: boolean
          show_blocked_sites?: boolean
          updated_at?: string
        }
        Update: {
          user_id?: string
          distraction_block_enabled?: boolean
          show_blocked_sites?: boolean
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          theme: 'light' | 'dark' | 'system'
          default_focus_duration: number
          default_break_duration: number
          notification_enabled: boolean
          sound_enabled: boolean
          auto_start_break: boolean
          auto_start_focus: boolean
          preferred_ambient_sound: string | null
          dashboard_layout: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          theme?: 'light' | 'dark' | 'system'
          default_focus_duration?: number
          default_break_duration?: number
          notification_enabled?: boolean
          sound_enabled?: boolean
          auto_start_break?: boolean
          auto_start_focus?: boolean
          preferred_ambient_sound?: string | null
          dashboard_layout?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          theme?: 'light' | 'dark' | 'system'
          default_focus_duration?: number
          default_break_duration?: number
          notification_enabled?: boolean
          sound_enabled?: boolean
          auto_start_break?: boolean
          auto_start_focus?: boolean
          preferred_ambient_sound?: string | null
          dashboard_layout?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      ambience_modes: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          bg_class: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          bg_class?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          bg_class?: string | null
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          duration_hours: number
          icon: string | null
          color: string | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          duration_hours?: number
          icon?: string | null
          color?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          duration_hours?: number
          icon?: string | null
          color?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      certifications: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          progress_percentage: number
          icon: string | null
          color: string | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          progress_percentage?: number
          icon?: string | null
          color?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          progress_percentage?: number
          icon?: string | null
          color?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      learning_paths: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          estimated_duration_hours: number
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          icon: string | null
          color: string | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          estimated_duration_hours?: number
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          icon?: string | null
          color?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          estimated_duration_hours?: number
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          icon?: string | null
          color?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_course_enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          progress_percentage: number
          completed_at: string | null
          enrolled_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          progress_percentage?: number
          completed_at?: string | null
          enrolled_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          progress_percentage?: number
          completed_at?: string | null
          enrolled_at?: string
        }
      }
      user_certification_progress: {
        Row: {
          id: string
          user_id: string
          certification_id: string
          progress_percentage: number
          completed_at: string | null
          started_at: string
        }
        Insert: {
          id?: string
          user_id: string
          certification_id: string
          progress_percentage?: number
          completed_at?: string | null
          started_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          certification_id?: string
          progress_percentage?: number
          completed_at?: string | null
          started_at?: string
        }
      }
      learning_path_courses: {
        Row: {
          id: string
          learning_path_id: string
          course_id: string
          order_index: number
        }
        Insert: {
          id?: string
          learning_path_id: string
          course_id: string
          order_index: number
        }
        Update: {
          id?: string
          learning_path_id?: string
          course_id?: string
          order_index?: number
        }
      }
      user_learning_path_enrollments: {
        Row: {
          id: string
          user_id: string
          learning_path_id: string
          progress_percentage: number
          completed_at: string | null
          enrolled_at: string
        }
        Insert: {
          id?: string
          user_id: string
          learning_path_id: string
          progress_percentage?: number
          completed_at?: string | null
          enrolled_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          learning_path_id?: string
          progress_percentage?: number
          completed_at?: string | null
          enrolled_at?: string
        }
      }
      study_rooms: {
        Row: {
          id: string
          name: string
          description: string | null
          room_code: string
          host_user_id: string
          max_participants: number
          is_public: boolean
          password_hash: string | null
          focus_mode: string
          ambient_sound: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          room_code: string
          host_user_id: string
          max_participants?: number
          is_public?: boolean
          password_hash?: string | null
          focus_mode?: string
          ambient_sound?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          room_code?: string
          host_user_id?: string
          max_participants?: number
          is_public?: boolean
          password_hash?: string | null
          focus_mode?: string
          ambient_sound?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      room_participants: {
        Row: {
          id: string
          room_id: string
          user_id: string
          joined_at: string
          left_at: string | null
          status: 'studying' | 'break' | 'away'
          study_time_minutes: number
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          joined_at?: string
          left_at?: string | null
          status?: 'studying' | 'break' | 'away'
          study_time_minutes?: number
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          joined_at?: string
          left_at?: string | null
          status?: 'studying' | 'break' | 'away'
          study_time_minutes?: number
        }
      }
      room_chat_messages: {
        Row: {
          id: string
          room_id: string
          user_id: string
          message: string
          message_type: 'text' | 'system' | 'emoji_reaction'
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          message: string
          message_type?: 'text' | 'system' | 'emoji_reaction'
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          message?: string
          message_type?: 'text' | 'system' | 'emoji_reaction'
          created_at?: string
        }
      }
      canvas_sessions: {
        Row: {
          id: string
          room_id: string
          canvas_data: Json | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          canvas_data?: Json | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          canvas_data?: Json | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      canvas_strokes: {
        Row: {
          id: string
          canvas_session_id: string
          user_id: string
          stroke_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          canvas_session_id: string
          user_id: string
          stroke_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          canvas_session_id?: string
          user_id?: string
          stroke_data?: Json
          created_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          event_type: 'personal' | 'study' | 'break' | 'deadline' | 'exam'
          color: string | null
          reminder_minutes: number
          is_all_day: boolean
          recurrence_rule: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          event_type?: 'personal' | 'study' | 'break' | 'deadline' | 'exam'
          color?: string | null
          reminder_minutes?: number
          is_all_day?: boolean
          recurrence_rule?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          event_type?: 'personal' | 'study' | 'break' | 'deadline' | 'exam'
          color?: string | null
          reminder_minutes?: number
          is_all_day?: boolean
          recurrence_rule?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      calendar_reminders: {
        Row: {
          id: string
          event_id: string
          reminder_time: string
          sent: boolean
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          reminder_time: string
          sent?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          reminder_time?: string
          sent?: boolean
          created_at?: string
        }
      }
      custom_backgrounds: {
        Row: {
          id: string
          user_id: string
          name: string
          image_url: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          image_url: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          image_url?: string
          is_default?: boolean
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          icon: string | null
          badge_color: string | null
          requirement_type: 'focus_time' | 'sessions_completed' | 'streak_days' | 'courses_completed' | 'certifications_earned'
          requirement_value: number
          points_reward: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          icon?: string | null
          badge_color?: string | null
          requirement_type: 'focus_time' | 'sessions_completed' | 'streak_days' | 'courses_completed' | 'certifications_earned'
          requirement_value: number
          points_reward?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          icon?: string | null
          badge_color?: string | null
          requirement_type?: 'focus_time' | 'sessions_completed' | 'streak_days' | 'courses_completed' | 'certifications_earned'
          requirement_value?: number
          points_reward?: number
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
        }
      }
      user_stats: {
        Row: {
          user_id: string
          total_focus_minutes: number
          total_sessions: number
          current_streak_days: number
          longest_streak_days: number
          courses_completed: number
          certifications_earned: number
          total_points: number
          last_activity_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          total_focus_minutes?: number
          total_sessions?: number
          current_streak_days?: number
          longest_streak_days?: number
          courses_completed?: number
          certifications_earned?: number
          total_points?: number
          last_activity_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          total_focus_minutes?: number
          total_sessions?: number
          current_streak_days?: number
          longest_streak_days?: number
          courses_completed?: number
          certifications_earned?: number
          total_points?: number
          last_activity_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      file_uploads: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          upload_context: 'profile_avatar' | 'custom_background' | 'note_attachment' | 'canvas_save'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          upload_context: 'profile_avatar' | 'custom_background' | 'note_attachment' | 'canvas_save'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_type?: string
          file_size?: number
          storage_path?: string
          upload_context?: 'profile_avatar' | 'custom_background' | 'note_attachment' | 'canvas_save'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Additional types for common operations
export type TrackMood = 'calm' | 'focus' | 'energizing';
export type TrackGenre = 'lofi' | 'classical' | 'ambient' | 'electronic';
export type TaskPriority = 'low' | 'medium' | 'high';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type EventType = 'personal' | 'study' | 'break' | 'deadline' | 'exam';
export type ParticipantStatus = 'studying' | 'break' | 'away';
export type MessageType = 'text' | 'system' | 'emoji_reaction';
export type RequirementType = 'focus_time' | 'sessions_completed' | 'streak_days' | 'courses_completed' | 'certifications_earned';
export type UploadContext = 'profile_avatar' | 'custom_background' | 'note_attachment' | 'canvas_save';

export interface TrackWithPlayHistory extends Database['public']['Tables']['tracks']['Row'] {
  play_count?: number;
  last_played?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  percentage: number;
}

export interface WeeklyStats {
  sessions: Database['public']['Tables']['daily_sessions']['Row'][];
  totalSessions: number;
  totalMinutes: number;
  totalHours: number;
}

export interface FocusSessionStats {
  totalSessions: number;
  totalFocusTime: number;
  fullscreenSessions: number;
  currentStreak: number;
  totalHours: number;
}

export interface UserAmbientSettingWithSound extends Database['public']['Tables']['user_ambient_settings']['Row'] {
  ambient_sounds: Database['public']['Tables']['ambient_sounds']['Row'];
}

export interface UserPlayHistoryWithTrack extends Database['public']['Tables']['user_play_history']['Row'] {
  tracks: Database['public']['Tables']['tracks']['Row'];
}

export interface CourseWithProgress extends Database['public']['Tables']['courses']['Row'] {
  user_course_enrollments?: Database['public']['Tables']['user_course_enrollments']['Row'];
}

export interface CertificationWithProgress extends Database['public']['Tables']['certifications']['Row'] {
  user_certification_progress?: Database['public']['Tables']['user_certification_progress']['Row'];
}

export interface LearningPathWithProgress extends Database['public']['Tables']['learning_paths']['Row'] {
  user_learning_path_enrollments?: Database['public']['Tables']['user_learning_path_enrollments']['Row'];
  learning_path_courses?: Array<{
    course_id: string;
    order_index: number;
    courses: Database['public']['Tables']['courses']['Row'];
  }>;
}

export interface StudyRoomWithParticipants extends Database['public']['Tables']['study_rooms']['Row'] {
  room_participants: Array<Database['public']['Tables']['room_participants']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row'];
  }>;
  participant_count?: number;
}

export interface CalendarEventWithReminders extends Database['public']['Tables']['calendar_events']['Row'] {
  calendar_reminders?: Database['public']['Tables']['calendar_reminders']['Row'][];
}

export interface UserWithStats extends Database['public']['Tables']['profiles']['Row'] {
  user_stats?: Database['public']['Tables']['user_stats']['Row'];
  user_achievements?: Array<Database['public']['Tables']['user_achievements']['Row'] & {
    achievements: Database['public']['Tables']['achievements']['Row'];
  }>;
}

export interface ChatSessionWithMessages extends Database['public']['Tables']['ai_chat_sessions']['Row'] {
  chat_history: Database['public']['Tables']['chat_history']['Row'][];
}

export interface NoteWithCategory extends Database['public']['Tables']['notes']['Row'] {
  note_categories?: Database['public']['Tables']['note_categories']['Row'];
}