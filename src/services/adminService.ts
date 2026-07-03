import { cryptoProviders, digitalWalletProviders, bankProviders, ProviderCategory, ProviderField } from '../data/paymentProviders';

export interface DynamicProvider {
  id: string;
  name: string;
  category: 'crypto' | 'wallet' | 'bank';
  enabled: boolean;
  theme: {
    bg: string;
    accent: string;
    accentText: string;
    headerBg: string;
    headerText: string;
    tagline: string;
    logoColor: string;
  };
  fields: ProviderField[];
}

export interface FreePlanConfig {
  dailyLimit: number;
  monthlyLimit: number;
  availableOnFree: string[]; // List of provider names/IDs
  availableOnPremium: string[]; // List of provider names/IDs
  upgradeMessage: string;
}

export interface SystemSettings {
  appName: string;
  logo: string;
  theme: 'emerald' | 'sapphire' | 'dark' | 'light';
  contactEmail: string;
  supportInfo: string;
  maintenanceMode: boolean;
  defaultUserBalance: number;
  sessionTimeout: number; // in minutes
  securityOptions: {
    twoFactorRequired: boolean;
    ipWhitelisting: boolean;
    failedAttemptsLimit: number;
  };
  discordInviteLink?: string;
  telegramSupportLink?: string;
  telegramChannelLink?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'Monthly' | 'Quarterly' | 'Annual' | 'Lifetime';
  trialPeriodDays: number;
  description: string;
  enabled: boolean;
}

