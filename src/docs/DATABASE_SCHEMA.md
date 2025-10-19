# EZ Grades Database Schema

## Overview
EZ Grades uses PostgreSQL via Supabase with Row Level Security (RLS) policies to ensure data privacy and security.

---

## Schema Diagram

```
┌─────────────────┐
│   auth.users    │ (Supabase managed)
│─────────────────│
│ id (uuid)       │◄─────┐
│ email           │      │
│ created_at      │      │ Foreign Key
└─────────────────┘      │
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│    tasks     │ │    notes    │ │ focus_      │
│              │ │             │ │ sessions    │
└──────────────┘ └─────────────┘ └─────────────┘
```

---

## Core Tables

### auth.users (Supabase Managed)
System table managed by Supabase Auth.

**Key Fields:**
- `id` (uuid, PK) - Unique user identifier
- `email` (text) - User email
- `encrypted_password` (text) - Hashed password
- `email_confirmed_at` (timestamp) - Email verification time
- `created_at` (timestamp) - Account creation time
- `updated_at` (timestamp) - Last update time
- `user_metadata` (jsonb) - Custom metadata:
  ```json
  {
    "full_name": "John Doe",
    "username": "johndoe",
    "avatar_url": "https://..."
  }
  ```

**Indexes:**
- Primary Key: `id`
- Unique: `email`

---

## User Data Tables

### tasks
Stores user to-do tasks and assignments.

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMP WITH TIME ZONE,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id` - Unique task identifier
- `user_id` - Owner of the task
- `title` - Task title (required)
- `description` - Optional task details
- `completed` - Completion status
- `priority` - low | medium | high
- `due_date` - Optional deadline
- `category` - Custom category label
- `tags` - Array of tags for filtering
- `created_at` - Creation timestamp
- `updated_at` - Last modification timestamp

**Indexes:**
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);
```

**RLS Policies:**
```sql
-- Users can view their own tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own tasks
CREATE POLICY "Users can create own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own tasks
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own tasks
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

---

### notes
User study notes and quick annotations.

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT,
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT false,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id` - Unique note identifier
- `user_id` - Note owner
- `title` - Note title
- `content` - Note body (markdown supported)
- `category` - Custom category
- `tags` - Searchable tags
- `is_pinned` - Pin to top
- `color` - Visual organization color
- `created_at` - Creation time
- `updated_at` - Last edit time

**Indexes:**
```sql
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_pinned ON notes(is_pinned);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
```

**RLS Policies:** Same pattern as tasks (user-scoped CRUD)

---

### calendar_events
User calendar events and deadlines.

```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  color TEXT DEFAULT '#7D4AE1',
  event_type TEXT CHECK (event_type IN ('class', 'exam', 'assignment', 'meeting', 'personal', 'other')),
  reminder_minutes INTEGER,
  recurrence_rule TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id` - Event identifier
- `user_id` - Event owner
- `title` - Event name
- `description` - Event details
- `start_time` - Event start
- `end_time` - Event end
- `location` - Physical/virtual location
- `color` - Calendar color coding
- `event_type` - Categorization
- `reminder_minutes` - Reminder time before event
- `recurrence_rule` - iCal RRULE format for repeating events
- `created_at` - Creation time
- `updated_at` - Modification time

**Indexes:**
```sql
CREATE INDEX idx_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_events_end_time ON calendar_events(end_time);
CREATE INDEX idx_events_type ON calendar_events(event_type);
```

**RLS Policies:** User-scoped CRUD

---

### focus_sessions
Focus mode and Pomodoro session tracking.

