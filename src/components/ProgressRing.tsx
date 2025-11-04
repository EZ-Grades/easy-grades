import { motion } from 'motion/react';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  gradient?: 'primary' | 'secondary' | 'highlight';
  showBackground?: boolean;
}

export function ProgressRing({ 
  progress, 
  size = 160, 
  strokeWidth = 6, 
  className = '',
  children,
  gradient = 'primary',
  showBackground = true
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const gradientId = `gradient-${gradient}-${Math.random().toString(36).substr(2, 9)}`;

  const gradientColors = {
    primary: ['#6BA5AF', '#5A9AA7'],
    secondary: ['#2C4A6C', '#1E3A5F'],
    highlight: ['#7CB3BD', '#6BA5AF']
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors[gradient][0]} />
            <stop offset="100%" stopColor={gradientColors[gradient][1]} />
          </linearGradient>
        </defs>
        
        {/* Background ring */}
        {showBackground && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted/20 dark:text-muted/10"
          />
        )}
        
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="butt"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.6, ease: "easeOut" }}
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
