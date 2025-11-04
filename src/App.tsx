import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/LuxurySidebar';
import { MobileNavigation } from './components/MobileNavigation';
import { MobileTopNavigation } from './components/MobileTopNavigation';
import { Dashboard } from './components/pages/Dashboard';
import { BreakMode } from './components/pages/BreakMode';
import { FocusMode } from './components/pages/FocusMode';
import { StudyHub } from './components/pages/StudyHub';
import { StudyTogetherRoom } from './components/pages/StudyTogetherRoomNew';
import { AboutUs } from './components/pages/AboutUs';
import { Settings } from './components/pages/Settings';
import { Login } from './components/pages/Login';
import { SignUp } from './components/pages/SignUp';
import { StudyHubAuthGuard } from './components/auth/StudyHubAuthGuard';
import { StudyTogetherAuthGuard } from './components/auth/StudyTogetherAuthGuard';
import { AuthCallback } from './components/auth/AuthCallback';
import { ResetPassword } from './components/auth/ResetPassword';
import { SidebarProvider, SidebarInset } from './components/ui/sidebar';
import { ThemeToggle } from './components/ThemeToggle';
import { EZGradesLogo } from './components/EZGradesLogo';
import { useIsMobile } from './components/ui/use-mobile';
import { useAuth } from './hooks/useAuth';
import { toast } from 'sonner@2.0.3';
import { ErrorTracking } from './utils/errorTracking';
import logoImage from './assets/bbfed902e833d2dd6ba813007078c45ebc9903d0.png';

// Initialize error tracking on app load
ErrorTracking.init();

// Set favicon
const setFavicon = () => {
  const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
  link.type = 'image/png';
  link.rel = 'icon';
  link.href = logoImage;
  document.getElementsByTagName('head')[0].appendChild(link);
};