```sql
CREATE TABLE focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  focus_type TEXT CHECK (focus_type IN ('pomodoro', 'deep_focus', 'flow_state', 'study_sprint')),
  subject TEXT,
  notes TEXT,
  interruptions INTEGER DEFAULT 0,
  productivity_rating INTEGER CHECK (productivity_rating >= 1 AND productivity_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

**Columns:**
- `id` - Session identifier
- `user_id` - Session owner
- `duration_minutes` - Planned duration
- `completed` - Whether session finished
- `focus_type` - Session mode
- `subject` - Study topic
- `notes` - Post-session reflection
- `interruptions` - Number of distractions
- `productivity_rating` - Self-assessment (1-5)
- `created_at` - Session start
- `completed_at` - Session end

**Indexes:**
```sql
CREATE INDEX idx_focus_user_id ON focus_sessions(user_id);
CREATE INDEX idx_focus_completed ON focus_sessions(completed);
CREATE INDEX idx_focus_type ON focus_sessions(focus_type);
CREATE INDEX idx_focus_created_at ON focus_sessions(created_at DESC);
```

**RLS Policies:** User-scoped CRUD

---

### journal_entries
Daily journaling with stickers and mood tracking.

```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  content TEXT,
  mood TEXT CHECK (mood IN ('happy', 'sad', 'neutral', 'excited', 'stressed', 'calm', 'anxious')),
  stickers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);
```

**Columns:**
- `id` - Entry identifier
- `user_id` - Journal owner
- `entry_date` - Date of entry (one per day)
- `content` - Journal text
- `mood` - Emotional state
- `stickers` - Array of sticker objects:
  ```json
  [
    {
      "id": "sticker1",
      "emoji": "😊",
      "x": 100,
      "y": 200
    }
  ]
  ```
- `created_at` - First created
- `updated_at` - Last edited

**Indexes:**
```sql
CREATE INDEX idx_journal_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_date ON journal_entries(entry_date DESC);
CREATE UNIQUE INDEX idx_journal_user_date ON journal_entries(user_id, entry_date);
```

**RLS Policies:** User-scoped CRUD

---

## Study Together Tables

### study_rooms
Virtual study rooms for collaboration.

```sql
CREATE TABLE study_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  host_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT,
  max_participants INTEGER DEFAULT 10,
  current_participants INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  password_hash TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id` - Room identifier
- `name` - Room name
- `description` - Room purpose
- `host_user_id` - Room creator
- `subject` - Study topic
- `max_participants` - Capacity limit
- `current_participants` - Current count
- `is_active` - Whether room is open
- `is_public` - Listed in public rooms
- `password_hash` - Optional password protection
- `settings` - Room configuration:
  ```json
  {
    "allow_chat": true,
    "allow_drawing": true,
    "mute_on_join": false
  }
  ```
- `created_at` - Room creation
- `updated_at` - Last activity

**Indexes:**
```sql
CREATE INDEX idx_rooms_active ON study_rooms(is_active);
CREATE INDEX idx_rooms_public ON study_rooms(is_public);
CREATE INDEX idx_rooms_host ON study_rooms(host_user_id);
CREATE INDEX idx_rooms_created ON study_rooms(created_at DESC);
```

**RLS Policies:**
```sql
-- Anyone can view public rooms
CREATE POLICY "Public rooms are viewable by all" ON study_rooms
  FOR SELECT USING (is_public = true OR auth.uid() = host_user_id);

-- Only authenticated users can create rooms
CREATE POLICY "Authenticated users can create rooms" ON study_rooms
  FOR INSERT WITH CHECK (auth.uid() = host_user_id);

-- Only host can update room
CREATE POLICY "Host can update room" ON study_rooms
  FOR UPDATE USING (auth.uid() = host_user_id);

-- Only host can delete room
CREATE POLICY "Host can delete room" ON study_rooms
  FOR DELETE USING (auth.uid() = host_user_id);
```

---

### room_participants
Tracks who's in each study room.

```sql
CREATE TABLE room_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  role TEXT CHECK (role IN ('host', 'moderator', 'participant')) DEFAULT 'participant',
  UNIQUE(room_id, user_id)
);
```

**Columns:**
- `id` - Participation record ID
- `room_id` - Associated room
- `user_id` - Participant
- `joined_at` - Join time
- `left_at` - Leave time (null if still in room)
- `is_active` - Currently in room
- `role` - Permission level

**Indexes:**
```sql
CREATE INDEX idx_participants_room ON room_participants(room_id);
CREATE INDEX idx_participants_user ON room_participants(user_id);
CREATE INDEX idx_participants_active ON room_participants(is_active);
CREATE UNIQUE INDEX idx_participants_room_user ON room_participants(room_id, user_id);
```

**RLS Policies:**
```sql
-- Participants can view room members
CREATE POLICY "Participants can view room members" ON room_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_participants rp
      WHERE rp.room_id = room_participants.room_id
      AND rp.user_id = auth.uid()
      AND rp.is_active = true
    )
  );

