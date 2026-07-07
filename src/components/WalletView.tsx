import React, { useState, useEffect } from 'react';
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
  QrCode,
  Coins
} from 'lucide-react';
import { Profile, Transaction } from '../types';
import { useTransactionNotifier } from './TransactionNotifications';
import { TransactionProviderSelector } from './TransactionProviderSelector';
import { ProviderCategory } from '../data/paymentProviders';
import { WalletInsights } from './WalletInsights';
import { MarketDataService, MarketPrices, SPPTokenInfo } from '../services/MarketDataService';

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
  const [activeTab, setActiveTab] = useState<'deposit' | 'addresses' | 'insights' | 'market'>('insights');
  const [marketPrices, setMarketPrices] = useState<MarketPrices | null>(null);
  const [sppInfo, setSppInfo] = useState<SPPTokenInfo | null>(null);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [contractInput, setContractInput] = useState('');
  const [isEditingContract, setIsEditingContract] = useState(false);
  const { showToast } = useToast();
  const { notifyTransaction } = useTransactionNotifier(
    profile?.id ?? '',
    onRefreshNotifications
  );

  // MetaMask integration states
  const [metaMaskAddress, setMetaMaskAddress] = useState<string | null>(null);
  const [metaMaskBalance, setMetaMaskBalance] = useState<string | null>(null);
  const [metaMaskNetwork, setMetaMaskNetwork] = useState<string | null>(null);
  const [isConnectingMetaMask, setIsConnectingMetaMask] = useState(false);

  // Auto-reconnect MetaMask on load if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem('spp_metamask_connected') === 'true';
    if (wasConnected && typeof window !== 'undefined' && (window as any).ethereum) {
      reconnectMetaMask();
    }
  }, []);

  const reconnectMetaMask = async () => {
    try {
      const eth = (window as any).ethereum;
      const accounts = await eth.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        await handleMetaMaskConnection(accounts[0]);
      } else {
        localStorage.removeItem('spp_metamask_connected');
      }
    } catch (err) {
      console.warn('Auto-reconnecting to MetaMask failed', err);
    }
  };

  const handleMetaMaskConnection = async (account: string) => {
    const eth = (window as any).ethereum;
    setMetaMaskAddress(account);
    localStorage.setItem('spp_metamask_connected', 'true');

    try {
      // Get balance in wei hex
      const balanceHex = await eth.request({
        method: 'eth_getBalance',
        params: [account, 'latest']
      });
      // Convert wei to ETH
      const wei = BigInt(balanceHex);
      const ethVal = Number(wei) / 1e18;
      setMetaMaskBalance(ethVal.toFixed(4));

      // Get chain ID
      const chainIdHex = await eth.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16);
      let networkName = 'Unknown Chain';
      if (chainId === 1) networkName = 'Ethereum Mainnet';
      else if (chainId === 11155111) networkName = 'Sepolia Testnet';
      else if (chainId === 137) networkName = 'Polygon Mainnet';
      else if (chainId === 56) networkName = 'BNB Smart Chain';
      else if (chainId === 42161) networkName = 'Arbitrum One';
      setMetaMaskNetwork(networkName);
    } catch (e) {
      console.error('Error fetching MetaMask details:', e);
    }
  };

  const connectMetaMask = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      showToast('MetaMask extension is not detected. Please install it on Chrome, Safari, or Firefox.', 'error');
      return;
    }
    setIsConnectingMetaMask(true);
    try {
      const eth = (window as any).ethereum;
      const accounts = await eth.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        await handleMetaMaskConnection(accounts[0]);
        showToast('Successfully connected to MetaMask!', 'success');
      }
    } catch (err: any) {
      console.error('MetaMask connection failed:', err);
      showToast(err.message || 'Failed to connect to MetaMask.', 'error');
    } finally {
      setIsConnectingMetaMask(false);
    }
  };

  const disconnectMetaMask = () => {
    setMetaMaskAddress(null);
    setMetaMaskBalance(null);
    setMetaMaskNetwork(null);
    localStorage.removeItem('spp_metamask_connected');
    showToast('MetaMask disconnected.', 'info');
  };

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    setLoadingMarket(true);
    try {
      const prices = await MarketDataService.getPrices();
      setMarketPrices(prices);
      const info = MarketDataService.getSPPTokenInfo();
      setSppInfo(info);
      setContractInput(info.contractAddress);
    } catch (e) {
      console.error('Failed to load market data:', e);
    } finally {
      setLoadingMarket(false);
    }
  };

  const handleUpdateContract = () => {
    if (!contractInput.trim() || !contractInput.startsWith('0x')) {
      showToast('Please enter a valid Ethereum ERC-20 contract address starting with 0x.', 'warning');
      return;
    }
    MarketDataService.updateSPPContractAddress(contractInput.trim());
    const info = MarketDataService.getSPPTokenInfo();
    setSppInfo(info);
    setIsEditingContract(false);
    showToast('SPP Token contract address updated successfully!', 'success');
  };

  const totalBalance = profile?.wallet_balance ?? 0;
  const availableBalance = totalBalance * 0.85;
  const pendingBalance = totalBalance * 0.10;
  const lockedBalance = totalBalance * 0.05;

  const userId = profile?.id || 'demo-user-id';
  const cleanHex = userId.replace(/[^a-f0-9]/gi, '').padEnd(40, 'f');
  const cleanBase58 = userId.replace(/[^a-zA-Z0-9]/gi, '').padEnd(34, 'X');
  
  const btcAddress = `bc1q${cleanHex.substring(0, 38)}`;
  const ethAddress = `0x${cleanHex.substring(0, 40)}`;
  const usdtTrcAddress = `T${cleanBase58.substring(0, 33)}`;
  const usdtBepAddress = `0x${cleanHex.split('').reverse().join('').substring(0, 40)}`;

  const networkAddresses = [
    { name: 'BTC (Bitcoin)', label: 'BTC Address', address: btcAddress, network: 'BTC' },
    { name: 'ETH (Ethereum)', label: 'ETH Address', address: ethAddress, network: 'ERC20' },
    { name: 'USDT (TRC20)', label: 'USDT TRC20 Address', address: usdtTrcAddress, network: 'TRC20' },
    { name: 'USDT (BEP20)', label: 'USDT BEP20 Address', address: usdtBepAddress, network: 'BEP20' },
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
      <div className="bg-gradient-to-br from-brand-card to-brand-bg p-8 rounded-3xl border border-brand-border shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="z-10 space-y-2">
          <div className="flex items-center gap-2 text-[#9CB1AC] font-medium text-sm">
            <Wallet className="w-4 h-4 text-brand-accent" />
            <span>Total Estimated Balance</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-display font-bold text-brand-text tracking-tight">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-brand-accent font-mono text-sm tracking-widest font-bold">USD</span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="bg-brand-surface/50 px-2 py-1 rounded text-[10px] font-mono text-brand-text/80 border border-brand-border">Live Ledger</div>
            <div className="text-[11px] text-[#9CB1AC]">+0.00% Today</div>
          </div>
        </div>

        <div className="z-10 flex gap-3">
          <button 
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${activeTab === 'deposit' ? 'bg-brand-accent text-[#050E0C] hover:bg-[#00E676]' : 'bg-brand-surface text-brand-text hover:bg-[#1f4a40]'}`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            Deposit
          </button>
          <button 
            onClick={() => onNavigate('flash-transfer')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-surface hover:bg-[#1f4a40] text-brand-text px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg"
          >
            <ArrowUpRight className="w-4 h-4" />
            Send
          </button>
          <button 
            className="flex items-center justify-center gap-2 bg-brand-surface hover:bg-[#1f4a40] text-brand-text px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-lg"
            title="Swap"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Balance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-brand-card/80 p-5 rounded-2xl border border-brand-border flex flex-col justify-between group hover:border-brand-accent/50 transition-colors">
          <div className="flex items-center gap-2 text-xs text-[#9CB1AC] font-semibold">
            <Unlock className="w-4 h-4 text-brand-accent" />
            <span>Available (85%)</span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-display font-bold text-brand-text">${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
        <div className="bg-brand-card/80 p-5 rounded-2xl border border-brand-border flex flex-col justify-between group hover:border-blue-400/50 transition-colors">
          <div className="flex items-center gap-2 text-xs text-[#9CB1AC] font-semibold">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Pending (10%)</span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-display font-bold text-brand-text">${pendingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
        <div className="bg-brand-card/80 p-5 rounded-2xl border border-brand-border flex flex-col justify-between group hover:border-amber-500/50 transition-colors">
          <div className="flex items-center gap-2 text-xs text-[#9CB1AC] font-semibold">
            <Lock className="w-4 h-4 text-amber-500" />
            <span>Locked (5%)</span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-display font-bold text-brand-text">${lockedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
      </div>

      {/* Main Operations Area */}
      <div className="bg-brand-card border border-brand-border rounded-2xl shadow-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-brand-border overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('insights')}
            className={`flex-1 min-w-[150px] py-4 text-sm font-bold tracking-wide border-b-2 transition-colors ${activeTab === 'insights' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-[#9CB1AC] hover:text-brand-text hover:bg-brand-surface/30'}`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 min-w-[150px] py-4 text-sm font-bold tracking-wide border-b-2 transition-colors ${activeTab === 'deposit' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-[#9CB1AC] hover:text-brand-text hover:bg-brand-surface/30'}`}
          >
            Deposit Simulator
          </button>
          <button 
            onClick={() => setActiveTab('addresses')}
            className={`flex-1 min-w-[150px] py-4 text-sm font-bold tracking-wide border-b-2 transition-colors ${activeTab === 'addresses' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-[#9CB1AC] hover:text-brand-text hover:bg-brand-surface/30'}`}
          >
            Vault Addresses
          </button>
          <button 
            onClick={() => setActiveTab('market')}
            className={`flex-1 min-w-[150px] py-4 text-sm font-bold tracking-wide border-b-2 transition-colors ${activeTab === 'market' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-[#9CB1AC] hover:text-brand-text hover:bg-brand-surface/30'}`}
          >
            Market & SPP Token
          </button>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'insights' && (
            <WalletInsights profile={profile} transactions={transactions} />
          )}

          {activeTab === 'deposit' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="text-center space-y-2 mb-8">
                <h3 className="text-lg font-display font-bold text-brand-text">Simulate Incoming Assets</h3>
                <p className="text-sm text-[#9CB1AC]">
                  Use this sandbox to inject funds into your ledger. It helps test your merchant node pipelines and balance synchronization.
                </p>
              </div>

              {profile?.license_active ? (
                <form onSubmit={handleSimulateDeposit} className="space-y-6">
                  <div className="bg-brand-bg p-6 rounded-2xl border border-brand-border">
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
                      className="bg-brand-accent hover:bg-[#00E676] text-[#050E0C] font-bold px-8 py-3.5 rounded-xl transition-all flex items-center gap-3 text-sm font-display cursor-pointer shadow-[0_0_20px_rgba(0,200,83,0.3)] disabled:opacity-50 disabled:shadow-none w-full md:w-auto"
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
                <div className="py-10 flex flex-col items-center text-center space-y-5 bg-brand-bg rounded-2xl border border-brand-border">
                  <div className="w-16 h-16 rounded-full bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center text-brand-accent">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h4 className="text-lg font-bold text-brand-text font-display">Premium Feature Locked</h4>
                    <p className="text-sm text-[#9CB1AC] leading-relaxed">
                      Upgrade to a Pro Subscription to unlock the asset simulator and instantly credit test funds to your ledger.
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('subscription')}
                    className="mt-4 bg-brand-accent text-[#050E0C] hover:bg-[#00E676] font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(0,200,83,0.2)]"
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
                <h3 className="text-lg font-display font-bold text-brand-text">Direct Vault Deposits</h3>
                <p className="text-sm text-[#9CB1AC]">
                  Send assets directly to these secure cold-storage vault addresses. Ensure you use the correct network.
                </p>
              </div>

              {/* MetaMask Integration Panel */}
              <div className="bg-brand-bg border border-brand-border p-6 rounded-2xl relative overflow-hidden space-y-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/25">
                      <Wallet className="w-5.5 h-5.5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-brand-text font-display">MetaMask Sovereign Ledger Connection</h4>
                      <p className="text-xs text-[#9CB1AC] mt-0.5">Integrate your active MetaMask wallet for on-chain balances.</p>
                    </div>
                  </div>

                  {metaMaskAddress ? (
                    <button
                      onClick={disconnectMetaMask}
                      className="px-4 py-2 bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-900/40 rounded-xl text-xs font-bold transition-all"
                    >
                      Disconnect Wallet
                    </button>
                  ) : (
                    <button
                      onClick={connectMetaMask}
                      disabled={isConnectingMetaMask}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-[#050E0C] font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50"
                    >
                      {isConnectingMetaMask ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          Connect MetaMask
                        </>
                      )}
                    </button>
                  )}
                </div>

                {metaMaskAddress ? (
                  <div className="bg-brand-card p-4 rounded-xl border border-brand-border/50 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-brand-text-dim block uppercase font-bold tracking-wider font-mono text-[9px]">Connected Address</span>
                      <span className="text-gray-200 font-mono font-medium block mt-1 select-all break-all">
                        {metaMaskAddress}
                      </span>
                    </div>
                    <div>
                      <span className="text-brand-text-dim block uppercase font-bold tracking-wider font-mono text-[9px]">Current Chain</span>
                      <span className="text-brand-accent font-semibold block mt-1">
                        {metaMaskNetwork || 'Querying...'}
                      </span>
                    </div>
                    <div>
                      <span className="text-brand-text-dim block uppercase font-bold tracking-wider font-mono text-[9px]">Ether Balance</span>
                      <span className="text-brand-text font-bold block mt-1 text-sm font-mono">
                        {metaMaskBalance !== null ? `${metaMaskBalance} ETH` : 'Querying...'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-brand-card/30 p-3.5 rounded-xl border border-brand-border/30 text-xs text-[#9CB1AC] leading-relaxed">
                    MetaMask is disconnected. Connecting MetaMask allows the SlipMint console to monitor on-chain smart contract interactions, gas fees, and token supply structures directly from your Web3 browser sandbox.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {networkAddresses.map((net) => (
                  <div key={net.name} className="bg-brand-bg p-5 border border-brand-border rounded-2xl space-y-4 hover:border-brand-accent/40 transition-colors group relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                      <QrCode className="w-32 h-32" />
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <span className="text-xs font-mono font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded">{net.network}</span>
                        <h4 className="text-brand-text font-bold mt-3 font-display">{net.name}</h4>
                      </div>
                      <button
                        onClick={() => handleCopyAddress(net.name, net.address)}
                        className="bg-brand-surface/50 hover:bg-brand-accent text-[#9CB1AC] hover:text-[#050E0C] transition-colors p-2.5 rounded-xl border border-brand-border hover:border-brand-accent"
                        title={`Copy ${net.label}`}
                      >
                        {copiedNetwork === net.name ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="bg-brand-card p-3 rounded-xl border border-brand-border/50 text-xs font-mono text-[#9CB1AC] select-all break-all relative z-10 leading-relaxed">
                      {net.address}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-brand-accent/5 border border-brand-accent/20 p-4 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-accent flex-shrink-0" />
                <p className="text-xs text-[#9CB1AC] leading-relaxed">
                  <strong className="text-brand-text">Security Notice:</strong> Sending funds to the wrong network or address type may result in permanent loss. Always double-check the recipient address and selected network before confirming any external transfer.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'market' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="text-center space-y-2 mb-8">
                <h3 className="text-xl font-display font-bold text-brand-text flex items-center justify-center gap-2">
                  <Coins className="w-5 h-5 text-brand-accent" /> Sovereign Token & CoinGecko Market Data
                </h3>
                <p className="text-sm text-[#9CB1AC]">
                  View live multi-chain cryptocurrency market indices and the native SimuPay (SPP) ERC-20 utility token status.
                </p>
              </div>

              {/* CoinGecko Live Market Rates Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-brand-bg p-5 border border-brand-border rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-brand-text-muted">BTC / USD</span>
                    <span className="text-[10px] bg-brand-surface/40 text-brand-text-dim border border-brand-border/30 px-1.5 py-0.5 rounded font-mono font-bold">COINGECKO LIVE</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-mono font-bold text-brand-text">
                      ${marketPrices?.bitcoin?.usd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '...'}
                    </div>
                    <div className={`text-xs font-semibold ${(marketPrices?.bitcoin?.change24h ?? 0) >= 0 ? 'text-brand-accent' : 'text-red-400'}`}>
                      {(marketPrices?.bitcoin?.change24h ?? 0) >= 0 ? '▲ +' : '▼ '}
                      {marketPrices?.bitcoin?.change24h?.toFixed(2) ?? '0.00'}% (24h)
                    </div>
                  </div>
                </div>

                <div className="bg-brand-bg p-5 border border-brand-border rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-brand-text-muted">ETH / USD</span>
                    <span className="text-[10px] bg-brand-surface/40 text-brand-text-dim border border-brand-border/30 px-1.5 py-0.5 rounded font-mono font-bold">COINGECKO LIVE</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-mono font-bold text-brand-text">
                      ${marketPrices?.ethereum?.usd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '...'}
                    </div>
                    <div className={`text-xs font-semibold ${(marketPrices?.ethereum?.change24h ?? 0) >= 0 ? 'text-brand-accent' : 'text-red-400'}`}>
                      {(marketPrices?.ethereum?.change24h ?? 0) >= 0 ? '▲ +' : '▼ '}
                      {marketPrices?.ethereum?.change24h?.toFixed(2) ?? '0.00'}% (24h)
                    </div>
                  </div>
                </div>

                <div className="bg-brand-bg p-5 border border-brand-border rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-brand-text-muted">USDT / USD</span>
                    <span className="text-[10px] bg-brand-surface/40 text-brand-text-dim border border-brand-border/30 px-1.5 py-0.5 rounded font-mono font-bold">COINGECKO LIVE</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-mono font-bold text-brand-text">
                      ${marketPrices?.tether?.usd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '...'}
                    </div>
                    <div className={`text-xs font-semibold ${(marketPrices?.tether?.change24h ?? 0) >= 0 ? 'text-brand-accent' : 'text-red-400'}`}>
                      {(marketPrices?.tether?.change24h ?? 0) >= 0 ? '▲ +' : '▼ '}
                      {marketPrices?.tether?.change24h?.toFixed(2) ?? '0.00'}% (24h)
                    </div>
                  </div>
                </div>
              </div>

              {/* SPP Native Token Card */}
              <div className="bg-brand-bg border border-brand-border p-6 rounded-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-border/50 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-xl bg-brand-accent/10 text-brand-accent border border-brand-accent/25">
                      <Layers className="w-5.5 h-5.5 animate-pulse" />
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-brand-text font-display">{sppInfo?.name} ({sppInfo?.symbol})</h4>
                      <p className="text-xs text-[#9CB1AC] mt-0.5">Sovereign settlement utility ERC-20 ledger on Ethereum</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                    {sppInfo?.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-brand-text-dim block uppercase font-bold tracking-wider font-mono">Total Supply</span>
                        <span className="text-brand-text font-medium block mt-1">{sppInfo?.totalSupply} SPP</span>
                      </div>
                      <div>
                        <span className="text-brand-text-dim block uppercase font-bold tracking-wider font-mono">Decimals</span>
                        <span className="text-brand-text font-medium block mt-1">{sppInfo?.decimals}</span>
                      </div>
                      <div>
                        <span className="text-brand-text-dim block uppercase font-bold tracking-wider font-mono">Market Valuation</span>
                        <span className="text-brand-text-muted block mt-1">Not Listed Yet</span>
                      </div>
                      <div>
                        <span className="text-brand-text-dim block uppercase font-bold tracking-wider font-mono">Trading Price</span>
                        <span className="text-amber-500 font-bold block mt-1">Awaiting DEX Listing</span>
                      </div>
                    </div>

                    <div className="bg-brand-card p-4 rounded-xl border border-brand-border/40 space-y-2">
                      <span className="text-[10px] text-brand-text-dim uppercase font-mono font-bold block">Blockchain Source of Truth</span>
                      <p className="text-xs text-[#9CB1AC] leading-relaxed">
                        SPP balances and token distribution remain strictly on-chain. This platform does not simulate fake ledger valuations or offline staking rewards.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#9CB1AC] uppercase font-mono font-bold block">Configurable Contract Address</span>
                      {isEditingContract ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={contractInput}
                            onChange={(e) => setContractInput(e.target.value)}
                            className="w-full bg-brand-card border border-brand-border text-brand-text rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-brand-accent"
                            placeholder="0x..."
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdateContract}
                              className="px-3 py-1.5 bg-brand-accent hover:bg-[#00E676] text-[#050E0C] font-bold rounded-lg text-xs"
                            >
                              Save Address
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingContract(false);
                                setContractInput(sppInfo?.contractAddress || '');
                              }}
                              className="px-3 py-1.5 bg-gray-800 text-brand-text-muted rounded-lg text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-brand-text-muted bg-brand-card border border-brand-border/40 px-3 py-2 rounded-xl break-all flex-1 select-all">
                            {sppInfo?.contractAddress}
                          </span>
                          <button
                            onClick={() => setIsEditingContract(true)}
                            className="p-2 bg-brand-surface hover:bg-[#204e43] text-brand-accent border border-brand-border hover:border-brand-accent rounded-xl text-xs transition-colors font-bold"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={loadMarketData}
                        className="flex-1 py-3 px-4 bg-brand-surface hover:bg-[#1f4a40] text-brand-text rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-brand-border"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingMarket ? 'animate-spin text-brand-accent' : ''}`} />
                        Refresh Markets
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

