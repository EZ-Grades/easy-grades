-- ============================================================================
-- SEED AMBIENT SOUNDS DATA
-- ============================================================================
-- This adds ambient sound entries to the database
-- Note: URLs are placeholder - you'll need to replace with actual audio files
-- ============================================================================

-- Insert ambient sounds (gracefully handles if they already exist)
INSERT INTO ambient_sounds (name, url, icon, category, volume_default, is_premium, is_active)
VALUES
  -- Nature Sounds
  (
    'Rain Sounds',
    'https://assets.mixkit.co/active_storage/sfx/2390/2390-preview.mp3',
    '🌧️',
    'nature',
    0.5,
    false,
    true
  ),
  (
    'Ocean Waves',
    'https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3',
    '🌊',
    'nature',
    0.5,
    false,
    true
  ),
  (
    'Forest Ambience',
    'https://assets.mixkit.co/active_storage/sfx/2462/2462-preview.mp3',
    '🌲',
    'nature',
    0.5,
    false,
    true
  ),
  (
    'Thunder Storm',
    'https://assets.mixkit.co/active_storage/sfx/2398/2398-preview.mp3',
    '⛈️',
    'nature',
    0.5,
    false,
    true
  ),
  (
    'Birds Chirping',
    'https://assets.mixkit.co/active_storage/sfx/2454/2454-preview.mp3',
    '🐦',
    'nature',
    0.5,
    false,
    true
  ),
  
  -- Cozy/Indoor Sounds
  (
    'Fireplace',
    'https://assets.mixkit.co/active_storage/sfx/2389/2389-preview.mp3',
    '🔥',
    'cozy',
    0.5,
    false,
    true
  ),
  (
    'Coffee Shop',
    'https://assets.mixkit.co/active_storage/sfx/2399/2399-preview.mp3',
    '☕',
    'social',
    0.5,
    false,
    true
  ),
  
  -- Focus Sounds
  (
    'White Noise',
    'https://assets.mixkit.co/active_storage/sfx/2410/2410-preview.mp3',
    '🎵',
    'focus',
    0.5,
    false,
    true
  ),
  (
    'Brown Noise',
    'https://assets.mixkit.co/active_storage/sfx/2411/2411-preview.mp3',
    '🔊',
    'focus',
    0.5,
    false,
    true
  ),
  (
    'Pink Noise',
    'https://assets.mixkit.co/active_storage/sfx/2412/2412-preview.mp3',
    '📻',
    'focus',
    0.5,
    false,
    true
  ),
  
  -- Urban/City Sounds
  (
    'City Traffic',
    'https://assets.mixkit.co/active_storage/sfx/2400/2400-preview.mp3',
    '🚗',
    'urban',
    0.5,
    false,
    true
  ),
  (
    'Train Sounds',
    'https://assets.mixkit.co/active_storage/sfx/2401/2401-preview.mp3',
    '🚂',
    'travel',
    0.5,
    false,
    true
  ),
  
  -- Special/Premium
  (
    'Meditation Bell',
    'https://assets.mixkit.co/active_storage/sfx/2413/2413-preview.mp3',
    '🔔',
    'meditation',
    0.5,
    true,
    true
  ),
  (
    'Zen Garden',
    'https://assets.mixkit.co/active_storage/sfx/2414/2414-preview.mp3',
    '🧘',
    'meditation',
    0.5,
    true,
    true
  ),
  (
    'Space Ambience',
    'https://assets.mixkit.co/active_storage/sfx/2415/2415-preview.mp3',
    '🌌',
    'ambient',
    0.5,
    true,
    true
  )
ON CONFLICT (name) DO UPDATE SET
  url = EXCLUDED.url,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active;

-- Verify insertion
DO $$
DECLARE
  sound_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO sound_count FROM ambient_sounds;
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '  ✅ AMBIENT SOUNDS SEEDED';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '🎵 Total ambient sounds: %', sound_count;
  RAISE NOTICE '';
  RAISE NOTICE '📝 Note: These use placeholder URLs from Mixkit';
  RAISE NOTICE '   For production, replace with your own audio files';
  RAISE NOTICE '   or license from royalty-free music providers';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Sounds added:';
  RAISE NOTICE '   • Rain Sounds 🌧️';
  RAISE NOTICE '   • Ocean Waves 🌊';
  RAISE NOTICE '   • Forest Ambience 🌲';
  RAISE NOTICE '   • Fireplace 🔥';
  RAISE NOTICE '   • Coffee Shop ☕';
  RAISE NOTICE '   • White Noise 🎵';
  RAISE NOTICE '   • And 9 more...';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;
