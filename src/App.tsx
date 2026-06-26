import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { ToastProvider, useToast } from './components/Toast';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AccountView } from './components/AccountView';
import { WalletView } from './components/WalletView';
import { ActivationView } from './components/ActivationView';
import { FlashTransferView } from './components/FlashTransferView';
import { ReceiptGeneratorView } from './components/ReceiptGeneratorView';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { SmsCenterView, OrdersView, SupportView, SettingsView } from './components/UtilityViews';
import { NotificationsView } from './components/NotificationsView';
import { DbSetupView } from './components/DbSetupView';
import { dbService } from './services/dbService';
import { ActiveTab, Profile, Transaction, AppNotification, SupportTicket } from './types';
import { KeyRound, ShieldAlert, LogOut, Search, Bell, ChevronDown, User, Settings, Database } from 'lucide-react';

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

function AppContent() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { showToast } = useToast();

  // Core Business States
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Recover Session on Mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        syncUserData(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        syncUserData(session.user);
      } else {
        setProfile(null);
        setTransactions([]);
        setNotifications([]);
        setSupportTickets([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch or Sync User Profile & Logs
  const syncUserData = async (user: any) => {
    try {
      // A. Profile Sync
      const finalProfile = await dbService.getProfile(user.id);
      setProfile(finalProfile);

      // B. Transactions Sync
      const txData = await dbService.getTransactions(user.id);
      setTransactions(txData);

      // C. Notifications Sync
      const notifData = await dbService.getNotifications(user.id);
      setNotifications(notifData);

      // D. Support Tickets Sync
      const ticketsData = await dbService.getSupportTickets(user.id);
      setSupportTickets(ticketsData);

    } catch (e) {
      console.error('Graceful initialization fallback enabled:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveTab('dashboard');
    showToast('Logged out securely.', 'info');
  };

  const handleBalanceUpdate = (newBalance: number) => {
    if (profile) {
      setProfile({
        ...profile,
        wallet_balance: newBalance
      });
    }
  };

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleActivateSuccess = () => {
    if (profile) {
      setProfile({
        ...profile,
        license_active: true
      });
    }
  };

  const handleProfileUpdate = (updatedFields: Partial<Profile>) => {
    if (profile) {
      setProfile({
        ...profile,
        ...updatedFields
      });
    }
  };

  const handleCopyWalletAddress = () => {
    navigator.clipboard.writeText('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
    showToast('Secure vault address copied!', 'success');
  };

  // Render Loading Overlay
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#00C853]/20 border-t-[#00C853] animate-spin mb-4" />
        <h2 className="text-sm font-semibold text-gray-300 font-mono tracking-wider">SECURE SYSTEM BOOTING...</h2>
      </div>
    );
  }

  // Render Unauthenticated Screen
  if (!session) {
    return <Auth onAuthSuccess={(sess) => setSession(sess)} />;
  }

  // Render Dashboard Layout Shell
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col lg:flex-row text-gray-200">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogout={handleLogout}
        fullName={profile?.full_name ?? 'Merchant'}
        email={profile?.email ?? ''}
        licenseActive={profile?.license_active ?? false}
        walletBalance={profile?.wallet_balance ?? 0}
      />

      {/* Main content body */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 overflow-y-auto max-h-screen flex flex-col">
        
        {/* Top Sticky/Premium Navigation Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-[#16362F]/60 pb-5 mb-6">
          {/* Left: Quick search input */}
          <div className="relative w-full sm:max-w-xs z-50">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#9CB1AC]">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services or hash keys..."
              className="w-full bg-[#091714] border border-[#16362F] rounded-xl py-2 pl-9 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00C853] text-xs font-mono"
            />
            {searchQuery && (
              <div className="absolute left-0 mt-2 w-72 bg-[#091714] border border-[#16362F] rounded-xl shadow-2xl p-2 space-y-2 text-xs font-sans max-h-96 overflow-y-auto">
                {(() => {
                  const filteredSearchTx = transactions.filter(t => 
                    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.wallet.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (t.tx_hash && t.tx_hash.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    t.network.toLowerCase().includes(searchQuery.toLowerCase())
                  ).slice(0, 3);

                  const filteredSearchNotifs = notifications.filter(n => 
                    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    n.message.toLowerCase().includes(searchQuery.toLowerCase())
                  ).slice(0, 3);

                  if (filteredSearchTx.length === 0 && filteredSearchNotifs.length === 0) {
                    return <p className="p-3 text-center text-gray-500 text-xs italic">No matching records found.</p>;
                  }

                  return (
                    <>
                      {filteredSearchTx.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider px-2 border-b border-[#16362F]/30 pb-1">Ledger Records</div>
                          {filteredSearchTx.map(tx => (
                            <button
                              key={tx.id}
                              onClick={() => {
                                setActiveTab('transactions');
                                setSearchQuery('');
                              }}
                              className="w-full text-left p-2 hover:bg-[#16362F]/30 rounded-lg flex justify-between items-center transition-colors cursor-pointer"
                            >
                              <span className="font-mono text-[#00C853] truncate max-w-[150px]">{tx.id}</span>
                              <span className="text-white font-bold">${tx.amount.toLocaleString()}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {filteredSearchNotifs.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <div className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider px-2 border-b border-[#16362F]/30 pb-1">Security Logs</div>
                          {filteredSearchNotifs.map(n => (
                            <button
                              key={n.id}
                              onClick={() => {
                                setActiveTab('notifications');
                                setSearchQuery('');
                              }}
                              className="w-full text-left p-2 hover:bg-[#16362F]/30 rounded-lg space-y-0.5 transition-colors cursor-pointer block"
                            >
                              <span className="text-white font-bold block truncate">{n.title}</span>
                              <span className="text-gray-400 block truncate text-[11px]">{n.message}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Right: Notification badge, Node Status, User Dropdown */}
          <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
            {/* Status cluster */}
            <div className="hidden md:flex items-center gap-3 bg-[#091714]/60 border border-[#16362F]/60 px-3 py-1.5 rounded-xl text-[10px] font-mono text-[#9CB1AC]">
              <span className="flex items-center gap-1.5 text-[#00C853]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" /> CLUSTER-LIVE
              </span>
              <span className="border-l border-[#16362F] pl-2.5">SSL-SECURE</span>
            </div>

            {/* Notification trigger button */}
            <div className="relative">
              <button
                onClick={() => setActiveTab('notifications')}
                className="p-2 bg-[#091714] border border-[#16362F] rounded-xl hover:border-[#00C853]/40 text-[#9CB1AC] hover:text-white transition-all relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 rounded-full text-[9px] font-mono font-bold text-white px-1 leading-none shadow-lg">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Selection Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 bg-[#091714] border border-[#16362F] hover:border-[#00C853]/40 px-3 py-1.5 rounded-xl text-xs font-sans text-[#9CB1AC] hover:text-white transition-all cursor-pointer">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#00C853] to-emerald-800 flex items-center justify-center text-[10px] font-bold text-white uppercase overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="A" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    profile?.full_name?.substring(0, 1) || 'M'
                  )}
                </div>
                <span className="max-w-[90px] truncate font-medium">{profile?.full_name || 'Merchant'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#00C853] transition-colors" />
              </button>

              {/* Hover Dropdown Option Menu */}
              <div className="absolute right-0 mt-1 w-48 bg-[#091714] border border-[#16362F] rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-1.5 space-y-1">
                <div className="px-2.5 py-1.5 border-b border-[#16362F] mb-1">
                  <p className="text-[10px] font-bold text-[#9CB1AC] uppercase tracking-wider font-mono">Profile Session</p>
                  <p className="text-xs text-white truncate font-semibold mt-0.5">{profile?.email}</p>
                </div>
                
                <button
                  onClick={() => setActiveTab('account')}
                  className="w-full text-left px-2.5 py-2 hover:bg-[#16362F]/40 hover:text-[#00C853] rounded-lg transition-colors text-xs font-medium flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" /> My Profile
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className="w-full text-left px-2.5 py-2 hover:bg-[#16362F]/40 hover:text-white rounded-lg transition-colors text-xs font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-gray-500" /> Settings
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-2.5 py-2 hover:bg-red-950/20 text-red-400 hover:text-red-300 rounded-lg transition-colors text-xs font-medium flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Secure Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* View Router Section */}
        {activeTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            transactions={transactions}
            notifications={notifications}
            onNavigate={setActiveTab}
            onCopyWallet={handleCopyWalletAddress}
          />
        )}

        {activeTab === 'account' && (
          <AccountView
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
          />
        )}

        {activeTab === 'wallet' && (
          <WalletView
            profile={profile}
            transactions={transactions}
            onBalanceUpdate={handleBalanceUpdate}
            onAddTransaction={handleAddTransaction}
          />
        )}

        {activeTab === 'activation' && (
          <ActivationView
            profile={profile}
            onActivateSuccess={handleActivateSuccess}
          />
        )}

        {activeTab === 'flash-transfer' && (
          <FlashTransferView
            profile={profile}
            onBalanceUpdate={handleBalanceUpdate}
            onAddTransaction={handleAddTransaction}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'receipt-generator' && (
          <ReceiptGeneratorView
            transactions={transactions}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionHistoryView
            transactions={transactions}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            profile={profile}
            transactions={transactions}
          />
        )}

        {activeTab === 'sms-center' && <SmsCenterView />}
        {activeTab === 'orders' && <OrdersView />}
        {activeTab === 'support' && (
          <SupportView
            userId={profile?.id || ''}
            tickets={supportTickets}
            onRefresh={() => {
              if (session?.user) {
                dbService.getSupportTickets(session.user.id).then(setSupportTickets);
              }
            }}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsView
            profile={profile}
            onUpdateProfile={handleProfileUpdate}
          />
        )}
        {activeTab === 'notifications' && (
          <NotificationsView
            userId={profile?.id || ''}
            notifications={notifications}
            onRefresh={() => {
              if (session?.user) {
                dbService.getNotifications(session.user.id).then(setNotifications);
              }
            }}
          />
        )}
        {activeTab === 'db-setup' && <DbSetupView />}
      </main>
    </div>
  );
}
