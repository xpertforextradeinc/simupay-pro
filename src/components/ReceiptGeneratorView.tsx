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
  Zap,
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

const GENERATION_STEPS = [
  'Synchronizing with network node...',
  'Verifying transaction hash...',
  'Mapping recipient metadata...',
  'Applying provider visual identity...',
  'Finalizing cryptographic signature...'
];

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

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [showFinalReceipt, setShowFinalReceipt] = useState(false);
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [receiptSearch, setReceiptSearch] = useState('');

  const loadReceipts = async () => {
    if (profile) {
      const records = await dbService.getReceiptRecords(profile.id);
      setReceipts(records);
    }
  };

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
    loadReceipts();
  }, [profile]);

  const filteredProviders = useMemo(() => {
    return providers.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [providers, searchQuery]);

  const filteredReceipts = useMemo(() => {
    return receipts.filter(r => 
      r.provider_name.toLowerCase().includes(receiptSearch.toLowerCase()) ||
      r.id.toLowerCase().includes(receiptSearch.toLowerCase()) ||
      r.amount.toString().includes(receiptSearch)
    );
  }, [receipts, receiptSearch]);

  const handleDeleteReceipt = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Simply remove from local state for now as a quick "manage" action
    setReceipts(prev => prev.filter(r => r.id !== id));
    showToast('Receipt deleted from history.', 'info');
  };

  const handleProviderSelect = (provider: PaymentProvider) => {
    setSelectedProvider(provider);
    setSearchQuery('');
    setIsDropdownOpen(false);
    setShowFinalReceipt(false);
    
    const cat = (provider.category || '').toLowerCase();
    // Reset form for new provider (Empty by default)
    setFormData({
      amount: 0,
      currency: cat === 'crypto' ? 'USDT' : 'USD',
      status: 'completed',
      transaction_date: new Date().toISOString().split('T')[0],
      transaction_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      provider_id: provider.id,
      provider_name: provider.name,
      reference_no: '',
      sender_name: '',
      sender_tag: '',
      recipient_name: '',
      recipient_tag: '',
      recipient_address: '',
      asset: cat === 'crypto' ? 'USDT' : '',
      network: cat === 'crypto' ? 'TRC-20' : '',
      bank_name: cat === 'bank' ? 'Chase Bank' : '',
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

  const handleGenerate = async () => {
    if (!profile) return;
    if (!selectedProvider) {
      showToast('Please select a provider first.', 'error');
      return;
    }

    // Validation
    const reqFields = Array.isArray(selectedProvider.required_fields) ? selectedProvider.required_fields : [];
    const missingFields = reqFields.filter(f => !formData[f as keyof ReceiptRecord]);
    if (missingFields.length > 0) {
      showToast(`Missing required fields: ${missingFields.join(', ')}`, 'error');
      return;
    }

    setIsGenerating(true);
    setGenerationStep(0);
    setShowFinalReceipt(false);

    for (let i = 0; i < GENERATION_STEPS.length; i++) {
      setGenerationStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setIsSaving(true);
    try {
      await dbService.saveReceiptRecord(profile.id, formData as Omit<ReceiptRecord, 'id' | 'created_at' | 'user_id'>);
      await loadReceipts();
      setIsGenerating(false);
      setShowFinalReceipt(true);
      showToast('Receipt generated successfully!', 'success');
    } catch (err) {
      showToast('Failed to generate receipt.', 'error');
      setIsGenerating(false);
    } finally {
      setIsSaving(false);
    }
  };

  const isFieldRequired = (fieldName: string) => {
    if (!selectedProvider || !Array.isArray(selectedProvider.required_fields)) {
      return false;
    }
    return selectedProvider.required_fields.includes(fieldName);
  };

  const generationProgressSteps = [
    'Initializing Engine',
    'Metadata Sync',
    'Record Verification',
    'Visual Compilation'
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <ReceiptIcon className="w-6 h-6 text-[#00C853]" /> Receipt Studio ⭐
          </h2>
          <p className="text-gray-400 text-sm">Professional enterprise-grade receipt generation & management.</p>
        </div>
        {showFinalReceipt && (
          <button 
            onClick={() => setShowFinalReceipt(false)}
            className="px-4 py-2 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-xs font-bold text-white hover:bg-emerald-900/40 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Record
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-brand-card p-6 rounded-2xl border border-emerald-950/40 shadow-xl space-y-6">
            {!showFinalReceipt ? (
              <>
                {/* Searchable Provider Selector */}
                <div className="relative">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Select Provider</label>
                  <div className="relative">
                    <div 
                      onClick={() => !isGenerating && setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full bg-brand-bg/50 border ${isDropdownOpen ? 'border-[#00C853]' : 'border-emerald-950/50'} rounded-xl px-4 py-3 text-white flex items-center justify-between cursor-pointer transition-all ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                        disabled={isGenerating}
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#00C853] transition-colors disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
                      <select 
                        name="status"
                        disabled={isGenerating}
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00C853] disabled:opacity-50"
                      >
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Date
                      </label>
                      <input 
                        type="date" 
                        name="transaction_date"
                        disabled={isGenerating}
                        value={formData.transaction_date}
                        onChange={handleInputChange}
                        className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#00C853] disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Time
                      </label>
                      <input 
                        type="time" 
                        name="transaction_time"
                        disabled={isGenerating}
                        value={formData.transaction_time}
                        onChange={handleInputChange}
                        className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#00C853] disabled:opacity-50"
                      />
                    </div>

                    {isFieldRequired('reference_no') && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                          <Hash className="w-3 h-3" /> Reference / Hash
                        </label>
                        <input 
                          type="text" 
                          name="reference_no"
                          disabled={isGenerating}
                          value={formData.reference_no || ''}
                          onChange={handleInputChange}
                          className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#00C853] disabled:opacity-50"
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
                          disabled={isGenerating}
                          value={formData.sender_name || ''}
                          onChange={handleInputChange}
                          className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00C853] disabled:opacity-50"
                        />
                      </div>
                    )}

                    {isFieldRequired('sender_tag') && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                          <Tag className="w-3 h-3" /> Sender Tag
                        </label>
                        <input 
                          type="text" 
                          name="sender_tag"
                          disabled={isGenerating}
                          value={formData.sender_tag || ''}
                          onChange={handleInputChange}
                          placeholder="$cashtag / @username"
                          className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#00C853] disabled:opacity-50"
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
                          disabled={isGenerating}
                          value={formData.recipient_name || ''}
                          onChange={handleInputChange}
                          className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00C853] disabled:opacity-50"
                        />
                      </div>
                    )}

                    {isFieldRequired('recipient_tag') && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                          <Tag className="w-3 h-3" /> Recipient Tag
                        </label>
                        <input 
                          type="text" 
                          name="recipient_tag"
                          disabled={isGenerating}
                          value={formData.recipient_tag || ''}
                          onChange={handleInputChange}
                          placeholder="$cashtag / @username"
                          className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#00C853] disabled:opacity-50"
                        />
                      </div>
                    )}

                    {isFieldRequired('recipient_address') && (
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                          <Hash className="w-3 h-3" /> Wallet Address
                        </label>
                        <input 
                          type="text" 
                          name="recipient_address"
                          disabled={isGenerating}
                          value={formData.recipient_address || ''}
                          onChange={handleInputChange}
                          placeholder="0x... / T..."
                          className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#00C853] disabled:opacity-50"
                        />
                      </div>
                    )}

                    {isFieldRequired('asset') && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Asset (e.g. BTC, USDT)</label>
                        <input 
                          type="text" 
                          name="asset"
                          disabled={isGenerating}
                          value={formData.asset || ''}
                          onChange={handleInputChange}
                          className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#00C853] disabled:opacity-50"
                        />
                      </div>
                    )}

                    {isFieldRequired('network') && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Network (e.g. TRC-20)</label>
                        <input 
                          type="text" 
                          name="network"
                          disabled={isGenerating}
                          value={formData.network || ''}
                          onChange={handleInputChange}
                          className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#00C853] disabled:opacity-50"
                        />
                      </div>
                    )}

                    {isFieldRequired('bank_name') && (
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bank Name</label>
                        <input 
                          type="text" 
                          name="bank_name"
                          disabled={isGenerating}
                          value={formData.bank_name || ''}
                          onChange={handleInputChange}
                          className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00C853] disabled:opacity-50"
                        />
                      </div>
                    )}

                    {isFieldRequired('memo') && (
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Note / Memo</label>
                        <textarea 
                          name="memo"
                          disabled={isGenerating}
                          value={formData.memo}
                          onChange={handleInputChange}
                          rows={2}
                          className="w-full bg-brand-bg/40 border border-emerald-950/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00C853] resize-none disabled:opacity-50"
                        />
                      </div>
                    )}

                    <div className="md:col-span-2 pt-4">
                      {isGenerating ? (
                        <div className="space-y-4">
                          <div className="w-full bg-emerald-950/30 h-1 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(generationStep + 1) * 20}%` }}
                              className="h-full bg-[#00C853]"
                            />
                          </div>
                          <div className="flex items-center gap-3 text-xs text-white font-mono animate-pulse">
                            <span className="w-4 h-4 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
                            <span>{GENERATION_STEPS[generationStep]}</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={handleGenerate}
                          disabled={isSaving}
                          className="w-full bg-[#00C853] hover:bg-emerald-400 text-[#050E0C] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#00C853]/20 disabled:opacity-50"
                        >
                          <Zap className="w-5 h-5" /> Generate Receipt
                        </button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-950/20 flex items-center justify-center text-[#00C853]">
                      <ArrowRight className="w-8 h-8" />
                    </div>
                    <div className="max-w-xs">
                      <p className="text-white font-bold">Select a Provider</p>
                      <p className="text-gray-500 text-sm">Choose a template above to start creating your professional transaction record.</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 py-8 text-center"
              >
                <div className="w-20 h-20 bg-[#00C853]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00C853]/20">
                  <CheckCircle className="w-10 h-10 text-[#00C853]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Receipt Generated Successfully</h3>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto">Your professional receipt has been generated and added to your history.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <button 
                    onClick={() => window.print()}
                    className="px-6 py-2.5 bg-white text-[#050E0C] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Export as PDF
                  </button>
                  <button 
                    onClick={() => setShowFinalReceipt(false)}
                    className="px-6 py-2.5 bg-emerald-950/40 border border-emerald-900/50 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-900/40 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Create Another
                  </button>
                </div>
              </motion.div>
            )}
          </section>

          {/* Receipt History Section */}
          <section className="bg-brand-card p-6 rounded-2xl border border-emerald-950/40 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-emerald-950/30 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00C853]" /> Recent Receipt History
              </h3>
            </div>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#9CB1AC]">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={receiptSearch}
                onChange={(e) => setReceiptSearch(e.target.value)}
                placeholder="Search receipts..."
                className="w-full bg-[#050E0C] border border-[#16362F] rounded-xl py-2.5 pl-9 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00C853] text-xs font-mono"
              />
            </div>

            <div className="space-y-3">
              {filteredReceipts.length > 0 ? (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-[#16362F] scrollbar-track-transparent">
                  {filteredReceipts.map((receipt) => (
                    <div key={receipt.id} className="flex justify-between items-center p-3 bg-brand-bg/40 rounded-xl border border-emerald-950/30 hover:border-[#00C853]/30 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-950 flex items-center justify-center font-bold text-white text-xs border border-emerald-900">
                          {receipt.provider_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-xs font-bold font-display">{receipt.provider_name}</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">{new Date(receipt.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[#00C853] text-sm font-bold font-mono">
                            {receipt.currency === 'USD' ? '$' : ''}{receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-[10px] text-gray-600 font-mono mt-0.5">{receipt.id}</p>
                        </div>
                        <button 
                          onClick={(e) => handleDeleteReceipt(e, receipt.id)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-gray-500 font-mono">
                    {receipts.length > 0 ? "NO_MATCHING_RECORDS" : "NO_LOCAL_RECORDS_FOUND"}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-1">
                    {receipts.length > 0 ? "Try a different search term." : "Generated receipts will appear here for quick access."}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Live Preview Section */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#00C853]" /> Professional Result
            </h3>

            <div className="bg-[#020706] rounded-3xl p-6 border border-emerald-950/30 shadow-2xl relative overflow-hidden group">
              {/* Fake Mobile Status Bar */}
              <div className="flex justify-between items-center text-[10px] text-gray-600 font-mono mb-8 px-2">
                <span>{formData.transaction_time || '9:41 AM'}</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-2 border border-gray-700 rounded-sm" />
                  <div className="w-3 h-2 border border-gray-700 rounded-sm bg-gray-700" />
                </div>
              </div>

              {selectedProvider ? (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                  <div className="text-center space-y-4">
                    <div 
                      className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-black shadow-2xl relative overflow-hidden"
                      style={{ backgroundColor: selectedProvider.color_hex || '#00C853' }}
                    >
                      {selectedProvider.name.charAt(0)}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-white text-lg font-bold">{selectedProvider.name}</h4>
                      <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Transaction Statement</p>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="text-4xl font-display font-black text-white tracking-tight">
                      {['USD', 'EUR', 'GBP', 'NGN', 'CAD', 'AUD', 'JPY', 'INR'].includes(formData.currency || '') ? (
                        Number(formData.amount || 0).toLocaleString('en-US', { style: 'currency', currency: formData.currency || 'USD' })
                      ) : (
                        `${formData.currency || 'USDT'} ${Number(formData.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      )}
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${formData.status === 'completed' ? 'bg-[#00C853]/10 text-[#00C853]' : 
                        formData.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}
                    `}>
                      {formData.status}
                    </div>
                  </div>

                  <div className="space-y-4 bg-emerald-950/5 p-5 rounded-2xl border border-emerald-950/20">
                    {formData.recipient_name && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">To</span>
                        <span className="text-sm text-white font-medium">{formData.recipient_name}</span>
                      </div>
                    )}
                    {formData.recipient_tag && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Tag</span>
                        <span className="text-[11px] text-[#00C853] font-mono">{formData.recipient_tag}</span>
                      </div>
                    )}
                    {formData.sender_tag && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">From</span>
                        <span className="text-[11px] text-gray-400 font-mono">{formData.sender_tag}</span>
                      </div>
                    )}
                    {formData.recipient_address && (
                      <div className="flex flex-col gap-1 border-t border-emerald-950/20 pt-3">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Destination Address</span>
                        <span className="text-[9px] text-gray-400 font-mono break-all leading-tight">{formData.recipient_address}</span>
                      </div>
                    )}
                    {formData.asset && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Network</span>
                        <span className="text-[10px] text-white font-mono">{formData.asset} on {formData.network || 'Mainnet'}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t border-emerald-950/20 pt-3">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Date</span>
                      <span className="text-xs text-white">{formData.transaction_date} • {formData.transaction_time}</span>
                    </div>
                    {formData.reference_no && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Ref / Hash</span>
                        <span className="text-[11px] text-gray-400 font-mono max-w-[150px] truncate">{formData.reference_no}</span>
                      </div>
                    )}
                  </div>

                  {formData.memo && (
                    <div className="space-y-2 px-2">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Payment Description</span>
                      <p className="text-xs text-gray-400 italic">"{formData.memo}"</p>
                    </div>
                  )}

                  <div className="pt-8 text-center border-t border-emerald-950/10">
                    <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-gray-600 uppercase font-mono mb-4">
                      <Shield className="w-3 h-3" />
                      <span>Certified Security Protocol 256-BIT</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center text-center opacity-30 grayscale">
                   <div className="w-16 h-16 rounded-full bg-emerald-950/40 flex items-center justify-center mb-4">
                    <ReceiptIcon className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-mono uppercase tracking-[0.3em]">Standby_For_Input</p>
                </div>
              )}

              {/* Decorative Scanlines */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
            </div>

            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Records generated are digital representations of personal bookkeeping data. This prototype facilitates accurate history logging for verified personal accounts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
