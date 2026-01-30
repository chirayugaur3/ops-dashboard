// PURPOSE: Toast notification component for user feedback
// Provides visual feedback for actions (resolve, export, errors)
// Nielsen #1: Visibility of system status - Users always know what's happening

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotificationStore, type Notification } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  error: 'bg-red-500/10 border-red-500/30 text-red-400',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
};

function ToastItem({ notification }: { notification: Notification }) {
  const { removeNotification } = useNotificationStore();
  const Icon = iconMap[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-lg max-w-sm',
        colorMap[notification.type]
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white">{notification.title}</p>
        {notification.message && (
          <p className="text-sm text-slate-300 mt-1">{notification.message}</p>
        )}
      </div>
      <button
        onClick={() => removeNotification(notification.id)}
        className="text-slate-400 hover:text-white transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const { notifications } = useNotificationStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <ToastItem key={notification.id} notification={notification} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for easy toast usage
export function useToast() {
  const { addNotification } = useNotificationStore();

  return {
    success: (title: string, message?: string) =>
      addNotification({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
      addNotification({ type: 'error', title, message }),
    warning: (title: string, message?: string) =>
      addNotification({ type: 'warning', title, message }),
    info: (title: string, message?: string) =>
      addNotification({ type: 'info', title, message }),
  };
}
