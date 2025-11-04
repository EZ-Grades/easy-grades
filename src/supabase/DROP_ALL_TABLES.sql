-- ============================================================================
-- DROP ALL EZ GRADES TABLES - CLEAN SLATE
-- ============================================================================
-- ⚠️ WARNING: This will DELETE ALL DATA in your database!
-- ⚠️ Only run this if you want to start completely fresh
-- ============================================================================

-- Drop tables in reverse dependency order to avoid foreign key conflicts

-- Part 5: Social & Study Rooms
DROP TABLE IF EXISTS canvas_sessions CASCADE;
DROP TABLE IF EXISTS room_messages CASCADE;
DROP TABLE IF EXISTS room_participants CASCADE;
DROP TABLE IF EXISTS study_rooms CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;

-- Part 4: Study Hub
DROP TABLE IF EXISTS chat_history CASCADE;
DROP TABLE IF EXISTS practice_sessions CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS flashcards CASCADE;
DROP TABLE IF EXISTS flashcard_decks CASCADE;
DROP TABLE IF EXISTS exam_questions CASCADE;
DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- Part 3: Content (Music, Sounds, Inspirations)
DROP TABLE IF EXISTS playback_state CASCADE;
DROP TABLE IF EXISTS user_sound_settings CASCADE;
DROP TABLE IF EXISTS inspirations CASCADE;
DROP TABLE IF EXISTS ambient_sounds CASCADE;
DROP TABLE IF EXISTS tracks CASCADE;

-- Part 2: Focus Sessions & Calendar
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS custom_backgrounds CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS weekly_goals CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;

-- Drop all focus_sessions partitions
DROP TABLE IF EXISTS focus_sessions_2025_01 CASCADE;
DROP TABLE IF EXISTS focus_sessions_2025_02 CASCADE;
DROP TABLE IF EXISTS focus_sessions_2025_03 CASCADE;
DROP TABLE IF EXISTS focus_sessions_2025_04 CASCADE;
DROP TABLE IF EXISTS focus_sessions_2025_05 CASCADE;
DROP TABLE IF EXISTS focus_sessions_2025_06 CASCADE;
DROP TABLE IF EXISTS focus_sessions_2025_07 CASCADE;
DROP TABLE IF EXISTS focus_sessions_2025_08 CASCADE;
DROP TABLE IF EXISTS focus_sessions_2025_09 CASCADE;
DROP TABLE IF EXISTS focus_sessions_2025_10 CASCADE;
DROP TABLE IF EXISTS focus_sessions_2025_11 CASCADE;
DROP TABLE IF EXISTS focus_sessions_2025_12 CASCADE;

-- Drop parent table
DROP TABLE IF EXISTS focus_sessions CASCADE;

-- Part 1: Core Tables
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS note_categories CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop KV Store (if it exists from backend)
DROP TABLE IF EXISTS kv_store_7ba2faf7 CASCADE;

-- Drop ENUMs
DROP TYPE IF EXISTS participant_status CASCADE;
DROP TYPE IF EXISTS room_visibility CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;
DROP TYPE IF EXISTS difficulty_level CASCADE;
DROP TYPE IF EXISTS event_type CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;
DROP TYPE IF EXISTS theme_preference CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Success message
DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ All tables and types dropped successfully';
  RAISE NOTICE '✅ Database is now clean';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next step: Run UNIFIED_SCHEMA.sql to create all tables';
  RAISE NOTICE '';
END $$;
