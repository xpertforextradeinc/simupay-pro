import React, { useState } from 'react';
import { Smartphone, Check, CreditCard, RefreshCw } from 'lucide-react';
import { useToast } from './Toast';
import { dbService } from '../services/dbService';

export function AirtimeView({ userEmail }: { userEmail: string }) {
  const { showToast } = useToast();
  const [network, setNetwork] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoadingOptions(false), 1500);
    return () => clearTimeout(timer);
  }, []);

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
          amount,
          currency: 'NGN',
          email: userEmail, 
          tx_ref: `airtime-${Date.now()}`,
          meta: {
            phone,
            network,
            type: 'AIRTIME'
          }
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        window.location.href = data.data.link;
      } else {
        throw new Error('Payment initiation failed');
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to initiate payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-card p-6 rounded-2xl border border-emerald-950/40 shadow-xl space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <span className="p-3 rounded-xl bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/25">
          <Smartphone className="w-6 h-6" />
        </span>
        <h2 className="text-xl font-bold text-white">Buy Airtime</h2>
      </div>

      <div className="space-y-4">
        {loadingOptions ? (
          <div className="w-full bg-brand-bg border border-emerald-950/40 rounded-xl p-4 animate-pulse h-12" />
        ) : (
          <select 
            className="w-full bg-brand-bg border border-emerald-950/40 rounded-xl p-3 text-white"
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
          >
            <option value="">Select Network</option>
            <option value="mtn">MTN</option>
            <option value="airtel">Airtel</option>
            <option value="glo">Glo</option>
            <option value="9mobile">9Mobile</option>
          </select>
        )}

        <input 
          type="text" 
          placeholder="Phone Number" 
          className="w-full bg-brand-bg border border-emerald-950/40 rounded-xl p-3 text-white"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input 
          type="number" 
          placeholder="Amount (₦)" 
          className="w-full bg-brand-bg border border-emerald-950/40 rounded-xl p-3 text-white"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button 
          onClick={handlePurchase}
          disabled={loading}
          className="w-full bg-[#00C853] hover:bg-emerald-500 text-brand-bg font-bold py-3 rounded-xl flex items-center justify-center gap-2"
        >
          {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
          Pay with Flutterwave
        </button>
      </div>
    </div>
  );
}
