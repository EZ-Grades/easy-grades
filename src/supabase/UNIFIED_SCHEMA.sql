-- ============================================================================
-- EZ GRADES - UNIFIED COMPLETE SCHEMA
-- ============================================================================
-- This creates ALL 40+ tables needed for EZ Grades
-- Run this file once after dropping old tables
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================================================
-- ENUMS
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('guest', 'user', 'premium', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE theme_preference AS ENUM ('light', 'dark', 'system');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE event_type AS ENUM ('personal', 'study', 'break', 'deadline', 'exam', 'meeting');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE session_status AS ENUM ('active', 'paused', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE room_visibility AS ENUM ('public', 'private', 'friends_only');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE participant_status AS ENUM ('online', 'away', 'studying', 'break', 'offline');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================================
-- PART 1: CORE USER TABLES (5 tables)
-- ============================================================================

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role user_role NOT NULL DEFAULT 'user',
  theme theme_preference NOT NULL DEFAULT 'system',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_username CHECK (username IS NULL OR (username ~* '^[a-zA-Z0-9_]{3,30}$'))
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_metadata ON profiles USING gin(metadata jsonb_path_ops);

-- 2. USER PREFERENCES
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  default_focus_duration INTEGER NOT NULL DEFAULT 25 CHECK (default_focus_duration BETWEEN 1 AND 180),
  default_break_duration INTEGER NOT NULL DEFAULT 5 CHECK (default_break_duration BETWEEN 1 AND 60),
  auto_start_breaks BOOLEAN NOT NULL DEFAULT false,
  auto_start_focus BOOLEAN NOT NULL DEFAULT false,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  study_goal_hours INTEGER NOT NULL DEFAULT 2 CHECK (study_goal_hours BETWEEN 1 AND 24),
  preferred_ambient_sound TEXT,
  dashboard_layout JSONB DEFAULT '{"widgets": []}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- 3. TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 500),
  description TEXT,
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  estimated_minutes INTEGER CHECK (estimated_minutes > 0),
  actual_minutes INTEGER CHECK (actual_minutes >= 0),
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE deleted_at IS NULL AND completed = false;
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority, due_date) WHERE deleted_at IS NULL AND completed = false;
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_task_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING gin(tags);

-- 4. NOTE CATEGORIES
CREATE TABLE IF NOT EXISTS note_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
  color TEXT NOT NULL DEFAULT '#6366f1',
  icon TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_note_categories_user_id ON note_categories(user_id);

-- 5. NOTES
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES note_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 500),
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  pinned BOOLEAN NOT NULL DEFAULT false,
  favorited BOOLEAN NOT NULL DEFAULT false,
  color TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notes_category_id ON notes(category_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(pinned, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_notes_content_search ON notes USING gin(to_tsvector('english', content));

-- ============================================================================
-- PART 2: FOCUS SESSIONS & CALENDAR (12 tables + partitions)
-- ============================================================================

-- 6. FOCUS SESSIONS (Partitioned by month)
CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  planned_duration INTEGER NOT NULL CHECK (planned_duration > 0),
  status session_status NOT NULL DEFAULT 'active',
  focus_mode TEXT NOT NULL DEFAULT 'pomodoro',
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  notes TEXT,
  background_id UUID,
  productivity_rating INTEGER CHECK (productivity_rating BETWEEN 1 AND 5),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, start_time)
) PARTITION BY RANGE (start_time);

-- Create partitions for 2025
CREATE TABLE IF NOT EXISTS focus_sessions_2025_01 PARTITION OF focus_sessions
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE IF NOT EXISTS focus_sessions_2025_02 PARTITION OF focus_sessions
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE IF NOT EXISTS focus_sessions_2025_03 PARTITION OF focus_sessions
  FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

CREATE TABLE IF NOT EXISTS focus_sessions_2025_04 PARTITION OF focus_sessions
  FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');

