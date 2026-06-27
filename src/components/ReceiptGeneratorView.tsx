import React, { useState, useEffect } from 'react';
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
  CreditCard, 
  Info,
  DollarSign,
  User,
  Building,
  Mail,
  Camera,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Send,
  Download,
  Eye,
  X,
  Smartphone
} from 'lucide-react';
import { Transaction, Profile } from '../types';
import { DISCLOSURE_TEXT } from '../data/partners';

interface ReceiptGeneratorViewProps {
  transactions: Transaction[];
  profile: Profile | null;
  lastTransaction: Transaction | null;
  onNavigate: (tab: any) => void;
}

export function ReceiptGeneratorView({ transactions, profile, lastTransaction, onNavigate }: ReceiptGeneratorViewProps) {
  const { showToast } = useToast();
  
  // Account Status check
  const isPremium = profile?.subscription_status === 'Active' || profile?.license_active === true || profile?.role === 'admin';
  const today = new Date().toISOString().split('T')[0];
  const receiptsToday = transactions.filter(t => t.created_at?.startsWith(today)).length;
  const maxFreeReceipts = 5;
  const canGenerate = isPremium || receiptsToday < maxFreeReceipts;

  // Active Selected Brand Template
  const [selectedBrand, setSelectedBrand] = useState<'Cash App' | 'Coinbase' | 'Zelle'>('Cash App');

  // Input states optimized by brand
  // 1. General details
  const [amount, setAmount] = useState('150.00');
  const [status, setStatus] = useState<'completed' | 'pending' | 'failed'>('completed');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState(() => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  });

  // 2. Cash App Specific Fields
  const [cashRecipientName, setCashRecipientName] = useState('Sarah Connor');
  const [cashRecipientTag, setCashRecipientTag] = useState('$SarahC19');
  const [cashSenderName, setCashSenderName] = useState('Marcus Wright');
  const [cashSenderTag, setCashSenderTag] = useState('$MarcusW');
  const [cashNote, setCashNote] = useState('Settlement for hardware components 🖥️');
  const [cashIdentifier, setCashIdentifier] = useState(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return '#' + Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  });
  const [cashSource, setCashSource] = useState('Cash Balance');

  // 3. Coinbase Specific Fields
  const [coinAsset, setCoinAsset] = useState('USDT');
  const [coinNetwork, setCoinNetwork] = useState('TRON Network (TRC-20)');
  const [coinAddress, setCoinAddress] = useState('T9yD14Nj9y7eXv3hT2b1M0V8L4X9Z8Y7W');
  const [coinHash, setCoinHash] = useState(() => {
    const chars = 'abcdef0123456789';
    return '0x' + Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  });
  const [coinFee, setCoinFee] = useState('1.50');
  const [coinConfirmations, setCoinConfirmations] = useState('12');

  // 4. Zelle Specific Fields
  const [zelleRecipientName, setZelleRecipientName] = useState('John Connor');
  const [zelleRecipientContact, setZelleRecipientContact] = useState('john.connor@resistance.net');
  const [zelleMemo, setZelleMemo] = useState('Consulting Fees');
  const [zelleBankName, setZelleBankName] = useState('Chase Bank');
  const [zelleAccountType, setZelleAccountType] = useState('Checking (**** 4829)');
  const [zelleConfirmationNo, setZelleConfirmationNo] = useState(() => {
    return 'ZL' + Math.floor(10000000 + Math.random() * 90000000);
  });

  // Premium Alert Form Fields
  const [providerEmail, setProviderEmail] = useState('');
  const [sendAlertEmail, setSendAlertEmail] = useState(false);

  // Generation Workflow states
  const [generatedReceipt, setGeneratedReceipt] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScreenshotMode, setIsScreenshotMode] = useState(false);

  // Simulated Alert dispatch terminal logs
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertLogs, setAlertLogs] = useState<string[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);

  // Auto-generate some randomized identifiers on brand switch
  const randomizeIdentifiers = (brand: 'Cash App' | 'Coinbase' | 'Zelle') => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    if (brand === 'Cash App') {
      setCashIdentifier('#' + Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''));
    } else if (brand === 'Coinbase') {
      const hex = 'abcdef0123456789';
      setCoinHash('0x' + Array.from({ length: 64 }, () => hex[Math.floor(Math.random() * hex.length)]).join(''));
    } else if (brand === 'Zelle') {
      setZelleConfirmationNo('ZL' + Math.floor(10000000 + Math.random() * 90000000));
    }
  };

  // Sync inputs with last transaction if requested
  const handleLoadLastTransaction = () => {
    if (lastTransaction) {
      setAmount(lastTransaction.amount.toString());
      setStatus(lastTransaction.status);
      if (lastTransaction.tx_hash) {
        setCoinHash(lastTransaction.tx_hash);
      }
      showToast('Loaded details from your last transaction!', 'success');
    } else {
      showToast('No active transaction found to load.', 'warning');
    }
  };

  const handleGenerate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid transfer amount.', 'error');
      return;
    }

    setIsGenerating(true);
    setGeneratedReceipt(null);

    // Simulate cryptographic compilation delay
    await new Promise((resolve) => setTimeout(resolve, 1400));

    // Construct generated payload
    const receiptPayload = {
      brand: selectedBrand,
      amount: parseFloat(amount),
      status,
      date,
      time,
      cash: {
        recipientName: cashRecipientName,
        recipientTag: cashRecipientTag.startsWith('$') ? cashRecipientTag : '$' + cashRecipientTag,
        senderName: cashSenderName,
        senderTag: cashSenderTag.startsWith('$') ? cashSenderTag : '$' + cashSenderTag,
        note: cashNote,
        identifier: cashIdentifier,
        source: cashSource,
      },
      coinbase: {
        asset: coinAsset,
        network: coinNetwork,
        address: coinAddress,
        hash: coinHash,
        fee: parseFloat(coinFee) || 0,
        confirmations: coinConfirmations,
      },
      zelle: {
        recipientName: zelleRecipientName,
        recipientContact: zelleRecipientContact,
        memo: zelleMemo,
        bankName: zelleBankName,
        accountType: zelleAccountType,
        confirmationNo: zelleConfirmationNo,
      },
      isPremiumReceipt: isPremium,
      timestamp: new Date().toISOString()
    };

    setGeneratedReceipt(receiptPayload);
    setIsGenerating(false);
    showToast(`${selectedBrand} receipt generated with high realism!`, 'success');

    // Trigger premium alert SMTP simulator if upgraded & email provided
    if (isPremium && sendAlertEmail && providerEmail) {
      triggerPremiumAlert(receiptPayload);
    }
  };

  const triggerPremiumAlert = async (payload: any) => {
    setSendingAlert(true);
    setCurrentProgress(10);
    setAlertLogs([`[INFO] Resolving secure mail SMTP servers...`]);

    const steps = [
      { text: `[INFO] Secure API connection handshake initialized.`, delay: 800, progress: 30 },
      { text: `[INFO] Validating recipient profile routing for: ${providerEmail}`, delay: 700, progress: 50 },
      { text: `[SUCCESS] Destination mailbox path authenticated.`, delay: 500, progress: 65 },
      { text: `[INFO] Constructing certified, cryptographically signed HTML receipt payload...`, delay: 900, progress: 80 },
      { text: `[INFO] Delivering instant transaction push webhook to ${selectedBrand} client gateway...`, delay: 800, progress: 95 },
      { text: `[SUCCESS] Notification Alert successfully delivered to ${providerEmail}! Transaction logged under reference #${payload.brand === 'Cash App' ? payload.cash.identifier : payload.brand === 'Coinbase' ? payload.coinbase.hash.substring(0, 10) : payload.zelle.confirmationNo}`, delay: 1000, progress: 100 }
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, step.delay));
      setAlertLogs(prev => [...prev, step.text]);
      setCurrentProgress(step.progress);
    }

    showToast(`Instant alert successfully dispatched to ${providerEmail}!`, 'success');
  };

  const handlePrint = () => {
    window.print();
    showToast('Receipt printed or PDF download triggered.', 'success');
  };

  // Prepopulate standard fields on brand switch
  useEffect(() => {
    randomizeIdentifiers(selectedBrand);
    if (selectedBrand === 'Cash App') {
      setAmount('150.00');
    } else if (selectedBrand === 'Coinbase') {
      setAmount('1250.00');
    } else if (selectedBrand === 'Zelle') {
      setAmount('450.00');
    }
  }, [selectedBrand]);

  return (
    <div className="space-y-6 relative">
      
      {/* 📸 FULL SCREEN MOBILE SCREENSHOT HELPER MODE OVERLAY */}
      {isScreenshotMode && generatedReceipt && (
        <div className="fixed inset-0 bg-[#020706]/98 z-50 flex flex-col items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          
          {/* Top Instructions Bar */}
          <div className="w-full max-w-md bg-emerald-950/40 border border-emerald-900/35 p-3 rounded-xl mb-4 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#00C853]">
              <Smartphone className="w-4 h-4 animate-bounce" />
              <span className="font-bold">Screenshot Helper Ready</span>
            </div>
            <p className="text-[10px] text-gray-400">Press phone buttons to snap!</p>
            <button
              onClick={() => setIsScreenshotMode(false)}
              className="p-1.5 bg-brand-card hover:bg-emerald-900/20 text-gray-400 hover:text-white rounded-lg transition-all cursor-pointer"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Realistic Receipt Centered Canvas */}
          <div className="w-full max-w-[365px] bg-black/40 rounded-3xl p-2 border border-emerald-900/10 shadow-2xl">
            <ReceiptRenderBox receipt={generatedReceipt} />
          </div>

          {/* Floating Exit Trigger */}
          <button
            onClick={() => setIsScreenshotMode(false)}
            className="mt-6 px-6 py-2.5 bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-red-900/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <X className="w-4 h-4" /> Exit Screenshot Mode
          </button>
        </div>
      )}

      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            <ReceiptIcon className="w-5 h-5 text-[#00C853]" /> Premium Receipt Studio
          </h2>
          <p className="text-xs text-[#9CB1AC]">
            Configure and compile highly realistic financial transaction receipts with custom fields and alert routing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sync Trigger */}
          <button
            onClick={handleLoadLastTransaction}
            className="bg-emerald-950/20 hover:bg-emerald-950/45 text-[#00C853] border border-emerald-900/30 px-3 py-1.5 rounded-xl text-[11px] font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Pull Last TX
          </button>

          <div className="flex items-center gap-2 bg-emerald-950/20 px-3 py-1.5 rounded-xl border border-emerald-900/30 text-[11px] font-mono">
            <span className="text-gray-400">Status:</span>
            <span className={isPremium ? 'text-emerald-400 font-bold flex items-center gap-1' : 'text-amber-500 font-bold flex items-center gap-1'}>
              {isPremium ? (
                <>
                  <Sparkles className="w-3 h-3 fill-current" /> PREMIUM ACTIVE
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" /> FREE TIER ({receiptsToday}/{maxFreeReceipts})
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Form Controls */}
        <div className="lg:col-span-5 space-y-4 print:hidden">
          <div className="bg-brand-card p-5 rounded-2xl border border-emerald-950/40 shadow-xl space-y-4">
            
            {/* BRAND CHOICES */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Template Brand</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Cash App', 'Coinbase', 'Zelle'] as const).map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => setSelectedBrand(brand)}
                    className={`py-2.5 px-1.5 rounded-xl border text-[11px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer
                      ${selectedBrand === brand
                        ? 'bg-[#00C853]/10 border-[#00C853] text-[#00C853]'
                        : 'bg-brand-bg/40 border-emerald-950 text-gray-400 hover:text-white hover:border-emerald-800'
                      }`}
                  >
                    {brand === 'Cash App' && <CreditCard className="w-4 h-4 text-[#00D632]" />}
                    {brand === 'Coinbase' && <Coins className="w-4 h-4 text-[#0052FF]" />}
                    {brand === 'Zelle' && <Building className="w-4 h-4 text-[#7414CA]" />}
                    <span>{brand}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SHARED GENERAL FORM FIELDS */}
            <div className="border-t border-emerald-950/50 pt-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#00C853]" /> Basic Parameters
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Transfer Amount ($)</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl pl-8 pr-3 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-[#00C853]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Transfer Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00C853] text-xs font-mono"
                  >
                    <option value="completed">COMPLETED</option>
                    <option value="pending">PENDING / IN PROGRESS</option>
                    <option value="failed">FAILED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#00C853]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#00C853]"
                  />
                </div>
              </div>
            </div>

            {/* BRAND-SPECIFIC FIELDS DYNAMIC MOUNT */}
            <div className="border-t border-emerald-950/50 pt-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Custom {selectedBrand} Fields
              </h3>

              {/* CASH APP SPECIFIC INPUTS */}
              {selectedBrand === 'Cash App' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Recipient Name</label>
                      <input
                        type="text"
                        value={cashRecipientName}
                        onChange={(e) => setCashRecipientName(e.target.value)}
                        placeholder="e.g. Sarah Connor"
                        className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#00D632]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Recipient Cashtag</label>
                      <input
                        type="text"
                        value={cashRecipientTag}
                        onChange={(e) => setCashRecipientTag(e.target.value)}
                        placeholder="e.g. $SarahC"
                        className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-[#00D632]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Sender Name</label>
                      <input
                        type="text"
                        value={cashSenderName}
                        onChange={(e) => setCashSenderName(e.target.value)}
                        placeholder="e.g. Marcus Wright"
                        className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#00D632]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Sender Cashtag</label>
                      <input
                        type="text"
                        value={cashSenderTag}
                        onChange={(e) => setCashSenderTag(e.target.value)}
                        placeholder="e.g. $MarcusW"
                        className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-[#00D632]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Transaction Note</label>
                    <input
                      type="text"
                      value={cashNote}
                      onChange={(e) => setCashNote(e.target.value)}
                      placeholder="What is this transfer for?"
                      className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#00D632]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cash Identifier</label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={cashIdentifier}
                          onChange={(e) => setCashIdentifier(e.target.value)}
                          className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none"
                        />
                        <button
                          onClick={() => randomizeIdentifiers('Cash App')}
                          className="px-2.5 bg-emerald-950/40 hover:bg-emerald-900/30 text-[#00C853] rounded-lg border border-emerald-900/20 text-xs cursor-pointer"
                          title="Generate Random"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Funding Source</label>
                      <select
                        value={cashSource}
                        onChange={(e) => setCashSource(e.target.value)}
                        className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-2.5 py-2.5 text-white focus:outline-none text-xs"
                      >
                        <option value="Cash Balance">Cash Balance</option>
                        <option value="Debit Card (**** 1928)">Debit Card (**** 1928)</option>
                        <option value="Visa Credit (**** 5829)">Visa Credit (**** 5829)</option>
                        <option value="Chase checking (**** 0281)">Chase checking (**** 0281)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* COINBASE SPECIFIC INPUTS */}
              {selectedBrand === 'Coinbase' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cryptocurrency Asset</label>
                      <select
                        value={coinAsset}
                        onChange={(e) => setCoinAsset(e.target.value)}
                        className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white focus:outline-none text-xs font-mono"
                      >
                        <option value="USDT">USDT (Tether)</option>
                        <option value="BTC">BTC (Bitcoin)</option>
                        <option value="ETH">ETH (Ethereum)</option>
                        <option value="USDC">USDC (USD Coin)</option>
                        <option value="LTC">LTC (Litecoin)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Blockchain Network</label>
                      <input
                        type="text"
                        value={coinNetwork}
                        onChange={(e) => setCoinNetwork(e.target.value)}
                        placeholder="e.g. TRON Network (TRC-20)"
                        className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#0052FF]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Recipient Wallet Address</label>
                    <input
                      type="text"
                      value={coinAddress}
                      onChange={(e) => setCoinAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-[10px] font-mono focus:outline-none focus:border-[#0052FF]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Transaction TxHash</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={coinHash}
                        onChange={(e) => setCoinHash(e.target.value)}
                        placeholder="Transaction hash..."
                        className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2 text-[10px] font-mono text-white focus:outline-none"
                      />
                      <button
                        onClick={() => randomizeIdentifiers('Coinbase')}
                        className="px-2.5 bg-emerald-950/40 hover:bg-emerald-900/30 text-[#00C853] rounded-lg border border-emerald-900/20 text-xs cursor-pointer"
                        title="Randomize Hash"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Network Fee</label>
                      <input
                        type="number"
                        value={coinFee}
                        onChange={(e) => setCoinFee(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#0052FF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Block Confirmations</label>
                      <input
                        type="text"
                        value={coinConfirmations}
                        onChange={(e) => setCoinConfirmations(e.target.value)}
                        placeholder="e.g. 12"
                        className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#0052FF]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ZELLE SPECIFIC INPUTS */}
              {selectedBrand === 'Zelle' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Recipient Name</label>
                      <input
                        type="text"
                        value={zelleRecipientName}
                        onChange={(e) => setZelleRecipientName(e.target.value)}
                        placeholder="e.g. John Connor"
                        className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#7414CA]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email or Phone Number</label>
                      <input
                        type="text"
                        value={zelleRecipientContact}
                        onChange={(e) => setZelleRecipientContact(e.target.value)}
                        placeholder="john.c@resistance.com"
                        className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#7414CA]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Transfer Memo / Note</label>
                    <input
                      type="text"
                      value={zelleMemo}
                      onChange={(e) => setZelleMemo(e.target.value)}
                      placeholder="e.g. Consulting services"
                      className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#7414CA]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Sending Bank</label>
                      <input
                        type="text"
                        value={zelleBankName}
                        onChange={(e) => setZelleBankName(e.target.value)}
                        placeholder="e.g. Chase Bank"
                        className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#7414CA]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Bank Account Type</label>
                      <input
                        type="text"
                        value={zelleAccountType}
                        onChange={(e) => setZelleAccountType(e.target.value)}
                        placeholder="Checking (**** 4829)"
                        className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#7414CA]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Confirmation Number</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={zelleConfirmationNo}
                        onChange={(e) => setZelleConfirmationNo(e.target.value)}
                        className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                      />
                      <button
                        onClick={() => randomizeIdentifiers('Zelle')}
                        className="px-2.5 bg-emerald-950/40 hover:bg-emerald-900/30 text-[#00C853] rounded-lg border border-emerald-900/20 text-xs cursor-pointer"
                        title="Randomize Confirmation"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 📧 PREMIUM SECTION: EMAIL ALERT GATEWAY */}
            <div className="border-t border-emerald-950/50 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-emerald-400" /> Premium Alert Dispatch
                </h3>
                {!isPremium && (
                  <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/25 text-amber-500 rounded text-[9px] font-bold font-display flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> locked
                  </span>
                )}
              </div>

              {isPremium ? (
                <div className="space-y-3 p-3.5 bg-emerald-950/10 border border-emerald-900/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-300">Dispatch Email Alert?</span>
                    <input
                      type="checkbox"
                      checked={sendAlertEmail}
                      onChange={(e) => setSendAlertEmail(e.target.checked)}
                      className="w-4 h-4 rounded border-emerald-900 bg-brand-bg text-[#00C853] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </div>

                  {sendAlertEmail && (
                    <div className="space-y-2 animate-in slide-in-from-top-1 duration-200">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400">Recipient / Provider Email</label>
                        <input
                          type="email"
                          value={providerEmail}
                          onChange={(e) => setProviderEmail(e.target.value)}
                          placeholder="merchant@provider.com"
                          className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-lg px-2.5 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#00C853]"
                        />
                      </div>
                      <p className="text-[9px] text-gray-400 leading-normal">
                        Enabling this will simulate sending an automated alert push with this receipt attached to the recipient's secure client inbox.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-[#050e0c]/50 border border-emerald-950/40 rounded-xl text-center space-y-2">
                  <p className="text-[10px] text-gray-400 leading-normal">
                    Upgraded members can input a custom receiver email and instantly trigger an automated alert notification along with a digital copy of the receipt.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('subscription')}
                    className="w-full py-1.5 bg-[#00C853]/15 hover:bg-[#00C853]/25 text-[#00C853] rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Zap className="w-3 h-3 fill-current" /> Upgrade to Premium
                  </button>
                </div>
              )}
            </div>

            {/* GENERATION ACTION TRIGGER */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 bg-[#00C853] hover:bg-emerald-400 disabled:opacity-50 text-[#050E0C] rounded-xl font-bold text-xs uppercase tracking-wider font-display transition-all shadow-lg shadow-[#00C853]/10 flex items-center justify-center gap-1.5 cursor-pointer mt-4"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Compiling Receipt...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current" /> Compile {selectedBrand} Receipt
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Receipt Display Canvas */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Preview Container Board */}
          <div className="bg-[#050E0C] p-6 rounded-2xl border border-emerald-950/50 shadow-2xl space-y-5 flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center border-b border-emerald-950/50 pb-3 print:hidden">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#00C853]" /> Live Document Console
              </span>
              {generatedReceipt && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsScreenshotMode(true)}
                    className="px-3 py-1.5 bg-emerald-950/30 hover:bg-emerald-900/25 text-[#00C853] border border-emerald-900/20 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title="Open pure full-screen canvas for a clean smartphone snapshot"
                  >
                    <Camera className="w-3.5 h-3.5" /> Screenshot Mode
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-brand-card hover:border-[#00C853]/30 text-white border border-emerald-950/60 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-500" /> Print / PDF
                  </button>
                </div>
              )}
            </div>

            {/* Generated Output Render */}
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3 p-12 text-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-900 border-t-emerald-400 animate-spin"></div>
                  <ReceiptIcon className="w-5 h-5 text-[#00C853]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Cryptographic Compiling Active</p>
                  <p className="text-[10px] text-gray-500">Structuring pixel-perfect brand layers...</p>
                </div>
              </div>
            ) : generatedReceipt ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                
                {/* Simulated SMTP Alert Console Log for Premium */}
                {sendingAlert && (
                  <div className="bg-black/80 rounded-xl border border-emerald-900/20 p-3 font-mono text-[9px] text-emerald-400 space-y-1.5 max-w-lg mx-auto w-full animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between border-b border-emerald-950/50 pb-1.5">
                      <span className="font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        GATEWAY OUTBOX LOG
                      </span>
                      <span>Progress: {currentProgress}%</span>
                    </div>
                    <div className="space-y-1 max-h-[85px] overflow-y-auto">
                      {alertLogs.map((log, i) => (
                        <div key={i} className="leading-tight">{log}</div>
                      ))}
                    </div>
                    {currentProgress === 100 && (
                      <div className="pt-1.5 border-t border-emerald-950/40 text-center text-white font-bold animate-pulse text-[10px]">
                        📧 SECURE PAY ALERT SYSTEM DISPATCHED
                      </div>
                    )}
                  </div>
                )}

                {/* Main Receipt Body Canvas wrapper */}
                <div id="printable-receipt-card" className="w-full max-w-[360px] mx-auto bg-black/20 rounded-2xl p-1.5">
                  <ReceiptRenderBox receipt={generatedReceipt} />
                </div>

                {/* Free Tier Callout box on screenshotting */}
                {!isPremium && (
                  <div className="p-3.5 bg-emerald-950/15 border border-emerald-900/20 rounded-xl space-y-2 max-w-[360px] mx-auto w-full print:hidden">
                    <div className="flex items-start gap-2.5">
                      <Camera className="w-4 h-4 text-[#00C853] mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-white">Free Screenshot Tier Ready</p>
                        <p className="text-[10px] text-gray-400 leading-normal">
                          You are using the free template tier. Take a direct screenshot on your device! For auto-dispatching instant alerts to the merchant email and PDF receipts, upgrade to premium.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-500 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-950/20 border border-emerald-900/20 flex items-center justify-center text-emerald-600">
                  <ReceiptIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">Generate Receipt Output</h4>
                  <p className="text-[10px] text-gray-400 max-w-xs leading-normal">
                    Choose a provider template on the left, adjust your custom parameters, and click **Compile** to generate a realistic document record.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="text-[8px] text-gray-600 font-mono text-center leading-relaxed mt-6 print:hidden">
        {DISCLOSURE_TEXT}
      </div>

    </div>
  );
}

/* 🎨 SUB-COMPONENT: ACTUAL BRAND-SPECIFIC RECEIPTS RENDER BOX */
function ReceiptRenderBox({ receipt }: { receipt: any }) {
  const isCashApp = receipt.brand === 'Cash App';
  const isCoinbase = receipt.brand === 'Coinbase';
  const isZelle = receipt.brand === 'Zelle';

  return (
    <div className="w-full text-left font-sans select-none overflow-hidden rounded-2xl shadow-xl">
      
      {/* 🟢 BRAND 1: CASH APP RENDER */}
      {isCashApp && (
        <div className="bg-[#ffffff] text-[#000000] p-6 space-y-6 flex flex-col min-h-[500px] border border-gray-100">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center space-y-2 pt-2">
            {/* Cash App Logo Circle */}
            <div className="w-12 h-12 rounded-full bg-[#00D632] flex items-center justify-center text-white font-extrabold text-2xl tracking-tight">
              $
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">Cash App</h4>
              <p className="text-[10px] text-gray-400">Web Receipt Verified</p>
            </div>
          </div>

          {/* Large Amount */}
          <div className="text-center space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-[#000000]">
              -${receipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00D632]/10 text-[#00D632]">
              {receipt.status.toUpperCase()}
            </span>
          </div>

          {/* Details Table */}
          <div className="space-y-4 border-t border-b border-gray-100 py-5 text-xs flex-1">
            
            <div className="flex justify-between items-start">
              <span className="text-gray-400 font-semibold">To</span>
              <div className="text-right">
                <p className="font-bold text-gray-900">{receipt.cash.recipientName}</p>
                <p className="font-mono text-[10px] text-emerald-600 font-bold">{receipt.cash.recipientTag}</p>
              </div>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-gray-400 font-semibold">From</span>
              <div className="text-right">
                <p className="font-bold text-gray-900">{receipt.cash.senderName}</p>
                <p className="font-mono text-[10px] text-gray-500 font-bold">{receipt.cash.senderTag}</p>
              </div>
            </div>

            {receipt.cash.note && (
              <div className="flex justify-between items-start">
                <span className="text-gray-400 font-semibold">For</span>
                <p className="font-medium text-gray-800 text-right max-w-[200px]">{receipt.cash.note}</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-semibold">Date & Time</span>
              <p className="font-medium text-gray-900 text-right">
                {receipt.date} at {receipt.time}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-semibold">Source</span>
              <p className="font-medium text-gray-800 text-right">{receipt.cash.source}</p>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-semibold">Identifier</span>
              <p className="font-mono text-[10px] font-bold text-gray-900 text-right">{receipt.cash.identifier}</p>
            </div>
          </div>

          {/* Secure Web Receipt Seal */}
          <div className="text-center space-y-3 pt-2 mt-auto">
            <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-emerald-600 uppercase font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certified Cash App Transfer</span>
            </div>
            
            {/* Fake Barcode */}
            <div className="flex gap-[1px] items-end justify-center h-5 select-none opacity-85">
              {[1, 2, 3, 1, 4, 1, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3].map((w, i) => (
                <div key={i} className="h-full bg-gray-900" style={{ width: `${w * 1.2}px` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🔵 BRAND 2: COINBASE RENDER */}
      {isCoinbase && (
        <div className="bg-[#12161A] text-gray-200 p-6 space-y-6 flex flex-col min-h-[500px] border border-gray-800">
          
          {/* Header Banner */}
          <div className="flex justify-between items-center bg-[#0052FF]/10 p-3.5 rounded-xl border border-[#0052FF]/20">
            <div className="flex items-center gap-2">
              {/* Blue Coinbase Icon Logo */}
              <div className="w-8 h-8 rounded-full bg-[#0052FF] flex items-center justify-center text-white font-extrabold text-sm tracking-tight">
                C
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Coinbase Transaction</h4>
                <p className="text-[8px] text-gray-400 uppercase tracking-wider">Blockchain Ledger Node</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded border
              ${receipt.status === 'completed' ? 'bg-[#00C853]/10 border-[#00C853]/25 text-[#00C853]' : ''}
              ${receipt.status === 'pending' ? 'bg-amber-500/10 border-amber-500/25 text-amber-500' : ''}
              ${receipt.status === 'failed' ? 'bg-red-500/10 border-red-500/25 text-red-500' : ''}
            `}>
              {receipt.status}
            </span>
          </div>

          {/* Coin Value Banner */}
          <div className="text-center py-2 space-y-1">
            <p className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">Digital Ledger Settlement</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {receipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-emerald-400">{receipt.coinbase.asset}</span>
            </h1>
            <p className="text-xs text-gray-400">
              ≈ ${receipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </p>
          </div>

          {/* Details Table */}
          <div className="space-y-3.5 border-t border-b border-gray-800/80 py-5 text-[11px] flex-1">
            
            <div className="flex justify-between items-start">
              <span className="text-gray-500 font-mono">Recipient Address</span>
              <p className="font-mono text-gray-300 text-right break-all max-w-[190px] leading-relaxed">
                {receipt.coinbase.address}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-mono">Network Layer</span>
              <p className="font-semibold text-white text-right">{receipt.coinbase.network}</p>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-mono">Processing Fee</span>
              <p className="font-mono font-medium text-gray-300 text-right">
                {receipt.coinbase.fee.toFixed(2)} {receipt.coinbase.asset}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-mono">Confirmations</span>
              <p className="font-mono text-emerald-400 text-right">
                {receipt.coinbase.confirmations}+ Verified
              </p>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-gray-500 font-mono">TxHash ID</span>
              <p className="font-mono text-gray-400 text-right break-all max-w-[190px] text-[9px] leading-normal">
                {receipt.coinbase.hash}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-mono">Settlement Time</span>
              <p className="font-medium text-gray-300 text-right">
                {receipt.date} {receipt.time} UTC
              </p>
            </div>
          </div>

          {/* Coinbase Secure Seal & Vector QR */}
          <div className="flex justify-between items-end pt-2 mt-auto">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[8px] font-bold text-[#0052FF] font-mono uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>COINBASE BLOCKCHAIN VERIFIED</span>
              </div>
              <p className="text-[7px] text-gray-600 max-w-[190px] leading-normal">
                Certified decentralized cryptographic clearing report. Cryptosystem record cannot be altered.
              </p>
            </div>

            {/* Custom SVG QR Code */}
            <div className="w-12 h-12 p-1 bg-white rounded border border-gray-800 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-gray-900">
                <path d="M0,0h25v25h-25z M8,8h9v9h-9z" />
                <path d="M75,0h25v25h-25z M83,8h9v9h-9z" />
                <path d="M0,75h25v25h-25z M8,83h9v9h-9z" />
                <path d="M35,10h15v15h-15z M55,20h15v15h-15z M35,45h20v10h-20z M60,45h15v15h-15z M45,65h10v15h-10z" />
                <path d="M75,75h10v10h-10z M90,75h10v10h-10z M80,90h15v10h-15z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* 🟣 BRAND 3: ZELLE RENDER */}
      {isZelle && (
        <div className="bg-[#ffffff] text-gray-900 p-6 space-y-6 flex flex-col min-h-[500px] border border-gray-100">
          
          {/* Header Banner Block with Purple Styling */}
          <div className="bg-[#7414CA] text-white p-5 rounded-2xl text-center space-y-2.5 relative overflow-hidden">
            
            {/* Zelle Logo Text representation */}
            <div className="flex items-center justify-center gap-1">
              <span className="font-extrabold text-lg tracking-tight lowercase">zelle</span>
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 text-white font-bold mb-1">
                ✓
              </div>
              <h2 className="text-sm font-extrabold tracking-tight">Payment Sent!</h2>
            </div>
          </div>

          {/* Zelle Amount Display */}
          <div className="text-center py-1">
            <h1 className="text-4.5xl font-extrabold tracking-tight text-gray-900">
              ${receipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h1>
            <p className="text-[10px] text-gray-400 font-mono">Transfer complete via Zelle network</p>
          </div>

          {/* Details Table */}
          <div className="space-y-4 border-t border-b border-gray-100 py-5 text-xs flex-1">
            
            <div className="flex justify-between items-start">
              <span className="text-gray-400 font-semibold">Recipient Name</span>
              <p className="font-bold text-gray-900 text-right">{receipt.zelle.recipientName}</p>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-gray-400 font-semibold">Contact Details</span>
              <p className="font-mono text-gray-600 text-right">{receipt.zelle.recipientContact}</p>
            </div>

            {receipt.zelle.memo && (
              <div className="flex justify-between items-start">
                <span className="text-gray-400 font-semibold">Memo</span>
                <p className="font-medium text-gray-800 text-right max-w-[200px]">{receipt.zelle.memo}</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-semibold">Processed Date</span>
              <p className="font-medium text-gray-900 text-right">{receipt.date} at {receipt.time}</p>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-semibold">Source Account</span>
              <div className="text-right">
                <p className="font-bold text-gray-800">{receipt.zelle.bankName}</p>
                <p className="text-[10px] text-gray-400 font-mono">{receipt.zelle.accountType}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-semibold">Confirmation Number</span>
              <p className="font-mono text-[11px] font-bold text-[#7414CA] text-right">
                {receipt.zelle.confirmationNo}
              </p>
            </div>
          </div>

          {/* Zelle Brand Small Print Footer */}
          <div className="text-center space-y-1 pt-2 mt-auto text-[8px] text-gray-400 leading-normal border-t border-gray-50">
            <p>Zelle is a registered trademark of Early Warning Services, LLC.</p>
            <p className="font-bold text-emerald-600">Secure Direct Bank Clearance Verified</p>
          </div>
        </div>
      )}

    </div>
  );
}
