import { supabase } from '../lib/supabase';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type: 'study' | 'exam' | 'assignment' | 'class' | 'break' | 'other';
  icon?: string; // From the icon set
  color_hex?: string;
  priority?: 'low' | 'medium' | 'high';
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CalendarEventInsert {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type: 'study' | 'exam' | 'assignment' | 'class' | 'break' | 'other';
  icon?: string;
  color_hex?: string;
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Get all calendar events for the current user
 */
export async function getCalendarEvents(
  startDate?: Date,
  endDate?: Date
): Promise<{ data: CalendarEvent[] | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Return empty array for non-authenticated users instead of error
      return { data: [], error: null };
    }

    let query = supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: true });

    // Filter by date range if provided
    if (startDate) {
      query = query.gte('start_time', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('start_time', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error fetching calendar events:', err);
    return { data: [], error: err };
  }
}

/**
 * Get events for a specific date
 */
export async function getEventsByDate(date: Date): Promise<{ data: CalendarEvent[] | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Return empty array for non-authenticated users instead of error
      return { data: [], error: null };
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
      .order('start_time', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error fetching events by date:', err);
    return { data: [], error: err };
  }
}

/**
 * Create a new calendar event
 */
export async function createCalendarEvent(
  eventData: CalendarEventInsert
): Promise<{ data: CalendarEvent | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Validate required fields
    if (!eventData.title || !eventData.start_time || !eventData.end_time) {
      throw new Error('Title, start time, and end time are required');
    }

    // Validate dates
    const startTime = new Date(eventData.start_time);
    const endTime = new Date(eventData.end_time);

    if (endTime <= startTime) {
      throw new Error('End time must be after start time');
    }

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: user.id,
        title: eventData.title,
        description: eventData.description,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        event_type: eventData.event_type,
        icon: eventData.icon,
        color_hex: eventData.color_hex,
        priority: eventData.priority || 'medium',
        is_completed: false,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error creating calendar event:', err);
    return { data: null, error: err };
  }
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  eventId: string,
  updates: Partial<CalendarEventInsert>
): Promise<{ data: CalendarEvent | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Validate dates if both are provided
    if (updates.start_time && updates.end_time) {
      const startTime = new Date(updates.start_time);
      const endTime = new Date(updates.end_time);

      if (endTime <= startTime) {
        throw new Error('End time must be after start time');
      }
    }

    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', eventId)
      .eq('user_id', user.id) // Ensure user can only update their own events
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error updating calendar event:', err);
    return { data: null, error: err };
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(eventId: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', user.id); // Ensure user can only delete their own events

    if (error) throw error;
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Error deleting calendar event:', err);
    return { success: false, error: err };
  }
}

/**
 * Toggle event completion status
 */
export async function toggleEventCompletion(
  eventId: string,
  completed: boolean
): Promise<{ data: CalendarEvent | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('calendar_events')
      .update({ is_completed: completed })
      .eq('id', eventId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error toggling event completion:', err);
    return { data: null, error: err };
  }
}

/**
 * Get upcoming events (next 7 days)
 */
export async function getUpcomingEvents(days = 7): Promise<{ data: CalendarEvent[] | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', now.toISOString())
      .lte('start_time', future.toISOString())
      .eq('is_completed', false)
      .order('start_time', { ascending: true })
      .limit(10);

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error fetching upcoming events:', err);
    return { data: null, error: err };
  }
}

/**
 * Get overdue events
 */
export async function getOverdueEvents(): Promise<{ data: CalendarEvent[] | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const now = new Date();

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .lt('end_time', now.toISOString())
      .eq('is_completed', false)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error fetching overdue events:', err);
    return { data: null, error: err };
  }
}
