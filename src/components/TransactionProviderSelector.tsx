import React, { useMemo } from 'react';
import { ProviderCategory } from '../data/paymentProviders';
import { adminService } from '../services/adminService';

interface Props {
  category: ProviderCategory;
  provider: string;
  setCategory: (c: ProviderCategory) => void;
  setProvider: (p: string) => void;
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
}

export const TransactionProviderSelector: React.FC<Props> = ({ 
  category, provider, setCategory, setProvider, formData, setFormData 
}) => {
  
  const providersList = useMemo(() => {
    return adminService.getProviders().filter(p => p.enabled && p.category === category);
  }, [category]);

  const fields = useMemo(() => {
    const matched = providersList.find(p => p.name === provider);
    return matched ? matched.fields : [];
  }, [providersList, provider]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-[#9CB1AC] uppercase tracking-wider">Category</label>
          <select 
            value={category} 
            onChange={(e) => { 
              setCategory(e.target.value as ProviderCategory);
              setProvider('');
            }}
            className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 text-brand-text focus:outline-none focus:border-brand-accent text-sm"
          >
            <option value="crypto">Crypto/Wallet Provider</option>
            <option value="wallet">Digital Payment Service</option>
            <option value="bank">Bank</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-[#9CB1AC] uppercase tracking-wider">Provider</label>
          <select 
            value={provider} 
            onChange={(e) => setProvider(e.target.value)}
            className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 text-brand-text focus:outline-none focus:border-brand-accent text-sm"
          >
            <option value="">Select Provider</option>
            {providersList.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {provider && fields.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 bg-brand-bg/40 rounded-xl border border-brand-border/40 animate-in fade-in duration-300">
          {fields.map(field => (
            <div key={field.name} className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9CB1AC] uppercase tracking-wider">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 text-brand-text focus:outline-none focus:border-brand-accent text-sm"
                >
                  <option value="">Select Option</option>
                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 text-brand-text placeholder-gray-600 focus:outline-none focus:border-brand-accent text-sm font-mono"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

