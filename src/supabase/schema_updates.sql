-- EZ Grades Database Schema
-- This file contains all the SQL needed to set up your Supabase database

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text not null unique,
  full_name text,
  username text unique,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create chat_history table for AI assistant
create table public.chat_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  message text not null,
  response text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.chat_history enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Chat history policies
create policy "Users can view own chat history"
  on chat_history for select
  using ( auth.uid() = user_id );

create policy "Users can insert own chat history"
  on chat_history for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own chat history"
  on chat_history for update
  using ( auth.uid() = user_id );

create policy "Users can delete own chat history"
  on chat_history for delete
  using ( auth.uid() = user_id );

-- Function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update updated_at on profiles
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- BREAK MODE TABLES
-- ==========================================

-- Tracks table for ambient sounds and music
create table if not exists public.tracks (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  mood text not null, -- calm, focus, energizing
  genre text not null, -- lofi, classical, ambient
  description text,
  url text not null,
  cover_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User track play history (optional)
create table public.user_play_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  track_id uuid references public.tracks not null,
  played_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User volume settings
create table public.user_volume_settings (
  user_id uuid references auth.users not null primary key,
  master_volume integer default 70 check (master_volume >= 0 and master_volume <= 100),
  ambient_volume integer default 50 check (ambient_volume >= 0 and ambient_volume <= 100),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- DASHBOARD TABLES
-- ==========================================

-- Tasks table
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notes table
create table public.notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Weekly goals table
create table public.weekly_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  hours_goal integer not null default 40,
  progress_hours numeric(5,2) default 0.0,
  week_start_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, week_start_date)
);

-- Daily sessions for stats tracking
create table public.daily_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  session_date date not null,
  completed_sessions integer default 0,
  total_minutes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, session_date)
);

-- ==========================================
-- FOCUS MODE TABLES
-- ==========================================

-- Focus sessions table
create table public.focus_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  duration_minutes integer not null,
  completed_minutes integer default 0,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  ambience_mode text,
  fullscreen boolean default false,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ambient sounds configuration
create table public.ambient_sounds (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  default_volume integer default 50 check (default_volume >= 0 and default_volume <= 100),
  icon text,
  audio_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User ambient sound settings
create table public.user_ambient_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  ambient_sound_id uuid references public.ambient_sounds not null,
  enabled boolean default false,
  volume integer default 50 check (volume >= 0 and volume <= 100),
  unique(user_id, ambient_sound_id)
);

