export interface Profile {
  id: string;
  email: string;
  full_name: string;
  username?: string;
  country?: string;
  phone?: string;
  wallet_balance: number;
  activation_key: string | null;
  license_active: boolean;
  license_type?: 'Standard' | 'Enterprise';
  expiry_date?: string;
  subscription_status?: 'Active' | 'Expired' | 'N/A';
  avatar_url?: string;
  email_alerts?: boolean;
  mempool_clear?: boolean;
  role?: 'admin' | 'user';
  created_at: string;
  last_login?: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  address: string;
  network: string;
  balance: number;
  created_at: string;
}

export interface ActivationKey {
  id: string;
  activation_key: string;
  license_type: 'Standard' | 'Enterprise';
  status: 'unused' | 'active' | 'expired';
  assigned_user: string | null;
  activated_at: string | null;
  expires_at: string | null;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet: string;
  network: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  tx_hash: string;
  created_at: string;
}

export interface Receipt {
  id: string;
  transaction_id: string;
  reference_number: string;
  amount: number;
  network: string;
  wallet: string;
  status: 'pending' | 'completed' | 'failed';
  barcode: string;
  qr_code: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  read: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  email: string;
  plan_name: string;
  plan_code?: string;
  amount: number;
  billing_cycle: 'Monthly' | 'Quarterly' | 'Annual' | 'Lifetime';
  payment_reference?: string;
  status: 'active' | 'expired' | 'canceled';
  started_at: string;
  expires_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: 'login' | 'logout' | 'registration' | 'activation' | 'transfers' | 'receipt generation' | 'profile updates' | 'settings update' | 'support';
  details: string;
  ip_address?: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved' | 'pending';
  created_at: string;
}

export interface PaymentProvider {
  id: string;
  name: string;
  category: 'Electronic' | 'Crypto' | 'Bank';
  logo_url?: string;
  color_hex?: string;
  required_fields: string[]; // e.g., ['amount', 'recipient_name', 'note']
  metadata?: Record<string, any>;
  is_active: boolean;
}

export interface ReceiptRecord {
  id: string;
  user_id: string;
  provider_id: string;
  provider_name: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  transaction_date: string;
  transaction_time: string;
  reference_no?: string;
  sender_name?: string;
  sender_tag?: string; // e.g. $cashtag
  recipient_name?: string;
  recipient_tag?: string; // e.g. $cashtag
  recipient_address?: string; // Crypto wallet address
  asset?: string; // BTC, ETH, USDT
  network?: string; // TRC20, ERC20
  bank_name?: string; // For Zelle/Bank transfers
  memo?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'account'
  | 'wallet'
  | 'activation'
  | 'flash-transfer'
  | 'forex-tools'
  | 'receipt-generator'
  | 'transactions'
  | 'analytics'
  | 'sms-center'
  | 'notifications'
  | 'orders'
  | 'support'
  | 'settings'
  | 'db-setup'
  | 'subscription'
  | 'admin-panel'
  | 'resources';
