export const cryptoProviders = [
  'Coinbase', 'Binance', 'Crypto.com', 'Bybit', 'Kraken', 'OKX', 'KuCoin', 'Bitget', 'Gate.io', 'MEXC', 'Gemini', 'Bitstamp', 'HTX', 'Uphold', 'Blockchain.com', 'Exodus', 'Trust Wallet', 'MetaMask', 'Phantom', 'Ledger', 'Trezor', 'SafePal', 'Atomic Wallet', 'Coinomi', 'Guarda', 'Rabby', 'Rainbow'
];

export const digitalWalletProviders = [
  'Cash App', 'PayPal', 'Venmo', 'Zelle', 'Apple Pay', 'Google Pay', 'Chime', 'Wise', 'Skrill', 'Neteller', 'Strike'
];

export const bankProviders = [
  'Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'U.S. Bank', 'PNC', 'Capital One', 'Truist', 'TD Bank', 'Ally', 'SoFi', 'Fifth Third', 'Regions', 'Huntington', 'Citizens', 'KeyBank', 'Comerica', 'M&T', 'BMO', 'First Horizon', 'Popular', 'Santander', 'BancorpSouth', 'Synovus', 'Valley National', 'Frost Bank', 'City National', 'East West', 'IberiaBank', 'Signature Bank', 'Associated Bank', 'BOK Financial', 'Commerce Bank', 'Texas Capital', 'Pacific Premier', 'Western Alliance', 'Webster Bank', 'Wintrust', 'First Citizens', 'New York Community', 'Flagstar', 'Old National', 'Valley', 'Columbia', 'Umpqua', 'United Bank', 'Renasant', 'Banc of California', 'Home BancShares', 'Cadence', 'First National', 'TowneBank', 'SouthState', 'Fulton', 'Prosperity', 'WesBanco', 'First Financial', 'Atlantic Union', 'Simmons', 'Trustmark', 'Community Bank', 'Washington Federal', 'Hancock Whitney', 'UMB Financial', 'Cathay', 'Mechanics Bank', 'Glacier Bancorp', 'Heritage', 'Brookline', 'ConnectOne', 'Customers Bancorp', 'Hope Bancorp', 'International Bancshares', 'Meta Financial', 'ServisFirst', 'TriState Capital', 'Veritex', 'Axos Financial', 'East West'
];

export type ProviderCategory = 'crypto' | 'wallet' | 'bank';

export interface ProviderField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'time' | 'select';
  placeholder?: string;
  options?: string[];
}

export const getFieldsForProvider = (category: ProviderCategory, provider: string): ProviderField[] => {
  const baseFields: ProviderField[] = [
    { name: 'amount', label: 'Amount ($ USD)', type: 'number', placeholder: '0.00' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'time', label: 'Time', type: 'time' },
    { name: 'reference', label: 'Transaction Reference', type: 'text', placeholder: 'Enter reference...' },
    { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Completed', 'Failed'] }
  ];

  if (category === 'crypto') {
    return [
      { name: 'network', label: 'Network', type: 'text', placeholder: 'e.g. TRC20, ERC20...' },
      { name: 'crypto', label: 'Cryptocurrency', type: 'text', placeholder: 'e.g. USDT, BTC...' },
      { name: 'address', label: 'Wallet Address', type: 'text', placeholder: 'Enter address...' },
      ...baseFields
    ];
  } else if (category === 'wallet') {
    if (provider === 'Cash App') {
      return [{ name: 'cashtag', label: 'Cashtag', type: 'text', placeholder: '$Cashtag' }, { name: 'email', label: 'Recipient Email', type: 'text' }, ...baseFields];
    }
    if (provider === 'Zelle') {
      return [{ name: 'name', label: 'Recipient Name', type: 'text' }, { name: 'email', label: 'Recipient Email', type: 'text' }, ...baseFields];
    }
    return [{ name: 'email', label: 'Recipient Email', type: 'text' }, ...baseFields];
  } else {
    // Bank
    return [
      { name: 'accountHolder', label: 'Account Holder', type: 'text' },
      { name: 'accountNumber', label: 'Account Number', type: 'text' },
      { name: 'routingNumber', label: 'Routing Number', type: 'text' },
      ...baseFields
    ];
  }
};
