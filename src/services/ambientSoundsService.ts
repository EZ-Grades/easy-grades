import { supabase } from '../lib/supabase';

// ==========================================
// TYPES
// ==========================================

export interface AmbientSound {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  audio_url: string;
  icon?: string;
  category: string;
  default_volume: number;
  is_active: boolean;
  created_at: string;
}

export interface UserAmbientPreference {
  id: string;
  user_id: string;
  ambient_sound_id: string;
  volume: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// ==========================================
// AMBIENT SOUNDS
// ==========================================

/**
 * Get all available ambient sounds
 */
export async function getAmbientSounds(): Promise<{
  data: AmbientSound[] | null;
  error: Error | null;
}> {
  try {
    // Try to fetch from database
    const { data, error } = await supabase
      .from('ambient_sounds')
      .select('*')
      .eq('is_active', true)
      .order('display_name');

    if (error) {
      console.log('Database not available, using mock data:', error.message);
      return { data: getMockAmbientSounds(), error: null };
    }

    return { data, error: null };
  } catch (err: any) {
    console.log('Error fetching ambient sounds, using mock data:', err);
    return { data: getMockAmbientSounds(), error: null };
  }
}

/**
 * Mock ambient sounds for when database is unavailable
 */
function getMockAmbientSounds(): AmbientSound[] {
  return [
    {
      id: 'rain',
      name: 'rain',
      display_name: 'Rain Sounds',
      description: 'Gentle rain for deep focus',
      audio_url: 'https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3',
      icon: '🌧️',
      category: 'nature',
      default_volume: 50,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'ocean',
      name: 'ocean',
      display_name: 'Ocean Waves',
      description: 'Calming ocean waves',
      audio_url: 'https://assets.mixkit.co/active_storage/sfx/2390/2390-preview.mp3',
      icon: '🌊',
      category: 'nature',
      default_volume: 50,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'forest',
      name: 'forest',
      display_name: 'Forest Ambience',
      description: 'Peaceful forest sounds',
      audio_url: 'https://assets.mixkit.co/active_storage/sfx/2392/2392-preview.mp3',
      icon: '🌲',
      category: 'nature',
      default_volume: 50,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'fireplace',
      name: 'fireplace',
      display_name: 'Fireplace',
      description: 'Cozy fireplace crackling',
      audio_url: 'https://assets.mixkit.co/active_storage/sfx/2391/2391-preview.mp3',
      icon: '🔥',
      category: 'indoor',
      default_volume: 50,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'cafe',
      name: 'cafe',
      display_name: 'Coffee Shop',
      description: 'Ambient cafe chatter',
      audio_url: 'https://assets.mixkit.co/active_storage/sfx/2394/2394-preview.mp3',
      icon: '☕',
      category: 'urban',
      default_volume: 40,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'whitenoise',
      name: 'whitenoise',
      display_name: 'White Noise',
      description: 'Pure white noise',
      audio_url: 'https://assets.mixkit.co/active_storage/sfx/2395/2395-preview.mp3',
      icon: '📻',
      category: 'artificial',
      default_volume: 30,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];
}

// ==========================================
// USER PREFERENCES
// ==========================================

/**
 * Get user's ambient sound preferences
 */
export async function getUserAmbientPreferences(): Promise<{
  data: UserAmbientPreference[] | null;
  error: Error | null;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // For guest users, try to load from localStorage
      const localPrefs = loadLocalPreferences();
      return { data: localPrefs, error: null };
    }

    const { data, error } = await supabase
      .from('user_ambient_preferences')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.log('Database not available, using local storage:', error.message);
      const localPrefs = loadLocalPreferences();
      return { data: localPrefs, error: null };
    }

    return { data, error: null };
  } catch (err: any) {
    console.log('Error fetching preferences, using local storage:', err);
    const localPrefs = loadLocalPreferences();
    return { data: localPrefs, error: null };
  }
}

/**
 * Update user's ambient sound preference
 */
export async function updateAmbientPreference(
  soundId: string,
  updates: Partial<UserAmbientPreference>
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // For guest users, save to localStorage
      saveLocalPreference(soundId, updates);
      return { success: true, error: null };
    }

    // Check if preference exists
    const { data: existing } = await supabase
      .from('user_ambient_preferences')
      .select('*')
      .eq('user_id', user.id)
      .eq('ambient_sound_id', soundId)
      .single();

    if (existing) {
      // Update existing preference
      const { error } = await supabase
        .from('user_ambient_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .eq('ambient_sound_id', soundId);

      if (error) throw error;
    } else {
      // Create new preference
      const { error } = await supabase
        .from('user_ambient_preferences')
        .insert({
          user_id: user.id,
          ambient_sound_id: soundId,
          volume: updates.volume || 50,
          is_enabled: updates.is_enabled || false,
        });

      if (error) throw error;
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.log('Error updating preference, using local storage:', err);
    saveLocalPreference(soundId, updates);
    return { success: true, error: null };
  }
}

/**
 * Disable all ambient sounds
 */
export async function disableAllAmbientSounds(): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // For guest users, update localStorage
      clearLocalPreferences();
      return { success: true, error: null };
    }

    const { error } = await supabase
      .from('user_ambient_preferences')
      .update({ is_enabled: false })
      .eq('user_id', user.id);

    if (error) {
      console.log('Database not available, using local storage:', error.message);
      clearLocalPreferences();
      return { success: true, error: null };
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.log('Error disabling sounds, using local storage:', err);
    clearLocalPreferences();
    return { success: true, error: null };
  }
}

// ==========================================
// LOCAL STORAGE HELPERS (for guest users)
// ==========================================

const STORAGE_KEY = 'ambient_sound_preferences';

function loadLocalPreferences(): UserAmbientPreference[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const prefs = JSON.parse(stored);
    return Object.entries(prefs).map(([soundId, pref]: [string, any]) => ({
      id: soundId,
      user_id: 'guest',
      ambient_sound_id: soundId,
      volume: pref.volume || 50,
      is_enabled: pref.is_enabled || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Error loading local preferences:', err);
    return [];
  }
}

function saveLocalPreference(soundId: string, updates: Partial<UserAmbientPreference>) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefs = stored ? JSON.parse(stored) : {};
    
    prefs[soundId] = {
      ...(prefs[soundId] || {}),
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error('Error saving local preference:', err);
  }
}

function clearLocalPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const prefs = JSON.parse(stored);
    Object.keys(prefs).forEach(key => {
      prefs[key].is_enabled = false;
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error('Error clearing local preferences:', err);
  }
}