// Set page title and favicon
document.title = 'EZ Grades - Romanticize Your Study Sessions';
setFavicon();

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showStudyHubAuth, setShowStudyHubAuth] = useState(false);
  const [showStudyTogetherAuth, setShowStudyTogetherAuth] = useState(false);
  const [isOAuthCallback, setIsOAuthCallback] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null); // For route persistence
  // Removed setup banner since Supabase is always configured now
  const isMobile = useIsMobile();
  
  const { user, loading, error, signIn, signUp, signInWithGoogle, signOut, updateProfile } = useAuth();

  // Check if this is an OAuth callback or password reset on app load
  useEffect(() => {
    const currentUrl = window.location.href;
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    const isCallback = currentUrl.includes('/auth/callback') || 
                      currentUrl.includes('#access_token=') || 
                      currentUrl.includes('code=');
    
    // Check if it's a password reset link
    if (type === 'recovery') {
      console.log('🔗 Detected password reset link');
      setCurrentPage('reset-password');
      return;
    }
    
    if (isCallback) {
      console.log('🔗 Detected OAuth callback URL');
      setIsOAuthCallback(true);
    }
  }, []);

  // Create a guest user for navigation when not authenticated
  const guestUser = {
    id: 'guest',
    full_name: 'Guest User',
    email: 'guest@ezgrades.app',
    username: 'Guest'
  };

  // Use authenticated user or guest user for navigation
  const currentUser = user || guestUser;

  // Protected routes that require authentication (Settings now handles its own auth guard)
  const protectedRoutes: string[] = [];
  // StudyHub and StudyTogether require special handling
  const studyHubRoutes = ['studyhub'];
  const studyTogetherRoutes = ['study-together'];

  // Show error toast when auth errors occur
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Auto-redirect when user signs in - with route persistence
  useEffect(() => {
    if (user && !loading && (currentPage === 'login' || currentPage === 'signup') && !isOAuthCallback) {
      console.log('🔄 User signed in, checking for pending route');
      // Use a small delay to ensure auth state is fully settled
      const timer = setTimeout(() => {
        if (pendingRoute) {
          console.log('🔄 Redirecting to pending route:', pendingRoute);
          setCurrentPage(pendingRoute);
          setPendingRoute(null);
        } else {
          setCurrentPage('dashboard');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, loading, currentPage, isOAuthCallback, pendingRoute]);

  // Handle custom navigation events
  useEffect(() => {
    const handleNavigateToLogin = () => {
      setCurrentPage('login');
      toast.info('Please sign in to access this feature');
    };

    const handleNavigateToStudyHub = () => {
      if (user) {
        setCurrentPage('studyhub');
        toast.success('Welcome to StudyHub!');
      } else {
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

  // Handle page navigation with auth checks and route persistence
  const handlePageChange = (page: string) => {
    // Check if trying to access StudyHub without auth
    if (studyHubRoutes.includes(page) && !user) {
      setPendingRoute(page); // Store the route user wanted to access
      setShowStudyHubAuth(true);
      return;
    }
    
    // Check if trying to access Study Together without auth
    if (studyTogetherRoutes.includes(page) && !user) {
      setPendingRoute(page); // Store the route user wanted to access
      setShowStudyTogetherAuth(true);
      return;
    }
    
    // Check if trying to access protected route without auth (Settings now has its own guard)
    if (!user && protectedRoutes.includes(page)) {
      setPendingRoute(page); // Store the route user wanted to access
      setCurrentPage('login');
      toast.info('Please sign in to access this feature');
      return;
    }
    
    setCurrentPage(page);
    setShowStudyHubAuth(false);
    setShowStudyTogetherAuth(false);
    setPendingRoute(null); // Clear any pending route when successfully navigating
  };

  const handleAuthRequired = () => {
    setShowStudyHubAuth(false);
    setPendingRoute('studyhub'); // Store StudyHub as pending route
    setCurrentPage('login');
    toast.info('Please sign in to access StudyHub features');
  };

  const handleStudyTogetherAuthRequired = () => {
    setShowStudyTogetherAuth(false);
    setPendingRoute('study-together'); // Store Study Together as pending route
    setCurrentPage('login');
    toast.info('Please sign in to create and join study rooms');
  };

  const handleLogin = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (result.success) {
      toast.success('Welcome back!');
      // Force redirect to dashboard after successful login
      setTimeout(() => {
        setCurrentPage('dashboard');
      }, 500);
    } else {
      toast.error(result.error || 'Failed to sign in');
    }
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
        // Force redirect to dashboard after successful signup
        setTimeout(() => {
          setCurrentPage('dashboard');
        }, 500);
      }
    } else {
      toast.error(result.error || 'Failed to create account');
    }
    return result;
  };

  const handleGoogleAuth = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      // Google auth will redirect, so we don't need to handle success here
      toast.success('Redirecting to Google...');
    } else {
      toast.error(result.error || 'Failed to initiate Google authentication');
    }
    return result;
  };

  const handleOAuthCallback = (success: boolean, error?: string) => {
    setIsOAuthCallback(false);
    
    // Clean up the URL
    window.history.replaceState({}, document.title, window.location.pathname);
    
    if (success) {
      // Check if this was email verification or OAuth
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      
      if (type === 'signup' || type === 'email') {
        toast.success('Email verified! Welcome to EZ Grades!');
      } else {
        toast.success('Successfully signed in!');
      }
      
      // Force redirect to dashboard after authentication success
      setTimeout(() => {
        if (pendingRoute) {
          setCurrentPage(pendingRoute);
          setPendingRoute(null);
        } else {
          setCurrentPage('dashboard');
        }
      }, 500);
    } else {
      setCurrentPage('login');
      toast.error(error || 'Authentication failed');
    }
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
    if (result.success) {
      toast.success('Profile updated successfully');
    }
    return result;
  };

  const renderPage = () => {
    // Handle OAuth callback
    if (isOAuthCallback) {
      return <AuthCallback onAuthComplete={handleOAuthCallback} />;
    }

    // Handle password reset page
    if (currentPage === 'reset-password') {
      return (
        <ResetPassword
          onComplete={() => {
            setCurrentPage('login');
            toast.success('Password updated! Please sign in with your new password.');
          }}
          onBackToLogin={() => setCurrentPage('login')}
        />
      );
    }

    // Show StudyHub auth guard when trying to access StudyHub without login
    if (showStudyHubAuth || (currentPage === 'studyhub' && !user)) {
      return (
        <StudyHubAuthGuard onAuthRequired={handleAuthRequired}>
          <StudyHub user={user} />
        </StudyHubAuthGuard>
      );
    }

    // Show Study Together auth guard when trying to access Study Together without login
    if (showStudyTogetherAuth || (currentPage === 'study-together' && !user)) {
      return (
        <StudyTogetherAuthGuard onAuthRequired={handleStudyTogetherAuthRequired}>
          <StudyTogetherRoom user={user} />
        </StudyTogetherAuthGuard>
      );
    }

    // Show auth pages for unauthenticated users accessing protected routes
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

    // Render pages based on current page
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'break':
        return <BreakMode />;
      case 'focus':
        return <FocusMode />;
      case 'studyhub':
        return <StudyHub user={user} />;
      case 'study-together':
        return <StudyTogetherRoom user={user} />;
      case 'about':
        return <AboutUs />;
      case 'settings':
        return (
          <Settings 
            onLogout={handleLogout} 
            user={user} 
            onUserUpdate={handleUserUpdate} 
          />
        );
      default:
        return <Dashboard user={user} />;
    }
  };

  // Show loading screen while checking for existing session
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
          {/* Enhanced loading animation with logo */}
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

  // Always show the app with navigation (authenticated or guest mode)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-[#0B1524] dark:via-[#1A2942] dark:to-[#1E3A5F]">
      <div className="min-h-screen">
        <SidebarProvider defaultOpen={!isMobile}>
          <div className="min-h-screen bg-gradient flex w-full relative">
            {/* Sidebar - Always visible with current user (authenticated or guest) */}
            <Sidebar 
              currentPage={currentPage} 
              onPageChange={handlePageChange}
              user={currentUser}
              onLogout={user ? handleLogout : () => setCurrentPage('login')}
            />
            
            <SidebarInset className="bg-transparent flex-1">
              {/* Mobile Top Navigation */}
              {isMobile && (
                <MobileTopNavigation user={currentUser} />
              )}
              
              <AnimatePresence mode="wait">
                <motion.main
                  key={currentPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`w-full min-h-screen ${isMobile ? 'pt-16 pb-20 px-3' : 'p-6'}`}
                >
                  {renderPage()}
                </motion.main>
              </AnimatePresence>
            </SidebarInset>

            {/* Mobile Bottom Navigation */}
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