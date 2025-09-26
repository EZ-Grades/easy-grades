import { motion } from 'motion/react';
import { 
  Home, 
  Coffee, 
  Focus, 
  BookOpen, 
  Users,
  Heart,
  Settings,
  LogOut,
  User,
  TestTube
} from 'lucide-react';

interface User {
  id: string;
  full_name: string; // Changed from name to full_name
  email: string;
  username: string;
}

interface MobileNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  user: User;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'break', label: 'Break Mode', icon: Coffee },
  { id: 'focus', label: 'Focus Mode', icon: Focus },
  { id: 'studyhub', label: 'Study Hub', icon: BookOpen },
  { id: 'about', label: 'About Us', icon: Heart},
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function MobileNavigation({ currentPage, onPageChange, user, onLogout }: MobileNavigationProps) {
  const handleItemClick = (itemId: string) => {
    onPageChange(itemId);
  };

  const handleLogout = () => {
    onLogout();
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="glass-card mobile-nav-enhanced mx-3 mb-3 rounded-2xl border-0 shadow-2xl">
          <div className="flex items-center justify-around py-2 px-1">
            {navItems.map((item) => { // Show core navigation items
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    relative p-2.5 rounded-xl transition-all duration-300 flex flex-col items-center min-w-0
                    ${isActive 
                      ? 'gradient-primary text-white shadow-lg glow-primary' 
                      : 'text-foreground/70 hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5'
                    }
                  `}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium truncate max-w-[3rem]">
                    {item.label.split(' ')[0]}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-white"
                      layoutId="mobileActiveIndicator"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              );
            })}
            
            {/* Logout/Login Button */}
            <motion.button
              onClick={handleLogout}
              className="relative p-2.5 rounded-xl transition-all duration-300 text-error-solid hover:text-error-solid hover:bg-error-solid/10 flex flex-col items-center min-w-0"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              title={user.id === 'guest' ? 'Sign In' : 'Sign Out'}
            >
              <LogOut className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">
                {user.id === 'guest' ? 'Login' : 'Logout'}
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Content Spacer */}
      <div className="h-20 md:hidden" /> {/* Bottom spacer for mobile navigation */}
    </>
  );
}