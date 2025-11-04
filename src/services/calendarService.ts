import { supabase } from '../lib/supabase';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type: 'study' | 'exam' | 'assignment' | 'class' | 'break' | 'other';
  priority?: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface CalendarEventInsert {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type: 'study' | 'exam' | 'assignment' | 'class' | 'break' | 'other';
  priority?: 'low' | 'medium' | 'high';
}

// LocalStorage key for guest users
const GUEST_EVENTS_KEY = 'ezgrades_guest_calendar_events';

// Helper function to get guest events from localStorage
function getGuestEvents(): CalendarEvent[] {
  try {
    const stored = localStorage.getItem(GUEST_EVENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading guest events from localStorage:', error);
    return [];
  }
}

// Helper function to save guest events to localStorage
function saveGuestEvents(events: CalendarEvent[]): void {
  try {
    localStorage.setItem(GUEST_EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Error saving guest events to localStorage:', error);
  }
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
      // Guest user - use localStorage
      let events = getGuestEvents();
      
      // Filter by date range if provided
      if (startDate || endDate) {
        events = events.filter(event => {
          const eventStart = new Date(event.start_time);
          if (startDate && eventStart < startDate) return false;
          if (endDate && eventStart > endDate) return false;
          return true;
        });
      }
      
      // Sort by start time
      events.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      
      return { data: events, error: null };
    }

    // Authenticated user - use database
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
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    if (!user) {
      // Guest user - use localStorage
      const events = getGuestEvents().filter(event => {
        const eventStart = new Date(event.start_time);
        return eventStart >= startOfDay && eventStart <= endOfDay;
      }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      
      return { data: events, error: null };
    }

    // Authenticated user - use database
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

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Guest user - use localStorage
      const newEvent: CalendarEvent = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: 'guest',
        title: eventData.title,
        description: eventData.description,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        event_type: eventData.event_type,
        priority: eventData.priority || 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const events = getGuestEvents();
      events.push(newEvent);
      saveGuestEvents(events);
      
      return { data: newEvent, error: null };
    }

    // Authenticated user - use database
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: user.id,
        title: eventData.title,
        description: eventData.description,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        event_type: eventData.event_type,
        priority: eventData.priority || 'medium',
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
    // Validate dates if both are provided
    if (updates.start_time && updates.end_time) {
      const startTime = new Date(updates.start_time);
      const endTime = new Date(updates.end_time);

      if (endTime <= startTime) {
        throw new Error('End time must be after start time');
      }
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Guest user - use localStorage
      const events = getGuestEvents();
      const eventIndex = events.findIndex(e => e.id === eventId);
      
      if (eventIndex === -1) {
        throw new Error('Event not found');
      }
      
      const updatedEvent: CalendarEvent = {
        ...events[eventIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      events[eventIndex] = updatedEvent;
      saveGuestEvents(events);
      
      return { data: updatedEvent, error: null };
    }

    // Authenticated user - use database
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
    
    if (!user) {
      // Guest user - use localStorage
      const events = getGuestEvents();
      const filteredEvents = events.filter(e => e.id !== eventId);
      
      if (events.length === filteredEvents.length) {
        throw new Error('Event not found');
      }
      
      saveGuestEvents(filteredEvents);
      return { success: true, error: null };
    }

    // Authenticated user - use database
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
 * NOTE: The calendar_events table doesn't have an is_completed column
 * This function is disabled until the column is added to the schema
 */
export async function toggleEventCompletion(
  eventId: string,
  completed: boolean
): Promise<{ data: CalendarEvent | null; error: Error | null }> {
  console.warn('toggleEventCompletion is disabled - is_completed column does not exist in calendar_events table');
  return { data: null, error: new Error('Feature not available - database column missing') };
}

/**
 * Get upcoming events (next 7 days)
 */
export async function getUpcomingEvents(days = 7): Promise<{ data: CalendarEvent[] | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);
    
    if (!user) {
      // Guest user - use localStorage
      const events = getGuestEvents()
        .filter(event => {
          const eventStart = new Date(event.start_time);
          return eventStart >= now && eventStart <= future;
        })
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        .slice(0, 10);
      
      return { data: events, error: null };
    }

    // Authenticated user - use database
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', now.toISOString())
      .lte('start_time', future.toISOString())
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
    
    const now = new Date();
    
    if (!user) {
      // Guest user - use localStorage
      const events = getGuestEvents()
        .filter(event => new Date(event.end_time) < now)
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
      
      return { data: events, error: null };
    }

    // Authenticated user - use database
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .lt('end_time', now.toISOString())
      .order('start_time', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error fetching overdue events:', err);
    return { data: null, error: err };
  }
}
