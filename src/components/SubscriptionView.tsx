import React from 'react';
import { Check, Shield, Zap, CreditCard, ArrowRight, Lock, Sparkles, Building, ExternalLink } from 'lucide-react';
import { useToast } from './Toast';
import { Profile } from '../types';

interface SubscriptionViewProps {
  profile: Profile | null;
  onUpdateProfile: (updated: Profile) => void;
  onRefresh: () => void;
}

export function SubscriptionView({ profile, onUpdateProfile, onRefresh }: SubscriptionViewProps) {
  const { showToast } = useToast();

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
      paystackUrl: 'https://paystack.shop/pay/q5aw043f-3', // Replace with quarterly link when available
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

  const handleSubscribe = (plan: any) => {
    if (!profile) {
      showToast('Please sign in to upgrade.', 'error');
      return;
    }
    
    // Direct user to actual payment gateway instead of simulation
    if (plan.paystackUrl) {
      window.open(plan.paystackUrl, '_blank');
    } else {
      showToast('Payment link currently unavailable. Contact support.', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2 py-4">
        <span className="text-[10px] bg-brand-accent/15 text-brand-accent border border-brand-accent/30 px-3 py-1 rounded-full font-mono font-bold tracking-wider uppercase">
          SimuPay Pro Premium Tunnels
        </span>
        <h2 className="text-3xl font-display font-bold text-brand-text tracking-tight">Upgrade to Enterprise Unlimited</h2>
        <p className="text-xs text-[#9CB1AC] font-sans">
          Bypass standard processing limits. Deploy high-speed blockchain ledger simulation networks instantly.
        </p>
      </div>

      {/* PLAN DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-brand-card rounded-2xl border relative overflow-hidden flex flex-col justify-between shadow-2xl transition-transform hover:scale-[1.01] duration-300
              ${plan.popular ? 'border-brand-accent/60 ring-1 ring-[#00C853]/30' : 'border-brand-border'}
            `}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-brand-accent text-[#050E0C] text-[10px] font-bold font-mono px-4 py-1.5 rounded-bl-xl flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> ENTERPRISE RATED
              </div>
            )}

            <div className="p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] text-brand-accent font-bold font-mono tracking-wider uppercase">
                  {plan.billing} Cycle
                </span>
                <h3 className="text-xl font-bold text-brand-text font-display">{plan.name}</h3>
                <p className="text-xs text-[#9CB1AC] leading-relaxed">{plan.desc}</p>
              </div>

              <div className="flex items-baseline gap-1 pt-2">
                <span className="text-3xl font-bold text-brand-text font-display">{plan.price}</span>
                <span className="text-xs text-[#9CB1AC]"> / {plan.id === 'monthly' ? 'month' : '3 months'}</span>
              </div>

              <div className="border-t border-brand-border pt-6 space-y-3.5">
                <p className="text-[11px] font-bold text-brand-text uppercase tracking-wider font-mono">Features Included:</p>
                <div className="space-y-2.5">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <div className="p-0.5 rounded bg-brand-accent/15 text-brand-accent flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-brand-text-muted leading-normal">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-brand-bg/40 border-t border-brand-border space-y-3">
              <button
                onClick={() => handleSubscribe(plan)}
                className={`w-full font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all
                  ${plan.popular 
                    ? 'bg-brand-accent hover:bg-emerald-400 text-[#050E0C]' 
                    : 'bg-transparent border border-brand-accent text-brand-accent hover:bg-brand-accent/10'
                  }
                `}
              >
                <CreditCard className="w-4 h-4" />
                Subscribe via Paystack <ExternalLink className="w-3 h-3 ml-1" />
              </button>
              <p className="text-[10px] text-brand-text-dim text-center px-4 pt-2">
                After payment is complete, your account will be manually provisioned by an administrator. Please retain your email receipt.
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CONFIDENCE FOOTER */}
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between p-5 bg-brand-card border border-brand-border rounded-2xl gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-brand-accent/10 border border-brand-accent/20 text-brand-accent">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-brand-text">100% Secure Checkout Channels</h4>
            <p className="text-[10px] text-[#9CB1AC]">Encrypted through premium Paystack gateway integration.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-[#9CB1AC]">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-brand-accent" /> PCI DSS Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-brand-accent" /> Encrypted Gateway
          </span>
        </div>
      </div>
    </div>
  );
}

