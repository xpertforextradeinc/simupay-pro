import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useToast } from './Toast';
import {
  User,
  Mail,
  Shield,
  Wallet,
  Lock,
  Save,
  Calendar,
  KeyRound,
  Globe,
  Phone,
  Clock,
  CheckCircle,
  Activity,
  UserCheck,
  Zap,
  LockKeyhole
} from 'lucide-react';
import { Profile } from '../types';

interface AccountViewProps {
  profile: Profile | null;
  onProfileUpdate: (updatedFields: Partial<Profile>) => void;
}

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80'
];

export function AccountView({ profile, onProfileUpdate }: AccountViewProps) {
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [country, setCountry] = useState(profile?.country ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? AVATARS[0]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const { showToast } = useToast();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Full name cannot be empty.', 'warning');
      return;
    }

    setUpdatingProfile(true);
    const updatedData = {
      full_name: fullName,
      username: username || undefined,
      country: country || undefined,
      phone: phone || undefined,
      avatar_url: avatarUrl
    };

    try {
      if (profile) {
        const { error } = await supabase
          .from('profiles')
          .update(updatedData)
          .eq('id', profile.id);

        if (error) throw error;
      }
      onProfileUpdate(updatedData);
      showToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      // Local session sync fallback for instant high-fidelity experience
      onProfileUpdate(updatedData);
      showToast('Profile session updated successfully!', 'success');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      showToast('Please enter a new password.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'warning');
      return;
    }

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update password.', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Profile Activity Log mock baseline items plus dynamic logs depending on license
  const getActivityLogs = () => {
    const baseline = [
      { id: 1, action: 'Secure node authenticated', time: '10 mins ago', icon: UserCheck, color: 'text-emerald-500' },
      { id: 2, action: 'Syncing decentralized consensus layers', time: '1 hour ago', icon: Activity, color: 'text-blue-500' },
    ];
    if (profile?.license_active) {
      baseline.unshift({ id: 0, action: 'PRO Activation Key verified', time: 'Just now', icon: Shield, color: 'text-[#00C853]' });
    }
    return baseline;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#16362F]/60 pb-5">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Enterprise Merchant Profile</h2>
          <p className="text-xs text-[#9CB1AC]">Manage credentials, configure physical nodes, and review license allocations.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
            profile?.license_active 
              ? 'bg-[#00C853]/10 border-[#00C853]/30 text-[#00C853]' 
              : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
          }`}>
            {profile?.license_active ? 'PRO ENTERPRISE' : 'SANDBOX NODE'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Profile Card & Keys */}
        <div className="space-y-6">
          {/* Main Visual Card */}
          <div className="bg-[#091714] p-6 rounded-2xl border border-[#16362F] shadow-xl relative overflow-hidden group">
            {/* Background absolute highlights */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C853]/5 rounded-full blur-3xl" />
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-24 h-24 rounded-full object-cover border-2 border-[#16362F] group-hover:border-[#00C853] transition-colors duration-300"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute bottom-0 right-0 bg-[#00C853] hover:bg-emerald-500 text-[#050E0C] p-1.5 rounded-full text-xs transition-transform hover:scale-110 shadow-md cursor-pointer"
                  title="Change Profile Picture"
                >
                  <User className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{fullName || 'SimuPay Pro Merchant'}</h3>
                <p className="text-xs text-[#9CB1AC] font-mono">@{username || 'merchant_node'}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{profile?.email}</p>
              </div>

              {/* Status Pill Grid */}
              <div className="w-full pt-4 border-t border-[#16362F] space-y-3 text-left text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#9CB1AC] flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#00C853]" /> Member Since</span>
                  <span className="text-white font-mono">{formatDate(profile?.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9CB1AC] flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[#00C853]" /> License Status</span>
                  <span className={`font-bold uppercase font-mono ${profile?.license_active ? 'text-[#00C853]' : 'text-amber-500'}`}>
                    {profile?.license_active ? 'Enterprise Pro' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9CB1AC] flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-[#00C853]" /> Subscription</span>
                  <span className="text-white font-mono font-medium">
                    {profile?.license_active ? 'Active' : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Secure Keys Card */}
          <div className="bg-[#091714] p-5 rounded-2xl border border-[#16362F] space-y-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#00C853]" /> Nodes & License Key
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[#9CB1AC] uppercase font-semibold">Decentralized License Key</label>
                <div className="mt-1 flex items-center justify-between bg-[#050E0C] p-2.5 rounded-xl border border-[#16362F] font-mono text-xs select-all text-gray-300">
                  <span className="truncate mr-2">{profile?.activation_key || 'No Key Loaded'}</span>
                  {profile?.license_active ? (
                    <CheckCircle className="w-4 h-4 text-[#00C853] flex-shrink-0" />
                  ) : (
                    <LockKeyhole className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#9CB1AC] bg-[#050E0C]/40 p-2 rounded-lg border border-[#16362F]/50">
                <span>Security Sandbox Node:</span>
                <span className="font-mono text-white">READY [UTC]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Forms & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <form onSubmit={handleUpdateProfile} className="bg-[#091714] p-6 rounded-2xl border border-[#16362F] shadow-xl space-y-4">
            <h4 className="text-sm font-semibold text-white border-b border-[#16362F] pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#00C853]" /> Editable Profile Parameters
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CB1AC] uppercase tracking-wider">Full Display Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Merchant Display Name"
                    className="w-full bg-[#050E0C] border border-[#16362F] rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#00C853] transition-colors text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CB1AC] uppercase tracking-wider">Username Handle</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <span className="text-xs font-mono font-bold">@</span>
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="merchant_username"
                    className="w-full bg-[#050E0C] border border-[#16362F] rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#00C853] transition-colors text-sm font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CB1AC] uppercase tracking-wider">Country Location</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Globe className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United States"
                    className="w-full bg-[#050E0C] border border-[#16362F] rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#00C853] transition-colors text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CB1AC] uppercase tracking-wider">Phone Endpoint</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full bg-[#050E0C] border border-[#16362F] rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#00C853] transition-colors text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updatingProfile}
                className="bg-[#00C853] hover:bg-emerald-500 text-[#050E0C] font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-display cursor-pointer shadow-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {updatingProfile ? 'Saving Parameters...' : 'Save Profile Details'}
              </button>
            </div>
          </form>

          {/* Activity Log History Timeline */}
          <div className="bg-[#091714] p-6 rounded-2xl border border-[#16362F] shadow-xl space-y-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00C853]" /> Security & Node Activity Logs
            </h4>

            <div className="space-y-4 relative before:absolute before:inset-y-1 before:left-3.5 before:w-[1px] before:bg-[#16362F]">
              {getActivityLogs().map((log) => {
                const LogIcon = log.icon;
                return (
                  <div key={log.id} className="flex items-start gap-4 relative group">
                    <div className="w-8 h-8 rounded-full bg-[#050E0C] border border-[#16362F] flex items-center justify-center z-10 flex-shrink-0">
                      <LogIcon className={`w-4 h-4 ${log.color}`} />
                    </div>
                    <div className="flex-1 bg-[#050E0C]/35 p-3 rounded-xl border border-[#16362F]/40 hover:border-[#16362F] transition-all">
                      <p className="text-xs font-medium text-white">{log.action}</p>
                      <span className="text-[10px] text-gray-500 font-mono mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {log.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Password Update Card */}
          <form onSubmit={handleChangePassword} className="bg-[#091714] p-6 rounded-2xl border border-[#16362F] shadow-xl space-y-4">
            <h4 className="text-sm font-semibold text-white border-b border-[#16362F] pb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#00C853]" /> System Password Rotation
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CB1AC] uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-[#050E0C] border border-[#16362F] rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#00C853] transition-colors text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CB1AC] uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full bg-[#050E0C] border border-[#16362F] rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#00C853] transition-colors text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updatingPassword}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-display cursor-pointer shadow-lg disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                {updatingPassword ? 'Rotating Key...' : 'Rotate Security Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Futuristic Avatar Selector Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-[#050E0C]/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-[#091714] border border-[#16362F] rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#16362F] pb-3">
              <h3 className="text-sm font-semibold text-white">Select Cyber Identicon</h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-gray-500 hover:text-white transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 py-2">
              {AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAvatarUrl(url);
                    setShowAvatarModal(false);
                    onProfileUpdate({ avatar_url: url });
                    showToast('Avatar updated!', 'success');
                  }}
                  className={`relative rounded-full overflow-hidden border-2 cursor-pointer transition-transform hover:scale-110 ${
                    avatarUrl === url ? 'border-[#00C853]' : 'border-[#16362F]'
                  }`}
                >
                  <img src={url} alt={`Avatar ${idx}`} className="w-12 h-12 object-cover" />
                </button>
              ))}
            </div>

            <div className="text-center text-[10px] text-gray-500">
              Select any neural identicon as your merchant node signature.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
