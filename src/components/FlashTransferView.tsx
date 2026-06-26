import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useToast } from './Toast';
import { Zap, ShieldCheck, Lock, ArrowRight, ShieldAlert, CheckCircle, RefreshCw, FileText } from 'lucide-react';
import { Profile, Transaction } from '../types';

interface FlashTransferViewProps {
  profile: Profile | null;
  onBalanceUpdate: (newBalance: number) => void;
  onAddTransaction: (tx: Transaction) => void;
  onNavigate: (tab: any) => void;
}

export function FlashTransferView({
  profile,
  onBalanceUpdate,
  onAddTransaction,
  onNavigate
}: FlashTransferViewProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('25000');
  const [network, setNetwork] = useState('USDT (TRC20)');
  const [fastChannel, setFastChannel] = useState(true);
  const [sendingPhase, setSendingPhase] = useState<'idle' | 'preparing' | 'signing' | 'verifying' | 'broadcasting' | 'done'>('idle');
  const { showToast } = useToast();

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (!recipient) {
      showToast('Recipient address is required.', 'warning');
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid transfer amount.', 'warning');
      return;
    }

    const currentBalance = profile?.wallet_balance ?? 0;
    if (amountNum > currentBalance) {
      showToast('Insufficient wallet balance to perform flash transfer.', 'error');
      return;
    }

    // Step 1: Preparing transaction
    setSendingPhase('preparing');

    // Step 2: Signing transaction
    setTimeout(() => {
      setSendingPhase('signing');
    }, 1200);

    // Step 3: Verifying blockchain
    setTimeout(() => {
      setSendingPhase('verifying');
    }, 2400);

    // Step 4: Broadcasting
    setTimeout(() => {
      setSendingPhase('broadcasting');
    }, 3600);

    // Step 5: Completed
    setTimeout(async () => {
      try {
        const newBalance = currentBalance - amountNum;
        const mockTxId = `SPP-TX-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

        const newTx: Transaction = {
          id: mockTxId,
          user_id: profile?.id || 'session-user',
          wallet: recipient,
          network: network,
          amount: -amountNum,
          status: 'completed',
          tx_hash: txHash,
          created_at: new Date().toISOString()
        };

        if (profile) {
          // Update profile balance
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ wallet_balance: newBalance })
            .eq('id', profile.id);

          if (profileError) throw profileError;

          // Insert transaction
          const { error: txError } = await supabase.from('transactions').insert([newTx]);
          if (txError) console.warn(txError);

          // Create notification
          try {
            await supabase.from('notifications').insert([
              {
                user_id: profile.id,
                title: 'Flash Transfer Complete',
                message: `Successfully completed $${amountNum.toLocaleString()} flash transfer to address ${recipient.substring(0, 8)}...`,
                created_at: new Date().toISOString()
              }
            ]);
          } catch (e) {
            console.warn('Silent insert notification error:', e);
          }
        }

        onBalanceUpdate(newBalance);
        onAddTransaction(newTx);
        showToast(`Flash transfer of $${amountNum.toLocaleString()} dispatched!`, 'success');
        setSendingPhase('done');
      } catch (error: any) {
        // Fallback local operation
        const newBalance = currentBalance - amountNum;
        const mockTxId = `SPP-TX-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const mockTx: Transaction = {
          id: mockTxId,
          user_id: profile?.id || 'session-user',
          wallet: recipient,
          network: network,
          amount: -amountNum,
          status: 'completed',
          tx_hash: txHash,
          created_at: new Date().toISOString()
        };

        onBalanceUpdate(newBalance);
        onAddTransaction(mockTx);
        showToast(`Flash transfer simulated locally: $${amountNum.toLocaleString()}`, 'success');
        setSendingPhase('done');
      }
    }, 4800);
  };

  const resetForm = () => {
    setRecipient('');
    setAmount('25000');
    setSendingPhase('idle');
  };

  const licenseActive = profile?.license_active ?? false;

  // Compute progress bar width percentages
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
      {/* Header */}
      <div className="border-b border-[#16362F]/60 pb-5">
        <h2 className="text-2xl font-display font-bold text-white tracking-tight">Flash Asset Transfer</h2>
        <p className="text-xs text-[#9CB1AC]">Perform accelerated, high-volume transactional simulator bridging cross-chain nodes instantly.</p>
      </div>

      {!licenseActive ? (
        /* LOCK STATE: Activation Required */
        <div className="bg-[#091714] p-8 rounded-2xl border border-[#16362F] shadow-2xl space-y-6 flex flex-col items-center text-center max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-500">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-display font-bold text-white">License Key Activation Required</h3>
            <p className="text-xs text-[#9CB1AC] leading-relaxed">
              Flash Transfer is an enterprise-tier ledger bridging feature. Safe multi-network dispatch capabilities are locked pending active key validation.
            </p>
          </div>

          <button
            onClick={() => onNavigate('activation')}
            className="px-5 py-3 bg-[#00C853] hover:bg-emerald-500 text-[#050E0C] rounded-xl font-bold text-xs font-display tracking-wide transition-all shadow-lg cursor-pointer flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4 fill-current" /> Unlock Premium Portal
          </button>
        </div>
      ) : (
        /* PREMIUM ACTIVE STATE: Flash Transfer Form & Progress Screen */
        <div className="max-w-2xl mx-auto">
          {sendingPhase === 'idle' ? (
            /* Input Form */
            <form onSubmit={handleTransfer} className="bg-[#091714] p-6 rounded-2xl border border-[#16362F] shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-[#16362F] pb-3">
                <Zap className="w-5 h-5 text-[#00C853]" />
                <h3 className="text-sm font-semibold text-white">Pro Flash Transfer Core</h3>
              </div>

              <p className="text-xs text-[#9CB1AC] leading-relaxed">
                Simulate instant high-frequency token transfers. Funds are written directly into Supabase audit trails and can be reviewed in the Transaction history logs.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#9CB1AC] uppercase tracking-wider">Network Protocols</label>
                    <select
                      value={network}
                      onChange={(e) => setNetwork(e.target.value)}
                      className="w-full bg-[#050E0C] border border-[#16362F] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00C853] text-sm"
                    >
                      <option value="USDT (TRC20)">Tether USDT (TRC-20)</option>
                      <option value="USDT (ERC20)">Tether USDT (ERC-20)</option>
                      <option value="USDT (BEP20)">Tether USDT (BEP-20)</option>
                      <option value="BTC (Bitcoin)">Bitcoin Chain (BTC)</option>
                      <option value="ETH (Ethereum)">Ethereum Mainnet (ETH)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#9CB1AC] uppercase tracking-wider font-mono">Amount ($ USD Value)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#050E0C] border border-[#16362F] rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#00C853] text-sm font-mono font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#9CB1AC] uppercase tracking-wider">Recipient Wallet Address</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Enter compatible receiver public address..."
                    className="w-full bg-[#050E0C] border border-[#16362F] rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#00C853] text-sm font-mono"
                    required
                  />
                </div>

                <div className="p-3.5 bg-[#050E0C] border border-[#16362F] rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Accelerated Enterprise Channel</span>
                    <span className="text-[10px] text-gray-500 block">Drives instant ledger sync utilizing premium gas configurations.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={fastChannel}
                    onChange={(e) => setFastChannel(e.target.checked)}
                    className="w-5 h-5 rounded bg-brand-bg border-[#16362F] text-[#00C853] focus:ring-[#00C853] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="text-gray-500 font-mono">Vault Balance: ${(profile?.wallet_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <button
                  type="submit"
                  className="bg-[#00C853] hover:bg-emerald-500 text-[#050E0C] font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-display cursor-pointer shadow-lg"
                >
                  <span>Execute Flash Transfer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Sending Progress Screen */
            <div className="bg-[#091714] p-8 rounded-2xl border border-[#16362F] shadow-xl space-y-6 flex flex-col items-center text-center">
              {sendingPhase !== 'done' ? (
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <RefreshCw className="w-12 h-12 text-[#00C853] animate-spin absolute" />
                  <span className="text-[10px] font-mono font-bold text-[#00C853]">⚡</span>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#00C853]/10 border-2 border-[#00C853]/40 flex items-center justify-center text-[#00C853] mb-2 shadow-inner">
                  <CheckCircle className="w-10 h-10" />
                </div>
              )}

              <div className="space-y-2 w-full">
                <h3 className="text-lg font-display font-bold text-white">
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
                  {sendingPhase === 'done' && `Funds of $${parseFloat(amount).toLocaleString()} have been successfully credited to address ${recipient.substring(0, 10)}...`}
                </p>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-[#050E0C] h-2 rounded-full overflow-hidden border border-[#16362F]/40 relative mt-2">
                <div 
                  className="bg-gradient-to-r from-[#00C853] to-emerald-400 h-full transition-all duration-500 ease-out"
                  style={{ width: `${getProgressPercent()}%` }}
                />
              </div>

              {/* Graphical Steps */}
              <div className="w-full grid grid-cols-5 gap-1.5 text-[9px] font-mono mt-4">
                <div className={`p-2 rounded border truncate ${sendingPhase !== 'idle' ? 'bg-[#00C853]/10 border-[#00C853]/30 text-[#00C853]' : 'bg-[#050E0C] border-[#16362F] text-gray-600'}`}>
                  1. PREPARE
                </div>
                <div className={`p-2 rounded border truncate ${sendingPhase === 'signing' || sendingPhase === 'verifying' || sendingPhase === 'broadcasting' || sendingPhase === 'done' ? 'bg-[#00C853]/10 border-[#00C853]/30 text-[#00C853]' : 'bg-[#050E0C] border-[#16362F] text-gray-600'}`}>
                  2. SIGN
                </div>
                <div className={`p-2 rounded border truncate ${sendingPhase === 'verifying' || sendingPhase === 'broadcasting' || sendingPhase === 'done' ? 'bg-[#00C853]/10 border-[#00C853]/30 text-[#00C853]' : 'bg-[#050E0C] border-[#16362F] text-gray-600'}`}>
                  3. VERIFY
                </div>
                <div className={`p-2 rounded border truncate ${sendingPhase === 'broadcasting' || sendingPhase === 'done' ? 'bg-[#00C853]/10 border-[#00C853]/30 text-[#00C853]' : 'bg-[#050E0C] border-[#16362F] text-gray-600'}`}>
                  4. BROADCAST
                </div>
                <div className={`p-2 rounded border truncate ${sendingPhase === 'done' ? 'bg-[#00C853]/10 border-[#00C853]/30 text-[#00C853]' : 'bg-[#050E0C] border-[#16362F] text-gray-600'}`}>
                  5. COMPLETE
                </div>
              </div>

              {sendingPhase === 'done' && (
                <div className="flex gap-2 w-full justify-center pt-2">
                  <button
                    onClick={() => onNavigate('receipt-generator')}
                    className="flex-1 max-w-[180px] px-4 py-2.5 bg-[#050E0C] border border-[#16362F] hover:border-[#00C853]/30 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#00C853]" /> Print Receipt
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 max-w-[180px] px-4 py-2.5 bg-[#00C853] hover:bg-emerald-500 text-[#050E0C] font-semibold rounded-xl text-xs transition-all cursor-pointer"
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
