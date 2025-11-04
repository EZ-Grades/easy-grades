import { motion } from 'motion/react';
import logoImage from '../assets/bbfed902e833d2dd6ba813007078c45ebc9903d0.png';

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

  const LogoImage = () => (
    <img
      src={logoImage}
      alt="EZ Grades Logo"
      className={`${sizeClasses[size]} ${className} rounded-full object-cover`}
    />
  );

  if (animated) {
    return (
      <motion.div
        whileHover={{ 
          scale: 1.05,
          filter: "drop-shadow(0 0 8px rgba(107, 165, 175, 0.6))"
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="inline-block"
      >
        <LogoImage />
      </motion.div>
    );
  }

  return <LogoImage />;
}