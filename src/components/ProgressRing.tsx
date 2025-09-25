import { motion } from 'motion/react';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  gradient?: 'primary' | 'secondary' | 'highlight';
}

export function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8, 
  className = '',
  children,
  gradient = 'primary'
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const gradientId = `gradient-${gradient}-${Math.random().toString(36).substr(2, 9)}`;

  const gradientColors = {
    primary: ['#7D4AE1', '#5B33C9'],
    secondary: ['#3AB0A0', '#2B7D7D'],
    highlight: ['#FFCB6B', '#E6A157']
  };

  // Dark mode adjustments
  const darkGradientColors = {
    primary: ['#5B6EE1', '#3B4FC9'],
    secondary: ['#2ED7B0', '#1F9E8F'],
    highlight: ['#FFD369', '#E6A157']
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors[gradient][0]} />
            <stop offset="100%" stopColor={gradientColors[gradient][1]} />
          </linearGradient>
        </defs>
        
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted opacity-20"
        />
        
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="drop-shadow-lg"
          style={{
            filter: `drop-shadow(0 0 8px ${gradientColors[gradient][0]}40)`
          }}
        />
      </svg>
      
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}