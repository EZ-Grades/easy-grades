import { supabase } from '../lib/supabase';

// ==========================================
// TYPES
// ==========================================

export interface StudyRoom {
  id: string;
  name: string;
  description?: string;
  room_code: string;
  host_user_id: string;
  max_participants: number;
  is_public: boolean;
  password_hash?: string;
  theme: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  host?: {
    id: string;
    full_name?: string;
    email: string;
    username?: string;
  };
  participant_count?: number;
}

export interface RoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  left_at?: string;
  is_online: boolean;
  status: 'studying' | 'break' | 'away';
  study_time_minutes: number;
  // Joined data
  user?: {
    id: string;
    full_name?: string;
    email: string;
    username?: string;
    avatar_url?: string;
  };
}

export interface RoomSession {
  id: string;
  room_id: string;
  session_type: 'pomodoro' | 'focus' | 'break';
  duration_seconds: number;
  started_by: string;
  started_at: string;
  ended_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  message: string;
  message_type: 'message' | 'system' | 'reaction';
  created_at: string;
  // Joined data
  user?: {
    full_name?: string;
    username?: string;
  };
}

export interface PlaylistTrack {
  id: string;
  playlist_id: string;
  title: string;
  artist: string;
  duration: string;
  source_url?: string;
  order_index: number;
  created_at: string;
}

