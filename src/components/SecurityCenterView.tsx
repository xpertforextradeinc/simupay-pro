import React, { useState } from 'react';
import { useToast } from './Toast';
import { ShieldCheck, Key, Smartphone, AlertTriangle, Monitor, Lock, CheckCircle, RefreshCcw } from 'lucide-react';
import { Profile } from '../types';
import { supabase } from '../supabase';

interface SecurityCenterViewProps {
  profile: Profile | null;
}

export function SecurityCenterView({ profile }: SecurityCenterViewProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const { showToast } = useToast();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      showToast('Password updated successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showToast(error.message || 'Failed to update password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleToggle2FA = () => {
    if (!twoFactorEnabled) {
      // Simulate 2FA setup process for frontend demo/fintech aesthetic
      showToast('Initiating 2FA setup...', 'success');
      setTimeout(() => {
        setTwoFactorEnabled(true);
        showToast('Authenticator App successfully linked.', 'success');
      }, 1500);
    } else {
      setTwoFactorEnabled(false);
      showToast('Two-Factor Authentication disabled.', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-[#00C853]" />
          Security Center
        </h2>
        <p className="text-sm text-gray-400 mt-2 font-sans max-w-2xl">
          Manage your account security, monitor active sessions, and configure multi-factor authentication to protect your assets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Password & 2FA */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Two-Factor Authentication Card */}
          <div className="bg-brand-card p-6 rounded-2xl border border-emerald-950/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-900/0 via-[#00C853] to-emerald-900/0 opacity-20"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl border ${twoFactorEnabled ? 'bg-[#00C853]/10 border-[#00C853]/30 text-[#00C853]' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                  {twoFactorEnabled ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Two-Factor Authentication (2FA)</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm leading-relaxed">
                    Add an extra layer of security to your account by requiring a time-based code from your authenticator app.
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggle2FA}
                className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-bold text-xs transition-colors border ${
                  twoFactorEnabled 
                    ? 'bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10' 
                    : 'bg-[#00C853] border-[#00C853] text-black hover:bg-[#00E676]'
                }`}
              >
                {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </button>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-brand-card p-6 rounded-2xl border border-emerald-950/40 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-emerald-950/50 pb-4">
              <Key className="w-5 h-5 text-gray-400" />
              <h3 className="text-base font-bold text-white">Change Password</h3>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-4 py-3 text-white text-sm focus:border-[#00C853]/50 focus:ring-1 focus:ring-[#00C853]/50 outline-none transition-all"
                />
                <p className="text-[10px] text-gray-500">Only required if you are not using SSO or Magic Link.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-4 py-3 text-white text-sm focus:border-[#00C853]/50 focus:ring-1 focus:ring-[#00C853]/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-4 py-3 text-white text-sm focus:border-[#00C853]/50 focus:ring-1 focus:ring-[#00C853]/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={changingPassword || !newPassword || !confirmPassword}
                  className="bg-brand-bg hover:bg-[#00C853]/10 text-white hover:text-[#00C853] border border-emerald-950 hover:border-[#00C853]/50 font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changingPassword ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
          
        </div>

        {/* Right Column: Sessions & Logs */}
        <div className="space-y-6">
          
          {/* Active Sessions */}
          <div className="bg-brand-card p-6 rounded-2xl border border-emerald-950/40 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-emerald-950/50 pb-4">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-gray-400" />
                <h3 className="text-base font-bold text-white">Active Sessions</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#00C853]/5 border border-[#00C853]/20 p-4 rounded-xl flex items-start gap-4">
                <Monitor className="w-5 h-5 text-[#00C853] shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-white">Mac OS • Chrome</h4>
                  <p className="text-[10px] text-[#00C853] font-mono mt-1 mb-2">CURRENT SESSION</p>
                  <p className="text-xs text-gray-500">IP: 192.168.1.1</p>
                  <p className="text-xs text-gray-500">San Francisco, CA</p>
                </div>
              </div>

              <div className="bg-brand-bg/50 border border-emerald-950/50 p-4 rounded-xl flex items-start gap-4 opacity-80">
                <Smartphone className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-white">iOS • Safari</h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-1 mb-2">Last active: 2h ago</p>
                  <p className="text-xs text-gray-500">IP: 172.56.21.8</p>
                  <p className="text-xs text-gray-500">New York, NY</p>
                </div>
              </div>
            </div>

            <button className="w-full mt-2 py-3 border border-emerald-950/50 hover:bg-red-500/10 text-red-400 hover:border-red-500/30 rounded-xl text-xs font-bold transition-colors">
              Sign Out All Other Devices
            </button>
          </div>

          {/* Security Logs Snippet */}
          <div className="bg-brand-card p-6 rounded-2xl border border-emerald-950/40 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-emerald-950/50 pb-4">
              <ShieldCheck className="w-5 h-5 text-gray-400" />
              <h3 className="text-base font-bold text-white">Recent Security Activity</h3>
            </div>

            <div className="space-y-4">
              {[
                { action: 'Successful Login', date: 'Today, 09:41 AM', status: 'success' },
                { action: 'Password Changed', date: 'Oct 12, 2023', status: 'info' },
                { action: 'Failed Login Attempt', date: 'Oct 10, 2023', status: 'warning' },
              ].map((log, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <p className={`text-xs font-bold ${log.status === 'warning' ? 'text-red-400' : 'text-gray-300'}`}>{log.action}</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{log.date}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    log.status === 'success' ? 'bg-[#00C853]' : 
                    log.status === 'warning' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                </div>
              ))}
            </div>
            
            <div className="pt-2">
              <button className="text-[10px] text-[#00C853] hover:text-[#00E676] font-bold tracking-wider uppercase">View Full Logs →</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
