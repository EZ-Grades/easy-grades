import { supabase } from '../lib/supabase';

export interface Track {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  url: string;
  duration?: number;
  cover_url?: string;
  track_type: 'music' | 'ambient';
  mood?: string;
  genre?: string;
  is_active: boolean;
  created_at: string;
}

export interface PlaybackState {
  id: string;
  user_id: string;
  track_id: string;
  current_position: number;
  is_playing: boolean;
  volume: number;
  playback_mode: 'normal' | 'loop' | 'shuffle';
  updated_at: string;
}

/**
 * Get all music tracks from database
 */
export async function getMusicTracks(limit = 50): Promise<{ data: Track[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('track_type', 'music')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    // Map data to ensure title field exists (fallback to name if needed)
    const tracks = data?.map(track => ({
      ...track,
      title: track.title || (track as any).name || 'Untitled Track'
    }));
    
    return { data: tracks, error: null };
  } catch (err: any) {
    console.error('Error fetching music tracks:', err);
    return { data: null, error: err };
  }
}

/**
 * Get a specific track by ID
 */
export async function getTrack(trackId: string): Promise<{ data: Track | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', trackId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error fetching track:', err);
    return { data: null, error: err };
  }
}

/**
 * Get user's playback state for a track
 * Silent fail for guest users - returns null without logging error
 */
export async function getPlaybackState(trackId: string): Promise<{ data: PlaybackState | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Return error without logging - this is expected for guest users
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('user_playback_state')
      .select('*')
      .eq('user_id', user.id)
      .eq('track_id', trackId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found" - that's okay
    return { data, error: null };
  } catch (err: any) {
    // Only log unexpected errors, not authentication errors
    if (!err.message?.includes('Not authenticated')) {
      console.error('Error fetching playback state:', err);
    }
    return { data: null, error: err };
  }
}

/**
 * Update or create playback state
 * Silent fail for guest users - returns null without logging error
 */
export async function updatePlaybackState(
  trackId: string,
  updates: Partial<Pick<PlaybackState, 'current_position' | 'is_playing' | 'volume' | 'playback_mode'>>
): Promise<{ data: PlaybackState | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Return error without logging - this is expected for guest users
      return { data: null, error: new Error('Not authenticated') };
    }

    // Try to update existing state
    const { data: existing } = await getPlaybackState(trackId);

    if (existing) {
      const { data, error } = await supabase
        .from('user_playback_state')
        .update(updates)
        .eq('user_id', user.id)
        .eq('track_id', trackId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } else {
      // Create new state
      const { data, error } = await supabase
        .from('user_playback_state')
        .insert({
          user_id: user.id,
          track_id: trackId,
          current_position: updates.current_position || 0,
          is_playing: updates.is_playing || false,
          volume: updates.volume || 70,
          playback_mode: updates.playback_mode || 'normal',
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    }
  } catch (err: any) {
    // Only log unexpected errors, not authentication errors
    if (!err.message?.includes('Not authenticated')) {
      console.error('Error updating playback state:', err);
    }
    return { data: null, error: err };
  }
}

/**
 * Upload a track file to Supabase Storage
 * This is for admin/content management
 */
export async function uploadTrack(file: File, metadata: Partial<Track>): Promise<{ data: Track | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Upload file to storage
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('music')
      .upload(`tracks/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('music')
      .getPublicUrl(uploadData.path);

    // Create track record
    const { data, error } = await supabase
      .from('tracks')
      .insert({
        title: metadata.title || file.name,
        artist: metadata.artist,
        album: metadata.album,
        url: publicUrl,
        duration: metadata.duration,
        cover_url: metadata.cover_url,
        track_type: metadata.track_type || 'music',
        mood: metadata.mood,
        genre: metadata.genre,
        file_size: file.size,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error uploading track:', err);
    return { data: null, error: err };
  }
}

/**
 * Get all playback states for current user
 */
export async function getAllPlaybackStates(): Promise<{ data: PlaybackState[] | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_playback_state')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error fetching playback states:', err);
    return { data: null, error: err };
  }
}
