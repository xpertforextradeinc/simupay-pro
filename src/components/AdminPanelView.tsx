import React, { useState, useEffect } from 'react';
import { 
  Users, CreditCard, Key, LifeBuoy, Plus, Trash, CheckCircle, Clock, 
  AlertCircle, Edit, Save, Search, DollarSign, RefreshCw, Star, Shield, ArrowRight
} from 'lucide-react';
import { useToast } from './Toast';
import { dbService } from '../services/dbService';
import { Profile, Subscription, ActivationKey, SupportTicket, Transaction } from '../types';

interface AdminPanelViewProps {
  currentUserId: string;
}

export function AdminPanelView({ currentUserId }: AdminPanelViewProps) {
  const { showToast } = useToast();
  
  // Data State
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activationKeys, setActivationKeys] = useState<ActivationKey[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filtering State
  const [profileSearch, setProfileSearch] = useState('');
  const [subFilter, setSubFilter] = useState<'all' | 'active' | 'expired' | 'canceled'>('all');
  const [keyFilter, setKeyFilter] = useState<'all' | 'unused' | 'active'>('all');

  // Form States (New Item Generation)
  const [newKeyString, setNewKeyString] = useState('');
  const [newKeyType, setNewKeyType] = useState<'Standard' | 'Enterprise'>('Standard');
  const [newKeyExpiryDays, setNewKeyExpiryDays] = useState<number>(30);
  
  const [newSubUserId, setNewSubUserId] = useState('');
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubPlanName, setNewSubPlanName] = useState('SimuPay Pro Quarterly');
  const [newSubAmount, setNewSubAmount] = useState(75000);
  const [newSubCycle, setNewSubCycle] = useState<'Monthly' | 'Quarterly' | 'Annual' | 'Lifetime'>('Quarterly');

  // Edit States
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editRole, setEditRole] = useState<'admin' | 'user'>('user');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [allProfiles, allSubs, allKeys, allTickets] = await Promise.all([
        dbService.getAllProfiles(),
        dbService.getAllSubscriptions(),
        dbService.getActivationKeys(currentUserId), // this returns all from supabase/local fallback
        dbService.getAllSupportTicketsAdmin()
      ]);

      setProfiles(allProfiles);
      setSubscriptions(allSubs);
      setActivationKeys(allKeys);
      setTickets(allTickets);
    } catch (e) {
      showToast('Failed to retrieve full corporate metrics from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Profile Action: Save Balance / Role changes
  const handleSaveUserProfile = async (userId: string) => {
    try {
      await dbService.updateUserBalance(userId, editBalance);
      await dbService.updateUserRole(userId, editRole);
      
      showToast('Merchant credentials and balances saved successfully!', 'success');
      setEditingUserId(null);
      fetchAdminData();
    } catch (err) {
      showToast('Failed to commit user profile changes.', 'error');
    }
  };

  // Support Ticket Action: Update status
  const handleUpdateTicketStatus = async (ticketId: string, status: 'open' | 'pending' | 'resolved') => {
    try {
      await dbService.updateSupportTicketStatus(ticketId, status);
      showToast(`Ticket status marked as ${status}.`, 'success');
      fetchAdminData();
    } catch (err) {
      showToast('Failed to update ticket status.', 'error');
    }
  };

  // Activation Key Action: Generate custom key
  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const keyToCreate = newKeyString.trim().toUpperCase() || `SPP-KEY-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    try {
      await dbService.createActivationKey(keyToCreate, newKeyType, newKeyExpiryDays);
      showToast(`Key ${keyToCreate} generated successfully!`, 'success');
      setNewKeyString('');
      fetchAdminData();
    } catch (err) {
      showToast('Failed to register brand new activation key.', 'error');
    }
  };

  // Activation Key Action: Delete key
  const handleDeleteKey = async (keyId: string) => {
    if (!window.confirm('Are you sure you want to delete this activation key?')) return;
    try {
      await dbService.deleteActivationKey(keyId);
      showToast('Activation key deleted.', 'success');
      fetchAdminData();
    } catch (err) {
      showToast('Failed to delete key.', 'error');
    }
  };

  // Subscription Action: Create Manual Sub
  const handleCreateManualSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubUserId || !newSubEmail) {
      showToast('User ID and Email are mandatory fields.', 'warning');
      return;
    }

    try {
      const reference = `SPP-ADMIN-MANUAL-${Math.floor(100000 + Math.random() * 900000)}`;
      await dbService.createSubscription(
        newSubUserId,
        newSubEmail,
        newSubPlanName,
        'PLN_admin_override',
        newSubAmount,
        newSubCycle,
        reference
      );

      // Instantly auto-upgrade that user's profile to Enterprise too!
      const days = newSubCycle === 'Monthly' ? 30 : newSubCycle === 'Quarterly' ? 90 : newSubCycle === 'Annual' ? 365 : 36500;
      await dbService.updateProfile(newSubUserId, {
        license_active: true,
        license_type: 'Enterprise',
        subscription_status: 'Active',
        expiry_date: new Date(Date.now() + days * 24 * 3600 * 1000).toISOString()
      });

      showToast('Manual subscription logged and user profile upgraded!', 'success');
      setNewSubUserId('');
      setNewSubEmail('');
      fetchAdminData();
    } catch (err) {
      showToast('Failed to create manual subscription records.', 'error');
    }
  };

  // Subscription Action: Delete Sub
  const handleDeleteSub = async (subId: string) => {
    if (!window.confirm('Delete this subscription registry?')) return;
    try {
      await dbService.deleteSubscription(subId);
      showToast('Subscription record removed.', 'success');
      fetchAdminData();
    } catch (err) {
      showToast('Failed to drop subscription record.', 'error');
    }
  };

  // Subscription Action: Toggle Status
  const handleUpdateSubStatus = async (subId: string, status: 'active' | 'expired' | 'canceled') => {
    try {
      await dbService.updateSubscriptionStatus(subId, status);
      showToast(`Subscription status updated to ${status}.`, 'success');
      fetchAdminData();
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  // Calculate high level stats
  const totalUsers = profiles.length;
  const activeSubsCount = subscriptions.filter(s => s.status === 'active').length;
  const totalRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + Number(s.amount), 0);
  const activeTicketsCount = tickets.filter(t => t.status !== 'resolved').length;

  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(profileSearch.toLowerCase()) ||
    p.email?.toLowerCase().includes(profileSearch.toLowerCase()) ||
    p.id?.toLowerCase().includes(profileSearch.toLowerCase())
  );

  const filteredSubs = subscriptions.filter(s => {
    if (subFilter === 'all') return true;
    return s.status === subFilter;
  });

  const filteredKeys = activationKeys.filter(k => {
    if (keyFilter === 'all') return true;
    return k.status === keyFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <RefreshCw className="w-8 h-8 text-[#00C853] animate-spin" />
        <p className="text-xs text-gray-500 font-mono">Decoding admin credentials & dashboard widgets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#16362F] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#00C853]" />
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Administrative Control Node</h2>
          </div>
          <p className="text-xs text-gray-500">Full system access over global users, ledger keys, billing pipelines, and support queues.</p>
        </div>
        <button 
          onClick={fetchAdminData}
          className="bg-[#091714] border border-[#16362F] hover:border-[#00C853] text-white px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 font-mono cursor-pointer transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#00C853]" /> Reload Metrics
        </button>
      </div>

      {/* METRICS BENTO GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total users */}
        <div className="bg-[#091714] p-5 rounded-2xl border border-[#16362F] flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Registered Users</span>
            <h3 className="text-2xl font-bold text-white font-display">{totalUsers}</h3>
            <p className="text-[9px] text-emerald-500 font-mono">● 100% cloud synced</p>
          </div>
          <div className="p-3 bg-[#00C853]/10 text-[#00C853] rounded-xl border border-[#00C853]/25">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Active Subs */}
        <div className="bg-[#091714] p-5 rounded-2xl border border-[#16362F] flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Active Premium Subs</span>
            <h3 className="text-2xl font-bold text-white font-display">{activeSubsCount}</h3>
            <p className="text-[9px] text-blue-400 font-mono">
              Monthly ({subscriptions.filter(s => s.status === 'active' && s.billing_cycle === 'Monthly').length}) | 
              Quarterly ({subscriptions.filter(s => s.status === 'active' && s.billing_cycle === 'Quarterly').length})
            </p>
          </div>
          <div className="p-3 bg-[#1D4ED8]/10 text-blue-400 rounded-xl border border-blue-500/25">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-[#091714] p-5 rounded-2xl border border-[#16362F] flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Active Sub Revenue</span>
            <h3 className="text-2xl font-bold text-[#00C853] font-mono">₦{totalRevenue.toLocaleString()}</h3>
            <p className="text-[9px] text-gray-500 font-sans">Sum of all live premium licenses</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/25">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Support ticket load */}
        <div className="bg-[#091714] p-5 rounded-2xl border border-[#16362F] flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Unresolved Tickets</span>
            <h3 className="text-2xl font-bold text-amber-500 font-display">{activeTicketsCount}</h3>
            <p className="text-[9px] text-gray-500 font-sans">Open support requests needing resolution</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/25">
            <LifeBuoy className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ADMIN CONTROL VIEWS MODULES */}
      <div className="space-y-8">

        {/* 1. USER PROFILES MANAGER */}
        <div className="bg-[#091714] border border-[#16362F] rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 bg-[#050E0C] border-b border-[#16362F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00C853]" />
              <h3 className="text-sm font-semibold text-white">Merchant Profiles</h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, email or ID..."
                value={profileSearch}
                onChange={(e) => setProfileSearch(e.target.value)}
                className="bg-[#050E0C] border border-[#16362F] rounded-xl pl-9 pr-4 py-1.5 text-white text-xs w-full sm:w-64 focus:outline-none focus:border-[#00C853]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#050e0c]/50 text-gray-400 border-b border-[#16362F] font-mono">
                  <th className="p-4">Merchant Name / ID</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Wallet Balance</th>
                  <th className="p-4">License Status</th>
                  <th className="p-4">System Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#16362F]/40">
                {filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500 italic">No matching merchant profiles found in databases.</td>
                  </tr>
                ) : (
                  filteredProfiles.map((user) => {
                    const isEditing = editingUserId === user.id;
                    return (
                      <tr key={user.id} className="hover:bg-[#050e0c]/25 transition-all">
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-white block">{user.full_name || 'SimuPay Merchant'}</span>
                            <span className="text-[10px] text-gray-500 font-mono block truncate max-w-[120px]">{user.id}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300 font-mono">{user.email}</td>
                        <td className="p-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editBalance}
                              onChange={(e) => setEditBalance(parseFloat(e.target.value) || 0)}
                              className="bg-[#050E0C] border border-[#16362F] rounded px-2 py-1 text-white font-mono w-28 text-xs focus:outline-none"
                            />
                          ) : (
                            <span className="font-mono text-white">₦{user.wallet_balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase
                            ${user.license_active ? 'bg-[#00C853]/15 text-[#00C853]' : 'bg-red-500/10 text-red-400'}
                          `}>
                            {user.license_active ? `${user.license_type || 'PRO'}` : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4">
                          {isEditing ? (
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value as 'admin' | 'user')}
                              className="bg-[#050E0C] border border-[#16362F] rounded px-2 py-1 text-white text-xs focus:outline-none"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold
                              ${user.role === 'admin' ? 'bg-[#1D4ED8]/15 text-[#1D4ED8]' : 'bg-gray-500/10 text-gray-400'}
                            `}>
                              {user.role?.toUpperCase() || 'USER'}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleSaveUserProfile(user.id)}
                                className="bg-[#00C853] text-[#050E0C] p-1.5 rounded hover:bg-emerald-400 cursor-pointer"
                                title="Save Profile Preferences"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingUserId(null)}
                                className="bg-[#16362F] text-gray-400 p-1.5 rounded hover:text-white cursor-pointer"
                                title="Cancel"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingUserId(user.id);
                                setEditBalance(user.wallet_balance);
                                setEditRole(user.role || 'user');
                              }}
                              className="text-[#00C853] hover:text-emerald-400 flex items-center gap-1 cursor-pointer font-mono inline-block text-xs"
                            >
                              <Edit className="w-3 h-3" /> Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. SUBSCRIPTIONS MANAGER */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* List existing subscriptions */}
          <div className="lg:col-span-3 bg-[#091714] border border-[#16362F] rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
            <div>
              <div className="px-6 py-4 bg-[#050E0C] border-b border-[#16362F] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-white">Subscription Registry</h3>
                </div>
                <select
                  value={subFilter}
                  onChange={(e) => setSubFilter(e.target.value as any)}
                  className="bg-[#050E0C] border border-[#16362F] rounded-xl px-2.5 py-1 text-white text-xs font-mono focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>

              <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#050e0c]/50 text-gray-400 border-b border-[#16362F] font-mono sticky top-0">
                    <tr>
                      <th className="p-3">User Email / Reference</th>
                      <th className="p-3">Plan Details</th>
                      <th className="p-3">Expiry</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#16362F]/30">
                    {filteredSubs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500 italic">No subscriptions registered in the server.</td>
                      </tr>
                    ) : (
                      filteredSubs.map((sub) => (
                        <tr key={sub.id} className="hover:bg-[#050e0c]/25 transition-all text-[11px]">
                          <td className="p-3 font-mono">
                            <div className="space-y-0.5">
                              <span className="text-white font-semibold block">{sub.email || 'N/A'}</span>
                              <span className="text-gray-500 block truncate max-w-[140px]">{sub.payment_reference || sub.id}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-0.5">
                              <span className="text-white block">{sub.plan_name}</span>
                              <span className="text-[10px] text-gray-500 block">₦{sub.amount?.toLocaleString()} ({sub.billing_cycle})</span>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-gray-400">
                            {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-3">
                            <select
                              value={sub.status}
                              onChange={(e) => handleUpdateSubStatus(sub.id, e.target.value as any)}
                              className={`bg-[#050E0C] border border-[#16362F] rounded text-[10px] font-mono font-bold py-0.5 px-1 focus:outline-none
                                ${sub.status === 'active' ? 'text-[#00C853]' : ''}
                                ${sub.status === 'expired' ? 'text-amber-500' : ''}
                                ${sub.status === 'canceled' ? 'text-red-400' : ''}
                              `}
                            >
                              <option value="active">Active</option>
                              <option value="expired">Expired</option>
                              <option value="canceled">Canceled</option>
                            </select>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteSub(sub.id)}
                              className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                              title="Delete sub record"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="p-4 bg-[#050e0c]/40 border-t border-[#16362F] text-[10px] text-gray-500 italic">
              * Updating subscription statuses here directly influences billing restrictions inside client dashboard viewports.
            </div>
          </div>

          {/* Add Manual Subscription form */}
          <form onSubmit={handleCreateManualSub} className="lg:col-span-2 bg-[#091714] p-5 rounded-2xl border border-[#16362F] shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-[#16362F] pb-2">
              <Plus className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-white">Issue Manual Upgrade</h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">Merchant/User ID</label>
                <input
                  type="text"
                  value={newSubUserId}
                  onChange={(e) => setNewSubUserId(e.target.value)}
                  placeholder="Paste user ID from profiles above..."
                  className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">User Corporate Email</label>
                <input
                  type="email"
                  value={newSubEmail}
                  onChange={(e) => setNewSubEmail(e.target.value)}
                  placeholder="e.g. client@simupay.pro"
                  className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">Billing Cycle</label>
                  <select
                    value={newSubCycle}
                    onChange={(e) => {
                      const cycle = e.target.value as any;
                      setNewSubCycle(cycle);
                      setNewSubAmount(cycle === 'Monthly' ? 30000 : cycle === 'Quarterly' ? 75000 : cycle === 'Annual' ? 250000 : 999000);
                    }}
                    className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                    <option value="Lifetime">Lifetime</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">Assigned Amount (₦)</label>
                  <input
                    type="number"
                    value={newSubAmount}
                    onChange={(e) => setNewSubAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg px-2 py-1.5 text-white text-xs font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">Plan Nomenclature</label>
                <input
                  type="text"
                  value={newSubPlanName}
                  onChange={(e) => setNewSubPlanName(e.target.value)}
                  className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Commit Manual Sub
            </button>
          </form>
        </div>

        {/* 3. ACTIVATION KEY GENERATOR */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* List existing activation keys */}
          <div className="lg:col-span-3 bg-[#091714] border border-[#16362F] rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
            <div>
              <div className="px-6 py-4 bg-[#050E0C] border-b border-[#16362F] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#00C853]" />
                  <h3 className="text-sm font-semibold text-white">License Activation Keys</h3>
                </div>
                <select
                  value={keyFilter}
                  onChange={(e) => setKeyFilter(e.target.value as any)}
                  className="bg-[#050E0C] border border-[#16362F] rounded-xl px-2.5 py-1 text-white text-xs font-mono focus:outline-none"
                >
                  <option value="all">All Keys</option>
                  <option value="unused">Unused Keys</option>
                  <option value="active">Activated Keys</option>
                </select>
              </div>

              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#050e0c]/50 text-gray-400 border-b border-[#16362F] font-mono sticky top-0">
                    <tr>
                      <th className="p-3">Key Pattern</th>
                      <th className="p-3">Tier</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Assigned User</th>
                      <th className="p-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#16362F]/30">
                    {filteredKeys.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500 italic">No activation keys registered. Generate one in side panel.</td>
                      </tr>
                    ) : (
                      filteredKeys.map((keyObj) => (
                        <tr key={keyObj.id} className="hover:bg-[#050e0c]/25 transition-all text-[11px] font-mono">
                          <td className="p-3 text-white font-bold tracking-wide">{keyObj.activation_key}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                              ${keyObj.license_type === 'Enterprise' ? 'bg-[#00C853]/15 text-[#00C853]' : 'bg-gray-500/10 text-gray-400'}
                            `}>
                              {keyObj.license_type}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase
                              ${keyObj.status === 'unused' ? 'bg-[#00C853]/10 text-[#00C853]' : 'bg-amber-500/15 text-amber-500'}
                            `}>
                              {keyObj.status}
                            </span>
                          </td>
                          <td className="p-3 text-gray-400 truncate max-w-[120px]" title={keyObj.assigned_user || ''}>
                            {keyObj.assigned_user || '—'}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteKey(keyObj.id)}
                              className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="p-4 bg-[#050e0c]/40 border-t border-[#16362F] text-[10px] text-gray-500 italic">
              * Merchants can use these keys directly inside their own panels under "Activation Key" tab to instantly unlock license levels.
            </div>
          </div>

          {/* Key Generator form */}
          <form onSubmit={handleGenerateKey} className="lg:col-span-2 bg-[#091714] p-5 rounded-2xl border border-[#16362F] shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-[#16362F] pb-2">
              <Plus className="w-4 h-4 text-[#00C853]" />
              <h3 className="text-sm font-semibold text-white">Generate License Keys</h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">Custom Key Value (Optional)</label>
                <input
                  type="text"
                  value={newKeyString}
                  onChange={(e) => setNewKeyString(e.target.value)}
                  placeholder="e.g. SPP-LICENSE-XY77"
                  className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-[#00C853]"
                />
                <span className="text-[9px] text-gray-500 block">Leave blank for random security hash key generation.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">License Type</label>
                  <select
                    value={newKeyType}
                    onChange={(e) => setNewKeyType(e.target.value as any)}
                    className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none"
                  >
                    <option value="Standard">Standard Key</option>
                    <option value="Enterprise">Enterprise Key</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">Expires In (Days)</label>
                  <input
                    type="number"
                    value={newKeyExpiryDays}
                    onChange={(e) => setNewKeyExpiryDays(parseInt(e.target.value) || 30)}
                    className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg px-2 py-1.5 text-white text-xs font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#00C853] hover:bg-emerald-400 text-[#050E0C] font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all"
            >
              <Key className="w-3.5 h-3.5" /> Mint Secure Key
            </button>
          </form>
        </div>

        {/* 4. SUPPORT TICKETS QUEUE */}
        <div className="bg-[#091714] border border-[#16362F] rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 bg-[#050E0C] border-b border-[#16362F] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-[#00C853]" />
              <h3 className="text-sm font-semibold text-white">Merchant Service Queue</h3>
            </div>
            <span className="text-[10px] font-mono text-gray-500">REALTIME AUDITING GATEWAY</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#050e0c]/50 text-gray-400 border-b border-[#16362F] font-mono">
                  <th className="p-4">Ticket ID / Date</th>
                  <th className="p-4">Merchant ID</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Detailed Message</th>
                  <th className="p-4">Status & Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#16362F]/30">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 italic">No tickets found in developer support queue.</td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-[#050e0c]/25 transition-all">
                      <td className="p-4 font-mono">
                        <div className="space-y-0.5">
                          <span className="text-white font-bold block">{ticket.id}</span>
                          <span className="text-[10px] text-gray-500 block">{new Date(ticket.created_at).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-gray-400 truncate max-w-[120px]" title={ticket.user_id}>
                        {ticket.user_id}
                      </td>
                      <td className="p-4 text-white font-semibold">{ticket.subject}</td>
                      <td className="p-4 text-gray-300 max-w-xs break-words whitespace-normal leading-relaxed">{ticket.message}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={ticket.status}
                            onChange={(e) => handleUpdateTicketStatus(ticket.id, e.target.value as any)}
                            className={`bg-[#050E0C] border border-[#16362F] rounded text-[10px] font-mono font-bold py-1 px-2 focus:outline-none cursor-pointer
                              ${ticket.status === 'resolved' ? 'text-[#00C853]' : ''}
                              ${ticket.status === 'pending' ? 'text-amber-500' : ''}
                              ${ticket.status === 'open' ? 'text-blue-500' : ''}
                            `}
                          >
                            <option value="open">Open</option>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
