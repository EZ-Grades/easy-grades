-- EZ Grades Database Schema (Corrected for Supabase)
-- This file contains all the SQL needed to set up your Supabase database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- CORE TABLES
-- ==========================================

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create chat_history table for AI assistant
CREATE TABLE public.chat_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    session_id UUID REFERENCES public.ai_chat_sessions,
    message_type TEXT DEFAULT 'user' CHECK (message_type IN ('user', 'assistant', 'system'))
);

-- ==========================================
-- BREAK MODE TABLES
-- ==========================================

-- Tracks table for ambient sounds and music
CREATE TABLE public.tracks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    mood TEXT NOT NULL, -- calm, focus, energizing
    genre TEXT NOT NULL, -- lofi, classical, ambient
    description TEXT,
    url TEXT NOT NULL,
    cover_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- User track play history
CREATE TABLE public.user_play_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    track_id UUID REFERENCES public.tracks NOT NULL,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- User volume settings
CREATE TABLE public.user_volume_settings (
    user_id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    master_volume INTEGER DEFAULT 70 CHECK (master_volume >= 0 AND master_volume <= 100),
    ambient_volume INTEGER DEFAULT 50 CHECK (ambient_volume >= 0 AND ambient_volume <= 100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ==========================================
-- DASHBOARD TABLES
-- ==========================================

-- Tasks table
CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMP WITH TIME ZONE,
    category TEXT,
    tags TEXT[],
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Note categories
CREATE TABLE public.note_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    name TEXT NOT NULL,
    color TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, name)
);

-- Notes table
CREATE TABLE public.notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    category_id UUID REFERENCES public.note_categories,
    tags TEXT[],
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Weekly goals table
CREATE TABLE public.weekly_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    hours_goal INTEGER NOT NULL DEFAULT 40,
    progress_hours NUMERIC(5,2) DEFAULT 0.0,
    week_start_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, week_start_date)
);

-- Daily sessions for stats tracking
CREATE TABLE public.daily_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    session_date DATE NOT NULL,
    completed_sessions INTEGER DEFAULT 0,
    total_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, session_date)
);

-- ==========================================
-- FOCUS MODE TABLES
-- ==========================================

-- Focus sessions table
CREATE TABLE public.focus_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    duration_minutes INTEGER NOT NULL,
    completed_minutes INTEGER DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    ambience_mode TEXT,
    fullscreen BOOLEAN DEFAULT false,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Ambient sounds configuration
CREATE TABLE public.ambient_sounds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    default_volume INTEGER DEFAULT 50 CHECK (default_volume >= 0 AND default_volume <= 100),
    icon TEXT,
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- User ambient sound settings
CREATE TABLE public.user_ambient_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    ambient_sound_id UUID REFERENCES public.ambient_sounds NOT NULL,
    enabled BOOLEAN DEFAULT false,
    volume INTEGER DEFAULT 50 CHECK (volume >= 0 AND volume <= 100),
    UNIQUE(user_id, ambient_sound_id)
);

-- Blocked sites for distraction blocker
CREATE TABLE public.blocked_sites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- User settings for distraction blocker
CREATE TABLE public.user_settings (
    user_id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    distraction_block_enabled BOOLEAN DEFAULT false,
    show_blocked_sites BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Ambience modes
CREATE TABLE public.ambience_modes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    bg_class TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ==========================================
-- STUDYHUB TABLES
-- ==========================================

-- Courses table
CREATE TABLE public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    duration_hours INTEGER DEFAULT 0,
    icon TEXT,
    color TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Certifications table
CREATE TABLE public.certifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    icon TEXT,
    color TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Learning paths
CREATE TABLE public.learning_paths (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    estimated_duration_hours INTEGER DEFAULT 0,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    icon TEXT,
    color TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- User course enrollments
CREATE TABLE public.user_course_enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    course_id UUID REFERENCES public.courses NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed_at TIMESTAMP WITH TIME ZONE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, course_id)
);

-- User certification progress
CREATE TABLE public.user_certification_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    certification_id UUID REFERENCES public.certifications NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, certification_id)
);

