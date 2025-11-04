-- Fix RLS policies for canvas_sessions table
-- This fixes the "new row violates row-level security policy" error

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view canvas sessions in their rooms" ON canvas_sessions;
DROP POLICY IF EXISTS "Users can create canvas sessions in their rooms" ON canvas_sessions;
DROP POLICY IF EXISTS "Users can update canvas sessions in their rooms" ON canvas_sessions;
DROP POLICY IF EXISTS "Users can delete canvas sessions they created" ON canvas_sessions;

-- Enable RLS
ALTER TABLE canvas_sessions ENABLE ROW LEVEL SECURITY;

-- Create new policies

-- Allow users to view canvas sessions in rooms they're participating in
CREATE POLICY "Users can view canvas sessions in their rooms"
ON canvas_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM room_participants
    WHERE room_participants.room_id = canvas_sessions.room_id
    AND room_participants.user_id = auth.uid()
    AND room_participants.left_at IS NULL
  )
);

-- Allow users to create canvas sessions in rooms they're participating in
CREATE POLICY "Users can create canvas sessions in their rooms"
ON canvas_sessions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM room_participants
    WHERE room_participants.room_id = canvas_sessions.room_id
    AND room_participants.user_id = auth.uid()
    AND room_participants.left_at IS NULL
  )
  AND auth.uid() = created_by
);

-- Allow users to update canvas sessions in rooms they're participating in
CREATE POLICY "Users can update canvas sessions in their rooms"
ON canvas_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM room_participants
    WHERE room_participants.room_id = canvas_sessions.room_id
    AND room_participants.user_id = auth.uid()
    AND room_participants.left_at IS NULL
  )
);

-- Allow users to delete canvas sessions they created
CREATE POLICY "Users can delete canvas sessions they created"
ON canvas_sessions
FOR DELETE
USING (
  created_by = auth.uid()
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON canvas_sessions TO authenticated;
GRANT USAGE ON SEQUENCE canvas_sessions_id_seq TO authenticated;
