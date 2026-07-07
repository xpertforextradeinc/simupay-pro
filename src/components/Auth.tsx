import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useToast } from './Toast';
import { Mail, Lock, User, Key, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthProps {
  onAuthSuccess: (session: any) => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields.', 'warning');
      return;
    }

    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      showToast('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      showToast('Welcome back to SimuPay Pro!', 'success');
      onAuthSuccess(data.session);
    } catch (error: any) {
      if (error.message?.includes('status 0')) {
        showToast('Network error (status 0). If you provided your own Supabase credentials, ensure your App URL is added to the allowed CORS origins in Supabase.', 'error');
      } else {
        showToast(error.message || 'Login failed. Please check credentials.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateActivationKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `SPP-${segment()}-${segment()}-${segment()}`;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      showToast('Please fill in all fields.', 'warning');
      return;
    }

    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      showToast('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      const user = data.user;
      if (user) {
        // Attempt to create a profile in the profiles table
        const activationKey = generateActivationKey();
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: user.id,
            email: user.email,
            full_name: fullName,
            wallet_balance: 0.00, // starting balance
            activation_key: activationKey,
            license_active: false,
            created_at: new Date().toISOString(),
          }
        ]);

        if (profileError) {
          console.warn('Profile creation error (usually table schema or RLS policy needed):', profileError);
          // We will fallback gracefully, showing toast
        }

        showToast('Registration successful! Logging you in...', 'success');
        onAuthSuccess(data.session);
      } else {
        showToast('Please check your email to confirm registration.', 'info');
      }
    } catch (error: any) {
      if (error.message?.includes('status 0')) {
        showToast('Network error (status 0). Check your Supabase CORS settings or credentials.', 'error');
      } else {
        showToast(error.message || 'Registration failed.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });

      if (error) throw error;

      showToast('Password reset link sent to your email!', 'success');
      setIsReset(false);
    } catch (error: any) {
      if (error.message?.includes('status 0')) {
        showToast('Network error (status 0). Check your Supabase CORS settings or credentials.', 'error');
      } else {
        showToast(error.message || 'Failed to send reset link.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Graphics */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-950/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-950/20 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-brand-card/90 backdrop-blur-xl p-8 rounded-2xl border border-emerald-900/30 shadow-2xl relative z-10"
      >
        {/* Logo and Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 bg-emerald-950/40 border border-brand-accent/30 rounded-2xl mb-4 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-brand-accent" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-brand-text mb-1">
            SimuPay <span className="text-brand-accent">Pro</span>
          </h1>
          <p className="text-brand-text-muted text-sm text-center">
            {isReset
              ? 'Reset your platform security key'
              : isSignUp
              ? 'Create a premium trading and transfers account'
              : 'Securely access your premium transfer portal'}
          </p>
        </div>

        {/* Auth Forms */}
        {isReset ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-muted mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-text-dim">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-brand-bg/50 border border-brand-border/50 rounded-xl py-3 pl-11 pr-4 text-brand-text placeholder-gray-500 focus:outline-none focus:border-brand-accent transition-colors text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-accent hover:bg-emerald-500 text-brand-bg font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-lg shadow-emerald-950/50 disabled:opacity-50"
            >
              {loading ? 'Sending Request...' : 'Send Reset Link'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsReset(false)}
                className="text-xs text-brand-accent hover:underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-muted mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-text-dim">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-brand-bg/50 border border-brand-border/50 rounded-xl py-3 pl-11 pr-4 text-brand-text placeholder-gray-500 focus:outline-none focus:border-brand-accent transition-colors text-sm"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-muted mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-text-dim">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-brand-bg/50 border border-brand-border/50 rounded-xl py-3 pl-11 pr-4 text-brand-text placeholder-gray-500 focus:outline-none focus:border-brand-accent transition-colors text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setIsReset(true)}
                    className="text-xs text-brand-text-dim hover:text-brand-text hover:underline transition-colors"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-text-dim">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-brand-bg/50 border border-brand-border/50 rounded-xl py-3 pl-11 pr-4 text-brand-text placeholder-gray-500 focus:outline-none focus:border-brand-accent transition-colors text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-accent hover:bg-emerald-500 text-brand-bg font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-lg shadow-[#00C853]/10 disabled:opacity-50"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{isSignUp ? 'Register Account' : 'Secure Login'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-border/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-brand-card text-brand-text-dim">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: window.location.origin
                    }
                  });
                  if (error) throw error;
                } catch (error: any) {
                  showToast(error.message || 'Google sign-in failed.', 'error');
                }
              }}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-lg disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Google</span>
            </button>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-brand-text-muted hover:text-brand-accent transition-colors"
              >
                {isSignUp ? (
                  <span>
                    Already have an account? <strong className="text-brand-accent hover:underline">Log in</strong>
                  </span>
                ) : (
                  <span>
                    Don't have an account? <strong className="text-brand-accent hover:underline">Register</strong>
                  </span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Security watermark */}
        <div className="mt-8 pt-4 border-t border-emerald-950/60 flex flex-col items-center justify-center gap-3 text-xs text-brand-text-dim font-mono">
          <div className="flex items-center gap-2">
            <Key className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-BIT SSL SECURED ENCRYPTION</span>
          </div>
          <div className="text-center opacity-60">
            <p className="text-[10px] leading-tight">
              © 2026 SimuPay Pro
              <br />
              Powered by Luckman Dev World
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