-- Learning path courses (many-to-many)
CREATE TABLE public.learning_path_courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    learning_path_id UUID REFERENCES public.learning_paths NOT NULL,
    course_id UUID REFERENCES public.courses NOT NULL,
    order_index INTEGER NOT NULL,
    UNIQUE(learning_path_id, course_id)
);

-- User learning path enrollments
CREATE TABLE public.user_learning_path_enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    learning_path_id UUID REFERENCES public.learning_paths NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed_at TIMESTAMP WITH TIME ZONE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, learning_path_id)
);

-- ==========================================
-- STUDY TOGETHER / COLLABORATION TABLES
-- ==========================================

-- Study rooms
CREATE TABLE public.study_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    room_code TEXT UNIQUE NOT NULL,
    host_user_id UUID REFERENCES auth.users NOT NULL,
    max_participants INTEGER DEFAULT 10,
    is_public BOOLEAN DEFAULT true,
    password_hash TEXT,
    focus_mode TEXT DEFAULT 'pomodoro',
    ambient_sound TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Room participants
CREATE TABLE public.room_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.study_rooms NOT NULL,
    user_id UUID REFERENCES auth.users NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    left_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'studying' CHECK (status IN ('studying', 'break', 'away')),
    study_time_minutes INTEGER DEFAULT 0,
    UNIQUE(room_id, user_id, joined_at)
);

-- Room chat messages
CREATE TABLE public.room_chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.study_rooms NOT NULL,
    user_id UUID REFERENCES auth.users NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'emoji_reaction')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Collaborative canvas sessions
CREATE TABLE public.canvas_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.study_rooms NOT NULL,
    canvas_data JSONB,
    created_by UUID REFERENCES auth.users NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Canvas strokes for real-time collaboration
CREATE TABLE public.canvas_strokes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    canvas_session_id UUID REFERENCES public.canvas_sessions NOT NULL,
    user_id UUID REFERENCES auth.users NOT NULL,
    stroke_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ==========================================
-- CALENDAR AND EVENTS TABLES
-- ==========================================

-- Calendar events
CREATE TABLE public.calendar_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type TEXT DEFAULT 'personal' CHECK (event_type IN ('personal', 'study', 'break', 'deadline', 'exam')),
    color TEXT,
    reminder_minutes INTEGER DEFAULT 15,
    is_all_day BOOLEAN DEFAULT false,
    recurrence_rule TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Calendar reminders
CREATE TABLE public.calendar_reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES public.calendar_events NOT NULL,
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
    sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ==========================================
-- USER CUSTOMIZATION TABLES
-- ==========================================

-- User preferences
CREATE TABLE public.user_preferences (
    user_id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    default_focus_duration INTEGER DEFAULT 25,
    default_break_duration INTEGER DEFAULT 5,
    notification_enabled BOOLEAN DEFAULT true,
    sound_enabled BOOLEAN DEFAULT true,
    auto_start_break BOOLEAN DEFAULT false,
    auto_start_focus BOOLEAN DEFAULT false,
    preferred_ambient_sound TEXT,
    dashboard_layout JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Custom backgrounds for focus mode
CREATE TABLE public.custom_backgrounds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ==========================================
-- ACHIEVEMENTS AND GAMIFICATION TABLES
-- ==========================================

-- Achievement definitions
CREATE TABLE public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT,
    badge_color TEXT,
    requirement_type TEXT NOT NULL CHECK (requirement_type IN ('focus_time', 'sessions_completed', 'streak_days', 'courses_completed', 'certifications_earned')),
    requirement_value INTEGER NOT NULL,
    points_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- User achievements
CREATE TABLE public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    achievement_id UUID REFERENCES public.achievements NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, achievement_id)
);

