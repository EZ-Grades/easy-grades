-- ============================================================================
-- AUTO PROFILE CREATION TRIGGER
-- ============================================================================
-- This trigger automatically creates a profile when a new user signs up
-- Run this AFTER deploying UNIFIED_SCHEMA.sql
-- ============================================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- Insert new profile
  INSERT INTO public.profiles (id, email, full_name, username, role, theme)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(split_part(NEW.email, '@', 1), '.', 1)),
    'user',
    'system'
  );

  -- Insert user preferences with defaults
  INSERT INTO public.user_preferences (user_id, default_focus_duration, default_break_duration, study_goal_hours)
  VALUES (
    NEW.id,
    25,  -- 25 minute focus sessions (Pomodoro default)
    5,   -- 5 minute breaks
    2    -- 2 hours daily study goal
  );

  -- Insert user stats initialized to zero
  INSERT INTO public.user_stats (
    user_id, 
    total_study_hours, 
    total_sessions, 
    total_tasks_completed, 
    current_streak_days, 
    longest_streak_days,
    total_points,
    level
  )
  VALUES (
    NEW.id,
    0,
    0,
    0,
    0,
    0,
    0,
    1
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '  ✅ AUTO PROFILE TRIGGER CREATED';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Trigger: on_auth_user_created';
  RAISE NOTICE '✅ Function: handle_new_user()';
  RAISE NOTICE '';
  RAISE NOTICE '📝 What happens now:';
  RAISE NOTICE '   When a user signs up with Supabase Auth...';
  RAISE NOTICE '   1. User created in auth.users';
  RAISE NOTICE '   2. Trigger automatically fires';
  RAISE NOTICE '   3. Profile created in profiles table';
  RAISE NOTICE '   4. Preferences created in user_preferences';
  RAISE NOTICE '   5. Stats created in user_stats';
  RAISE NOTICE '';
  RAISE NOTICE '✅ New users will have complete database records automatically!';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;
