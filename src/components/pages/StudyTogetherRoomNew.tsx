import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Copy, 
  Play, 
  Pause, 
  Timer, 
  MessageCircle, 
  Crown,
  UserPlus,
  Share,
  Headphones,
  Eye,
  EyeOff,
  Send,
  Plus,
  Brush,
  LogOut,
  AlertCircle,
  Music,
  Volume2,
  X,
  Pencil,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from 'sonner@2.0.3';
import { CollaborativeCanvas } from '../CollaborativeCanvas';
import { MusicPlayer } from '../MusicPlayer';
import { AmbientSounds } from '../AmbientSounds';
import { createRoom, getRooms, StudyRoom } from '../../services/studyTogetherService';
import { useStudyTogetherRoom } from '../../hooks/useStudyTogetherRoom';

interface StudyTogetherRoomProps {
  user?: {
    id: string;
    full_name?: string;
    email: string;
  } | null;
}

export function StudyTogetherRoom({ user }: StudyTogetherRoomProps) {
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [showRoomList, setShowRoomList] = useState(true);
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<StudyRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Use the custom hook for room management
  const {
    room,
    participants,
    currentSession,
    chatMessages,
    canvasSession,
    loading,
    error,
    isHost,
    joinRoom,
    leaveRoom,
    startSession,
    stopSession,
    sendMessage,
    updateStatus,
  } = useStudyTogetherRoom(currentRoomId);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Load available public rooms
  const loadPublicRooms = async () => {
    setLoadingRooms(true);
    try {
      const { data, error } = await getRooms({ publicOnly: true, limit: 10 });
      if (error) throw error;
      setAvailableRooms(data || []);
    } catch (err: any) {
      console.error('Error loading rooms:', err);
      toast.error('Failed to load rooms');
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (!currentRoomId) {
      loadPublicRooms();
      
      // Check for room code in URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const joinCode = urlParams.get('join');
      
      if (joinCode && user) {
        // Auto-join the room if code is in URL
        setJoinRoomCode(joinCode);
        setShowJoinRoom(true);
        toast.info(`Joining room ${joinCode}...`);
        
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (joinCode && !user) {
        // Save the code and prompt user to login
        toast.info('Please sign in to join this study room');
        window.dispatchEvent(new Event('navigate-to-login'));
      }
    }
  }, [currentRoomId, user]);

  // Handle creating a new room
  const handleCreateRoom = async () => {
    // Check if user is authenticated
    if (!user) {
      toast.error('Please sign in to create a room');
      setShowCreateRoom(false);
      // Trigger navigation to login
      window.dispatchEvent(new Event('navigate-to-login'));
      return;
    }

    if (!newRoomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    try {
      const { data, error } = await createRoom({
        name: newRoomName.trim(),
        isPublic: !isPrivateRoom,
        theme: 'forest',
      });

      if (error) throw error;
      if (!data) throw new Error('Failed to create room');

      // Show success with room code
      const roomCodeMsg = data.room_code 
        ? ` Your room code is: ${data.room_code}` 
        : '';
      toast.success(`Room created successfully!${roomCodeMsg}`, { duration: 5000 });
      
      setCurrentRoomId(data.id);
      setShowCreateRoom(false);
      setShowRoomList(false);
      setNewRoomName('');
    } catch (err: any) {
      console.error('Error creating room:', err);
      toast.error(err.message || 'Failed to create room');
    }
  };

  // Handle joining a room by code
  const handleJoinByCode = async () => {
    // Check if user is authenticated
    if (!user) {
      toast.error('Please sign in to join a room');
      setShowJoinRoom(false);
      // Trigger navigation to login
      window.dispatchEvent(new Event('navigate-to-login'));
      return;
    }

    if (!joinRoomCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }

    try {
      const result = await joinRoom(joinRoomCode.trim().toUpperCase());
      if (result.success) {
        toast.success('Joined room successfully!');
        setShowJoinRoom(false);
        setShowRoomList(false);
        setJoinRoomCode('');
      } else {
        toast.error(result.error || 'Failed to join room');
      }
    } catch (err: any) {
      console.error('Error joining room:', err);
      toast.error(err.message || 'Failed to join room');
    }
  };

  // Handle joining a room from the list
  const handleJoinFromList = async (roomId: string) => {
    // Check if user is authenticated
    if (!user) {
      toast.error('Please sign in to join a room');
      // Trigger navigation to login
      window.dispatchEvent(new Event('navigate-to-login'));
      return;
    }

    setCurrentRoomId(roomId);
    setShowRoomList(false);
    try {
      await joinRoom(roomId);
    } catch (err: any) {
      console.error('Error joining room:', err);
      toast.error(err.message || 'Failed to join room');
    }
  };

  // Handle leaving the room
  const handleLeaveRoom = async () => {
    try {
      await leaveRoom();
      setCurrentRoomId(null);
      setShowRoomList(true);
      toast.info('Left the room');
      loadPublicRooms();
    } catch (err: any) {
      console.error('Error leaving room:', err);
      toast.error(err.message || 'Failed to leave room');
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      // In a real implementation, you'd send this to other users via real-time subscription
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  // Handle sending a chat message
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage.trim(), 'message');
      setNewMessage('');
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  // Handle sending a reaction
  const handleSendReaction = (emoji: string) => {
    sendMessage(emoji, 'reaction');
  };

  // Copy room link
  const copyRoomLink = () => {
    if (room && room.room_code) {
      const link = `${window.location.origin}/?join=${room.room_code}`;
      navigator.clipboard.writeText(link);
      toast.success('Room link copied! Share it with your study group.');
    } else {
      toast.error('Room code not available');
    }
  };

  // Copy room code
  const copyRoomCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.room_code);
      toast.success('Room code copied!');
    }
  };

  // Format time for timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate remaining time for active session
  const getRemainingTime = () => {
    if (!currentSession || !currentSession.is_active) return 0;
    const elapsed = Math.floor(
      (new Date().getTime() - new Date(currentSession.started_at).getTime()) / 1000
    );
    return Math.max(0, currentSession.duration_seconds - elapsed);
  };

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'studying': return 'text-green-500';
      case 'break': return 'text-yellow-500';
      case 'away': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'studying': return 'border-green-500 text-green-600 bg-green-50 dark:bg-green-950/30';
      case 'break': return 'border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30';
      case 'away': return 'border-gray-500 text-gray-600 bg-gray-50 dark:bg-gray-950/30';
      default: return 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30';
    }
  };

  // Timer update effect
  const [remainingTime, setRemainingTime] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(getRemainingTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [currentSession]);

  // Show room list if no room is joined
  if (!currentRoomId || showRoomList) {
    return (
      <div className="min-h-screen pb-8 px-6 pt-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Guest User Banner */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert className="glassmorphism border-primary-solid/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Sign in to create or join study rooms and collaborate with others!</span>
                  <Button 
                    size="sm" 
                    className="gradient-primary ml-4"
                    onClick={() => window.dispatchEvent(new Event('navigate-to-login'))}
                  >
                    Sign In
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-8 h-8 text-primary-solid" />
              <h1 className="text-gradient-primary">Study Together</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join a focused study session with others and boost your productivity with collaborative tools, timers, and ambient sounds
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Dialog open={showCreateRoom} onOpenChange={setShowCreateRoom}>
              <DialogTrigger asChild>
                <Button className="gradient-primary">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              </DialogTrigger>
              <DialogContent className="glassmorphism">
                <DialogHeader>
                  <DialogTitle>Create Study Room</DialogTitle>
                </DialogHeader>
                
                {!user ? (
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You need to be signed in to create a study room.
                      </AlertDescription>
                    </Alert>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          setShowCreateRoom(false);
                          window.dispatchEvent(new Event('navigate-to-login'));
                        }} 
                        className="gradient-primary flex-1"
                      >
                        Sign In
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateRoom(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="room-name">Room Name</Label>
                      <Input
                        id="room-name"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="e.g., Math Study Group"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="private-room"
                        checked={isPrivateRoom}
                        onChange={(e) => setIsPrivateRoom(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="private-room" className="text-sm">
                        Private Room (invite only)
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateRoom} className="gradient-primary flex-1">
                        Create Room
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateRoom(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={showJoinRoom} onOpenChange={setShowJoinRoom}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join by Code
                </Button>
              </DialogTrigger>
              <DialogContent className="glassmorphism">
                <DialogHeader>
                  <DialogTitle>Join Study Room</DialogTitle>
                </DialogHeader>
                
                {!user ? (
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You need to be signed in to join a study room.
                      </AlertDescription>
                    </Alert>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          setShowJoinRoom(false);
                          window.dispatchEvent(new Event('navigate-to-login'));
                        }} 
                        className="gradient-primary flex-1"
                      >
                        Sign In
                      </Button>
                      <Button variant="outline" onClick={() => setShowJoinRoom(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="room-code">Room Code</Label>
                      <Input
                        id="room-code"
                        value={joinRoomCode}
                        onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                        placeholder="Enter 6-character code..."
                        maxLength={6}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleJoinByCode} className="gradient-primary flex-1">
                        Join Room
                      </Button>
                      <Button variant="outline" onClick={() => setShowJoinRoom(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Available Rooms */}
          <Card className="glassmorphism border-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Available Study Rooms</span>
                <Button variant="ghost" size="sm" onClick={loadPublicRooms}>
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRooms ? (
                <div className="text-center py-8 text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading rooms...
                </div>
              ) : availableRooms.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No public rooms available. Create one to get started!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableRooms.map((room) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: user ? 1.02 : 1 }}
                      className={`p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-all ${user ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'}`}
                      onClick={() => user && handleJoinFromList(room.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium">{room.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Host: {room.host?.full_name || room.host?.username || 'Unknown'}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30">
                          <Users className="w-3 h-3 mr-1" />
                          {room.participant_count || 0}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Code: {room.room_code}
                        </span>
                        {user ? (
                          <Button
                            size="sm"
                            className="gradient-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinFromList(room.id);
                            }}
                          >
                            Join
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info('Please sign in to join rooms');
                              window.dispatchEvent(new Event('navigate-to-login'));
                            }}
                          >
                            Sign In to Join
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show room interface if joined
  return (
    <div className="min-h-screen pb-8 px-6 pt-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary-solid" />
            <div>
              <h1 className="text-gradient-primary">{room?.name || 'Study Room'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse" />
                  {participants.filter(p => p.is_online).length} Online
                </Badge>
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-secondary-solid/20"
                  onClick={copyRoomCode}
                >
                  Code: {room?.room_code}
                  <Copy className="w-3 h-3 ml-1" />
                </Badge>
                {isHost && <Crown className="w-4 h-4 text-yellow-500" title="You are the host" />}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={copyRoomLink} variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share Link
            </Button>
            <Button onClick={handleLeaveRoom} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Leave
            </Button>
          </div>
        </motion.div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Area */}
          <div className="xl:col-span-2 space-y-6">
            {/* Shared Timer */}
            <Card className="glassmorphism border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Shared Focus Timer
                  {currentSession?.is_active && (
                    <Badge className="bg-green-500 text-white ml-2">
                      Active
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <motion.div 
                  className="text-6xl font-mono text-gradient-primary"
                  animate={{ 
                    scale: currentSession?.is_active && remainingTime <= 10 && remainingTime > 0 ? [1, 1.05, 1] : 1 
                  }}
                  transition={{ duration: 0.5, repeat: currentSession?.is_active && remainingTime <= 10 ? Infinity : 0 }}
                >
                  {formatTime(remainingTime)}
                </motion.div>
                
                {currentSession && (
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {currentSession.session_type} Session
                    </Badge>
                  </div>
                )}

                {isHost ? (
                  <div className="flex flex-wrap justify-center gap-2">
                    {!currentSession?.is_active ? (
                      <>
                        <Button onClick={() => startSession('pomodoro', 25)} className="gradient-primary">
                          <Play className="w-4 h-4 mr-2" />
                          Pomodoro (25min)
                        </Button>
                        <Button onClick={() => startSession('focus', 50)} variant="outline">
                          <Timer className="w-4 h-4 mr-2" />
                          Focus (50min)
                        </Button>
                        <Button onClick={() => startSession('break', 5)} variant="outline">
                          <Pause className="w-4 h-4 mr-2" />
                          Break (5min)
                        </Button>
                      </>
                    ) : (
                      <Button onClick={stopSession} variant="outline">
                        <Pause className="w-4 h-4 mr-2" />
                        Stop Session
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    Only the host can control the shared timer
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Participants */}
            <Card className="glassmorphism border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Participants ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {participants.map((participant, index) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg border transition-all ${
                        participant.is_online 
                          ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' 
                          : 'border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950/20 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-solid to-secondary-solid flex items-center justify-center">
                            <span className="text-white font-medium">
                              {participant.user?.full_name?.[0] || participant.user?.username?.[0] || 'U'}
                            </span>
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                            participant.is_online ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium flex items-center gap-1 truncate">
                            {participant.user?.full_name || participant.user?.username || 'Unknown'}
                            {participant.user_id === room?.created_by && <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={`text-xs ${getStatusBadgeColor(participant.status)}`}>
                              {participant.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {Math.floor(participant.study_time_minutes / 60)}h {participant.study_time_minutes % 60}m
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Collaborative Canvas */}
            <Card className="glassmorphism border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brush className="w-5 h-5" />
                  Collaborative Canvas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CollaborativeCanvas 
                  width={800}
                  height={400}
                  participantCount={participants.filter(p => p.is_online).length}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Chat */}
            <Card className="glassmorphism border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Chat
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowChat(!showChat)}>
                    {showChat ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              {showChat && (
                <CardContent className="space-y-4">
                  <div className="h-64 overflow-y-auto space-y-3 bg-muted/20 rounded-lg p-3">
                    {chatMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-sm ${
                          message.message_type === 'system' 
                            ? 'text-center text-muted-foreground italic' 
                            : message.message_type === 'reaction'
                            ? 'text-center'
                            : ''
                        }`}
                      >
                        {message.message_type === 'message' && (
                          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
                            <span className="font-medium text-primary-solid">
                              {message.user?.full_name || message.user?.username || 'User'}
                            </span>
                            <p className="mt-1">{message.message}</p>
                          </div>
                        )}
                        {message.message_type === 'system' && (
                          <div className="text-xs">{message.message}</div>
                        )}
                        {message.message_type === 'reaction' && (
                          <div className="inline-flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
                            <span>{message.user?.full_name || message.user?.username || 'User'}</span>
                            <span className="text-xl">{message.message}</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  
                  {/* Typing indicator */}
                  <AnimatePresence>
                    {typingUsers.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} size="sm" className="gradient-primary">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-center gap-2 flex-wrap">
                    {['👍', '💪', '🎉', '☕', '🔥', '✨'].map((emoji) => (
                      <Button 
                        key={emoji}
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleSendReaction(emoji)}
                        className="hover:scale-110 transition-transform"
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Music & Sounds */}
            <Card className="glassmorphism border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="w-5 h-5" />
                  Music & Sounds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="music" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="music">
                      <Music className="w-4 h-4 mr-2" />
                      Music
                    </TabsTrigger>
                    <TabsTrigger value="ambient">
                      <Volume2 className="w-4 h-4 mr-2" />
                      Ambient
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="music" className="mt-4">
                    <div className="text-center space-y-3">
                      <MusicPlayer autoPlay={false} showQueue={false} />
                      <p className="text-xs text-muted-foreground">
                        🎵 Your personal music player - others can't hear it
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="ambient" className="mt-4">
                    <AmbientSounds className="border-0" />
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      🌊 Mix ambient sounds to create your perfect focus environment
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
