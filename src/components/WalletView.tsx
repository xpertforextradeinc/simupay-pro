import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useToast } from './Toast';
import {
  Wallet,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Layers,
  ShieldCheck,
  Unlock,
  Clock,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  QrCode
} from 'lucide-react';
import { Profile, Transaction } from '../types';
import { useTransactionNotifier } from './TransactionNotifications';
import { TransactionProviderSelector } from './TransactionProviderSelector';
import { ProviderCategory } from '../data/paymentProviders';
import { WalletInsights } from './WalletInsights';

interface WalletViewProps {
  profile: Profile | null;
  transactions: Transaction[];
  onBalanceUpdate: (newBalance: number) => void;
  onTransactionComplete: (tx: Transaction) => void;
  onNavigate: (tab: any) => void;
  onRefreshNotifications: () => void;
}

export function WalletView({
  profile,
  transactions,
  onBalanceUpdate,
  onTransactionComplete,
  onNavigate,
  onRefreshNotifications
}: WalletViewProps) {
  const [copiedNetwork, setCopiedNetwork] = useState<string | null>(null);
  const [category, setCategory] = useState<ProviderCategory>('crypto');
  const [provider, setProvider] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isDepositing, setIsDepositing] = useState(false);
  const [activeTab, setActiveTab] = useState<'deposit' | 'addresses' | 'insights'>('insights');
  const { showToast } = useToast();
  const { notifyTransaction } = useTransactionNotifier(
    profile?.id ?? '',
    onRefreshNotifications
  );

  const totalBalance = profile?.wallet_balance ?? 0;
  const availableBalance = totalBalance * 0.85;
  const pendingBalance = totalBalance * 0.10;
  const lockedBalance = totalBalance * 0.05;

  const networkAddresses = [
    { name: 'BTC (Bitcoin)', label: 'BTC Address', address: 'bc1q9f58g0epslkyxsc0a77t489n6p7e4qsh87r49v', network: 'BTC' },
    { name: 'ETH (Ethereum)', label: 'ETH Address', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', network: 'ERC20' },
    { name: 'USDT (TRC20)', label: 'USDT TRC20 Address', address: 'TY6XepvMMy6F84gGZveVf7vPqKPh1Tsw8f', network: 'TRC20' },
    { name: 'USDT (BEP20)', label: 'USDT BEP20 Address', address: '0x3f61A639B079db88b098defB751B7401B5f6d528f', network: 'BEP20' },
  ];

  const handleCopyAddress = (name: string, address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedNetwork(name);
    showToast(`${name} address copied!`, 'success');
    setTimeout(() => setCopiedNetwork(null), 2000);
  };

  const handleSimulateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) {
      showToast('Please select a provider.', 'warning');
      return;
    }
    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid deposit amount.', 'warning');
      return;
    }

    setIsDepositing(true);
    try {
      const newBalance = totalBalance + amountNum;
      
      if (profile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ wallet_balance: newBalance })
          .eq('id', profile.id);

        if (profileError) throw profileError;

        const mockTxId = `SPP-TX-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

        const newTx: Transaction = {
          id: mockTxId,
          user_id: profile.id,
          wallet: formData.address || networkAddresses[3].address,
          network: provider,
          amount: amountNum,
          status: 'completed',
          tx_hash: txHash,
          created_at: new Date().toISOString()
        };

        await supabase.from('transactions').insert([newTx]);

        onBalanceUpdate(newBalance);
        onTransactionComplete(newTx);
        await notifyTransaction(newTx, 'incoming');
        showToast(`Successfully deposited $${amountNum.toLocaleString()}`, 'success');
      }
    } catch (error: any) {
      const newBalance = totalBalance + amountNum;
      const mockTxId = `SPP-TX-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      
      const mockTx: Transaction = {
        id: mockTxId,
        user_id: profile?.id || 'offline-user',
        wallet: formData.address || networkAddresses[3].address,
        network: provider,
        amount: amountNum,
        status: 'completed',
        tx_hash: txHash,
        created_at: new Date().toISOString()
      };

      onBalanceUpdate(newBalance);
      onTransactionComplete(mockTx);
      await notifyTransaction(mockTx, 'incoming');
      showToast(`Local simulation credited $${amountNum.toLocaleString()}`, 'success');
    } finally {
      setIsDepositing(false);
      setFormData({});
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header section with total balance */}
      <div className="bg-gradient-to-br from-[#091714] to-[#050E0C] p-8 rounded-3xl border border-[#16362F] shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#00C853]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="z-10 space-y-2">
          <div className="flex items-center gap-2 text-[#9CB1AC] font-medium text-sm">
            <Wallet className="w-4 h-4 text-[#00C853]" />
            <span>Total Estimated Balance</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[#00C853] font-mono text-sm tracking-widest font-bold">USD</span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="bg-[#16362F]/50 px-2 py-1 rounded text-[10px] font-mono text-white/80 border border-[#16362F]">Live Ledger</div>
            <div className="text-[11px] text-[#9CB1AC]">+0.00% Today</div>
          </div>
        </div>

        <div className="z-10 flex gap-3">
          <button 
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${activeTab === 'deposit' ? 'bg-[#00C853] text-[#050E0C] hover:bg-[#00E676]' : 'bg-[#16362F] text-white hover:bg-[#1f4a40]'}`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            Deposit
          </button>
          <button 
            onClick={() => onNavigate('flash-transfer')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#16362F] hover:bg-[#1f4a40] text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg"
          >
            <ArrowUpRight className="w-4 h-4" />
            Send
          </button>
          <button 
            className="flex items-center justify-center gap-2 bg-[#16362F] hover:bg-[#1f4a40] text-white px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-lg"
            title="Swap"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Balance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#091714]/80 p-5 rounded-2xl border border-[#16362F] flex flex-col justify-between group hover:border-[#00C853]/50 transition-colors">
          <div className="flex items-center gap-2 text-xs text-[#9CB1AC] font-semibold">
            <Unlock className="w-4 h-4 text-[#00C853]" />
            <span>Available (85%)</span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-display font-bold text-white">${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
        <div className="bg-[#091714]/80 p-5 rounded-2xl border border-[#16362F] flex flex-col justify-between group hover:border-blue-400/50 transition-colors">
          <div className="flex items-center gap-2 text-xs text-[#9CB1AC] font-semibold">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Pending (10%)</span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-display font-bold text-white">${pendingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
        <div className="bg-[#091714]/80 p-5 rounded-2xl border border-[#16362F] flex flex-col justify-between group hover:border-amber-500/50 transition-colors">
          <div className="flex items-center gap-2 text-xs text-[#9CB1AC] font-semibold">
            <Lock className="w-4 h-4 text-amber-500" />
            <span>Locked (5%)</span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-display font-bold text-white">${lockedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
      </div>

      {/* Main Operations Area */}
      <div className="bg-[#091714] border border-[#16362F] rounded-2xl shadow-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-[#16362F] overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('insights')}
            className={`flex-1 min-w-[150px] py-4 text-sm font-bold tracking-wide border-b-2 transition-colors ${activeTab === 'insights' ? 'border-[#00C853] text-[#00C853]' : 'border-transparent text-[#9CB1AC] hover:text-white hover:bg-[#16362F]/30'}`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 min-w-[150px] py-4 text-sm font-bold tracking-wide border-b-2 transition-colors ${activeTab === 'deposit' ? 'border-[#00C853] text-[#00C853]' : 'border-transparent text-[#9CB1AC] hover:text-white hover:bg-[#16362F]/30'}`}
          >
            Deposit Simulator
          </button>
          <button 
            onClick={() => setActiveTab('addresses')}
            className={`flex-1 min-w-[150px] py-4 text-sm font-bold tracking-wide border-b-2 transition-colors ${activeTab === 'addresses' ? 'border-[#00C853] text-[#00C853]' : 'border-transparent text-[#9CB1AC] hover:text-white hover:bg-[#16362F]/30'}`}
          >
            Vault Addresses
          </button>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'insights' && (
            <WalletInsights profile={profile} transactions={transactions} />
          )}

          {activeTab === 'deposit' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="text-center space-y-2 mb-8">
                <h3 className="text-lg font-display font-bold text-white">Simulate Incoming Assets</h3>
                <p className="text-sm text-[#9CB1AC]">
                  Use this sandbox to inject funds into your ledger. It helps test your merchant node pipelines and balance synchronization.
                </p>
              </div>

              {profile?.license_active ? (
                <form onSubmit={handleSimulateDeposit} className="space-y-6">
                  <div className="bg-[#050E0C] p-6 rounded-2xl border border-[#16362F]">
                    <TransactionProviderSelector 
                      category={category} 
                      provider={provider} 
                      setCategory={setCategory} 
                      setProvider={setProvider} 
                      formData={formData} 
                      setFormData={setFormData}
                    />
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={isDepositing || !provider || !formData.amount}
                      className="bg-[#00C853] hover:bg-[#00E676] text-[#050E0C] font-bold px-8 py-3.5 rounded-xl transition-all flex items-center gap-3 text-sm font-display cursor-pointer shadow-[0_0_20px_rgba(0,200,83,0.3)] disabled:opacity-50 disabled:shadow-none w-full md:w-auto"
                    >
                      {isDepositing ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Processing Injection...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Inject Sandbox Funds
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-10 flex flex-col items-center text-center space-y-5 bg-[#050E0C] rounded-2xl border border-[#16362F]">
                  <div className="w-16 h-16 rounded-full bg-[#00C853]/10 border border-[#00C853]/30 flex items-center justify-center text-[#00C853]">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h4 className="text-lg font-bold text-white font-display">Premium Feature Locked</h4>
                    <p className="text-sm text-[#9CB1AC] leading-relaxed">
                      Upgrade to a Pro Subscription to unlock the asset simulator and instantly credit test funds to your ledger.
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('subscription')}
                    className="mt-4 bg-[#00C853] text-[#050E0C] hover:bg-[#00E676] font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(0,200,83,0.2)]"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="text-center space-y-2 mb-8">
                <h3 className="text-lg font-display font-bold text-white">Direct Vault Deposits</h3>
                <p className="text-sm text-[#9CB1AC]">
                  Send assets directly to these secure cold-storage vault addresses. Ensure you use the correct network.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {networkAddresses.map((net) => (
                  <div key={net.name} className="bg-[#050E0C] p-5 border border-[#16362F] rounded-2xl space-y-4 hover:border-[#00C853]/40 transition-colors group relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                      <QrCode className="w-32 h-32" />
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <span className="text-xs font-mono font-bold text-[#00C853] bg-[#00C853]/10 px-2 py-1 rounded">{net.network}</span>
                        <h4 className="text-white font-bold mt-3 font-display">{net.name}</h4>
                      </div>
                      <button
                        onClick={() => handleCopyAddress(net.name, net.address)}
                        className="bg-[#16362F]/50 hover:bg-[#00C853] text-[#9CB1AC] hover:text-[#050E0C] transition-colors p-2.5 rounded-xl border border-[#16362F] hover:border-[#00C853]"
                        title={`Copy ${net.label}`}
                      >
                        {copiedNetwork === net.name ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="bg-[#091714] p-3 rounded-xl border border-[#16362F]/50 text-xs font-mono text-[#9CB1AC] select-all break-all relative z-10 leading-relaxed">
                      {net.address}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-[#00C853]/5 border border-[#00C853]/20 p-4 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#00C853] flex-shrink-0" />
                <p className="text-xs text-[#9CB1AC] leading-relaxed">
                  <strong className="text-white">Security Notice:</strong> Sending funds to the wrong network or address type may result in permanent loss. Always double-check the recipient address and selected network before confirming any external transfer.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

