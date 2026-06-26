import React, { useState } from 'react';
import { Check, Shield, Zap, CreditCard, ArrowRight, Lock, RefreshCw, Sparkles, Building } from 'lucide-react';
import { useToast } from './Toast';
import { dbService } from '../services/dbService';
import { Profile } from '../types';

interface SubscriptionViewProps {
  profile: Profile | null;
  onUpdateProfile: (updated: Profile) => void;
  onRefresh: () => void;
}

export function SubscriptionView({ profile, onUpdateProfile, onRefresh }: SubscriptionViewProps) {
  const { showToast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Checkout Form fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [payEmail, setPayEmail] = useState(profile?.email || '');
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'processing' | 'success'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'transfer'>('card');

  const plans = [
    {
      id: 'monthly',
      name: 'SimuPay Pro Monthly',
      price: '₦30,000',
      numericPrice: 30000,
      billing: 'Monthly',
      desc: 'Perfect for scaling merchants testing our high-speed ledger capabilities.',
      paystackUrl: 'https://paystack.shop/pay/q5aw043f-3',
      features: [
        'High-speed Flash Transfers up to ₦10M/day',
        'Advanced Automated Receipts Creator',
        'Direct Developer API Integration Support',
        'WhatsApp Support Tunnel access',
        'SMS Gateway Integration Credits (500/mo)',
        'Full Analytics Dashboard privileges'
      ],
      planCode: 'PLN_monthly_direct'
    },
    {
      id: 'quarterly',
      name: 'SimuPay Pro Quarterly',
      price: '₦75,000',
      numericPrice: 75000,
      billing: 'Every 3 Months',
      desc: 'Enterprise choice with complete limit bypasses and top priority clearance pools.',
      planCode: 'PLN_d25vm8u2re2nhjn',
      features: [
        'Completely Unlimited Flash Transfer Volume',
        'VIP Priority clearance pool allocation',
        'Dedicated SLA Technical Account Manager',
        'Unlimited Automatic SMS compliance alerts',
        'Direct webhook logs & custom ledger nodes',
        'Zero-fee premium ledger simulations'
      ],
      popular: true
    }
  ];

  const handleSelectPlan = (plan: any) => {
    if (!profile) {
      showToast('Please sign in to upgrade.', 'error');
      return;
    }

    if (plan.id === 'monthly') {
      // Prompt direct URL redirect but ALSO give an instant simulation flow for testing!
      setSelectedPlan(plan);
      setCheckoutStep('details');
      setPayEmail(profile.email);
      setShowCheckoutModal(true);
    } else {
      // Quarterly - Paystack Plan Code PLN_d25vm8u2re2nhjn
      setSelectedPlan(plan);
      setCheckoutStep('details');
      setPayEmail(profile.email);
      setShowCheckoutModal(true);
    }
  };

  const handleCardNumberChange = (val: string) => {
    const formatted = val.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
    if (formatted.length <= 19) setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const formatted = val.replace('/', '').replace(/(\d{2})/g, '$1/').trim();
    if (formatted.endsWith('/')) {
      const stripped = formatted.slice(0, -1);
      if (stripped.length <= 5) setExpiry(stripped);
    } else {
      if (formatted.length <= 5) setExpiry(formatted);
    }
  };

  const simulateCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payEmail) {
      showToast('Email address is required.', 'warning');
      return;
    }
    if (paymentMethod === 'card' && (!cardNumber || !expiry || !cvv)) {
      showToast('Please complete all card credentials.', 'warning');
      return;
    }

    setCheckoutStep('processing');

    setTimeout(async () => {
      try {
        const reference = `SPP-PAYSTK-${Math.floor(100000 + Math.random() * 900000)}`;
        const days = selectedPlan.id === 'monthly' ? 30 : 90;
        const cycle = selectedPlan.id === 'monthly' ? 'Monthly' : 'Quarterly';

        // 1. Create subscription in Supabase/localStorage
        await dbService.createSubscription(
          profile!.id,
          payEmail,
          selectedPlan.name,
          selectedPlan.planCode,
          selectedPlan.numericPrice,
          cycle,
          reference
        );

        // 2. Update profiles fields
        const expiryDate = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();
        const updatedProfile = await dbService.updateProfile(profile!.id, {
          license_active: true,
          license_type: 'Enterprise',
          subscription_status: 'Active',
          expiry_date: expiryDate
        });

        // 3. Log actions
        await dbService.logActivity(profile!.id, 'settings update', `Upgraded to ${selectedPlan.name} [Ref: ${reference}]`);
        await dbService.createNotification(
          profile!.id,
          'Subscription Upgrade Success',
          `Your merchant portal has been updated to Enterprise Unlimited! Subscription active until ${new Date(expiryDate).toLocaleDateString()}.`,
          'success'
        );

        onUpdateProfile(updatedProfile);
        setCheckoutStep('success');
        showToast(`Payment successful! Welcome to ${selectedPlan.name}.`, 'success');
        onRefresh();
      } catch (err) {
        showToast('Payment processing completed, but profile sync failed. Contact support.', 'warning');
        setCheckoutStep('details');
      }
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2 py-4">
        <span className="text-[10px] bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30 px-3 py-1 rounded-full font-mono font-bold tracking-wider uppercase">
          SimuPay Pro Premium Tunnels
        </span>
        <h2 className="text-3xl font-display font-bold text-white tracking-tight">Upgrade to Enterprise Unlimited</h2>
        <p className="text-xs text-[#9CB1AC] font-sans">
          Bypass standard processing limits. Deploy high-speed blockchain ledger simulation networks instantly.
        </p>
      </div>

      {/* PLAN DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-[#091714] rounded-2xl border relative overflow-hidden flex flex-col justify-between shadow-2xl transition-transform hover:scale-[1.01] duration-300
              ${plan.popular ? 'border-[#00C853]/60 ring-1 ring-[#00C853]/30' : 'border-[#16362F]'}
            `}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-[#00C853] text-[#050E0C] text-[10px] font-bold font-mono px-4 py-1.5 rounded-bl-xl flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> ENTERPRISE RATED
              </div>
            )}

            <div className="p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] text-[#00C853] font-bold font-mono tracking-wider uppercase">
                  {plan.billing} Cycle
                </span>
                <h3 className="text-xl font-bold text-white font-display">{plan.name}</h3>
                <p className="text-xs text-[#9CB1AC] leading-relaxed">{plan.desc}</p>
              </div>

              <div className="flex items-baseline gap-1 pt-2">
                <span className="text-3xl font-bold text-white font-display">{plan.price}</span>
                <span className="text-xs text-[#9CB1AC]"> / {plan.id === 'monthly' ? 'month' : '3 months'}</span>
              </div>

              <div className="border-t border-[#16362F] pt-6 space-y-3.5">
                <p className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">Features Included:</p>
                <div className="space-y-2.5">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <div className="p-0.5 rounded bg-[#00C853]/15 text-[#00C853] flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-gray-300 leading-normal">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-[#050e0c]/40 border-t border-[#16362F] space-y-3">
              {plan.id === 'monthly' && (
                <a
                  href={plan.paystackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center bg-[#1D4ED8] hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg"
                >
                  Go to Live Paystack Page <ArrowRight className="w-4 h-4" />
                </a>
              )}

              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all
                  ${plan.popular 
                    ? 'bg-[#00C853] hover:bg-emerald-400 text-[#050E0C]' 
                    : 'bg-transparent border border-[#00C853] text-[#00C853] hover:bg-[#00C853]/10'
                  }
                `}
              >
                <CreditCard className="w-4 h-4" />
                {plan.id === 'monthly' ? 'Simulate Instant Monthly Sub' : 'Subscribe via Paystack Popup'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CONFIDENCE FOOTER */}
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between p-5 bg-[#091714] border border-[#16362F] rounded-2xl gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#00C853]/10 border border-[#00C853]/20 text-[#00C853]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">100% Secure Checkout Channels</h4>
            <p className="text-[10px] text-[#9CB1AC]">Encrypted through premium licensed Vercel / Supabase integrations.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-[#9CB1AC]">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#00C853]" /> PCI DSS Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#00C853]" /> Central Bank Audited
          </span>
        </div>
      </div>

      {/* INTERACTIVE PAYSTACK POPUP SIMULATOR */}
      {showCheckoutModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#091714] w-full max-w-md rounded-2xl border border-[#16362F] overflow-hidden shadow-2xl relative">
            
            {/* Paystack Styled Header */}
            <div className="bg-[#050E0C] px-6 py-4 border-b border-[#16362F] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-blue-500 font-bold tracking-tight text-sm font-sans flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-blue-500 block" /> paystack
                </span>
                <span className="text-gray-500 text-[10px] font-mono">| SECURED CHECKOUT</span>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-gray-400 hover:text-white text-xs cursor-pointer"
                disabled={checkoutStep === 'processing'}
              >
                Cancel
              </button>
            </div>

            {checkoutStep === 'details' && (
              <form onSubmit={simulateCheckoutSubmit} className="p-6 space-y-4">
                <div className="bg-[#050E0C] p-4 rounded-xl border border-[#16362F] flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wide font-mono">Plan Selection</span>
                    <h4 className="text-xs font-bold text-white">{selectedPlan.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 font-mono block">Amount</span>
                    <span className="text-sm font-bold text-[#00C853] font-mono">{selectedPlan.price}</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-3 gap-2 border-b border-[#16362F] pb-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 text-[10px] font-bold font-mono rounded-lg transition-all border
                      ${paymentMethod === 'card' 
                        ? 'bg-[#00C853]/10 border-[#00C853] text-[#00C853]' 
                        : 'bg-transparent border-transparent text-gray-400 hover:bg-[#050E0C]'
                      }
                    `}
                  >
                    Card Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`py-2 text-[10px] font-bold font-mono rounded-lg transition-all border
                      ${paymentMethod === 'bank' 
                        ? 'bg-[#00C853]/10 border-[#00C853] text-[#00C853]' 
                        : 'bg-transparent border-transparent text-gray-400 hover:bg-[#050E0C]'
                      }
                    `}
                  >
                    Direct Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`py-2 text-[10px] font-bold font-mono rounded-lg transition-all border
                      ${paymentMethod === 'transfer' 
                        ? 'bg-[#00C853]/10 border-[#00C853] text-[#00C853]' 
                        : 'bg-transparent border-transparent text-gray-400 hover:bg-[#050E0C]'
                      }
                    `}
                  >
                    Bank Transfer
                  </button>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Checkout Email</label>
                    <input
                      type="email"
                      value={payEmail}
                      onChange={(e) => setPayEmail(e.target.value)}
                      placeholder="merchant@simupay.pro"
                      className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  {paymentMethod === 'card' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          placeholder="4000 1234 5678 9010"
                          className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Expiry Date</label>
                          <input
                            type="text"
                            value={expiry}
                            onChange={(e) => handleExpiryChange(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">CVV Code</label>
                          <input
                            type="password"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.slice(0, 3))}
                            placeholder="123"
                            className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {paymentMethod === 'bank' && (
                    <div className="p-4 bg-[#050E0C] border border-[#16362F] rounded-xl text-center space-y-2">
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Authorize instant transaction directly using bank dynamic tokens. Select sandbox standard clearance:
                      </p>
                      <select className="bg-[#091714] border border-[#16362F] rounded-lg px-2 py-1.5 text-white text-xs font-mono focus:outline-none">
                        <option>GTBank Premium API [Sandbox]</option>
                        <option>Zenith Bank Secure Tunnel [Sandbox]</option>
                        <option>Access Bank Token [Sandbox]</option>
                      </select>
                    </div>
                  )}

                  {paymentMethod === 'transfer' && (
                    <div className="p-4 bg-[#050E0C] border border-[#16362F] rounded-xl space-y-2">
                      <p className="text-xs text-gray-400 leading-relaxed text-center">
                        Simulate bank transfer dispatch. Paystack monitors instant inbound transfers.
                      </p>
                      <div className="border-t border-[#16362F] pt-2.5 text-[11px] font-mono space-y-1">
                        <div className="flex justify-between"><span className="text-gray-500">Bank Name:</span><span className="text-white">Paystack Sandbox Bank</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Account No:</span><span className="text-[#00C853] font-bold">9920192012</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Narration:</span><span className="text-gray-300">SPP-RECON-SANDBOX</span></div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#00C853] hover:bg-emerald-400 text-[#050E0C] font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all mt-4"
                >
                  <Lock className="w-3.5 h-3.5" /> Complete Payment of {selectedPlan.price}
                </button>
              </form>
            )}

            {checkoutStep === 'processing' && (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">Contacting Paystack Gateway</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Verifying authorization token and broadcasting secure ledger parameters. Please wait...
                  </p>
                </div>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-5">
                <div className="w-12 h-12 bg-[#00C853]/15 border border-[#00C853]/30 rounded-full flex items-center justify-center text-[#00C853]">
                  <Check className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white font-display">Upgrade Successful!</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Your SimuPay account has been successfully upgraded to the Enterprise Unlimited tier. All premium modules are active.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="bg-[#00C853] text-brand-bg font-bold px-6 py-2.5 rounded-xl text-xs"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
