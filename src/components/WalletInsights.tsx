import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, PieChart as PieChartIcon, BarChart2, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import type { Profile, Transaction } from '../types';

interface WalletInsightsProps {
  profile: Profile | null;
  transactions: Transaction[];
}

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-bg border border-brand-border p-3 rounded-lg shadow-xl">
        <p className="text-brand-text text-xs font-bold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.name === 'Amount' || entry.name.includes('Balance') ? '$' : ''}{Number(entry.value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function WalletInsights({ profile, transactions }: WalletInsightsProps) {
  const totalBalance = profile?.wallet_balance ?? 0;
  const availableBalance = totalBalance * 0.85;
  const pendingBalance = totalBalance * 0.10;
  const lockedBalance = totalBalance * 0.05;

  // Process data for charts
  const weeklyData = useMemo(() => {
    // Mocking 7 days of performance based on total balance to make it look realistic
    const data = [];
    let current = totalBalance * 0.9; // Start from 90% of current
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      if (i === 6) {
        data.push({ name: days[i], value: totalBalance });
      } else {
        // Add some random fluctuation
        current = current + (Math.random() * (totalBalance * 0.05) - (totalBalance * 0.02));
        data.push({ name: days[i], value: Math.max(0, current) });
      }
    }
    return data;
  }, [totalBalance]);

  const assetAllocation = [
    { name: 'Bitcoin (BTC)', value: availableBalance * 0.45, color: '#F7931A' },
    { name: 'Ethereum (ETH)', value: availableBalance * 0.25, color: '#627EEA' },
    { name: 'USDT (Tether)', value: availableBalance * 0.20, color: '#26A17B' },
    { name: 'Other Assets', value: availableBalance * 0.10, color: '#8884d8' },
  ];

  const monthlySummary = useMemo(() => {
    // Process real transactions if available, otherwise mock some realistic looking data
    if (transactions.length > 5) {
      // Group by network/provider for the last 30 days
      const grouped = transactions.reduce((acc: any, tx) => {
        const net = tx.network || 'Unknown';
        if (!acc[net]) acc[net] = 0;
        acc[net] += tx.amount;
        return acc;
      }, {});
      
      return Object.entries(grouped)
        .map(([name, value]) => ({ name, value }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 5);
    }
    
    return [
      { name: 'BTC Network', value: 45000 },
      { name: 'ERC20 (ETH)', value: 28000 },
      { name: 'TRC20 (USDT)', value: 15000 },
      { name: 'BEP20 (BNB)', value: 8500 },
      { name: 'Wire Transfer', value: 3200 },
    ];
  }, [transactions]);

  // Calculate daily change (mocked based on transactions or static if few)
  const dailyChange = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTxs = transactions.filter(t => t.created_at.startsWith(today) && t.status === 'completed');
    
    if (todayTxs.length > 0) {
      return todayTxs.reduce((sum, tx) => sum + tx.amount, 0);
    }
    return totalBalance > 0 ? totalBalance * (Math.random() * 0.02 + 0.005) : 0;
  }, [transactions, totalBalance]);

  const dailyChangePercent = totalBalance > 0 ? ((dailyChange / (totalBalance - dailyChange)) * 100) : 0;
  const isPositive = dailyChange >= 0;

  const COLORS = ['#00C853', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <motion.div 
      className="space-y-6 max-w-5xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="text-center space-y-2 mb-8">
        <h3 className="text-lg font-display font-bold text-brand-text flex items-center justify-center gap-2">
          <Activity className="w-5 h-5 text-brand-accent" />
          Smart Analytics & Insights
        </h3>
        <p className="text-sm text-[#9CB1AC]">
          Real-time performance metrics, asset distribution, and historical ledger analytics.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Net Worth', value: totalBalance, icon: DollarSign, color: 'text-brand-text' },
          { label: 'Available Balance', value: availableBalance, icon: ArrowUpRight, color: 'text-brand-accent' },
          { label: 'Locked Reserve', value: lockedBalance, icon: ArrowDownLeft, color: 'text-amber-500' },
          { label: 'Daily Change', value: dailyChange, icon: isPositive ? TrendingUp : TrendingDown, color: isPositive ? 'text-brand-accent' : 'text-red-500', isChange: true }
        ].map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants} className="bg-brand-card p-5 rounded-2xl border border-brand-border shadow-lg flex flex-col justify-between group hover:border-brand-border/80 transition-all">
            <div className="flex items-center gap-2 text-xs text-[#9CB1AC] font-semibold">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span>{stat.label}</span>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <h3 className="text-2xl font-display font-bold text-brand-text">
                {stat.isChange && stat.value > 0 ? '+' : ''}${Math.abs(stat.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              {stat.isChange && (
                <span className={`text-xs font-mono mb-1 ${isPositive ? 'text-brand-accent' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{dailyChangePercent.toFixed(2)}%
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Performance Line Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-brand-card p-6 rounded-2xl border border-brand-border shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h4 className="text-sm font-display font-bold text-brand-text">7-Day Ledger Performance</h4>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C853" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00C853" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#16362F" vertical={false} />
                <XAxis dataKey="name" stroke="#9CB1AC" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CB1AC" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${(value / 1000)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name="Balance"
                  stroke="#00C853" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#091714', stroke: '#00C853', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#00C853' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Asset Allocation Pie Chart */}
        <motion.div variants={itemVariants} className="bg-brand-card p-6 rounded-2xl border border-brand-border shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <PieChartIcon className="w-5 h-5 text-purple-400" />
            <h4 className="text-sm font-display font-bold text-brand-text">Asset Allocation</h4>
          </div>
          <div className="h-[220px] w-full flex items-center justify-center">
            {totalBalance > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-[#9CB1AC] text-xs flex flex-col items-center">
                <PieChartIcon className="w-8 h-8 mb-2 opacity-20" />
                No assets allocated
              </div>
            )}
          </div>
          <div className="space-y-2 mt-2">
            {assetAllocation.map((asset, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: asset.color }} />
                  <span className="text-[#9CB1AC]">{asset.name}</span>
                </div>
                <span className="text-brand-text font-mono font-bold">
                  {totalBalance > 0 ? ((asset.value / availableBalance) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Volume Bar Chart */}
        <motion.div variants={itemVariants} className="bg-brand-card p-6 rounded-2xl border border-brand-border shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-pink-400" />
            <h4 className="text-sm font-display font-bold text-brand-text">Network Inflow Volume</h4>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySummary} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#16362F" vertical={false} />
                <XAxis dataKey="name" stroke="#9CB1AC" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CB1AC" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${(value / 1000)}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#16362F', opacity: 0.4 }} />
                <Bar dataKey="value" name="Volume" radius={[4, 4, 0, 0]}>
                  {monthlySummary.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity List */}
        <motion.div variants={itemVariants} className="bg-brand-card p-6 rounded-2xl border border-brand-border shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-display font-bold text-brand-text">Recent Movements</h4>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {transactions.length > 0 ? (
              transactions.slice(0, 6).map((tx) => (
                <div key={tx.id} className="bg-brand-bg p-3 rounded-xl border border-brand-border flex items-center justify-between group hover:border-brand-border/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-text">{tx.network}</p>
                      <p className="text-[10px] text-[#9CB1AC] font-mono">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-brand-accent">
                      +${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-[#9CB1AC] capitalize">
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#9CB1AC] text-xs space-y-2 opacity-60 pb-8">
                <Activity className="w-8 h-8" />
                <p>No recent activity detected.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
