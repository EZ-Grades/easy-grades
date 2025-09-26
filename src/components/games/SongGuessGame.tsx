import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LuxuryButton } from '../LuxuryButton';
import { GlassCard } from '../GlassCard';
import { CheckCircle, RotateCcw, Play, Pause, Music, ArrowRight } from 'lucide-react';

interface SongGuessGameProps {
  onComplete: () => void;
}

interface Song {
  title: string;
  artist: string;
  genre: string;
  hint: string;
  options: string[];
}

const songs: Song[] = [
  {
    title: "Bohemian Rhapsody",
    artist: "Queen",
    genre: "Rock",
    hint: "Famous rock opera with multiple sections",
    options: ["Bohemian Rhapsody", "Stairway to Heaven", "Hotel California", "Sweet Child O' Mine"]
  },
  {
    title: "Billie Jean",
    artist: "Michael Jackson",
    genre: "Pop",
    hint: "King of Pop's signature moonwalk song",
    options: ["Beat It", "Billie Jean", "Thriller", "Smooth Criminal"]
  },
  {
    title: "Imagine",
    artist: "John Lennon",
    genre: "Rock",
    hint: "Peaceful song about world unity",
    options: ["Yesterday", "Hey Jude", "Imagine", "Let It Be"]
  },
  {
    title: "Like a Rolling Stone",
    artist: "Bob Dylan",
    genre: "Folk Rock",
    hint: "Folk legend's electric breakthrough",
    options: ["Blowin' in the Wind", "Like a Rolling Stone", "The Times They Are a-Changin'", "Mr. Tambourine Man"]
  },
  {
    title: "What's Going On",
    artist: "Marvin Gaye",
    genre: "Soul",
    hint: "Social commentary soul classic",
    options: ["I Heard It Through the Grapevine", "What's Going On", "Let's Get It On", "Sexual Healing"]
  },
  {
    title: "Purple Haze",
    artist: "Jimi Hendrix",
    genre: "Rock",
    hint: "Psychedelic guitar masterpiece",
    options: ["Purple Haze", "All Along the Watchtower", "Hey Joe", "Voodoo Child"]
  }
];

export function SongGuessGame({ onComplete }: SongGuessGameProps) {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState(0);

  const currentSong = songs[currentSongIndex];
  const isCorrect = selectedAnswer === currentSong.title;
  const maxPlayTime = 30; // 30 seconds

  useEffect(() => {
    // Reset states when song changes
    setSelectedAnswer('');
    setShowResult(false);
    setIsPlaying(false);
    setPlayTime(0);
  }, [currentSongIndex]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && playTime < maxPlayTime) {
      interval = setInterval(() => {
        setPlayTime(prev => {
          if (prev >= maxPlayTime) {
            setIsPlaying(false);
            return maxPlayTime;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playTime]);

  const togglePlayback = () => {
    if (playTime >= maxPlayTime) {
      // Reset and play again
      setPlayTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    setIsPlaying(false);
    
    if (answer === currentSong.title) {
      // Calculate score based on how quickly they guessed
      const timeBonus = Math.max(0, maxPlayTime - playTime);
      const points = Math.round(10 + (timeBonus / maxPlayTime) * 10); // Base 10 + up to 10 bonus
      setScore(score + points);
    }
  };

  const nextSong = () => {
    if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
    } else {
      setGameComplete(true);
      setTimeout(onComplete, 1500);
    }
  };

  const resetGame = () => {
    setCurrentSongIndex(0);
    setSelectedAnswer('');
    setShowResult(false);
    setScore(0);
    setGameComplete(false);
    setIsPlaying(false);
    setPlayTime(0);
  };

  const getPlaybackDisplay = () => {
    if (playTime >= maxPlayTime) return "Song finished";
    return isPlaying ? `Playing... ${maxPlayTime - playTime}s left` : `Ready to play (${maxPlayTime}s)`;
  };

  return (
    <GlassCard className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Song Guessing Game</h2>
        <p className="text-muted-foreground mb-2">Listen to the song clip and guess the title</p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <span>Song {currentSongIndex + 1}/{songs.length}</span>
          <span>Score: {score}</span>
        </div>
      </div>

      {/* Song Player */}
      <div className="mb-8">
        <div className="glass-card p-6 text-center mb-6">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
            <Music className="w-12 h-12 text-white" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">Mystery Song #{currentSongIndex + 1}</h3>
          <p className="text-muted-foreground mb-4">Genre: {currentSong.genre}</p>
          
          {/* Playback Controls */}
          <div className="mb-4">
            <LuxuryButton
              onClick={togglePlayback}
              icon={isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              className="mb-2"
            >
              {playTime >= maxPlayTime ? 'Play Again' : isPlaying ? 'Pause' : 'Play Song'}
            </LuxuryButton>
            
            <p className="text-sm text-muted-foreground">
              {getPlaybackDisplay()}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <motion.div
              className="bg-primary-solid h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(playTime / maxPlayTime) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Hint */}
          <div className="glass-card p-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Hint:</span> {currentSong.hint}
            </p>
          </div>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {currentSong.options.map((option, index) => {
            let buttonClass = 'glass-card border-border hover:glow-primary';
            
            if (showResult) {
              if (option === currentSong.title) {
                buttonClass = 'bg-green-500/20 border-green-500 text-green-500 glow-green';
              } else if (option === selectedAnswer && option !== currentSong.title) {
                buttonClass = 'bg-red-500/20 border-red-500 text-red-500';
              } else {
                buttonClass = 'glass-card border-border opacity-50';
              }
            }

            return (
              <motion.button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showResult}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${buttonClass}`}
                whileHover={!showResult ? { scale: 1.02 } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
              >
                <span className="font-medium">{option}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Result Message */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            {isCorrect ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-green-500">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-semibold">Correct!</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  "{currentSong.title}" by {currentSong.artist}
                </p>
                <p className="text-sm text-green-500 font-medium">
                  +{Math.round(10 + ((maxPlayTime - playTime) / maxPlayTime) * 10)} points
                  {playTime < 10 && " (Quick guess bonus!)"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-semibold text-red-500">Not quite right!</p>
                <p className="text-sm text-muted-foreground">
                  The answer was: "{currentSong.title}" by {currentSong.artist}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Game Complete */}
      {gameComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-6"
        >
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-green-500">All Songs Complete!</h3>
          <p className="text-muted-foreground">Final Score: {score} points</p>
          <p className="text-sm text-muted-foreground">
            {score >= songs.length * 15 ? "Music Master! 🎵" : 
             score >= songs.length * 10 ? "Great job! 🎶" : 
             "Keep listening to more music! 🎧"}
          </p>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        {showResult && !gameComplete && (
          <LuxuryButton
            variant="primary"
            onClick={nextSong}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Next Song
          </LuxuryButton>
        )}
        
        <LuxuryButton
          variant="outline"
          onClick={resetGame}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          New Game
        </LuxuryButton>
      </div>
    </GlassCard>
  );
}