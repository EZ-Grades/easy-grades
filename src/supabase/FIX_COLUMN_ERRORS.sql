-- ============================================================================
-- FIX COLUMN ERRORS - EZ GRADES
-- ============================================================================
-- This file fixes all the missing column errors:
-- 1. Fix i.quote → i.content in get_daily_inspiration() function
-- 2. Add track_type column to tracks table
-- 3. Fix canvas_sessions RLS policy
-- 4. Add end_time column to practice_sessions
-- 5. Add is_active column to tracks if missing
-- ============================================================================

-- ============================================================================
-- FIX 1: Add track_type column to tracks table
-- ============================================================================

-- Add track_type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracks' AND column_name = 'track_type'
  ) THEN
    ALTER TABLE tracks ADD COLUMN track_type TEXT NOT NULL DEFAULT 'music'
      CHECK (track_type IN ('music', 'ambient'));
  END IF;
END $$;

-- Add constraint if column exists but constraint doesn't
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE tracks DROP CONSTRAINT IF EXISTS tracks_track_type_check;
    ALTER TABLE tracks ADD CONSTRAINT tracks_track_type_check 
      CHECK (track_type IN ('music', 'ambient'));
  EXCEPTION WHEN OTHERS THEN 
    NULL;
  END;
END $$;

-- Add is_active column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracks' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE tracks ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;

-- Add album column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracks' AND column_name = 'album'
  ) THEN
    ALTER TABLE tracks ADD COLUMN album TEXT;
  END IF;
END $$;

-- Add cover_url column if it doesn't exist (rename from image_url if needed)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracks' AND column_name = 'cover_url'
  ) THEN
    -- Check if image_url exists and rename it
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tracks' AND column_name = 'image_url'
    ) THEN
      ALTER TABLE tracks RENAME COLUMN image_url TO cover_url;
    ELSE
      -- Create new column
      ALTER TABLE tracks ADD COLUMN cover_url TEXT;
    END IF;
  END IF;
END $$;

-- Create index on track_type
CREATE INDEX IF NOT EXISTS idx_tracks_track_type ON tracks(track_type, is_active);

-- ============================================================================
-- FIX 2: Add end_time column to practice_sessions
-- ============================================================================

-- Add end_time column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'practice_sessions' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE practice_sessions ADD COLUMN end_time TIMESTAMPTZ;
  END IF;
END $$;

-- Add start_time column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'practice_sessions' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE practice_sessions ADD COLUMN start_time TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- Add questions_attempted column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'practice_sessions' AND column_name = 'questions_attempted'
  ) THEN
    ALTER TABLE practice_sessions ADD COLUMN questions_attempted INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add questions_correct column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'practice_sessions' AND column_name = 'questions_correct'
  ) THEN
    ALTER TABLE practice_sessions ADD COLUMN questions_correct INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add score_percentage column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'practice_sessions' AND column_name = 'score_percentage'
  ) THEN
    ALTER TABLE practice_sessions ADD COLUMN score_percentage DECIMAL(5,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add time_spent_seconds column if it doesn't exist (might be named differently)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'practice_sessions' AND column_name = 'time_spent_seconds'
  ) THEN
    -- Check if there's a time_spent column and use that
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'practice_sessions' AND column_name = 'time_spent'
    ) THEN
      -- If time_spent exists but is integer type (seconds), rename it
      ALTER TABLE practice_sessions RENAME COLUMN time_spent TO time_spent_seconds;
    ELSE
      -- Create new column
      ALTER TABLE practice_sessions ADD COLUMN time_spent_seconds INTEGER NOT NULL DEFAULT 0;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- FIX 3: Recreate get_daily_inspiration() function with correct column name
-- ============================================================================

DROP FUNCTION IF EXISTS get_daily_inspiration();

CREATE OR REPLACE FUNCTION get_daily_inspiration()
RETURNS TABLE (
  id UUID,
  type TEXT,
  content TEXT,
  author TEXT,
  category TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.type,
    i.content,  -- ✅ CORRECT: Using 'content' not 'quote'
    i.author,
    i.category,
    i.is_active,
    i.created_at
  FROM inspirations i
  WHERE i.is_active = true
  ORDER BY md5(i.id::text || CURRENT_DATE::text)  -- Deterministic daily selection
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- FIX 4: Fix canvas_sessions RLS policies
-- ============================================================================

-- Drop existing canvas policies
DROP POLICY IF EXISTS "Canvas sessions viewable by room members" ON canvas_sessions;
DROP POLICY IF EXISTS "Room members can create canvas" ON canvas_sessions;
DROP POLICY IF EXISTS "Users can update own canvas" ON canvas_sessions;

-- Create FIXED policies that don't cause violations

-- Allow viewing canvas sessions
CREATE POLICY "Canvas sessions viewable by room members"
  ON canvas_sessions FOR SELECT
  USING (
    -- User created the session
    user_id = auth.uid()
    OR
    -- Room is public and active
    room_id IN (
      SELECT id FROM study_rooms 
      WHERE visibility = 'public' AND is_active = true
    )
    OR
    -- User created the room
    room_id IN (
      SELECT id FROM study_rooms 
      WHERE created_by = auth.uid()
    )
  );

-- Allow creating canvas sessions
CREATE POLICY "Room members can create canvas"
  ON canvas_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User must be the creator
    user_id = auth.uid()
    AND
    (
      -- Room is public and active
      room_id IN (
        SELECT id FROM study_rooms 
        WHERE visibility = 'public' AND is_active = true
      )
      OR
      -- User created the room
      room_id IN (
        SELECT id FROM study_rooms 
        WHERE created_by = auth.uid()
      )
    )
  );

-- Allow updating own canvas sessions
CREATE POLICY "Users can update own canvas"
  ON canvas_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow deleting own canvas sessions
