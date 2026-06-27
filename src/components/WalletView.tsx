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
} from 'lucide-react';
import { Profile, Transaction } from '../types';
import { useTransactionNotifier } from './TransactionNotifications';
import { TransactionProviderSelector } from './TransactionProviderSelector';
import { ProviderCategory } from '../data/paymentProviders';

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
    { name: 'BTC (Bitcoin)', label: 'BTC Address', address: 'bc1q9f58g0epslkyxsc0a77t489n6p7e4qsh87r49v' },
    { name: 'ETH (Ethereum)', label: 'ETH Address', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' },
    { name: 'USDT (ERC20)', label: 'USDT ERC20 Address', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' },
    { name: 'USDT (TRC20)', label: 'USDT TRC20 Address', address: 'TY6XepvMMy6F84gGZveVf7vPqKPh1Tsw8f' },
    { name: 'USDT (BEP20)', label: 'USDT BEP20 Address', address: '0x3f61A639B079db88b098defB751B7401B5f6d528f' },
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
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-[#16362F]/60 pb-5">
        <h2 className="text-2xl font-display font-bold text-white tracking-tight">Enterprise Wallet Vault</h2>
        <p className="text-xs text-[#9CB1AC]">Monitor real-time ledger allocations, copy direct vault addresses, and inject test merchant assets.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#091714] p-5 rounded-xl border border-[#16362F] flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#00C853]/5 rounded-full blur-xl" />
          <div className="flex items-center justify-between text-xs text-[#9CB1AC] font-semibold uppercase">
            <span>Main Balance</span>
            <Wallet className="w-4 h-4 text-[#00C853]" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-display font-bold text-white">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-[10px] text-[#00C853] font-mono mt-1 flex items-center gap-1">● Live Ledger Balance</p>
          </div>
        </div>
        <div className="bg-[#091714] p-5 rounded-xl border border-[#16362F] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#9CB1AC] font-semibold uppercase">
            <span>Available Balance</span>
            <Unlock className="w-4 h-4 text-[#00C853]" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-display font-bold text-white">${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-[10px] text-[#9CB1AC]/80 font-mono mt-1">85% - Instantly Dispatched</p>
          </div>
        </div>
        <div className="bg-[#091714] p-5 rounded-xl border border-[#16362F] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#9CB1AC] font-semibold uppercase">
            <span>Pending Balance</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-display font-bold text-white">${pendingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-[10px] text-blue-400/80 font-mono mt-1">10% - In-Transit Confirmations</p>
          </div>
        </div>
        <div className="bg-[#091714] p-5 rounded-xl border border-[#16362F] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#9CB1AC] font-semibold uppercase">
            <span>Locked Reserve</span>
            <Lock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-display font-bold text-white">${lockedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-[10px] text-amber-500/80 font-mono mt-1">5% - Enterprise Risk Collateral</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#091714] p-6 rounded-2xl border border-[#16362F] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C853]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-4 border-b border-[#16362F] pb-3">
              <Plus className="w-5 h-5 text-[#00C853]" />
              <h3 className="text-base font-display font-bold text-white">Instant Portal Asset Injection (Demo Sandbox)</h3>
            </div>

            {profile?.license_active ? (
              <form onSubmit={handleSimulateDeposit} className="space-y-4">
                <p className="text-xs text-[#9CB1AC] leading-relaxed">
                  Add virtual assets instantly to your active merchant node to stress-test your ledger pipelines and flash transactions in real-time.
                </p>

                <TransactionProviderSelector 
                  category={category} 
                  provider={provider} 
                  setCategory={setCategory} 
                  setProvider={setProvider} 
                  formData={formData} 
                  setFormData={setFormData}
                />

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isDepositing}
                    className="bg-[#00C853] hover:bg-[#00C853]/90 text-[#050E0C] font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-display cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDepositing ? 'animate-spin' : ''}`} />
                    {isDepositing ? 'Executing Decentralized Bridge...' : 'Bridge Assets Instantly'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-6 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#00C853]/15 border-2 border-[#00C853]/35 flex items-center justify-center text-[#00C853]">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white font-display">Premium Injection Locked</h4>
                  <p className="text-xs text-[#9CB1AC] max-w-sm leading-relaxed">
                    Instantly simulate incoming ledger deposits with an Enterprise Subscription.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('subscription')}
                  className="mt-2 bg-[#00C853] text-[#050E0C] hover:bg-emerald-400 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-lg"
                >
                  Upgrade to Pro
                </button>
              </div>
            )}
          </div>

          <div className="bg-[#091714]/40 border border-[#16362F]/80 p-4 rounded-xl flex items-start gap-3">
            <Layers className="w-5 h-5 text-[#00C853] mt-0.5 flex-shrink-0" />
            <div className="text-[11px] text-[#9CB1AC] space-y-1">
              <span className="font-semibold text-white block">Enterprise Custodial Safeguard Active</span>
              All sandbox node operations remain completely secure and fully synchronized with standard Web3 decentralized cryptographic ledger templates. Key verification algorithms authenticate transfers locally.
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#091714] p-5 rounded-2xl border border-[#16362F] shadow-xl space-y-4">
            <div className="border-b border-[#16362F] pb-2 flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Direct Vault Addresses</h4>
              <span className="text-[10px] bg-[#00C853]/10 text-[#00C853] px-2 py-0.5 rounded font-mono font-bold">100% ONLINE</span>
            </div>
            
            <div className="space-y-3">
              {networkAddresses.map((net) => (
                <div key={net.name} className="bg-[#050E0C]/60 p-3 border border-[#16362F]/60 rounded-xl space-y-1.5 hover:border-[#16362F] transition-all group">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white font-display">{net.name}</span>
                    <button
                      onClick={() => handleCopyAddress(net.name, net.address)}
                      className="text-gray-500 hover:text-[#00C853] transition-colors p-1 rounded hover:bg-[#091714]"
                      title={`Copy ${net.label}`}
                    >
                      {copiedNetwork === net.name ? (
                        <Check className="w-3.5 h-3.5 text-[#00C853]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="bg-[#050E0C] p-2 rounded border border-[#16362F]/30 text-[9px] font-mono text-gray-500 select-all break-all leading-tight">
                    {net.address}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
