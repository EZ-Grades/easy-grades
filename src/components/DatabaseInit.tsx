import { useState } from 'react';
import { Button } from './ui/button';
import { GlassCard } from './GlassCard';
import { Database, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';

export function DatabaseInit() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initStatus, setInitStatus] = useState<{
    tables: boolean;
    seedData: boolean;
  }>({ tables: false, seedData: false });

  const checkTablesExist = async () => {
    try {
      // Check if tracks table exists
      const { data, error } = await supabase
        .from('tracks')
        .select('id')
        .limit(1);
      
      return !error;
    } catch (error) {
      return false;
    }
  };

  const seedTracks = async () => {
    try {
      const tracks = [
        { name: 'Peaceful Forest', mood: 'calm', genre: 'ambient', description: 'Gentle sounds of a forest with birds chirping', url: 'https://example.com/forest.mp3' },
        { name: 'Lofi Study Beat', mood: 'focus', genre: 'lofi', description: 'Relaxing lofi beats perfect for studying', url: 'https://example.com/lofi.mp3' },
        { name: 'Ocean Waves', mood: 'calm', genre: 'ambient', description: 'Soothing ocean waves for relaxation', url: 'https://example.com/ocean.mp3' },
        { name: 'Classical Focus', mood: 'focus', genre: 'classical', description: 'Classical music to enhance concentration', url: 'https://example.com/classical.mp3' },
        { name: 'Energizing Beats', mood: 'energizing', genre: 'electronic', description: 'Upbeat music to boost energy levels', url: 'https://example.com/energizing.mp3' }
      ];

      const { error } = await supabase
        .from('tracks')
        .insert(tracks);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error seeding tracks:', error);
      return false;
    }
  };

  const seedAmbientSounds = async () => {
    try {
      const sounds = [
        { name: 'Rain', default_volume: 50, icon: '🌧️', audio_url: 'https://example.com/rain.mp3' },
        { name: 'Forest', default_volume: 40, icon: '🌲', audio_url: 'https://example.com/forest.mp3' },
        { name: 'Ocean', default_volume: 45, icon: '🌊', audio_url: 'https://example.com/ocean.mp3' },
        { name: 'Coffee Shop', default_volume: 35, icon: '☕', audio_url: 'https://example.com/coffee.mp3' },
        { name: 'White Noise', default_volume: 30, icon: '⚪', audio_url: 'https://example.com/whitenoise.mp3' },
        { name: 'Fireplace', default_volume: 40, icon: '🔥', audio_url: 'https://example.com/fireplace.mp3' }
      ];

      const { error } = await supabase
        .from('ambient_sounds')
        .insert(sounds);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error seeding ambient sounds:', error);
      return false;
    }
  };

  const seedAmbienceModes = async () => {
    try {
      const modes = [
        { name: 'Forest Retreat', description: 'Immerse yourself in a peaceful forest setting', icon: '🌲', bg_class: 'bg-gradient-to-br from-green-400 to-green-600' },
        { name: 'Ocean Paradise', description: 'Study by the calming ocean waves', icon: '🌊', bg_class: 'bg-gradient-to-br from-blue-400 to-blue-600' },
        { name: 'Mountain Peak', description: 'Focus at the top of a serene mountain', icon: '⛰️', bg_class: 'bg-gradient-to-br from-gray-400 to-gray-600' },
        { name: 'Cozy Library', description: 'Traditional library atmosphere', icon: '📚', bg_class: 'bg-gradient-to-br from-amber-400 to-amber-600' },
        { name: 'Space Station', description: 'Study among the stars', icon: '🚀', bg_class: 'bg-gradient-to-br from-purple-400 to-purple-600' },
        { name: 'Minimal Focus', description: 'Clean, distraction-free environment', icon: '⚪', bg_class: 'bg-gradient-to-br from-gray-200 to-gray-300' }
      ];

      const { error } = await supabase
        .from('ambience_modes')
        .insert(modes);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error seeding ambience modes:', error);
      return false;
    }
  };

  const initializeDatabase = async () => {
    setIsInitializing(true);
    
    try {
      // Check if tables exist
      const tablesExist = await checkTablesExist();
      setInitStatus(prev => ({ ...prev, tables: tablesExist }));

      if (!tablesExist) {
        toast.error('Database tables not found. Please run the Supabase schema setup first.');
        setIsInitializing(false);
        return;
      }

      // Seed data
      toast.info('Initializing database with seed data...');
      
      const tracksSeed = await seedTracks();
      const soundsSeed = await seedAmbientSounds();
      const modesSeed = await seedAmbienceModes();

      if (tracksSeed && soundsSeed && modesSeed) {
        setInitStatus(prev => ({ ...prev, seedData: true }));
        toast.success('Database initialized successfully!');
      } else {
        toast.warning('Some seed data may have failed to load, but database is functional');
      }

    } catch (error) {
      console.error('Database initialization error:', error);
      toast.error('Failed to initialize database');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <GlassCard className="max-w-md">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Database className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold">Database Setup</h3>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Tables</span>
            {initStatus.tables ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-orange-500" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <span>Seed Data</span>
            {initStatus.seedData ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-orange-500" />
            )}
          </div>
        </div>

        <Button
          onClick={initializeDatabase}
          disabled={isInitializing}
          className="w-full"
        >
          {isInitializing ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Initializing...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Initialize Database
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          This will populate the database with sample tracks, ambient sounds, and ambience modes.
        </p>
      </div>
    </GlassCard>
  );
}