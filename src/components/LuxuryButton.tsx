import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface LuxuryButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'highlight' | 'glass' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function LuxuryButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  loading = false,
  icon,
  fullWidth = false
}: LuxuryButtonProps) {
  const baseClasses = `
    relative overflow-hidden rounded-xl font-medium transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantClasses = {
    primary: `
      gradient-primary text-white shadow-lg hover:shadow-xl hover:glow-primary
      focus:ring-primary-500 border-none
    `,
    secondary: `
      gradient-secondary text-white shadow-lg hover:shadow-xl hover:glow-secondary
      focus:ring-secondary-500 border-none
    `,
    highlight: `
      gradient-highlight text-gray-900 shadow-lg hover:shadow-xl hover:glow-highlight
      focus:ring-highlight-500 border-none
    `,
    glass: `
      glass-card hover:glow-primary text-foreground border-none
    `,
    outline: `
      border-2 border-primary-500/30 bg-transparent text-foreground
      hover:bg-primary-500/10 hover:border-primary-500 hover:glow-primary
      focus:ring-primary-500
    `
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
      
      <div className="relative flex items-center justify-center gap-2">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          icon && <span className="flex items-center">{icon}</span>
        )}
        {children}
      </div>
    </motion.button>
  );
}