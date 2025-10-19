import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { toast } from 'sonner@2.0.3';

interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  url?: string;
}

const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'rain', name: 'Rain', icon: '🌧️' },
  { id: 'fire', name: 'Fire', icon: '🔥' },
  { id: 'waves', name: 'Waves', icon: '🌊' },
  { id: 'birds', name: 'Birds', icon: '🐦' },
  { id: 'wind', name: 'Wind', icon: '💨' },
  { id: 'river', name: 'River Flowing', icon: '🏞️' },
  { id: 'forest', name: 'Forest', icon: '🌲' },
  { id: 'thunder', name: 'Thunder', icon: '⛈️' },
];

export function AmbientSoundsPlayer() {
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize volumes from localStorage
  useEffect(() => {
    const savedVolumes: Record<string, number> = {};
    AMBIENT_SOUNDS.forEach(sound => {
      const saved = localStorage.getItem(`ambient_volume_${sound.id}`);
      savedVolumes[sound.id] = saved ? parseInt(saved) : 50;
    });
    setVolumes(savedVolumes);

    // Load last playing sound
    const lastPlaying = localStorage.getItem('ambient_last_playing');
    if (lastPlaying) {
      setPlayingSound(lastPlaying);
    }
  }, []);

  // Handle audio playback
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }

    const audio = audioRef.current;

    if (playingSound) {
      // In a real app, you would fetch the audio URL from the database
      // For now, we'll use placeholder URLs or silence
      // audio.src = `/sounds/${playingSound}.mp3`;
      
      const volume = volumes[playingSound] || 50;
      audio.volume = volume / 100;
      
      // Simulate playing (in real app, this would play actual audio)
      // audio.play().catch(err => {
      //   console.error('Error playing audio:', err);
      //   toast.error('Failed to play ambient sound');
      // });

      // Save to localStorage
      localStorage.setItem('ambient_last_playing', playingSound);
    } else {
      // audio.pause();
      localStorage.removeItem('ambient_last_playing');
    }

    return () => {
      // Cleanup
    };
  }, [playingSound, volumes]);

  const toggleSound = (soundId: string) => {
    if (playingSound === soundId) {
      setPlayingSound(null);
      toast.info('Ambient sound stopped');
    } else {
      setPlayingSound(soundId);
      toast.success(`Now playing: ${AMBIENT_SOUNDS.find(s => s.id === soundId)?.name}`);
    }
  };

  const handleVolumeChange = (soundId: string, value: number[]) => {
    const newVolume = value[0];
    setVolumes(prev => ({ ...prev, [soundId]: newVolume }));
    
    // Save to localStorage
    localStorage.setItem(`ambient_volume_${soundId}`, newVolume.toString());

    // Update audio volume if this sound is playing
    if (audioRef.current && playingSound === soundId) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AMBIENT_SOUNDS.map((sound, index) => {
          const isPlaying = playingSound === sound.id;
          const volume = volumes[sound.id] || 50;

          return (
            <motion.div
              key={sound.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className={`
                  glassmorphism p-4 cursor-pointer transition-all duration-300 relative overflow-hidden
                  ${isPlaying 
                    ? 'border-purple-500/50 bg-purple-500/10' 
                    : 'border-border hover:border-purple-500/30'
                  }
                `}
              >
                {/* Animated background for playing sound */}
                {isPlaying && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                <div className="relative z-10 space-y-3">
                  {/* Header */}
                  <div 
                    className="flex items-center justify-between"
                    onClick={() => toggleSound(sound.id)}
                  >
                    <div className="flex items-center gap-3">
                      <motion.span 
                        className="text-3xl"
                        animate={isPlaying ? {
                          scale: [1, 1.2, 1],
                        } : {}}
                        transition={{
                          duration: 2,
                          repeat: isPlaying ? Infinity : 0,
                          ease: "easeInOut"
                        }}
                      >
                        {sound.icon}
                      </motion.span>
                      <div>
                        <p className="font-medium">{sound.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {isPlaying ? 'Playing' : 'Click to play'}
                        </p>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        p-2 rounded-full transition-colors
                        ${isPlaying 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-muted text-muted-foreground hover:bg-purple-500/20'
                        }
                      `}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </motion.div>
                  </div>

                  {/* Volume Control */}
                  <div className="space-y-2" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {volume === 0 ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                        <span>Volume</span>
                      </div>
                      <span className="text-xs font-medium">{volume}%</span>
                    </div>
                    <Slider
                      value={[volume]}
                      onValueChange={(value) => handleVolumeChange(sound.id, value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {playingSound && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p>🎵 {AMBIENT_SOUNDS.find(s => s.id === playingSound)?.name} is playing</p>
          <p className="text-xs mt-1">Only one ambient sound can play at a time</p>
        </motion.div>
      )}
    </div>
  );
}
