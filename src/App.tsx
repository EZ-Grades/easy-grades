import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/LuxurySidebar';
import { MobileNavigation } from './components/MobileNavigation';
import { MobileTopNavigation } from './components/MobileTopNavigation';
import { Dashboard } from './components/pages/Dashboard';
import { BreakMode } from './components/pages/BreakMode';
import { FocusMode } from './components/pages/FocusMode';
import { StudyHub } from './components/pages/StudyHub';
import { StudyTogetherRoom } from './components/pages/StudyTogetherRoom';

import { AboutUs } from './components/pages/AboutUs';
import { Settings } from './components/pages/Settings';
import { Login } from './components/pages/Login';
import { SignUp } from './components/pages/SignUp';
import { StudyHubAuthGuard } from './components/auth/StudyHubAuthGuard';
import { AuthCallback } from './components/auth/AuthCallback';
import { SidebarProvider, SidebarInset } from './components/ui/sidebar';
import { ThemeToggle } from './components/ThemeToggle';
import { EZGradesLogo } from './components/EZGradesLogo';
import { useIsMobile } from './components/ui/use-mobile';
import { useAuth } from './hooks/useAuth';
import { toast } from 'sonner@2.0.3';

import { ComprehensiveTest } from './components/ComprehensiveTest';

window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || String(event.reason);
  const knownIssues = [
    'getPage',
    'ambient_sounds',
    'ambience_modes', 
    'Invalid login credentials',
    'Could not find the table',
    'table does not exist',
    'PGRST106',
    'relation "public.ambient_sounds" does not exist',
    'relation "public.ambience_modes" does not exist'
  ];
  if (knownIssues.some(issue => message.includes(issue))) event.preventDefault();
  else console.warn('Unhandled promise rejection:', event.reason);
});

