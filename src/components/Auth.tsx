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
      showToast(error.message || 'Login failed. Please check credentials.', 'error');
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
            wallet_balance: 10000.00, // starting balance for awesome premium trial
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
      showToast(error.message || 'Registration failed.', 'error');
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
      showToast(error.message || 'Failed to send reset link.', 'error');
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
          <div className="flex items-center justify-center w-14 h-14 bg-emerald-950/40 border border-[#00C853]/30 rounded-2xl mb-4 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-[#00C853]" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-1">
            SimuPay <span className="text-[#00C853]">Pro</span>
          </h1>
          <p className="text-gray-400 text-sm text-center">
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00C853] transition-colors text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00C853] hover:bg-emerald-500 text-brand-bg font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-lg shadow-emerald-950/50 disabled:opacity-50"
            >
              {loading ? 'Sending Request...' : 'Send Reset Link'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsReset(false)}
                className="text-xs text-[#00C853] hover:underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00C853] transition-colors text-sm"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00C853] transition-colors text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setIsReset(true)}
                    className="text-xs text-gray-500 hover:text-white hover:underline transition-colors"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00C853] transition-colors text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00C853] hover:bg-emerald-500 text-brand-bg font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-lg shadow-[#00C853]/10 disabled:opacity-50"
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

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-gray-400 hover:text-[#00C853] transition-colors"
              >
                {isSignUp ? (
                  <span>
                    Already have an account? <strong className="text-[#00C853] hover:underline">Log in</strong>
                  </span>
                ) : (
                  <span>
                    Don't have an account? <strong className="text-[#00C853] hover:underline">Register</strong>
                  </span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Security watermark */}
        <div className="mt-8 pt-4 border-t border-emerald-950/60 flex items-center justify-center gap-2 text-xs text-gray-500 font-mono">
          <Key className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-BIT SSL SECURED ENCRYPTION</span>
        </div>
      </motion.div>
    </div>
  );
}
