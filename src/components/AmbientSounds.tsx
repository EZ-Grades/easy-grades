import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Volume2, 
  Cloud, 
  Waves, 
  TreePine, 
  CloudLightning, 
  Flame, 
  Radio,
  Wind
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { toast } from 'sonner@2.0.3';
import {
  getAmbientSounds,
  getUserAmbientPreferences,
  updateAmbientPreference,
  disableAllAmbientSounds,
  AmbientSound,
  UserAmbientPreference,
} from '../services/ambientSoundsService';
import { soundGenerator } from '../services/soundGenerator';

interface AmbientSoundsProps {
  className?: string;
}

interface SoundPlayer {
  sound: AmbientSound;
  audio: HTMLAudioElement | null; // Null for generated sounds
  volume: number;
  isEnabled: boolean;
  isGenerated: boolean; // True if using Web Audio API
}

export function AmbientSounds({ className }: AmbientSoundsProps) {
  const [sounds, setSounds] = useState<AmbientSound[]>([]);
  const [preferences, setPreferences] = useState<Map<string, UserAmbientPreference>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);

  const playersRef = useRef<Map<string, SoundPlayer>>(new Map());

  // Load sounds and preferences
  useEffect(() => {
    loadSoundsAndPreferences();

    return () => {
      // Cleanup: stop all sounds when component unmounts
      playersRef.current.forEach(player => {
        if (player.isGenerated) {
          soundGenerator.stopSound(player.sound.name);
        } else if (player.audio) {
          player.audio.pause();
          player.audio.src = '';
        }
      });
      playersRef.current.clear();
    };
  }, []);

  const loadSoundsAndPreferences = async () => {
    try {
      setLoading(true);

      const [soundsResult, prefsResult] = await Promise.all([
        getAmbientSounds(),
        getUserAmbientPreferences(),
      ]);

      if (soundsResult.error) throw soundsResult.error;
      if (soundsResult.data) {
        setSounds(soundsResult.data);
        initializePlayers(soundsResult.data);
      }

      if (prefsResult.data) {
        const prefsMap = new Map<string, UserAmbientPreference>();
        prefsResult.data.forEach(pref => {
          prefsMap.set(pref.ambient_sound_id, pref);
        });
        setPreferences(prefsMap);
        
        // Apply preferences to players
        prefsResult.data.forEach(pref => {
          if (pref.is_enabled) {
            toggleSound(pref.ambient_sound_id, true);
          }
          setSoundVolume(pref.ambient_sound_id, pref.volume);
        });
      }
    } catch (err: any) {
      console.error('Error loading ambient sounds:', err);
      // Don't show toast for missing audio files - they're optional
    } finally {
      setLoading(false);
    }
  };

  const initializePlayers = (soundsList: AmbientSound[]) => {
    soundsList.forEach(sound => {
      if (!playersRef.current.has(sound.id)) {
        // Check if this sound should use Web Audio API generation
        const generatedSounds = ['whitenoise', 'brownnoise', 'pinknoise', 'rain', 'ocean', 'forest', 'fireplace', 'thunder'];
        const isGenerated = generatedSounds.includes(sound.name);
        
        if (isGenerated) {
          // Use Web Audio API - no HTMLAudioElement needed
          playersRef.current.set(sound.id, {
            sound,
            audio: null,
            volume: sound.default_volume || 50,
            isEnabled: false,
            isGenerated: true,
          });
          return;
        }
        
        // For non-generated sounds, check for valid URLs
        if (!sound.audio_url || sound.audio_url.trim() === '' || 
            sound.audio_url === 'placeholder' || 
            !sound.audio_url.startsWith('http')) {
          console.log(`Skipping sound with placeholder URL: ${sound.display_name}`);
          return;
        }
        
        const audio = new Audio(sound.audio_url);
        audio.loop = true;
        audio.volume = sound.default_volume / 100;
        
        // Add silent error handling
        audio.addEventListener('error', () => {
          console.log(`Could not load audio for: ${sound.display_name}`);
        });

        playersRef.current.set(sound.id, {
          sound,
          audio,
          volume: sound.default_volume,
          isEnabled: false,
          isGenerated: false,
        });
      }
    });
  };

  const toggleSound = async (soundId: string) => {
    const player = playersRef.current.get(soundId);
    if (!player) return;

    try {
      // If this sound is already playing, stop it
      if (activeSoundId === soundId) {
        if (player.isGenerated) {
          soundGenerator.stopSound(player.sound.name);
        } else if (player.audio) {
          player.audio.pause();
        }
        player.isEnabled = false;
        setActiveSoundId(null);
        
        // Update in database
        await updateAmbientPreference(soundId, { is_enabled: false });
        
        // Update local state
        const pref = preferences.get(soundId);
        if (pref) {
          setPreferences(new Map(preferences.set(soundId, { ...pref, is_enabled: false })));
        }
        return;
      }

      // Stop the currently active sound
      if (activeSoundId) {
        const activePlayer = playersRef.current.get(activeSoundId);
        if (activePlayer) {
          if (activePlayer.isGenerated) {
            soundGenerator.stopSound(activePlayer.sound.name);
          } else if (activePlayer.audio) {
            activePlayer.audio.pause();
          }
          activePlayer.isEnabled = false;
          
          // Update previous sound in database
          await updateAmbientPreference(activeSoundId, { is_enabled: false });
          
          // Update local state
          const activePref = preferences.get(activeSoundId);
          if (activePref) {
            setPreferences(new Map(preferences.set(activeSoundId, { ...activePref, is_enabled: false })));
          }
        }
      }

      // Start the new sound
      if (player.isGenerated) {
        try {
          await soundGenerator.playSound(player.sound.name, player.volume / 100);
          player.isEnabled = true;
        } catch (genErr: any) {
          console.warn('Could not generate sound:', player.sound.display_name, genErr.message);
          toast.error(`Could not play ${player.sound.display_name}`);
          return;
        }
      } else {
        if (!player.audio || !player.audio.src || player.audio.src === window.location.href) {
          console.warn('Invalid audio source for sound:', player.sound.display_name);
          return;
        }
        
        try {
          await player.audio.play();
          player.isEnabled = true;
        } catch (playErr: any) {
          console.warn('Could not play sound:', player.sound.display_name, playErr.name);
          return;
        }
      }

      setActiveSoundId(soundId);

      // Update in database
      await updateAmbientPreference(soundId, { is_enabled: true });

      // Update local state
      const pref = preferences.get(soundId);
      if (pref) {
        setPreferences(new Map(preferences.set(soundId, { ...pref, is_enabled: true })));
      } else {
        const newPref: Partial<UserAmbientPreference> = {
          ambient_sound_id: soundId,
          volume: player.volume,
          is_enabled: true,
        };
        setPreferences(new Map(preferences.set(soundId, newPref as UserAmbientPreference)));
      }
    } catch (err: any) {
      console.error('Error toggling sound:', err);
    }
  };

  const setSoundVolume = (soundId: string, volume: number) => {
    const player = playersRef.current.get(soundId);
    if (!player) return;

    player.volume = volume;
    
    if (player.isGenerated) {
      soundGenerator.setVolume(player.sound.name, volume / 100);
    } else if (player.audio) {
      player.audio.volume = volume / 100;
    }
  };

  const handleVolumeChange = async (soundId: string, newVolume: number[]) => {
    const volume = newVolume[0];
    setSoundVolume(soundId, volume);

    try {
      // Update in database
      await updateAmbientPreference(soundId, { volume });

      // Update local state
      const pref = preferences.get(soundId);
      if (pref) {
        setPreferences(new Map(preferences.set(soundId, { ...pref, volume })));
      }
    } catch (err: any) {
      console.error('Error updating volume:', err);
    }
  };



  const isEnabled = (soundId: string) => {
    return preferences.get(soundId)?.is_enabled || false;
  };

  const getVolume = (soundId: string) => {
    return preferences.get(soundId)?.volume || playersRef.current.get(soundId)?.volume || 50;
  };

  // Map sound names to minimalist icons
  const getSoundIcon = (soundName: string) => {
    const iconMap: Record<string, any> = {
      rain: Cloud,
      ocean: Waves,
      forest: TreePine,
      thunder: CloudLightning,
      fireplace: Flame,
      whitenoise: Radio,
      brownnoise: Radio,
      pinknoise: Radio,
    };
    
    const IconComponent = iconMap[soundName] || Wind;
    return <IconComponent className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <Card className={`glass-card-enhanced border-0 ${className}`}>
        <CardContent className="py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading ambient sounds...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-card-enhanced border-0 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Ambient Sounds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sounds.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="text-4xl mb-4">🎵</div>
            <p className="text-sm text-muted-foreground mb-4">
              Ambient sounds are not configured yet
            </p>
            <div className="text-xs text-muted-foreground bg-muted/30 p-4 rounded-lg space-y-2 text-left">
              <p className="font-medium mb-2">To enable ambient sounds:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Upload audio files to Supabase Storage</li>
                <li>Run the SEED_AMBIENT_SOUNDS.sql script</li>
                <li>Update URLs in the database to point to your audio files</li>
              </ol>
              <p className="mt-3 pt-3 border-t border-border">
                💡 For now, you can use visual ambiences and background environments in fullscreen focus mode
              </p>
            </div>
          </div>
        ) : (
          <>
            {sounds.map((sound, index) => (
              <motion.button
                key={sound.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => toggleSound(sound.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                  activeSoundId === sound.id
                    ? 'gradient-primary glow-primary shadow-lg'
                    : 'glassmorphism hover:glow-primary hover:scale-[1.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getSoundIcon(sound.name)}
                  <span className="text-sm">{sound.display_name}</span>
                </div>
                {activeSoundId === sound.id && (
                  <Volume2 className="w-4 h-4 animate-pulse" />
                )}
              </motion.button>
            ))}
            
            {activeSoundId && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 border-t border-border/50"
              >
                <div className="flex items-center gap-3 px-2">
                  <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <Slider
                    value={[getVolume(activeSoundId)]}
                    onValueChange={(value) => handleVolumeChange(activeSoundId, value)}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {getVolume(activeSoundId)}%
                  </span>
                </div>
              </motion.div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
