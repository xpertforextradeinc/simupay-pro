import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Zap,
  Activity,
  Bell,
  CheckCircle,
  AlertCircle,
  Receipt,
  Settings,
  CreditCard
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Profile, Transaction, AppNotification } from '../types';
import { DISCLOSURE_TEXT } from '../data/partners';

// Helper to get last 30 days data
const getLast30DaysData = (transactions: Transaction[]) => {
  const now = new Date();
  const last30Days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });
  
  const volumeByDate = transactions.reduce((acc, tx) => {
    const date = tx.created_at.split('T')[0];
    if (last30Days.includes(date)) {
      acc[date] = (acc[date] || 0) + tx.amount;
    }
    return acc;
  }, {} as Record<string, number>);
  
  return last30Days.map(date => ({
    date: date.substring(5), // M-D format
    volume: volumeByDate[date] || 0
  }));
};

interface DashboardViewProps {
  profile: Profile | null;
  transactions: Transaction[];
  notifications: AppNotification[];
  onNavigate: (tab: any) => void;
  onCopyWallet: () => void;
}

export function DashboardView({
  profile,
  transactions,
  notifications,
  onNavigate,
  onCopyWallet
}: DashboardViewProps) {
  const [emptyStateDismissed, setEmptyStateDismissed] = useState(() => {
    return localStorage.getItem('spp_dashboard_empty_dismissed') === 'true';
  });

  const [partnerCardDismissed, setPartnerCardDismissed] = useState(() => {
    return localStorage.getItem('spp_dashboard_partner_card_dismissed') === 'true';
  });

  const handleDismissEmptyState = () => {
    setEmptyStateDismissed(true);
    localStorage.setItem('spp_dashboard_empty_dismissed', 'true');
  };

  const handleDismissPartnerCard = () => {
    setPartnerCardDismissed(true);
    localStorage.setItem('spp_dashboard_partner_card_dismissed', 'true');
  };
  // Compute analytics
  const totalBalance = profile?.wallet_balance ?? 0;
  const licenseActive = profile?.license_active ?? false;
  
  // Simulate daily receipt limit
  const today = new Date().toISOString().split('T')[0];
  const receiptsToday = transactions.filter(t => t.created_at.startsWith(today)).length;
  const maxFreeReceipts = 5;
  const isPremium = profile?.subscription_status === 'Active';

  const totalTx = transactions.length;
  const recentTransactions = transactions.slice(0, 5);
  const chartData = useMemo(() => getLast30DaysData(transactions), [transactions]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-card to-[#0e2c26]/60 p-6 rounded-2xl border border-emerald-950/40 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute inset-0 receipt-watermark opacity-15 pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <h1 className="text-2xl font-display font-bold text-white">
            Welcome back, {profile?.full_name || 'Merchant'}!
          </h1>
          <p className="text-gray-400 text-sm max-w-xl">
            SimuPay Pro secure enterprise receipt generation platform. Manage your professional receipts and transaction records.
          </p>
        </div>

        <div className="relative z-10 flex gap-2">
          {!isPremium && (
            <button
              onClick={() => onNavigate('subscription')}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-lg cursor-pointer"
            >
              Upgrade to Premium
            </button>
          )}
          <button
            onClick={() => onNavigate('receipt-generator')}
            className="px-4 py-2.5 bg-[#00C853] hover:bg-emerald-500 text-brand-bg rounded-xl font-semibold text-xs tracking-wide transition-all shadow-lg cursor-pointer"
          >
            Quick Generate Receipt
          </button>
        </div>
      </div>

      {/* 3. Empty State Recommendation */}
      {totalTx === 0 && !emptyStateDismissed && (
        <div className="bg-gradient-to-br from-[#091714] to-[#040e0c] p-5 rounded-2xl border border-emerald-950 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <button
            onClick={handleDismissEmptyState}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 text-xs font-mono transition-colors cursor-pointer"
            title="Dismiss"
          >
            Dismiss
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <span className="text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-wider bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-950">
                Getting Started
              </span>
              <h3 className="text-sm font-bold text-white mt-1">Need a cryptocurrency exchange?</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Create a free Gate account if you’re looking for a platform to trade or manage digital assets.
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <a
                href="https://www.gate.com/share/simupaypro"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#00C853] hover:bg-[#00E676] text-black font-semibold text-xs py-2.5 px-4 rounded-xl text-center shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer block"
              >
                Open Gate
              </a>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-emerald-950/30 text-[9px] text-gray-500 font-mono leading-tight">
            {DISCLOSURE_TEXT}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-brand-card p-5 rounded-xl border border-emerald-950/40 shadow-xl space-y-1">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Subscription Status</span>
          <h3 className="text-xl font-display font-bold text-white">
            {isPremium ? 'Premium Plan' : 'Free Plan'}
          </h3>
          <p className="text-[10px] text-gray-400">{isPremium ? 'Unlimited access unlocked' : 'Limited features'}</p>
        </div>
        
        <div className="bg-brand-card p-5 rounded-xl border border-emerald-950/40 shadow-xl space-y-1">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Free Receipts Used Today</span>
          <h3 className="text-xl font-display font-bold text-white">
            {receiptsToday} / {maxFreeReceipts}
          </h3>
          <p className="text-[10px] text-gray-400">Resets daily</p>
        </div>

        <div className="bg-brand-card p-5 rounded-xl border border-emerald-950/40 shadow-xl space-y-1">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Total Receipts Generated</span>
          <h3 className="text-xl font-display font-bold text-white">
            {totalTx}
          </h3>
          <p className="text-[10px] text-gray-400">All-time record</p>
        </div>
      </div>

      {/* Premium Incentives (Show if not active) */}
      {!licenseActive && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-brand-card p-6 rounded-2xl border border-amber-500/20 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <Zap className="w-8 h-8 text-amber-500/20" />
            </div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Flash Transfer Protocols
            </h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Unlock the ability to simulate high-speed cross-chain transfers with instant confirmation states and professional PDF generation.
            </p>
            <button 
              onClick={() => onNavigate('activation')}
              className="mt-4 text-[10px] font-bold text-amber-500 uppercase tracking-widest hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              Activate to Unlock <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-brand-card p-6 rounded-2xl border border-blue-500/20 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <Activity className="w-8 h-8 text-blue-500/20" />
            </div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" /> Deep Analytics & SMS Center
            </h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Get detailed insights into your transaction volume and access the professional SMS notification simulation center.
            </p>
            <button 
              onClick={() => onNavigate('activation')}
              className="mt-4 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              Activate to Unlock <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Enterprise Security Audit Status & Metadata */}
      <div className="bg-[#091714]/80 p-5 rounded-2xl border border-emerald-950/40 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-emerald-950/30 pb-2.5">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00C853]" /> Real-time Node Metadata & Subscriptions
          </h4>
          <span className="text-[10px] bg-[#00C853]/10 text-[#00C853] px-2 py-0.5 rounded font-mono font-bold">ACTIVE DEPLOYMENT</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metadata Parameters */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#9CB1AC] font-medium">License Status:</span>
              <span className={`font-mono font-bold uppercase ${licenseActive ? 'text-[#00C853]' : 'text-amber-500'}`}>
                {licenseActive ? 'PRO ENTERPRISE' : 'SANDBOX NODE'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#9CB1AC] font-medium">Active Subscription:</span>
              <span className="text-white font-mono font-semibold">
                {licenseActive ? 'Enterprise Unlimited (PRO)' : 'Standard Free Trial'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#9CB1AC] font-medium">Member Since:</span>
              <span className="text-white font-mono">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#9CB1AC] font-medium">Last Node Connection:</span>
              <span className="text-[#00C853] font-mono font-medium">
                {profile?.last_login ? new Date(profile.last_login).toLocaleTimeString() : 'Just now'}
              </span>
            </div>
          </div>

          {/* Wallets & Sub-asset holds */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-brand-bg/40 p-3 rounded-xl border border-emerald-950/20">
            <div className="p-2.5 bg-brand-bg/60 rounded-lg border border-emerald-950/30 text-center space-y-1">
              <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider">TRON (TRC20)</span>
              <span className="text-xs font-mono font-bold text-white block">${(totalBalance * 0.55).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="p-2.5 bg-brand-bg/60 rounded-lg border border-emerald-950/30 text-center space-y-1">
              <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider">ETH (ERC20)</span>
              <span className="text-xs font-mono font-bold text-white block">${(totalBalance * 0.25).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="p-2.5 bg-brand-bg/60 rounded-lg border border-emerald-950/30 text-center space-y-1">
              <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider">BNB (BEP20)</span>
              <span className="text-xs font-mono font-bold text-white block">${(totalBalance * 0.10).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="p-2.5 bg-brand-bg/60 rounded-lg border border-emerald-950/30 text-center space-y-1">
              <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider">BTC (Bitcoin)</span>
              <span className="text-xs font-mono font-bold text-white block">${(totalBalance * 0.10).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphic Stats & Action Shortcuts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Analytics Visualizer */}
          <div className="bg-brand-card p-5 rounded-xl border border-emerald-950/40 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-sm font-semibold text-white">Transfer Flow Volume</h4>
                <p className="text-xs text-gray-500">Global secure ledger metrics across all selected networks</p>
              </div>
              <span className="text-xs font-mono font-bold bg-[#00C853]/10 text-[#00C853] px-2.5 py-1 rounded-lg border border-[#00C853]/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" /> LIVE SYNCED
              </span>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C853" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00C853" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#050E0C', border: '1px solid #064E3B', fontSize: '12px' }}
                    itemStyle={{ color: '#00C853' }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#00C853" fillOpacity={1} fill="url(#chartGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity Ledger */}
          <div className="bg-brand-card p-5 rounded-xl border border-emerald-950/40 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-sm font-semibold text-white">Recent Security Logs</h4>
                <p className="text-xs text-gray-500">Real-time ledger and network verification status logs</p>
              </div>
              <button
                onClick={() => onNavigate('transactions')}
                className="text-xs text-[#00C853] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                View Full Ledger <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-xs flex flex-col items-center gap-2">
                <Clock className="w-8 h-8 text-emerald-950" />
                <span>No transaction history found on your Supabase account.</span>
                <button
                  onClick={() => onNavigate('flash-transfer')}
                  className="text-[#00C853] underline hover:text-emerald-400 font-medium cursor-pointer"
                >
                  Create a Transfer
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-emerald-950/50 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                      <th className="py-2.5">Reference ID</th>
                      <th className="py-2.5">Network</th>
                      <th className="py-2.5">Amount</th>
                      <th className="py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-950/30 text-xs">
                    {recentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-brand-bg/30 transition-colors">
                        <td className="py-3 font-mono text-gray-300">
                          {tx.id.substring(0, 8)}...
                        </td>
                        <td className="py-3 text-gray-400 font-medium">
                          {tx.network} <span className="text-[10px] text-gray-600">({tx.wallet.substring(0, 4)}...{tx.wallet.substring(tx.wallet.length - 4)})</span>
                        </td>
                        <td className="py-3 font-mono font-semibold text-white">
                          ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase
                              ${tx.status === 'completed' ? 'bg-[#00C853]/15 text-[#00C853]' : ''}
                              ${tx.status === 'pending' ? 'bg-amber-500/15 text-amber-500' : ''}
                              ${tx.status === 'failed' ? 'bg-red-500/15 text-red-500' : ''}
                            `}
                          >
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets: Notifications & Actions */}
        <div className="space-y-6">
          {/* Real-time Notifications Panel */}
          <div className="bg-brand-card p-5 rounded-xl border border-emerald-950/40 shadow-xl flex flex-col h-full max-h-[340px]">
            <div className="flex justify-between items-center mb-4 border-b border-emerald-950/50 pb-2">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#00C853]" />
                <h4 className="text-sm font-semibold text-white">Activity Notifications</h4>
              </div>
              {notifications.length > 0 && (
                <span className="text-[10px] bg-[#00C853]/15 text-[#00C853] px-2 py-0.5 rounded-full font-mono font-bold">
                  {notifications.length}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs flex flex-col items-center gap-2">
                  <Bell className="w-8 h-8 text-emerald-950" />
                  <span>No security warnings or notifications in your log.</span>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 bg-brand-bg/50 border border-emerald-950/40 rounded-xl space-y-1 hover:border-[#00C853]/10 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-semibold text-gray-200">{notif.title}</span>
                      <span className="text-[9px] text-gray-500 font-mono">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Premium Tools Quick Panel */}
          <div className="bg-brand-card p-5 rounded-xl border border-emerald-950/40 shadow-xl space-y-4">
            <h4 className="text-sm font-semibold text-white border-b border-emerald-950/50 pb-2">Merchant Terminal Services</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('receipt-generator')}
                className="p-3 bg-brand-bg/80 border border-emerald-950 hover:border-[#00C853]/30 rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer text-center group"
              >
                <div className="p-2 bg-emerald-950/40 rounded-lg group-hover:bg-[#00C853]/10 text-[#00C853]">
                  <Receipt className="w-4 h-4" />
                </div>
                <span className="text-xs text-gray-300 font-medium">Receipt PDF</span>
              </button>

              <button
                onClick={() => onNavigate('wallet')}
                className="p-3 bg-brand-bg/80 border border-emerald-950 hover:border-blue-500/30 rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer text-center group"
              >
                <div className="p-2 bg-blue-950/40 rounded-lg group-hover:bg-blue-500/10 text-blue-400">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-xs text-gray-300 font-medium">My Wallet</span>
              </button>

              <button
                onClick={() => onNavigate('sms-center')}
                className="p-3 bg-brand-bg/80 border border-emerald-950 hover:border-purple-500/30 rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer text-center group"
              >
                <div className="p-2 bg-purple-950/30 rounded-lg group-hover:bg-purple-500/10 text-purple-400">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs text-gray-300 font-medium">SMS Center</span>
              </button>

              <button
                onClick={() => onNavigate('settings')}
                className="p-3 bg-brand-bg/80 border border-emerald-950 hover:border-gray-500/30 rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer text-center group"
              >
                <div className="p-2 bg-gray-950/30 rounded-lg group-hover:bg-gray-500/10 text-gray-400">
                  <Settings className="w-4 h-4" />
                </div>
                <span className="text-xs text-gray-300 font-medium">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Dashboard Partner Card */}
      {!partnerCardDismissed && (
        <div className="bg-gradient-to-br from-[#091714] to-[#040e0c] p-6 rounded-2xl border border-emerald-950/50 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <button
            onClick={handleDismissPartnerCard}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 text-xs font-mono transition-colors cursor-pointer"
            title="Dismiss"
          >
            Dismiss
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-wider bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-950">
                  Recommended Partner
                </span>
                <span className="text-[9px] uppercase font-bold text-[#00C853] bg-[#00C853]/10 border border-[#00C853]/20 px-2.5 py-0.5 rounded-full font-mono">
                  Create Your Free Gate Account
                </span>
              </div>
              <h3 className="text-sm md:text-base font-bold text-white tracking-tight font-display">
                Looking for a trusted cryptocurrency exchange?
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Gate offers cryptocurrency trading, spot markets, futures, and digital asset management. Establish your account securely through SIMUPAY PRO partner nodes.
              </p>
            </div>

            <div className="flex-shrink-0">
              <a
                href="https://www.gate.com/share/simupaypro"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#00C853] hover:bg-[#00E676] text-black font-semibold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer block text-center"
              >
                Get Started
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-950/30 text-[10px] text-gray-500 font-mono leading-relaxed">
            {DISCLOSURE_TEXT}
          </div>
        </div>
      )}
    </div>
  );
}