-- Blocked sites for distraction blocker
create table public.blocked_sites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User settings for distraction blocker
create table public.user_settings (
  user_id uuid references auth.users not null primary key,
  distraction_block_enabled boolean default false,
  show_blocked_sites boolean default true,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ambience modes
create table public.ambience_modes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  icon text,
  bg_class text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- Tracks - public read, admin write
alter table public.tracks enable row level security;
create policy "Tracks are viewable by everyone" on tracks for select using (true);

-- User play history
alter table public.user_play_history enable row level security;
create policy "Users can view own play history" on user_play_history for select using (auth.uid() = user_id);
create policy "Users can insert own play history" on user_play_history for insert with check (auth.uid() = user_id);

-- User volume settings
alter table public.user_volume_settings enable row level security;
create policy "Users can view own volume settings" on user_volume_settings for select using (auth.uid() = user_id);
create policy "Users can insert own volume settings" on user_volume_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own volume settings" on user_volume_settings for update using (auth.uid() = user_id);

-- Tasks
alter table public.tasks enable row level security;
create policy "Users can view own tasks" on tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on tasks for delete using (auth.uid() = user_id);

-- Notes
alter table public.notes enable row level security;
create policy "Users can view own notes" on notes for select using (auth.uid() = user_id);
create policy "Users can insert own notes" on notes for insert with check (auth.uid() = user_id);
create policy "Users can update own notes" on notes for update using (auth.uid() = user_id);
create policy "Users can delete own notes" on notes for delete using (auth.uid() = user_id);

-- Weekly goals
alter table public.weekly_goals enable row level security;
create policy "Users can view own weekly goals" on weekly_goals for select using (auth.uid() = user_id);
create policy "Users can insert own weekly goals" on weekly_goals for insert with check (auth.uid() = user_id);
create policy "Users can update own weekly goals" on weekly_goals for update using (auth.uid() = user_id);

-- Daily sessions
alter table public.daily_sessions enable row level security;
create policy "Users can view own daily sessions" on daily_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own daily sessions" on daily_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own daily sessions" on daily_sessions for update using (auth.uid() = user_id);

-- Focus sessions
alter table public.focus_sessions enable row level security;
create policy "Users can view own focus sessions" on focus_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own focus sessions" on focus_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own focus sessions" on focus_sessions for update using (auth.uid() = user_id);

-- Ambient sounds - public read
alter table public.ambient_sounds enable row level security;
create policy "Ambient sounds are viewable by everyone" on ambient_sounds for select using (true);

-- User ambient settings
alter table public.user_ambient_settings enable row level security;
create policy "Users can view own ambient settings" on user_ambient_settings for select using (auth.uid() = user_id);
create policy "Users can insert own ambient settings" on user_ambient_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own ambient settings" on user_ambient_settings for update using (auth.uid() = user_id);

-- Blocked sites
alter table public.blocked_sites enable row level security;
create policy "Users can view own blocked sites" on blocked_sites for select using (auth.uid() = user_id);
create policy "Users can insert own blocked sites" on blocked_sites for insert with check (auth.uid() = user_id);
create policy "Users can delete own blocked sites" on blocked_sites for delete using (auth.uid() = user_id);

-- User settings
alter table public.user_settings enable row level security;
create policy "Users can view own settings" on user_settings for select using (auth.uid() = user_id);
create policy "Users can insert own settings" on user_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on user_settings for update using (auth.uid() = user_id);

-- Ambience modes - public read
alter table public.ambience_modes enable row level security;
create policy "Ambience modes are viewable by everyone" on ambience_modes for select using (true);

-- ==========================================
-- TRIGGERS FOR UPDATED_AT
-- ==========================================

create trigger on_tasks_updated before update on public.tasks for each row execute procedure public.handle_updated_at();
create trigger on_notes_updated before update on public.notes for each row execute procedure public.handle_updated_at();
create trigger on_weekly_goals_updated before update on public.weekly_goals for each row execute procedure public.handle_updated_at();
create trigger on_daily_sessions_updated before update on public.daily_sessions for each row execute procedure public.handle_updated_at();
create trigger on_user_volume_settings_updated before update on public.user_volume_settings for each row execute procedure public.handle_updated_at();
create trigger on_user_settings_updated before update on public.user_settings for each row execute procedure public.handle_updated_at();

-- ==========================================
-- SEED DATA
-- ==========================================

-- Insert default tracks
insert into public.tracks (name, mood, genre, description, url, cover_url) values
('Peaceful Forest', 'calm', 'ambient', 'Gentle sounds of a forest with birds chirping', 'https://www.soundjay.com/misc/sounds-misc/forest-ambient.mp3', null),
('Lofi Study Beat', 'focus', 'lofi', 'Relaxing lofi beats perfect for studying', 'https://www.soundjay.com/misc/sounds-misc/lofi-study.mp3', null),
('Ocean Waves', 'calm', 'ambient', 'Soothing ocean waves for relaxation', 'https://www.soundjay.com/misc/sounds-misc/ocean-waves.mp3', null),
('Classical Focus', 'focus', 'classical', 'Classical music to enhance concentration', 'https://www.soundjay.com/misc/sounds-misc/classical-focus.mp3', null),
('Energizing Beats', 'energizing', 'electronic', 'Upbeat music to boost energy levels', 'https://www.soundjay.com/misc/sounds-misc/energizing-beats.mp3', null);

-- Insert default ambient sounds
insert into public.ambient_sounds (name, default_volume, icon, audio_url) values
('Rain', 50, '🌧️', 'https://www.soundjay.com/weather/sounds-weather/rain-heavy.mp3'),
('Forest', 40, '🌲', 'https://www.soundjay.com/nature/sounds-nature/forest-birds.mp3'),
('Ocean', 45, '🌊', 'https://www.soundjay.com/nature/sounds-nature/ocean-waves.mp3'),
('Coffee Shop', 35, '☕', 'https://www.soundjay.com/ambient/sounds-ambient/coffee-shop.mp3'),
('White Noise', 30, '⚪', 'https://www.soundjay.com/ambient/sounds-ambient/white-noise.mp3'),
('Fireplace', 40, '🔥', 'https://www.soundjay.com/ambient/sounds-ambient/fireplace.mp3');

-- Insert default ambience modes
insert into public.ambience_modes (name, description, icon, bg_class) values
('Forest Retreat', 'Immerse yourself in a peaceful forest setting', '🌲', 'bg-gradient-to-br from-green-400 to-green-600'),
('Ocean Paradise', 'Study by the calming ocean waves', '🌊', 'bg-gradient-to-br from-blue-400 to-blue-600'),
('Mountain Peak', 'Focus at the top of a serene mountain', '⛰️', 'bg-gradient-to-br from-gray-400 to-gray-600'),
('Cozy Library', 'Traditional library atmosphere', '📚', 'bg-gradient-to-br from-amber-400 to-amber-600'),
('Space Station', 'Study among the stars', '🚀', 'bg-gradient-to-br from-purple-400 to-purple-600'),
('Minimal Focus', 'Clean, distraction-free environment', '⚪', 'bg-gradient-to-br from-gray-200 to-gray-300');

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
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
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
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- User course enrollments
CREATE TABLE public.user_course_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  course_id UUID REFERENCES public.courses NOT NULL,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at TIMESTAMPTZ,
  enrolled_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(user_id, course_id)
);

