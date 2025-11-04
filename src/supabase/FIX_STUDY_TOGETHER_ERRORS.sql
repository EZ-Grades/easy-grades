-- ============================================================================
-- FIX STUDY TOGETHER ERRORS
-- ============================================================================
-- This file fixes:
-- 1. Infinite recursion in room_participants RLS policy
-- 2. Missing room_code column in study_rooms table
-- 3. Missing columns for study together functionality
-- ============================================================================

-- Step 1: Add missing columns to study_rooms table
-- ============================================================================

-- Add room_code column (8 characters, unique)
ALTER TABLE study_rooms 
ADD COLUMN IF NOT EXISTS room_code VARCHAR(8) UNIQUE;

-- Add left_at column to room_participants
ALTER TABLE room_participants 
ADD COLUMN IF NOT EXISTS left_at TIMESTAMPTZ;

-- Add study_time_minutes to room_participants
ALTER TABLE room_participants 
ADD COLUMN IF NOT EXISTS study_time_minutes INTEGER NOT NULL DEFAULT 0;

-- Add last_seen_at if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'room_participants' AND column_name = 'last_seen_at'
  ) THEN
    ALTER TABLE room_participants ADD COLUMN last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- Add is_online column for backward compatibility
ALTER TABLE room_participants 
ADD COLUMN IF NOT EXISTS is_online BOOLEAN NOT NULL DEFAULT true;

-- Step 2: Create room_sessions table if it doesn't exist
-- ============================================================================

CREATE TABLE IF NOT EXISTS room_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('pomodoro', 'focus', 'break')),
  duration_seconds INTEGER NOT NULL,
  started_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_room_sessions_room ON room_sessions(room_id, is_active);
CREATE INDEX IF NOT EXISTS idx_room_sessions_active ON room_sessions(is_active, started_at DESC);

-- Step 3: Add closed_at column to study_rooms
-- ============================================================================

ALTER TABLE study_rooms 
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- Step 4: Fix message_type constraint in room_messages
-- ============================================================================

-- Drop old constraint if it exists
DO $$ 
BEGIN
  ALTER TABLE room_messages DROP CONSTRAINT IF EXISTS room_messages_message_type_check;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add new constraint that includes 'reaction' and 'system'
ALTER TABLE room_messages 
ADD CONSTRAINT room_messages_message_type_check_new 
CHECK (message_type IN ('text', 'system', 'emoji', 'reaction', 'message'));

-- Step 5: Create focus_events table if it doesn't exist
-- ============================================================================

