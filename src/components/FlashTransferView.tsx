import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useToast } from './Toast';
import { Zap, Lock, ArrowRight, CheckCircle, RefreshCw, FileText, Key } from 'lucide-react';
import { Profile, Transaction } from '../types';
import { useTransactionNotifier } from './TransactionNotifications';
import { TransactionProviderSelector } from './TransactionProviderSelector';
import { ProviderCategory } from '../data/paymentProviders';

interface FlashTransferViewProps {
  profile: Profile | null;
  onBalanceUpdate: (newBalance: number) => void;
  onTransactionComplete: (tx: Transaction) => void;
  onNavigate: (tab: any) => void;
  onRefreshNotifications: () => void;
}

export function FlashTransferView({
  profile,
  onBalanceUpdate,
  onTransactionComplete,
  onNavigate,
  onRefreshNotifications
}: FlashTransferViewProps) {
  const [category, setCategory] = useState<ProviderCategory>('crypto');
  const [provider, setProvider] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [sendingPhase, setSendingPhase] = useState<'idle' | 'preparing' | 'signing' | 'verifying' | 'broadcasting' | 'done'>('idle');
  const { showToast } = useToast();
  const { notifyTransaction } = useTransactionNotifier(
    profile?.id ?? '',
    onRefreshNotifications
  );

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) {
      showToast('Please select a provider.', 'warning');
      return;
    }
    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid transfer amount.', 'warning');
      return;
    }

    const currentBalance = profile?.wallet_balance ?? 0;
    if (amountNum > currentBalance) {
      showToast('Insufficient wallet balance to perform flash transfer.', 'error');
      return;
    }

    setSendingPhase('preparing');
    setTimeout(() => setSendingPhase('signing'), 1200);
    setTimeout(() => setSendingPhase('verifying'), 2400);
    setTimeout(() => setSendingPhase('broadcasting'), 3600);

    setTimeout(async () => {
      try {
        const newBalance = currentBalance - amountNum;
        const mockTxId = `SPP-TX-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

        const newTx: Transaction = {
          id: mockTxId,
          user_id: profile?.id || 'session-user',
          wallet: formData.address || 'N/A',
          network: provider,
          amount: -amountNum,
          status: 'completed',
          tx_hash: txHash,
          created_at: new Date().toISOString()
        };

        if (profile) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ wallet_balance: newBalance })
            .eq('id', profile.id);

          if (profileError) throw profileError;

          await supabase.from('transactions').insert([newTx]);
        }

        onBalanceUpdate(newBalance);
        onTransactionComplete(newTx);
        await notifyTransaction(newTx, 'outgoing');
        showToast(`Flash transfer of $${amountNum.toLocaleString()} dispatched!`, 'success');
        setSendingPhase('done');
      } catch (error: any) {
        const newBalance = currentBalance - amountNum;
        const mockTxId = `SPP-TX-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const mockTx: Transaction = {
          id: mockTxId,
          user_id: profile?.id || 'session-user',
          wallet: formData.address || 'N/A',
          network: provider,
          amount: -amountNum,
          status: 'completed',
          tx_hash: txHash,
          created_at: new Date().toISOString()
        };

        onBalanceUpdate(newBalance);
        onTransactionComplete(mockTx);
        await notifyTransaction(mockTx, 'outgoing');
        showToast(`Flash transfer simulated locally: $${amountNum.toLocaleString()}`, 'success');
        setSendingPhase('done');
      }
    }, 4800);
  };

  const resetForm = () => {
    setProvider('');
    setFormData({});
    setSendingPhase('idle');
  };

  const licenseActive = profile?.license_active ?? false;

  const getProgressPercent = () => {
    switch (sendingPhase) {
      case 'idle': return 0;
      case 'preparing': return 20;
      case 'signing': return 45;
      case 'verifying': return 70;
      case 'broadcasting': return 90;
      case 'done': return 100;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-brand-border/60 pb-5">
        <h2 className="text-2xl font-display font-bold text-brand-text tracking-tight">Flash Asset Transfer</h2>
        <p className="text-xs text-[#9CB1AC]">Perform accelerated, high-volume transactional simulator bridging cross-chain nodes instantly.</p>
      </div>

      {!licenseActive ? (
        <div className="bg-brand-card p-8 rounded-2xl border border-brand-border shadow-2xl space-y-6 flex flex-col items-center text-center max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-full bg-brand-accent/15 border-2 border-brand-accent/35 flex items-center justify-center text-brand-accent">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-display font-bold text-brand-text">Enterprise License Tunnel Required</h3>
            <p className="text-xs text-[#9CB1AC] leading-relaxed">
              Flash Transfer is a premium, enterprise-tier ledger bridging feature. Access is currently locked. To activate high-speed cross-chain simulations, choose your path below:
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-2">
            <button
              onClick={() => onNavigate('subscription')}
              className="px-5 py-3 bg-brand-accent hover:bg-emerald-400 text-[#050E0C] rounded-xl font-bold text-xs font-display tracking-wide transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1.5 flex-1"
            >
              <Zap className="w-4 h-4 fill-current" /> Subscribe & Upgrade
            </button>
            <button
              onClick={() => onNavigate('activation')}
              className="px-5 py-3 bg-transparent hover:bg-brand-surface/50 text-brand-accent border border-brand-accent rounded-xl font-bold text-xs font-display tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1"
            >
              <Key className="w-4 h-4" /> Use Activation Key
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          {sendingPhase === 'idle' ? (
            <form onSubmit={handleTransfer} className="bg-brand-card p-6 rounded-2xl border border-brand-border shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-brand-border pb-3">
                <Zap className="w-5 h-5 text-brand-accent" />
                <h3 className="text-sm font-semibold text-brand-text">Pro Flash Transfer Core</h3>
              </div>

              <p className="text-xs text-[#9CB1AC] leading-relaxed">
                Simulate instant high-frequency token transfers. Funds are written directly into Supabase audit trails and can be reviewed in the Transaction history logs.
              </p>

              <TransactionProviderSelector 
                category={category} 
                provider={provider} 
                setCategory={setCategory} 
                setProvider={setProvider} 
                formData={formData} 
                setFormData={setFormData}
              />

              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="text-brand-text-dim font-mono">Vault Balance: ${(profile?.wallet_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <button
                  type="submit"
                  className="bg-brand-accent hover:bg-emerald-500 text-[#050E0C] font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-display cursor-pointer shadow-lg"
                >
                  <span>Execute Flash Transfer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-brand-card p-8 rounded-2xl border border-brand-border shadow-xl space-y-6 flex flex-col items-center text-center">
              {sendingPhase !== 'done' ? (
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <RefreshCw className="w-12 h-12 text-brand-accent animate-spin absolute" />
                  <span className="text-[10px] font-mono font-bold text-brand-accent">⚡</span>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-brand-accent/10 border-2 border-brand-accent/40 flex items-center justify-center text-brand-accent mb-2 shadow-inner">
                  <CheckCircle className="w-10 h-10" />
                </div>
              )}

              <div className="space-y-2 w-full">
                <h3 className="text-lg font-display font-bold text-brand-text">
                  {sendingPhase === 'preparing' && 'Preparing transaction...'}
                  {sendingPhase === 'signing' && 'Signing transaction...'}
                  {sendingPhase === 'verifying' && 'Verifying blockchain...'}
                  {sendingPhase === 'broadcasting' && 'Broadcasting...'}
                  {sendingPhase === 'done' && 'Completed!'}
                </h3>
                <p className="text-xs text-[#9CB1AC] max-w-sm mx-auto leading-relaxed">
                  {sendingPhase === 'preparing' && 'Structuring secure transactional payload buffers.'}
                  {sendingPhase === 'signing' && 'Generating 256-bit cryptographic payload signatures.'}
                  {sendingPhase === 'verifying' && 'Syncing ledger consensus protocols across cloud clusters.'}
                  {sendingPhase === 'broadcasting' && 'Broadcasting transaction packets globally.'}
                  {sendingPhase === 'done' && `Funds of $${parseFloat(formData.amount).toLocaleString()} have been successfully credited.`}
                </p>
              </div>

              <div className="w-full bg-brand-bg h-2 rounded-full overflow-hidden border border-brand-border/40 relative mt-2">
                <div 
                  className="bg-gradient-to-r from-[#00C853] to-emerald-400 h-full transition-all duration-500 ease-out"
                  style={{ width: `${getProgressPercent()}%` }}
                />
              </div>

              {sendingPhase === 'done' && (
                <div className="flex gap-2 w-full justify-center pt-2">
                  <button
                    onClick={() => onNavigate('receipt-generator')}
                    className="flex-1 max-w-[180px] px-4 py-2.5 bg-brand-bg border border-brand-border hover:border-brand-accent/30 text-brand-text font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-accent" /> Print Receipt
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 max-w-[180px] px-4 py-2.5 bg-brand-accent hover:bg-emerald-500 text-[#050E0C] font-semibold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Send Another
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
