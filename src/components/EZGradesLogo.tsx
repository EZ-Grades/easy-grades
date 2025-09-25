import { motion } from 'motion/react';

interface EZGradesLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

export function EZGradesLogo({ size = 'md', className = '', animated = true }: EZGradesLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const LogoSVG = () => (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClasses[size]} ${className}`}
    >
      <defs>
        {/* Primary gradient matching the app's design system */}
        <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7D4AE1" />
          <stop offset="100%" stopColor="#5B33C9" />
        </linearGradient>
        
        {/* Secondary accent gradient */}
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3AB0A0" />
          <stop offset="100%" stopColor="#2B7D7D" />
        </linearGradient>

        {/* Highlight gradient */}
        <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFCB6B" />
          <stop offset="100%" stopColor="#E6A157" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background circle with glassmorphism effect */}
      <circle
        cx="16"
        cy="16"
        r="15"
        fill="url(#primaryGradient)"
        opacity="0.1"
        stroke="url(#primaryGradient)"
        strokeWidth="0.5"
        strokeOpacity="0.3"
      />

      {/* Main "E" with academic styling */}
      <g transform="translate(6, 8)">
        {/* E letter - main structure */}
        <path
          d="M2 2 L2 14 L14 14 M2 2 L12 2 M2 8 L10 8"
          stroke="url(#primaryGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#glow)"
        />
        
        {/* Academic accent - graduation cap element */}
        <g transform="translate(12, 0)">
          <path
            d="M0 3 L3 1 L6 3 L3 5 Z"
            fill="url(#accentGradient)"
            opacity="0.9"
          />
          <rect
            x="2.5"
            y="3"
            width="1"
            height="4"
            fill="url(#accentGradient)"
            opacity="0.8"
          />
          {/* Tassel */}
          <circle
            cx="3.5"
            cy="7.5"
            r="0.8"
            fill="url(#highlightGradient)"
          />
        </g>
      </g>

      {/* Grade/Achievement stars */}
      <g opacity="0.7">
        <path
          d="M25 10 L26 12 L28 12 L26.5 13.5 L27 16 L25 15 L23 16 L23.5 13.5 L22 12 L24 12 Z"
          fill="url(#highlightGradient)"
          transform="scale(0.5)"
        />
        <path
          d="M24 22 L25 24 L27 24 L25.5 25.5 L26 28 L24 27 L22 28 L22.5 25.5 L21 24 L23 24 Z"
          fill="url(#accentGradient)"
          transform="scale(0.4)"
        />
      </g>

      {/* Subtle progress arc */}
      <path
        d="M 8 26 A 10 10 0 0 1 24 26"
        stroke="url(#primaryGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );

  if (animated) {
    return (
      <motion.div
        whileHover={{ 
          scale: 1.05,
          filter: "drop-shadow(0 0 8px rgba(125, 74, 225, 0.4))"
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="inline-block"
      >
        <LogoSVG />
      </motion.div>
    );
  }

  return <LogoSVG />;
}