import { supabase } from '../lib/supabase';

export interface Inspiration {
  id: string;
  text: string;
  author?: string;
  date_published?: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Get the daily inspiration (changes every 24 hours based on UTC date)
 * Uses a deterministic function on the server side, or fallback if unavailable
 */
export async function getDailyInspiration(): Promise<{ data: Inspiration | null; error: Error | null }> {
  try {
    // Try to use the RPC function if it exists
    const { data, error } = await supabase.rpc('get_daily_inspiration');

    if (error) {
      // If RPC function doesn't exist, use fallback
      if (error.code === 'PGRST202' || error.message?.includes('Could not find the function')) {
        console.log('Daily inspiration RPC not available, using fallback quotes');
        return { data: getRandomFallbackInspiration(), error: null };
      }
      throw error;
    }
    
    // The RPC returns an array with one item
    const inspiration = data && data.length > 0 ? data[0] : null;
    
    return { data: inspiration || getRandomFallbackInspiration(), error: null };
  } catch (err: any) {
    console.error('Error fetching daily inspiration:', err);
    
    // Return fallback inspiration if anything fails
    return { data: getRandomFallbackInspiration(), error: null };
  }
}

/**
 * Get a random fallback inspiration from a curated list
 */
function getRandomFallbackInspiration(): Inspiration {
  const fallbackQuotes: Omit<Inspiration, 'id' | 'created_at'>[] = [
    {
      text: 'The secret of getting ahead is getting started.',
      author: 'Mark Twain',
      is_active: true,
    },
    {
      text: 'Education is the most powerful weapon which you can use to change the world.',
      author: 'Nelson Mandela',
      is_active: true,
    },
    {
      text: 'The expert in anything was once a beginner.',
      author: 'Helen Hayes',
      is_active: true,
    },
    {
      text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
      author: 'Winston Churchill',
      is_active: true,
    },
    {
      text: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
      is_active: true,
    },
    {
      text: 'Believe you can and you\'re halfway there.',
      author: 'Theodore Roosevelt',
      is_active: true,
    },
    {
      text: 'Learning never exhausts the mind.',
      author: 'Leonardo da Vinci',
      is_active: true,
    },
    {
      text: 'The beautiful thing about learning is that no one can take it away from you.',
      author: 'B.B. King',
      is_active: true,
    },
    {
      text: 'Don\'t watch the clock; do what it does. Keep going.',
      author: 'Sam Levenson',
      is_active: true,
    },
    {
      text: 'The future belongs to those who believe in the beauty of their dreams.',
      author: 'Eleanor Roosevelt',
      is_active: true,
    },
  ];
  
  // Use date-based selection for consistency (same quote per day)
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % fallbackQuotes.length;
  const selected = fallbackQuotes[index];
  
  return {
    id: `fallback-${dayOfYear}`,
    ...selected,
    created_at: new Date().toISOString(),
  };
}

/**
 * Get all inspirations (for admin/content management)
 */
export async function getAllInspirations(): Promise<{ data: Inspiration[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('inspirations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error fetching inspirations:', err);
    return { data: null, error: err };
  }
}

/**
 * Get inspirations by category
 */
export async function getInspirationsByCategory(category: string): Promise<{ data: Inspiration[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('inspirations')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error fetching inspirations by category:', err);
    return { data: null, error: err };
  }
}

/**
 * Add a new inspiration (admin function)
 */
export async function addInspiration(inspiration: Omit<Inspiration, 'id' | 'created_at'>): Promise<{ data: Inspiration | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('inspirations')
      .insert({
        text: inspiration.text,
        author: inspiration.author,
        category: inspiration.category,
        date_published: inspiration.date_published,
        is_active: inspiration.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error adding inspiration:', err);
    return { data: null, error: err };
  }
}

/**
 * Client-side caching for daily inspiration
 * Only fetches new inspiration if the date has changed
 */
export function getCachedDailyInspiration(): Inspiration | null {
  try {
    const cached = localStorage.getItem('daily_inspiration');
    const cacheDate = localStorage.getItem('daily_inspiration_date');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    if (cached && cacheDate === today) {
      return JSON.parse(cached);
    }

    return null;
  } catch (err) {
    console.error('Error reading cached inspiration:', err);
    return null;
  }
}

/**
 * Save daily inspiration to cache
 */
export function cacheDailyInspiration(inspiration: Inspiration): void {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    localStorage.setItem('daily_inspiration', JSON.stringify(inspiration));
    localStorage.setItem('daily_inspiration_date', today);
  } catch (err) {
    console.error('Error caching inspiration:', err);
  }
}

/**
 * Get daily inspiration with caching
 */
export async function getDailyInspirationWithCache(): Promise<{ data: Inspiration | null; error: Error | null }> {
  // Check cache first
  const cached = getCachedDailyInspiration();
  if (cached) {
    return { data: cached, error: null };
  }

  // Fetch new inspiration
  const result = await getDailyInspiration();
  
  // Cache if successful
  if (result.data && !result.error) {
    cacheDailyInspiration(result.data);
  }

  return result;
}