-- User stats for achievement tracking
CREATE TABLE public.user_stats (
    user_id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    total_focus_minutes INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    certifications_earned INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ==========================================
-- AI CHAT IMPROVEMENTS
-- ==========================================

-- AI chat sessions for better organization
CREATE TABLE public.ai_chat_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    context_type TEXT DEFAULT 'general' CHECK (context_type IN ('general', 'study_help', 'course_specific', 'homework_help')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ==========================================
-- FILE STORAGE TABLES
-- ==========================================

-- File uploads for various features
CREATE TABLE public.file_uploads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    upload_context TEXT NOT NULL CHECK (upload_context IN ('profile_avatar', 'custom_background', 'note_attachment', 'canvas_save')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user stats after focus session
CREATE OR REPLACE FUNCTION update_user_stats_after_focus_session()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
        INSERT INTO user_stats (user_id, total_focus_minutes, total_sessions, last_activity_date)
        VALUES (NEW.user_id, NEW.completed_minutes, 1, CURRENT_DATE)
        ON CONFLICT (user_id) DO UPDATE SET
            total_focus_minutes = user_stats.total_focus_minutes + NEW.completed_minutes,
            total_sessions = user_stats.total_sessions + 1,
            last_activity_date = CURRENT_DATE,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update streak tracking
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    last_date DATE;
    current_streak INTEGER;
BEGIN
    SELECT last_activity_date, current_streak_days INTO last_date, current_streak
    FROM user_stats WHERE user_id = NEW.user_id;

    IF last_date IS NULL OR last_date < CURRENT_DATE - INTERVAL '1 day' THEN
        -- Reset streak if gap > 1 day
        current_streak = 1;
    ELSIF last_date = CURRENT_DATE - INTERVAL '1 day' THEN
        -- Continue streak
        current_streak = current_streak + 1;
    END IF;

    UPDATE user_stats SET
        current_streak_days = current_streak,
        longest_streak_days = GREATEST(longest_streak_days, current_streak),
        updated_at = NOW()
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Triggers to update updated_at timestamp
CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_tasks_updated
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_notes_updated
    BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_weekly_goals_updated
    BEFORE UPDATE ON public.weekly_goals
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_daily_sessions_updated
    BEFORE UPDATE ON public.daily_sessions
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_user_volume_settings_updated
    BEFORE UPDATE ON public.user_volume_settings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_user_settings_updated
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_courses_updated
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_certifications_updated
    BEFORE UPDATE ON public.certifications
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_learning_paths_updated
    BEFORE UPDATE ON public.learning_paths
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_study_rooms_updated
    BEFORE UPDATE ON public.study_rooms
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_canvas_sessions_updated
    BEFORE UPDATE ON public.canvas_sessions
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_calendar_events_updated
    BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_user_preferences_updated
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_user_stats_updated
    BEFORE UPDATE ON public.user_stats
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_ai_chat_sessions_updated
    BEFORE UPDATE ON public.ai_chat_sessions
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Focus session completion trigger
CREATE TRIGGER on_focus_session_completed
    AFTER UPDATE ON public.focus_sessions
    FOR EACH ROW EXECUTE PROCEDURE update_user_stats_after_focus_session();

-- Daily activity trigger
CREATE TRIGGER on_daily_activity
    AFTER INSERT OR UPDATE ON public.user_stats
    FOR EACH ROW EXECUTE PROCEDURE update_user_streak();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_play_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_volume_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambient_sounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ambient_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambience_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certification_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_path_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvas_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvas_strokes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Chat history policies
CREATE POLICY "Users can view own chat history"
    ON chat_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history"
    ON chat_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat history"
    ON chat_history FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat history"
    ON chat_history FOR DELETE
    USING (auth.uid() = user_id);

-- Tracks - public read
CREATE POLICY "Tracks are viewable by everyone"
    ON tracks FOR SELECT
    USING (true);

-- User play history
CREATE POLICY "Users can view own play history"
    ON user_play_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own play history"
    ON user_play_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User volume settings
CREATE POLICY "Users can view own volume settings"
    ON user_volume_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own volume settings"
    ON user_volume_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own volume settings"
    ON user_volume_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- Tasks
CREATE POLICY "Users can view own tasks"
    ON tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
    ON tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
    ON tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
    ON tasks FOR DELETE
    USING (auth.uid() = user_id);

-- Note categories
CREATE POLICY "Users can view own note categories"
    ON note_categories FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own note categories"
    ON note_categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own note categories"
    ON note_categories FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own note categories"
    ON note_categories FOR DELETE
    USING (auth.uid() = user_id);

-- Notes
CREATE POLICY "Users can view own notes"
    ON notes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
    ON notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
    ON notes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
    ON notes FOR DELETE
    USING (auth.uid() = user_id);

-- Weekly goals
CREATE POLICY "Users can view own weekly goals"
    ON weekly_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly goals"
    ON weekly_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly goals"
    ON weekly_goals FOR UPDATE
    USING (auth.uid() = user_id);

-- Daily sessions
CREATE POLICY "Users can view own daily sessions"
    ON daily_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily sessions"
    ON daily_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily sessions"
    ON daily_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- Focus sessions
CREATE POLICY "Users can view own focus sessions"
    ON focus_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focus sessions"
    ON focus_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus sessions"
    ON focus_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- Ambient sounds - public read
CREATE POLICY "Ambient sounds are viewable by everyone"
    ON ambient_sounds FOR SELECT
    USING (true);

-- User ambient settings
CREATE POLICY "Users can view own ambient settings"
    ON user_ambient_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ambient settings"
    ON user_ambient_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ambient settings"
    ON user_ambient_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- Blocked sites
CREATE POLICY "Users can view own blocked sites"
    ON blocked_sites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own blocked sites"
    ON blocked_sites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own blocked sites"
    ON blocked_sites FOR DELETE
    USING (auth.uid() = user_id);

-- User settings
CREATE POLICY "Users can view own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
    ON user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- Ambience modes - public read
CREATE POLICY "Ambience modes are viewable by everyone"
    ON ambience_modes FOR SELECT
    USING (true);

-- StudyHub tables - public read for content
CREATE POLICY "Courses are viewable by everyone"
    ON courses FOR SELECT
    USING (true);

CREATE POLICY "Certifications are viewable by everyone"
    ON certifications FOR SELECT
    USING (true);

CREATE POLICY "Learning paths are viewable by everyone"
    ON learning_paths FOR SELECT
    USING (true);

CREATE POLICY "Learning path courses are viewable by everyone"
    ON learning_path_courses FOR SELECT
    USING (true);

-- User enrollment policies
CREATE POLICY "Users can view own course enrollments"
    ON user_course_enrollments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own course enrollments"
    ON user_course_enrollments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own course enrollments"
    ON user_course_enrollments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own certification progress"
    ON user_certification_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own certification progress"
    ON user_certification_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own certification progress"
    ON user_certification_progress FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own learning path enrollments"
    ON user_learning_path_enrollments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning path enrollments"
    ON user_learning_path_enrollments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning path enrollments"
    ON user_learning_path_enrollments FOR UPDATE
    USING (auth.uid() = user_id);

-- Study room policies
CREATE POLICY "Study rooms are viewable by participants"
    ON study_rooms FOR SELECT
    USING (
        id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid() AND left_at IS NULL)
        OR host_user_id = auth.uid()
        OR is_public = true
    );

CREATE POLICY "Users can create study rooms"
    ON study_rooms FOR INSERT
    WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Room hosts can update their rooms"
    ON study_rooms FOR UPDATE
    USING (auth.uid() = host_user_id);

CREATE POLICY "Users can view participants in their rooms"
    ON room_participants FOR SELECT
    USING (
        room_id IN (SELECT id FROM study_rooms WHERE host_user_id = auth.uid())
        OR user_id = auth.uid()
    );

CREATE POLICY "Users can join rooms"
    ON room_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
    ON room_participants FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Room members can view chat messages"
    ON room_chat_messages FOR SELECT
    USING (
        room_id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid() AND left_at IS NULL)
    );

CREATE POLICY "Room members can send chat messages"
    ON room_chat_messages FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        room_id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid() AND left_at IS NULL)
    );

