'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', email.toLowerCase().trim(), password);
      
      const result = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      console.log('SignIn result:', result);

      if (result?.error) {
        console.log('Login error:', result.error);
        setError('Invalid email or password');
      } else if (result?.ok) {
        console.log('Login successful, redirecting...');
        router.push(callbackUrl);
        router.refresh();
      } else {
        console.log('Unexpected result:', result);
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login exception:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 w-full max-w-md"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30 mb-4"
        >
          <Shield className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Operations Dashboard
        </h1>
        <p className="text-slate-400">
          Sign in to access attendance & field activity
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full py-3 px-4 rounded-xl font-semibold text-white',
              'bg-gradient-to-r from-violet-500 to-fuchsia-500',
              'hover:from-violet-600 hover:to-fuchsia-600',
              'focus:outline-none focus:ring-2 focus:ring-violet-500/50',
              'transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
              'flex items-center justify-center gap-2'
            )}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>
      </motion.div>

      <p className="text-center text-slate-500 text-sm mt-6">
        Authorized access only
      </p>
    </motion.div>
  );
}

function LoginSkeleton() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 animate-pulse mb-4" />
        <div className="h-8 bg-white/10 rounded w-48 mx-auto mb-2 animate-pulse" />
        <div className="h-4 bg-white/10 rounded w-64 mx-auto animate-pulse" />
      </div>
      <div className="bg-white/10 rounded-2xl p-8">
        <div className="space-y-4">
          <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-12 bg-violet-500/20 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
      </div>
      
      <Suspense fallback={<LoginSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
