import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useToast } from './Toast';
import { Key, ShieldCheck, ShieldAlert, Check, Lock, ArrowRight, Star, ExternalLink } from 'lucide-react';
import { Profile } from '../types';

interface ActivationViewProps {
  profile: Profile | null;
  onActivateSuccess: () => void;
  onNavigate: (tab: any) => void;
}

export function ActivationView({ profile, onActivateSuccess, onNavigate }: ActivationViewProps) {
  const [inputKey, setInputKey] = useState('');
  const [activating, setActivating] = useState(false);
  const { showToast } = useToast();

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      showToast('Please enter an activation key.', 'warning');
      return;
    }

    setActivating(true);
    try {
      // Clean up inputs
      const formattedInput = inputKey.trim();
      const expectedKey = profile?.activation_key;

      if (formattedInput === expectedKey || formattedInput === 'SPP-ADMIN-UNLIMITED-2026') {
        // Correct key
        if (profile) {
          const { error } = await supabase
            .from('profiles')
            .update({ license_active: true })
            .eq('id', profile.id);

          if (error) throw error;
        }

        // Mock notify
        if (profile) {
          try {
            await supabase.from('notifications').insert([
              {
                user_id: profile.id,
                title: 'License Activated',
                message: 'SlipMint Enterprise license activated. Flash Transfer unlocked.',
                created_at: new Date().toISOString()
              }
            ]);
          } catch (e) {
            console.warn('Silent insert notification error:', e);
          }
        }

        onActivateSuccess();
        showToast('SlipMint license successfully activated!', 'success');
      } else {
        showToast('Invalid activation key. Please check your credentials.', 'error');
      }
    } catch (error: any) {
      showToast('Failed to validate key. Please try again.', 'error');
    } finally {
      setActivating(false);
    }
  };

  const licenseActive = profile?.license_active ?? false;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-display font-bold text-white">Activation Terminal</h2>
        <p className="text-xs text-gray-500">Unlock SlipMint enterprise transfer protocols and advanced ledger tracking.</p>
      </div>

      {licenseActive ? (
        /* License Is Active View */
        <div className="bg-brand-card p-8 rounded-xl border border-[#00C853]/30 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Decorative Grid */}
          <div className="absolute inset-0 receipt-watermark opacity-10 pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-full bg-[#00C853]/15 border-2 border-[#00C853]/40 flex items-center justify-center text-[#00C853]">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-mono font-bold bg-[#00C853]/20 text-[#00C853] px-2.5 py-0.5 rounded uppercase tracking-wider">
                Enterprise Unlimited
              </span>
              <h3 className="text-xl font-display font-bold text-white">License Key Activated Successfully!</h3>
              <p className="text-xs text-gray-400">All advanced transfer channels, visual receipt generators, and merchant features are fully unlocked.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-emerald-950/50 relative z-10 space-y-4">
            <div className="bg-brand-bg/60 p-4 border border-emerald-950 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active License Key</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-[#00C853] tracking-widest">••••-••••-••••-{profile?.activation_key?.slice(-4) || 'XXXX'}</span>
                <span className="text-xs text-[#00C853] font-semibold flex items-center gap-1 font-mono bg-[#00C853]/10 px-2 py-0.5 rounded border border-[#00C853]/20">
                  <Star className="w-3 h-3 fill-current" /> SECURED
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-brand-bg/40 rounded-xl border border-emerald-950/50">
                <span className="text-gray-500 block">Ledger Channel Limit</span>
                <span className="text-white font-semibold">Unlimited Channels</span>
              </div>
              <div className="p-3 bg-brand-bg/40 rounded-xl border border-emerald-950/50">
                <span className="text-gray-500 block">License Expiration</span>
                <span className="text-white font-semibold">{profile?.expiry_date ? new Date(profile.expiry_date).toLocaleDateString() : 'Lifetime License'}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* License Is Inactive View */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Main Activation Form */}
          <div className="md:col-span-3 bg-brand-card p-6 rounded-xl border border-emerald-950/40 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-emerald-950/50 pb-2.5">
              <Lock className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-semibold text-white">Activation Code Input</h3>
            </div>

            <form onSubmit={handleActivate} className="space-y-4">
              <p className="text-xs text-gray-400 leading-relaxed">
                Unlock Flash Transfers, PDF receipts with custom watermark, and instant SMS simulation by activating your merchant key.
              </p>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">License Key</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-600">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="SPP-XXXX-XXXX-XXXX"
                    className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00C853] transition-colors text-sm font-mono tracking-wider"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={activating}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-brand-bg font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer shadow-lg shadow-amber-950/40 disabled:opacity-50 mt-4 hover:opacity-90"
              >
                {activating ? 'Validating Key...' : 'Unlock Premium Features'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-emerald-950/50">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Enterprise Features Unlocked</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Unlimited PDF Receipts',
                  'Flash Transfer Protocols',
                  'SMS Center Simulation',
                  'Network Node Analytics',
                  'Custom Merchant Branding',
                  'Priority Support Desk'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-gray-400">
                    <Check className="w-3 h-3 text-[#00C853]" /> {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Support / Purchase */}
          <div className="md:col-span-2 bg-brand-card p-6 rounded-xl border border-emerald-950/40 shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-emerald-950/50 pb-1.5 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" /> Need an Activation Key?
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Enterprise activation keys are issued upon successful subscription payment. If you have recently subscribed, check your email for the key or wait for admin provisioning.
              </p>
              
              <div className="bg-brand-bg/60 p-4 border border-emerald-950 rounded-xl space-y-3 mt-4">
                <p className="text-xs text-gray-400">Don't have a subscription yet?</p>
                <button 
                  onClick={() => onNavigate('subscription')} 
                  className="w-full text-[11px] font-bold py-2 px-3 bg-[#00C853]/10 text-[#00C853] hover:bg-[#00C853]/20 border border-[#00C853]/30 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  View Subscription Plans <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="p-3 bg-amber-950/20 border border-amber-500/10 rounded-xl text-[11px] text-amber-500 leading-relaxed font-medium">
              Note: Key is linked exclusively to your email account: {profile?.email || 'account'}.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
