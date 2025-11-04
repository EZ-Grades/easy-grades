// Auto-generated types for the new schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'guest' | 'user' | 'premium' | 'admin'
export type ThemePreference = 'light' | 'dark' | 'system'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type EventType = 'personal' | 'study' | 'break' | 'deadline' | 'exam' | 'meeting'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'
export type SessionStatus = 'active' | 'paused' | 'completed' | 'cancelled'
export type RoomVisibility = 'public' | 'private' | 'friends_only'
export type ParticipantStatus = 'online' | 'away' | 'studying' | 'break' | 'offline'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          role: UserRole
          theme: ThemePreference
          timezone: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          last_active_at: string | null
          metadata: Json
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: UserRole
          theme?: ThemePreference
          timezone?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          last_active_at?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: UserRole
          theme?: ThemePreference
          timezone?: string
          updated_at?: string
          deleted_at?: string | null
          last_active_at?: string | null
          metadata?: Json
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          default_focus_duration: number
          default_break_duration: number
          auto_start_breaks: boolean
          auto_start_focus: boolean
          notifications_enabled: boolean
          email_notifications: boolean
          sound_enabled: boolean
          study_goal_hours: number
          preferred_ambient_sound: string | null
          dashboard_layout: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          default_focus_duration?: number
          default_break_duration?: number
          auto_start_breaks?: boolean
          auto_start_focus?: boolean
          notifications_enabled?: boolean
          email_notifications?: boolean
          sound_enabled?: boolean
          study_goal_hours?: number
          preferred_ambient_sound?: string | null
          dashboard_layout?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          default_focus_duration?: number
          default_break_duration?: number
          auto_start_breaks?: boolean
          auto_start_focus?: boolean
          notifications_enabled?: boolean
          email_notifications?: boolean
          sound_enabled?: boolean
          study_goal_hours?: number
          preferred_ambient_sound?: string | null
          dashboard_layout?: Json
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          priority: TaskPriority
          category: string | null
          tags: string[]
          completed: boolean
          completed_at: string | null
          due_date: string | null
          reminder_at: string | null
          parent_task_id: string | null
          order_index: number
          estimated_duration_minutes: number | null
          actual_duration_minutes: number | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          priority?: TaskPriority
          category?: string | null
          tags?: string[]
          completed?: boolean
          completed_at?: string | null
          due_date?: string | null
          reminder_at?: string | null
          parent_task_id?: string | null
          order_index?: number
          estimated_duration_minutes?: number | null
          actual_duration_minutes?: number | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          priority?: TaskPriority
          category?: string | null
          tags?: string[]
          completed?: boolean
          completed_at?: string | null
          due_date?: string | null
          reminder_at?: string | null
          parent_task_id?: string | null
          order_index?: number
          estimated_duration_minutes?: number | null
          actual_duration_minutes?: number | null
          updated_at?: string
          deleted_at?: string | null
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
          name?: string
          color?: string | null
          icon?: string | null
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          title: string
          content: string | null
          content_type: string
          tags: string[]
          is_pinned: boolean
          is_favorite: boolean
          is_public: boolean
          share_token: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          title: string
          content?: string | null
          content_type?: string
          tags?: string[]
          is_pinned?: boolean
          is_favorite?: boolean
          is_public?: boolean
          share_token?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          category_id?: string | null
          title?: string
          content?: string | null
          content_type?: string
          tags?: string[]
          is_pinned?: boolean
          is_favorite?: boolean
          is_public?: boolean
          share_token?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
      }
      focus_sessions: {
        Row: {
          id: string
          user_id: string
          duration_minutes: number
          completed_minutes: number
          status: SessionStatus
          started_at: string
          paused_at: string | null
          completed_at: string | null
          cancelled_at: string | null
          ambience_mode: string | null
          fullscreen: boolean
          background_id: string | null
          notes: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          duration_minutes: number
          completed_minutes?: number
          status?: SessionStatus
          started_at?: string
          paused_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          ambience_mode?: string | null
          fullscreen?: boolean
          background_id?: string | null
          notes?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          duration_minutes?: number
          completed_minutes?: number
          status?: SessionStatus
          paused_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          ambience_mode?: string | null
          fullscreen?: boolean
          background_id?: string | null
          notes?: string | null
          tags?: string[]
          updated_at?: string
        }
      }
      daily_stats: {
        Row: {
          user_id: string
          stat_date: string
          total_sessions: number
          completed_sessions: number
          total_minutes: number
          focus_minutes: number
          break_minutes: number
          goal_achieved: boolean
          is_active_day: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          stat_date: string
          total_sessions?: number
          completed_sessions?: number
          total_minutes?: number
          focus_minutes?: number
          break_minutes?: number
          goal_achieved?: boolean
          is_active_day?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          total_sessions?: number
          completed_sessions?: number
          total_minutes?: number
          focus_minutes?: number
          break_minutes?: number
          goal_achieved?: boolean
          is_active_day?: boolean
          updated_at?: string
        }
      }
      weekly_goals: {
        Row: {
          id: string
          user_id: string
          week_start_date: string
          target_hours: number
          achieved_hours: number
          is_achieved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_start_date: string
          target_hours?: number
          achieved_hours?: number
          is_achieved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          target_hours?: number
          achieved_hours?: number
          is_achieved?: boolean
          updated_at?: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          content: string | null
          mood: string | null
          decorations: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          content?: string | null
          mood?: string | null
          decorations?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          session_id?: string | null
          content?: string | null
          mood?: string | null
          decorations?: Json
          updated_at?: string
          deleted_at?: string | null
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
          name?: string
          image_url?: string
          is_default?: boolean
        }
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          location: string | null
          event_type: EventType
          color: string | null
          start_time: string
          end_time: string
          is_all_day: boolean
          timezone: string | null
          recurrence_rule: string | null
          recurrence_exception_dates: string[] | null
          reminder_minutes: number[]
          metadata: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          location?: string | null
          event_type?: EventType
          color?: string | null
          start_time: string
          end_time: string
          is_all_day?: boolean
          timezone?: string | null
          recurrence_rule?: string | null
          recurrence_exception_dates?: string[] | null
          is_completed?: boolean
          completed_at?: string | null
          reminder_minutes?: number[]
          metadata?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          location?: string | null
          event_type?: EventType
          color?: string | null
          start_time?: string
          end_time?: string
          is_all_day?: boolean
          timezone?: string | null
          recurrence_rule?: string | null
          recurrence_exception_dates?: string[] | null
          is_completed?: boolean
          completed_at?: string | null
          reminder_minutes?: number[]
          metadata?: Json
          updated_at?: string
          deleted_at?: string | null
        }
      }
      tracks: {
        Row: {
          id: string
          title: string
          artist: string | null
          album: string | null
          mood: string
          genre: string
          url: string
          cover_url: string | null
          duration_seconds: number | null
          track_type: string
          is_active: boolean
          is_premium: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          artist?: string | null
          album?: string | null
          mood: string
          genre: string
          url: string
          cover_url?: string | null
          duration_seconds?: number | null
          track_type?: string
          is_active?: boolean
          is_premium?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          artist?: string | null
          album?: string | null
          mood?: string
          genre?: string
          url?: string
          cover_url?: string | null
          duration_seconds?: number | null
          track_type?: string
          is_active?: boolean
          is_premium?: boolean
          metadata?: Json
          updated_at?: string
        }
      }
      ambient_sounds: {
        Row: {
          id: string
          name: string
          icon: string | null
          audio_url: string
          default_volume: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon?: string | null
          audio_url: string
          default_volume?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          icon?: string | null
          audio_url?: string
          default_volume?: number
          is_active?: boolean
        }
      }
      user_sound_settings: {
        Row: {
          id: string
          user_id: string
          ambient_sound_id: string
          enabled: boolean
          volume: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ambient_sound_id: string
          enabled?: boolean
          volume?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          volume?: number
          updated_at?: string
        }
      }
      playback_state: {
        Row: {
          user_id: string
          track_id: string | null
          position_seconds: number
          volume: number
          is_playing: boolean
          repeat_mode: string
          shuffle: boolean
          queue: Json
          updated_at: string
        }
        Insert: {
          user_id: string
          track_id?: string | null
          position_seconds?: number
          volume?: number
          is_playing?: boolean
          repeat_mode?: string
          shuffle?: boolean
          queue?: Json
          updated_at?: string
        }
        Update: {
          track_id?: string | null
          position_seconds?: number
          volume?: number
          is_playing?: boolean
          repeat_mode?: string
          shuffle?: boolean
          queue?: Json
          updated_at?: string
        }
      }
      inspirations: {
        Row: {
          id: string
          quote: string
          author: string | null
          category: string
          is_active: boolean
          display_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          quote: string
          author?: string | null
          category: string
          is_active?: boolean
          display_order?: number | null
          created_at?: string
        }
        Update: {
          quote?: string
          author?: string | null
          category?: string
          is_active?: boolean
          display_order?: number | null
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          difficulty: DifficultyLevel
          duration_hours: number | null
          icon: string | null
          color: string | null
          thumbnail_url: string | null
          is_published: boolean
          is_featured: boolean
          syllabus: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          difficulty: DifficultyLevel
          duration_hours?: number | null
          icon?: string | null
          color?: string | null
          thumbnail_url?: string | null
          is_published?: boolean
          is_featured?: boolean
          syllabus?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          category?: string
          difficulty?: DifficultyLevel
          duration_hours?: number | null
          icon?: string | null
          color?: string | null
          thumbnail_url?: string | null
          is_published?: boolean
          is_featured?: boolean
          syllabus?: Json
          updated_at?: string
        }
      }
      certifications: {
        Row: {
          id: string
          name: string
          provider: string | null
          description: string | null
          category: string
          difficulty: DifficultyLevel
          total_questions: number
          passing_percentage: number
          time_limit_minutes: number | null
          icon: string | null
          color: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          provider?: string | null
          description?: string | null
          category: string
          difficulty: DifficultyLevel
          total_questions?: number
          passing_percentage?: number
          time_limit_minutes?: number | null
          icon?: string | null
          color?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          provider?: string | null
          description?: string | null
          category?: string
          difficulty?: DifficultyLevel
          total_questions?: number
          passing_percentage?: number
          time_limit_minutes?: number | null
          icon?: string | null
          color?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      exam_questions: {
        Row: {
          id: string
          certification_id: string
          question: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_answer: string
          explanation: string
          difficulty: DifficultyLevel
          tags: string[]
          question_number: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          certification_id: string
          question: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_answer: string
          explanation: string
          difficulty: DifficultyLevel
          tags?: string[]
          question_number?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          question?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          correct_answer?: string
          explanation?: string
          difficulty?: DifficultyLevel
          tags?: string[]
          question_number?: number | null
          updated_at?: string
        }
      }
      flashcard_decks: {
        Row: {
          id: string
          certification_id: string | null
          created_by: string | null
          title: string
          description: string | null
          category: string | null
          is_public: boolean
          card_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          certification_id?: string | null
          created_by?: string | null
          title: string
          description?: string | null
          category?: string | null
          is_public?: boolean
          card_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          category?: string | null
          is_public?: boolean
          card_count?: number
          updated_at?: string
        }
      }
      flashcards: {
        Row: {
          id: string
          deck_id: string
          question: string
          answer: string
          hint: string | null
          difficulty: DifficultyLevel | null
          tags: string[]
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deck_id: string
          question: string
          answer: string
          hint?: string | null
          difficulty?: DifficultyLevel | null
          tags?: string[]
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          question?: string
          answer?: string
          hint?: string | null
          difficulty?: DifficultyLevel | null
          tags?: string[]
          order_index?: number
          updated_at?: string
        }
      }
      course_enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          progress_percentage: number
          current_module: number | null
          status: string
          enrolled_at: string
          started_at: string | null
          completed_at: string | null
          last_accessed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          progress_percentage?: number
          current_module?: number | null
          status?: string
          enrolled_at?: string
          started_at?: string | null
          completed_at?: string | null
          last_accessed_at?: string | null
        }
        Update: {
          progress_percentage?: number
          current_module?: number | null
          status?: string
          started_at?: string | null
          completed_at?: string | null
          last_accessed_at?: string | null
        }
      }
      practice_sessions: {
        Row: {
          id: string
          user_id: string
          certification_id: string | null
          questions_attempted: number
          questions_correct: number
          score_percentage: number | null
          time_spent_seconds: number
          results: Json
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          certification_id?: string | null
          questions_attempted?: number
          questions_correct?: number
          score_percentage?: number | null
          time_spent_seconds?: number
          results?: Json
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          questions_attempted?: number
          questions_correct?: number
          score_percentage?: number | null
          time_spent_seconds?: number
          results?: Json
          completed_at?: string | null
        }
      }
      chat_history: {
        Row: {
          id: string
          user_id: string
          message: string
          response: string
          context: Json
          model: string | null
          tokens_used: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          response: string
          context?: Json
          model?: string | null
          tokens_used?: number | null
          created_at?: string
        }
        Update: {
          message?: string
          response?: string
          context?: Json
          model?: string | null
          tokens_used?: number | null
        }
      }
      study_rooms: {
        Row: {
          id: string
          host_user_id: string
          name: string
          description: string | null
          room_code: string
          visibility: RoomVisibility
          max_participants: number
          password_hash: string | null
          theme: string
          is_active: boolean
          created_at: string
          updated_at: string
          closed_at: string | null
        }
        Insert: {
          id?: string
          host_user_id: string
          name: string
          description?: string | null
          room_code: string
          visibility?: RoomVisibility
          max_participants?: number
          password_hash?: string | null
          theme?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          closed_at?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          visibility?: RoomVisibility
          max_participants?: number
          password_hash?: string | null
          theme?: string
          is_active?: boolean
          updated_at?: string
          closed_at?: string | null
        }
      }
      room_participants: {
        Row: {
          id: string
          room_id: string
          user_id: string
          status: ParticipantStatus
          study_time_minutes: number
          joined_at: string
          left_at: string | null
          last_seen_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          status?: ParticipantStatus
          study_time_minutes?: number
          joined_at?: string
          left_at?: string | null
          last_seen_at?: string
        }
        Update: {
          status?: ParticipantStatus
          study_time_minutes?: number
          left_at?: string | null
          last_seen_at?: string
        }
      }
      room_messages: {
        Row: {
          id: string
          room_id: string
          user_id: string
          message: string
          message_type: string
          reply_to_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          message: string
          message_type?: string
          reply_to_id?: string | null
          created_at?: string
        }
        Update: {
          message?: string
          message_type?: string
          reply_to_id?: string | null
        }
      }
      canvas_sessions: {
        Row: {
          id: string
          room_id: string
          created_by: string
          canvas_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          created_by: string
          canvas_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          canvas_data?: Json
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          requirement_type: string
          requirement_value: number
          points: number
          icon: string | null
          badge_color: string | null
          rarity: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          requirement_type: string
          requirement_value: number
          points?: number
          icon?: string | null
          badge_color?: string | null
          rarity?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          description?: string
          category?: string
          requirement_type?: string
          requirement_value?: number
          points?: number
          icon?: string | null
          badge_color?: string | null
          rarity?: string | null
          is_active?: boolean
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          current_progress: number
          is_unlocked: boolean
          unlocked_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          current_progress?: number
          is_unlocked?: boolean
          unlocked_at?: string | null
        }
        Update: {
          current_progress?: number
          is_unlocked?: boolean
          unlocked_at?: string | null
        }
      }
      user_stats: {
        Row: {
          user_id: string
          total_focus_minutes: number
          total_sessions: number
          current_streak_days: number
          longest_streak_days: number
          last_activity_date: string | null
          courses_completed: number
          certifications_earned: number
          total_points: number
          level: number
          global_rank: number | null
          updated_at: string
        }
        Insert: {
          user_id: string
          total_focus_minutes?: number
          total_sessions?: number
          current_streak_days?: number
          longest_streak_days?: number
          last_activity_date?: string | null
          courses_completed?: number
          certifications_earned?: number
          total_points?: number
          level?: number
          global_rank?: number | null
          updated_at?: string
        }
        Update: {
          total_focus_minutes?: number
          total_sessions?: number
          current_streak_days?: number
          longest_streak_days?: number
          last_activity_date?: string | null
          courses_completed?: number
          certifications_earned?: number
          total_points?: number
          level?: number
          global_rank?: number | null
          updated_at?: string
        }
      }
    }
    Functions: {
      get_daily_inspiration: {
        Args: Record<string, never>
        Returns: {
          id: string
          quote: string
          author: string | null
          category: string
        }[]
      }
    }
  }
}
