import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, BarChart2, Calendar, Newspaper, Activity, PieChart, 
  Settings, Shield, Sliders, Play, Pause, AlertTriangle, Zap,
  Globe, HelpCircle, ArrowRight, Layers, FileText, CheckCircle2,
  Lock, RefreshCw, Cpu, Database, Trash2, Plus, Calculator, 
  BookOpen, Edit3, Award, MessageSquare, Send, Check, RefreshCcw, Clock
} from 'lucide-react';
import { TradingViewWidget } from '../TradingViewWidget';

interface AdminTradingDashboardProps {
  systemHealth?: {
    dbConnected: boolean;
    serverStatus: string;
    localBackupActive: boolean;
  };
}

// Interfaces for structured data
interface JournalEntry {
  id: string;
  date: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  entryPrice: string;
  exitPrice: string;
  pips: number;
  status: 'WIN' | 'LOSS' | 'PENDING';
  notes: string;
}

export function AdminTradingDashboard({ systemHealth }: AdminTradingDashboardProps) {
  // Main Navigation within the dashboard
  const [activeTab, setActiveTab] = useState<'terminal' | 'calculators' | 'journal' | 'analytics' | 'assistant'>('terminal');
  
  // Widget selection for the main terminal workspace
  const [activeWidget, setActiveWidget] = useState<'charts' | 'calendar' | 'heatmap' | 'sentiment' | 'news'>('charts');

  // Watchlist State (with default values, editable)
  const [watchlist, setWatchlist] = useState<string[]>(['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'BTCUSD', 'ETHUSD']);
  const [newWatchlistSymbol, setNewWatchlistSymbol] = useState('');
  
  // Active Pair for the primary chart and tools
  const [selectedPair, setSelectedPair] = useState<string>('FX:EURUSD');

  // Simulated live ticking rates state
  const [liveRates, setLiveRates] = useState<Record<string, { bid: number; ask: number; change: number }>>({
    EURUSD: { bid: 1.0845, ask: 1.0846, change: 0.12 },
    GBPUSD: { bid: 1.2632, ask: 1.2634, change: -0.05 },
    USDJPY: { bid: 151.42, ask: 151.44, change: 0.24 },
    AUDUSD: { bid: 0.6515, ask: 0.6516, change: -0.18 },
    BTCUSD: { bid: 64250.00, ask: 64255.00, change: 1.45 },
    ETHUSD: { bid: 3450.50, ask: 3451.20, change: 0.88 },
  });

  // Position Size Calculator State
  const [accountBalance, setAccountBalance] = useState<number>(100000);
  const [riskPercentage, setRiskPercentage] = useState<number>(1); // 1%
  const [stopLossPips, setStopLossPips] = useState<number>(20);
  const [pipValue, setPipValue] = useState<number>(10); // Standard lot pip value for USD account
  
  // Risk Calculator State
  const [rcEntry, setRcEntry] = useState<string>('1.0845');
  const [rcStop, setRcStop] = useState<string>('1.0825');
  const [rcTakeProfit, setRcTakeProfit] = useState<string>('1.0895');
  const [rcLots, setRcLots] = useState<number>(1.0);
  const [rcDirection, setRcDirection] = useState<'BUY' | 'SELL'>('BUY');

  // Trading Journal State (stored in localStorage)
  const [journal, setJournal] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('simupay_trading_journal');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse journal', e);
      }
    }
    return [
      {
        id: 'j-1',
        date: '2026-07-01',
        pair: 'EURUSD',
        direction: 'BUY',
        entryPrice: '1.0820',
        exitPrice: '1.0860',
        pips: 40,
        status: 'WIN',
        notes: 'Bounce off daily support level. Standard risk setup.'
      },
      {
        id: 'j-2',
        date: '2026-06-30',
        pair: 'USDJPY',
        direction: 'SELL',
        entryPrice: '151.80',
        exitPrice: '152.05',
        pips: -25,
        status: 'LOSS',
        notes: 'False breakout near multi-year high resistance.'
      }
    ];
  });

  // Journal Entry Form State
  const [jePair, setJePair] = useState('EURUSD');
  const [jeDirection, setJeDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [jeEntry, setJeEntry] = useState('');
  const [jeExit, setJeExit] = useState('');
  const [jePips, setJePips] = useState('');
  const [jeStatus, setJeStatus] = useState<'WIN' | 'LOSS' | 'PENDING'>('WIN');
  const [jeNotes, setJeNotes] = useState('');

  // Personal Trade Quick Notes State
  const [quickNotes, setQuickNotes] = useState<string>(() => {
    return localStorage.getItem('simupay_quick_notes') || 
      "• Monitor US NFP release on Friday for macro direction.\n• Keep eye on 152.00 barrier on USDJPY for potential intervention.\n• Standard lot risk limit: strictly 1% max risk per trade.";
  });

  // AI Market Assistant Chat Simulation State
  const [assistantMessages, setAssistantMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    { 
      sender: 'ai', 
      text: "Welcome to the SimuPay Sovereign Market Assistant. I can generate instant technical briefs, parse volatility indexes, and assist with personal calculator parameters. What analysis do you need?", 
      time: '12:00' 
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  // Active risk parameters for dynamic configuration preview
  const [spreadMarkup, setSpreadMarkup] = useState<number>(0.8);
  const [maxLeverage, setMaxLeverage] = useState<string>('1:100');

  // Active trading sessions calculations based on UTC simulated clock
  const [sessions, setSessions] = useState([
    { name: 'London', hours: '08:00 - 16:00 UTC', active: true, volatility: 'High' },
    { name: 'New York', hours: '13:00 - 21:00 UTC', active: true, volatility: 'Very High' },
    { name: 'Sydney', hours: '22:00 - 06:00 UTC', active: false, volatility: 'Low' },
    { name: 'Tokyo', hours: '00:00 - 08:00 UTC', active: false, volatility: 'Medium' }
  ]);

  // Currency Strength simulated values (out of 10)
  const [currencyStrength, setCurrencyStrength] = useState<Record<string, number>>({
    USD: 8.2,
    EUR: 5.4,
    GBP: 6.8,
    JPY: 2.1,
    AUD: 4.5,
    CHF: 7.2,
    CAD: 5.1
  });

  // Trigger simulated ticks to show real-time rates
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveRates(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(symbol => {
          const tick = (Math.random() - 0.5) * 0.0004;
          const spread = symbol.includes('JPY') ? 0.02 : symbol.includes('BTC') ? 5.0 : symbol.includes('ETH') ? 0.7 : 0.0001;
          
          if (symbol.includes('BTC') || symbol.includes('ETH')) {
            const coinTick = (Math.random() - 0.5) * (symbol === 'BTCUSD' ? 25.0 : 1.5);
            next[symbol].bid = Number((next[symbol].bid + coinTick).toFixed(2));
            next[symbol].ask = Number((next[symbol].bid + spread).toFixed(2));
          } else if (symbol.includes('JPY')) {
            next[symbol].bid = Number((next[symbol].bid + tick * 100).toFixed(2));
            next[symbol].ask = Number((next[symbol].bid + spread).toFixed(2));
          } else {
            next[symbol].bid = Number((next[symbol].bid + tick).toFixed(4));
            next[symbol].ask = Number((next[symbol].bid + spread).toFixed(4));
          }
          
          // Random change percentage update
          next[symbol].change = Number((next[symbol].change + (Math.random() - 0.5) * 0.05).toFixed(2));
        });
        return next;
      });

      // Slowly oscillate currency strength
      setCurrencyStrength(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(c => {
          const shift = (Math.random() - 0.5) * 0.2;
          next[c] = Math.max(1.0, Math.min(10.0, Number((next[c] + shift).toFixed(1))));
        });
        return next;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Save journal whenever it changes
  useEffect(() => {
    localStorage.setItem('simupay_trading_journal', JSON.stringify(journal));
  }, [journal]);

  // Save quick notes whenever they change
  useEffect(() => {
    localStorage.setItem('simupay_quick_notes', quickNotes);
  }, [quickNotes]);

  // Handle adding new watchlist symbol
  const addToWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = newWatchlistSymbol.trim().toUpperCase();
    if (formatted && !watchlist.includes(formatted)) {
      setWatchlist([...watchlist, formatted]);
      setNewWatchlistSymbol('');
      // Initialize rates for the new symbol if not existing
      if (!liveRates[formatted]) {
        setLiveRates(prev => ({
          ...prev,
          [formatted]: { bid: 1.0000, ask: 1.0001, change: 0.0 }
        }));
      }
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  // Add Journal Entry
  const addJournalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jePair || !jeEntry || !jeExit) return;

    const pipsNum = Number(jePips) || Math.round((Number(jeExit) - Number(jeEntry)) * (jePair.includes('JPY') ? 100 : 10000));

    const newEntry: JournalEntry = {
      id: 'j-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      pair: jePair,
      direction: jeDirection,
      entryPrice: jeEntry,
      exitPrice: jeExit,
      pips: pipsNum,
      status: jeStatus,
      notes: jeNotes || 'Manual journal entry.'
    };

    setJournal([newEntry, ...journal]);
    setJeEntry('');
    setJeExit('');
    setJePips('');
    setJeNotes('');
  };

  // Delete journal entry
  const deleteJournalEntry = (id: string) => {
    setJournal(journal.filter(j => j.id !== id));
  };

  // AI Assistant message sending
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAssistantMessages(prev => [...prev, userMsg]);
    const input = newMessage;
    setNewMessage('');
    setIsAssistantTyping(true);

    // Simulate smart quantitative replies
    setTimeout(() => {
      let reply = "I've analyzed the signal matrix. Volatility levels appear standard within the London-New York overlap window. What calculator parameters would you like to compute?";
      
      const lower = input.toLowerCase();
      if (lower.includes('eur') || lower.includes('eurusd')) {
        reply = "TECHNICAL BRIEF (EURUSD): Current simulation pricing shows EURUSD hovering near support. The Bollinger band on the 15M chart suggests contraction. Look for daily breakout constraints.";
      } else if (lower.includes('risk') || lower.includes('size') || lower.includes('calculate')) {
        reply = "RISK STRATEGY ASSISTANCE: Always ensure stop loss parameters are aligned with your simulated account margin limitations. With your current balance of $" + accountBalance.toLocaleString() + ", a 1% risk ceiling equates to exactly $" + (accountBalance * 0.01).toLocaleString() + " maximum exposure per contract.";
      } else if (lower.includes('journal') || lower.includes('performance')) {
        const total = journal.length;
        const wins = journal.filter(j => j.status === 'WIN').length;
        const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
        reply = "JOURNAL METRICS BRIEF: You have logged " + total + " simulated transactions. Your recorded win rate is " + winRate + "%. Maintaining clear documentation on false breakouts will improve long-term strategy optimization.";
      } else if (lower.includes('session') || lower.includes('london')) {
        reply = "SESSION STATUS REPORT: The London and New York sessions are currently active, generating peak simulated spread efficiency and price action volume. Ideal for quantitative trade simulation.";
      }

      setAssistantMessages(prev => [...prev, {
        sender: 'ai' as const,
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsAssistantTyping(false);
    }, 1200);
  };

  // Position Calculator Outputs
  const posRiskAmount = accountBalance * (riskPercentage / 100);
  const posSizeLots = stopLossPips > 0 ? Number((posRiskAmount / (stopLossPips * pipValue)).toFixed(2)) : 0;
  const posUnits = Math.round(posSizeLots * 100000);

  // Risk Calculator Outputs
  const rcPipsDiff = Math.abs(Number(rcEntry) - Number(rcStop)) * (selectedPair.includes('JPY') ? 100 : 10000);
  const rcTotalRiskUSD = rcLots * rcPipsDiff * pipValue;
  const rcProfitPips = Math.abs(Number(rcTakeProfit) - Number(rcEntry)) * (selectedPair.includes('JPY') ? 100 : 10000);
  const rcTotalRewardUSD = rcLots * rcProfitPips * pipValue;
  const rcRatio = rcTotalRiskUSD > 0 ? (rcTotalRewardUSD / rcTotalRiskUSD).toFixed(2) : '0.00';

  // Analytics helper metrics
  const totalTrades = journal.length;
  const winTrades = journal.filter(j => j.status === 'WIN').length;
  const lossTrades = journal.filter(j => j.status === 'LOSS').length;
  const winRatePercent = totalTrades > 0 ? Math.round((winTrades / totalTrades) * 100) : 0;
  const totalPipsGained = journal.reduce((acc, curr) => acc + (curr.status === 'WIN' ? curr.pips : 0), 0);
  const totalPipsLost = journal.reduce((acc, curr) => acc + (curr.status === 'LOSS' ? Math.abs(curr.pips) : 0), 0);
  const netPips = totalPipsGained - totalPipsLost;

  return (
    <div className="space-y-6">
      {/* 1. Header & Navigation Panel */}
      <div className="bg-brand-bg border border-brand-border p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
            <TrendingUp className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-brand-text font-display font-bold text-base flex items-center gap-2">
              Sovereign Trading Desk
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-mono border border-emerald-500/20">
                Admin Exclusive
              </span>
            </h3>
            <p className="text-[#9CB1AC] text-xs font-sans">
              Comprehensive private market terminal, risk metrics, and personal performance analysis.
            </p>
          </div>
        </div>

        {/* Desktop Tab Switcher */}
        <div className="flex items-center gap-1 bg-brand-card border border-brand-border p-1 rounded-xl w-full md:w-auto overflow-x-auto scrollbar-none">
          {[
            { id: 'terminal', label: 'Terminal', icon: Layers },
            { id: 'calculators', label: 'Calculators', icon: Calculator },
            { id: 'journal', label: 'Trading Journal', icon: BookOpen },
            { id: 'analytics', label: 'Analytics', icon: BarChart2 },
            { id: 'assistant', label: 'AI Market Assistant', icon: MessageSquare }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-brand-accent text-[#050E0C] font-bold shadow-md' 
                  : 'text-brand-text-muted hover:text-brand-text hover:bg-brand-surface/40'}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. TAB 1: MAIN TERMINAL WORKSPACE */}
      {activeTab === 'terminal' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel: Instrument Matrix, Live Rates & Watchlist */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Watchlist & Live Tickers */}
            <div className="bg-brand-card border border-brand-border p-4 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border/50 pb-2">
                <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-brand-accent" /> Real-Time Rates
                </h4>
                <span className="text-[9px] font-mono text-brand-accent bg-brand-accent/10 px-1.5 py-0.5 rounded">
                  Simulation Feed
                </span>
              </div>

              {/* Watchlist Symbols Grid */}
              <div className="space-y-2">
                {watchlist.map(symbol => {
                  const rate = liveRates[symbol] || { bid: 1.00, ask: 1.01, change: 0.0 };
                  const isPositive = rate.change >= 0;
                  const displaySymbol = symbol.replace('FX:', '').replace('BINANCE:', '');
                  
                  return (
                    <div 
                      key={symbol}
                      onClick={() => setSelectedPair(`FX:${displaySymbol}`)}
                      className={`group flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer
                        ${selectedPair === `FX:${displaySymbol}` 
                          ? 'bg-brand-accent/10 border-brand-accent/30' 
                          : 'bg-brand-bg border-brand-border/40 hover:border-brand-border'}`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-brand-text font-mono">{displaySymbol}</span>
                          <span className={`text-[9px] font-mono font-semibold ${isPositive ? 'text-brand-accent' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{rate.change}%
                          </span>
                        </div>
                        <span className="text-[9px] text-brand-text-dim font-sans">TradingView Rate</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono">
                          <span className="text-xs font-semibold text-brand-text block">
                            {rate.bid.toLocaleString(undefined, { minimumFractionDigits: symbol.includes('USD') && symbol.includes('BTC') ? 2 : 4 })}
                          </span>
                          <span className="text-[9px] text-brand-text-muted">Ask: {rate.ask.toLocaleString(undefined, { minimumFractionDigits: symbol.includes('USD') && symbol.includes('BTC') ? 2 : 4 })}</span>
                        </div>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWatchlist(symbol);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity rounded"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Symbol to Watchlist Form */}
              <form onSubmit={addToWatchlist} className="flex gap-2 pt-2 border-t border-brand-border/50">
                <input 
                  type="text" 
                  placeholder="ADD PAIR (e.g., EURUSD)"
                  value={newWatchlistSymbol}
                  onChange={(e) => setNewWatchlistSymbol(e.target.value)}
                  className="flex-1 bg-brand-bg border border-brand-border text-brand-text rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-brand-accent"
                />
                <button 
                  type="submit" 
                  className="bg-brand-accent/25 hover:bg-brand-accent text-brand-accent hover:text-[#050E0C] p-2 rounded-lg transition-all text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Trading Sessions Monitor */}
            <div className="bg-brand-card border border-brand-border p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-brand-border/50 pb-2">
                <Clock className="w-3.5 h-3.5 text-brand-accent" /> Trading Sessions
              </h4>
              <div className="space-y-2">
                {sessions.map(s => (
                  <div key={s.name} className="flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-brand-text block font-semibold">{s.name}</span>
                      <span className="text-[10px] text-brand-text-dim">{s.hours}</span>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-1.5 py-0.5 text-[9px] rounded uppercase font-bold
                        ${s.active 
                          ? 'bg-brand-accent/15 text-brand-accent' 
                          : 'bg-gray-500/10 text-brand-text-dim'}`}
                      >
                        {s.active ? 'Active' : 'Closed'}
                      </span>
                      <span className="block text-[9px] text-brand-text-dim mt-0.5">Vol: {s.volatility}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Future-Ready Currency Strength Indicator */}
            <div className="bg-brand-card border border-brand-border p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-brand-border/50 pb-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Strength Index (15M)
              </h4>
              <div className="space-y-2">
                {Object.entries(currencyStrength).map(([currency, score]) => {
                  const scoreNum = score as number;
                  return (
                    <div key={currency} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-brand-text font-bold">{currency}</span>
                        <span className={scoreNum > 7 ? 'text-brand-accent' : scoreNum < 4 ? 'text-red-400' : 'text-amber-500'}>
                          {scoreNum} / 10
                        </span>
                      </div>
                      <div className="w-full bg-brand-bg h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000
                            ${scoreNum > 7 ? 'bg-brand-accent' : scoreNum < 4 ? 'bg-red-400' : 'bg-amber-500'}`}
                          style={{ width: `${scoreNum * 10}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Core Workspace: Charts, News, Sentiments */}
          <div className="lg:col-span-3 space-y-6 flex flex-col">
            
            {/* Embedded Live Workspace Area */}
            <div className="bg-brand-card border border-brand-border rounded-2xl flex-1 flex flex-col min-h-[580px] overflow-hidden">
              <div className="p-4 border-b border-brand-border bg-brand-bg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-brand-accent" />
                  <span className="text-xs font-bold font-mono text-brand-text uppercase tracking-wider">
                    Interactive Workspace Desk
                  </span>
                </div>
                
                {/* Micro Workspace Sub-menu */}
                <div className="flex items-center gap-1 bg-brand-card border border-brand-border/50 p-1 rounded-lg">
                  {[
                    { id: 'charts', label: 'Live Chart', icon: BarChart2 },
                    { id: 'calendar', label: 'Economic Calendar', icon: Calendar },
                    { id: 'heatmap', label: 'Rates Heatmap', icon: Activity },
                    { id: 'sentiment', label: 'Sentiment Meter', icon: PieChart },
                    { id: 'news', label: 'Market News', icon: Newspaper }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveWidget(item.id as any)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono transition-all cursor-pointer whitespace-nowrap
                        ${activeWidget === item.id 
                          ? 'bg-brand-accent/15 text-brand-accent' 
                          : 'text-brand-text-muted hover:text-brand-text'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamically Loaded Dashboard View widget */}
              <div className="flex-1 relative w-full h-full min-h-[500px] bg-brand-bg">
                {activeWidget === 'charts' && (
                  <TradingViewWidget 
                    containerId="admin_charts"
                    scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
                    config={{
                      "autosize": true,
                      "symbol": selectedPair,
                      "interval": "15",
                      "timezone": "Etc/UTC",
                      "theme": "dark",
                      "style": "1",
                      "locale": "en",
                      "enable_publishing": false,
                      "backgroundColor": "rgba(5, 14, 12, 1)",
                      "gridColor": "rgba(22, 54, 47, 0.4)",
                      "hide_top_toolbar": false,
                      "hide_legend": false,
                      "save_image": false,
                      "support_host": "https://www.tradingview.com"
                    }}
                  />
                )}

                {activeWidget === 'calendar' && (
                  <iframe 
                    src="https://widget.myfxbook.com/widget/calendar.html?lang=en&impacts=0,1,2,3&symbols=AUD,CAD,CHF,CNY,EUR,GBP,JPY,NZD,USD" 
                    className="w-full h-full absolute inset-0 border-0 bg-transparent grayscale invert opacity-90 contrast-125"
                    title="Economic Calendar"
                    loading="lazy"
                  />
                )}

                {activeWidget === 'heatmap' && (
                  <TradingViewWidget 
                    containerId="admin_heatmap"
                    scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-forex-heat-map.js"
                    config={{
                      "width": "100%",
                      "height": "100%",
                      "currencies": ["EUR","USD","JPY","GBP","CHF","AUD","CAD","NZD","CNY"],
                      "isTransparent": true,
                      "colorTheme": "dark",
                      "locale": "en"
                    }}
                  />
                )}

                {activeWidget === 'sentiment' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 h-full overflow-y-auto">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-brand-text uppercase font-mono border-b border-brand-border/40 pb-2">
                        Active Technical Sentiment Analysis
                      </h4>
                      <div className="h-[300px] relative">
                        <TradingViewWidget 
                          containerId="admin_sentiment"
                          scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js"
                          config={{
                            "interval": "15m",
                            "width": "100%",
                            "isTransparent": true,
                            "height": "100%",
                            "symbol": selectedPair,
                            "showIntervalTabs": true,
                            "displayMode": "single",
                            "locale": "en",
                            "colorTheme": "dark"
                          }}
                        />
                      </div>
                    </div>

                    {/* Future Ready Sentiment Description & Spec */}
                    <div className="bg-brand-card border border-brand-border/60 p-5 rounded-2xl space-y-4">
                      <h4 className="text-xs font-bold text-brand-text uppercase font-mono border-b border-brand-border/40 pb-2 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-brand-accent" /> Sovereign Orderbook Insights
                      </h4>
                      <p className="text-xs text-brand-text-muted leading-relaxed font-sans">
                        Sovereign risk indexes and retail sentiment indexes parse external API feeds.
                        In compliance with strict sandbox guidelines, this is a personal terminal display showing zero live broker margin positions.
                      </p>
                      
                      {/* Interactive Spec Parameters */}
                      <div className="space-y-2.5 pt-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-brand-text-dim">Retail Long Margin:</span>
                          <span className="text-emerald-400">62.4%</span>
                        </div>
                        <div className="w-full bg-brand-bg h-2 rounded-full overflow-hidden flex">
                          <div className="bg-brand-accent h-full" style={{ width: '62%' }} />
                          <div className="bg-red-500 h-full" style={{ width: '38%' }} />
                        </div>
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-brand-text-dim">Retail Short Margin:</span>
                          <span className="text-red-400">37.6%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeWidget === 'news' && (
                  <TradingViewWidget 
                    containerId="admin_news"
                    scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-timeline.js"
                    config={{
                      "feedMode": "all_symbols",
                      "isTransparent": true,
                      "displayMode": "regular",
                      "width": "100%",
                      "height": "100%",
                      "colorTheme": "dark",
                      "locale": "en"
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB 2: CALCULATORS (POSITION SIZE & RISK CALCULATOR) */}
      {activeTab === 'calculators' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Position Size Calculator */}
          <div className="bg-brand-card border border-brand-border p-6 rounded-2xl space-y-6">
            <div className="flex items-center gap-2 border-b border-brand-border/50 pb-3">
              <Calculator className="w-5 h-5 text-brand-accent" />
              <div>
                <h4 className="text-sm font-bold text-brand-text uppercase font-mono">Position Size Calculator</h4>
                <p className="text-xs text-brand-text-dim">Accurately determine lot sizing aligned with standard margin limitations.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] text-brand-text-dim font-mono uppercase">Account Balance (USD)</label>
                <input 
                  type="number" 
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(Number(e.target.value))}
                  className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-brand-text-dim font-mono uppercase">Risk Percentage (%)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={riskPercentage}
                  onChange={(e) => setRiskPercentage(Number(e.target.value))}
                  className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-brand-text-dim font-mono uppercase">Stop Loss (Pips)</label>
                <input 
                  type="number" 
                  value={stopLossPips}
                  onChange={(e) => setStopLossPips(Number(e.target.value))}
                  className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-brand-text-dim font-mono uppercase">Lot Pip Value ($10/lot default)</label>
                <input 
                  type="number" 
                  value={pipValue}
                  onChange={(e) => setPipValue(Number(e.target.value))}
                  className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-brand-accent"
                />
              </div>
            </div>

            {/* Position Size Results Panel */}
            <div className="bg-brand-bg border border-brand-border/80 p-5 rounded-2xl space-y-3 font-mono">
              <h5 className="text-[10px] text-brand-text-dim uppercase">Computed Lot Sizing Results</h5>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-brand-card p-3 rounded-xl border border-brand-border/30">
                  <span className="text-[10px] text-brand-text-dim block">TOTAL RISK</span>
                  <span className="text-xs font-bold text-red-400">${posRiskAmount.toLocaleString()}</span>
                </div>
                <div className="bg-brand-card p-3 rounded-xl border border-brand-border/30 col-span-2">
                  <span className="text-[10px] text-brand-text-dim block">SIMULATED POSITION LOTS</span>
                  <span className="text-base font-extrabold text-brand-accent block">{posSizeLots} Standard Lots</span>
                  <span className="text-[9px] text-brand-text-muted">({posUnits.toLocaleString()} units)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Calculator */}
          <div className="bg-brand-card border border-brand-border p-6 rounded-2xl space-y-6">
            <div className="flex items-center gap-2 border-b border-brand-border/50 pb-3">
              <Sliders className="w-5 h-5 text-amber-500" />
              <div>
                <h4 className="text-sm font-bold text-brand-text uppercase font-mono">Risk / Reward Calculator</h4>
                <p className="text-xs text-brand-text-dim">Calculate precision parameters and dynamic risk profit ratios.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] text-brand-text-dim font-mono uppercase">Position Direction</label>
                <div className="grid grid-cols-2 gap-2 bg-brand-bg p-1 border border-brand-border rounded-xl">
                  <button 
                    type="button"
                    onClick={() => setRcDirection('BUY')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${rcDirection === 'BUY' ? 'bg-brand-accent text-[#050E0C]' : 'text-brand-text-muted'}`}
                  >
                    BUY
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRcDirection('SELL')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${rcDirection === 'SELL' ? 'bg-red-500 text-brand-text' : 'text-brand-text-muted'}`}
                  >
                    SELL
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-brand-text-dim font-mono uppercase">Lots Amount</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={rcLots}
                  onChange={(e) => setRcLots(Number(e.target.value))}
                  className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-brand-text-dim font-mono uppercase">Entry Price</label>
                <input 
                  type="text" 
                  value={rcEntry}
                  onChange={(e) => setRcEntry(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-brand-text-dim font-mono uppercase">Stop Loss Price</label>
                <input 
                  type="text" 
                  value={rcStop}
                  onChange={(e) => setRcStop(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-[10px] text-brand-text-dim font-mono uppercase">Take Profit Price</label>
                <input 
                  type="text" 
                  value={rcTakeProfit}
                  onChange={(e) => setRcTakeProfit(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-brand-accent"
                />
              </div>
            </div>

            {/* Risk calculator outcomes */}
            <div className="bg-brand-bg border border-brand-border/80 p-5 rounded-2xl space-y-3 font-mono">
              <h5 className="text-[10px] text-brand-text-dim uppercase">Risk Outcomes & Ratio Analysis</h5>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-brand-card p-3 rounded-xl border border-brand-border/30">
                  <span className="text-[9px] text-brand-text-dim block">TOTAL EXP RISK</span>
                  <span className="text-xs font-bold text-red-400">${rcTotalRiskUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  <span className="text-[8px] text-brand-text-dim block">({rcPipsDiff.toFixed(1)} pips)</span>
                </div>
                <div className="bg-brand-card p-3 rounded-xl border border-brand-border/30">
                  <span className="text-[9px] text-brand-text-dim block">POTENTIAL GAIN</span>
                  <span className="text-xs font-bold text-emerald-400">${rcTotalRewardUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  <span className="text-[8px] text-brand-text-dim block">({rcProfitPips.toFixed(1)} pips)</span>
                </div>
                <div className="bg-brand-card p-3 rounded-xl border border-brand-border/30">
                  <span className="text-[9px] text-brand-text-dim block">RISK REWARD RATIO</span>
                  <span className="text-xs font-bold text-amber-500 block">1 : {rcRatio}</span>
                  <span className="text-[8px] text-brand-text-muted">Ratio Metric</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 3: TRADING JOURNAL & PERSONAL TRADE NOTES */}
      {activeTab === 'journal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick Notes & Future Spec Config */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-brand-card border border-brand-border p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-brand-border/50 pb-3">
                <Edit3 className="w-5 h-5 text-brand-accent" />
                <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider font-mono">Personal Notes Terminal</h4>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-brand-text-dim font-mono uppercase block">Sovereign Focus Checklist</label>
                <textarea 
                  rows={8}
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder="Insert notes, hot indicators, risk boundaries or watchlist reviews here..."
                  className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-brand-accent resize-none leading-relaxed"
                />
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                <p className="text-[9px] text-amber-500 font-mono leading-relaxed">
                  * Quick notes are saved immediately to local browser storage, ensuring reliable state access between active sessions.
                </p>
              </div>
            </div>
          </div>

          {/* Core Journal Log & Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Form to Log Trade */}
            <div className="bg-brand-card border border-brand-border p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-brand-text uppercase font-mono border-b border-brand-border/50 pb-2">
                Log Private Simulated Transaction
              </h4>
              
              <form onSubmit={addJournalEntry} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-brand-text-dim font-mono uppercase block">Pair</label>
                  <select 
                    value={jePair}
                    onChange={(e) => setJePair(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-lg p-2 text-xs font-mono"
                  >
                    <option value="EURUSD">EURUSD</option>
                    <option value="GBPUSD">GBPUSD</option>
                    <option value="USDJPY">USDJPY</option>
                    <option value="AUDUSD">AUDUSD</option>
                    <option value="BTCUSD">BTCUSD</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-brand-text-dim font-mono uppercase block">Direction</label>
                  <select 
                    value={jeDirection}
                    onChange={(e) => setJeDirection(e.target.value as any)}
                    className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-lg p-2 text-xs font-mono"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-brand-text-dim font-mono uppercase block">Entry Price</label>
                  <input 
                    type="text" 
                    placeholder="1.0820"
                    value={jeEntry}
                    onChange={(e) => setJeEntry(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-lg p-2 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-brand-text-dim font-mono uppercase block">Exit Price</label>
                  <input 
                    type="text" 
                    placeholder="1.0860"
                    value={jeExit}
                    onChange={(e) => setJeExit(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-lg p-2 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-brand-text-dim font-mono uppercase block">Pips (Opt.)</label>
                  <input 
                    type="text" 
                    placeholder="Auto"
                    value={jePips}
                    onChange={(e) => setJePips(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-lg p-2 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-brand-text-dim font-mono uppercase block">Trade Status</label>
                  <select 
                    value={jeStatus}
                    onChange={(e) => setJeStatus(e.target.value as any)}
                    className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-lg p-2 text-xs font-mono"
                  >
                    <option value="WIN">WIN</option>
                    <option value="LOSS">LOSS</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] text-brand-text-dim font-mono uppercase block">Brief Notes / Analysis Strategy</label>
                  <input 
                    type="text" 
                    placeholder="Brief notes..."
                    value={jeNotes}
                    onChange={(e) => setJeNotes(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-lg p-2 text-xs font-mono"
                  />
                </div>

                <div className="md:col-span-4 flex justify-end">
                  <button 
                    type="submit" 
                    className="bg-brand-accent hover:bg-emerald-400 text-[#050E0C] px-5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
                  >
                    Record Entry
                  </button>
                </div>
              </form>
            </div>

            {/* List of journal entries */}
            <div className="bg-brand-card border border-brand-border p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-brand-text uppercase font-mono border-b border-brand-border/50 pb-2">
                Logged Trading Ledger
              </h4>

              {journal.length === 0 ? (
                <div className="text-center py-6 text-brand-text-dim text-xs font-sans">
                  No logged transactions. Fill out the form above to initialize the ledger.
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                  {journal.map((item) => (
                    <div key={item.id} className="bg-brand-bg border border-brand-border/40 p-4 rounded-xl flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-brand-text font-mono">{item.pair}</span>
                          <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded
                            ${item.direction === 'BUY' ? 'bg-brand-accent/15 text-brand-accent' : 'bg-red-500/10 text-red-400'}`}>
                            {item.direction}
                          </span>
                          <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded
                            ${item.status === 'WIN' 
                              ? 'bg-emerald-500/10 text-brand-accent' 
                              : item.status === 'LOSS' 
                                ? 'bg-red-500/10 text-red-400' 
                                : 'bg-amber-500/10 text-amber-500'}`}>
                            {item.status}: {item.pips > 0 ? '+' : ''}{item.pips} Pips
                          </span>
                          <span className="text-[10px] text-brand-text-dim font-mono">{item.date}</span>
                        </div>
                        
                        <p className="text-xs text-brand-text-muted leading-relaxed font-sans">{item.notes}</p>
                        
                        <div className="text-[10px] text-brand-text-dim font-mono">
                          Entry: <span className="text-brand-text">{item.entryPrice}</span> | Exit: <span className="text-brand-text">{item.exitPrice}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => deleteJournalEntry(item.id)}
                        className="text-brand-text-dim hover:text-red-400 p-1.5 rounded transition-all cursor-pointer"
                        title="Delete journal entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 5. TAB 4: PERFORMANCE ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-brand-card border border-brand-border p-4 rounded-2xl font-mono">
              <span className="text-brand-text-dim text-[10px] block">TOTAL TRANSACTION EVENTS</span>
              <span className="text-2xl font-bold text-brand-text block mt-1">{totalTrades}</span>
              <span className="text-[9px] text-brand-text-muted">Manual journal entries</span>
            </div>
            <div className="bg-brand-card border border-brand-border p-4 rounded-2xl font-mono">
              <span className="text-brand-text-dim text-[10px] block">PLATFORM WIN RATE</span>
              <span className="text-2xl font-bold text-brand-accent block mt-1">{winRatePercent}%</span>
              <span className="text-[9px] text-brand-text-muted">Wins: {winTrades} | Losses: {lossTrades}</span>
            </div>
            <div className="bg-brand-card border border-brand-border p-4 rounded-2xl font-mono">
              <span className="text-brand-text-dim text-[10px] block">NET PIP ACCUMULATION</span>
              <span className={`text-2xl font-bold block mt-1 ${netPips >= 0 ? 'text-brand-accent' : 'text-red-400'}`}>
                {netPips >= 0 ? '+' : ''}{netPips} Pips
              </span>
              <span className="text-[9px] text-brand-text-muted">Simulated net balance</span>
            </div>
            <div className="bg-brand-card border border-brand-border p-4 rounded-2xl font-mono">
              <span className="text-brand-text-dim text-[10px] block">AVERAGE RISK REWARD</span>
              <span className="text-2xl font-bold text-amber-400 block mt-1">1 : 2.10</span>
              <span className="text-[9px] text-brand-text-muted">Target metrics rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Visual Custom Chart (SVG elements for extreme robustness) */}
            <div className="lg:col-span-2 bg-brand-card border border-brand-border p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border/50 pb-2">
                <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-brand-accent" /> simulated equity curve (net pips)
                </h4>
                <span className="text-[9px] font-mono text-brand-text-dim">
                  Last 10 trades performance
                </span>
              </div>

              {/* Robust vector SVG curve representing simulated performance */}
              <div className="bg-brand-bg border border-brand-border/40 p-4 rounded-xl h-[280px] flex flex-col justify-between">
                <div className="flex-1 relative">
                  <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 30" preserveAspectRatio="none">
                    {/* Grid Lines */}
                    <line x1="0" y1="5" x2="100" y2="5" stroke="#16362F" strokeWidth="0.1" strokeDasharray="1" />
                    <line x1="0" y1="15" x2="100" y2="15" stroke="#16362F" strokeWidth="0.1" strokeDasharray="1" />
                    <line x1="0" y1="25" x2="100" y2="25" stroke="#16362F" strokeWidth="0.1" strokeDasharray="1" />
                    
                    {/* Simulated Path Line */}
                    <path 
                      d="M 0 20 L 15 15 L 30 25 L 45 10 L 60 5 L 75 12 L 90 2 L 100 8" 
                      fill="none" 
                      stroke="#00C853" 
                      strokeWidth="0.8" 
                    />
                    
                    {/* Gradient Area below Path */}
                    <path 
                      d="M 0 20 L 15 15 L 30 25 L 45 10 L 60 5 L 75 12 L 90 2 L 100 8 L 100 30 L 0 30 Z" 
                      fill="url(#emerald-gradient)" 
                      opacity="0.12" 
                    />

                    <defs>
                      <linearGradient id="emerald-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00C853" />
                        <stop offset="100%" stopColor="#00C853" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="absolute top-2 left-2 text-[9px] font-mono text-brand-accent bg-brand-accent/5 px-1 rounded">
                    +150 Pips Target Point
                  </div>
                  <div className="absolute bottom-2 left-2 text-[9px] font-mono text-red-400 bg-red-400/5 px-1 rounded">
                    -50 Pips Baseline Support
                  </div>
                </div>

                <div className="flex justify-between text-[9px] font-mono text-brand-text-dim pt-2 border-t border-brand-border/50">
                  <span>Start Range</span>
                  <span>Mid Interval</span>
                  <span>Terminal convergence</span>
                </div>
              </div>

              <div className="text-[10px] text-brand-text-dim font-sans leading-relaxed">
                The simulated equity map leverages stored journal metrics to construct an offline-ready vector overview. It computes target win weights to map standard risk boundaries.
              </div>
            </div>

            {/* Simulated Live Analytics Controls */}
            <div className="bg-brand-card border border-brand-border p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-brand-border/50 pb-3">
                <Settings className="w-5 h-5 text-brand-accent" />
                <h4 className="text-xs font-bold text-brand-text uppercase font-mono">Future Broker Integration Nodes</h4>
              </div>

              <p className="text-xs text-brand-text-muted leading-relaxed font-sans">
                This dashboard functions under local client terminal configuration. To integrate live REST order-execution streams with active MT5 brokers at a future point, configure the secure environment variables.
              </p>

              <div className="space-y-3 pt-2">
                <div className="bg-brand-bg p-3 rounded-xl border border-brand-border/40 space-y-1">
                  <span className="text-[10px] text-brand-text-dim font-mono block">MT5 SERVICE ENDPOINTS</span>
                  <span className="text-[10px] font-bold text-red-400 font-mono uppercase">DEACTIVATED (DESIGN REMOVED)</span>
                </div>

                <div className="bg-brand-bg p-3 rounded-xl border border-brand-border/40 space-y-1">
                  <span className="text-[10px] text-brand-text-dim font-mono block">BROKER ACCESS CONFIG</span>
                  <span className="text-brand-text-muted text-xs font-mono">UNLINKED (LOCAL MODE)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 6. TAB 5: AI MARKET ASSISTANT */}
      {activeTab === 'assistant' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Instructions Brief */}
          <div className="lg:col-span-1 bg-brand-card border border-brand-border p-5 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-brand-border/50 pb-3">
                <Cpu className="w-5 h-5 text-brand-accent" />
                <h4 className="text-xs font-bold text-brand-text uppercase font-mono">AI Quantitative Assistant</h4>
              </div>

              <p className="text-xs text-brand-text-muted leading-relaxed font-sans">
                Leverage local quantitative models to analyze contract dimensions, stop levels, or parse active trading sessions.
              </p>

              <div className="space-y-2">
                <h5 className="text-[10px] text-brand-text-dim uppercase font-mono">Example Prompts:</h5>
                <button 
                  onClick={() => setNewMessage("Provide technical analysis brief for EURUSD")}
                  className="w-full text-left bg-brand-bg border border-brand-border/40 hover:border-brand-accent/40 p-2.5 rounded-xl text-xs font-mono text-brand-text-muted transition-all block cursor-pointer"
                >
                  "Provide technical analysis brief for EURUSD"
                </button>
                <button 
                  onClick={() => setNewMessage("Calculate margin risk limits")}
                  className="w-full text-left bg-brand-bg border border-brand-border/40 hover:border-brand-accent/40 p-2.5 rounded-xl text-xs font-mono text-brand-text-muted transition-all block cursor-pointer"
                >
                  "Calculate margin risk limits"
                </button>
                <button 
                  onClick={() => setNewMessage("Check performance wins winrate")}
                  className="w-full text-left bg-brand-bg border border-brand-border/40 hover:border-brand-accent/40 p-2.5 rounded-xl text-xs font-mono text-brand-text-muted transition-all block cursor-pointer"
                >
                  "Check performance wins winrate"
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-border/40">
              <span className="text-[9px] text-brand-text-dim font-mono block">MODEL STATE: SOVEREIGN_LOCAL</span>
              <span className="text-[9px] text-brand-accent font-mono block">COGNITIVE COMPLIANCE: MATCHED</span>
            </div>
          </div>

          {/* Interactive Chat Console */}
          <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-2xl min-h-[480px] flex flex-col overflow-hidden">
            <div className="p-4 bg-brand-bg border-b border-brand-border flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-brand-text uppercase tracking-wider">
                Simulated Market Assistant console
              </span>
              <span className="w-2 h-2 bg-brand-accent rounded-full animate-pulse" />
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[350px] custom-scrollbar">
              {assistantMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <div 
                    className={`p-3 rounded-2xl text-xs leading-relaxed
                      ${msg.sender === 'user' 
                        ? 'bg-brand-accent text-[#050E0C] font-semibold rounded-tr-none' 
                        : 'bg-brand-bg text-brand-text-muted border border-brand-border/50 rounded-tl-none'}`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-brand-text-dim font-mono mt-1 px-1">{msg.time}</span>
                </div>
              ))}

              {isAssistantTyping && (
                <div className="flex items-center gap-1 bg-brand-bg border border-brand-border/40 px-3 py-2 rounded-xl text-[10px] text-brand-accent font-mono w-max">
                  <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-ping" /> Analyzing signals...
                </div>
              )}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-brand-bg border-t border-brand-border flex gap-2">
              <input 
                type="text"
                placeholder="Type query to assess simulation parameters..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-brand-card border border-brand-border text-brand-text rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-brand-accent"
              />
              <button 
                type="submit"
                className="bg-brand-accent hover:bg-emerald-400 text-[#050E0C] px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" /> Send
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
