import { motion } from 'motion/react';
import { 
  Home, 
  Coffee, 
  Focus, 
  BookOpen, 
  Users,
  Heart, 
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  User,
  TestTube
} from 'lucide-react';
import { EZGradesLogo } from './EZGradesLogo';
import {
  Sidebar as SidebarBase,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from './ui/sidebar';
import { ThemeToggle } from './ThemeToggle';

interface User {
  id: string;
  full_name: string; // Changed from name to full_name
  email: string;
  username: string;
}

interface SidebarProps {
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
  { id: 'study-together', label: 'Study Together', icon: Users },
  { id: 'about', label: 'About Us', icon: Heart },
  { id: 'settings', label: 'Settings', icon: Settings },
  //{ id: 'test', label: 'Test Suite', icon: TestTube },
];

function SidebarToggleButton() {
  const { state, toggleSidebar } = useSidebar();
  
  return (
    <motion.button
      onClick={toggleSidebar}
      className="glass-card p-2 rounded-lg hover:glow-primary transition-all duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {state === 'expanded' ? (
        <PanelLeftClose className="w-5 h-5" />
      ) : (
        <PanelLeftOpen className="w-5 h-5" />
      )}
    </motion.button>
  );
}

export function CustomSidebar({ currentPage, onPageChange, user, onLogout }: SidebarProps) {
  const { state } = useSidebar();

  return (
    <SidebarBase 
      collapsible="icon" 
      className="border-0 sidebar-enhanced"
    >
      <SidebarHeader className="p-4">
        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center glow-primary">
            <EZGradesLogo size="lg" animated={true} />
          </div>
          {state === 'expanded' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-gradient-primary font-semibold text-xl">EZ Grades</span>
            </motion.div>
          )}
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-muted-foreground px-2 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => onPageChange(item.id)}
                      tooltip={state === 'collapsed' ? item.label : undefined}
                      className={`
                        relative overflow-hidden transition-all duration-300 group
                        ${isActive 
                          ? 'gradient-primary text-white shadow-lg glow-primary' 
                          : 'hover:bg-white/5 hover:glow-primary/30 text-foreground/80 hover:text-foreground'
                        }
                      `}
                    >
                      <motion.div
                        className="flex items-center gap-3 w-full"
                        whileHover={{ x: 2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        {state === 'expanded' && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="font-medium"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </motion.div>
                      
                      {/* Hover glow effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={false}
                        animate={{ opacity: isActive ? 0.2 : 0 }}
                      />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile Section */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            {state === 'expanded' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="glass-card p-4 mx-2 mb-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-secondary flex items-center justify-center glow-secondary">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <ThemeToggle />
                </div>
                
                <motion.button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 hover:glow-error/30 text-foreground/80 hover:text-foreground transition-all duration-300 group"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {user.id === 'guest' ? 'Sign In' : 'Sign Out'}
                  </span>
                </motion.button>
              </motion.div>
            )}
            
            {state === 'collapsed' && (
              <div className="flex flex-col items-center gap-2 px-2 mb-4">
                <motion.div
                  className="w-10 h-10 rounded-full gradient-secondary flex items-center justify-center glow-secondary"
                  whileHover={{ scale: 1.1 }}
                >
                  <User className="w-5 h-5 text-white" />
                </motion.div>
                
                <ThemeToggle />
                
                <motion.button
                  onClick={onLogout}
                  className="w-10 h-10 rounded-lg hover:bg-white/5 hover:glow-error/30 text-foreground/80 hover:text-foreground transition-all duration-300 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title={user.id === 'guest' ? 'Sign In' : 'Sign Out'}
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {/* Collapse Toggle */}
        <div className="flex items-center justify-center">
          <SidebarToggleButton />
        </div>
      </SidebarFooter>
    </SidebarBase>
  );
}

export { CustomSidebar as Sidebar };