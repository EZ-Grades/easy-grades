-- =====================================================
-- SEED MUSIC TRACKS (DEMO)
-- =====================================================
-- This file adds demo music tracks to the tracks table
-- NOTE: These use placeholder URLs. Replace with real URLs
-- from Supabase Storage or external sources.
-- =====================================================

-- Insert demo music tracks
INSERT INTO tracks (title, artist, album, url, duration, track_type, mood, genre, is_active) VALUES
  -- Lo-fi / Study Music
  ('Peaceful Study Session', 'Study Beats', 'Focus Zone', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 360, 'music', 'calm', 'lofi', true),
  ('Morning Coffee', 'Chill Vibes', 'Daily Routine', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 320, 'music', 'relaxed', 'lofi', true),
  ('Focus Flow', 'Study Masters', 'Deep Work', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 280, 'music', 'focused', 'lofi', true),
  
  -- Classical
  ('Piano Concerto', 'Classical Ensemble', 'Timeless', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 400, 'music', 'calm', 'classical', true),
  ('Violin Serenade', 'Orchestra Dreams', 'Harmony', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 350, 'music', 'peaceful', 'classical', true),
  
  -- Ambient / Electronic
  ('Digital Dreams', 'Synth Wave', 'Future Sound', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 300, 'music', 'energetic', 'electronic', true),
  ('Midnight Code', 'Ambient Beats', 'Late Night', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 340, 'music', 'focused', 'electronic', true),
  
  -- Jazz
  ('Smooth Study', 'Jazz Cats', 'Groove Time', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 290, 'music', 'relaxed', 'jazz', true)

ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================
-- 1. These URLs are DEMO PLACEHOLDERS using SoundHelix
--    which provides free demo music files.
--
-- 2. For PRODUCTION, you should:
--    a) Upload music files to Supabase Storage bucket 'music'
--    b) Get the public URLs using:
--       SELECT url FROM storage.objects WHERE bucket_id = 'music';
--    c) Update the URLs in this file
--
-- 3. To upload to Supabase Storage:
--    - Go to Storage in Supabase Dashboard
--    - Create 'music' bucket (if not exists)
--    - Upload your .mp3 files
--    - Make bucket public or use signed URLs
--
-- 4. Alternative: Use external music services with API
--    (requires proper licensing)
--
-- =====================================================

-- Verify tracks were inserted
SELECT 
  id, 
  title, 
  artist, 
  track_type,
  is_active,
  CASE 
    WHEN url IS NULL OR url = '' THEN '⚠️ MISSING URL'
    ELSE '✓ Has URL'
  END as url_status
FROM tracks 
WHERE track_type = 'music'
ORDER BY created_at DESC;
