import React, { useState } from 'react';
import { useToast } from './Toast';
import { Smartphone, MessageSquare, Send, ShoppingBag, CreditCard, ExternalLink, HelpCircle, LifeBuoy, FileText, CheckCircle, Settings, Bell, Shield, Sliders, Info, Clock, AlertTriangle } from 'lucide-react';
import { SupportTicket } from '../types';
import { dbService } from '../services/dbService';

/* ==========================================
   SMS CENTER VIEW
   ========================================== */
export function SmsCenterView() {
  const [phone, setPhone] = useState('+1 (555) 902-1249');
  const [template, setTemplate] = useState('ALERT: SimuPay Pro has dispathed a Flash Transfer of {amount} {network} to wallet {wallet}. Hash: {hash}');
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();

  const handleSendTestSms = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      showToast(`Test SMS Alert dispatched successfully to ${phone}!`, 'success');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-white">SMS Notification Center</h2>
        <p className="text-xs text-gray-500 font-sans">Configure and test automatic SMS transactional receipts sent directly to your phone.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <form onSubmit={handleSendTestSms} className="md:col-span-3 bg-brand-card p-6 rounded-xl border border-emerald-950/40 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-emerald-950/50 pb-2.5">
            <Smartphone className="w-4 h-4 text-[#00C853]" />
            <h3 className="text-sm font-semibold text-white">SMS Gate Configurations</h3>
          </div>

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SMS Alert Template</label>
              <textarea
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={4}
                className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs leading-relaxed"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={sending}
              className="bg-[#00C853] hover:bg-emerald-500 text-brand-bg font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs cursor-pointer shadow-lg disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {sending ? 'Sending Alert...' : 'Dispatch Test SMS'}
            </button>
          </div>
        </form>

        <div className="md:col-span-2 bg-brand-card p-6 rounded-xl border border-emerald-950/40 shadow-xl space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#00C853]/20 pb-2">SMS Logs Preview</h4>
          <div className="bg-brand-bg/60 p-4 rounded-xl border border-emerald-950/40 font-sans space-y-3 relative overflow-hidden">
            <div className="flex justify-between text-[10px] text-gray-500 border-b border-emerald-950 pb-1.5 font-mono">
              <span>SENDER: SimuPay SMS Gateway</span>
              <span>100% SECURE</span>
            </div>
            <div className="text-xs text-gray-300 leading-relaxed font-mono">
              ALERT: SimuPay Pro has dispatched a Flash Transfer of $12,500.00 USDT (TRC20) to wallet TY6XepvMMy6F... Hash: 0xf92a3b01...
            </div>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Note: Interactive SMS gateway is part of our Unlimited Enterprise Tier. Configure custom webhook listeners inside platform Settings.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   ORDERS VIEW
   ========================================== */
export function OrdersView() {
  const { showToast } = useToast();

  const licenses = [
    { name: 'Standard Key', price: 299, limit: 'Up to $10k per Transfer', desc: 'Secure lifetime activation key for small-scale merchants.' },
    { name: 'Enterprise Unlimited (PRO)', price: 999, limit: 'No Transfer Limits', desc: 'Full premium unlocking including lightning Flash Transfer and SMS Alerts.', recommended: true }
  ];

  const handleOrder = (licName: string) => {
    showToast(`Order request created for ${licName}! Check your profile key.`, 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-white">License Key Orders</h2>
        <p className="text-xs text-gray-500">Acquire secured corporate access codes to instantly unlock premium ledger tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {licenses.map((lic) => (
          <div
            key={lic.name}
            className={`bg-brand-card p-6 rounded-xl border shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden
              ${lic.recommended ? 'border-[#00C853]/40' : 'border-emerald-950/40'}
            `}
          >
            {lic.recommended && (
              <span className="absolute top-3 right-3 text-[9px] font-bold font-mono bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30 px-2 py-0.5 rounded-full">
                RECOMMENDED
              </span>
            )}

            <div className="space-y-2">
              <span className="text-[10px] text-gray-500 font-mono font-bold tracking-wider">SimuPay License Option</span>
              <h3 className="text-lg font-display font-bold text-white">{lic.name}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{lic.desc}</p>
              
              <div className="py-2.5 border-y border-emerald-950/40 text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Limits:</span>
                  <span className="text-white font-bold">{lic.limit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Validity:</span>
                  <span className="text-[#00C853] font-bold">Lifetime Keys</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="font-display">
                <span className="text-2xl font-bold text-white">${lic.price}</span>
                <span className="text-xs text-gray-500 font-medium"> / flat</span>
              </div>
              <button
                onClick={() => handleOrder(lic.name)}
                className="bg-[#00C853] hover:bg-emerald-500 text-brand-bg font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg transition-all"
              >
                <CreditCard className="w-3.5 h-3.5" /> Buy License Key
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================
   SUPPORT VIEW
   ========================================== */
interface SupportViewProps {
  userId: string;
  tickets: SupportTicket[];
  onRefresh: () => void;
}

export function SupportView({ userId, tickets, onRefresh }: SupportViewProps) {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);
  const { showToast } = useToast();

  const handleSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) {
      showToast('Please fill in support fields.', 'warning');
      return;
    }
    setTicketSent(true);
    
    try {
      await dbService.createSupportTicket(userId, ticketSubject, ticketMessage);
      showToast('Support ticket filed successfully!', 'success');
      setTicketSubject('');
      setTicketMessage('');
      onRefresh();
    } catch (e) {
      showToast('Failed to file support ticket.', 'error');
    } finally {
      setTicketSent(false);
    }
  };

  const faqs = [
    { q: 'What is a Flash Asset Transfer?', a: 'Flash Transfers bypass standard 3-day clearing holds using liquidity pipelines to instantly settle blockchain records.' },
    { q: 'How do I retrieve my Sandbox Activation Key?', a: 'Click the "Activation Key" tab in the sidebar. We display your assigned database key directly there for testing.' },
    { q: 'Is this database linked to live blockchain networks?', a: 'This is a simulation terminal. Transfers write records directly into your real Supabase tables for transaction auditing.' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-white">Help & Merchant Support</h2>
        <p className="text-xs text-gray-500">File technical support tickets and read general system operating parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <form onSubmit={handleSupportTicket} className="md:col-span-3 bg-brand-card p-6 rounded-xl border border-emerald-950/40 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-emerald-950/50 pb-2.5">
            <LifeBuoy className="w-4 h-4 text-[#00C853]" />
            <h3 className="text-sm font-semibold text-white">Open Support Ticket</h3>
          </div>

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subject</label>
              <input
                type="text"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Subject of support request..."
                className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#00C853]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Message</label>
              <textarea
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                rows={4}
                placeholder="Provide details about your query..."
                className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs leading-relaxed focus:outline-none focus:border-[#00C853]"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={ticketSent}
              className="bg-[#00C853] hover:bg-emerald-500 text-brand-bg font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs cursor-pointer shadow-lg disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {ticketSent ? 'Submitting ticket...' : 'Submit Support Ticket'}
            </button>
          </div>
        </form>

        <div className="md:col-span-2 bg-brand-card p-6 rounded-xl border border-emerald-950/40 shadow-xl space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-emerald-950/50 pb-2">FAQ Guide</h4>
          <div className="space-y-4 border-b border-emerald-950/20 pb-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="space-y-1">
                <h5 className="text-xs font-bold text-[#00C853]">{faq.q}</h5>
                <p className="text-xs text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* Ticket List Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Your Filed Tickets ({tickets.length})</h4>
            {tickets.length === 0 ? (
              <p className="text-[11px] text-gray-500 italic">No tickets filed yet in this node session.</p>
            ) : (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-3 bg-brand-bg/40 rounded-lg border border-emerald-950/40 flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-white block truncate max-w-[130px]">{ticket.subject}</span>
                      <span className="text-[9px] text-gray-500 block">{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase
                      ${ticket.status === 'resolved' ? 'bg-[#00C853]/15 text-[#00C853]' : ''}
                      ${ticket.status === 'pending' ? 'bg-amber-500/15 text-amber-500' : ''}
                      ${ticket.status === 'open' ? 'bg-blue-500/15 text-blue-400' : ''}
                    `}>
                      {ticket.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   SETTINGS VIEW
   ========================================== */
import { Profile } from '../types';

interface SettingsViewProps {
  profile: Profile | null;
  onUpdateProfile: (updated: Profile) => void;
}

export function SettingsView({ profile, onUpdateProfile }: SettingsViewProps) {
  const [emailAlerts, setEmailAlerts] = useState(profile?.email_alerts !== false);
  const [mempoolClear, setMempoolClear] = useState(profile?.mempool_clear === true);
  const [sandboxMode] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  React.useEffect(() => {
    if (profile) {
      setEmailAlerts(profile.email_alerts !== false);
      setMempoolClear(profile.mempool_clear === true);
    }
  }, [profile]);

  const handleSaveSettings = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const updatedProfile = await dbService.updateProfile(profile.id, {
        email_alerts: emailAlerts,
        mempool_clear: mempoolClear
      });
      onUpdateProfile(updatedProfile);
      showToast('Platform preferences synced and saved to Supabase!', 'success');
    } catch (e) {
      showToast('Failed to save preferences to Supabase.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-white">System Settings</h2>
        <p className="text-xs text-gray-500">Configure corporate ledger tunnels, API permissions, and preferences.</p>
      </div>

      <div className="bg-brand-card p-6 rounded-xl border border-emerald-950/40 shadow-xl max-w-2xl space-y-6">
        <div className="flex items-center gap-2 border-b border-emerald-950/50 pb-2.5">
          <Settings className="w-4 h-4 text-[#00C853]" />
          <h3 className="text-sm font-semibold text-white">Merchant Preferences</h3>
        </div>

        <div className="space-y-4 text-xs">
          {/* Email notifications */}
          <div className="flex items-center justify-between p-3.5 bg-brand-bg/60 border border-emerald-950 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Email Compliance Alerts</span>
              <span className="text-[10px] text-gray-500 block">Dispatch transaction alerts directly to your inbox.</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-5 h-5 rounded bg-brand-bg border-emerald-950 text-[#00C853] focus:ring-[#00C853] cursor-pointer"
            />
          </div>

          {/* Sandbox toggle */}
          <div className="flex items-center justify-between p-3.5 bg-brand-bg/60 border border-emerald-950 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Sandbox Testing Mode</span>
              <span className="text-[10px] text-gray-500 block">Allow simulation deposits and test credits.</span>
            </div>
            <input
              type="checkbox"
              checked={sandboxMode}
              disabled
              className="w-5 h-5 rounded bg-brand-bg border-emerald-950 text-[#00C853] focus:ring-[#00C853] opacity-40 cursor-not-allowed"
            />
          </div>

          {/* Auto Mempool clear */}
          <div className="flex items-center justify-between p-3.5 bg-brand-bg/60 border border-emerald-950 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Auto-Clear Mempool Queue</span>
              <span className="text-[10px] text-gray-500 block">Clean transaction queue to save bandwidth when necessary.</span>
            </div>
            <input
              type="checkbox"
              checked={mempoolClear}
              onChange={(e) => setMempoolClear(e.target.checked)}
              className="w-5 h-5 rounded bg-brand-bg border-emerald-950 text-[#00C853] focus:ring-[#00C853] cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-[#00C853] hover:bg-emerald-500 text-brand-bg font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
