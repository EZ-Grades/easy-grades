import { motion } from 'motion/react';
import { 
  Home, 
  Coffee, 
  Focus, 
  BookOpen, 
  Users,
  Brain,
  Heart, 
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  User
} from 'lucide-react';
import Logo from "../assets/Logo.png";
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
  useSidebar
} from './ui/sidebar';
import { ThemeToggle } from './ThemeToggle';

interface User {
  id: string;
  full_name: string;
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
];

function SidebarToggleButton() {
  const { state, toggleSidebar } = useSidebar();
  
  return (
    <button
      onClick={toggleSidebar}
      className="glass-card p-2 rounded-lg hover:glow-primary transition-all duration-300"
      aria-label={state === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'}
    >
      {state === 'expanded' ? (
        <PanelLeftClose className="w-5 h-5" />
      ) : (
        <PanelLeftOpen className="w-5 h-5" />
      )}
    </button>
  );
}

export function CustomSidebar({ currentPage, onPageChange, user, onLogout }: SidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarBase 
      collapsible="icon" 
      className="border-0 sidebar-enhanced"
    >
      {/* Header with Logo */}
      <SidebarHeader className={isCollapsed ? "p-2 flex items-center justify-center" : "p-4"}>
        <div className={`flex items-center sidebar-logo-container ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="mb">
        <img
          src={Logo}
          alt="App Logo"
          className="w-20 h-20 rounded-full object-cover border-2 border-gray-700 shadow-md"
        />
          </div>
          {!isCollapsed && (
            <span className="text-gradient-primary font-semibold text-xl">EZ Grades</span>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation Menu */}
      <SidebarContent className={isCollapsed ? "px-2" : "px-2"}>
        <SidebarGroup>
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
                      tooltip={isCollapsed ? item.label : undefined}
                      data-testid={`nav-${item.id}`}
                      className={`
                        relative overflow-hidden transition-all duration-300 group
                        ${isActive 
                          ? 'gradient-primary text-white shadow-lg glow-primary' 
                          : 'hover:bg-white/5 hover:glow-primary/30 text-foreground/80 hover:text-foreground'
                        }
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                    >
                      <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'} w-full`}>
                        <Icon className="w-5 h-5 shrink-0" />
                        {!isCollapsed && (
                          <span className="font-medium">{item.label}</span>
                        )}
                      </div>
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
            {!isCollapsed ? (
              <div className="glass-card p-4 mx-2 mb-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-secondary flex items-center justify-center glow-secondary shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <ThemeToggle />
                </div>
                
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 hover:glow-error/30 text-foreground/80 hover:text-foreground transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {user.id === 'guest' ? 'Sign In' : 'Sign Out'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 mb-4">
                <button
                  onClick={() => onPageChange('settings')}
                  className="w-10 h-10 rounded-full gradient-secondary flex items-center justify-center glow-secondary hover:scale-110 transition-transform duration-300"
                  title={user.full_name}
                  aria-label="User profile"
                >
                  <User className="w-5 h-5 text-white" />
                </button>
                
                <ThemeToggle />
                
                <button
                  onClick={onLogout}
                  className="w-10 h-10 rounded-lg hover:bg-white/5 hover:glow-error/30 text-foreground/80 hover:text-foreground transition-all duration-300 flex items-center justify-center hover:scale-110"
                  title={user.id === 'guest' ? 'Sign In' : 'Sign Out'}
                  aria-label={user.id === 'guest' ? 'Sign In' : 'Sign Out'}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Toggle Button */}
      <SidebarFooter className={isCollapsed ? "p-2 flex items-center justify-center" : "p-4"}>
        <SidebarToggleButton />
      </SidebarFooter>
    </SidebarBase>
  );
}

export { CustomSidebar as Sidebar };
