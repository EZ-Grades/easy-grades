import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  Coffee, 
  Focus, 
  BookOpen, 
  BarChart3, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'break', label: 'Break Mode', icon: Coffee },
  { id: 'focus', label: 'Focus Mode', icon: Focus },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'summary', label: 'Summary', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 p-4">
        <div className="glass-card mx-auto px-6 py-3 flex items-center gap-8">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Focus className="w-4 h-4 text-white" />
            </div>
            <span className="text-gradient-primary font-semibold text-lg">StudyFlow</span>
          </motion.div>
          
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`
                    px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2
                    ${isActive 
                      ? 'gradient-primary text-white shadow-lg' 
                      : 'hover:bg-white/10 hover:glow-primary text-foreground/80 hover:text-foreground'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
          
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 p-4">
        <div className="glass-card flex items-center justify-between px-4 py-3">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Focus className="w-4 h-4 text-white" />
            </div>
            <span className="text-gradient-primary font-semibold text-lg">StudyFlow</span>
          </motion.div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="glass-card p-2 rounded-lg hover:glow-primary transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-4 right-4 mt-2"
          >
            <div className="glass-card p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      onPageChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      w-full px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3
                      ${isActive 
                        ? 'gradient-primary text-white shadow-lg' 
                        : 'hover:bg-white/10 hover:glow-primary text-foreground/80 hover:text-foreground'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}