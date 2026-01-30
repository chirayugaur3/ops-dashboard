// PURPOSE: User menu dropdown with role display and sign out
// Shows current user info and provides account actions
// Nielsen #3: User control and freedom - Easy to sign out

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, ChevronDown, Shield, Users, ClipboardCheck, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/auth';

const roleIcons: Record<UserRole, typeof Shield> = {
  admin: Shield,
  hr_admin: ClipboardCheck,
  ops_manager: Users,
  supervisor: MapPin,
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  hr_admin: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  ops_manager: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  supervisor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  hr_admin: 'HR Admin',
  ops_manager: 'Ops Manager',
  supervisor: 'Supervisor',
};

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  if (!user) return null;

  const RoleIcon = roleIcons[user.role] || User;

  return (
    <div ref={menuRef} className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-xl',
          'bg-slate-800/50 border border-slate-700/50',
          'hover:bg-slate-700/50 transition-colors',
          isOpen && 'bg-slate-700/50'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <span className="text-sm font-semibold text-white">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>

        {/* Name and role - hidden on mobile */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-white truncate max-w-[120px]">
            {user.name}
          </p>
          <p className="text-xs text-slate-400">{roleLabels[user.role]}</p>
        </div>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute right-0 mt-2 w-64 py-2',
              'bg-slate-800/95 backdrop-blur-xl rounded-xl',
              'border border-slate-700/50 shadow-xl shadow-black/20',
              'z-50'
            )}
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-slate-700/50">
              <p className="font-semibold text-white">{user.name}</p>
              <p className="text-sm text-slate-400 truncate">{user.email}</p>
              <div className={cn(
                'inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-md text-xs font-medium border',
                roleColors[user.role]
              )}>
                <RoleIcon className="w-3 h-3" />
                {roleLabels[user.role]}
              </div>
            </div>

            {/* Menu items */}
            <div className="py-2">
              <button
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 text-left',
                  'text-slate-300 hover:text-white hover:bg-slate-700/50',
                  'transition-colors'
                )}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>

            {/* Sign out */}
            <div className="pt-2 border-t border-slate-700/50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut();
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 text-left',
                  'text-red-400 hover:text-red-300 hover:bg-red-500/10',
                  'transition-colors'
                )}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