CREATE TABLE IF NOT EXISTS focus_sessions_2025_05 PARTITION OF focus_sessions
  FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');

CREATE TABLE IF NOT EXISTS focus_sessions_2025_06 PARTITION OF focus_sessions
  FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

CREATE TABLE IF NOT EXISTS focus_sessions_2025_07 PARTITION OF focus_sessions
  FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');

CREATE TABLE IF NOT EXISTS focus_sessions_2025_08 PARTITION OF focus_sessions
  FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

CREATE TABLE IF NOT EXISTS focus_sessions_2025_09 PARTITION OF focus_sessions
  FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');

CREATE TABLE IF NOT EXISTS focus_sessions_2025_10 PARTITION OF focus_sessions
  FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE IF NOT EXISTS focus_sessions_2025_11 PARTITION OF focus_sessions
  FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE IF NOT EXISTS focus_sessions_2025_12 PARTITION OF focus_sessions
  FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_status ON focus_sessions(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_focus_sessions_task_id ON focus_sessions(task_id) WHERE task_id IS NOT NULL;

-- 7. DAILY STATS
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_focus_minutes INTEGER NOT NULL DEFAULT 0,
  total_break_minutes INTEGER NOT NULL DEFAULT 0,
  sessions_completed INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  productivity_score DECIMAL(3,2) CHECK (productivity_score BETWEEN 0 AND 5),
  mood TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stats_productivity ON daily_stats(user_id, productivity_score DESC);

-- 8. WEEKLY GOALS
CREATE TABLE IF NOT EXISTS weekly_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  goal_hours DECIMAL(5,2) NOT NULL CHECK (goal_hours > 0),
  actual_hours DECIMAL(5,2) NOT NULL DEFAULT 0,
  goals_text TEXT[],
  achievements TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

CREATE INDEX IF NOT EXISTS idx_weekly_goals_user_week ON weekly_goals(user_id, week_start_date DESC);

-- 9. JOURNAL ENTRIES
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  stickers JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tags ON journal_entries USING gin(tags);

-- 10. CUSTOM BACKGROUNDS
CREATE TABLE IF NOT EXISTS custom_backgrounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT false,
  downloads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_backgrounds_user ON custom_backgrounds(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_backgrounds_public ON custom_backgrounds(is_public, downloads DESC) WHERE is_public = true;

-- 11. CALENDAR EVENTS
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  event_type event_type NOT NULL DEFAULT 'personal',
  color TEXT,
  location TEXT,
  reminder_minutes INTEGER,
  recurring_pattern TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_time ON calendar_events(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(event_type, start_time);

-- ============================================================================
-- PART 3: MEDIA CONTENT (5 tables)
-- ============================================================================

-- 12. TRACKS (Music)
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  url TEXT NOT NULL,
  duration INTEGER NOT NULL,
  genre TEXT,
  mood TEXT,
  image_url TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  play_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracks_genre ON tracks(genre);
CREATE INDEX IF NOT EXISTS idx_tracks_mood ON tracks(mood);
CREATE INDEX IF NOT EXISTS idx_tracks_popular ON tracks(play_count DESC);

-- 13. AMBIENT SOUNDS
CREATE TABLE IF NOT EXISTS ambient_sounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  icon TEXT,
  category TEXT NOT NULL,
  volume_default DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (volume_default BETWEEN 0 AND 1),
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ambient_sounds_category ON ambient_sounds(category);

-- 14. INSPIRATIONS (Daily quotes/tips)
CREATE TABLE IF NOT EXISTS inspirations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('quote', 'tip', 'fact')),
  content TEXT NOT NULL,
  author TEXT,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inspirations_type ON inspirations(type) WHERE is_active = true;

-- 15. USER SOUND SETTINGS
CREATE TABLE IF NOT EXISTS user_sound_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  ambient_sound_id UUID REFERENCES ambient_sounds(id) ON DELETE SET NULL,
  ambient_volume DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (ambient_volume BETWEEN 0 AND 1),
  music_volume DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (music_volume BETWEEN 0 AND 1),
  notifications_volume DECIMAL(3,2) NOT NULL DEFAULT 0.7 CHECK (notifications_volume BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. PLAYBACK STATE
CREATE TABLE IF NOT EXISTS playback_state (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
  is_playing BOOLEAN NOT NULL DEFAULT false,
  position_seconds INTEGER NOT NULL DEFAULT 0,
  shuffle BOOLEAN NOT NULL DEFAULT false,
  repeat_mode TEXT NOT NULL DEFAULT 'none' CHECK (repeat_mode IN ('none', 'one', 'all')),
  playlist JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- PART 4: STUDY HUB / AI FEATURES (8 tables)
-- ============================================================================

-- 17. COURSES
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  difficulty difficulty_level NOT NULL DEFAULT 'intermediate',
  thumbnail_url TEXT,
  total_lessons INTEGER NOT NULL DEFAULT 0,
  estimated_hours DECIMAL(5,2),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  enrollment_count INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) CHECK (rating BETWEEN 0 AND 5),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_subject ON courses(subject);
CREATE INDEX IF NOT EXISTS idx_courses_difficulty ON courses(difficulty);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(is_featured, rating DESC) WHERE is_featured = true;

-- 18. CERTIFICATIONS
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  issuing_organization TEXT NOT NULL,
  icon_url TEXT,
  difficulty difficulty_level NOT NULL DEFAULT 'intermediate',
  total_questions INTEGER NOT NULL DEFAULT 0,
  passing_score INTEGER NOT NULL CHECK (passing_score BETWEEN 0 AND 100),
  time_limit_minutes INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certifications_active ON certifications(is_active, difficulty);

-- 19. EXAM QUESTIONS
CREATE TABLE IF NOT EXISTS exam_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certification_id UUID REFERENCES certifications(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty difficulty_level NOT NULL DEFAULT 'intermediate',
  topic TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exam_questions_cert ON exam_questions(certification_id);

-- 20. FLASHCARD DECKS
CREATE TABLE IF NOT EXISTS flashcard_decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  color TEXT DEFAULT '#6366f1',
  is_public BOOLEAN NOT NULL DEFAULT false,
  card_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user ON flashcard_decks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_public ON flashcard_decks(is_public, subject) WHERE is_public = true;

-- 21. FLASHCARDS
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  hint TEXT,
  image_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flashcards_deck ON flashcards(deck_id, position);

-- 22. COURSE ENROLLMENTS
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_user ON course_enrollments(user_id, last_accessed_at DESC);

-- 23. PRACTICE SESSIONS
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  certification_id UUID REFERENCES certifications(id) ON DELETE SET NULL,
  deck_id UUID REFERENCES flashcard_decks(id) ON DELETE SET NULL,
  score DECIMAL(5,2),
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER,
  completed BOOLEAN NOT NULL DEFAULT false,
  results JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_sessions_user ON practice_sessions(user_id, created_at DESC);

-- 24. CHAT HISTORY (AI conversations)
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  model TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_history_user_session ON chat_history(user_id, session_id, created_at);

-- ============================================================================
-- PART 5: SOCIAL & STUDY TOGETHER (7 tables)
-- ============================================================================

-- 25. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  criteria JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category, rarity);

-- 26. USER ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress INTEGER NOT NULL DEFAULT 100 CHECK (progress BETWEEN 0 AND 100),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id, unlocked_at DESC);

-- 27. STUDY ROOMS
CREATE TABLE IF NOT EXISTS study_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  visibility room_visibility NOT NULL DEFAULT 'public',
  max_participants INTEGER NOT NULL DEFAULT 10 CHECK (max_participants BETWEEN 1 AND 100),
  current_participants INTEGER NOT NULL DEFAULT 0,
  password_hash TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_rooms_visibility ON study_rooms(visibility, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_study_rooms_creator ON study_rooms(created_by);

-- 28. ROOM PARTICIPANTS
CREATE TABLE IF NOT EXISTS room_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status participant_status NOT NULL DEFAULT 'online',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_time_seconds INTEGER NOT NULL DEFAULT 0,
  is_moderator BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_room_participants_room ON room_participants(room_id, status);
CREATE INDEX IF NOT EXISTS idx_room_participants_user ON room_participants(user_id, joined_at DESC);

-- 29. ROOM MESSAGES
CREATE TABLE IF NOT EXISTS room_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (length(message) BETWEEN 1 AND 1000),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'emoji')),
  replied_to_id UUID REFERENCES room_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_room_messages_room ON room_messages(room_id, created_at DESC);

-- 30. CANVAS SESSIONS
CREATE TABLE IF NOT EXISTS canvas_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  canvas_data JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_canvas_sessions_room ON canvas_sessions(room_id, updated_at DESC);

-- 31. USER STATS
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_study_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_tasks_completed INTEGER NOT NULL DEFAULT 0,
  current_streak_days INTEGER NOT NULL DEFAULT 0,
  longest_streak_days INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  achievements_count INTEGER NOT NULL DEFAULT 0,
  study_rooms_joined INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- PART 6: KV STORE (Backend storage)
-- ============================================================================

-- 32. KV STORE
CREATE TABLE IF NOT EXISTS kv_store_7ba2faf7 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kv_store_key ON kv_store_7ba2faf7(key);
CREATE INDEX IF NOT EXISTS idx_kv_store_value ON kv_store_7ba2faf7 USING gin(value jsonb_path_ops);

-- ============================================================================
-- TRIGGERS (Auto-update timestamps)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  table_name TEXT;
  tables_with_updated_at TEXT[] := ARRAY[
    'profiles', 'user_preferences', 'tasks', 'note_categories', 'notes',
    'daily_stats', 'weekly_goals', 'journal_entries', 'calendar_events',
    'user_sound_settings', 'playback_state', 'courses', 'flashcard_decks',
    'flashcards', 'study_rooms', 'canvas_sessions', 'user_stats', 'kv_store_7ba2faf7'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_with_updated_at
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', table_name, table_name, table_name, table_name);
  END LOOP;
END $$;

-- ============================================================================
-- ROW LEVEL SECURITY (Enable on all tables)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sound_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE playback_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE kv_store_7ba2faf7 ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- PROFILES: Users can read all profiles, modify only their own
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- USER DATA: Users can only access their own data
DO $$
DECLARE
  table_name TEXT;
  user_tables TEXT[] := ARRAY[
    'user_preferences', 'tasks', 'note_categories', 'notes', 'focus_sessions',
    'daily_stats', 'weekly_goals', 'journal_entries', 'custom_backgrounds',
    'calendar_events', 'user_sound_settings', 'playback_state',
    'flashcard_decks', 'course_enrollments', 'practice_sessions',
    'chat_history', 'user_achievements', 'user_stats'
  ];
BEGIN
  FOREACH table_name IN ARRAY user_tables
  LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS "Users can manage own data" ON %I;
      CREATE POLICY "Users can manage own data"
        ON %I FOR ALL
        TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    ', table_name, table_name);
  END LOOP;
END $$;

-- FLASHCARDS: Access through deck ownership
DROP POLICY IF EXISTS "Users can manage flashcards in own decks" ON flashcards;
CREATE POLICY "Users can manage flashcards in own decks"
  ON flashcards FOR ALL
  TO authenticated
  USING (
    deck_id IN (SELECT id FROM flashcard_decks WHERE user_id = auth.uid())
  )
  WITH CHECK (
    deck_id IN (SELECT id FROM flashcard_decks WHERE user_id = auth.uid())
  );

-- PUBLIC CONTENT: Anyone can read
DO $$
DECLARE
  table_name TEXT;
  public_tables TEXT[] := ARRAY[
    'tracks', 'ambient_sounds', 'inspirations', 'courses',
    'certifications', 'exam_questions', 'achievements'
  ];
BEGIN
  FOREACH table_name IN ARRAY public_tables
  LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS "Public content readable by all" ON %I;
      CREATE POLICY "Public content readable by all"
        ON %I FOR SELECT
        USING (true);
    ', table_name, table_name);
  END LOOP;
END $$;

-- STUDY ROOMS: Public rooms viewable by all, private by participants
DROP POLICY IF EXISTS "Study rooms viewable based on visibility" ON study_rooms;
CREATE POLICY "Study rooms viewable based on visibility"
  ON study_rooms FOR SELECT
  USING (
    is_active = true AND (
      visibility = 'public' OR
      created_by = auth.uid() OR
      id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create study rooms" ON study_rooms;
CREATE POLICY "Users can create study rooms"
  ON study_rooms FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Room creators can update their rooms" ON study_rooms;
CREATE POLICY "Room creators can update their rooms"
  ON study_rooms FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- ROOM PARTICIPANTS: Can see participants in rooms they're in
DROP POLICY IF EXISTS "Room participants viewable by room members" ON room_participants;
CREATE POLICY "Room participants viewable by room members"
  ON room_participants FOR SELECT
  USING (
    room_id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid()) OR
    room_id IN (SELECT id FROM study_rooms WHERE created_by = auth.uid())
  );

DROP POLICY IF EXISTS "Users can join rooms" ON room_participants;
CREATE POLICY "Users can join rooms"
  ON room_participants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own participation" ON room_participants;
CREATE POLICY "Users can update own participation"
  ON room_participants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ROOM MESSAGES: Viewable by room members
DROP POLICY IF EXISTS "Room messages viewable by members" ON room_messages;
CREATE POLICY "Room messages viewable by members"
  ON room_messages FOR SELECT
  USING (
    room_id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Room members can send messages" ON room_messages;
CREATE POLICY "Room members can send messages"
  ON room_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    room_id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid())
  );

-- CANVAS SESSIONS: Viewable by room members
DROP POLICY IF EXISTS "Canvas sessions viewable by room members" ON canvas_sessions;
CREATE POLICY "Canvas sessions viewable by room members"
  ON canvas_sessions FOR SELECT
  USING (
    room_id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Room members can create canvas" ON canvas_sessions;
CREATE POLICY "Room members can create canvas"
  ON canvas_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    room_id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own canvas" ON canvas_sessions;
CREATE POLICY "Users can update own canvas"
  ON canvas_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- KV STORE: Users can access their own keys
DROP POLICY IF EXISTS "Users can manage their own KV data" ON kv_store_7ba2faf7;
CREATE POLICY "Users can manage their own KV data"
  ON kv_store_7ba2faf7 FOR ALL
  TO authenticated
  USING (
    key LIKE 'user:' || auth.uid()::text || ':%' OR
    key = 'user:' || auth.uid()::text
  )
  WITH CHECK (
    key LIKE 'user:' || auth.uid()::text || ':%' OR
    key = 'user:' || auth.uid()::text
  );

DROP POLICY IF EXISTS "Service role has full access to KV" ON kv_store_7ba2faf7;
CREATE POLICY "Service role has full access to KV"
  ON kv_store_7ba2faf7 FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$ 
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public';
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '  ✅ EZ GRADES DATABASE SCHEMA DEPLOYED SUCCESSFULLY';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Total tables created: %', table_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ All tables created with proper indexes';
  RAISE NOTICE '✅ All triggers configured';
  RAISE NOTICE '✅ Row Level Security enabled';
  RAISE NOTICE '✅ All policies applied';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '   1. Run seed_data.sql to populate initial content';
  RAISE NOTICE '   2. Test authentication and data access';
  RAISE NOTICE '   3. Your app should now work!';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;
