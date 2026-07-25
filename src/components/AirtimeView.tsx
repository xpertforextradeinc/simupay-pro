import React, { useState } from 'react';
import { Smartphone, Check, CreditCard, RefreshCw, Zap, Percent } from 'lucide-react';
import { useToast } from './Toast';

export function AirtimeView({ userEmail, userId }: { userEmail: string; userId?: string }) {
  const { showToast } = useToast();
  const [network, setNetwork] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!network || !phone || !amount) {
      showToast('Please fill in all fields', 'warning');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          currency: 'NGN',
          email: userEmail, 
          userId: userId,
          tx_ref: `airtime-${Date.now()}`,
          meta: {
            phone,
            network,
            type: 'AIRTIME'
          }
        })
      });
      let data;
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new Error(`Server returned invalid response (${response.status})`);
      }

      if (response.ok && data.status === 'success') {
        window.location.href = data.data.link;
      } else {
        throw new Error(data.error || data.message || 'Payment initiation failed');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to initiate payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-brand-accent/20 to-brand-bg p-8 rounded-3xl border border-brand-accent/20 text-center space-y-2">
        <Zap className="w-10 h-10 text-brand-accent mx-auto" />
        <h1 className="text-3xl font-bold text-brand-text">Instant Top-Up</h1>
        <p className="text-brand-text-muted">Need a quick top-up? Enjoy our lightning-fast airtime services.</p>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-accent/10 text-brand-accent text-sm font-semibold">
          <Percent className="w-4 h-4" /> 5% Instant Cashback on All Purchases
        </div>
      </div>

      <div className="bg-brand-card p-8 rounded-3xl border border-brand-border/40 shadow-xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <select 
            className="col-span-2 bg-brand-bg border border-brand-border/40 rounded-xl p-4 text-brand-text focus:ring-2 focus:ring-brand-accent outline-none"
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
          >
            <option value="">Select Network</option>
            <option value="mtn">MTN</option>
            <option value="airtel">Airtel</option>
            <option value="glo">Glo</option>
            <option value="9mobile">9Mobile</option>
          </select>

          <input 
            type="text" 
            placeholder="Phone Number" 
            className="col-span-2 bg-brand-bg border border-brand-border/40 rounded-xl p-4 text-brand-text focus:ring-2 focus:ring-brand-accent outline-none"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input 
            type="number" 
            placeholder="Amount (₦)" 
            className="col-span-2 bg-brand-bg border border-brand-border/40 rounded-xl p-4 text-brand-text focus:ring-2 focus:ring-brand-accent outline-none"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button 
            onClick={handlePurchase}
            disabled={loading}
            className="col-span-2 bg-brand-accent hover:bg-emerald-500 text-brand-bg font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
            {loading ? 'Processing...' : 'Purchase Airtime'}
          </button>
        </div>
      </div>
    </div>
  );
}
