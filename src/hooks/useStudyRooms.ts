import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Database } from '../types/database'
import { toast } from 'sonner@2.0.3'

type Tables = Database['public']['Tables']

export interface StudyRoom extends Tables['study_rooms']['Row'] {
  participant_count?: number
  room_participants?: Array<Tables['room_participants']['Row'] & {
    profiles: Tables['profiles']['Row']
  }>
}

export interface RoomParticipant extends Tables['room_participants']['Row'] {
  profiles?: Tables['profiles']['Row']
}

export interface ChatMessage extends Tables['room_chat_messages']['Row'] {
  profiles?: Tables['profiles']['Row']
}

export interface CanvasSession extends Tables['canvas_sessions']['Row'] {}

// Study Rooms Hook
export function useStudyRooms() {
  const [rooms, setRooms] = useState<StudyRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('study_rooms')
        .select(`
          *,
          room_participants!inner (
            id,
            user_id,
            joined_at,
            left_at,
            status,
            study_time_minutes,
            profiles (
              id,
              full_name,
              username,
              avatar_url
            )
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Process rooms to add participant count
      const processedRooms = (data || []).map(room => ({
        ...room,
        participant_count: room.room_participants?.filter(p => !p.left_at).length || 0
      }))
      
      setRooms(processedRooms)
      setError(null)
    } catch (err) {
      console.error('Error fetching study rooms:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch study rooms')
    } finally {
      setLoading(false)
    }
  }

  const createRoom = async (roomData: Omit<Tables['study_rooms']['Insert'], 'host_user_id' | 'room_code'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Generate unique room code
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase()

      const { data, error } = await supabase
        .from('study_rooms')
        .insert([{
          ...roomData,
          host_user_id: user.id,
          room_code: roomCode
        }])
        .select()
        .single()
      
      if (error) throw error

      // Automatically join the creator as a participant
      await joinRoom(data.id)
      
      await fetchRooms()
      return { success: true, room: data }
    } catch (err) {
      console.error('Error creating study room:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create study room' }
    }
  }

  const joinRoom = async (roomId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('room_participants')
        .insert([{
          room_id: roomId,
          user_id: user.id,
          status: 'studying'
        }])
        .select()
        .single()
      
      if (error) throw error
      await fetchRooms()
      return { success: true, participant: data }
    } catch (err) {
      console.error('Error joining room:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to join room' }
    }
  }

  const leaveRoom = async (roomId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('room_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .is('left_at', null)
      
      if (error) throw error
      await fetchRooms()
      return { success: true }
    } catch (err) {
      console.error('Error leaving room:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to leave room' }
    }
  }

  const updateParticipantStatus = async (roomId: string, status: 'studying' | 'break' | 'away') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('room_participants')
        .update({ status })
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .is('left_at', null)
      
      if (error) throw error
      return { success: true }
    } catch (err) {
      console.error('Error updating participant status:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update status' }
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  return {
    rooms,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    updateParticipantStatus,
    refetch: fetchRooms
  }
}

// Room Chat Hook
export function useRoomChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    if (!roomId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('room_chat_messages')
        .select(`
          *,
          profiles (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      setMessages(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching chat messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch chat messages')
    } finally {
      setLoading(false)
    }
  }, [roomId])

  const sendMessage = async (message: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('room_chat_messages')
        .insert([{
          room_id: roomId,
          user_id: user.id,
          message: message.trim(),
          message_type: 'text'
        }])
        .select(`
          *,
          profiles (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .single()
      
      if (error) throw error
      
      // Add the new message to the local state immediately
      setMessages(prev => [...prev, data])
      
      return { success: true, message: data }
    } catch (err) {
      console.error('Error sending message:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to send message' }
    }
  }

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!roomId) return

    fetchMessages()

    const subscription = supabase
      .channel(`room_chat_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          // Fetch the full message with profile data
          const { data } = await supabase
            .from('room_chat_messages')
            .select(`
              *,
              profiles (
                id,
                full_name,
                username,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMessages(prev => {
              // Check if message already exists to avoid duplicates
              const exists = prev.some(msg => msg.id === data.id)
              if (exists) return prev
              return [...prev, data]
            })
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [roomId, fetchMessages])

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages
  }
}

// Canvas Session Hook
export function useCanvasSession(roomId: string) {
  const [canvasSession, setCanvasSession] = useState<CanvasSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCanvasSession = useCallback(async () => {
    if (!roomId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('canvas_sessions')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
      
      setCanvasSession(data || null)
      setError(null)
    } catch (err) {
      console.error('Error fetching canvas session:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch canvas session')
    } finally {
      setLoading(false)
    }
  }, [roomId])

  const createCanvasSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('canvas_sessions')
        .insert([{
          room_id: roomId,
          created_by: user.id,
          canvas_data: null
        }])
        .select()
        .single()
      
      if (error) throw error
      setCanvasSession(data)
      return { success: true, session: data }
    } catch (err) {
      console.error('Error creating canvas session:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create canvas session' }
    }
  }

  const updateCanvasData = async (canvasData: any) => {
    if (!canvasSession) return { success: false, error: 'No active canvas session' }

    try {
      const { error } = await supabase
        .from('canvas_sessions')
        .update({ canvas_data: canvasData })
        .eq('id', canvasSession.id)
      
      if (error) throw error
      return { success: true }
    } catch (err) {
      console.error('Error updating canvas data:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update canvas' }
    }
  }

  const addCanvasStroke = async (strokeData: any) => {
    if (!canvasSession) return { success: false, error: 'No active canvas session' }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('canvas_strokes')
        .insert([{
          canvas_session_id: canvasSession.id,
          user_id: user.id,
          stroke_data: strokeData
        }])
        .select()
        .single()
      
      if (error) throw error
      return { success: true, stroke: data }
    } catch (err) {
      console.error('Error adding canvas stroke:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to add stroke' }
    }
  }

  // Set up real-time subscription for canvas strokes
  useEffect(() => {
    if (!roomId || !canvasSession) return

    const subscription = supabase
      .channel(`canvas_strokes_${canvasSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'canvas_strokes',
          filter: `canvas_session_id=eq.${canvasSession.id}`
        },
        (payload) => {
          // Handle real-time stroke updates here
          // This would typically trigger a canvas redraw
          window.dispatchEvent(new CustomEvent('canvas-stroke-added', { 
            detail: payload.new 
          }))
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [roomId, canvasSession])

  useEffect(() => {
    fetchCanvasSession()
  }, [fetchCanvasSession])

  return {
    canvasSession,
    loading,
    error,
    createCanvasSession,
    updateCanvasData,
    addCanvasStroke,
    refetch: fetchCanvasSession
  }
}