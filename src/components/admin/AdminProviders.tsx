import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit3, Trash2, Check, X, Shield, Coins, CreditCard, Building, 
  Settings, ToggleLeft, ToggleRight, Sparkles, Sliders, Layers
} from 'lucide-react';
import { adminService, DynamicProvider } from '../../services/adminService';
import { ProviderField } from '../../data/paymentProviders';

export function AdminProviders() {
  const [providers, setProviders] = useState<DynamicProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<DynamicProvider | null>(null);

  // Form state for creating/editing provider
  const [provName, setProvName] = useState('');
  const [provCategory, setProvCategory] = useState<'crypto' | 'wallet' | 'bank'>('crypto');
  const [provBg, setProvBg] = useState('bg-brand-card');
  const [provAccent, setProvAccent] = useState('#00C853');
  const [provHeaderBg, setProvHeaderBg] = useState('bg-brand-accent');
  const [provHeaderText, setProvHeaderText] = useState('text-brand-text');
  const [provTagline, setProvTagline] = useState('OFFICIAL REGISTERED CLEARING');
  
  // Custom Fields list state
  const [provFields, setProvFields] = useState<ProviderField[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'date' | 'time' | 'select'>('text');
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');
  const [newFieldOptionsString, setNewFieldOptionsString] = useState('');

  useEffect(() => {
    setProviders(adminService.getProviders());
  }, []);

  const handleSelectProvider = (prov: DynamicProvider) => {
    setSelectedProvider(prov);
    setProvName(prov.name);
    setProvCategory(prov.category);
    setProvBg(prov.theme.bg);
    setProvAccent(prov.theme.accent);
    setProvHeaderBg(prov.theme.headerBg);
    setProvHeaderText(prov.theme.headerText);
    setProvTagline(prov.theme.tagline);
    setProvFields(prov.fields);
  };

  const handleAddCustomField = () => {
    if (!newFieldName.trim() || !newFieldLabel.trim()) return;
    
    const newField: ProviderField = {
      name: newFieldName.trim().replace(/\s+/g, '_').toLowerCase(),
      label: newFieldLabel.trim(),
      type: newFieldType,
      placeholder: newFieldPlaceholder.trim() || undefined,
      options: newFieldType === 'select' ? newFieldOptionsString.split(',').map(s => s.trim()).filter(Boolean) : undefined
    };

    setProvFields([...provFields, newField]);
    setNewFieldName('');
    setNewFieldLabel('');
    setNewFieldPlaceholder('');
    setNewFieldOptionsString('');
  };

  const handleRemoveField = (index: number) => {
    setProvFields(provFields.filter((_, i) => i !== index));
  };

  const handleSaveProvider = () => {
    if (!provName.trim()) return;

    if (selectedProvider) {
      // Edit mode
      adminService.updateProvider(selectedProvider.id, {
        name: provName,
        category: provCategory,
        theme: {
          bg: provBg,
          accent: provAccent,
          accentText: `text-[${provAccent}]`,
          headerBg: provHeaderBg,
          headerText: provHeaderText,
          tagline: provTagline,
          logoColor: `text-[${provAccent}]`
        },
        fields: provFields
      });
    } else {
      // Create mode
      adminService.addProvider({
        name: provName,
        category: provCategory,
        enabled: true,
        theme: {
          bg: provBg,
          accent: provAccent,
          accentText: `text-[${provAccent}]`,
          headerBg: provHeaderBg,
          headerText: provHeaderText,
          tagline: provTagline,
          logoColor: `text-[${provAccent}]`
        },
        fields: provFields
      });
    }

    setProviders(adminService.getProviders());
    setSelectedProvider(null);
    resetForm();
  };

  const handleToggleEnabled = (id: string, currentlyEnabled: boolean) => {
    adminService.updateProvider(id, { enabled: !currentlyEnabled });
    setProviders(adminService.getProviders());
  };

  const handleDeleteProvider = (id: string) => {
    if (window.confirm('Are you sure you want to delete this provider layout config permanently?')) {
      adminService.deleteProvider(id);
      setProviders(adminService.getProviders());
      setSelectedProvider(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setProvName('');
    setProvCategory('crypto');
    setProvBg('bg-brand-card');
    setProvAccent('#00C853');
    setProvHeaderBg('bg-brand-accent');
    setProvHeaderText('text-brand-text');
    setProvTagline('OFFICIAL TRANSMISSION COMPLIANCE RECORD');
    setProvFields([]);
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left column: Providers list with enable/disable switches */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 bg-brand-bg border-b border-brand-border flex justify-between items-center">
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider font-mono">
                Custom Provider Registry
              </h3>
              <button
                onClick={() => {
                  setSelectedProvider(null);
                  resetForm();
                }}
                className="text-[10px] bg-brand-accent hover:bg-emerald-400 text-brand-bg px-2 py-1 rounded uppercase font-bold"
              >
                + ADD
              </button>
            </div>

            <div className="overflow-y-auto max-h-[450px] divide-y divide-[#16362F]/40">
              {providers.map((p) => {
                const categoryIcon = p.category === 'crypto' ? <Coins className="w-4 h-4 text-brand-accent" /> : p.category === 'wallet' ? <CreditCard className="w-4 h-4 text-blue-400" /> : <Building className="w-4 h-4 text-amber-500" />;
                const isSelected = selectedProvider?.id === p.id;
                
                return (
                  <div 
                    key={p.id} 
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors
                      ${isSelected ? 'bg-brand-bg' : 'hover:bg-brand-bg/10'}
                    `}
                    onClick={() => handleSelectProvider(p)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {categoryIcon}
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-brand-text block truncate">{p.name}</span>
                        <span className="text-[9px] text-brand-text-dim font-mono block uppercase">{p.category} • {p.fields.length} parameters</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleEnabled(p.id, p.enabled);
                        }}
                        className="text-brand-text-muted hover:text-brand-text"
                        title={p.enabled ? 'Disable Provider' : 'Enable Provider'}
                      >
                        {p.enabled ? (
                          <ToggleRight className="w-5 h-5 text-brand-accent" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProvider(p.id);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="p-4 bg-brand-bg/30 border-t border-brand-border text-[10px] text-brand-text-dim italic">
            * Changes are immediately compiled and synced with the active customer dashboards and receipt generators.
          </div>
        </div>

        {/* Right column: Form to Create/Edit Layout, Fields, Themes, Brand Logos */}
        <div className="lg:col-span-3 bg-brand-card p-5 rounded-2xl border border-brand-border shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-2">
            <Sliders className="w-4 h-4 text-brand-accent" />
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider font-mono">
              {selectedProvider ? `Edit Layout: ${selectedProvider.name}` : 'Provision Custom Provider'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-brand-text-muted uppercase tracking-wider">Provider/Brand Name</label>
              <input
                type="text"
                value={provName}
                onChange={(e) => setProvName(e.target.value)}
                placeholder="e.g. Stripe, Revolut"
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-2.5 py-2 text-brand-text focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-brand-text-muted uppercase tracking-wider">Gateway Category</label>
              <select
                value={provCategory}
                onChange={(e) => setProvCategory(e.target.value as any)}
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-2 py-2 text-brand-text focus:outline-none"
              >
                <option value="crypto">Crypto & Cold Nodes</option>
                <option value="wallet">Digital Wallets & PSPs</option>
                <option value="bank">Traditional Banking Institutes</option>
              </select>
            </div>
          </div>

          {/* THEME & BRAND CONFIGURATOR */}
          <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border/50 space-y-3">
            <h4 className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Layout Theme & Typography
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[9px] text-brand-text-dim uppercase">Container background</label>
                <select
                  value={provBg}
                  onChange={(e) => setProvBg(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text"
                >
                  <option value="bg-brand-card">Standard Dark</option>
                  <option value="bg-[#12161A]">Binance Slate Dark</option>
                  <option value="bg-[#161311]">MetaMask Ochre Dark</option>
                  <option value="bg-[#0f1115]">Classic Terminal Jet</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-brand-text-dim uppercase">Brand Header color</label>
                <select
                  value={provHeaderBg}
                  onChange={(e) => setProvHeaderBg(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text"
                >
                  <option value="bg-[#0052FF]">Coinbase Blue</option>
                  <option value="bg-[#00D632]">Cash App Green</option>
                  <option value="bg-[#003087]">PayPal Deep Blue</option>
                  <option value="bg-[#7414CA]">Zelle Amethyst</option>
                  <option value="bg-gray-900">Charcoal Dark</option>
                  <option value="bg-[#1E3E26]">Wise Forest Green</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-brand-text-dim uppercase">Accent HEX color</label>
                <input
                  type="text"
                  value={provAccent}
                  onChange={(e) => setProvAccent(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded px-2 py-1 text-brand-text"
                  placeholder="#00C853"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs font-mono">
              <label className="text-[9px] text-brand-text-dim uppercase block">Compliance Tagline (Renders on Receipt Header)</label>
              <input
                type="text"
                value={provTagline}
                onChange={(e) => setProvTagline(e.target.value)}
                placeholder="e.g. SECURE SETTLEMENT LEDGER"
                className="w-full bg-brand-bg border border-brand-border rounded px-2.5 py-1.5 text-brand-text"
              />
            </div>
          </div>

          {/* DYNAMIC FIELDS TEMPLATE CONFIGURATOR */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider font-mono flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-400" /> Fields Builder
            </h4>

            {/* List current field items */}
            <div className="flex flex-wrap gap-2">
              {provFields.map((f, idx) => (
                <div key={idx} className="bg-black/40 border border-brand-border px-2 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-mono">
                  <span className="text-brand-text-muted font-bold">{f.label}</span>
                  <span className="text-gray-600">({f.type})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveField(idx)}
                    className="text-red-400 hover:text-brand-text"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Form to append a new field structure */}
            <div className="bg-brand-bg/30 p-3 rounded-xl border border-brand-border/40 space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="name_id"
                  className="bg-brand-bg border border-brand-border rounded p-1.5 text-brand-text text-[11px]"
                />
                <input
                  type="text"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="Field Label"
                  className="bg-brand-bg border border-brand-border rounded p-1.5 text-brand-text text-[11px]"
                />
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as any)}
                  className="bg-brand-bg border border-brand-border rounded p-1.5 text-brand-text text-[11px]"
                >
                  <option value="text">Text Input</option>
                  <option value="number">Numeric</option>
                  <option value="date">Date</option>
                  <option value="time">Time</option>
                  <option value="select">Select Dropdown</option>
                </select>
                <input
                  type="text"
                  value={newFieldPlaceholder}
                  onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                  placeholder="Placeholder hint"
                  className="bg-brand-bg border border-brand-border rounded p-1.5 text-brand-text text-[11px]"
                />
              </div>

              {newFieldType === 'select' && (
                <div className="space-y-1">
                  <label className="text-[9px] text-brand-text-dim">Dropdown options (comma separated list)</label>
                  <input
                    type="text"
                    value={newFieldOptionsString}
                    onChange={(e) => setNewFieldOptionsString(e.target.value)}
                    placeholder="Completed, Pending, Failed"
                    className="w-full bg-brand-bg border border-brand-border rounded p-1.5 text-brand-text text-[11px]"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleAddCustomField}
                className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 text-blue-400 hover:text-brand-text rounded text-[10px] font-bold uppercase transition-all"
              >
                + Append Field Template
              </button>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-brand-border/40">
            <button
              onClick={handleSaveProvider}
              className="px-4 py-2 bg-brand-accent hover:bg-emerald-400 text-brand-bg font-bold text-xs rounded-xl uppercase shadow-lg transition-all cursor-pointer"
            >
              Commit Provider Layout
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
