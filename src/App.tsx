import React, { useState, useEffect, useRef, Suspense } from 'react';
import { supabase } from './supabase';
import { ToastProvider, useToast } from './components/Toast';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { dbService } from './services/dbService';
import { ActiveTab, Profile, Transaction, AppNotification, SupportTicket } from './types';
import { KeyRound, ShieldAlert, LogOut, Search, Bell, ChevronDown, User, Settings, Database, Loader2 } from 'lucide-react';
import { useShortcuts } from './hooks/useShortcuts';
import { TransactionNotificationBell } from './components/TransactionNotifications';

const DashboardView = React.lazy(() => import('./components/DashboardView').then(m => ({ default: m.DashboardView })));
const AccountView = React.lazy(() => import('./components/AccountView').then(m => ({ default: m.AccountView })));
const WalletView = React.lazy(() => import('./components/WalletView').then(m => ({ default: m.WalletView })));
const ActivationView = React.lazy(() => import('./components/ActivationView').then(m => ({ default: m.ActivationView })));
const FlashTransferView = React.lazy(() => import('./components/FlashTransferView').then(m => ({ default: m.FlashTransferView })));
const ForexToolsView = React.lazy(() => import('./components/ForexToolsView'));
const ReceiptGeneratorView = React.lazy(() => import('./components/ReceiptGeneratorView').then(m => ({ default: m.ReceiptGeneratorView })));
const TransactionHistoryView = React.lazy(() => import('./components/TransactionHistoryView').then(m => ({ default: m.TransactionHistoryView })));
const AnalyticsView = React.lazy(() => import('./components/AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const SmsCenterView = React.lazy(() => import('./components/UtilityViews').then(m => ({ default: m.SmsCenterView })));
const OrdersView = React.lazy(() => import('./components/UtilityViews').then(m => ({ default: m.OrdersView })));
const SupportView = React.lazy(() => import('./components/UtilityViews').then(m => ({ default: m.SupportView })));
const SettingsView = React.lazy(() => import('./components/UtilityViews').then(m => ({ default: m.SettingsView })));
const NotificationsView = React.lazy(() => import('./components/NotificationsView').then(m => ({ default: m.NotificationsView })));
const DbSetupView = React.lazy(() => import('./components/DbSetupView').then(m => ({ default: m.DbSetupView })));
const SubscriptionView = React.lazy(() => import('./components/SubscriptionView').then(m => ({ default: m.SubscriptionView })));
const SecurityCenterView = React.lazy(() => import('./components/SecurityCenterView').then(m => ({ default: m.SecurityCenterView })));
const AdminPanelView = React.lazy(() => import('./components/AdminPanelView').then(m => ({ default: m.AdminPanelView })));
const ResourcesView = React.lazy(() => import('./components/ResourcesView').then(m => ({ default: m.ResourcesView })));

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

function AppContent() {
  const [session, setSession] = useState<any>(null);
  const currentSessionRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { showToast } = useToast();
  const [isDbInitialized, setIsDbInitialized] = useState<boolean>(true);

  // Core Business States
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Register Global Keyboard Shortcuts
  useShortcuts((tab) => {
    if (session) {
      setActiveTab(tab);
    }
  });

  // Guard administrative views from standard users
  useEffect(() => {
    if ((activeTab === 'db-setup' || activeTab === 'admin-panel') && profile && profile.role !== 'admin') {
      setActiveTab('dashboard');
    }
  }, [activeTab, profile]);

  const onTransactionComplete = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
    setLastTransaction(tx);
    setActiveTab('receipt-generator');
  };

  // 1. Recover Session on Mount
  useEffect(() => {
    const handleSessionUpdate = async (newSession: any, forceNull = false) => {
      console.log('[Auth Flow] Updating session:', !!newSession, 'forceNull:', forceNull);
      
      if (newSession) {
      // Prevent redundant session syncs to avoid race conditions and unnecessary database calls
      if (currentSessionRef.current?.access_token === newSession.access_token) {
          console.log('[Auth Flow] Session already active. Skipping redundant sync.');
          return;
        }
        currentSessionRef.current = newSession;
        setSession(newSession);
        await syncUserData(newSession.user);
      } else {
        // Only clear the session if there isn't already an active one, or if we explicitly force a null update (like on sign out)
        if (!currentSessionRef.current || forceNull) {
          currentSessionRef.current = null;
          setSession(null);
          setProfile(null);
          setTransactions([]);
          setNotifications([]);
          setSupportTickets([]);
          setLoading(false);
        } else {
          console.log('[Auth Flow] Ignoring null session update because we already have an active session.');
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('[Auth Flow] getSession result:', { session: !!session, error });
      handleSessionUpdate(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth Flow] onAuthStateChange event:', event, 'session:', !!session);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || (event === 'INITIAL_SESSION' && session)) {
        handleSessionUpdate(session);
      } else if (event === 'SIGNED_OUT') {
        handleSessionUpdate(null, true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch or Sync User Profile & Logs
  const syncUserData = async (user: any) => {
    setLoading(true);
    try {
      console.log('[Auth Flow] Syncing user data for:', user.id);
      
      // Perform automated checks for required database tables on startup
      const dbOk = await dbService.checkDatabaseInitialized();
      setIsDbInitialized(dbOk);

      // Run data fetching concurrently
      const [finalProfile, txData, notifData, ticketsData] = await Promise.all([
        dbService.getProfile(
          user.id,
          user.email,
          user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.custom_claims?.name
        ),
        dbService.getTransactions(user.id),
        dbService.getNotifications(user.id),
        dbService.getSupportTickets(user.id)
      ]);

      console.log('[Auth Flow] User data synced successfully:', { finalProfile });
      setProfile(finalProfile);
      setTransactions(txData);
      setNotifications(notifData);
      setSupportTickets(ticketsData);
      
      // Auto-navigate: admins redirect to db-setup if tables are missing, standard users always redirect directly to the dashboard
      if (!dbOk && finalProfile?.role === 'admin') {
        setActiveTab('db-setup');
      } else {
        setActiveTab('dashboard');
      }

    } catch (e) {
      console.error('[Auth Flow] Graceful initialization fallback enabled:', e);
      
      // Construct a minimal fallback profile so the UI can render correctly even if database fetch fails completely
      const fallbackProfile: Profile = {
        id: user.id,
        email: user.email || 'merchant@simupay.pro',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'SimuPay Pro Merchant',
        wallet_balance: 35000.00,
        activation_key: 'SPP-FALLBACK-KEY',
        license_active: false,
        license_type: 'Standard',
        role: 'user',
        created_at: new Date().toISOString()
      };
      setProfile(fallbackProfile);
      
      // Still attempt to navigate to dashboard
      setActiveTab('dashboard');
    } finally {
      console.log('[Auth Flow] Finished loading process.');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    currentSessionRef.current = null;
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

  const loadNotifications = async () => {
    if (session?.user) {
      const notifs = await dbService.getNotifications(session.user.id);
      setNotifications(notifs);
    }
  };

  const handleMarkRead = async (id: string) => {
    if (!profile) return;

    await dbService.markNotificationRead(profile.id, id);

    setNotifications(prev =>
      prev.map(n =>
        n.id === id
          ? { ...n, read: true }
          : n
      )
    );
  };

  const handleMarkAllRead = async () => {
    if (!profile) return;

    const unread = notifications.filter(n => !n.read);

    for (const n of unread) {
      await dbService.markNotificationRead(profile.id, n.id);
    }

    setNotifications(prev =>
      prev.map(n => ({
        ...n,
        read: true,
      }))
    );
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
        role={profile?.role}
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
            <TransactionNotificationBell
              notifications={notifications}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
              onNavigate={setActiveTab}
            />

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
        <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#00C853]" /></div>}>
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
              onTransactionComplete={onTransactionComplete}
              onNavigate={setActiveTab}
              onRefreshNotifications={loadNotifications}
            />
          )}

          {activeTab === 'activation' && (
            <ActivationView
              profile={profile}
              onActivateSuccess={handleActivateSuccess}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'flash-transfer' && (
            <FlashTransferView
              profile={profile}
              onBalanceUpdate={handleBalanceUpdate}
              onTransactionComplete={onTransactionComplete}
              onNavigate={setActiveTab}
              onRefreshNotifications={loadNotifications}
            />
          )}

          {activeTab === 'forex-tools' && (
            <React.Suspense fallback={<div className="p-8 text-center text-gray-500 animate-pulse font-mono text-xs">LOADING_TRADING_SUITE...</div>}>
              <ForexToolsView />
            </React.Suspense>
          )}

          {activeTab === 'receipt-generator' && (
            <ReceiptGeneratorView
              profile={profile}
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
              onNavigate={setActiveTab}
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
          {activeTab === 'security-center' && (
            <SecurityCenterView
              profile={profile}
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
          {activeTab === 'db-setup' && (
            profile?.role === 'admin' ? (
              <DbSetupView isDbInitialized={isDbInitialized} />
            ) : (
              <DashboardView
                profile={profile}
                transactions={transactions}
                notifications={notifications}
                onNavigate={setActiveTab}
                onCopyWallet={handleCopyWalletAddress}
              />
            )
          )}

          {activeTab === 'subscription' && (
            <SubscriptionView
              profile={profile}
              onUpdateProfile={handleProfileUpdate}
              onRefresh={() => {
                if (session?.user) {
                  syncUserData(session.user);
                }
              }}
            />
          )}

          {activeTab === 'resources' && (
            <ResourcesView />
          )}

          {activeTab === 'admin-panel' && (
            profile?.role === 'admin' ? (
              <AdminPanelView
                currentUserId={profile?.id || ''}
              />
            ) : (
              <DashboardView
                profile={profile}
                transactions={transactions}
                notifications={notifications}
                onNavigate={setActiveTab}
                onCopyWallet={handleCopyWalletAddress}
              />
            )
          )}
        </Suspense>
      </main>
    </div>
  );
}
