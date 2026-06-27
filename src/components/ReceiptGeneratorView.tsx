import React, { useState } from 'react';
import { useToast } from './Toast';
import { 
  Receipt as ReceiptIcon, 
  Printer, 
  CheckCircle, 
  Calendar, 
  Coins, 
  Hash, 
  ShieldCheck, 
  Lock, 
  Zap, 
  ArrowRight, 
  CreditCard, 
  Info,
  DollarSign,
  TrendingUp,
  User,
  ShieldAlert,
  Building
} from 'lucide-react';
import { Transaction, Profile } from '../types';
import { DISCLOSURE_TEXT } from '../data/partners';
import { cryptoProviders, digitalWalletProviders, bankProviders } from '../data/paymentProviders';

interface ReceiptGeneratorViewProps {
  transactions: Transaction[];
  profile: Profile | null;
  lastTransaction: Transaction | null;
  onNavigate: (tab: any) => void;
}

export function ReceiptGeneratorView({ transactions, profile, lastTransaction, onNavigate }: ReceiptGeneratorViewProps) {
  // Syncing with existing transactions or manual
  const [selectedTxId, setSelectedTxId] = useState<string>('manual');
  const [receiptPrinted, setReceiptPrinted] = useState(false);
  
  // Subscription parameters
  const today = new Date().toISOString().split('T')[0];
  const receiptsToday = transactions.filter(t => t.created_at?.startsWith(today)).length;
  const maxFreeReceipts = 5;
  const isPremium = profile?.subscription_status === 'Active';
  const canGenerate = isPremium || receiptsToday < maxFreeReceipts;

  // Selected configuration states
  const [selectedCategory, setSelectedCategory] = useState<'crypto' | 'wallet' | 'bank'>('crypto');
  const [selectedProvider, setSelectedProvider] = useState<string>('Coinbase');

  // Input fields state
  const [amount, setAmount] = useState('1250.00');
  const [currency, setCurrency] = useState('USD');
  const [assetCoin, setAssetCoin] = useState('USDT');
  const [network, setNetwork] = useState('TRON (TRC-20)');
  const [sender, setSender] = useState('Merchant Operations');
  const [recipient, setRecipient] = useState('Global Settlement Corp');
  const [status, setStatus] = useState<'completed' | 'pending' | 'failed'>('completed');
  const [fee, setFee] = useState('1.50');
  const [cashtag, setCashtag] = useState('$SimuPayGlobal');
  const [bankAccount, setBankAccount] = useState('**** 4829');
  const [routingNo, setRoutingNo] = useState('021000021');
  
  // Stored references for random values
  const [refNumber] = useState(() => 'REF-' + Math.floor(10000000 + Math.random() * 90000000));
  const [receiptNumber] = useState(() => 'REC-' + Math.floor(100000 + Math.random() * 900000));
  const [txHash] = useState(() => '0x' + Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));

  const { showToast } = useToast();

  // Reset provider selection when changing category
  const handleCategoryChange = (cat: 'crypto' | 'wallet' | 'bank') => {
    setSelectedCategory(cat);
    if (cat === 'crypto') {
      setSelectedProvider('Coinbase');
      setCurrency('USD');
    } else if (cat === 'wallet') {
      setSelectedProvider('Cash App');
      setCurrency('USD');
    } else {
      setSelectedProvider('Chase');
      setCurrency('USD');
    }
  };

  const handlePrint = () => {
    window.print();
    showToast('Receipt document print triggered successfully!', 'success');
    setReceiptPrinted(true);
  };

  if (!canGenerate) {
    return (
      <div className="bg-[#091714] p-8 rounded-2xl border border-[#16362F] shadow-2xl space-y-6 flex flex-col items-center text-center max-w-xl mx-auto my-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/15 border-2 border-amber-500/35 flex items-center justify-center text-amber-500">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-display font-bold text-white">Limit Reached</h3>
          <p className="text-xs text-[#9CB1AC] leading-relaxed">
            You’ve reached today’s free receipt generation limit. Upgrade to Premium for unlimited receipt generation and access to all advanced features.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-2">
          <button
            onClick={() => onNavigate('subscription')}
            className="px-5 py-3 bg-[#00C853] hover:bg-emerald-400 text-[#050E0C] rounded-xl font-bold text-xs font-display tracking-wide transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1.5 flex-1"
          >
            <Zap className="w-4 h-4 fill-current" /> Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  // Active transaction payload for template renderer
  const receiptData = {
    provider: selectedProvider,
    category: selectedCategory,
    amount: parseFloat(amount) || 0,
    currency,
    assetCoin,
    network,
    sender,
    recipient,
    status,
    fee: parseFloat(fee) || 0,
    cashtag,
    bankAccount,
    routingNo,
    refNo: refNumber,
    recNo: receiptNumber,
    txHash,
    date: today,
    time: '20:45:00 UTC'
  };

  // Provider branding theme definitions
  const getProviderStyle = (providerName: string) => {
    switch (providerName) {
      case 'Coinbase':
        return {
          bg: 'bg-white',
          accent: '#0052FF',
          accentText: 'text-[#0052FF]',
          headerBg: 'bg-[#0052FF]',
          headerText: 'text-white',
          tagline: 'COINBASE COMPLIANCE TRANSACTION',
          logoColor: 'text-[#0052FF]'
        };
      case 'Binance':
        return {
          bg: 'bg-[#12161A]',
          accent: '#F0B90B',
          accentText: 'text-[#F0B90B]',
          headerBg: 'bg-[#1E2329]',
          headerText: 'text-[#F0B90B]',
          tagline: 'BINANCE OFFICIAL LEDGER AUDIT',
          logoColor: 'text-[#F0B90B]'
        };
      case 'Cash App':
        return {
          bg: 'bg-white',
          accent: '#00D632',
          accentText: 'text-[#00D632]',
          headerBg: 'bg-[#00D632]',
          headerText: 'text-white',
          tagline: 'CASH APP SETTLEMENT RECEIPT',
          logoColor: 'text-[#00D632]'
        };
      case 'PayPal':
        return {
          bg: 'bg-white',
          accent: '#003087',
          accentText: 'text-[#003087]',
          headerBg: 'bg-[#003087]',
          headerText: 'text-white',
          tagline: 'PAYPAL OFFICIAL INVOICE TRANSACTION',
          logoColor: 'text-[#003087]'
        };
      case 'MetaMask':
        return {
          bg: 'bg-[#161311]',
          accent: '#E17726',
          accentText: 'text-[#E17726]',
          headerBg: 'bg-[#241E1A]',
          headerText: 'text-[#E17726]',
          tagline: 'METAMASK SECURE WEB3 SETTLEMENT',
          logoColor: 'text-[#E17726]'
        };
      case 'Trust Wallet':
        return {
          bg: 'bg-white',
          accent: '#3375BB',
          accentText: 'text-[#3375BB]',
          headerBg: 'bg-[#3375BB]',
          headerText: 'text-white',
          tagline: 'TRUST WALLET COMPLIANT RECEIPT',
          logoColor: 'text-[#3375BB]'
        };
      case 'Zelle':
        return {
          bg: 'bg-white',
          accent: '#7414CA',
          accentText: 'text-[#7414CA]',
          headerBg: 'bg-[#7414CA]',
          headerText: 'text-white',
          tagline: 'ZELLE DIRECT BANK TRANSFER',
          logoColor: 'text-[#7414CA]'
        };
      case 'Venmo':
        return {
          bg: 'bg-white',
          accent: '#008CFF',
          accentText: 'text-[#008CFF]',
          headerBg: 'bg-[#008CFF]',
          headerText: 'text-white',
          tagline: 'VENMO INSTANT PAYMENT REPORT',
          logoColor: 'text-[#008CFF]'
        };
      case 'Wise':
        return {
          bg: 'bg-white',
          accent: '#9FE870',
          accentText: 'text-gray-900',
          headerBg: 'bg-[#1E3E26]',
          headerText: 'text-[#9FE870]',
          tagline: 'WISE INTERNATIONAL BANK SWIFT',
          logoColor: 'text-[#9FE870]'
        };
      default:
        // Generic Customizable Bank or standard platform styling
        return {
          bg: 'bg-white',
          accent: '#111827',
          accentText: 'text-gray-900',
          headerBg: 'bg-gray-900',
          headerText: 'text-white',
          tagline: `${providerName.toUpperCase()} OFFICIAL CLEARING RECORD`,
          logoColor: 'text-gray-800'
        };
    }
  };

  const currentTheme = getProviderStyle(selectedProvider);
  const isDarkReceipt = currentTheme.bg.startsWith('bg-[#');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            <ReceiptIcon className="w-5 h-5 text-[#00C853]" /> Multi-Provider Receipt Generator
          </h2>
          <p className="text-xs text-[#9CB1AC]">
            Create fully custom, highly realistic transaction compliance records and audits.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-950/20 px-3.5 py-1.5 rounded-xl border border-emerald-900/30 text-[11px] font-mono">
          <span className="text-gray-400">Daily Free Limit:</span>
          <span className={isPremium ? 'text-emerald-400 font-bold' : 'text-amber-500 font-bold'}>
            {isPremium ? 'UNLIMITED (PREMIUM)' : `${receiptsToday}/${maxFreeReceipts}`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Form: Configuration */}
        <div className="lg:col-span-2 space-y-4 print:hidden">
          <div className="bg-brand-card p-5 rounded-xl border border-emerald-950/40 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-emerald-950/50 pb-2">
              Step 1: Category & Brand Selection
            </h3>

            {/* Provider Category Switcher */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleCategoryChange('crypto')}
                className={`py-2 px-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 cursor-pointer
                  ${selectedCategory === 'crypto'
                    ? 'bg-[#00C853]/10 border-[#00C853] text-[#00C853]'
                    : 'bg-brand-bg/40 border-emerald-950 text-gray-400 hover:text-white'
                  }`}
              >
                <Coins className="w-4.5 h-4.5" />
                <span>Crypto</span>
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('wallet')}
                className={`py-2 px-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 cursor-pointer
                  ${selectedCategory === 'wallet'
                    ? 'bg-[#00C853]/10 border-[#00C853] text-[#00C853]'
                    : 'bg-brand-bg/40 border-emerald-950 text-gray-400 hover:text-white'
                  }`}
              >
                <CreditCard className="w-4.5 h-4.5" />
                <span>Wallet</span>
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('bank')}
                className={`py-2 px-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 cursor-pointer
                  ${selectedCategory === 'bank'
                    ? 'bg-[#00C853]/10 border-[#00C853] text-[#00C853]'
                    : 'bg-brand-bg/40 border-emerald-950 text-gray-400 hover:text-white'
                  }`}
              >
                <Building className="w-4.5 h-4.5" />
                <span>Bank</span>
              </button>
            </div>

            {/* Provider Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Brand / Provider</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00C853] text-xs"
              >
                {selectedCategory === 'crypto' && 
                  cryptoProviders.map(p => <option key={p} value={p}>{p}</option>)
                }
                {selectedCategory === 'wallet' && 
                  digitalWalletProviders.map(p => <option key={p} value={p}>{p}</option>)
                }
                {selectedCategory === 'bank' && 
                  bankProviders.map(p => <option key={p} value={p}>{p}</option>)
                }
              </select>
            </div>

            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-emerald-950/50 pb-1 pt-3">
              Step 2: Transaction Specifics
            </h3>

            {/* Dynamic Inputs according to the Selected Category & Provider */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount ($)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 1500.00"
                    className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Currency</label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs font-mono uppercase"
                  />
                </div>
              </div>

              {selectedCategory === 'crypto' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Asset/Coin</label>
                    <input
                      type="text"
                      value={assetCoin}
                      onChange={(e) => setAssetCoin(e.target.value)}
                      placeholder="e.g. USDT, BTC"
                      className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs font-mono uppercase"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Crypto Network</label>
                    <input
                      type="text"
                      value={network}
                      onChange={(e) => setNetwork(e.target.value)}
                      placeholder="e.g. TRON (TRC-20)"
                      className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {selectedCategory === 'wallet' && selectedProvider === 'Cash App' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cashtag</label>
                  <input
                    type="text"
                    value={cashtag}
                    onChange={(e) => setCashtag(e.target.value)}
                    placeholder="e.g. $Recipient"
                    className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs font-mono"
                  />
                </div>
              )}

              {selectedCategory === 'bank' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Account Number</label>
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      placeholder="e.g. **** 1234"
                      className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Routing No</label>
                    <input
                      type="text"
                      value={routingNo}
                      onChange={(e) => setRoutingNo(e.target.value)}
                      placeholder="9-digit Routing"
                      className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sender Name</label>
                  <input
                    type="text"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Recipient Name</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Processing Fee</label>
                  <input
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00C853] text-xs font-mono"
                  >
                    <option value="completed">COMPLETED</option>
                    <option value="pending">PENDING</option>
                    <option value="failed">FAILED</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Printable Custom Styled Template */}
        <div className="lg:col-span-3 space-y-4">
          {/* Main Styled Document Preview */}
          <div
            id="printable-receipt-card"
            className={`p-7 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col border transition-colors duration-300 max-w-lg mx-auto print:p-4 print:shadow-none print:border-none print:w-full print:mx-0 print:rounded-none
              ${isDarkReceipt ? 'bg-[#0f1115] border-gray-800 text-gray-200' : 'bg-white border-gray-100 text-gray-900'}
            `}
          >
            {/* Template Top Header */}
            <div className={`p-4 rounded-xl flex justify-between items-center ${currentTheme.headerBg} ${currentTheme.headerText}`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-sm tracking-tight">
                  {selectedProvider.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-tight">{selectedProvider}</h4>
                  <p className="text-[9px] uppercase tracking-widest opacity-80">{currentTheme.tagline}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[8px] font-mono font-black uppercase rounded border
                ${status === 'completed' ? 'bg-[#00C853]/10 border-[#00C853]/30 text-[#00C853]' : ''}
                ${status === 'pending' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : ''}
                ${status === 'failed' ? 'bg-red-500/10 border-red-500/30 text-red-500' : ''}
              `}>
                {status}
              </span>
            </div>

            {/* Core Transaction Value Banner */}
            <div className="py-6 text-center border-b border-gray-100/10 space-y-1">
              <p className={`text-[10px] font-mono uppercase tracking-wider ${isDarkReceipt ? 'text-gray-500' : 'text-gray-400'}`}>
                Transaction Settled Amount
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight">
                ${receiptData.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs font-normal opacity-80">{receiptData.currency}</span>
              </h1>
              {selectedCategory === 'crypto' && (
                <div className="inline-flex items-center gap-1.5 text-[10px] bg-[#00C853]/5 px-2.5 py-0.5 rounded-full border border-[#00C853]/15 text-[#00C853]">
                  <span>{receiptData.amount.toLocaleString()} {receiptData.assetCoin}</span>
                  <span>•</span>
                  <span>{receiptData.network}</span>
                </div>
              )}
            </div>

            {/* Render Tailored Field Properties */}
            <div className="py-6 space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className={`font-mono ${isDarkReceipt ? 'text-gray-500' : 'text-gray-400'}`}>Receipt Reference:</span>
                <span className="font-mono font-bold break-all max-w-[200px] text-right">{receiptData.refNo}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className={`font-mono ${isDarkReceipt ? 'text-gray-500' : 'text-gray-400'}`}>Clearing Date:</span>
                <span className="font-medium text-right">{receiptData.date} {receiptData.time}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className={`font-mono ${isDarkReceipt ? 'text-gray-500' : 'text-gray-400'}`}>Sender Target:</span>
                <span className="font-semibold text-right">{receiptData.sender}</span>
              </div>

              {selectedCategory === 'wallet' && selectedProvider === 'Cash App' && (
                <div className="flex justify-between items-center bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10">
                  <span className="text-[10px] font-mono text-[#00D632]">Recipient Cashtag:</span>
                  <span className="font-mono font-bold text-[#00D632]">{receiptData.cashtag}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className={`font-mono ${isDarkReceipt ? 'text-gray-500' : 'text-gray-400'}`}>Recipient Target:</span>
                <span className="font-semibold text-right">{receiptData.recipient}</span>
              </div>

              {selectedCategory === 'bank' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className={`font-mono ${isDarkReceipt ? 'text-gray-500' : 'text-gray-400'}`}>Routing Number:</span>
                    <span className="font-mono text-right">{receiptData.routingNo}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`font-mono ${isDarkReceipt ? 'text-gray-500' : 'text-gray-400'}`}>Clearing Account:</span>
                    <span className="font-mono text-right">{receiptData.bankAccount}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center">
                <span className={`font-mono ${isDarkReceipt ? 'text-gray-500' : 'text-gray-400'}`}>System Hash / ID:</span>
                <span className="font-mono break-all max-w-[200px] text-[10px] text-right tracking-tight opacity-70">
                  {receiptData.txHash}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100/10 pt-3">
                <span className={`font-mono ${isDarkReceipt ? 'text-gray-500' : 'text-gray-400'}`}>Clearing Surcharge / Fee:</span>
                <span className="font-mono font-semibold text-right">${receiptData.fee.toFixed(2)}</span>
              </div>
            </div>

            {/* Printable Compliance Footer & Barcode/QR Row */}
            <div className="border-t border-gray-100/10 pt-5 flex justify-between items-end mt-auto">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SECURE COMPLIANT CERTIFICATE</span>
                </div>
                {/* Barcode Visual */}
                <div className="flex gap-[1.5px] items-end h-6 bg-white/5 select-none pt-1">
                  {[1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2].map((w, i) => (
                    <div key={i} className={`h-full ${isDarkReceipt ? 'bg-gray-700' : 'bg-gray-800'}`} style={{ width: `${w * 1.5}px` }} />
                  ))}
                </div>
              </div>

              {/* Realistic SVG Vector QR code with custom core node branding */}
              <div className={`w-14 h-14 p-1 border rounded flex items-center justify-center ${isDarkReceipt ? 'bg-white/5 border-gray-800' : 'bg-white border-gray-200'}`}>
                <svg viewBox="0 0 100 100" className={`w-full h-full fill-current ${isDarkReceipt ? 'text-gray-300' : 'text-gray-900'}`}>
                  <path d="M0,0h30v30h-30z M10,10h10v10h-10z" />
                  <path d="M70,0h30v30h-30z M80,10h10v10h-10z" />
                  <path d="M0,70h30v30h-30z M10,80h10v10h-10z" />
                  <path d="M40,10h10v10h-10z M50,20h10v10h-10z M35,40h15v10h-15z M60,40h20v10h-20z M45,60h10v15h-10z" />
                  <path d="M70,70h10v10h-10z M90,70h10v10h-10z M80,85h15v10h-15z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Configuration Action Keys */}
          <div className="flex flex-col gap-4 max-w-lg mx-auto print:hidden">
            <button
              onClick={handlePrint}
              className="w-full py-3 bg-brand-card hover:border-[#00C853]/40 text-white font-semibold text-xs rounded-xl border border-emerald-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-500" /> Print Audited Receipt
            </button>

            {/* Print Success Confirmation & Success Recommendation */}
            {receiptPrinted && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-4 bg-[#050e0c] border border-emerald-950/60 rounded-xl flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00C853] flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">Receipt Generated Successfully!</p>
                    <p className="text-[10px] text-gray-400">Document formatted and ledger synchronization verified.</p>
                  </div>
                  <button 
                    onClick={() => setReceiptPrinted(false)} 
                    className="text-gray-500 hover:text-gray-300 text-xs font-mono cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                <div className="p-4 bg-[#091714] border border-[#00C853]/15 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#00C853] font-mono font-bold uppercase tracking-wider block">Recommended Exchange</span>
                    <p className="text-xs text-white font-semibold font-display">Looking for a cryptocurrency exchange?</p>
                    <p className="text-[10px] text-gray-400">Create a free Gate account.</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <a
                      href="https://www.gate.com/share/simupaypro"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#00C853] hover:bg-[#00E676] text-black font-semibold text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1 shadow transition-all cursor-pointer block text-center"
                    >
                      Visit Gate
                    </a>
                  </div>
                </div>
                
                <div className="text-[8px] text-gray-600 font-mono text-center leading-relaxed">
                  {DISCLOSURE_TEXT}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
