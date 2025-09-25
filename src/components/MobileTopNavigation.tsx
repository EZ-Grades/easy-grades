import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { EZGradesLogo } from './EZGradesLogo';

interface User {
  id: string;
  full_name: string; // Changed from name to full_name
  email: string;
  username: string;
}

interface MobileTopNavigationProps {
  user: User;
}

export function MobileTopNavigation({ user }: MobileTopNavigationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down & past threshold
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 left-0 right-0 z-40 md:hidden"
    >
      <div className="glass-card mx-4 mt-4 rounded-2xl border-0">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 rounded-lg glass-card flex items-center justify-center glow-primary">
              <EZGradesLogo size="md" animated={true} />
            </div>
            <span className="text-gradient-primary font-semibold text-lg">EZ Grades</span>
          </motion.div>

          {/* User Profile & Theme Toggle */}
          <div className="flex items-center gap-3">
            <motion.div
              className="text-right"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm font-medium">{user.username}</p>
              <p className="text-xs text-muted-foreground">{user.full_name}</p>
            </motion.div>
            <div className="w-8 h-8 rounded-full gradient-secondary flex items-center justify-center glow-secondary">
              <User className="w-4 h-4 text-white" />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.div>
  );
}