-- Users can join rooms
CREATE POLICY "Users can join rooms" ON room_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can leave (update their record)
CREATE POLICY "Users can leave rooms" ON room_participants
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## Media Tables

### music_playlists
Curated music playlists for studying.

```sql
CREATE TABLE music_playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS Policies:**
```sql
-- Public playlists viewable by all
CREATE POLICY "Public playlists viewable" ON music_playlists
  FOR SELECT USING (is_public = true);
```

---

### music_tracks
Individual music tracks.

```sql
CREATE TABLE music_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES music_playlists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT,
  duration_seconds INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  cover_art_url TEXT,
  track_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_tracks_playlist ON music_tracks(playlist_id);
CREATE INDEX idx_tracks_order ON music_tracks(track_order);
```

**RLS Policies:**
```sql
-- Tracks viewable if playlist is public
CREATE POLICY "Public tracks viewable" ON music_tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM music_playlists
      WHERE music_playlists.id = music_tracks.playlist_id
      AND music_playlists.is_public = true
    )
  );
```

---

### ambient_sounds
Background ambient sounds.

```sql
CREATE TABLE ambient_sounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('nature', 'urban', 'white_noise', 'cafe', 'other')),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  is_loopable BOOLEAN DEFAULT true,
  volume_default DECIMAL(3,2) DEFAULT 0.5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_ambient_category ON ambient_sounds(category);
CREATE INDEX idx_ambient_active ON ambient_sounds(is_active);
```

**RLS Policies:**
```sql
-- All users can view active ambient sounds
CREATE POLICY "Active ambient sounds viewable" ON ambient_sounds
  FOR SELECT USING (is_active = true);
```

---

## Analytics Tables

### user_statistics
Aggregate user statistics (optional).

```sql
CREATE TABLE user_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_focus_minutes INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

**RLS Policies:** User-scoped read/write

---

## Database Functions

### Update Updated_at Timestamp
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (apply to other tables)
```

---

### Update Room Participant Count
```sql
CREATE OR REPLACE FUNCTION update_room_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE study_rooms
  SET current_participants = (
    SELECT COUNT(*) FROM room_participants
    WHERE room_id = COALESCE(NEW.room_id, OLD.room_id)
    AND is_active = true
  )
  WHERE id = COALESCE(NEW.room_id, OLD.room_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_room_count_on_join
  AFTER INSERT OR UPDATE OR DELETE ON room_participants
  FOR EACH ROW EXECUTE FUNCTION update_room_participant_count();
```

---

## Migration Strategy

### Version Control
- All schema changes versioned in `/supabase/schema.sql`
- Incremental updates in `/supabase/schema_updates.sql`
- Use Supabase migrations for production

### Rollback Plan
```sql
-- Always create backup before migration
BEGIN;
-- Migration SQL here
-- Test changes
ROLLBACK; -- or COMMIT if successful
```

---

## Backup & Recovery

### Automated Backups
- Supabase provides daily automated backups (free tier: 7 days retention)
- Pro tier: Point-in-time recovery

### Manual Backup
```bash
pg_dump -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f backup.dump
```

### Restore
```bash
pg_restore -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  -c \
  backup.dump
```

---

## Performance Optimization

### Indexes Created
- All foreign keys indexed
- Commonly queried columns indexed
- GIN indexes on array columns (tags)
- Partial indexes on active records

### Query Optimization
```sql
-- Explain query plan
EXPLAIN ANALYZE
SELECT * FROM tasks WHERE user_id = 'uuid' AND completed = false;
```

### Connection Pooling
- Supabase uses PgBouncer
- Max connections: 15 (free tier)
- Transaction pooling mode

---

**Last Updated:** October 9, 2025
**Schema Version:** 2.0
**Documentation Status:** ✅ Complete
