-- ============================================================================
-- VERIFY EZ GRADES DATABASE DEPLOYMENT
-- ============================================================================
-- Run this after deploying UNIFIED_SCHEMA.sql to verify everything worked
-- ============================================================================

DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY[
        -- Core (5)
        'profiles', 'user_preferences', 'tasks', 'note_categories', 'notes',
        
        -- Focus Sessions (13 - parent + 12 partitions)
        'focus_sessions',
        'focus_sessions_2025_01', 'focus_sessions_2025_02', 'focus_sessions_2025_03',
        'focus_sessions_2025_04', 'focus_sessions_2025_05', 'focus_sessions_2025_06',
        'focus_sessions_2025_07', 'focus_sessions_2025_08', 'focus_sessions_2025_09',
        'focus_sessions_2025_10', 'focus_sessions_2025_11', 'focus_sessions_2025_12',
        
        -- Stats & Calendar (5)
        'daily_stats', 'weekly_goals', 'journal_entries', 'custom_backgrounds', 'calendar_events',
        
        -- Media (5)
        'tracks', 'ambient_sounds', 'inspirations', 'user_sound_settings', 'playback_state',
        
        -- Study Hub (8)
        'courses', 'certifications', 'exam_questions', 'flashcard_decks', 'flashcards',
        'course_enrollments', 'practice_sessions', 'chat_history',
        
        -- Social (7)
        'achievements', 'user_achievements', 'study_rooms', 'room_participants',
        'room_messages', 'canvas_sessions', 'user_stats',
        
        -- Backend (1)
        'kv_store_7ba2faf7'
    ];
    tbl TEXT;             -- Loop variable
    exists_flag BOOLEAN;
    found_count INTEGER := 0;
    missing_count INTEGER := 0;
BEGIN
    -- Count total tables in the database
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public';
    
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '  📊 EZ GRADES DATABASE VERIFICATION';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Total tables in database: %', table_count;
    RAISE NOTICE '📋 Expected tables: %', array_length(expected_tables, 1);
    RAISE NOTICE '';
    RAISE NOTICE '--- Checking each table ---';
    RAISE NOTICE '';
    
    -- Loop through expected tables and check existence
    FOREACH tbl IN ARRAY expected_tables
    LOOP
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables t
            WHERE t.table_schema = 'public' AND t.table_name = tbl
        ) INTO exists_flag;

        IF exists_flag THEN
            RAISE NOTICE '  ✅ %', tbl;
            found_count := found_count + 1;
        ELSE
            RAISE NOTICE '  ❌ % (MISSING!)', tbl;
            missing_count := missing_count + 1;
        END IF;
    END LOOP;

    -- Summary
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '  SUMMARY';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Found: % tables', found_count;
    RAISE NOTICE '❌ Missing: % tables', missing_count;
    RAISE NOTICE '';
    
    IF missing_count = 0 THEN
        RAISE NOTICE '🎉 SUCCESS! All tables are present!';
        RAISE NOTICE '';
        RAISE NOTICE '✅ Your database is fully deployed';
        RAISE NOTICE '✅ All % expected tables found', array_length(expected_tables, 1);
        RAISE NOTICE '✅ Ready to use!';
        RAISE NOTICE '';
        RAISE NOTICE '📝 Next steps:';
        RAISE NOTICE '   1. Run seed_data.sql for sample content';
        RAISE NOTICE '   2. Test your app authentication';
        RAISE NOTICE '   3. Start using EZ Grades!';
    ELSE
        RAISE NOTICE '⚠️  WARNING: % table(s) missing!', missing_count;
        RAISE NOTICE '';
        RAISE NOTICE '🔧 To fix:';
        RAISE NOTICE '   1. Check Supabase logs for errors';
        RAISE NOTICE '   2. Re-run UNIFIED_SCHEMA.sql';
        RAISE NOTICE '   3. Run this verification again';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- Show all tables currently in the database with categories
-- ============================================================================

SELECT 
    '📁 All tables in your database:' AS info;

SELECT 
    table_name,
    CASE 
        WHEN table_name LIKE 'focus_sessions%' THEN 'Focus Sessions'
        WHEN table_name IN ('profiles', 'user_preferences') THEN 'User Core'
        WHEN table_name IN ('tasks', 'notes', 'note_categories') THEN 'Tasks & Notes'
        WHEN table_name IN ('tracks', 'ambient_sounds', 'inspirations', 'user_sound_settings', 'playback_state') THEN 'Media'
        WHEN table_name IN ('daily_stats', 'weekly_goals', 'journal_entries', 'calendar_events', 'custom_backgrounds') THEN 'Stats & Calendar'
        WHEN table_name LIKE '%course%' OR table_name LIKE '%exam%' OR table_name LIKE '%flashcard%' OR table_name = 'chat_history' THEN 'Study Hub'
        WHEN table_name LIKE '%room%' OR table_name LIKE '%achievement%' OR table_name = 'user_stats' OR table_name = 'canvas_sessions' THEN 'Social'
        WHEN table_name = 'kv_store_7ba2faf7' THEN 'Backend KV Store'
        ELSE 'Other'
    END AS category
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY category, table_name;
