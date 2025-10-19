import { supabase } from '../lib/supabase';

export interface Journal {
  id: string;
  user_id: string;
  title: string;
  content_text?: string;
  canvas_data?: CanvasData;
  mood?: 'happy' | 'sad' | 'neutral' | 'excited' | 'anxious' | 'calm' | 'stressed' | 'grateful';
  tags?: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CanvasData {
  stickers: StickerInstance[];
  background_color?: string;
  font_family?: string;
  font_size?: number;
}

export interface StickerInstance {
  id: string; // Instance ID
  sticker_id: string; // Reference to sticker template
  x: number;
  y: number;
  scale: number;
  rotation: number; // In degrees
  z_index: number;
}

export interface Sticker {
  id: string;
  name: string;
  display_name: string;
  svg_data?: string;
  image_url?: string;
  category: 'general' | 'emotions' | 'nature' | 'school' | 'decorative' | 'seasonal';
  tags?: string[];
  is_premium: boolean;
  is_active: boolean;
  created_at: string;
}

/**
 * Get all journals for current user
 */
export async function getJournals(limit = 50): Promise<{ data: Journal[] | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('journals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error fetching journals:', err);
    return { data: null, error: err };
  }
}

/**
 * Get a specific journal by ID
 */
export async function getJournal(journalId: string): Promise<{ data: Journal | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('journals')
      .select('*')
      .eq('id', journalId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error fetching journal:', err);
    return { data: null, error: err };
  }
}

/**
 * Create a new journal entry
 */
export async function createJournal(journal: Omit<Journal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: Journal | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('journals')
      .insert({
        user_id: user.id,
        title: journal.title,
        content_text: journal.content_text,
        canvas_data: journal.canvas_data,
        mood: journal.mood,
        tags: journal.tags,
        is_favorite: journal.is_favorite || false,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error creating journal:', err);
    return { data: null, error: err };
  }
}

/**
 * Update an existing journal
 */
export async function updateJournal(
  journalId: string,
  updates: Partial<Omit<Journal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Journal | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('journals')
      .update(updates)
      .eq('id', journalId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error updating journal:', err);
    return { data: null, error: err };
  }
}

/**
 * Delete a journal
 */
export async function deleteJournal(journalId: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('journals')
      .delete()
      .eq('id', journalId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Error deleting journal:', err);
    return { success: false, error: err };
  }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(journalId: string, isFavorite: boolean): Promise<{ success: boolean; error: Error | null }> {
  try {
    const result = await updateJournal(journalId, { is_favorite: isFavorite });
    return { success: !result.error, error: result.error };
  } catch (err: any) {
    console.error('Error toggling favorite:', err);
    return { success: false, error: err };
  }
}

/**
 * Get all available stickers
 */
export async function getStickers(category?: string): Promise<{ data: Sticker[] | null; error: Error | null }> {
  try {
    let query = supabase
      .from('stickers')
      .select('*')
      .eq('is_active', true)
      .order('display_name', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error fetching stickers:', err);
    return { data: null, error: err };
  }
}

/**
 * Export journal as data (for PDF/PNG generation on client side)
 */
export async function exportJournalData(journalId: string): Promise<{ data: Journal | null; error: Error | null }> {
  return getJournal(journalId);
}

/**
 * Autosave journal (debounced on client)
 */
export async function autosaveJournal(
  journalId: string | null,
  content: Partial<Omit<Journal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Journal | null; error: Error | null }> {
  try {
    if (journalId) {
      // Update existing
      return await updateJournal(journalId, content);
    } else {
      // Create new with default title
      return await createJournal({
        title: content.title || `Journal Entry - ${new Date().toLocaleDateString()}`,
        content_text: content.content_text,
        canvas_data: content.canvas_data,
        mood: content.mood,
        tags: content.tags,
        is_favorite: false,
      });
    }
  } catch (err: any) {
    console.error('Error autosaving journal:', err);
    return { data: null, error: err };
  }
}
