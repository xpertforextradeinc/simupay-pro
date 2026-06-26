import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Briefcase,
  Layers,
  Zap,
  Globe,
  Award
} from 'lucide-react';
import { Profile, Transaction } from '../types';

interface AnalyticsViewProps {
  profile: Profile | null;
  transactions: Transaction[];
}

export function AnalyticsView({ profile, transactions, onNavigate }: AnalyticsViewProps & { onNavigate: (tab: any) => void }) {
  const currentBalance = profile?.wallet_balance ?? 35000;
  const licenseActive = profile?.license_active ?? false;

  if (!licenseActive) {
    return (
      <div className="bg-[#091714] p-8 rounded-2xl border border-[#16362F] shadow-2xl space-y-6 flex flex-col items-center text-center max-w-xl mx-auto my-6">
        <div className="w-16 h-16 rounded-full bg-[#00C853]/15 border-2 border-[#00C853]/35 flex items-center justify-center text-[#00C853]">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-display font-bold text-white">Enterprise License Tunnel Required</h3>
          <p className="text-xs text-[#9CB1AC] leading-relaxed">
            Analytics is a premium, enterprise-tier feature. Access is currently locked. To activate high-speed cross-chain simulations and analytics, choose your path below:
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-2">
          <button
            onClick={() => onNavigate('subscription')}
            className="px-5 py-3 bg-[#00C853] hover:bg-emerald-400 text-[#050E0C] rounded-xl font-bold text-xs font-display tracking-wide transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1.5 flex-1"
          >
            <Zap className="w-4 h-4 fill-current" /> Subscribe & Upgrade
          </button>
          <button
            onClick={() => onNavigate('activation')}
            className="px-5 py-3 bg-transparent hover:bg-[#16362F]/50 text-[#00C853] border border-[#00C853] rounded-xl font-bold text-xs font-display tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1"
          >
            <Lock className="w-4 h-4" /> Use Activation Key
          </button>
        </div>
      </div>
    );
  }

  // 1. Daily Transactions Data (Mocking past week)
  const dailyData = [
    { day: 'Mon', volume: 12500, count: 4 },
    { day: 'Tue', volume: 19400, count: 6 },
    { day: 'Wed', volume: 15200, count: 3 },
    { day: 'Thu', volume: 28900, count: 8 },
    { day: 'Fri', volume: 22100, count: 5 },
    { day: 'Sat', volume: 18600, count: 4 },
    { day: 'Sun', volume: 34500, count: 9 },
  ];

  // 2. Monthly Transactions Data
  const monthlyData = [
    { month: 'Jan', processed: 145000, failed: 1200 },
    { month: 'Feb', processed: 210000, failed: 2400 },
    { month: 'Mar', processed: 185000, failed: 900 },
    { month: 'Apr', processed: 295000, failed: 3100 },
    { month: 'May', processed: 320000, failed: 1500 },
    { month: 'Jun', processed: 410000, failed: 1800 },
  ];

  // 3. Balance History Data over last 6 months
  const balanceHistoryData = [
    { month: 'Jan', balance: 5000 },
    { month: 'Feb', balance: 12500 },
    { month: 'Mar', balance: 18000 },
    { month: 'Apr', balance: 24500 },
    { month: 'May', balance: 29000 },
    { month: 'Jun', balance: currentBalance },
  ];

  // 4. Wallet Usage (Allocation across cryptos)
  const walletUsageData = [
    { name: 'USDT (TRC20)', value: 55, color: '#00C853' },
    { name: 'USDT (ERC20)', value: 25, color: '#1D4ED8' },
    { name: 'USDT (BEP20)', value: 10, color: '#EAB308' },
    { name: 'BTC (Bitcoin)', value: 6, color: '#F97316' },
    { name: 'ETH (Ethereum)', value: 4, color: '#A855F7' },
  ];

  // 5. License Key Sales trends (Simulated over past quarters)
  const licenseSalesData = [
    { quarter: 'Q3 25', standard: 180, enterprise: 35 },
    { quarter: 'Q4 25', standard: 240, enterprise: 58 },
    { quarter: 'Q1 26', standard: 310, enterprise: 82 },
    { quarter: 'Q2 26', standard: 450, enterprise: 110 },
  ];

  // Custom tooltips for elegant dark styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#091714] border border-[#16362F] p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <p className="font-semibold text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || '#fff' }} className="font-mono">
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="border-b border-[#16362F]/60 pb-5">
        <h2 className="text-2xl font-display font-bold text-white tracking-tight">System & Analytics Node</h2>
        <p className="text-xs text-[#9CB1AC]">Real-time transactional metrics, asset allocation breakdowns, and decentralized sales velocity audit.</p>
      </div>

      {/* Top statistics banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#091714] p-5 rounded-xl border border-[#16362F] shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-[#9CB1AC] uppercase font-bold tracking-wider">Total Volume processed</span>
            <h3 className="text-lg font-bold text-white font-mono">$1,565,000.00</h3>
            <span className="text-[10px] text-[#00C853] flex items-center gap-0.5 font-mono">
              <TrendingUp className="w-3 h-3" /> +14.2% MoM
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#00C853]/10 border border-[#00C853]/30 flex items-center justify-center text-[#00C853]">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#091714] p-5 rounded-xl border border-[#16362F] shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-[#9CB1AC] uppercase font-bold tracking-wider">Flash transfer speed</span>
            <h3 className="text-lg font-bold text-white font-mono">2.4 Seconds</h3>
            <span className="text-[10px] text-[#00C853] flex items-center gap-0.5 font-mono">
              ⚡ Ultra low latency
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#00C853]/10 border border-[#00C853]/30 flex items-center justify-center text-[#00C853]">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#091714] p-5 rounded-xl border border-[#16362F] shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-[#9CB1AC] uppercase font-bold tracking-wider">Node Active Rate</span>
            <h3 className="text-lg font-bold text-white font-mono">99.998%</h3>
            <span className="text-[10px] text-[#00C853] flex items-center gap-0.5 font-mono">
              ● All clusters synchronized
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#00C853]/10 border border-[#00C853]/30 flex items-center justify-center text-[#00C853]">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#091714] p-5 rounded-xl border border-[#16362F] shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-[#9CB1AC] uppercase font-bold tracking-wider">Active PRO Nodes</span>
            <h3 className="text-lg font-bold text-white font-mono">5,824 Keys</h3>
            <span className="text-[10px] text-blue-400 flex items-center gap-0.5 font-mono">
              +185 this week
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-950/40 border border-blue-900 flex items-center justify-center text-blue-400">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Transactions Area Chart */}
        <div className="bg-[#091714] p-5 rounded-2xl border border-[#16362F] space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" /> Daily Dispatched Volumes (USD)
            </h4>
            <span className="text-[10px] text-gray-500 font-mono">7 Days</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C853" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00C853" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#16362F" vertical={false} />
                <XAxis dataKey="day" stroke="#9CB1AC" fontSize={10} tickLine={false} />
                <YAxis stroke="#9CB1AC" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="volume" name="Dispatched Amount" stroke="#00C853" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Balance History Line Chart */}
        <div className="bg-[#091714] p-5 rounded-2xl border border-[#16362F] space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" /> Balance History Growth
            </h4>
            <span className="text-[10px] text-gray-500 font-mono">6 Months</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#16362F" vertical={false} />
                <XAxis dataKey="month" stroke="#9CB1AC" fontSize={10} tickLine={false} />
                <YAxis stroke="#9CB1AC" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="balance" name="Wallet Ledger" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: '#2563EB', strokeWidth: 1 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Transactions Processed Bar Chart */}
        <div className="bg-[#091714] p-5 rounded-2xl border border-[#16362F] space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00C853]" /> Monthly Ledger Settlement (USD)
            </h4>
            <span className="text-[10px] text-gray-500 font-mono">Consolidated</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#16362F" vertical={false} />
                <XAxis dataKey="month" stroke="#9CB1AC" fontSize={10} tickLine={false} />
                <YAxis stroke="#9CB1AC" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10, color: '#9CB1AC' }} />
                <Bar dataKey="processed" name="Settled" fill="#00C853" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" name="Failed/Reverted" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* License Sales Quarterly Composed Chart */}
        <div className="bg-[#091714] p-5 rounded-2xl border border-[#16362F] space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> License Key Sales Volume
            </h4>
            <span className="text-[10px] text-gray-500 font-mono">Quarterly</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={licenseSalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#16362F" vertical={false} />
                <XAxis dataKey="quarter" stroke="#9CB1AC" fontSize={10} tickLine={false} />
                <YAxis stroke="#9CB1AC" fontSize={10} tickLine={false} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="standard" name="Standard Key" fill="#16362F" stroke="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="enterprise" name="PRO Key" fill="#EAB308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wallet Allocations (USDT-TRC20, USDT-ERC20, BTC etc) - Pie Chart */}
        <div className="bg-[#091714] p-5 rounded-2xl border border-[#16362F] space-y-4 lg:col-span-2">
          <h4 className="text-sm font-semibold text-white">Cryptographic Protocol Distribution</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={walletUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {walletUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3.5 px-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Wallet Load-Factor Allocations</span>
              <div className="grid grid-cols-2 gap-4">
                {walletUsageData.map((w, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 bg-[#050E0C] p-2 rounded-xl border border-[#16362F]/50">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: w.color }} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-white truncate">{w.name}</p>
                      <span className="text-[10px] font-mono text-[#9CB1AC]">{w.value}% load</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
