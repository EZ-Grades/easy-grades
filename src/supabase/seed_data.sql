-- ============================================================================
-- EZ GRADES - SEED DATA
-- ============================================================================
-- This populates initial content for tracks, ambient sounds, inspirations,
-- courses, certifications, and achievements
-- Run this AFTER deploying UNIFIED_SCHEMA.sql
-- ============================================================================

-- ============================================================================
-- MUSIC TRACKS
-- ============================================================================

INSERT INTO tracks (title, artist, url, duration, genre, mood, image_url, is_premium) VALUES
-- Lo-fi Study Beats
('Calm Waters', 'Study Beats', 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3', 180, 'Lo-fi', 'relaxing', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300', false),
('Morning Coffee', 'Chill Hop', 'https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-738.mp3', 165, 'Lo-fi', 'focused', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300', false),
('Peaceful Mind', 'Lo-fi Dreams', 'https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3', 195, 'Lo-fi', 'calm', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300', false),

-- Classical
('Classical Focus', 'Piano Masters', 'https://assets.mixkit.co/music/preview/mixkit-a-very-happy-christmas-897.mp3', 200, 'Classical', 'focused', 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300', false),
('Gentle Piano', 'Classical Collective', 'https://assets.mixkit.co/music/preview/mixkit-piano-reflections-643.mp3', 210, 'Classical', 'calm', 'https://images.unsplash.com/photo-1552422535-c45813c61732?w=300', false),

-- Ambient Electronic
('Digital Dreams', 'Ambient Lab', 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3', 190, 'Electronic', 'energetic', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300', false),
('Deep Focus', 'Electronic Focus', 'https://assets.mixkit.co/music/preview/mixkit-deep-urban-623.mp3', 185, 'Electronic', 'focused', 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300', false),

-- Jazz
('Smooth Study Jazz', 'Jazz Cafe', 'https://assets.mixkit.co/music/preview/mixkit-jazz-coffee-13.mp3', 175, 'Jazz', 'relaxing', 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=300', false),
('Evening Jazz', 'Smooth Collective', 'https://assets.mixkit.co/music/preview/mixkit-upbeat-indie-9.mp3', 168, 'Jazz', 'calm', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300', false),

-- Acoustic
('Gentle Strings', 'Acoustic Sessions', 'https://assets.mixkit.co/music/preview/mixkit-a-very-happy-christmas-897.mp3', 185, 'Acoustic', 'relaxing', 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300', false),
('Acoustic Calm', 'Guitar Dreams', 'https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-738.mp3', 192, 'Acoustic', 'calm', 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=300', false),

-- Nature Sounds
('Forest Meditation', 'Nature Sounds', 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3', 210, 'Ambient', 'calm', 'https://images.unsplash.com/photo-1511497584788-876760111969?w=300', false)

ON CONFLICT DO NOTHING;

-- ============================================================================
-- AMBIENT SOUNDS
-- ============================================================================

INSERT INTO ambient_sounds (name, url, icon, category, volume_default, is_premium) VALUES
-- Nature Sounds
('Rain', 'https://assets.mixkit.co/sfx/preview/mixkit-rain-and-thunder-1289.mp3', 'CloudRain', 'nature', 0.5, false),
('Ocean Waves', 'https://assets.mixkit.co/sfx/preview/mixkit-ocean-waves-loop-1196.mp3', 'Waves', 'nature', 0.5, false),
('Forest', 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3', 'TreePine', 'nature', 0.4, false),
('Thunderstorm', 'https://assets.mixkit.co/sfx/preview/mixkit-thunder-rumble-1291.mp3', 'CloudLightning', 'nature', 0.6, false),
('River Stream', 'https://assets.mixkit.co/sfx/preview/mixkit-small-stream-in-the-forest-1212.mp3', 'Droplets', 'nature', 0.4, false),
('Birds Chirping', 'https://assets.mixkit.co/sfx/preview/mixkit-morning-birds-1210.mp3', 'Bird', 'nature', 0.3, false),

-- White Noise
('White Noise', 'https://assets.mixkit.co/sfx/preview/mixkit-air-woosh-1489.mp3', 'Wind', 'white_noise', 0.5, false),
('Pink Noise', 'https://assets.mixkit.co/sfx/preview/mixkit-wind-strong-1487.mp3', 'Sparkles', 'white_noise', 0.5, false),
('Brown Noise', 'https://assets.mixkit.co/sfx/preview/mixkit-heavy-wind-1485.mp3', 'Volume2', 'white_noise', 0.5, false),

-- Cafe & City
('Coffee Shop', 'https://assets.mixkit.co/sfx/preview/mixkit-cafe-ambience-1236.mp3', 'Coffee', 'cafe', 0.4, false),
('Library', 'https://assets.mixkit.co/sfx/preview/mixkit-quiet-library-ambience-1238.mp3', 'BookOpen', 'cafe', 0.3, false),

-- Focus Sounds
('Fireplace', 'https://assets.mixkit.co/sfx/preview/mixkit-fireplace-crackle-1330.mp3', 'Flame', 'ambient', 0.5, false),
('Fan', 'https://assets.mixkit.co/sfx/preview/mixkit-fan-loop-1237.mp3', 'Fan', 'ambient', 0.4, false),
('Keyboard Typing', 'https://assets.mixkit.co/sfx/preview/mixkit-keyboard-typing-1386.mp3', 'Keyboard', 'ambient', 0.3, false)

ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- INSPIRATIONS (Quotes, Tips, Facts)
-- ============================================================================

INSERT INTO inspirations (type, content, author, category, is_active) VALUES
-- Study Quotes
('quote', 'The expert in anything was once a beginner.', 'Helen Hayes', 'motivation', true),
('quote', 'Education is not the filling of a pail, but the lighting of a fire.', 'William Butler Yeats', 'learning', true),
('quote', 'The beautiful thing about learning is that nobody can take it away from you.', 'B.B. King', 'learning', true),
('quote', 'Success is the sum of small efforts repeated day in and day out.', 'Robert Collier', 'motivation', true),
('quote', 'Study while others are sleeping; work while others are loafing.', 'William Arthur Ward', 'productivity', true),
('quote', 'The only way to learn mathematics is to do mathematics.', 'Paul Halmos', 'learning', true),
('quote', 'Tell me and I forget. Teach me and I remember. Involve me and I learn.', 'Benjamin Franklin', 'learning', true),
('quote', 'The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.', 'Brian Herbert', 'motivation', true),

-- Study Tips
('tip', 'Use the Pomodoro Technique: Study for 25 minutes, then take a 5-minute break.', null, 'productivity', true),
('tip', 'Test yourself regularly. Active recall is one of the most effective study methods.', null, 'learning', true),
('tip', 'Study in different locations to improve memory retention and recall.', null, 'learning', true),
('tip', 'Teach what you learn to someone else - it helps solidify your understanding.', null, 'learning', true),
('tip', 'Get 7-9 hours of sleep. Your brain consolidates memories while you sleep.', null, 'wellness', true),
('tip', 'Take handwritten notes. Writing by hand improves memory and comprehension.', null, 'productivity', true),
('tip', 'Break large tasks into smaller, manageable chunks to avoid overwhelm.', null, 'productivity', true),
('tip', 'Use spaced repetition: Review material at increasing intervals for better retention.', null, 'learning', true),
('tip', 'Stay hydrated. Even mild dehydration can impair cognitive function.', null, 'wellness', true),
('tip', 'Create a dedicated study space free from distractions.', null, 'productivity', true),

-- Interesting Facts
('fact', 'Your brain can process information as fast as 268 mph - faster than a Formula 1 car!', null, 'brain', true),
('fact', 'Chewing gum while studying can improve concentration and memory recall.', null, 'brain', true),
('fact', 'Exercise increases blood flow to the brain, improving focus and memory.', null, 'wellness', true),
('fact', 'Learning a new language can increase brain size and improve cognitive function.', null, 'brain', true),
('fact', 'The human brain uses 20% of the body''s total energy, despite being only 2% of body weight.', null, 'brain', true),
('fact', 'Studying right before sleep can improve memory consolidation.', null, 'learning', true),
('fact', 'Music can improve focus, but lyrics may distract - instrumental is often better for studying.', null, 'productivity', true),
('fact', 'Taking breaks improves productivity. Your brain needs rest to consolidate information.', null, 'wellness', true)

ON CONFLICT DO NOTHING;

-- ============================================================================
-- COURSES
-- ============================================================================

INSERT INTO courses (title, description, subject, difficulty, thumbnail_url, total_lessons, estimated_hours, is_featured, rating) VALUES
('Introduction to Computer Science', 'Learn the fundamentals of programming and computer science', 'Computer Science', 'beginner', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400', 24, 40.0, true, 4.8),
('Calculus I', 'Master the basics of differential and integral calculus', 'Mathematics', 'intermediate', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400', 30, 50.0, true, 4.7),
('General Chemistry', 'Explore the building blocks of matter and chemical reactions', 'Chemistry', 'beginner', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400', 28, 45.0, false, 4.6),
('World History', 'Journey through major events and civilizations throughout time', 'History', 'beginner', 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400', 20, 35.0, false, 4.5),
('Biology Fundamentals', 'Understanding life: cells, genetics, and evolution', 'Biology', 'beginner', 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400', 26, 42.0, true, 4.7),
('Data Structures & Algorithms', 'Essential concepts for efficient programming', 'Computer Science', 'advanced', 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400', 32, 60.0, true, 4.9),
('English Literature', 'Explore classic and modern literary works', 'Literature', 'intermediate', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', 22, 38.0, false, 4.4),
('Physics I', 'Classical mechanics, energy, and motion', 'Physics', 'intermediate', 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400', 28, 48.0, false, 4.6),
('Spanish for Beginners', 'Learn conversational Spanish from scratch', 'Language', 'beginner', 'https://images.unsplash.com/photo-1543109740-4bdb38fda756?w=400', 18, 30.0, false, 4.5),
('Psychology 101', 'Introduction to human behavior and mental processes', 'Psychology', 'beginner', 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=400', 24, 40.0, true, 4.8)

ON CONFLICT DO NOTHING;

-- ============================================================================
-- CERTIFICATIONS
-- ============================================================================

INSERT INTO certifications (name, description, issuing_organization, icon_url, difficulty, total_questions, passing_score, time_limit_minutes, is_active) VALUES
('Python Programming Fundamentals', 'Test your knowledge of Python basics, syntax, and core concepts', 'EZ Grades Academy', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=200', 'beginner', 50, 70, 60, true),
('Advanced Calculus', 'Certification in advanced calculus topics including multivariable calculus', 'EZ Grades Academy', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200', 'advanced', 40, 75, 90, true),
('Web Development Basics', 'HTML, CSS, and JavaScript fundamentals certification', 'EZ Grades Academy', 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=200', 'beginner', 45, 70, 60, true),
('Data Science Essentials', 'Core concepts in data analysis, statistics, and visualization', 'EZ Grades Academy', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200', 'intermediate', 60, 75, 90, true),
('Biology: Cell & Molecular', 'Advanced certification in cellular and molecular biology', 'EZ Grades Academy', 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=200', 'advanced', 50, 80, 75, true),
('English Grammar Mastery', 'Comprehensive test of English grammar rules and usage', 'EZ Grades Academy', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200', 'intermediate', 40, 70, 45, true)

ON CONFLICT DO NOTHING;

-- ============================================================================
-- EXAM QUESTIONS (Sample for Python Certification)
-- ============================================================================

DO $$
DECLARE
  python_cert_id UUID;
BEGIN
  -- Get Python certification ID
  SELECT id INTO python_cert_id FROM certifications WHERE name = 'Python Programming Fundamentals' LIMIT 1;
  
  IF python_cert_id IS NOT NULL THEN
    INSERT INTO exam_questions (certification_id, question_text, options, correct_answer, explanation, difficulty, topic) VALUES
    (python_cert_id, 'What is the output of: print(type([]))?', 
     '{"A": "<class ''str''>", "B": "<class ''list''>", "C": "<class ''dict''>", "D": "<class ''tuple''>"}'::jsonb,
     'B', 'Empty square brackets [] create a list in Python, so type([]) returns <class ''list''>', 'beginner', 'Data Types'),
    
    (python_cert_id, 'Which keyword is used to create a function in Python?',
     '{"A": "function", "B": "def", "C": "func", "D": "define"}'::jsonb,
     'B', 'The def keyword is used to define functions in Python', 'beginner', 'Functions'),
    
    (python_cert_id, 'What does the len() function return when called on a string?',
     '{"A": "The number of words", "B": "The number of characters", "C": "The memory size", "D": "The string type"}'::jsonb,
     'B', 'len() returns the number of characters in a string, including spaces and special characters', 'beginner', 'Built-in Functions'),
    
    (python_cert_id, 'Which of the following is a mutable data type in Python?',
     '{"A": "tuple", "B": "string", "C": "list", "D": "integer"}'::jsonb,
     'C', 'Lists are mutable (can be changed after creation), while tuples, strings, and integers are immutable', 'intermediate', 'Data Types'),
    
    (python_cert_id, 'What is the correct way to create a dictionary in Python?',
     '{"A": "dict = ()", "B": "dict = []", "C": "dict = {}", "D": "dict = <>"}'::jsonb,
     'C', 'Curly braces {} are used to create dictionaries in Python', 'beginner', 'Data Structures');
  END IF;
END $$;

-- ============================================================================
-- ACHIEVEMENTS
-- ============================================================================

INSERT INTO achievements (name, description, icon, category, points, rarity, criteria) VALUES
-- Study Achievements
('First Steps', 'Complete your first study session', '👣', 'study', 10, 'common', '{"type": "sessions_completed", "value": 1}'::jsonb),
('Study Warrior', 'Complete 10 study sessions', '⚔️', 'study', 50, 'common', '{"type": "sessions_completed", "value": 10}'::jsonb),
('Knowledge Seeker', 'Study for 10 hours total', '📚', 'study', 100, 'rare', '{"type": "total_hours", "value": 10}'::jsonb),
('Scholar', 'Study for 50 hours total', '🎓', 'study', 250, 'rare', '{"type": "total_hours", "value": 50}'::jsonb),
('Master Student', 'Study for 100 hours total', '🏆', 'study', 500, 'epic', '{"type": "total_hours", "value": 100}'::jsonb),
('Academic Legend', 'Study for 500 hours total', '👑', 'study', 2500, 'legendary', '{"type": "total_hours", "value": 500}'::jsonb),

-- Streak Achievements
('Getting Started', 'Login 3 days in a row', '🌟', 'streak', 15, 'common', '{"type": "login_streak", "value": 3}'::jsonb),
('On a Roll', 'Maintain a 7-day study streak', '🔥', 'streak', 75, 'rare', '{"type": "study_streak", "value": 7}'::jsonb),
('Consistency King', 'Maintain a 14-day study streak', '👑', 'streak', 150, 'rare', '{"type": "study_streak", "value": 14}'::jsonb),
('Unstoppable', 'Maintain a 30-day study streak', '⚡', 'streak', 300, 'epic', '{"type": "study_streak", "value": 30}'::jsonb),
('Legendary Streak', 'Maintain a 100-day study streak', '💎', 'streak', 1000, 'legendary', '{"type": "study_streak", "value": 100}'::jsonb),

-- Task Achievements
('Task Starter', 'Complete 5 tasks', '✓', 'productivity', 25, 'common', '{"type": "tasks_completed", "value": 5}'::jsonb),
('Task Master', 'Complete 25 tasks', '✅', 'productivity', 100, 'rare', '{"type": "tasks_completed", "value": 25}'::jsonb),
('Productivity Pro', 'Complete 100 tasks', '🎯', 'productivity', 400, 'epic', '{"type": "tasks_completed", "value": 100}'::jsonb),
('Goal Crusher', 'Complete 500 tasks', '💪', 'productivity', 2000, 'legendary', '{"type": "tasks_completed", "value": 500}'::jsonb),

-- Social Achievements
('Team Player', 'Join your first study room', '👥', 'social', 20, 'common', '{"type": "rooms_joined", "value": 1}'::jsonb),
('Community Builder', 'Create your first study room', '🏠', 'social', 30, 'common', '{"type": "rooms_created", "value": 1}'::jsonb),
('Social Butterfly', 'Join 10 different study rooms', '💖', 'social', 100, 'rare', '{"type": "rooms_joined", "value": 10}'::jsonb),
('Room Leader', 'Host 5 study rooms', '🎪', 'social', 150, 'rare', '{"type": "rooms_created", "value": 5}'::jsonb),

-- Focus Mode Achievements
('Pomodoro Novice', 'Complete 5 Pomodoro sessions', '🍅', 'focus', 25, 'common', '{"type": "pomodoro_completed", "value": 5}'::jsonb),
('Pomodoro Expert', 'Complete 50 Pomodoro sessions', '🍅', 'focus', 200, 'rare', '{"type": "pomodoro_completed", "value": 50}'::jsonb),
('Deep Work Master', 'Complete a 2-hour focus session', '🧠', 'focus', 100, 'epic', '{"type": "single_session_minutes", "value": 120}'::jsonb),
('Ultra Focus', 'Complete a 4-hour focus session', '🎯', 'focus', 250, 'legendary', '{"type": "single_session_minutes", "value": 240}'::jsonb),

-- Wellness Achievements
('Self Care Champion', 'Take breaks in 10 study sessions', '💆', 'wellness', 50, 'common', '{"type": "sessions_with_breaks", "value": 10}'::jsonb),
('Mindful Warrior', 'Write 10 journal entries', '📝', 'wellness', 100, 'rare', '{"type": "journal_entries", "value": 10}'::jsonb),
('Balance Master', 'Maintain study-break balance for 7 days', '⚖️', 'wellness', 150, 'rare', '{"type": "balanced_days", "value": 7}'::jsonb),
('Zen Master', 'Complete 50 meditation/break sessions', '🧘', 'wellness', 200, 'epic', '{"type": "break_sessions", "value": 50}'::jsonb),

-- Learning Achievements
('Quiz Whiz', 'Complete your first practice quiz', '❓', 'learning', 15, 'common', '{"type": "quizzes_completed", "value": 1}'::jsonb),
('Certification Seeker', 'Pass your first certification exam', '📜', 'learning', 100, 'rare', '{"type": "certifications_passed", "value": 1}'::jsonb),
('Flashcard Master', 'Review 100 flashcards', '🎴', 'learning', 75, 'common', '{"type": "flashcards_reviewed", "value": 100}'::jsonb),
('Course Completer', 'Complete your first course', '🎓', 'learning', 200, 'rare', '{"type": "courses_completed", "value": 1}'::jsonb),
('Lifelong Learner', 'Complete 5 courses', '📚', 'learning', 500, 'epic', '{"type": "courses_completed", "value": 5}'::jsonb)

ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$ 
DECLARE
  tracks_count INTEGER;
  sounds_count INTEGER;
  inspirations_count INTEGER;
  courses_count INTEGER;
  certs_count INTEGER;
  achievements_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tracks_count FROM tracks;
  SELECT COUNT(*) INTO sounds_count FROM ambient_sounds;
  SELECT COUNT(*) INTO inspirations_count FROM inspirations;
  SELECT COUNT(*) INTO courses_count FROM courses;
  SELECT COUNT(*) INTO certs_count FROM certifications;
  SELECT COUNT(*) INTO achievements_count FROM achievements;
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '  ✅ SEED DATA INSERTED SUCCESSFULLY';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Content Summary:';
  RAISE NOTICE '   🎵 Music Tracks: % rows', tracks_count;
  RAISE NOTICE '   🔊 Ambient Sounds: % rows', sounds_count;
  RAISE NOTICE '   💡 Inspirations: % rows', inspirations_count;
  RAISE NOTICE '   📚 Courses: % rows', courses_count;
  RAISE NOTICE '   📜 Certifications: % rows', certs_count;
  RAISE NOTICE '   🏆 Achievements: % rows', achievements_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ Your database now has sample content!';
  RAISE NOTICE '✅ Users can now browse courses, play music, and unlock achievements';
  RAISE NOTICE '✅ Ready to test your app!';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;
