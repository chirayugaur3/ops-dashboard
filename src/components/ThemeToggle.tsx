// PURPOSE: Theme toggle component with smooth transitions
// Supports light, dark, and system preference modes
// Nielsen #7: Flexibility and efficiency - Users can customize their experience

'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

const themes = [
  { value: 'light' as const, icon: Sun, label: 'Light' },
  { value: 'dark' as const, icon: Moon, label: 'Dark' },
  { value: 'system' as const, icon: Monitor, label: 'System' },
];

export function ThemeToggle() {
  const { theme, setTheme, effectiveTheme } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-storage');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        if (parsed.state?.theme) {
          setTheme(parsed.state.theme);
        }
      } catch {
        // Use default
      }
    } else {
      // Default to system preference
      setTheme('system');
    }
  }, [setTheme]);

  // Update document class when effective theme changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
  }, [effectiveTheme]);

  // Listen for system preference changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setTheme('system');
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme, setTheme]);

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-lg border border-slate-700/50">
      {themes.map(({ value, icon: Icon, label }) => (
        <motion.button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'relative p-2 rounded-md transition-colors',
            theme === value
              ? 'text-white'
              : 'text-slate-400 hover:text-slate-200'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Switch to ${label} theme`}
        >
          {theme === value && (
            <motion.div
              layoutId="theme-indicator"
              className="absolute inset-0 bg-slate-700 rounded-md"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Icon className="w-4 h-4 relative z-10" />
        </motion.button>
      ))}
    </div>
  );
}

// Simple toggle between light and dark only
export function SimpleThemeToggle() {
  const { effectiveTheme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={effectiveTheme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {effectiveTheme === 'dark' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
