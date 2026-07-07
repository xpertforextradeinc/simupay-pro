import React, { useState } from 'react';
import { 
  Users, Search, Edit2, Save, Trash2, Shield, UserX, UserCheck, 
  Sparkles, Calendar, ArrowUpRight, History, Info, X
} from 'lucide-react';
import { Profile } from '../../types';

interface AdminUsersProps {
  profiles: Profile[];
  onUpdateProfile: (userId: string, updatedData: Partial<Profile>) => Promise<void>;
  onDeleteProfile: (userId: string) => Promise<void>;
}

export function AdminUsers({ profiles, onUpdateProfile, onDeleteProfile }: AdminUsersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user' | 'owner'>('all');
  const [licenseFilter, setLicenseFilter] = useState<'all' | 'premium' | 'free' | 'suspended'>('all');
  
  // Selected user for details modal
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  
  // Inline edit state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editRole, setEditRole] = useState<'admin' | 'user' | 'owner'>('user');
  
  // Date extender state
  const [daysToExtend, setDaysToExtend] = useState('30');

  // Filter profiles
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = 
      p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesRole = 
      roleFilter === 'all' || 
      p.role === roleFilter || 
      (roleFilter === 'owner' && (p.role as any) === 'owner');
      
    const matchesLicense = 
      licenseFilter === 'all' ||
      (licenseFilter === 'premium' && p.license_active) ||
      (licenseFilter === 'free' && !p.license_active) ||
      (licenseFilter === 'suspended' && (p as any).suspended);

    return matchesSearch && matchesRole && matchesLicense;
  });

  const handleStartEdit = (user: Profile) => {
    setEditingUserId(user.id);
    setEditName(user.full_name || '');
    setEditBalance(user.wallet_balance || 0);
    setEditRole((user.role as any) || 'user');
  };

  const handleSaveEdit = async (userId: string) => {
    await onUpdateProfile(userId, {
      full_name: editName,
      wallet_balance: editBalance,
      role: editRole as any
    });
    setEditingUserId(null);
    if (selectedUser?.id === userId) {
      setSelectedUser({
        ...selectedUser,
        full_name: editName,
        wallet_balance: editBalance,
        role: editRole as any
      });
    }
  };

  const handleToggleSuspension = async (user: Profile) => {
    const currentlySuspended = (user as any).suspended || false;
    const nextSuspended = !currentlySuspended;
    await onUpdateProfile(user.id, {
      license_active: nextSuspended ? false : user.license_active,
      // store suspension state as custom property
      suspended: nextSuspended
    } as any);
    
    if (selectedUser?.id === user.id) {
      setSelectedUser({
        ...selectedUser,
        license_active: nextSuspended ? false : selectedUser.license_active,
        suspended: nextSuspended
      } as any);
    }
  };

  const handleUpgradeLicense = async (userId: string, tier: 'Standard' | 'Enterprise', active: boolean) => {
    const durationDays = 30;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + durationDays);
    
    await onUpdateProfile(userId, {
      license_active: active,
      license_type: tier,
      subscription_status: active ? 'Active' : 'N/A',
      expiry_date: active ? expiry.toISOString() : undefined
    });

    if (selectedUser?.id === userId) {
      setSelectedUser({
        ...selectedUser,
        license_active: active,
        license_type: tier,
        subscription_status: active ? 'Active' : 'N/A',
        expiry_date: active ? expiry.toISOString() : undefined
      });
    }
  };

  const handleExtendSubscription = async (userId: string) => {
    const days = parseInt(daysToExtend) || 30;
    const user = profiles.find(p => p.id === userId);
    if (!user) return;

    let currentExpiry = user.expiry_date ? new Date(user.expiry_date) : new Date();
    if (currentExpiry.getTime() < Date.now()) {
      currentExpiry = new Date(); // Reset to today if already expired
    }
    currentExpiry.setDate(currentExpiry.getDate() + days);

    await onUpdateProfile(userId, {
      license_active: true,
      license_type: user.license_type || 'Standard',
      subscription_status: 'Active',
      expiry_date: currentExpiry.toISOString()
    });

    if (selectedUser?.id === userId) {
      setSelectedUser({
        ...selectedUser,
        license_active: true,
        license_type: user.license_type || 'Standard',
        subscription_status: 'Active',
        expiry_date: currentExpiry.toISOString()
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* FILTER & SEARCH ROW */}
      <div className="bg-brand-card p-4 rounded-xl border border-brand-border flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 w-4 h-4 text-brand-text-dim" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search merchants by name, email or ID..."
            className="w-full bg-brand-bg border border-brand-border rounded-xl pl-9 pr-4 py-2 text-brand-text text-xs focus:outline-none focus:border-brand-accent font-mono"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-brand-text text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="user">Standard User</option>
          </select>

          {/* License filter */}
          <select
            value={licenseFilter}
            onChange={(e) => setLicenseFilter(e.target.value as any)}
            className="bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-brand-text text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">All Licenses</option>
            <option value="premium">Premium Only</option>
            <option value="free">Free Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* MERCHANTS TABLE */}
      <div className="bg-brand-card rounded-2xl border border-brand-border overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-bg/60 text-brand-text-muted border-b border-brand-border font-mono">
                <th className="p-4">User/Merchant Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Wallet Balance</th>
                <th className="p-4">License Status</th>
                <th className="p-4">System Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16362F]/40 font-mono">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-brand-text-dim italic">No merchant profiles match current search criteria.</td>
                </tr>
              ) : (
                filteredProfiles.map((user) => {
                  const isEditing = editingUserId === user.id;
                  const isSuspended = (user as any).suspended || false;
                  
                  return (
                    <tr key={user.id} className="hover:bg-brand-bg/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand-accent/15 border border-brand-accent/35 flex items-center justify-center font-bold text-brand-accent">
                            {user.full_name?.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() || 'M'}
                          </div>
                          <div>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text text-xs focus:outline-none"
                              />
                            ) : (
                              <span className="font-semibold text-brand-text block hover:underline cursor-pointer" onClick={() => setSelectedUser(user)}>
                                {user.full_name || 'Anonymous Merchant'}
                              </span>
                            )}
                            <span className="text-[10px] text-brand-text-dim block truncate max-w-[150px]">{user.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-brand-text-muted">{user.email}</td>
                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editBalance}
                            onChange={(e) => setEditBalance(parseFloat(e.target.value) || 0)}
                            className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text text-xs w-24 focus:outline-none"
                          />
                        ) : (
                          <span className="text-brand-text font-bold">₦{user.wallet_balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {isSuspended ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/10 text-red-500 uppercase">
                            Suspended
                          </span>
                        ) : user.license_active ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-accent/10 text-brand-accent uppercase">
                            {user.license_type || 'PRO'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/10 text-brand-text-muted uppercase">
                            FREE TIER
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as any)}
                            className="bg-brand-bg border border-brand-border rounded py-0.5 px-2 text-brand-text text-xs focus:outline-none"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-brand-text-dim'}`}>
                            {user.role || 'USER'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(user.id)}
                                className="bg-brand-accent text-[#050E0C] px-2 py-1 rounded hover:bg-emerald-400 font-bold text-[10px]"
                              >
                                SAVE
                              </button>
                              <button
                                onClick={() => setEditingUserId(null)}
                                className="bg-brand-surface text-brand-text px-2 py-1 rounded text-[10px]"
                              >
                                CANCEL
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="text-brand-accent hover:underline hover:text-emerald-400 text-[10px] uppercase font-bold"
                              >
                                VIEW
                              </button>
                              <button
                                onClick={() => handleStartEdit(user)}
                                className="text-brand-text-muted hover:text-brand-text text-[10px]"
                              >
                                EDIT
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED USER PROFILE MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-brand-bg border-b border-brand-border flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-accent" />
                <h3 className="text-sm font-bold text-brand-text uppercase font-mono">Merchant Control Profile</h3>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-1 text-brand-text-muted hover:text-brand-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Side: General Profile Summary */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-brand-bg p-4 rounded-xl border border-brand-border">
                    <div className="w-12 h-12 rounded-full bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center text-lg font-bold text-brand-accent">
                      {selectedUser.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-brand-text leading-snug">{selectedUser.full_name || 'Anonymous Merchant'}</h4>
                      <p className="text-[10px] text-brand-text-dim font-mono truncate">{selectedUser.id}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between p-2 rounded bg-black/25">
                      <span className="text-brand-text-dim">Corporate Email:</span>
                      <span className="text-brand-text">{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-black/25">
                      <span className="text-brand-text-dim">Wallet Balance:</span>
                      <span className="text-brand-accent font-bold">₦{selectedUser.wallet_balance?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-black/25">
                      <span className="text-brand-text-dim">System Role:</span>
                      <span className="text-brand-text uppercase font-bold">{selectedUser.role || 'user'}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-black/25">
                      <span className="text-brand-text-dim">Joined Date:</span>
                      <span className="text-brand-text">
                        {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Subscription Extender & Upgrade Console */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider font-mono">License Management</h4>

                  <div className="space-y-3">
                    {/* License status badges */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-brand-border bg-black/30 text-xs font-mono">
                      <span>License Type:</span>
                      <span className="font-bold text-brand-text uppercase">
                        {(selectedUser as any).suspended ? 'Suspended (Locked)' : selectedUser.license_active ? selectedUser.license_type || 'Standard' : 'Free Trial'}
                      </span>
                    </div>

                    {/* Quick premium upgrades */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleUpgradeLicense(selectedUser.id, 'Standard', true)}
                        className="p-2 bg-emerald-950/40 hover:bg-brand-accent/10 border border-brand-accent/20 hover:border-brand-accent text-brand-text rounded-lg text-[10px] font-bold uppercase transition-all"
                      >
                        Set standard Pro
                      </button>
                      <button
                        onClick={() => handleUpgradeLicense(selectedUser.id, 'Enterprise', true)}
                        className="p-2 bg-blue-950/40 hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500 text-brand-text rounded-lg text-[10px] font-bold uppercase transition-all"
                      >
                        Set Enterprise
                      </button>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handleUpgradeLicense(selectedUser.id, 'Standard', false)}
                        className="w-full p-2 bg-gray-950 hover:bg-gray-900 border border-gray-800 text-red-400 rounded-lg text-[10px] font-bold uppercase transition-all"
                      >
                        Downgrade to Free Tier
                      </button>
                    </div>
                  </div>

                  {/* Date Extender Section */}
                  {selectedUser.license_active && (
                    <div className="space-y-2 border-t border-brand-border pt-4">
                      <h4 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider font-mono">Extend Expiry Date</h4>
                      <div className="flex gap-2">
                        <select
                          value={daysToExtend}
                          onChange={(e) => setDaysToExtend(e.target.value)}
                          className="bg-brand-bg border border-brand-border rounded-lg px-2 py-1.5 text-brand-text text-xs font-mono flex-1 focus:outline-none"
                        >
                          <option value="30">30 Days</option>
                          <option value="90">90 Days</option>
                          <option value="365">1 Year</option>
                        </select>
                        <button
                          onClick={() => handleExtendSubscription(selectedUser.id)}
                          className="px-3 py-1.5 bg-brand-accent hover:bg-emerald-400 text-[#050E0C] font-bold text-xs rounded-lg uppercase"
                        >
                          Extend
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Administrative Security Options */}
              <div className="border-t border-brand-border pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono">
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleToggleSuspension(selectedUser)}
                    className={`flex-1 sm:flex-initial px-3 py-2 border rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all
                      ${(selectedUser as any).suspended 
                        ? 'bg-emerald-500/10 border-brand-accent/40 text-brand-accent hover:bg-emerald-500/20' 
                        : 'bg-red-500/10 border-red-500/40 text-red-500 hover:bg-red-500/20'
                      }`}
                  >
                    {(selectedUser as any).suspended ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" /> Reactivate Merchant
                      </>
                    ) : (
                      <>
                        <UserX className="w-3.5 h-3.5" /> Suspend Merchant Account
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={async () => {
                    if (window.confirm(`CRITICAL WARNING: Are you absolutely sure you want to permanently delete user ${selectedUser.email}? This action is irreversible!`)) {
                      await onDeleteProfile(selectedUser.id);
                      setSelectedUser(null);
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-500 text-brand-text rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-lg transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete User Permanently
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
