import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface LuxuryBadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'highlight' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  shimmer?: boolean;
  icon?: ReactNode;
  count?: number;
}

export function LuxuryBadge({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  shimmer = false,
  icon,
  count
}: LuxuryBadgeProps) {
  const baseClasses = `
    inline-flex items-center gap-1.5 rounded-full font-medium
    transition-all duration-300 relative overflow-hidden
  `;

  const variantClasses = {
    primary: 'gradient-primary text-white shadow-lg',
    secondary: 'gradient-secondary text-white shadow-lg',
    highlight: 'gradient-highlight text-gray-900 shadow-lg',
    success: 'bg-green-500 text-white shadow-lg',
    warning: 'bg-yellow-500 text-gray-900 shadow-lg',
    error: 'gradient-error text-white shadow-lg'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <motion.div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 25,
        duration: 0.3 
      }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Shimmer effect */}
      {shimmer && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ 
            repeat: Infinity, 
            duration: 2, 
            ease: 'linear',
            repeatDelay: 1 
          }}
        />
      )}
      
      <div className="relative flex items-center gap-1.5">
        {icon && <span className="flex items-center">{icon}</span>}
        {children}
        {count !== undefined && count > 0 && (
          <motion.span
            className="bg-white/20 rounded-full px-1.5 py-0.5 text-xs font-bold min-w-[1.25rem] text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={count}
          >
            {count > 99 ? '99+' : count}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}