// ----------------- Default Seed Values -----------------
const DEFAULT_PROVIDERS: DynamicProvider[] = [
  {
    id: 'coinbase',
    name: 'Coinbase',
    category: 'crypto',
    enabled: true,
    theme: {
      bg: 'bg-white',
      accent: '#0052FF',
      accentText: 'text-[#0052FF]',
      headerBg: 'bg-[#0052FF]',
      headerText: 'text-white',
      tagline: 'COINBASE COMPLIANCE TRANSACTION',
      logoColor: 'text-[#0052FF]'
    },
    fields: [
      { name: 'network', label: 'Network', type: 'text', placeholder: 'e.g. TRON (TRC-20)' },
      { name: 'crypto', label: 'Cryptocurrency', type: 'text', placeholder: 'USDT' },
      { name: 'address', label: 'Wallet Address', type: 'text', placeholder: 'Enter address...' },
      { name: 'amount', label: 'Amount ($ USD)', type: 'number', placeholder: '0.00' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'time', label: 'Time', type: 'time' },
      { name: 'reference', label: 'Transaction Reference', type: 'text', placeholder: 'Enter reference...' },
      { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Completed', 'Failed'] }
    ]
  },
  {
    id: 'binance',
    name: 'Binance',
    category: 'crypto',
    enabled: true,
    theme: {
      bg: 'bg-[#12161A]',
      accent: '#F0B90B',
      accentText: 'text-[#F0B90B]',
      headerBg: 'bg-[#1E2329]',
      headerText: 'text-[#F0B90B]',
      tagline: 'BINANCE OFFICIAL LEDGER AUDIT',
      logoColor: 'text-[#F0B90B]'
    },
    fields: [
      { name: 'network', label: 'Network', type: 'text', placeholder: 'e.g. BSC (BEP-20)' },
      { name: 'crypto', label: 'Cryptocurrency', type: 'text', placeholder: 'BNB' },
      { name: 'address', label: 'Wallet Address', type: 'text', placeholder: 'Enter address...' },
      { name: 'amount', label: 'Amount ($ USD)', type: 'number', placeholder: '0.00' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'time', label: 'Time', type: 'time' },
      { name: 'reference', label: 'Transaction Reference', type: 'text', placeholder: 'Enter reference...' },
      { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Completed', 'Failed'] }
    ]
  },
  {
    id: 'cash-app',
    name: 'Cash App',
    category: 'wallet',
    enabled: true,
    theme: {
      bg: 'bg-white',
      accent: '#00D632',
      accentText: 'text-[#00D632]',
      headerBg: 'bg-[#00D632]',
      headerText: 'text-white',
      tagline: 'CASH APP SETTLEMENT RECEIPT',
      logoColor: 'text-[#00D632]'
    },
    fields: [
      { name: 'cashtag', label: 'Recipient Cashtag', type: 'text', placeholder: '$RecipientTag' },
      { name: 'email', label: 'Recipient Email', type: 'text', placeholder: 'e.g. client@domain.com' },
      { name: 'amount', label: 'Amount ($ USD)', type: 'number', placeholder: '0.00' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'time', label: 'Time', type: 'time' },
      { name: 'reference', label: 'Transaction Reference', type: 'text', placeholder: 'Enter reference...' },
      { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Completed', 'Failed'] }
    ]
  },
  {
    id: 'paypal',
    name: 'PayPal',
    category: 'wallet',
    enabled: true,
    theme: {
      bg: 'bg-white',
      accent: '#003087',
      accentText: 'text-[#003087]',
      headerBg: 'bg-[#003087]',
      headerText: 'text-white',
      tagline: 'PAYPAL OFFICIAL INVOICE TRANSACTION',
      logoColor: 'text-[#003087]'
    },
    fields: [
      { name: 'email', label: 'Recipient Email', type: 'text', placeholder: 'e.g. client@domain.com' },
      { name: 'amount', label: 'Amount ($ USD)', type: 'number', placeholder: '0.00' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'time', label: 'Time', type: 'time' },
      { name: 'reference', label: 'Transaction Reference', type: 'text', placeholder: 'Enter reference...' },
      { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Completed', 'Failed'] }
    ]
  },
  {
    id: 'chase',
    name: 'Chase',
    category: 'bank',
    enabled: true,
    theme: {
      bg: 'bg-white',
      accent: '#111827',
      accentText: 'text-gray-900',
      headerBg: 'bg-gray-900',
      headerText: 'text-white',
      tagline: 'CHASE BANK OFFICIAL RECORD',
      logoColor: 'text-gray-800'
    },
    fields: [
      { name: 'accountHolder', label: 'Account Holder', type: 'text', placeholder: 'John Doe' },
      { name: 'accountNumber', label: 'Account Number', type: 'text', placeholder: '**** 1234' },
      { name: 'routingNumber', label: 'Routing Number', type: 'text', placeholder: '9-digit Routing' },
      { name: 'amount', label: 'Amount ($ USD)', type: 'number', placeholder: '0.00' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'time', label: 'Time', type: 'time' },
      { name: 'reference', label: 'Transaction Reference', type: 'text', placeholder: 'Enter reference...' },
      { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Completed', 'Failed'] }
    ]
  }
];

// Combine standard static ones so they are fully available as dynamic fallbacks
const ALL_SEED_PROVIDERS: DynamicProvider[] = [...DEFAULT_PROVIDERS];

// Push the remaining cryptoProviders
cryptoProviders.forEach(p => {
  if (!ALL_SEED_PROVIDERS.some(x => x.name.toLowerCase() === p.toLowerCase())) {
    ALL_SEED_PROVIDERS.push({
      id: p.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: p,
      category: 'crypto',
      enabled: true,
      theme: {
        bg: 'bg-[#12161A]',
        accent: '#00C853',
        accentText: 'text-[#00C853]',
        headerBg: 'bg-[#091714]',
        headerText: 'text-white',
        tagline: `${p.toUpperCase()} CRYPTO CLEARING NODE`,
        logoColor: 'text-[#00C853]'
      },
      fields: [
        { name: 'network', label: 'Network', type: 'text', placeholder: 'e.g. TRC20, ERC20' },
        { name: 'crypto', label: 'Cryptocurrency', type: 'text', placeholder: 'e.g. USDT, BTC' },
        { name: 'address', label: 'Wallet Address', type: 'text', placeholder: 'Enter address...' },
        { name: 'amount', label: 'Amount ($ USD)', type: 'number', placeholder: '0.00' },
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'time', label: 'Time', type: 'time' },
        { name: 'reference', label: 'Transaction Reference', type: 'text', placeholder: 'Enter reference...' },
        { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Completed', 'Failed'] }
      ]
    });
  }
});

// Push the remaining digitalWalletProviders
digitalWalletProviders.forEach(p => {
  if (!ALL_SEED_PROVIDERS.some(x => x.name.toLowerCase() === p.toLowerCase())) {
    ALL_SEED_PROVIDERS.push({
      id: p.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: p,
      category: 'wallet',
      enabled: true,
      theme: {
        bg: 'bg-white',
        accent: '#00C853',
        accentText: 'text-[#00C853]',
        headerBg: 'bg-emerald-950',
        headerText: 'text-[#00C853]',
        tagline: `${p.toUpperCase()} DIRECT TRANSIT AUDIT`,
        logoColor: 'text-[#00C853]'
      },
      fields: [
        { name: 'email', label: 'Recipient Email', type: 'text', placeholder: 'client@domain.com' },
        { name: 'amount', label: 'Amount ($ USD)', type: 'number', placeholder: '0.00' },
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'time', label: 'Time', type: 'time' },
        { name: 'reference', label: 'Transaction Reference', type: 'text', placeholder: 'Enter reference...' },
        { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Completed', 'Failed'] }
      ]
    });
  }
});

// Push the remaining bankProviders
bankProviders.forEach(p => {
  if (!ALL_SEED_PROVIDERS.some(x => x.name.toLowerCase() === p.toLowerCase())) {
    ALL_SEED_PROVIDERS.push({
      id: p.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: p,
      category: 'bank',
      enabled: true,
      theme: {
        bg: 'bg-white',
        accent: '#1F2937',
        accentText: 'text-gray-900',
        headerBg: 'bg-slate-900',
        headerText: 'text-white',
        tagline: `${p.toUpperCase()} CLEARING GATEWAY`,
        logoColor: 'text-slate-800'
      },
      fields: [
        { name: 'accountHolder', label: 'Account Holder', type: 'text', placeholder: 'Enter full name...' },
        { name: 'accountNumber', label: 'Account Number', type: 'text', placeholder: '**** 1234' },
        { name: 'routingNumber', label: 'Routing Number', type: 'text', placeholder: '9-digit Routing' },
        { name: 'amount', label: 'Amount ($ USD)', type: 'number', placeholder: '0.00' },
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'time', label: 'Time', type: 'time' },
        { name: 'reference', label: 'Transaction Reference', type: 'text', placeholder: 'Enter reference...' },
        { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Completed', 'Failed'] }
      ]
    });
  }
});

const DEFAULT_FREE_CONFIG: FreePlanConfig = {
  dailyLimit: 5,
  monthlyLimit: 100,
  availableOnFree: ['coinbase', 'cash-app', 'chase'],
  availableOnPremium: ALL_SEED_PROVIDERS.map(p => p.id),
  upgradeMessage: 'Upgrade to Premium for unlimited receipt generation, advanced financial tools, and high-fidelity custom formats.'
};

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  appName: 'SimuPay Pro',
  logo: 'SP',
  theme: 'emerald',
  contactEmail: 'admin@simupay.pro',
  supportInfo: '24/7 Priority Financial Desk',
  maintenanceMode: false,
  defaultUserBalance: 5000.00,
  sessionTimeout: 30,
  securityOptions: {
    twoFactorRequired: false,
    ipWhitelisting: false,
    failedAttemptsLimit: 5
  },
  discordInviteLink: 'https://discord.gg/S4RpdYnCR',
  telegramSupportLink: 'https://t.me/slipmintsignals',
  telegramChannelLink: 'https://t.me/slipmintsignals'
};

const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-basic',
    name: 'Starter Monthly',
    price: 30000,
    billingCycle: 'Monthly',
    trialPeriodDays: 7,
    description: 'Perfect for regular users needing basic receipts logs.',
    enabled: true
  },
  {
    id: 'plan-pro',
    name: 'SimuPay Pro Quarterly',
    price: 75000,
    billingCycle: 'Quarterly',
    trialPeriodDays: 14,
    description: 'High limit compliance builder and flash transfer options.',
    enabled: true
  },
  {
    id: 'plan-annual',
    name: 'Enterprise Corporate',
    price: 250000,
    billingCycle: 'Annual',
    trialPeriodDays: 30,
    description: 'Unrestricted enterprise scale reporting, automated logs, and priority node clearing.',
    enabled: true
  },
  {
    id: 'plan-lifetime',
    name: 'Infinity Access',
    price: 999000,
    billingCycle: 'Lifetime',
    trialPeriodDays: 0,
    description: 'Infinite standard and enterprise keys, absolute system sovereignty.',
    enabled: true
  }
];

// ----------------- Core Service Methods -----------------
export const adminService = {
  // Providers Management
  getProviders: (): DynamicProvider[] => {
    try {
      const stored = localStorage.getItem('spp_dynamic_providers');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading dynamic providers', e);
    }
    localStorage.setItem('spp_dynamic_providers', JSON.stringify(ALL_SEED_PROVIDERS));
    return ALL_SEED_PROVIDERS;
  },

  saveProviders: (providers: DynamicProvider[]) => {
    localStorage.setItem('spp_dynamic_providers', JSON.stringify(providers));
  },

  addProvider: (provider: Omit<DynamicProvider, 'id'>): DynamicProvider => {
    const list = adminService.getProviders();
    const newProvider: DynamicProvider = {
      ...provider,
      id: 'custom-' + provider.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000)
    };
    list.push(newProvider);
    adminService.saveProviders(list);
    return newProvider;
  },

  updateProvider: (id: string, updated: Partial<DynamicProvider>) => {
    const list = adminService.getProviders();
    const index = list.findIndex(p => p.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updated };
      adminService.saveProviders(list);
    }
  },

  deleteProvider: (id: string) => {
    const list = adminService.getProviders();
    const filtered = list.filter(p => p.id !== id);
    adminService.saveProviders(filtered);
  },

  // Free Plan Config
  getFreeConfig: (): FreePlanConfig => {
    try {
      const stored = localStorage.getItem('spp_free_config');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    localStorage.setItem('spp_free_config', JSON.stringify(DEFAULT_FREE_CONFIG));
    return DEFAULT_FREE_CONFIG;
  },

  saveFreeConfig: (config: FreePlanConfig) => {
    localStorage.setItem('spp_free_config', JSON.stringify(config));
  },

  // System Settings
  getSystemSettings: (): SystemSettings => {
    try {
      const stored = localStorage.getItem('spp_system_settings');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    localStorage.setItem('spp_system_settings', JSON.stringify(DEFAULT_SYSTEM_SETTINGS));
    return DEFAULT_SYSTEM_SETTINGS;
  },

  saveSystemSettings: (settings: SystemSettings) => {
    localStorage.setItem('spp_system_settings', JSON.stringify(settings));
  },

  // Custom Subscription Plans
  getPlans: (): SubscriptionPlan[] => {
    try {
      const stored = localStorage.getItem('spp_plans_config');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    localStorage.setItem('spp_plans_config', JSON.stringify(DEFAULT_SUBSCRIPTION_PLANS));
    return DEFAULT_SUBSCRIPTION_PLANS;
  },

  savePlans: (plans: SubscriptionPlan[]) => {
    localStorage.setItem('spp_plans_config', JSON.stringify(plans));
  },

  addPlan: (plan: Omit<SubscriptionPlan, 'id'>): SubscriptionPlan => {
    const list = adminService.getPlans();
    const newPlan: SubscriptionPlan = {
      ...plan,
      id: 'plan-' + Math.floor(1000 + Math.random() * 9000)
    };
    list.push(newPlan);
    adminService.savePlans(list);
    return newPlan;
  },

  updatePlan: (id: string, updated: Partial<SubscriptionPlan>) => {
    const list = adminService.getPlans();
    const index = list.findIndex(p => p.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updated };
      adminService.savePlans(list);
    }
  },

  deletePlan: (id: string) => {
    const list = adminService.getPlans();
    const filtered = list.filter(p => p.id !== id);
    adminService.savePlans(filtered);
  },

  // Broadcast Notification Helper
  broadcastNotification: async (targetGroup: 'all' | 'premium' | 'free' | 'selected', message: string, selectedUserId?: string): Promise<number> => {
    // Return mock number of notified users
    return targetGroup === 'all' ? 42 : targetGroup === 'premium' ? 18 : targetGroup === 'free' ? 24 : 1;
  },

  // Dynamic Audit logs generator for Security logs tab
  getAuditLogs: () => {
    return [
      { id: '1', action: 'admin_login', detail: 'Administrator authenticated securely from IP 185.190.140.21', timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString() },
      { id: '2', action: 'config_update', detail: 'Daily Free limits modified to 5 sessions per calendar day.', timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
      { id: '3', action: 'user_suspension', detail: 'Suspended user account usr_9281a for policy violations.', timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString() },
      { id: '4', action: 'provider_added', detail: 'Created custom provider layout for Stripe Connect.', timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString() },
      { id: '5', action: 'db_maintenance', detail: 'Triggered global DB connection pool optimization. 0 failed queries.', timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString() }
    ];
  },

  getFailedLogins: () => {
    return [
      { id: '1', email: 'guest_user@hotmail.com', reason: 'Invalid password credential sequence', timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), ip: '82.16.14.99' },
      { id: '2', email: 'unknown_admin@simupay.pro', reason: 'Bypassed MFA code timeout', timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), ip: '41.190.3.11' }
    ];
  },

  // ----------------- AI Copilot Integration Hooks -----------------
  
  // Future: The AI Copilot will call this to search users via function calling
  searchUsers: async (query: string) => {
    console.log(`[AI Copilot] Executing searchUsers with query: ${query}`);
    // Simulated structured data for UI. Later: supabase.from('profiles').select('*').ilike('email', `%${query}%`)
    return [
      { id: 'usr-1', email: 'john.doe@example.com', role: 'user', status: 'active', balance: 4500, created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString() },
      { id: 'usr-2', email: 'jane.smith@example.com', role: 'user', status: 'active', balance: 12500, created_at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString() },
      { id: 'usr-3', email: 'admin@simupay.pro', role: 'admin', status: 'active', balance: 0, created_at: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString() }
    ].filter(u => !query || u.email.toLowerCase().includes(query.toLowerCase()) || u.id.includes(query));
  },

  // Future: The AI Copilot will call this to search transactions
  searchTransactions: async (query: string) => {
    console.log(`[AI Copilot] Executing searchTransactions with query: ${query}`);
    // Simulated structured data for UI. Later: supabase.from('transactions').select('*')
    return [
      { id: 'tx-1', userId: 'usr-1', amount: 1500, status: 'completed', network: 'TRC20', date: new Date().toISOString() },
      { id: 'tx-2', userId: 'usr-2', amount: 50000, status: 'pending', network: 'ERC20', date: new Date().toISOString() }
    ].filter(t => !query || t.id.includes(query) || t.network.toLowerCase().includes(query.toLowerCase()));
  },

  // Future: Analyze platform statistics
  getPlatformStatistics: async () => {
    console.log(`[AI Copilot] Executing getPlatformStatistics`);
    return {
      totalUsers: 1254,
      activeUsers24h: 342,
      totalVolume: 4500000,
      successRate: 98.5
    };
  },

  // Future: Subscription metrics
  getSubscriptionSummary: async () => {
    console.log(`[AI Copilot] Executing getSubscriptionSummary`);
    return {
      activeSubscriptions: 850,
      mrr: 154000, // Monthly recurring revenue
      churnRate: 1.2,
      planBreakdown: {
        basic: 400,
        pro: 300,
        enterprise: 150
      }
    };
  },

  // Future: Recent activity logs
  getRecentActivity: async (limit: number = 5) => {
    console.log(`[AI Copilot] Executing getRecentActivity with limit: ${limit}`);
    return [
      { id: 'act-1', type: 'user_signup', user: 'new_user@example.com', timestamp: new Date(Date.now() - 5000).toISOString() },
      { id: 'act-2', type: 'large_transaction', amount: 150000, user: 'whale@example.com', timestamp: new Date(Date.now() - 15000).toISOString() },
      { id: 'act-3', type: 'subscription_upgrade', user: 'john.doe@example.com', plan: 'pro', timestamp: new Date(Date.now() - 60000).toISOString() }
    ].slice(0, limit);
  },

  // Future: High-level dashboard metrics
  getDashboardMetrics: async () => {
    console.log(`[AI Copilot] Executing getDashboardMetrics`);
    return {
      revenueGrowth: 15.4, // %
      userGrowth: 8.2, // %
      systemHealth: 'Optimal',
      openSupportTickets: 12
    };
  }
};
