import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FlipDigitProps {
  value: string;
  isColon?: boolean;
}

function FlipDigit({ value, isColon = false }: FlipDigitProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value !== currentValue) {
      setPreviousValue(currentValue);
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        setCurrentValue(value);
        setIsAnimating(false);
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [value, currentValue]);

  if (isColon) {
    return (
      <div className="flex flex-col gap-4 justify-center mx-3">
        <div className="w-3 h-3 rounded-full bg-white/90 shadow-lg" />
        <div className="w-3 h-3 rounded-full bg-white/90 shadow-lg" />
      </div>
    );
  }

  return (
    <div 
      className="relative"
      style={{ 
        width: '100px',
        height: '140px',
        perspective: '1000px'
      }}
    >
      {/* Top Half - Static (shows top half of current digit) */}
      <div 
        className="absolute inset-x-0 top-0 overflow-hidden"
        style={{ height: '50%' }}
      >
        <div className="relative w-full h-full bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-t-3xl border-2 border-b-0 border-gray-700/50 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent" />
          {/* Container is FULL height, positioned to show only TOP half of digit */}
          <div 
            className="absolute left-0 right-0 flex items-center justify-center"
            style={{ 
              top: 0,
              height: '140px' // Double the half height so digit is centered across both halves
            }}
          >
            <span 
              className="text-8xl text-white tracking-tight"
              style={{ 
                fontFamily: "'Orbitron', 'SF Mono', monospace",
                fontWeight: '600',
                lineHeight: '1',
                textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                WebkitFontSmoothing: 'antialiased'
              }}
            >
              {currentValue}
            </span>
          </div>
        </div>
      </div>

      {/* Top Half - Animated (flips down showing top half of previous digit) */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            key={`top-${previousValue}`}
            className="absolute inset-x-0 top-0 overflow-hidden"
            style={{ 
              height: '50%',
              transformOrigin: '50% 100%',
              transformStyle: 'preserve-3d',
              zIndex: 30
            }}
            initial={{ rotateX: 0 }}
            animate={{ rotateX: -180 }}
            transition={{ 
              duration: 0.6,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            <div className="relative w-full h-full bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-t-3xl border-2 border-b-0 border-gray-700/50 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent" />
              <div 
                className="absolute left-0 right-0 flex items-center justify-center"
                style={{ 
                  top: 0,
                  height: '140px'
                }}
              >
                <span 
                  className="text-8xl text-white tracking-tight"
                  style={{ 
                    fontFamily: "'Orbitron', 'SF Mono', monospace",
                    fontWeight: '600',
                    lineHeight: '1',
                    textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                    WebkitFontSmoothing: 'antialiased'
                  }}
                >
                  {previousValue}
                </span>
              </div>
              <motion.div 
                className="absolute inset-0 bg-black/50 rounded-t-3xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Divider */}
      <div 
        className="absolute inset-x-0 bg-black/90 shadow-2xl"
        style={{ 
          top: '50%',
          height: '4px',
          transform: 'translateY(-50%)',
          zIndex: 40
        }}
      />

      {/* Bottom Half - Static (shows bottom half of current digit) */}
      <div 
        className="absolute inset-x-0 bottom-0 overflow-hidden"
        style={{ height: '50%' }}
      >
        <div className="relative w-full h-full bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-b-3xl border-2 border-t-0 border-gray-700/50 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tl from-white/[0.04] to-transparent" />
          {/* Container is FULL height, positioned to show only BOTTOM half of digit */}
          <div 
            className="absolute left-0 right-0 flex items-center justify-center"
            style={{ 
              bottom: 0,
              height: '140px' // Double the half height
            }}
          >
            <span 
              className="text-8xl text-white tracking-tight"
              style={{ 
                fontFamily: "'Orbitron', 'SF Mono', monospace",
                fontWeight: '600',
                lineHeight: '1',
                textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                WebkitFontSmoothing: 'antialiased'
              }}
            >
              {currentValue}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Half - Animated (flips up showing bottom half of new digit) */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            key={`bottom-${currentValue}`}
            className="absolute inset-x-0 bottom-0 overflow-hidden"
            style={{ 
              height: '50%',
              transformOrigin: '50% 0%',
              transformStyle: 'preserve-3d',
              zIndex: 20
            }}
            initial={{ rotateX: 180 }}
            animate={{ rotateX: 0 }}
            transition={{ 
              duration: 0.6,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            <div className="relative w-full h-full bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-b-3xl border-2 border-t-0 border-gray-700/50 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tl from-white/[0.04] to-transparent" />
              <div 
                className="absolute left-0 right-0 flex items-center justify-center"
                style={{ 
                  bottom: 0,
                  height: '140px'
                }}
              >
                <span 
                  className="text-8xl text-white tracking-tight"
                  style={{ 
                    fontFamily: "'Orbitron', 'SF Mono', monospace",
                    fontWeight: '600',
                    lineHeight: '1',
                    textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                    WebkitFontSmoothing: 'antialiased'
                  }}
                >
                  {currentValue}
                </span>
              </div>
              <motion.div 
                className="absolute inset-0 bg-black/50 rounded-b-3xl"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FlipClockProps {
  time: string;
}

export function FlipClock({ time }: FlipClockProps) {
  const chars = time.split('');
  
  return (
    <motion.div 
      className="flex items-center justify-center select-none"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {chars.map((char, idx) => (
        <FlipDigit 
          key={idx}
          value={char}
          isColon={char === ':'}
        />
      ))}
    </motion.div>
  );
}