export interface CanvasSession {
  id: string;
  room_id: string;
  canvas_data?: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// ROOM MANAGEMENT
// ==========================================

/**
 * Generate a unique 6-character room code
 */
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new study room
 */
export async function createRoom(params: {
  name: string;
  description?: string;
  isPublic: boolean;
  password?: string;
  theme?: string;
}): Promise<{ data: StudyRoom | null; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const roomCode = generateRoomCode();

    const { data, error } = await supabase
      .from('study_rooms')
      .insert({
        name: params.name,
        description: params.description,
        room_code: roomCode,
        host_user_id: user.id,
        is_public: params.isPublic,
        password_hash: params.password, // TODO: Hash the password in production
        theme: params.theme || 'forest',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      return { data: null, error };
    }

    // Auto-join the creator as a participant
    await joinRoom({ roomId: data.id });

    return { data, error: null };
  } catch (err) {
    console.error('Error in createRoom:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Get public rooms or rooms the user is in
 */
export async function getRooms(options: {
  publicOnly?: boolean;
  limit?: number;
}): Promise<{ data: StudyRoom[] | null; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase
      .from('study_rooms')
      .select(
        `
        *,
        host:profiles!study_rooms_host_user_id_fkey(id, full_name, email, username)
      `
      )
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (options.publicOnly) {
      query = query.eq('is_public', true);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching rooms:', error);
      return { data: null, error };
    }

    // Get participant counts for each room
    const roomsWithCounts = await Promise.all(
      (data || []).map(async (room) => {
        const { count } = await supabase
          .from('room_participants')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', room.id)
          .is('left_at', null);

        return {
          ...room,
          participant_count: count || 0,
        };
      })
    );

    return { data: roomsWithCounts, error: null };
  } catch (err) {
    console.error('Error in getRooms:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Get a specific room by ID
 */
export async function getRoom(
  roomId: string
): Promise<{ data: StudyRoom | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('study_rooms')
      .select(
        `
        *,
        host:profiles!study_rooms_host_user_id_fkey(id, full_name, email, username)
      `
      )
      .eq('id', roomId)
      .single();

    if (error) {
      console.error('Error fetching room:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in getRoom:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Get room by room code
 */
export async function getRoomByCode(
  roomCode: string
): Promise<{ data: StudyRoom | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('study_rooms')
      .select(
        `
        *,
        host:profiles!study_rooms_host_user_id_fkey(id, full_name, email, username)
      `
      )
      .eq('room_code', roomCode.toUpperCase())
      .single();

    if (error) {
      console.error('Error fetching room by code:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in getRoomByCode:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Update room settings (host only)
 */
export async function updateRoom(
  roomId: string,
  updates: Partial<StudyRoom>
): Promise<{ data: StudyRoom | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('study_rooms')
      .update(updates)
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      console.error('Error updating room:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in updateRoom:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Delete a room (host only)
 */
export async function deleteRoom(
  roomId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('study_rooms')
      .delete()
      .eq('id', roomId);

    if (error) {
      console.error('Error deleting room:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in deleteRoom:', err);
    return { success: false, error: err as Error };
  }
}

// ==========================================
// PARTICIPANT MANAGEMENT
// ==========================================

/**
 * Join a room
 */
export async function joinRoom(params: {
  roomId?: string;
  roomCode?: string;
}): Promise<{ data: RoomParticipant | null; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    let roomId = params.roomId;

    // If room code is provided, find the room
    if (params.roomCode && !roomId) {
      const { data: room, error: roomError } = await getRoomByCode(
        params.roomCode
      );
      if (roomError || !room) {
        return { data: null, error: roomError || new Error('Room not found') };
      }
      roomId = room.id;
    }

    if (!roomId) {
      return { data: null, error: new Error('Room ID or code required') };
    }

    // Check if already a participant
    const { data: existing } = await supabase
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .is('left_at', null)
      .single();

    if (existing) {
      return { data: existing, error: null };
    }

    // Join the room
    const { data, error } = await supabase
      .from('room_participants')
      .insert({
        room_id: roomId,
        user_id: user.id,
        is_online: true,
        status: 'studying',
        study_time_minutes: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error joining room:', error);
      return { data: null, error };
    }

    // Send system message
    await sendChatMessage(roomId, 'joined the room', 'system');

    return { data, error: null };
  } catch (err) {
    console.error('Error in joinRoom:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Leave a room
 */
export async function leaveRoom(
  roomId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('room_participants')
      .update({
        left_at: new Date().toISOString(),
        is_online: false,
      })
      .eq('room_id', roomId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error leaving room:', error);
      return { success: false, error };
    }

    // Send system message
    await sendChatMessage(roomId, 'left the room', 'system');

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in leaveRoom:', err);
    return { success: false, error: err as Error };
  }
}

/**
 * Get participants in a room
 */
export async function getRoomParticipants(
  roomId: string
): Promise<{ data: RoomParticipant[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('room_participants')
      .select(
        `
        *,
        user:profiles!room_participants_user_id_fkey(id, full_name, email, username, avatar_url)
      `
      )
      .eq('room_id', roomId)
      .is('left_at', null)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Error fetching participants:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in getRoomParticipants:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Update participant status
 */
export async function updateParticipantStatus(
  roomId: string,
  status: 'studying' | 'break' | 'away'
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('room_participants')
      .update({ status })
      .eq('room_id', roomId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating participant status:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in updateParticipantStatus:', err);
    return { success: false, error: err as Error };
  }
}

// ==========================================
// SESSION CONTROL
// ==========================================

/**
 * Start a new session (host only)
 */
export async function startSession(params: {
  roomId: string;
  type: 'pomodoro' | 'focus' | 'break';
  durationMinutes: number;
}): Promise<{ data: RoomSession | null; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    // End any active sessions first
    await supabase
      .from('room_sessions')
      .update({ is_active: false, ended_at: new Date().toISOString() })
      .eq('room_id', params.roomId)
      .eq('is_active', true);

    // Create new session
    const { data, error } = await supabase
      .from('room_sessions')
      .insert({
        room_id: params.roomId,
        session_type: params.type,
        duration_seconds: params.durationMinutes * 60,
        started_by: user.id,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting session:', error);
      return { data: null, error };
    }

    // Send system message
    await sendChatMessage(
      params.roomId,
      `${params.type} session (${params.durationMinutes}min) started`,
      'system'
    );

    return { data, error: null };
  } catch (err) {
    console.error('Error in startSession:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Stop the active session
 */
export async function stopSession(
  roomId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('room_sessions')
      .update({ is_active: false, ended_at: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('is_active', true);

    if (error) {
      console.error('Error stopping session:', error);
      return { success: false, error };
    }

    // Send system message
    await sendChatMessage(roomId, 'Session stopped', 'system');

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in stopSession:', err);
    return { success: false, error: err as Error };
  }
}

/**
 * Get the current active session
 */
export async function getActiveSession(
  roomId: string
): Promise<{ data: RoomSession | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('room_sessions')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_active', true)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching active session:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in getActiveSession:', err);
    return { data: null, error: err as Error };
  }
}

// ==========================================
// CHAT & REACTIONS
// ==========================================

/**
 * Send a chat message
 */
export async function sendChatMessage(
  roomId: string,
  message: string,
  type: 'message' | 'system' | 'reaction' = 'message'
): Promise<{ data: ChatMessage | null; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('room_chat_messages')
      .insert({
        room_id: roomId,
        user_id: user.id,
        message,
        message_type: type,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in sendChatMessage:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Get chat messages for a room
 */
export async function getChatMessages(
  roomId: string,
  limit = 50
): Promise<{ data: ChatMessage[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('room_chat_messages')
      .select(
        `
        *,
        user:profiles!room_chat_messages_user_id_fkey(full_name, username)
      `
      )
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching messages:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in getChatMessages:', err);
    return { data: null, error: err as Error };
  }
}

// ==========================================
// PLAYLIST MANAGEMENT
// ==========================================

/**
 * Get user's playlists
 */
export async function getUserPlaylists(): Promise<{
  data: any[] | null;
  error: Error | null;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('user_playlists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching playlists:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in getUserPlaylists:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Get tracks in a playlist
 */
export async function getPlaylistTracks(
  playlistId: string
): Promise<{ data: PlaylistTrack[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('playlist_tracks')
      .select('*')
      .eq('playlist_id', playlistId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching playlist tracks:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in getPlaylistTracks:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Add track to playlist
 */
export async function addTrackToPlaylist(params: {
  playlistId: string;
  title: string;
  artist: string;
  duration: string;
  sourceUrl?: string;
}): Promise<{ data: PlaylistTrack | null; error: Error | null }> {
  try {
    // Get the current max order_index
    const { data: tracks } = await supabase
      .from('playlist_tracks')
      .select('order_index')
      .eq('playlist_id', params.playlistId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextIndex = tracks && tracks.length > 0 ? tracks[0].order_index + 1 : 0;

    const { data, error } = await supabase
      .from('playlist_tracks')
      .insert({
        ...params,
        order_index: nextIndex,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding track:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in addTrackToPlaylist:', err);
    return { data: null, error: err as Error };
  }
}

// ==========================================
// CANVAS MANAGEMENT
// ==========================================

/**
 * Get or create canvas session for room
 */
export async function getCanvasSession(
  roomId: string
): Promise<{ data: CanvasSession | null; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    // Try to get existing session
    let { data, error } = await supabase
      .from('canvas_sessions')
      .select('*')
      .eq('room_id', roomId)
      .single();

    // If no session exists, create one
    if (error && error.code === 'PGRST116') {
      const { data: newSession, error: createError } = await supabase
        .from('canvas_sessions')
        .insert({
          room_id: roomId,
          created_by: user.id,
          canvas_data: { strokes: [] },
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating canvas session:', createError);
        return { data: null, error: createError };
      }

      return { data: newSession, error: null };
    }

    if (error) {
      console.error('Error fetching canvas session:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in getCanvasSession:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Update canvas data
 */
export async function updateCanvasData(
  sessionId: string,
  canvasData: any
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('canvas_sessions')
      .update({ canvas_data: canvasData })
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating canvas:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in updateCanvasData:', err);
    return { success: false, error: err as Error };
  }
}

// ==========================================
// DISTRACTION DETECTION
// ==========================================

/**
 * Log a focus event (tab switch, etc.)
 */
export async function logFocusEvent(
  roomId: string,
  eventType: 'tab_switch' | 'return' | 'inactive'
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: new Error('Not authenticated') };
    }

    const { error } = await supabase.from('focus_events').insert({
      user_id: user.id,
      room_id: roomId,
      event_type: eventType,
    });

    if (error) {
      console.error('Error logging focus event:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in logFocusEvent:', err);
    return { success: false, error: err as Error };
  }
}

// ==========================================
// REALTIME SUBSCRIPTIONS
// ==========================================

/**
 * Subscribe to room updates (participants, chat, sessions)
 */
export function subscribeToRoom(
  roomId: string,
  callbacks: {
    onParticipantUpdate?: (payload: any) => void;
    onChatMessage?: (payload: any) => void;
    onSessionUpdate?: (payload: any) => void;
    onCanvasUpdate?: (payload: any) => void;
  }
) {
  const channels = [];

  // Subscribe to participants
  if (callbacks.onParticipantUpdate) {
    const participantChannel = supabase
      .channel(`room_participants:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_participants',
          filter: `room_id=eq.${roomId}`,
        },
        callbacks.onParticipantUpdate
      )
      .subscribe();
    channels.push(participantChannel);
  }

  // Subscribe to chat messages
  if (callbacks.onChatMessage) {
    const chatChannel = supabase
      .channel(`room_chat:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        callbacks.onChatMessage
      )
      .subscribe();
    channels.push(chatChannel);
  }

  // Subscribe to sessions
  if (callbacks.onSessionUpdate) {
    const sessionChannel = supabase
      .channel(`room_sessions:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_sessions',
          filter: `room_id=eq.${roomId}`,
        },
        callbacks.onSessionUpdate
      )
      .subscribe();
    channels.push(sessionChannel);
  }

  // Subscribe to canvas updates
  if (callbacks.onCanvasUpdate) {
    const canvasChannel = supabase
      .channel(`canvas_sessions:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'canvas_sessions',
          filter: `room_id=eq.${roomId}`,
        },
        callbacks.onCanvasUpdate
      )
      .subscribe();
    channels.push(canvasChannel);
  }

  // Return cleanup function
  return () => {
    channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
  };
}
