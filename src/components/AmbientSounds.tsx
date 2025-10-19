import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
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

interface AmbientSoundsProps {
  className?: string;
}

interface SoundPlayer {
  sound: AmbientSound;
  audio: HTMLAudioElement;
  volume: number;
  isEnabled: boolean;
}

export function AmbientSounds({ className }: AmbientSoundsProps) {
  const [sounds, setSounds] = useState<AmbientSound[]>([]);
  const [preferences, setPreferences] = useState<Map<string, UserAmbientPreference>>(new Map());
  const [loading, setLoading] = useState(true);
  const [masterMuted, setMasterMuted] = useState(false);

  const playersRef = useRef<Map<string, SoundPlayer>>(new Map());

  // Load sounds and preferences
  useEffect(() => {
    loadSoundsAndPreferences();

    return () => {
      // Cleanup: stop all sounds when component unmounts
      playersRef.current.forEach(player => {
        player.audio.pause();
        player.audio.src = '';
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
      toast.error('Failed to load ambient sounds');
    } finally {
      setLoading(false);
    }
  };

  const initializePlayers = (soundsList: AmbientSound[]) => {
    soundsList.forEach(sound => {
      if (!playersRef.current.has(sound.id)) {
        const audio = new Audio(sound.audio_url);
        audio.loop = true;
        audio.volume = sound.default_volume / 100;
        
        // Add error handling
        audio.addEventListener('error', () => {
          console.error(`Error loading sound: ${sound.display_name}`);
          toast.error(`Failed to load: ${sound.display_name}`);
        });

        playersRef.current.set(sound.id, {
          sound,
          audio,
          volume: sound.default_volume,
          isEnabled: false,
        });
      }
    });
  };

  const toggleSound = async (soundId: string, enabled: boolean) => {
    const player = playersRef.current.get(soundId);
    if (!player) return;

    try {
      if (enabled && !masterMuted) {
        await player.audio.play();
        player.isEnabled = true;
      } else {
        player.audio.pause();
        player.isEnabled = false;
      }

      // Update in database
      await updateAmbientPreference(soundId, { is_enabled: enabled });

      // Update local state
      const pref = preferences.get(soundId);
      if (pref) {
        setPreferences(new Map(preferences.set(soundId, { ...pref, is_enabled: enabled })));
      } else {
        const newPref: Partial<UserAmbientPreference> = {
          ambient_sound_id: soundId,
          volume: player.volume,
          is_enabled: enabled,
        };
        setPreferences(new Map(preferences.set(soundId, newPref as UserAmbientPreference)));
      }
    } catch (err: any) {
      console.error('Error toggling sound:', err);
      toast.error('Failed to toggle sound');
    }
  };

  const setSoundVolume = (soundId: string, volume: number) => {
    const player = playersRef.current.get(soundId);
    if (!player) return;

    player.volume = volume;
    player.audio.volume = masterMuted ? 0 : volume / 100;
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

  const toggleMasterMute = () => {
    const newMuted = !masterMuted;
    setMasterMuted(newMuted);

    playersRef.current.forEach(player => {
      if (player.isEnabled) {
        player.audio.volume = newMuted ? 0 : player.volume / 100;
      }
    });

    toast.success(newMuted ? 'All sounds muted' : 'Sounds unmuted');
  };

  const disableAll = async () => {
    try {
      playersRef.current.forEach(player => {
        player.audio.pause();
        player.isEnabled = false;
      });

      await disableAllAmbientSounds();

      // Update local state
      const newPrefs = new Map(preferences);
      newPrefs.forEach((pref, key) => {
        newPrefs.set(key, { ...pref, is_enabled: false });
      });
      setPreferences(newPrefs);

      toast.success('All sounds disabled');
    } catch (err: any) {
      console.error('Error disabling all sounds:', err);
      toast.error('Failed to disable all sounds');
    }
  };

  const isEnabled = (soundId: string) => {
    return preferences.get(soundId)?.is_enabled || false;
  };

  const getVolume = (soundId: string) => {
    return preferences.get(soundId)?.volume || playersRef.current.get(soundId)?.volume || 50;
  };

  if (loading) {
    return (
      <Card className={`glassmorphism border-0 ${className}`}>
        <CardContent className="py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading ambient sounds...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glassmorphism border-0 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Ambient Sounds
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMasterMute}
            >
              {masterMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={disableAll}
            >
              Stop All
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sounds.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No ambient sounds available
          </p>
        ) : (
          sounds.map((sound, index) => (
            <motion.div
              key={sound.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant={isEnabled(sound.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleSound(sound.id, !isEnabled(sound.id))}
                    className={isEnabled(sound.id) ? 'gradient-primary' : ''}
                  >
                    {isEnabled(sound.id) ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <div>
                    <p className="font-medium text-sm flex items-center gap-2">
                      {sound.icon && <span>{sound.icon}</span>}
                      {sound.display_name}
                    </p>
                    {sound.description && (
                      <p className="text-xs text-muted-foreground">{sound.description}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {isEnabled(sound.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 pl-12"
                >
                  <VolumeX className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <Slider
                    value={[getVolume(sound.id)]}
                    onValueChange={(value) => handleVolumeChange(sound.id, value)}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <Volume2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {getVolume(sound.id)}%
                  </span>
                </motion.div>
              )}
            </motion.div>
          ))
        )}

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Mix and match sounds to create your perfect focus environment
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