CREATE POLICY "Room members can view canvas sessions"
    ON canvas_sessions FOR SELECT
    USING (
        room_id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid() AND left_at IS NULL)
    );

CREATE POLICY "Room members can create canvas sessions"
    ON canvas_sessions FOR INSERT
    WITH CHECK (
        auth.uid() = created_by AND
        room_id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid() AND left_at IS NULL)
    );

CREATE POLICY "Room members can update canvas sessions"
    ON canvas_sessions FOR UPDATE
    USING (
        room_id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid() AND left_at IS NULL)
    );

CREATE POLICY "Room members can view canvas strokes"
    ON canvas_strokes FOR SELECT
    USING (
        canvas_session_id IN (
            SELECT id FROM canvas_sessions WHERE room_id IN (
                SELECT room_id FROM room_participants WHERE user_id = auth.uid() AND left_at IS NULL
            )
        )
    );

CREATE POLICY "Room members can add canvas strokes"
    ON canvas_strokes FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        canvas_session_id IN (
            SELECT id FROM canvas_sessions WHERE room_id IN (
                SELECT room_id FROM room_participants WHERE user_id = auth.uid() AND left_at IS NULL
            )
        )
    );

-- Calendar policies
CREATE POLICY "Users can view own calendar events"
    ON calendar_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar events"
    ON calendar_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events"
    ON calendar_events FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events"
    ON calendar_events FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reminders"
    ON calendar_reminders FOR SELECT
    USING (
        event_id IN (SELECT id FROM calendar_events WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert own reminders"
    ON calendar_reminders FOR INSERT
    WITH CHECK (
        event_id IN (SELECT id FROM calendar_events WHERE user_id = auth.uid())
    );

-- User customization policies
CREATE POLICY "Users can view own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own custom backgrounds"
    ON custom_backgrounds FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom backgrounds"
    ON custom_backgrounds FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom backgrounds"
    ON custom_backgrounds FOR DELETE
    USING (auth.uid() = user_id);

-- Achievement policies
CREATE POLICY "Achievements are viewable by everyone"
    ON achievements FOR SELECT
    USING (true);

CREATE POLICY "Users can view own achievements"
    ON user_achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can earn achievements"
    ON user_achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own stats"
    ON user_stats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
    ON user_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
    ON user_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- AI chat policies
CREATE POLICY "Users can view own chat sessions"
    ON ai_chat_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions"
    ON ai_chat_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
    ON ai_chat_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions"
    ON ai_chat_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- File upload policies
CREATE POLICY "Users can view own file uploads"
    ON file_uploads FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own file uploads"
    ON file_uploads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own file uploads"
    ON file_uploads FOR DELETE
    USING (auth.uid() = user_id);

-- ==========================================
-- PERFORMANCE INDEXES
-- ==========================================

-- Create indexes for better performance
CREATE INDEX profiles_username_idx ON public.profiles (username);
CREATE INDEX chat_history_user_id_idx ON public.chat_history (user_id);
CREATE INDEX chat_history_created_at_idx ON public.chat_history (created_at DESC);

-- Break Mode indexes
CREATE INDEX tracks_mood_idx ON public.tracks (mood);
CREATE INDEX tracks_genre_idx ON public.tracks (genre);
CREATE INDEX user_play_history_user_id_idx ON public.user_play_history (user_id);
CREATE INDEX user_play_history_played_at_idx ON public.user_play_history (played_at DESC);

-- Dashboard indexes
CREATE INDEX tasks_user_id_idx ON public.tasks (user_id);
CREATE INDEX tasks_created_at_idx ON public.tasks (created_at DESC);
CREATE INDEX tasks_completed_idx ON public.tasks (completed);
CREATE INDEX tasks_priority_idx ON public.tasks (priority);
CREATE INDEX tasks_due_date_idx ON public.tasks (due_date);
CREATE INDEX notes_user_id_idx ON public.notes (user_id);
CREATE INDEX notes_created_at_idx ON public.notes (created_at DESC);
CREATE INDEX notes_category_idx ON public.notes (category_id);
CREATE INDEX weekly_goals_user_id_idx ON public.weekly_goals (user_id);
CREATE INDEX weekly_goals_week_start_idx ON public.weekly_goals (week_start_date);
CREATE INDEX daily_sessions_user_id_idx ON public.daily_sessions (user_id);
CREATE INDEX daily_sessions_date_idx ON public.daily_sessions (session_date DESC);

-- Focus Mode indexes
CREATE INDEX focus_sessions_user_id_idx ON public.focus_sessions (user_id);
CREATE INDEX focus_sessions_start_time_idx ON public.focus_sessions (start_time DESC);
CREATE INDEX focus_sessions_completed_idx ON public.focus_sessions (completed);
CREATE INDEX user_ambient_settings_user_id_idx ON public.user_ambient_settings (user_id);
CREATE INDEX blocked_sites_user_id_idx ON public.blocked_sites (user_id);

-- StudyHub indexes
CREATE INDEX courses_category_idx ON public.courses (category);
CREATE INDEX courses_difficulty_idx ON public.courses (difficulty);
CREATE INDEX courses_featured_idx ON public.courses (is_featured);
CREATE INDEX certifications_category_idx ON public.certifications (category);
CREATE INDEX user_course_enrollments_user_id_idx ON public.user_course_enrollments (user_id);
CREATE INDEX user_certification_progress_user_id_idx ON public.user_certification_progress (user_id);
CREATE INDEX learning_paths_category_idx ON public.learning_paths (category);

-- Collaboration indexes
CREATE INDEX study_rooms_host_idx ON public.study_rooms (host_user_id);
CREATE INDEX study_rooms_code_idx ON public.study_rooms (room_code);
CREATE INDEX room_participants_room_idx ON public.room_participants (room_id);
CREATE INDEX room_participants_user_idx ON public.room_participants (user_id);
CREATE INDEX room_chat_messages_room_idx ON public.room_chat_messages (room_id);
CREATE INDEX room_chat_messages_created_idx ON public.room_chat_messages (created_at DESC);

-- Calendar indexes
CREATE INDEX calendar_events_user_id_idx ON public.calendar_events (user_id);
CREATE INDEX calendar_events_start_time_idx ON public.calendar_events (start_time);
CREATE INDEX calendar_events_type_idx ON public.calendar_events (event_type);

-- Achievement indexes
CREATE INDEX user_achievements_user_id_idx ON public.user_achievements (user_id);
CREATE INDEX user_stats_last_activity_idx ON public.user_stats (last_activity_date);

-- Chat indexes
CREATE INDEX ai_chat_sessions_user_id_idx ON public.ai_chat_sessions (user_id);
CREATE INDEX chat_history_session_idx ON public.chat_history (session_id);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Insert default tracks
INSERT INTO public.tracks (name, mood, genre, description, url, cover_url) VALUES
('Peaceful Forest', 'calm', 'ambient', 'Gentle sounds of a forest with birds chirping', 'https://www.soundjay.com/misc/sounds-misc/forest-ambient.mp3', null),
('Lofi Study Beat', 'focus', 'lofi', 'Relaxing lofi beats perfect for studying', 'https://www.soundjay.com/misc/sounds-misc/lofi-study.mp3', null),
('Ocean Waves', 'calm', 'ambient', 'Soothing ocean waves for relaxation', 'https://www.soundjay.com/misc/sounds-misc/ocean-waves.mp3', null),
('Classical Focus', 'focus', 'classical', 'Classical music to enhance concentration', 'https://www.soundjay.com/misc/sounds-misc/classical-focus.mp3', null),
('Energizing Beats', 'energizing', 'electronic', 'Upbeat music to boost energy levels', 'https://www.soundjay.com/misc/sounds-misc/energizing-beats.mp3', null);

-- Insert default ambient sounds
INSERT INTO public.ambient_sounds (name, default_volume, icon, audio_url) VALUES
('Rain', 50, '🌧️', 'https://www.soundjay.com/weather/sounds-weather/rain-heavy.mp3'),
('Forest', 40, '🌲', 'https://www.soundjay.com/nature/sounds-nature/forest-birds.mp3'),
('Ocean', 45, '🌊', 'https://www.soundjay.com/nature/sounds-nature/ocean-waves.mp3'),
('Coffee Shop', 35, '☕', 'https://www.soundjay.com/ambient/sounds-ambient/coffee-shop.mp3'),
('White Noise', 30, '⚪', 'https://www.soundjay.com/ambient/sounds-ambient/white-noise.mp3'),
('Fireplace', 40, '🔥', 'https://www.soundjay.com/ambient/sounds-ambient/fireplace.mp3');

-- Insert default ambience modes
INSERT INTO public.ambience_modes (name, description, icon, bg_class) VALUES
('Forest Retreat', 'Immerse yourself in a peaceful forest setting', '🌲', 'bg-gradient-to-br from-green-400 to-green-600'),
('Ocean Paradise', 'Study by the calming ocean waves', '🌊', 'bg-gradient-to-br from-blue-400 to-blue-600'),
('Mountain Peak', 'Focus at the top of a serene mountain', '⛰️', 'bg-gradient-to-br from-gray-400 to-gray-600'),
('Cozy Library', 'Traditional library atmosphere', '📚', 'bg-gradient-to-br from-amber-400 to-amber-600'),
('Space Station', 'Study among the stars', '🚀', 'bg-gradient-to-br from-purple-400 to-purple-600'),
('Minimal Focus', 'Clean, distraction-free environment', '⚪', 'bg-gradient-to-br from-gray-200 to-gray-300');

-- Insert sample courses
INSERT INTO public.courses (title, description, category, difficulty, duration_hours, icon, color, is_featured) VALUES
('JavaScript Fundamentals', 'Learn the basics of JavaScript programming', 'Programming', 'beginner', 40, 'Code', '#F59E0B', true),
('React Development', 'Build modern web applications with React', 'Programming', 'intermediate', 60, 'Smartphone', '#10B981', true),
('Data Structures & Algorithms', 'Master computer science fundamentals', 'Computer Science', 'advanced', 80, 'Database', '#8B5CF6', false),
('Python for Data Science', 'Analyze data with Python', 'Data Science', 'intermediate', 50, 'BarChart3', '#06B6D4', true),
('Machine Learning Basics', 'Introduction to ML concepts', 'AI/ML', 'intermediate', 45, 'Brain', '#EC4899', false);

-- Insert sample certifications
INSERT INTO public.certifications (title, description, category, difficulty, icon, color, is_featured) VALUES
('Full Stack Web Developer', 'Complete web development certification', 'Programming', 'advanced', 'Globe', '#8B5CF6', true),
('Data Analyst Professional', 'Professional data analysis certification', 'Data Science', 'intermediate', 'BarChart3', '#06B6D4', true),
('Cloud Solutions Architect', 'Cloud infrastructure certification', 'Cloud Computing', 'advanced', 'Cloud', '#10B981', false),
('Cybersecurity Specialist', 'Information security certification', 'Security', 'advanced', 'Shield', '#EF4444', true);

-- Insert sample learning paths
INSERT INTO public.learning_paths (title, description, category, estimated_duration_hours, difficulty, icon, color, is_featured) VALUES
('Frontend Developer Path', 'Complete frontend development journey', 'Programming', 120, 'beginner', 'Smartphone', '#F59E0B', true),
('Data Science Path', 'Become a data science professional', 'Data Science', 150, 'intermediate', 'BarChart3', '#06B6D4', true),
('Full Stack Engineer Path', 'End-to-end web development skills', 'Programming', 200, 'advanced', 'Globe', '#8B5CF6', false);

-- Insert sample achievements
INSERT INTO public.achievements (name, description, category, icon, badge_color, requirement_type, requirement_value, points_reward) VALUES
('First Steps', 'Complete your first focus session', 'Getting Started', '🎯', '#10B981', 'sessions_completed', 1, 10),
('Focused Mind', 'Complete 10 focus sessions', 'Focus', '🧠', '#8B5CF6', 'sessions_completed', 10, 50),
('Time Master', 'Focus for 100 minutes total', 'Focus', '⏰', '#F59E0B', 'focus_time', 100, 25),
('Dedicated Learner', 'Maintain a 7-day streak', 'Consistency', '🔥', '#EF4444', 'streak_days', 7, 100),
('Course Champion', 'Complete your first course', 'Learning', '🎓', '#06B6D4', 'courses_completed', 1, 75),
('Certification Master', 'Earn your first certification', 'Achievement', '🏆', '#EC4899', 'certifications_earned', 1, 150);

-- Schema setup complete!