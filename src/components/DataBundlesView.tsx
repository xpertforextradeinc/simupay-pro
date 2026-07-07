import React, { useState } from 'react';
import { Database, Check, CreditCard, RefreshCw } from 'lucide-react';
import { useToast } from './Toast';
import { dbService } from '../services/dbService';

export function DataBundlesView({ userEmail, userId }: { userEmail: string; userId?: string }) {
  const { showToast } = useToast();
  const [network, setNetwork] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!network || !phone || !plan) {
      showToast('Please fill in all fields', 'warning');
      return;
    }
    setLoading(true);
    try {
      const amount = plan === '1gb' ? 1000 : plan === '3gb' ? 2500 : 4000;
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'NGN',
          email: userEmail,
          userId: userId,
          tx_ref: `data-${Date.now()}`,
          meta: {
            phone,
            network,
            plan,
            type: 'DATA_BUNDLE'
          }
        })
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        window.location.href = data.data.link;
      } else {
        throw new Error(data.error || 'Payment initiation failed');
      }
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Failed to initiate payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-card p-6 rounded-2xl border border-emerald-950/40 shadow-xl space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <span className="p-3 rounded-xl bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/25">
          <Database className="w-6 h-6" />
        </span>
        <h2 className="text-xl font-bold text-white">Buy Data Bundle</h2>
      </div>

      <div className="space-y-4">
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

        <input 
          type="text" 
          placeholder="Phone Number" 
          className="w-full bg-brand-bg border border-emerald-950/40 rounded-xl p-3 text-white"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <select 
          className="w-full bg-brand-bg border border-emerald-950/40 rounded-xl p-3 text-white"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
        >
          <option value="">Select Plan</option>
          <option value="1gb">1GB - ₦1000</option>
          <option value="3gb">3GB - ₦2500</option>
          <option value="5gb">5GB - ₦4000</option>
        </select>

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