window.addEventListener('error', (event) => {
  const message = event.error?.message || String(event.error);
  const knownIssues = [
    'getPage',
    'ambient_sounds',
    'ambience_modes',
    'Invalid login credentials',
    'Could not find the table',
    'table does not exist',
    'PGRST106'
  ];
  if (knownIssues.some(issue => message.includes(message))) event.preventDefault();
  else console.warn('Global error caught:', event.error);
});

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showStudyHubAuth, setShowStudyHubAuth] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const { user, loading, error, signIn, signUp, signInWithGoogle, signOut, updateProfile } = useAuth();

  const guestUser = {
    id: 'guest',
    full_name: 'Guest User',
    email: 'guest@ezgrades.app',
    username: 'Guest'
  };
  const currentUser = user || guestUser;

  const protectedRoutes: string[] = [];
  const studyHubRoutes = ['studyhub'];

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (user && !loading && (currentPage === 'login' || currentPage === 'signup')) {
      const timer = setTimeout(() => {
        if (pendingRoute) setCurrentPage(pendingRoute);
        else setCurrentPage('dashboard');
        setPendingRoute(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, loading, currentPage, pendingRoute]);

  useEffect(() => {
    const handleNavigateToLogin = () => {
      setCurrentPage('login');
      toast.info('Please sign in to access this feature');
    };
    const handleNavigateToStudyHub = () => {
      if (user) setCurrentPage('studyhub');
      else {
        setCurrentPage('login');
        toast.info('Please sign in to access StudyHub');
      }
    };
    window.addEventListener('navigate-to-login', handleNavigateToLogin);
    window.addEventListener('navigate-to-studyhub', handleNavigateToStudyHub);
    return () => {
      window.removeEventListener('navigate-to-login', handleNavigateToLogin);
      window.removeEventListener('navigate-to-studyhub', handleNavigateToStudyHub);
    };
  }, [user]);

  const handlePageChange = (page: string) => {
    if (studyHubRoutes.includes(page) && !user) {
      setPendingRoute(page);
      setShowStudyHubAuth(true);
      return;
    }
    if (!user && protectedRoutes.includes(page)) {
      setPendingRoute(page);
      setCurrentPage('login');
      toast.info('Please sign in to access this feature');
      return;
    }
    setCurrentPage(page);
    setShowStudyHubAuth(false);
    setPendingRoute(null);
  };

  const handleAuthRequired = () => {
    setShowStudyHubAuth(false);
    setPendingRoute('studyhub');
    setCurrentPage('login');
    toast.info('Please sign in to access StudyHub features');
  };

  const handleLogin = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (result.success) {
      toast.success('Welcome back!');
      setTimeout(() => setCurrentPage('dashboard'), 500);
    } else toast.error(result.error || 'Failed to sign in');
    return result;
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    const result = await signUp(email, password, name);
    if (result.success) {
      if (result.needsVerification) {
        toast.success(result.message || 'Check your email to verify your account');
        setCurrentPage('login');
      } else {
        toast.success('Account created successfully!');
        setTimeout(() => setCurrentPage('dashboard'), 500);
      }
    } else toast.error(result.error || 'Failed to create account');
    return result;
  };

  const handleGoogleAuth = async () => {
    const result = await signInWithGoogle();
    if (!result.success) toast.error(result.error || 'Failed to initiate Google authentication');
  };

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      setCurrentPage('dashboard');
      toast.success('Logged out successfully');
    }
  };

  const handleUserUpdate = async (updates: any) => {
    const result = await updateProfile(updates);
    if (result.success) toast.success('Profile updated successfully');
    return result;
  };

  const renderPage = () => {
    if (showStudyHubAuth || (currentPage === 'studyhub' && !user)) {
      return (
        <StudyHubAuthGuard onAuthRequired={handleAuthRequired}>
          <StudyHub user={user} />
        </StudyHubAuthGuard>
      );
    }

    if (!user && (protectedRoutes.includes(currentPage) || currentPage === 'login' || currentPage === 'signup')) {
      if (currentPage === 'signup') {
        return (
          <SignUp
            onSignUp={handleSignUp}
            onGoogleSignUp={handleGoogleAuth}
            onSwitchToLogin={() => {
              setAuthMode('login');
              setCurrentPage('login');
            }}
            loading={loading}
          />
        );
      }
      return (
        <Login
          onLogin={handleLogin}
          onGoogleLogin={handleGoogleAuth}
          onSwitchToSignup={() => {
            setAuthMode('signup');
            setCurrentPage('signup');
          }}
          onSignUp={handleSignUp}
          loading={loading}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard': return <Dashboard user={user} />;
      case 'break': return <BreakMode />;
      case 'focus': return <FocusMode />;
      case 'studyhub': return <StudyHub user={user} />;
      case 'study-together': return <StudyTogetherRoom />;
      case 'about': return <AboutUs />;
      case 'settings':
        return (
          <Settings 
            onLogout={handleLogout} 
            user={user} 
            onUserUpdate={handleUserUpdate} 
          />
        );
      case 'test': return <ComprehensiveTest />;
      default: return <Dashboard user={user} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient flex items-center justify-center">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto border-4 border-primary-solid border-t-transparent rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center glow-primary">
                <EZGradesLogo size="lg" animated={false} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-gradient-primary">EZ Grades</h1>
            <p className="text-muted-foreground">Loading your session...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-amber-50 to-orange-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="min-h-screen">
        {(typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'development') && (
          <div className="fixed top-4 right-4 z-50 w-80">
          </div>
        )}
        
        <SidebarProvider defaultOpen={!isMobile}>
          <div className="min-h-screen bg-gradient flex w-full relative">
            <Sidebar 
              currentPage={currentPage} 
              onPageChange={handlePageChange}
              user={currentUser}
              onLogout={user ? handleLogout : () => setCurrentPage('login')}
            />
            
            <SidebarInset className="bg-transparent flex-1">
              {isMobile && <MobileTopNavigation user={currentUser} />}
              <AnimatePresence mode="wait">
                <motion.main
                  key={currentPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`w-full min-h-screen ${isMobile ? 'pt-20 pb-32' : 'p-6'}`}
                >
                  {renderPage()}
                </motion.main>
              </AnimatePresence>
            </SidebarInset>

            {isMobile && (
              <MobileNavigation
                currentPage={currentPage}
                onPageChange={handlePageChange}
                user={currentUser}
                onLogout={user ? handleLogout : () => setCurrentPage('login')}
              />
            )}
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