-- User certification progress
CREATE TABLE public.user_certification_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  certification_id UUID REFERENCES public.certifications NOT NULL,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(user_id, certification_id)
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
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
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
  completed_at TIMESTAMPTZ,
  enrolled_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(user_id, learning_path_id)
);

-- ==========================================
-- STUDY TOGETHER / COLLABORATION TABLES
-- ==========================================

-- Study rooms
create table public.study_rooms (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  room_code text unique not null,
  host_user_id uuid references auth.users not null,
  max_participants integer default 10,
  is_public boolean default true,
  password_hash text,
  theme text default 'forest',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Room participants
create table public.room_participants (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.study_rooms on delete cascade not null,
  user_id uuid references auth.users not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  left_at timestamp with time zone,
  is_online boolean default true,
  status text default 'studying' check (status in ('studying', 'break', 'away')),
  study_time_minutes integer default 0,
  unique(room_id, user_id)
);

-- Study sessions (shared timer)
create table public.room_sessions (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.study_rooms on delete cascade not null,
  session_type text not null check (session_type in ('pomodoro', 'focus', 'break')),
  duration_seconds integer not null,
  started_by uuid references auth.users not null,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Room chat messages
create table public.room_chat_messages (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.study_rooms on delete cascade not null,
  user_id uuid references auth.users not null,
  message text not null,
  message_type text default 'message' check (message_type in ('message', 'system', 'reaction')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User playlists (personal, not shared)
create table public.user_playlists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null default 'My Playlist',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, name)
);

-- Playlist tracks
create table public.playlist_tracks (
  id uuid default uuid_generate_v4() primary key,
  playlist_id uuid references public.user_playlists on delete cascade not null,
  title text not null,
  artist text not null,
  duration text not null,
  source_url text,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Collaborative canvas sessions
create table public.canvas_sessions (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.study_rooms on delete cascade not null,
  canvas_data jsonb,
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(room_id)
);

-- Canvas strokes for real-time collaboration
create table public.canvas_strokes (
  id uuid default uuid_generate_v4() primary key,
  canvas_session_id uuid references public.canvas_sessions on delete cascade not null,
  user_id uuid references auth.users not null,
  stroke_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Room ambient sound settings (shared per room)
create table public.room_ambient_settings (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.study_rooms on delete cascade not null,
  sound_name text not null,
  volume integer default 50 check (volume >= 0 and volume <= 100),
  enabled boolean default false,
  icon text,
  unique(room_id, sound_name)
);

-- Focus events for distraction detection
create table public.focus_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  room_id uuid references public.study_rooms on delete cascade,
  event_type text not null check (event_type in ('tab_switch', 'return', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Room access control
create table public.room_access (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.study_rooms on delete cascade not null,
  user_id uuid references auth.users not null,
  role text default 'participant' check (role in ('host', 'participant')),
  invite_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(room_id, user_id)
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
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  event_type TEXT DEFAULT 'personal' CHECK (event_type IN ('personal', 'study', 'break', 'deadline', 'exam')),
  color TEXT,
  reminder_minutes INTEGER DEFAULT 15,
  is_all_day BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- Calendar reminders
CREATE TABLE public.calendar_reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.calendar_events NOT NULL,
  reminder_time TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
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
  notification_enabled BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  auto_start_break BOOLEAN DEFAULT FALSE,
  auto_start_focus BOOLEAN DEFAULT FALSE,
  preferred_ambient_sound TEXT,
  dashboard_layout JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- Custom backgrounds for focus mode
CREATE TABLE public.custom_backgrounds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
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
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- User achievements
CREATE TABLE public.user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  achievement_id UUID REFERENCES public.achievements NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
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
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);


-- ==========================================
-- IMPROVED TASK AND NOTE SYSTEM
-- ==========================================

-- Update tasks table to include more fields
alter table public.tasks add column if not exists description text;
alter table public.tasks add column if not exists priority text default 'medium' check (priority in ('low', 'medium', 'high'));
alter table public.tasks add column if not exists due_date timestamp with time zone;
alter table public.tasks add column if not exists category text;
alter table public.tasks add column if not exists tags text[];

-- Note categories
CREATE TABLE public.note_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(user_id, name)
);

-- Update notes table
alter table public.notes add column if not exists category_id uuid references public.note_categories;
alter table public.notes add column if not exists tags text[];
alter table public.notes add column if not exists is_pinned boolean default false;

-- ==========================================
-- AI CHAT IMPROVEMENTS
-- ==========================================

-- AI chat sessions for better organization
CREATE TABLE public.ai_chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  context_type TEXT DEFAULT 'general' 
    CHECK (context_type IN ('general', 'study_help', 'course_specific', 'homework_help')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- Update chat_history to reference sessions
alter table public.chat_history add column if not exists session_id uuid references public.ai_chat_sessions;
alter table public.chat_history add column if not exists message_type text default 'user' check (message_type in ('user', 'assistant', 'system'));

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
  upload_context TEXT NOT NULL 
    CHECK (upload_context IN ('profile_avatar', 'custom_background', 'note_attachment', 'canvas_save')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- ==========================================
-- RLS POLICIES FOR NEW TABLES
-- ==========================================

-- StudyHub tables
alter table public.courses enable row level security;
alter table public.certifications enable row level security;
alter table public.learning_paths enable row level security;
alter table public.user_course_enrollments enable row level security;
alter table public.user_certification_progress enable row level security;
alter table public.learning_path_courses enable row level security;
alter table public.user_learning_path_enrollments enable row level security;

create policy "Courses are viewable by everyone" on courses for select using (true);
create policy "Certifications are viewable by everyone" on certifications for select using (true);
create policy "Learning paths are viewable by everyone" on learning_paths for select using (true);
create policy "Learning path courses are viewable by everyone" on learning_path_courses for select using (true);

create policy "Users can view own course enrollments" on user_course_enrollments for select using (auth.uid() = user_id);
create policy "Users can insert own course enrollments" on user_course_enrollments for insert with check (auth.uid() = user_id);
create policy "Users can update own course enrollments" on user_course_enrollments for update using (auth.uid() = user_id);

create policy "Users can view own certification progress" on user_certification_progress for select using (auth.uid() = user_id);
create policy "Users can insert own certification progress" on user_certification_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own certification progress" on user_certification_progress for update using (auth.uid() = user_id);

create policy "Users can view own learning path enrollments" on user_learning_path_enrollments for select using (auth.uid() = user_id);
create policy "Users can insert own learning path enrollments" on user_learning_path_enrollments for insert with check (auth.uid() = user_id);
create policy "Users can update own learning path enrollments" on user_learning_path_enrollments for update using (auth.uid() = user_id);

-- Study room policies
alter table public.study_rooms enable row level security;
alter table public.room_participants enable row level security;
alter table public.room_chat_messages enable row level security;
alter table public.canvas_sessions enable row level security;
alter table public.canvas_strokes enable row level security;

create policy "Study rooms are viewable by participants" on study_rooms for select using (
  id in (select room_id from room_participants where user_id = auth.uid() and left_at is null)
  or host_user_id = auth.uid()
  or is_public = true
);

create policy "Users can create study rooms" on study_rooms for insert with check (auth.uid() = host_user_id);
create policy "Room hosts can update their rooms" on study_rooms for update using (auth.uid() = host_user_id);

create policy "Users can view participants in their rooms" on room_participants for select using (
  room_id in (select id from study_rooms where host_user_id = auth.uid())
  or user_id = auth.uid()
);

create policy "Users can join rooms" on room_participants for insert with check (auth.uid() = user_id);
create policy "Users can update their own participation" on room_participants for update using (auth.uid() = user_id);

create policy "Room members can view chat messages" on room_chat_messages for select using (
  room_id in (select room_id from room_participants where user_id = auth.uid() and left_at is null)
);

create policy "Room members can send chat messages" on room_chat_messages for insert with check (
  auth.uid() = user_id and
  room_id in (select room_id from room_participants where user_id = auth.uid() and left_at is null)
);

create policy "Room members can view canvas sessions" on canvas_sessions for select using (
  room_id in (select room_id from room_participants where user_id = auth.uid() and left_at is null)
);

create policy "Room members can create canvas sessions" on canvas_sessions for insert with check (
  auth.uid() = created_by and
  room_id in (select room_id from room_participants where user_id = auth.uid() and left_at is null)
);

create policy "Room members can update canvas sessions" on canvas_sessions for update using (
  room_id in (select room_id from room_participants where user_id = auth.uid() and left_at is null)
);

create policy "Room members can view canvas strokes" on canvas_strokes for select using (
  canvas_session_id in (
    select id from canvas_sessions where room_id in (
      select room_id from room_participants where user_id = auth.uid() and left_at is null
    )
  )
);

create policy "Room members can add canvas strokes" on canvas_strokes for insert with check (
  auth.uid() = user_id and
  canvas_session_id in (
    select id from canvas_sessions where room_id in (
      select room_id from room_participants where user_id = auth.uid() and left_at is null
    )
  )
);

-- Enable row level security
ALTER TABLE public.room_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Room members can view sessions
CREATE POLICY "Room members can view sessions"
ON public.room_sessions
FOR SELECT
USING (
  room_id IN (
    SELECT room_id 
    FROM public.room_participants 
    WHERE user_id = auth.uid() AND left_at IS NULL
  )
);

-- Policy: Room hosts can create sessions
CREATE POLICY "Room hosts can create sessions"
ON public.room_sessions
FOR INSERT
WITH CHECK (
  auth.uid() = started_by AND
  room_id IN (
    SELECT id 
    FROM public.study_rooms 
    WHERE host_user_id = auth.uid()
  )
);

-- Policy: Room hosts can update sessions
CREATE POLICY "Room hosts can update sessions"
ON public.room_sessions
FOR UPDATE
USING (
  room_id IN (
    SELECT id 
    FROM public.study_rooms 
    WHERE host_user_id = auth.uid()
  )
);

-- ==========================================
-- USER PLAYLIST POLICIES
-- ==========================================
ALTER TABLE public.user_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

-- User playlists
CREATE POLICY "Users can view own playlists"
ON public.user_playlists
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own playlists"
ON public.user_playlists
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists"
ON public.user_playlists
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists"
ON public.user_playlists
FOR DELETE
USING (auth.uid() = user_id);

-- Playlist tracks
CREATE POLICY "Users can view own playlist tracks"
ON public.playlist_tracks
FOR SELECT
USING (
  playlist_id IN (SELECT id FROM public.user_playlists WHERE user_id = auth.uid())
);

CREATE POLICY "Users can add tracks to own playlists"
ON public.playlist_tracks
FOR INSERT
WITH CHECK (
  playlist_id IN (SELECT id FROM public.user_playlists WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update own playlist tracks"
ON public.playlist_tracks
FOR UPDATE
USING (
  playlist_id IN (SELECT id FROM public.user_playlists WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete own playlist tracks"
ON public.playlist_tracks
FOR DELETE
USING (
  playlist_id IN (SELECT id FROM public.user_playlists WHERE user_id = auth.uid())
);

-- ==========================================
-- ROOM AMBIENT SETTINGS POLICIES
-- ==========================================
ALTER TABLE public.room_ambient_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room members can view ambient settings"
ON public.room_ambient_settings
FOR SELECT
USING (
  room_id IN (SELECT room_id FROM public.room_participants WHERE user_id = auth.uid() AND left_at IS NULL)
);

CREATE POLICY "Room hosts can manage ambient settings"
ON public.room_ambient_settings
FOR ALL
USING (
  room_id IN (SELECT id FROM public.study_rooms WHERE host_user_id = auth.uid())
);

-- ==========================================
-- FOCUS EVENTS POLICIES
-- ==========================================
ALTER TABLE public.focus_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own focus events"
ON public.focus_events
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focus events"
ON public.focus_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- ROOM ACCESS POLICIES
-- ==========================================
ALTER TABLE public.room_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view room access"
ON public.room_access
FOR SELECT
USING (
  auth.uid() = user_id OR
  room_id IN (SELECT id FROM public.study_rooms WHERE host_user_id = auth.uid())
);

CREATE POLICY "Room hosts can manage access"
ON public.room_access
FOR ALL
USING (
  room_id IN (SELECT id FROM public.study_rooms WHERE host_user_id = auth.uid())
);

-- Calendar policies
alter table public.calendar_events enable row level security;
alter table public.calendar_reminders enable row level security;

create policy "Users can view own calendar events" on calendar_events for select using (auth.uid() = user_id);
create policy "Users can insert own calendar events" on calendar_events for insert with check (auth.uid() = user_id);
create policy "Users can update own calendar events" on calendar_events for update using (auth.uid() = user_id);
create policy "Users can delete own calendar events" on calendar_events for delete using (auth.uid() = user_id);

create policy "Users can view own reminders" on calendar_reminders for select using (
  event_id in (select id from calendar_events where user_id = auth.uid())
);

create policy "Users can insert own reminders" on calendar_reminders for insert with check (
  event_id in (select id from calendar_events where user_id = auth.uid())
);

-- User customization policies
alter table public.user_preferences enable row level security;
alter table public.custom_backgrounds enable row level security;
alter table public.note_categories enable row level security;

create policy "Users can view own preferences" on user_preferences for select using (auth.uid() = user_id);
create policy "Users can insert own preferences" on user_preferences for insert with check (auth.uid() = user_id);
create policy "Users can update own preferences" on user_preferences for update using (auth.uid() = user_id);

create policy "Users can view own custom backgrounds" on custom_backgrounds for select using (auth.uid() = user_id);
create policy "Users can insert own custom backgrounds" on custom_backgrounds for insert with check (auth.uid() = user_id);
create policy "Users can delete own custom backgrounds" on custom_backgrounds for delete using (auth.uid() = user_id);

create policy "Users can view own note categories" on note_categories for select using (auth.uid() = user_id);
create policy "Users can insert own note categories" on note_categories for insert with check (auth.uid() = user_id);
create policy "Users can update own note categories" on note_categories for update using (auth.uid() = user_id);
create policy "Users can delete own note categories" on note_categories for delete using (auth.uid() = user_id);

-- Achievement policies
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.user_stats enable row level security;

create policy "Achievements are viewable by everyone" on achievements for select using (true);

create policy "Users can view own achievements" on user_achievements for select using (auth.uid() = user_id);
create policy "Users can earn achievements" on user_achievements for insert with check (auth.uid() = user_id);

create policy "Users can view own stats" on user_stats for select using (auth.uid() = user_id);
create policy "Users can insert own stats" on user_stats for insert with check (auth.uid() = user_id);
create policy "Users can update own stats" on user_stats for update using (auth.uid() = user_id);

-- AI chat policies
alter table public.ai_chat_sessions enable row level security;

create policy "Users can view own chat sessions" on ai_chat_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own chat sessions" on ai_chat_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own chat sessions" on ai_chat_sessions for update using (auth.uid() = user_id);
create policy "Users can delete own chat sessions" on ai_chat_sessions for delete using (auth.uid() = user_id);

-- File upload policies
alter table public.file_uploads enable row level security;

create policy "Users can view own file uploads" on file_uploads for select using (auth.uid() = user_id);
create policy "Users can insert own file uploads" on file_uploads for insert with check (auth.uid() = user_id);
create policy "Users can delete own file uploads" on file_uploads for delete using (auth.uid() = user_id);

-- ==========================================
-- TRIGGERS FOR NEW TABLES
-- ==========================================

create trigger on_courses_updated before update on public.courses for each row execute procedure public.handle_updated_at();
create trigger on_certifications_updated before update on public.certifications for each row execute procedure public.handle_updated_at();
create trigger on_learning_paths_updated before update on public.learning_paths for each row execute procedure public.handle_updated_at();
create trigger on_study_rooms_updated before update on public.study_rooms for each row execute procedure public.handle_updated_at();
create trigger on_canvas_sessions_updated before update on public.canvas_sessions for each row execute procedure public.handle_updated_at();
create trigger on_calendar_events_updated before update on public.calendar_events for each row execute procedure public.handle_updated_at();
create trigger on_user_preferences_updated before update on public.user_preferences for each row execute procedure public.handle_updated_at();
create trigger on_user_stats_updated before update on public.user_stats for each row execute procedure public.handle_updated_at();
create trigger on_ai_chat_sessions_updated before update on public.ai_chat_sessions for each row execute procedure public.handle_updated_at();

-- ==========================================
-- FUNCTIONS FOR STATS TRACKING
-- ==========================================

-- Function to update streaks
create or replace function update_user_streak()
returns trigger as $$
declare
  last_date date;
  current_streak integer;
begin
  select last_activity_date, current_streak_days
  into last_date, current_streak
  from public.user_stats
  where user_id = new.user_id;

  if last_date is null or last_date < current_date - interval '1 day' then
    -- Reset streak if more than 1 day gap
    current_streak := 1;
  elsif last_date = current_date - interval '1 day' then
    -- Continue streak
    current_streak := current_streak + 1;
  end if;

  update public.user_stats set
    current_streak_days = current_streak,
    longest_streak_days = greatest(longest_streak_days, current_streak),
    updated_at = now()
  where user_id = new.user_id;

  return new;
end;
$$ language plpgsql;

-- Trigger to update streak after stats change
create trigger on_daily_activity
  after insert or update on public.user_stats
  for each row
  execute procedure update_user_streak();


-- ==========================================
-- SEED DATA FOR NEW FEATURES
-- ==========================================

-- Insert sample courses
insert into public.courses (title, description, category, difficulty, duration_hours, icon, color, is_featured) values
('JavaScript Fundamentals', 'Learn the basics of JavaScript programming', 'Programming', 'beginner', 40, 'Code', '#F59E0B', true),
('React Development', 'Build modern web applications with React', 'Programming', 'intermediate', 60, 'Smartphone', '#10B981', true),
('Data Structures & Algorithms', 'Master computer science fundamentals', 'Computer Science', 'advanced', 80, 'Database', '#8B5CF6', false),
('Python for Data Science', 'Analyze data with Python', 'Data Science', 'intermediate', 50, 'BarChart3', '#06B6D4', true),
('Machine Learning Basics', 'Introduction to ML concepts', 'AI/ML', 'intermediate', 45, 'Brain', '#EC4899', false);

-- Insert sample certifications
insert into public.certifications (title, description, category, difficulty, icon, color, is_featured) values
('Full Stack Web Developer', 'Complete web development certification', 'Programming', 'advanced', 'Globe', '#8B5CF6', true),
('Data Analyst Professional', 'Professional data analysis certification', 'Data Science', 'intermediate', 'BarChart3', '#06B6D4', true),
('Cloud Solutions Architect', 'Cloud infrastructure certification', 'Cloud Computing', 'advanced', 'Cloud', '#10B981', false),
('Cybersecurity Specialist', 'Information security certification', 'Security', 'advanced', 'Shield', '#EF4444', true);

-- Insert sample learning paths
insert into public.learning_paths (title, description, category, estimated_duration_hours, difficulty, icon, color, is_featured) values
('Frontend Developer Path', 'Complete frontend development journey', 'Programming', 120, 'beginner', 'Smartphone', '#F59E0B', true),
('Data Science Path', 'Become a data science professional', 'Data Science', 150, 'intermediate', 'BarChart3', '#06B6D4', true),
('Full Stack Engineer Path', 'End-to-end web development skills', 'Programming', 200, 'advanced', 'Globe', '#8B5CF6', false);

-- Insert sample achievements
insert into public.achievements (name, description, category, icon, badge_color, requirement_type, requirement_value, points_reward) values
('First Steps', 'Complete your first focus session', 'Getting Started', '🎯', '#10B981', 'sessions_completed', 1, 10),
('Focused Mind', 'Complete 10 focus sessions', 'Focus', '🧠', '#8B5CF6', 'sessions_completed', 10, 50),
('Time Master', 'Focus for 100 minutes total', 'Focus', '⏰', '#F59E0B', 'focus_time', 100, 25),
('Dedicated Learner', 'Maintain a 7-day streak', 'Consistency', '🔥', '#EF4444', 'streak_days', 7, 100),
('Course Champion', 'Complete your first course', 'Learning', '🎓', '#06B6D4', 'courses_completed', 1, 75),
('Certification Master', 'Earn your first certification', 'Achievement', '🏆', '#EC4899', 'certifications_earned', 1, 150);

-- ==========================================
-- PERFORMANCE INDEXES
-- ==========================================

-- Create indexes for better performance
create index profiles_username_idx on public.profiles (username);
create index chat_history_user_id_idx on public.chat_history (user_id);
create index chat_history_created_at_idx on public.chat_history (created_at desc);

-- Break Mode indexes
create index tracks_mood_idx on public.tracks (mood);
create index tracks_genre_idx on public.tracks (genre);
create index user_play_history_user_id_idx on public.user_play_history (user_id);
create index user_play_history_played_at_idx on public.user_play_history (played_at desc);

-- Dashboard indexes
create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_created_at_idx on public.tasks (created_at desc);
create index if not exists tasks_completed_idx on public.tasks (completed);
create index if not exists tasks_priority_idx on public.tasks (priority);
create index if not exists tasks_due_date_idx on public.tasks (due_date);

create index if not exists notes_user_id_idx on public.notes (user_id);
create index if not exists notes_created_at_idx on public.notes (created_at desc);
create index if not exists notes_category_idx on public.notes (category_id);

create index if not exists weekly_goals_user_id_idx on public.weekly_goals (user_id);
create index if not exists weekly_goals_week_start_idx on public.weekly_goals (week_start_date);

create index if not exists daily_sessions_user_id_idx on public.daily_sessions (user_id);
create index if not exists daily_sessions_date_idx on public.daily_sessions (session_date desc);

-- Focus Mode indexes
create index if not exists focus_sessions_user_id_idx on public.focus_sessions (user_id);
create index if not exists focus_sessions_start_time_idx on public.focus_sessions (start_time desc);
create index if not exists focus_sessions_completed_idx on public.focus_sessions (completed);
create index if not exists user_ambient_settings_user_id_idx on public.user_ambient_settings (user_id);
create index if not exists blocked_sites_user_id_idx on public.blocked_sites (user_id);

-- StudyHub indexes
create index if not exists courses_category_idx on public.courses (category);
create index if not exists courses_difficulty_idx on public.courses (difficulty);
create index if not exists courses_featured_idx on public.courses (is_featured);
create index if not exists certifications_category_idx on public.certifications (category);
create index if not exists user_course_enrollments_user_id_idx on public.user_course_enrollments (user_id);
create index if not exists user_certification_progress_user_id_idx on public.user_certification_progress (user_id);
create index if not exists learning_paths_category_idx on public.learning_paths (category);

-- Collaboration indexes
create index if not exists study_rooms_host_idx on public.study_rooms (host_user_id);
create index if not exists study_rooms_code_idx on public.study_rooms (room_code);
create index if not exists room_participants_room_idx on public.room_participants (room_id);
create index if not exists room_participants_user_idx on public.room_participants (user_id);
create index if not exists room_chat_messages_room_idx on public.room_chat_messages (room_id);
create index if not exists room_chat_messages_created_idx on public.room_chat_messages (created_at desc);

-- Calendar indexes
create index if not exists calendar_events_user_id_idx on public.calendar_events (user_id);
create index if not exists calendar_events_start_time_idx on public.calendar_events (start_time);
create index if not exists calendar_events_type_idx on public.calendar_events (event_type);

-- Achievement indexes
create index if not exists user_achievements_user_id_idx on public.user_achievements (user_id);
create index if not exists user_stats_last_activity_idx on public.user_stats (last_activity_date);

-- Chat indexes
create index if not exists ai_chat_sessions_user_id_idx on public.ai_chat_sessions (user_id);
create index if not exists chat_history_session_idx on public.chat_history (session_id);
