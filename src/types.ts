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
  plan_name: string;
  status: 'active' | 'expired' | 'canceled';
  amount: number;
  billing_cycle: 'Monthly' | 'Annual' | 'Lifetime';
  current_period_start: string;
  current_period_end: string;
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

export type ActiveTab =
  | 'dashboard'
  | 'account'
  | 'wallet'
  | 'activation'
  | 'flash-transfer'
  | 'receipt-generator'
  | 'transactions'
  | 'analytics'
  | 'sms-center'
  | 'notifications'
  | 'orders'
  | 'support'
  | 'settings'
  | 'db-setup';
