import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle,
  Music,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { toast } from 'sonner@2.0.3';
import { getMusicTracks, getPlaybackState, updatePlaybackState, Track } from '../services/musicService';

interface MusicPlayerProps {
  autoPlay?: boolean;
  showQueue?: boolean;
}

export function MusicPlayer({ autoPlay = false, showQueue = true }: MusicPlayerProps) {
  // Load initial volume from localStorage
  const getInitialVolume = () => {
    try {
      const savedVolume = localStorage.getItem('music_player_volume');
      return savedVolume ? parseInt(savedVolume, 10) : 70;
    } catch {
      return 70;
    }
  };

  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(getInitialVolume());
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackMode, setPlaybackMode] = useState<'normal' | 'loop' | 'shuffle'>('normal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load tracks from database
  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      setLoading(true);
      const { data, error } = await getMusicTracks(50);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setTracks(data);
        setError(null);
      } else {
        setError('No music tracks available');
      }
    } catch (err: any) {
      console.error('Error loading tracks:', err);
      setError('Failed to load music tracks');
      toast.error('Failed to load music tracks');
    } finally {
      setLoading(false);
    }
  };

  const currentTrack = tracks[currentTrackIndex];

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.addEventListener('ended', handleTrackEnd);
    audio.addEventListener('loadedmetadata', handleMetadataLoad);
    audio.addEventListener('error', handleAudioError);

    return () => {
      audio.removeEventListener('ended', handleTrackEnd);
      audio.removeEventListener('loadedmetadata', handleMetadataLoad);
      audio.removeEventListener('error', handleAudioError);
      audio.pause();
    };
  }, []);

  // Update audio source when track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      // Validate URL before setting
      if (!currentTrack.url || currentTrack.url.trim() === '') {
        console.error('Invalid track URL:', currentTrack);
        setError('Track URL is missing or invalid');
        return;
      }
      
      audioRef.current.src = currentTrack.url;
      audioRef.current.volume = volume / 100;
      
      // Load playback state from database
      loadPlaybackState();
    }
  }, [currentTrack]);

  // Auto-play if enabled
  useEffect(() => {
    if (autoPlay && currentTrack && audioRef.current && !loading) {
      playTrack();
    }
  }, [autoPlay, currentTrack, loading]);

  const loadPlaybackState = async () => {
    if (!currentTrack) return;

    try {
      // Try to load from database first (for authenticated users)
      const { data, error } = await getPlaybackState(currentTrack.id);
      
      // Silent fail for guest users - this is expected behavior
      if (error) {
        // Only log if it's not a "Not authenticated" error
        if (!error.message?.includes('Not authenticated')) {
          console.error('Error loading playback state:', error);
        }
      }
      
      if (data) {
        setVolume(data.volume);
        setPlaybackMode(data.playback_mode);
        // Optionally restore position
        if (data.current_position > 0 && audioRef.current) {
          audioRef.current.currentTime = data.current_position;
        }
        return; // Successfully loaded from database
      }
    } catch (err: any) {
      // Silent fail for expected authentication errors
      if (!err.message?.includes('Not authenticated')) {
        console.error('Error loading playback state:', err);
      }
    }
    
    // Fallback to localStorage for guest users or if database fails
    try {
      const localState = localStorage.getItem(`playback_${currentTrack.id}`);
      if (localState) {
        const parsedState = JSON.parse(localState);
        setVolume(parsedState.volume || 70);
        setPlaybackMode(parsedState.playback_mode || 'normal');
        if (parsedState.current_position > 0 && audioRef.current) {
          audioRef.current.currentTime = parsedState.current_position;
        }
      }
    } catch (localErr) {
      console.error('Error loading playback state from localStorage:', localErr);
    }
  };

  const savePlaybackState = useCallback(async () => {
    if (!currentTrack || !audioRef.current) return;

    const stateData = {
      current_position: Math.floor(audioRef.current.currentTime),
      is_playing: isPlaying,
      volume,
      playback_mode: playbackMode,
    };

    try {
      // Try to save to database (for authenticated users)
      const { error } = await updatePlaybackState(currentTrack.id, stateData);
      
      // If not authenticated, silently fall back to localStorage
      if (error && error.message?.includes('Not authenticated')) {
        // Silent fallback to localStorage
        try {
          localStorage.setItem(`playback_${currentTrack.id}`, JSON.stringify(stateData));
        } catch (localErr) {
          console.error('Error saving playback state to localStorage:', localErr);
        }
      } else if (error) {
        // Log other errors
        console.error('Error saving playback state:', error);
        // Still try localStorage as backup
        try {
          localStorage.setItem(`playback_${currentTrack.id}`, JSON.stringify(stateData));
        } catch (localErr) {
          console.error('Error saving playback state to localStorage:', localErr);
        }
      }
    } catch (err: any) {
      // Fallback to localStorage for guest users
      if (!err.message?.includes('Not authenticated')) {
        console.error('Error saving playback state:', err);
      }
      try {
        localStorage.setItem(`playback_${currentTrack.id}`, JSON.stringify(stateData));
      } catch (localErr) {
        console.error('Error saving playback state to localStorage:', localErr);
      }
    }
  }, [currentTrack, isPlaying, volume, playbackMode]);

  // Save state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        savePlaybackState();
      }
    }, 5000); // Save every 5 seconds

    return () => clearInterval(interval);
  }, [isPlaying, savePlaybackState]);

  const handleMetadataLoad = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioError = (e: Event) => {
    const audio = e.target as HTMLAudioElement;
    const error = audio.error;
    
    let errorMessage = 'Error loading audio track';
    
    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = 'Audio playback aborted';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error loading audio';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = 'Audio file could not be decoded';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Audio format not supported or source not available';
          console.error('Invalid audio source:', currentTrack?.url);
          break;
      }
    }
    
    console.error('Audio error:', errorMessage, error);
    toast.error(errorMessage);
    setIsPlaying(false);
  };

  const handleTrackEnd = () => {
    if (playbackMode === 'loop') {
      // Replay current track
      playTrack();
    } else if (playbackMode === 'shuffle') {
      playRandomTrack();
    } else {
      // Play next track
      playNextTrack();
    }
  };

  const playTrack = async () => {
    if (!audioRef.current) return;
    
    // Check if source is valid
    if (!audioRef.current.src || audioRef.current.src === window.location.href) {
      console.error('No valid audio source');
      toast.error('No audio source available');
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
      startProgressTracking();
    } catch (err: any) {
      console.error('Error playing track:', err);
      
      // Provide specific error messages
      if (err.name === 'NotSupportedError') {
        toast.error('Audio format not supported');
      } else if (err.name === 'NotAllowedError') {
        toast.error('Playback blocked - please interact with the page first');
      } else {
        toast.error('Failed to play track');
      }
    }
  };

  const pauseTrack = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    setIsPlaying(false);
    stopProgressTracking();
    savePlaybackState();
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack();
    }
  };

  const playNextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
    setProgress(0);
    if (isPlaying) {
      setTimeout(() => playTrack(), 100);
    }
  };

  const playPreviousTrack = () => {
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setProgress(0);
    if (isPlaying) {
      setTimeout(() => playTrack(), 100);
    }
  };

  const playRandomTrack = () => {
    const randomIndex = Math.floor(Math.random() * tracks.length);
    setCurrentTrackIndex(randomIndex);
    setProgress(0);
    if (isPlaying) {
      setTimeout(() => playTrack(), 100);
    }
  };

  const togglePlaybackMode = () => {
    const modes: ('normal' | 'loop' | 'shuffle')[] = ['normal', 'loop', 'shuffle'];
    const currentIndex = modes.indexOf(playbackMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setPlaybackMode(nextMode);
    toast.success(`Playback mode: ${nextMode}`);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol / 100;
    }
    if (vol > 0) {
      setIsMuted(false);
    }
    // Persist volume to localStorage
    try {
      localStorage.setItem('music_player_volume', vol.toString());
    } catch (err) {
      console.error('Error saving volume to localStorage:', err);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      audioRef.current.volume = newMutedState ? 0 : volume / 100;
    }
  };

  const handleProgressChange = (newProgress: number[]) => {
    const prog = newProgress[0];
    setProgress(prog);
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = (prog / 100) * duration;
    }
  };

  const startProgressTracking = () => {
    stopProgressTracking();
    progressIntervalRef.current = setInterval(() => {
      if (audioRef.current && duration > 0) {
        const current = audioRef.current.currentTime;
        setCurrentTime(current);
        setProgress((current / duration) * 100);
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card className="glassmorphism border-0 h-full">
        <CardContent className="flex items-center justify-center h-full min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-solid" />
        </CardContent>
      </Card>
    );
  }

  if (error || !currentTrack) {
    return (
      <Card className="glassmorphism border-0 h-full">
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
          <Music className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">{error || 'No tracks available'}</p>
          <Button onClick={loadTracks} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glassmorphism border-0 h-full relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500" />
      </div>
      
      <div className="relative z-10 p-8 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          >
            <Music className="w-6 h-6 text-purple-500" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gradient-primary">
            Music Player
          </h3>
        </div>

        {/* Album Art & Track Info - Centered */}
        <div className="flex flex-col items-center mb-6">
          <motion.div 
            className="w-28 h-28 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center overflow-hidden shadow-2xl mb-4"
            animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: "easeInOut" }}
          >
            {currentTrack.cover_url ? (
              <img src={currentTrack.cover_url} alt={currentTrack.title} className="w-full h-full object-cover" />
            ) : (
              <Music className="w-14 h-14 text-white" />
            )}
          </motion.div>
          <div className="text-center">
            <h3 className="font-medium mb-1 line-clamp-1">{currentTrack.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{currentTrack.artist || 'Unknown Artist'}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <Slider
            value={[progress]}
            onValueChange={handleProgressChange}
            max={100}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls - Large and Centered */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlaybackMode}
              className={`rounded-full w-10 h-10 ${playbackMode !== 'normal' ? 'bg-purple-500/20 text-purple-500' : ''}`}
              title={playbackMode === 'shuffle' ? 'Shuffle' : playbackMode === 'loop' ? 'Loop' : 'Normal'}
            >
              {playbackMode === 'shuffle' ? <Shuffle className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="sm" onClick={playPreviousTrack} className="rounded-full w-10 h-10">
              <SkipBack className="w-5 h-5" />
            </Button>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            animate={{ 
              boxShadow: isPlaying 
                ? ['0 0 0px rgba(168, 85, 247, 0.4)', '0 0 20px rgba(168, 85, 247, 0.6)', '0 0 0px rgba(168, 85, 247, 0.4)']
                : '0 0 0px rgba(168, 85, 247, 0)'
            }}
            transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
            className="rounded-full"
          >
            <Button
              onClick={togglePlayPause}
              className="gradient-primary rounded-full w-14 h-14 shadow-xl"
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="sm" onClick={playNextTrack} className="rounded-full w-10 h-10">
              <SkipForward className="w-5 h-5" />
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleMute}
              className={`rounded-full w-10 h-10 ${isMuted || volume === 0 ? 'text-red-500' : ''}`}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </motion.div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 px-2">
          <VolumeX className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="flex-1"
          />
          <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </Card>
  );
}
