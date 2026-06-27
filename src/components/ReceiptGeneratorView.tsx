import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from './Toast';
import { 
  Receipt as ReceiptIcon, 
  Search, 
  Save, 
  Trash2, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Download,
  Calendar,
  Clock,
  User,
  DollarSign,
  Hash,
  Tag,
  ArrowRight,
  Shield,
  Smartphone,
  ChevronDown,
  X
} from 'lucide-react';
import { PaymentProvider, ReceiptRecord, Profile } from '../types';
import { dbService } from '../services/dbService';
import { motion, AnimatePresence } from 'motion/react';

interface ReceiptGeneratorViewProps {
  profile: Profile | null;
}

export function ReceiptGeneratorView({ profile }: ReceiptGeneratorViewProps) {
  const { showToast } = useToast();
  
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);

  // Form State
  const [formData, setFormData] = useState<Partial<ReceiptRecord>>({
    amount: 0,
    currency: 'USD',
    status: 'completed',
    transaction_date: new Date().toISOString().split('T')[0],
    transaction_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
  });

  useEffect(() => {
    const loadProviders = async () => {
      setLoadingProviders(true);
      try {
        const data = await dbService.getPaymentProviders();
        setProviders(data);
      } catch (err) {
        showToast('Failed to load payment providers.', 'error');
      } finally {
        setLoadingProviders(false);
      }
    };
    loadProviders();
  }, []);

  const filteredProviders = useMemo(() => {
    return providers.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [providers, searchQuery]);

  const handleProviderSelect = (provider: PaymentProvider) => {
    setSelectedProvider(provider);
    setSearchQuery('');
    setIsDropdownOpen(false);
    
    // Reset form for new provider (Empty by default)
    setFormData({
      amount: 0,
      currency: provider.category === 'Crypto' ? 'BTC' : 'USD',
      status: 'completed',
      transaction_date: new Date().toISOString().split('T')[0],
      transaction_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      provider_id: provider.id,
      provider_name: provider.name,
      reference_no: '',
      sender_name: '',
      recipient_name: '',
      recipient_identifier: '',
      memo: '',
    });
    
    showToast(`Template for ${provider.name} loaded.`, 'info');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSave = async () => {
    if (!profile) return;
    if (!selectedProvider) {
      showToast('Please select a provider first.', 'error');
      return;
    }

    // Validation
    const missingFields = selectedProvider.required_fields.filter(f => !formData[f as keyof ReceiptRecord]);
    if (missingFields.length > 0) {
      showToast(`Missing required fields: ${missingFields.join(', ')}`, 'error');
      return;
    }

    setIsSaving(true);
    try {
      await dbService.saveReceiptRecord(profile.id, formData as Omit<ReceiptRecord, 'id' | 'created_at' | 'user_id'>);
      showToast('Receipt record saved successfully!', 'success');
      // Reset after save or navigate? For now, just show success
    } catch (err) {
      showToast('Failed to save receipt.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const isFieldRequired = (fieldName: string) => {
    return selectedProvider?.required_fields.includes(fieldName);
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <ReceiptIcon className="w-6 h-6 text-[#00C853]" /> Personal Receipt Generator
        </h2>
        <p className="text-gray-400 text-sm">Create personal transaction records for your own bookkeeping and history.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-brand-card p-6 rounded-2xl border border-emerald-950/40 shadow-xl space-y-6">
            {/* Searchable Provider Selector */}
            <div className="relative">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Select Provider</label>
              <div className="relative">
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full bg-brand-bg/50 border ${isDropdownOpen ? 'border-[#00C853]' : 'border-emerald-950/50'} rounded-xl px-4 py-3 text-white flex items-center justify-between cursor-pointer transition-all`}
                >
                  <div className="flex items-center gap-3">
                    {selectedProvider ? (
                      <>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedProvider.color_hex || '#00C853' }} />
                        <span className="font-bold">{selectedProvider.name}</span>
                      </>
                    ) : (
                      <span className="text-gray-500">Choose a payment provider...</span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 top-full left-0 right-0 mt-2 bg-brand-card border border-emerald-950 shadow-2xl rounded-xl overflow-hidden"
                    >
                      <div className="p-2 border-b border-emerald-950/50 flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-500 ml-2" />
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="Search providers..." 
                          className="bg-transparent border-none focus:ring-0 text-sm text-white w-full py-1"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {loadingProviders ? (
                          <div className="p-4 text-center text-xs text-gray-500">Loading providers...</div>
                        ) : filteredProviders.length > 0 ? (
                          filteredProviders.map(p => (
                            <div 
                              key={p.id}
                              onClick={() => handleProviderSelect(p)}
                              className="px-4 py-3 hover:bg-[#00C853]/10 cursor-pointer flex items-center justify-between group transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color_hex || '#00C853' }} />
                                <span className="text-sm font-medium text-white group-hover:text-[#00C853] transition-colors">{p.name}</span>
                              </div>
                              <span className="text-[10px] text-gray-500 uppercase font-mono">{p.category}</span>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-gray-500">No providers found matching "{searchQuery}"</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {selectedProvider ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Dynamic Fields */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Amount
                  </label>
                  <input 
                    type="number" 
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#00C853] transition-colors"
                  />
                </div>

                {isFieldRequired('currency') && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Currency</label>
                    <input 
                      type="text" 
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#00C853] transition-colors"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Date
                  </label>
                  <input 
                    type="date" 
                    name="transaction_date"
                    value={formData.transaction_date}
                    onChange={handleInputChange}
                    className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#00C853]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Time
                  </label>
                  <input 
                    type="time" 
                    name="transaction_time"
                    value={formData.transaction_time}
                    onChange={handleInputChange}
                    className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#00C853]"
                  />
                </div>

                {isFieldRequired('status') && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
                    <select 
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00C853]"
                    >
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                )}

                {isFieldRequired('reference_no') && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <Hash className="w-3 h-3" /> Reference No
                    </label>
                    <input 
                      type="text" 
                      name="reference_no"
                      value={formData.reference_no}
                      onChange={handleInputChange}
                      className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#00C853]"
                    />
                  </div>
                )}

                {isFieldRequired('sender_name') && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <User className="w-3 h-3" /> Sender Name
                    </label>
                    <input 
                      type="text" 
                      name="sender_name"
                      value={formData.sender_name}
                      onChange={handleInputChange}
                      className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00C853]"
                    />
                  </div>
                )}

                {isFieldRequired('recipient_name') && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <User className="w-3 h-3" /> Recipient Name
                    </label>
                    <input 
                      type="text" 
                      name="recipient_name"
                      value={formData.recipient_name}
                      onChange={handleInputChange}
                      className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00C853]"
                    />
                  </div>
                )}

                {isFieldRequired('recipient_identifier') && (
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Recipient ID (Email/Tag/Wallet)
                    </label>
                    <input 
                      type="text" 
                      name="recipient_identifier"
                      value={formData.recipient_identifier}
                      onChange={handleInputChange}
                      className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#00C853]"
                    />
                  </div>
                )}

                {isFieldRequired('memo') && (
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Note / Memo</label>
                    <textarea 
                      name="memo"
                      value={formData.memo}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00C853] resize-none"
                    />
                  </div>
                )}

                <div className="md:col-span-2 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-[#00C853] hover:bg-emerald-400 text-[#050E0C] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#00C853]/20 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <span className="w-5 h-5 border-2 border-[#050E0C] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5" /> Save Record
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-950/20 flex items-center justify-center text-[#00C853]">
                  <ArrowRight className="w-8 h-8" />
                </div>
                <div className="max-w-xs">
                  <p className="text-white font-bold">Select a Provider</p>
                  <p className="text-gray-500 text-sm">Please choose a payment provider template from the dropdown above to start creating your record.</p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Live Preview Section */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#00C853]" /> Live Preview
            </h3>

            <div className="bg-[#020706] rounded-3xl p-6 border border-emerald-950/30 shadow-2xl relative overflow-hidden group">
              {/* Fake Mobile Status Bar */}
              <div className="flex justify-between items-center text-[10px] text-gray-600 font-mono mb-8 px-2">
                <span>9:41 AM</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-2 border border-gray-700 rounded-sm" />
                  <div className="w-3 h-2 border border-gray-700 rounded-sm bg-gray-700" />
                </div>
              </div>

              {selectedProvider ? (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                  <div className="text-center space-y-4">
                    <div 
                      className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-black shadow-2xl"
                      style={{ backgroundColor: selectedProvider.color_hex || '#00C853' }}
                    >
                      {selectedProvider.name.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-white text-lg font-bold">{selectedProvider.name}</h4>
                      <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Transfer Receipt</p>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="text-4xl font-display font-black text-white tracking-tight">
                      {formData.amount?.toLocaleString('en-US', { style: 'currency', currency: formData.currency || 'USD' })}
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${formData.status === 'completed' ? 'bg-[#00C853]/10 text-[#00C853]' : 
                        formData.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}
                    `}>
                      {formData.status}
                    </div>
                  </div>

                  <div className="space-y-4 bg-emerald-950/5 p-4 rounded-2xl border border-emerald-950/20">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">To</span>
                      <span className="text-sm text-white font-medium">{formData.recipient_name || '---'}</span>
                    </div>
                    {formData.recipient_identifier && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Identifier</span>
                        <span className="text-[11px] text-[#00C853] font-mono">{formData.recipient_identifier}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Date</span>
                      <span className="text-xs text-white">{formData.transaction_date} at {formData.transaction_time}</span>
                    </div>
                    {formData.reference_no && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Ref No</span>
                        <span className="text-[11px] text-gray-400 font-mono">{formData.reference_no}</span>
                      </div>
                    )}
                  </div>

                  {formData.memo && (
                    <div className="space-y-2 px-2">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Note</span>
                      <p className="text-xs text-gray-400 italic">"{formData.memo}"</p>
                    </div>
                  )}

                  <div className="pt-8 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-gray-600 uppercase font-mono mb-4">
                      <Shield className="w-3 h-3" />
                      <span>Certified Personal Record</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center text-center opacity-30 grayscale">
                   <div className="w-16 h-16 rounded-full bg-emerald-950/40 flex items-center justify-center mb-4">
                    <ReceiptIcon className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-mono">STANDBY_FOR_INPUT</p>
                </div>
              )}

              {/* Decorative Scanlines */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
            </div>

            <div className="p-4 bg-[#00C853]/5 border border-[#00C853]/10 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#00C853] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                This tool is for personal record-keeping only. Always ensure your transaction data matches your official bank or provider statement. Generated receipts are digital representations of your input data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
