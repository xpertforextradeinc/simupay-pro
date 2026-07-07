import React from 'react';
import { Receipt } from '../types';

interface ReceiptTemplateProps {
  provider: string;
  data: Record<string, any>;
}

export function ReceiptTemplate({ provider, data }: ReceiptTemplateProps) {
  // Simple provider-based styling simulation
  const providerColors: Record<string, string> = {
    'Coinbase': 'bg-blue-600',
    'Binance': 'bg-yellow-500',
    'Cash App': 'bg-green-500',
    'PayPal': 'bg-blue-700',
    'Zelle': 'bg-purple-600',
  };

  const bgColor = providerColors[provider] || 'bg-gray-800';

  return (
    <div className="bg-white text-gray-900 p-8 rounded-2xl shadow-xl max-w-md mx-auto">
      <div className={`${bgColor} text-brand-text p-4 rounded-t-xl text-center font-bold text-lg`}>
        {provider} Receipt
      </div>
      <div className="p-6 space-y-4">
        <div className="text-center">
          <p className="text-sm text-brand-text-dim">Amount</p>
          <h2 className="text-4xl font-bold">${parseFloat(data.amount || '0').toLocaleString()}</h2>
        </div>
        
        <div className="border-t pt-4 space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-sm text-brand-text-dim capitalize">{key}</span>
              <span className="text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