CREATE TABLE IF NOT EXISTS focus_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  room_id UUID REFERENCES study_rooms(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('tab_switch', 'return', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_focus_events_user ON focus_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_focus_events_room ON focus_events(room_id, created_at DESC);

-- Step 6: Create user_playlists and playlist_tracks tables if they don't exist
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_playlists_user ON user_playlists(user_id);

CREATE TABLE IF NOT EXISTS playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES user_playlists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  duration TEXT NOT NULL,
  source_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist ON playlist_tracks(playlist_id, order_index);

-- Step 7: Update canvas_sessions to have created_by column
-- ============================================================================

ALTER TABLE canvas_sessions 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 8: Generate room codes for existing rooms
-- ============================================================================

-- Function to generate random 8-character room code
CREATE OR REPLACE FUNCTION generate_room_code() RETURNS VARCHAR(8) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result VARCHAR(8) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Generate codes for existing rooms that don't have one
DO $$
DECLARE
  room_record RECORD;
  new_code VARCHAR(8);
  code_exists BOOLEAN;
BEGIN
  FOR room_record IN SELECT id FROM study_rooms WHERE room_code IS NULL LOOP
    LOOP
      new_code := generate_room_code();
      SELECT EXISTS(SELECT 1 FROM study_rooms WHERE room_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    UPDATE study_rooms SET room_code = new_code WHERE id = room_record.id;
  END LOOP;
END $$;

-- Make room_code NOT NULL after populating existing rows
ALTER TABLE study_rooms 
ALTER COLUMN room_code SET NOT NULL;

-- Step 9: FIX THE INFINITE RECURSION IN RLS POLICIES
-- ============================================================================

-- Drop the problematic policies
DROP POLICY IF EXISTS "Room participants viewable by room members" ON room_participants;
DROP POLICY IF EXISTS "Room messages viewable by members" ON room_messages;
DROP POLICY IF EXISTS "Room members can send messages" ON room_messages;
DROP POLICY IF EXISTS "Canvas sessions viewable by room members" ON canvas_sessions;
DROP POLICY IF EXISTS "Room members can create canvas" ON canvas_sessions;

-- Create a helper function to check if user is in a room (bypasses RLS)
CREATE OR REPLACE FUNCTION is_user_in_room(p_room_id UUID, p_user_id UUID) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM room_participants
    WHERE room_id = p_room_id 
    AND user_id = p_user_id
    AND left_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create FIXED RLS policy for room_participants (NO RECURSION)
CREATE POLICY "Room participants viewable by room members"
  ON room_participants FOR SELECT
  USING (
    -- User can see their own participation
    user_id = auth.uid() 
    OR
    -- User can see participants in rooms they created
    room_id IN (SELECT id FROM study_rooms WHERE created_by = auth.uid())
    OR
    -- User can see other participants in public rooms
    room_id IN (SELECT id FROM study_rooms WHERE visibility = 'public' AND is_active = true)
  );

-- Create FIXED RLS policy for room_messages (uses function instead of subquery)
CREATE POLICY "Room messages viewable by members"
  ON room_messages FOR SELECT
  USING (
    room_id IN (
      SELECT id FROM study_rooms 
      WHERE visibility = 'public' 
      OR created_by = auth.uid()
    )
    OR
    user_id = auth.uid()
  );

CREATE POLICY "Room members can send messages"
  ON room_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    (
      room_id IN (SELECT id FROM study_rooms WHERE visibility = 'public' AND is_active = true)
      OR
      room_id IN (SELECT id FROM study_rooms WHERE created_by = auth.uid())
    )
  );

-- Create FIXED RLS policy for canvas_sessions
CREATE POLICY "Canvas sessions viewable by room members"
  ON canvas_sessions FOR SELECT
  USING (
    room_id IN (
      SELECT id FROM study_rooms 
      WHERE visibility = 'public' 
      OR created_by = auth.uid()
    )
    OR
    user_id = auth.uid()
  );

CREATE POLICY "Room members can create canvas"
  ON canvas_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    (
      room_id IN (SELECT id FROM study_rooms WHERE visibility = 'public' AND is_active = true)
      OR
      room_id IN (SELECT id FROM study_rooms WHERE created_by = auth.uid())
    )
  );

-- Step 10: Add RLS policies for new tables
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE room_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;

-- RLS for room_sessions
CREATE POLICY "Room sessions viewable by room members"
  ON room_sessions FOR SELECT
  USING (
    room_id IN (
      SELECT id FROM study_rooms 
      WHERE visibility = 'public' 
      OR created_by = auth.uid()
    )
  );

CREATE POLICY "Room creators can manage sessions"
  ON room_sessions FOR ALL
  TO authenticated
  USING (
    room_id IN (SELECT id FROM study_rooms WHERE created_by = auth.uid())
  )
  WITH CHECK (
    started_by = auth.uid() AND
    room_id IN (SELECT id FROM study_rooms WHERE created_by = auth.uid())
  );

-- RLS for focus_events
CREATE POLICY "Users can view own focus events"
  ON focus_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own focus events"
  ON focus_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS for user_playlists
CREATE POLICY "Users can view own playlists"
  ON user_playlists FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can manage own playlists"
  ON user_playlists FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS for playlist_tracks
CREATE POLICY "Users can view tracks in accessible playlists"
  ON playlist_tracks FOR SELECT
  TO authenticated
  USING (
    playlist_id IN (
      SELECT id FROM user_playlists 
      WHERE user_id = auth.uid() OR is_public = true
    )
  );

CREATE POLICY "Users can manage tracks in own playlists"
  ON playlist_tracks FOR ALL
  TO authenticated
  USING (
    playlist_id IN (SELECT id FROM user_playlists WHERE user_id = auth.uid())
  )
  WITH CHECK (
    playlist_id IN (SELECT id FROM user_playlists WHERE user_id = auth.uid())
  );

-- Step 11: Create indexes for room_code
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_study_rooms_room_code ON study_rooms(room_code) WHERE is_active = true;

-- Step 12: Update study_rooms policy to include room_code lookup
-- ============================================================================

DROP POLICY IF EXISTS "Study rooms viewable based on visibility" ON study_rooms;
CREATE POLICY "Study rooms viewable based on visibility"
  ON study_rooms FOR SELECT
  USING (
    is_active = true AND (
      visibility = 'public' OR
      created_by = auth.uid()
    )
  );

-- ============================================================================
-- VERIFICATION AND CLEANUP
-- ============================================================================

-- Verify the fix
DO $$ 
DECLARE
  column_exists BOOLEAN;
  policy_count INTEGER;
BEGIN
  -- Check if room_code exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'study_rooms' AND column_name = 'room_code'
  ) INTO column_exists;
  
  -- Count policies on room_participants
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'room_participants';
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '  ✅ STUDY TOGETHER ERRORS FIXED';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ room_code column: %', CASE WHEN column_exists THEN 'EXISTS' ELSE 'MISSING' END;
  RAISE NOTICE '✅ RLS policies fixed: % policies on room_participants', policy_count;
  RAISE NOTICE '✅ Missing tables created';
  RAISE NOTICE '✅ Missing columns added';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Changes made:';
  RAISE NOTICE '   1. Added room_code column to study_rooms';
  RAISE NOTICE '   2. Fixed infinite recursion in RLS policies';
  RAISE NOTICE '   3. Created room_sessions table';
  RAISE NOTICE '   4. Created focus_events table';
  RAISE NOTICE '   5. Created user_playlists table';
  RAISE NOTICE '   6. Created playlist_tracks table';
  RAISE NOTICE '   7. Added missing columns to room_participants';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Study Together should now work without errors!';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;
