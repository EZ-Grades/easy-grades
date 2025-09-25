import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Copy, 
  Link, 
  Play, 
  Pause, 
  Timer, 
  MessageCircle, 
  Heart, 
  ThumbsUp, 
  Coffee, 
  Volume2,
  VolumeX,
  Settings,
  Crown,
  UserPlus,
  Share,
  Headphones,
  Eye,
  EyeOff,
  Zap,
  Clock,
  X,
  Send,
  Plus,
  Brush,
  RotateCcw,
  Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from 'sonner@2.0.3';
import { CollaborativeCanvas } from '../CollaborativeCanvas';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  status: 'studying' | 'break' | 'away';
  studyTime: number;
  isOnline: boolean;
  joinedAt: Date;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'system' | 'reaction';
}

interface StudySession {
  id: string;
  type: 'pomodoro' | 'focus' | 'break';
  duration: number;
  remainingTime: number;
  isActive: boolean;
  startedBy: string;
}

export function StudyTogetherRoom() {
  const [roomId] = useState('ABC123');
  const [roomName, setRoomName] = useState('');
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);
  const [isHost, setIsHost] = useState(true);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [joinRoomCode, setJoinRoomCode] = useState('');
  
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'You', avatar: '👨‍💻', status: 'studying', studyTime: 125, isOnline: true, joinedAt: new Date() },
    { id: '2', name: 'Alex Chen', avatar: '👩‍📚', status: 'studying', studyTime: 98, isOnline: true, joinedAt: new Date() },
    { id: '3', name: 'Sarah Kim', avatar: '👨‍🎓', status: 'break', studyTime: 87, isOnline: true, joinedAt: new Date() },
    { id: '4', name: 'Mike Johnson', avatar: '👩‍💼', status: 'studying', studyTime: 156, isOnline: true, joinedAt: new Date() },
    { id: '5', name: 'Emma Davis', avatar: '👨‍🔬', status: 'away', studyTime: 45, isOnline: false, joinedAt: new Date() },
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', userId: '2', userName: 'Alex Chen', message: 'Good luck everyone! Let\'s stay focused! 💪', timestamp: new Date(), type: 'message' },
    { id: '2', userId: 'system', userName: 'System', message: 'Sarah Kim joined the room', timestamp: new Date(), type: 'system' },
    { id: '3', userId: '3', userName: 'Sarah Kim', message: 'Thanks! Ready for a productive session', timestamp: new Date(), type: 'message' },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(true);
  
  const [currentSession, setCurrentSession] = useState<StudySession>({
    id: '1',
    type: 'pomodoro',
    duration: 25 * 60,
    remainingTime: 25 * 60,
    isActive: false,
    startedBy: 'You'
  });

  const [ambientSounds, setAmbientSounds] = useState([
    { id: '1', name: 'Rain', volume: 50, enabled: false, icon: '🌧️' },
    { id: '2', name: 'Forest', volume: 30, enabled: true, icon: '🌲' },
    { id: '3', name: 'Coffee Shop', volume: 40, enabled: false, icon: '☕' },
  ]);

  const [sharedPlaylist] = useState([
    { id: '1', title: 'Lo-Fi Study Beats', artist: 'Various Artists', duration: '3:45' },
    { id: '2', title: 'Peaceful Piano', artist: 'Relaxing Music', duration: '4:12' },
    { id: '3', title: 'Nature Sounds Mix', artist: 'Ambient Collection', duration: '5:30' },
  ]);

  const [roomTheme, setRoomTheme] = useState('forest');
  const [distractionDetectionEnabled, setDistractionDetectionEnabled] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentSession.isActive && currentSession.remainingTime > 0) {
      interval = setInterval(() => {
        setCurrentSession(prev => ({
          ...prev,
          remainingTime: prev.remainingTime - 1
        }));
      }, 1000);
    } else if (currentSession.isActive && currentSession.remainingTime === 0) {
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [currentSession.isActive, currentSession.remainingTime]);

  // Distraction detection
  useEffect(() => {
    if (distractionDetectionEnabled) {
      const handleVisibilityChange = () => {
        if (document.hidden && currentSession.isActive) {
          setTabSwitchCount(prev => prev + 1);
          updateParticipantStatus('1', 'away');
          toast.warning('Focus session interrupted - tab switched');
        } else if (!document.hidden && currentSession.isActive) {
          updateParticipantStatus('1', 'studying');
        }
      };

      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (currentSession.isActive) {
          e.preventDefault();
          e.returnValue = 'Focus session is active. Leaving will interrupt it.';
          return 'Focus session is active. Leaving will interrupt it.';
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [distractionDetectionEnabled, currentSession.isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateParticipantStatus = (id: string, status: 'studying' | 'break' | 'away') => {
    setParticipants(prev => prev.map(p => 
      p.id === id ? { ...p, status } : p
    ));
  };

  const startSession = (type: 'pomodoro' | 'focus' | 'break', duration: number) => {
    setCurrentSession({
      id: Date.now().toString(),
      type,
      duration: duration * 60,
      remainingTime: duration * 60,
      isActive: true,
      startedBy: 'You'
    });
    
    // Add system message
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'system',
      userName: 'System',
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} session (${duration}min) started by You`,
      timestamp: new Date(),
      type: 'system'
    };
    setChatMessages(prev => [...prev, systemMessage]);
    
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} session started!`);
  };

  const stopSession = () => {
    setCurrentSession(prev => ({ ...prev, isActive: false }));
    toast.info('Session stopped');
  };

  const handleSessionComplete = () => {
    setCurrentSession(prev => ({ ...prev, isActive: false }));
    
    // Show celebration
    toast.success('🎉 Session completed! Great work!');
    
    // Add completion message
    const completionMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'system',
      userName: 'System',
      message: '🎉 Focus session completed! Well done everyone!',
      timestamp: new Date(),
      type: 'system'
    };
    setChatMessages(prev => [...prev, completionMessage]);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: '1',
        userName: 'You',
        message: newMessage.trim(),
        timestamp: new Date(),
        type: 'message'
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const sendReaction = (emoji: string) => {
    const reaction: ChatMessage = {
      id: Date.now().toString(),
      userId: '1',
      userName: 'You',
      message: emoji,
      timestamp: new Date(),
      type: 'reaction'
    };
    setChatMessages(prev => [...prev, reaction]);
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(`https://ezgrades.app/room/${roomId}`);
    toast.success('Room link copied to clipboard!');
  };

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

  return (
    <div className="min-h-screen pb-8 px-6 pt-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-primary-solid" />
            <h1 className="text-5xl font-bold text-gradient-primary">Study Together</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join a focused study session with others and boost your productivity
          </p>
        </motion.div>

        {/* Room Actions */}
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
            <DialogContent className="glassmorphism" aria-describedby="create-room-description">
              <DialogHeader>
                <DialogTitle>Create Study Room</DialogTitle>
              </DialogHeader>
              <div id="create-room-description" className="sr-only">
                Create a new study room for collaborative learning sessions
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="room-name">Room Name (Optional)</Label>
                  <Input
                    id="room-name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
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
                  <Button 
                    onClick={() => {
                      toast.success('Study room created!');
                      setShowCreateRoom(false);
                    }}
                    className="gradient-primary flex-1"
                  >
                    Create Room
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateRoom(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showJoinRoom} onOpenChange={setShowJoinRoom}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Link className="w-4 h-4 mr-2" />
                Join Room
              </Button>
            </DialogTrigger>
            <DialogContent className="glassmorphism" aria-describedby="join-room-description">
              <DialogHeader>
                <DialogTitle>Join Study Room</DialogTitle>
              </DialogHeader>
              <div id="join-room-description" className="sr-only">
                Join an existing study room using a room code
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="room-code">Room Code</Label>
                  <Input
                    id="room-code"
                    value={joinRoomCode}
                    onChange={(e) => setJoinRoomCode(e.target.value)}
                    placeholder="Enter room code..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      if (joinRoomCode.trim()) {
                        toast.success('Joined study room!');
                        setShowJoinRoom(false);
                      }
                    }}
                    className="gradient-primary flex-1"
                  >
                    Join Room
                  </Button>
                  <Button variant="outline" onClick={() => setShowJoinRoom(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={copyRoomLink} variant="outline">
            <Share className="w-4 h-4 mr-2" />
            Share Room
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Session Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Current Room Info */}
            <Card className="glassmorphism border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Study Room: {roomName || `Room ${roomId}`}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30">
                      {participants.filter(p => p.isOnline).length} Online
                    </Badge>
                    <Badge variant="secondary">Room: {roomId}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {isHost ? 'You are the host' : 'Hosted by Alex Chen'}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyRoomLink}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Shared Timer */}
            <Card className="glassmorphism border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Shared Focus Timer
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="text-6xl font-mono font-bold text-gradient-primary">
                  {formatTime(currentSession.remainingTime)}
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  <Badge className={currentSession.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                    {currentSession.isActive ? 'Active' : 'Stopped'}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {currentSession.type}
                  </Badge>
                </div>

                {isHost && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {!currentSession.isActive ? (
                      <>
                        <Button
                          onClick={() => startSession('pomodoro', 25)}
                          className="gradient-primary"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Pomodoro (25min)
                        </Button>
                        <Button
                          onClick={() => startSession('focus', 50)}
                          variant="outline"
                        >
                          Focus (50min)
                        </Button>
                        <Button
                          onClick={() => startSession('break', 5)}
                          variant="outline"
                        >
                          Break (5min)
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={stopSession}
                        variant="outline"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Stop Session
                      </Button>
                    )}
                  </div>
                )}

                {!isHost && (
                  <p className="text-sm text-muted-foreground">
                    Only the host can control the shared timer
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Participants Grid */}
            <Card className="glassmorphism border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Participants ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {participants.map((participant, index) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border transition-all ${
                        participant.isOnline ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' : 'border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-solid to-secondary-solid flex items-center justify-center text-lg">
                            {participant.avatar}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${
                            participant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm flex items-center gap-2">
                            {participant.name}
                            {participant.id === '1' && <Crown className="w-3 h-3 text-yellow-500" />}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(participant.status).replace('text-', 'bg-')}`} />
                            <span className="text-xs text-muted-foreground capitalize">
                              {participant.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusBadgeColor(participant.status)}>
                          {participant.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {Math.floor(participant.studyTime / 60)}h {participant.studyTime % 60}m
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChat(!showChat)}
                  >
                    {showChat ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              {showChat && (
                <CardContent className="space-y-4">
                  <div className="h-64 overflow-y-auto space-y-3 bg-muted/20 rounded-lg p-3">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`text-sm ${
                          message.type === 'system' 
                            ? 'text-center text-muted-foreground italic' 
                            : message.type === 'reaction'
                            ? 'text-center text-2xl'
                            : ''
                        }`}
                      >
                        {message.type === 'message' && (
                          <div>
                            <span className="font-medium text-primary-solid">{message.userName}:</span>
                            <span className="ml-2">{message.message}</span>
                          </div>
                        )}
                        {message.type === 'system' && (
                          <div>{message.message}</div>
                        )}
                        {message.type === 'reaction' && (
                          <div>{message.userName}: {message.message}</div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage} size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendReaction('👍')}
                    >
                      👍
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendReaction('💪')}
                    >
                      💪
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendReaction('🎉')}
                    >
                      🎉
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendReaction('☕')}
                    >
                      ☕
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>



            {/* User-Controlled Playlist */}
            <Card className="glassmorphism border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="w-5 h-5" />
                  Your Playlist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sharedPlaylist.map((track) => (
                  <div key={track.id} className="flex items-center justify-between p-2 rounded bg-muted/20">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{track.title}</div>
                      <div className="text-xs text-muted-foreground">{track.artist}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Play className="w-3 h-3" />
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        {track.duration}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Play All
                  </Button>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  💡 Control your own playlist - others can't hear it
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Collaborative Drawing Canvas Section */}
        <Card className="glassmorphism border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brush className="w-5 h-5" />
              Collaborative Drawing Canvas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CollaborativeCanvas 
              width={800}
              height={400}
              participantCount={participants.filter(p => p.isOnline).length}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}