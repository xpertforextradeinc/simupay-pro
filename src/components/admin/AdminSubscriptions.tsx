import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Plus, Edit3, Trash2, Check, X, ShieldAlert,
  Clock, CheckCircle, RefreshCw, Calendar, DollarSign
} from 'lucide-react';
import { Subscription } from '../../types';
import { adminService, SubscriptionPlan } from '../../services/adminService';

interface AdminSubscriptionsProps {
  subscriptions: Subscription[];
  onUpdateSubStatus: (subId: string, status: 'active' | 'expired' | 'canceled') => Promise<void>;
  onDeleteSub: (subId: string) => Promise<void>;
  onCreateManualSub: (userId: string, email: string, planName: string, cycle: 'Monthly' | 'Quarterly' | 'Annual' | 'Lifetime', amount: number) => Promise<void>;
}

export function AdminSubscriptions({ 
  subscriptions, 
  onUpdateSubStatus, 
  onDeleteSub,
  onCreateManualSub
}: AdminSubscriptionsProps) {
  
  // Custom plans state managed by adminService
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  
  // Dynamic form states
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState(0);
  const [planCycle, setPlanCycle] = useState<'Monthly' | 'Quarterly' | 'Annual' | 'Lifetime'>('Monthly');
  const [planTrial, setPlanTrial] = useState(7);
  const [planDesc, setPlanDesc] = useState('');

  // Manual enrollment form
  const [manualUserId, setManualUserId] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPlanName, setManualPlanName] = useState('SimuPay Pro Quarterly');
  const [manualCycle, setManualCycle] = useState<'Monthly' | 'Quarterly' | 'Annual' | 'Lifetime'>('Quarterly');
  const [manualPrice, setManualPrice] = useState(75000);

  // Load plans on mount
  useEffect(() => {
    setPlans(adminService.getPlans());
  }, []);

  const handleCreatePlan = () => {
    const newPlan = adminService.addPlan({
      name: 'New Custom Tier Plan',
      price: 45000,
      billingCycle: 'Monthly',
      trialPeriodDays: 7,
      description: 'Fully customizable enterprise receipt limits config.',
      enabled: true
    });
    setPlans(adminService.getPlans());
    setEditingPlanId(newPlan.id);
    setPlanName(newPlan.name);
    setPlanPrice(newPlan.price);
    setPlanCycle(newPlan.billingCycle);
    setPlanTrial(newPlan.trialPeriodDays);
    setPlanDesc(newPlan.description);
  };

  const handleSavePlan = (id: string) => {
    adminService.updatePlan(id, {
      name: planName,
      price: planPrice,
      billingCycle: planCycle,
      trialPeriodDays: planTrial,
      description: planDesc
    });
    setEditingPlanId(null);
    setPlans(adminService.getPlans());
  };

  const handleDeletePlan = (id: string) => {
    if (window.confirm('Delete this pricing plan structure? Old subscriber records will remain unaffected.')) {
      adminService.deletePlan(id);
      setPlans(adminService.getPlans());
    }
  };

  const handleEnrollMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUserId || !manualEmail) return;
    await onCreateManualSub(manualUserId, manualEmail, manualPlanName, manualCycle, manualPrice);
    setManualUserId('');
    setManualEmail('');
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: SYSTEM PRICING PLANS */}
      <div className="bg-[#091714] p-6 rounded-2xl border border-[#16362F] space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-[#16362F] pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#00C853]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Dynamic Billing & Subscription Plans</h3>
          </div>
          <button
            onClick={handleCreatePlan}
            className="px-3 py-1.5 bg-[#00C853] hover:bg-emerald-400 text-[#050E0C] font-bold text-[10px] rounded-lg uppercase tracking-wide flex items-center gap-1 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Create New Plan
          </button>
        </div>

        {/* Pricing grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const isEditing = editingPlanId === plan.id;
            return (
              <div 
                key={plan.id} 
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-300
                  ${isEditing ? 'bg-[#050E0C] border-[#00C853]' : 'bg-black/30 border-[#16362F]'}
                `}
              >
                {isEditing ? (
                  <div className="space-y-3 text-xs font-mono">
                    <input
                      type="text"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      className="w-full bg-brand-bg/50 border border-[#16362F] rounded p-1.5 text-white"
                      placeholder="Plan name"
                    />
                    <input
                      type="number"
                      value={planPrice}
                      onChange={(e) => setPlanPrice(parseInt(e.target.value) || 0)}
                      className="w-full bg-brand-bg/50 border border-[#16362F] rounded p-1.5 text-white"
                      placeholder="Price in ₦"
                    />
                    <select
                      value={planCycle}
                      onChange={(e) => setPlanCycle(e.target.value as any)}
                      className="w-full bg-brand-bg/50 border border-[#16362F] rounded p-1.5 text-white"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annual">Annual</option>
                      <option value="Lifetime">Lifetime</option>
                    </select>
                    <input
                      type="number"
                      value={planTrial}
                      onChange={(e) => setPlanTrial(parseInt(e.target.value) || 0)}
                      className="w-full bg-brand-bg/50 border border-[#16362F] rounded p-1.5 text-white"
                      placeholder="Trial Period days"
                    />
                    <textarea
                      value={planDesc}
                      onChange={(e) => setPlanDesc(e.target.value)}
                      className="w-full bg-brand-bg/50 border border-[#16362F] rounded p-1.5 text-white h-12"
                      placeholder="Description"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleSavePlan(plan.id)}
                        className="p-1 bg-[#00C853] text-black rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingPlanId(null)}
                        className="p-1 bg-gray-700 text-white rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-emerald-950 text-[#00C853] px-2 py-0.5 rounded font-bold font-mono tracking-wider uppercase">
                          {plan.billingCycle}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingPlanId(plan.id);
                              setPlanName(plan.name);
                              setPlanPrice(plan.price);
                              setPlanCycle(plan.billingCycle);
                              setPlanTrial(plan.trialPeriodDays);
                              setPlanDesc(plan.description);
                            }}
                            className="text-gray-400 hover:text-white p-0.5 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            className="text-red-400 hover:text-red-300 p-0.5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-white font-display mt-1">{plan.name}</h4>
                      <h3 className="text-xl font-bold text-[#00C853] font-mono">
                        ₦{plan.price.toLocaleString()}
                      </h3>
                      <p className="text-[10px] text-gray-500 leading-normal">{plan.description}</p>
                    </div>

                    <div className="border-t border-[#16362F]/40 pt-2.5 mt-4 text-[10px] font-mono text-gray-500 flex justify-between">
                      <span>Trial days: {plan.trialPeriodDays}</span>
                      <span className="text-[#00C853]">● Active Plan</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: MANUAL LICENSING & SUBSCRIBERS TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Active subscriptions list */}
        <div className="lg:col-span-3 bg-[#091714] border border-[#16362F] rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 bg-[#050E0C] border-b border-[#16362F] flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Subscription Registry
              </h3>
              <span className="text-[10px] font-mono text-gray-500">{subscriptions.length} active logs</span>
            </div>

            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-[#050e0c]/50 text-gray-400 border-b border-[#16362F]">
                    <th className="p-3">Subscriber</th>
                    <th className="p-3">Plan Details</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16362F]/30 text-[11px]">
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500 italic">No subscriptions currently logged.</td>
                    </tr>
                  ) : (
                    subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#050e0c]/25">
                        <td className="p-3">
                          <span className="text-white font-bold block">{sub.email}</span>
                          <span className="text-[9px] text-gray-500 block truncate max-w-[120px]">{sub.id}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-gray-300 block font-semibold">{sub.plan_name}</span>
                          <span className="text-[9px] text-gray-500 block">₦{sub.amount?.toLocaleString()} ({sub.billing_cycle})</span>
                        </td>
                        <td className="p-3">
                          <select
                            value={sub.status}
                            onChange={(e) => onUpdateSubStatus(sub.id, e.target.value as any)}
                            className={`bg-brand-bg border border-[#16362F]/80 rounded text-[9px] font-bold p-1 cursor-pointer focus:outline-none
                              ${sub.status === 'active' ? 'text-[#00C853]' : ''}
                              ${sub.status === 'expired' ? 'text-amber-500' : ''}
                              ${sub.status === 'canceled' ? 'text-red-400' : ''}
                            `}
                          >
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="canceled">Canceled</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => onDeleteSub(sub.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="p-4 bg-[#050e0c]/30 border-t border-[#16362F] text-[10px] text-gray-500 italic">
            * Deleting or changing subscription statuses here directly upgrades or downgrades standard merchants immediately.
          </div>
        </div>

        {/* Manual Upgrade Enrollment Form */}
        <form onSubmit={handleEnrollMerchant} className="lg:col-span-2 bg-[#091714] p-5 rounded-2xl border border-[#16362F] shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#16362F] pb-2">
            <Plus className="w-4 h-4 text-[#00C853]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Manual Billing Enrollment</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">Merchant/User ID</label>
              <input
                type="text"
                value={manualUserId}
                onChange={(e) => setManualUserId(e.target.value)}
                placeholder="User ID string..."
                className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">User Corporate Email</label>
              <input
                type="email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                placeholder="merchant@domain.com"
                className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">Billing Cycle</label>
                <select
                  value={manualCycle}
                  onChange={(e) => {
                    const cycle = e.target.value as any;
                    setManualCycle(cycle);
                    setManualPrice(cycle === 'Monthly' ? 30000 : cycle === 'Quarterly' ? 75000 : cycle === 'Annual' ? 250000 : 999000);
                  }}
                  className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg px-2 py-1.5 text-white focus:outline-none"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annual">Annual</option>
                  <option value="Lifetime">Lifetime</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">Set Price (₦)</label>
                <input
                  type="number"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg px-2 py-1.5 text-white font-mono focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">Plan Nomenclature</label>
              <input
                type="text"
                value={manualPlanName}
                onChange={(e) => setManualPlanName(e.target.value)}
                className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#00C853] hover:bg-emerald-400 text-[#050E0C] font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" /> Enforce License Manual Sub
          </button>
        </form>
      </div>

    </div>
  );
}
