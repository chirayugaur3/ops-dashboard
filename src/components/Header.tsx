// PURPOSE: Sticky header component with navigation and user controls
// F-pattern layout: Logo left, navigation center, user menu right
// Nielsen #4: Consistency - Same header across all pages

'use client';

import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Bell, 
  Search,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'sticky top-0 z-40 w-full',
        'bg-slate-900/80 backdrop-blur-xl',
        'border-b border-slate-800/50'
      )}
    >
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo and mobile menu */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white">
                  Ops Dashboard
                </h1>
                <p className="text-xs text-slate-400 -mt-0.5">
                  Attendance & Field Activity
                </p>
              </div>
            </div>
          </div>

          {/* Center: Search (desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search employees, locations..."
                className={cn(
                  'w-full pl-10 pr-4 py-2 rounded-xl',
                  'bg-slate-800/50 border border-slate-700/50',
                  'text-white placeholder-slate-400',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500',
                  'transition-all'
                )}
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile search button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {/* Notification badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* User menu */}
            <UserMenu />
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden pb-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search employees, locations..."
                className={cn(
                  'w-full pl-10 pr-4 py-2 rounded-xl',
                  'bg-slate-800/50 border border-slate-700/50',
                  'text-white placeholder-slate-400',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/50'
                )}
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
