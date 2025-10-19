import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon } from 'lucide-react'; // renamed to avoid type/value name clash
import { ThemeToggle } from './ThemeToggle';
import Logo from "../assets/Logo.png";

type AppUser = {
  id: string;
  full_name: string;
  email: string;
  username: string;
};

interface MobileTopNavigationProps {
  user: AppUser;
}

export function MobileTopNavigation({ user }: MobileTopNavigationProps) {
  const navRef = useRef<HTMLDivElement | null>(null);
  const lastScrollYRef = useRef<number>(0);
  const [isVisible, setIsVisible] = useState(true);

  // Keep accurate/nav height so the spacer always matches the real height
  const [navHeight, setNavHeight] = useState<number>(85); // sensible default

  // Measure nav height and update on resize/content changes
  useEffect(() => {
    if (!navRef.current) return;
    const measure = () => setNavHeight(navRef.current?.offsetHeight ?? 85);

    // initial measure
    measure();

    // watch for size changes (logo load, font changes, etc.)
    const ro = new ResizeObserver(measure);
    ro.observe(navRef.current);

    // also update on window resize
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  // Scroll handling using a ref to avoid re-attaching listener on every scroll value change
  useEffect(() => {
    const handleScroll = () => {
      const curr = window.scrollY;
      if (curr > lastScrollYRef.current && curr > 50) {
        // scrolling down
        setIsVisible(false);
      } else {
        // scrolling up
        setIsVisible(true);
      }
      lastScrollYRef.current = curr;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Spacer keeps the page content from sliding under the fixed nav */}
      <div
        aria-hidden="true"
        className="md:hidden"
        style={{ height: navHeight }}
      />

      <motion.div
        ref={navRef}
        initial={{ y: 0 }}
        // hide fully by moving up by the measured nav height (+ small buffer)
        animate={{ y: isVisible ? 0 : -navHeight - 8 }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        className="fixed top-0 left-0 right-0 z-50 md:hidden"
        style={{ paddingTop: 'env(safe-area-inset-top)' }} // accounts for notches / status bars
      >
        <div className="glass-card mx-3 mt-3 rounded-2xl border-0 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-2">
            {/* Logo + Title */}
            <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.02 }}>
              <img
                src={Logo}
                alt="App Logo"
                className="w-12 h-12 rounded-full object-cover border border-gray-700 shadow-md"
              />
              <span className="text-gradient-primary font-semibold text-lg tracking-tight">
                EZ Grades
              </span>
            </motion.div>

            {/* User Info + Theme */}
            <div className="flex items-center gap-3">
              <motion.div className="text-right leading-tight" whileHover={{ scale: 1.02 }}>
                <p className="text-sm font-medium">{user.username}</p>
                <p className="text-xs text-muted-foreground">{user.full_name}</p>
              </motion.div>

              <div className="w-8 h-8 rounded-full gradient-secondary flex items-center justify-center glow-secondary">
                <UserIcon className="w-4 h-4 text-white" />
              </div>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
