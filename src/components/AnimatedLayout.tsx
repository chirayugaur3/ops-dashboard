// PURPOSE: Animated layout wrapper with Framer Motion
// Provides smooth page transitions and scroll-triggered animations
// Nielsen #4: Consistency - Uniform animations across the app

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedLayoutProps {
  children: ReactNode;
  className?: string;
}

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Stagger children animation
const staggerContainer = {
  initial: {},
  enter: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0 },
};

export function AnimatedPage({ children, className }: AnimatedLayoutProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, className }: AnimatedLayoutProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: AnimatedLayoutProps) {
  return (
    <motion.div
      variants={staggerItem}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade in on scroll
export function FadeInOnScroll({ children, className }: AnimatedLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale on hover - for cards
export function ScaleOnHover({ children, className }: AnimatedLayoutProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide in from side
interface SlideInProps extends AnimatedLayoutProps {
  direction?: 'left' | 'right' | 'top' | 'bottom';
}

export function SlideIn({ children, className, direction = 'left' }: SlideInProps) {
  const variants = {
    initial: {
      x: direction === 'left' ? -30 : direction === 'right' ? 30 : 0,
      y: direction === 'top' ? -30 : direction === 'bottom' ? 30 : 0,
      opacity: 0,
    },
    enter: { x: 0, y: 0, opacity: 1 },
  };

  return (
    <motion.div
      initial="initial"
      animate="enter"
      variants={variants}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated presence wrapper for conditional rendering
interface AnimatedPresenceWrapperProps {
  children: ReactNode;
  isVisible: boolean;
  className?: string;
}

export function AnimatedPresenceWrapper({
  children,
  isVisible,
  className,
}: AnimatedPresenceWrapperProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Animated number counter
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
}

export function AnimatedNumber({
  value,
  duration = 1,
  className,
  formatter = (v) => v.toLocaleString(),
}: AnimatedNumberProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      key={value}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration }}
      >
        {formatter(value)}
      </motion.span>
    </motion.span>
  );
}

// Pulse animation for alerts/notifications
export function PulseAnimation({ children, className }: AnimatedLayoutProps) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Shimmer loading effect
export function ShimmerLoader({ className }: { className?: string }) {
  return (
    <motion.div
      className={`bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 ${className}`}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{ backgroundSize: '200% 100%' }}
    />
  );
}