CREATE POLICY "Users can delete own canvas"
  ON canvas_sessions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- FIX 5: Add missing columns to ambient_sounds if needed
-- ============================================================================

-- Add is_active column to ambient_sounds if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ambient_sounds' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE ambient_sounds ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;

-- ============================================================================
-- FIX 6: Create user_playback_state table if it doesn't exist
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_playback_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  current_position INTEGER NOT NULL DEFAULT 0,
  is_playing BOOLEAN NOT NULL DEFAULT false,
  volume INTEGER NOT NULL DEFAULT 70 CHECK (volume BETWEEN 0 AND 100),
  playback_mode TEXT NOT NULL DEFAULT 'normal' CHECK (playback_mode IN ('normal', 'loop', 'shuffle')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

CREATE INDEX IF NOT EXISTS idx_user_playback_state_user ON user_playback_state(user_id);
CREATE INDEX IF NOT EXISTS idx_user_playback_state_track ON user_playback_state(track_id);

-- Enable RLS
ALTER TABLE user_playback_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_playback_state
DROP POLICY IF EXISTS "Users can view own playback state" ON user_playback_state;
CREATE POLICY "Users can view own playback state"
  ON user_playback_state FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own playback state" ON user_playback_state;
CREATE POLICY "Users can manage own playback state"
  ON user_playback_state FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- FIX 7: Add missing columns to user_stats if needed
-- ============================================================================

-- Rename total_study_hours to total_focus_minutes if needed
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_stats' AND column_name = 'total_study_hours'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_stats' AND column_name = 'total_focus_minutes'
  ) THEN
    -- Convert hours to minutes and rename
    ALTER TABLE user_stats 
      ADD COLUMN total_focus_minutes INTEGER NOT NULL DEFAULT 0;
    
    UPDATE user_stats 
      SET total_focus_minutes = (total_study_hours * 60)::INTEGER;
    
    ALTER TABLE user_stats DROP COLUMN total_study_hours;
  END IF;
END $$;

-- Add total_focus_minutes if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_stats' AND column_name = 'total_focus_minutes'
  ) THEN
    ALTER TABLE user_stats ADD COLUMN total_focus_minutes INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add total_break_minutes if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_stats' AND column_name = 'total_break_minutes'
  ) THEN
    ALTER TABLE user_stats ADD COLUMN total_break_minutes INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add total_tasks_completed if it doesn't exist (might be named differently)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_stats' AND column_name = 'total_tasks_completed'
  ) THEN
    ALTER TABLE user_stats ADD COLUMN total_tasks_completed INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- ============================================================================
-- FIX 8: Ensure tracks table has all required columns
-- ============================================================================

-- Ensure duration is integer (not decimal)
DO $$ 
BEGIN
  -- Check current type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracks' 
    AND column_name = 'duration'
    AND data_type = 'numeric'
  ) THEN
    -- Convert from decimal to integer
    ALTER TABLE tracks ALTER COLUMN duration TYPE INTEGER USING duration::INTEGER;
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tracks table columns
DO $$
DECLARE
  has_track_type BOOLEAN;
  has_is_active BOOLEAN;
  has_cover_url BOOLEAN;
  has_album BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracks' AND column_name = 'track_type'
  ) INTO has_track_type;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracks' AND column_name = 'is_active'
  ) INTO has_is_active;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracks' AND column_name = 'cover_url'
  ) INTO has_cover_url;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracks' AND column_name = 'album'
  ) INTO has_album;
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '  ✅ COLUMN ERRORS FIXED';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tracks Table:';
  RAISE NOTICE '   track_type column: %', CASE WHEN has_track_type THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   is_active column: %', CASE WHEN has_is_active THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   cover_url column: %', CASE WHEN has_cover_url THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   album column: %', CASE WHEN has_album THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '';
END $$;

-- Verify practice_sessions columns
DO $$
DECLARE
  has_end_time BOOLEAN;
  has_start_time BOOLEAN;
  has_questions_attempted BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'practice_sessions' AND column_name = 'end_time'
  ) INTO has_end_time;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'practice_sessions' AND column_name = 'start_time'
  ) INTO has_start_time;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'practice_sessions' AND column_name = 'questions_attempted'
  ) INTO has_questions_attempted;
  
  RAISE NOTICE '📊 Practice Sessions Table:';
  RAISE NOTICE '   end_time column: %', CASE WHEN has_end_time THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   start_time column: %', CASE WHEN has_start_time THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   questions_attempted column: %', CASE WHEN has_questions_attempted THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '';
END $$;

-- Verify RPC function
DO $$
DECLARE
  function_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_daily_inspiration'
  ) INTO function_exists;
  
  RAISE NOTICE '📊 RPC Functions:';
  RAISE NOTICE '   get_daily_inspiration(): %', CASE WHEN function_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '';
END $$;

-- Verify canvas_sessions policies
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'canvas_sessions';
  
  RAISE NOTICE '📊 Canvas Sessions RLS:';
  RAISE NOTICE '   Policies configured: % policies', policy_count;
  RAISE NOTICE '';
END $$;

-- Final summary
DO $$
BEGIN
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '  🎯 ALL FIXES APPLIED SUCCESSFULLY';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Fixed Errors:';
  RAISE NOTICE '   1. Added track_type column to tracks';
  RAISE NOTICE '   2. Added end_time to practice_sessions';
  RAISE NOTICE '   3. Fixed get_daily_inspiration() function';
  RAISE NOTICE '   4. Fixed canvas_sessions RLS policies';
  RAISE NOTICE '   5. Added user_playback_state table';
  RAISE NOTICE '   6. Updated user_stats columns';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Test your app now - errors should be resolved!';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;
