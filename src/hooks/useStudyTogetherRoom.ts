import { useState, useEffect, useCallback } from 'react';
import {
  getRoomByCode,
  joinRoom,
  leaveRoom,
  getRoomParticipants,
  getActiveSession,
  getChatMessages,
  startSession,
  stopSession,
  sendChatMessage,
  updateParticipantStatus,
  logFocusEvent,
  getCanvasSession,
  updateCanvasData,
  subscribeToRoom,
  StudyRoom,
  RoomParticipant,
  RoomSession,
  ChatMessage,
  CanvasSession,
} from '../services/studyTogetherService';

export function useStudyTogetherRoom(roomId: string | null) {
  const [room, setRoom] = useState<StudyRoom | null>(null);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [currentSession, setCurrentSession] = useState<RoomSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [canvasSession, setCanvasSession] = useState<CanvasSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);

  // Load room data
  const loadRoomData = useCallback(async () => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load participants
      const { data: participantsData, error: participantsError } =
        await getRoomParticipants(roomId);
      if (participantsError) throw participantsError;
      setParticipants(participantsData || []);

      // Load active session
      const { data: sessionData, error: sessionError } =
        await getActiveSession(roomId);
      if (sessionError) throw sessionError;
      setCurrentSession(sessionData);

      // Load chat messages
      const { data: chatData, error: chatError } = await getChatMessages(roomId);
      if (chatError) throw chatError;
      setChatMessages(chatData || []);

      // Load canvas session
      const { data: canvasData, error: canvasError } = await getCanvasSession(
        roomId
      );
      if (canvasError) throw canvasError;
      setCanvasSession(canvasData);
    } catch (err: any) {
      console.error('Error loading room data:', err);
      setError(err.message || 'Failed to load room data');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Join room by code
  const handleJoinRoom = useCallback(async (roomCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: roomData, error: roomError } = await getRoomByCode(roomCode);
      if (roomError) throw roomError;
      if (!roomData) throw new Error('Room not found');

      setRoom(roomData);

      const { error: joinError } = await joinRoom({ roomId: roomData.id });
      if (joinError) throw joinError;

      await loadRoomData();
      return { success: true };
    } catch (err: any) {
      console.error('Error joining room:', err);
      setError(err.message || 'Failed to join room');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadRoomData]);

  // Leave room
  const handleLeaveRoom = useCallback(async () => {
    if (!roomId) return;

    try {
      await leaveRoom(roomId);
      setRoom(null);
      setParticipants([]);
      setCurrentSession(null);
      setChatMessages([]);
    } catch (err: any) {
      console.error('Error leaving room:', err);
      setError(err.message || 'Failed to leave room');
    }
  }, [roomId]);

  // Start session (host only)
  const handleStartSession = useCallback(
    async (type: 'pomodoro' | 'focus' | 'break', durationMinutes: number) => {
      if (!roomId) return;

      try {
        const { data, error } = await startSession({
          roomId,
          type,
          durationMinutes,
        });
        if (error) throw error;
        setCurrentSession(data);
      } catch (err: any) {
        console.error('Error starting session:', err);
        setError(err.message || 'Failed to start session');
      }
    },
    [roomId]
  );

  // Stop session (host only)
  const handleStopSession = useCallback(async () => {
    if (!roomId) return;

    try {
      const { error } = await stopSession(roomId);
      if (error) throw error;
      setCurrentSession(null);
    } catch (err: any) {
      console.error('Error stopping session:', err);
      setError(err.message || 'Failed to stop session');
    }
  }, [roomId]);

  // Send chat message
  const handleSendMessage = useCallback(
    async (message: string, type: 'message' | 'system' | 'reaction' = 'message') => {
      if (!roomId) return;

      try {
        const { error } = await sendChatMessage(roomId, message, type);
        if (error) throw error;
        // Message will be added via realtime subscription
      } catch (err: any) {
        console.error('Error sending message:', err);
        setError(err.message || 'Failed to send message');
      }
    },
    [roomId]
  );

  // Update participant status
  const handleUpdateStatus = useCallback(
    async (status: 'studying' | 'break' | 'away') => {
      if (!roomId) return;

      try {
        const { error } = await updateParticipantStatus(roomId, status);
        if (error) throw error;
      } catch (err: any) {
        console.error('Error updating status:', err);
        setError(err.message || 'Failed to update status');
      }
    },
    [roomId]
  );

  // Log focus event
  const handleLogFocusEvent = useCallback(
    async (eventType: 'tab_switch' | 'return' | 'inactive') => {
      if (!roomId) return;

      try {
        await logFocusEvent(roomId, eventType);
      } catch (err: any) {
        console.error('Error logging focus event:', err);
      }
    },
    [roomId]
  );

  // Update canvas
  const handleUpdateCanvas = useCallback(
    async (canvasData: any) => {
      if (!canvasSession) return;

      try {
        const { error } = await updateCanvasData(canvasSession.id, canvasData);
        if (error) throw error;
      } catch (err: any) {
        console.error('Error updating canvas:', err);
        setError(err.message || 'Failed to update canvas');
      }
    },
    [canvasSession]
  );

  // Set up realtime subscriptions
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToRoom(roomId, {
      onParticipantUpdate: async (payload) => {
        console.log('Participant update:', payload);
        // Reload participants
        const { data } = await getRoomParticipants(roomId);
        if (data) setParticipants(data);
      },
      onChatMessage: async (payload) => {
        console.log('Chat message:', payload);
        // Add new message to chat
        if (payload.eventType === 'INSERT') {
          const { data } = await getChatMessages(roomId);
          if (data) setChatMessages(data);
        }
      },
      onSessionUpdate: async (payload) => {
        console.log('Session update:', payload);
        // Reload session
        const { data } = await getActiveSession(roomId);
        setCurrentSession(data);
      },
      onCanvasUpdate: async (payload) => {
        console.log('Canvas update:', payload);
        // Reload canvas
        const { data } = await getCanvasSession(roomId);
        if (data) setCanvasSession(data);
      },
    });

    return unsubscribe;
  }, [roomId]);

  // Load initial data
  useEffect(() => {
    loadRoomData();
  }, [loadRoomData]);

  // Determine if current user is host
  useEffect(() => {
    if (room && participants.length > 0) {
      const currentUserId = participants.find((p) => p.user_id === room.host_user_id)?.user_id;
      setIsHost(currentUserId === room.host_user_id);
    }
  }, [room, participants]);

  return {
    room,
    participants,
    currentSession,
    chatMessages,
    canvasSession,
    loading,
    error,
    isHost,
    joinRoom: handleJoinRoom,
    leaveRoom: handleLeaveRoom,
    startSession: handleStartSession,
    stopSession: handleStopSession,
    sendMessage: handleSendMessage,
    updateStatus: handleUpdateStatus,
    logFocusEvent: handleLogFocusEvent,
    updateCanvas: handleUpdateCanvas,
    reloadData: loadRoomData,
  };
}
