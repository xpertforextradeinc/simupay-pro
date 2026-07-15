import { supabase } from '../supabase';
import {
  Profile,
  Wallet,
  ActivationKey,
  Transaction,
  Receipt,
  AppNotification,
  Subscription,
  ActivityLog,
  SupportTicket,
  PaymentProvider,
  ReceiptRecord,
  Product,
  ProductCategory,
  ProductOrder,
  OrderItem,
  ProductDownload,
  Coupon,
  ProductReview,
  VTUProvider,
  VTUNetwork,
  VTUDataPlan
} from '../types';

// ============================================================================
// LOCAL STORAGE STORAGE FALLBACK UTILITIES
// ============================================================================

const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const setLocalStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving localStorage key: ${key}`, e);
  }
};

// Seed baseline activation keys if they do not exist
const seedActivationKeys = (userId?: string): ActivationKey[] => {
  return [
    {
      id: 'key-1',
      activation_key: 'SPP-TRIAL-KEY-2026',
      license_type: 'Standard',
      status: 'unused',
      assigned_user: userId || null,
      activated_at: null,
      expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'key-2',
      activation_key: 'SPP-ADMIN-UNLIMITED-2026',
      license_type: 'Enterprise',
      status: 'unused',
      assigned_user: null,
      activated_at: null,
      expires_at: null
    }
  ];
};

// Seed starting wallets
const seedWallets = (userId: string): Wallet[] => {
  const cleanHex = userId.replace(/[^a-f0-9]/gi, '').padEnd(40, 'f');
  const cleanBase58 = userId.replace(/[^a-zA-Z0-9]/gi, '').padEnd(34, 'X');
  
  const btcAddress = `bc1q${cleanHex.substring(0, 38)}`;
  const ethAddress = `0x${cleanHex.substring(0, 40)}`;
  const usdtTrcAddress = `T${cleanBase58.substring(0, 33)}`;
  const usdtBepAddress = `0x${cleanHex.split('').reverse().join('').substring(0, 40)}`;

  return [
    {
      id: 'w-1',
      user_id: userId,
      name: 'TRON Vault Node',
      address: usdtTrcAddress,
      network: 'USDT (TRC20)',
      balance: 19250.00,
      created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'w-2',
      user_id: userId,
      name: 'Ethereum Custody Bridge',
      address: ethAddress,
      network: 'USDT (ERC20)',
      balance: 8750.00,
      created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'w-3',
      user_id: userId,
      name: 'BNB Smart Yield',
      address: usdtBepAddress,
      network: 'USDT (BEP20)',
      balance: 3500.00,
      created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'w-4',
      user_id: userId,
      name: 'Bitcoin Cold Safe',
      address: btcAddress,
      network: 'BTC (Bitcoin)',
      balance: 3500.00,
      created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
    }
  ];
};

// ============================================================================
// SYSTEM DATABASE SERVICE
// ============================================================================
export const dbService = {

  // 0. HEALTH AND INITIALIZATION CHECKS
  checkDatabaseInitialized: async (): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        // Postgres error code 42P01 is "undefined_table"
        if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation "public.profiles" does not exist')) {
          console.warn('[Db Check] profiles table does not exist. DB setup required.');
          return false;
        }
      }
      return true;
    } catch (e) {
      console.warn('[Db Check] Error checking database status, falling back to local simulation:', e);
      return false;
    }
  },

  // 1. PROFILES OPERATIONS
  getProfile: async (userId: string, email?: string, fullName?: string): Promise<Profile> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        let profile = data as Profile;
        // Record last login if it exists
        if (!data.last_login) {
          const nowStr = new Date().toISOString();
          await supabase.from('profiles').update({ last_login: nowStr }).eq('id', userId);
          data.last_login = nowStr;
        }
        return profile;
      } else {
        // User not found in remote DB. Create a new default profile.
        console.log('[Auth Flow] Creating new user profile in Supabase profiles table for', userId);
        const resolvedEmail = email || 'merchant@simupay.pro';
        const generateKey = () => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
          return `SPP-${segment()}-${segment()}-${segment()}`;
        };

        const newProfile: Profile = {
          id: userId,
          email: resolvedEmail,
          full_name: fullName || 'SimuPay Pro Merchant',
          wallet_balance: 35000.00,
          activation_key: generateKey(),
          license_active: false,
          license_type: 'Standard',
          expiry_date: undefined,
          subscription_status: 'N/A',
          avatar_url: '',
          email_alerts: true,
          mempool_clear: false,
          role: 'user',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        };

        try {
           const { data: insertedData, error: insertError } = await supabase
             .from('profiles')
             .insert([newProfile])
             .select()
             .maybeSingle();

           if (!insertError && insertedData) {
             console.log('[Auth Flow] New profile successfully created in Supabase.');
             return insertedData as Profile;
           } else {
             console.warn('[Auth Flow] Insert failed, falling back to local storage', insertError);
           }
        } catch(err) {
           console.warn('[Auth Flow] Could not insert profile to Supabase', err);
        }
      }
    } catch (e) {
      console.warn('Supabase profiles retrieval failed, returning localStorage fallback.', e);
    }

    // Fallback profile management
    const localProfiles = getLocalStorageItem<Record<string, Profile>>('spp_profiles', {});
    if (localProfiles[userId]) {
      const existing = localProfiles[userId];
      return existing;
    }

    const generateFallbackKey = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      return `SPP-${segment()}-${segment()}-${segment()}`;
    };

    const resolvedEmail = email || 'merchant@simupay.pro';
    const defaultProfile: Profile = {
      id: userId,
      email: resolvedEmail,
      full_name: fullName || 'SimuPay Pro Merchant',
      wallet_balance: 35000.00,
      activation_key: generateFallbackKey(),
      license_active: false,
      license_type: 'Standard',
      expiry_date: undefined,
      subscription_status: 'N/A',
      avatar_url: '',
      email_alerts: true,
      mempool_clear: false,
      role: 'user',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };

    localProfiles[userId] = defaultProfile;
    setLocalStorageItem('spp_profiles', localProfiles);
    return defaultProfile;
  },

  updateProfile: async (userId: string, fields: Partial<Profile>): Promise<Profile> => {
    // Try Supabase
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(fields)
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (data) {
        await dbService.logActivity(userId, 'profile updates', `Updated profile parameters: ${Object.keys(fields).join(', ')}`);
        return data as Profile;
      }
    } catch (e) {
      console.warn('Supabase profiles update failed, persisting locally.', e);
    }

    // LocalStorage Fallback
    const localProfiles = getLocalStorageItem<Record<string, Profile>>('spp_profiles', {});
    const current = localProfiles[userId] || { id: userId } as Profile;
    const updated = { ...current, ...fields };
    localProfiles[userId] = updated;
    setLocalStorageItem('spp_profiles', localProfiles);

    await dbService.logActivity(userId, 'profile updates', `Updated local profile parameters: ${Object.keys(fields).join(', ')}`);
    return updated;
  },

  // 2. WALLET OPERATIONS
  getWallets: async (userId: string): Promise<Wallet[]> => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      if (data && data.length > 0) return data as Wallet[];
    } catch (e) {
      console.warn('Supabase wallets fetch failed, returning local storage wallets.', e);
    }

    const localWallets = getLocalStorageItem<Wallet[]>('spp_wallets', []);
    const userWallets = localWallets.filter(w => w.user_id === userId);
    
    if (userWallets.length === 0) {
      const seeded = seedWallets(userId);
      const updatedAll = [...localWallets, ...seeded];
      setLocalStorageItem('spp_wallets', updatedAll);
      return seeded;
    }
    return userWallets;
  },

  updateWalletBalance: async (userId: string, address: string, network: string, amount: number): Promise<void> => {
    try {
      const { data: wallets } = await supabase.from('wallets').select('*').eq('user_id', userId).eq('address', address);
      if (wallets && wallets.length > 0) {
        const wallet = wallets[0];
        const newBalance = Math.max(0, wallet.balance + amount);
        await supabase.from('wallets').update({ balance: newBalance }).eq('id', wallet.id);
        return;
      }
    } catch (e) {
      console.warn('Supabase wallet balance update failed, executing locally.', e);
    }

    const localWallets = getLocalStorageItem<Wallet[]>('spp_wallets', []);
    const updatedWallets = localWallets.map(w => {
      if (w.user_id === userId && w.address.toLowerCase() === address.toLowerCase()) {
        return { ...w, balance: Math.max(0, w.balance + amount) };
      }
      return w;
    });
    setLocalStorageItem('spp_wallets', updatedWallets);
  },

  // 3. ACTIVATION KEY OPERATIONS
  getActivationKeys: async (userId: string): Promise<ActivationKey[]> => {
    try {
      const { data, error } = await supabase
        .from('activation_keys')
        .select('*');

      if (error) throw error;
      if (data && data.length > 0) return data as ActivationKey[];
    } catch (e) {
      console.warn('Supabase activation keys query failed, reading locally.', e);
    }

    const localKeys = getLocalStorageItem<ActivationKey[]>('spp_activation_keys', []);
    if (localKeys.length === 0) {
      const seeded = seedActivationKeys(userId);
      setLocalStorageItem('spp_activation_keys', seeded);
      return seeded;
    }
    return localKeys;
  },

  activateLicenseKey: async (userId: string, keyString: string): Promise<{ success: boolean; licenseType?: 'Standard' | 'Enterprise'; message: string }> => {
    const formattedKey = keyString.trim();

    // 1. Try Supabase
    try {
      const { data: keys, error } = await supabase
        .from('activation_keys')
        .select('*')
        .eq('activation_key', formattedKey);

      if (!error && keys && keys.length > 0) {
        const keyObj = keys[0] as ActivationKey;
        if (keyObj.status === 'active' || keyObj.status === 'expired') {
          return { success: false, message: 'This activation key is already utilized or expired.' };
        }

        // Get user profile email
        const profile = await dbService.getProfile(userId);
        const userEmail = profile?.email || 'merchant@simupay.pro';

        // Update key status to active
        await supabase
          .from('activation_keys')
          .update({
            status: 'active',
            assigned_user: userId,
            activated_at: new Date().toISOString()
          })
          .eq('id', keyObj.id);

        // Update profile
        await supabase
          .from('profiles')
          .update({
            license_active: true,
            license_type: keyObj.license_type,
            subscription_status: 'Active',
            expiry_date: keyObj.expires_at || undefined
          })
          .eq('id', userId);

        // Add subscription record
        await dbService.createSubscription(userId, userEmail, `${keyObj.license_type} License`, undefined, 999, keyObj.license_type === 'Standard' ? 'Annual' : 'Lifetime');
        await dbService.logActivity(userId, 'activation', `Activated ${keyObj.license_type} License with validation key: ${formattedKey}`);
        await dbService.createNotification(userId, 'License Key Activated', `Congratulations! Your account license has been upgraded to ${keyObj.license_type} Unlimited.`, 'success');

        return { success: true, licenseType: keyObj.license_type, message: 'License key successfully validated!' };
      }
    } catch (e) {
      console.warn('Supabase key activation query failed, processing with local fallback.', e);
    }

    // 2. Local Fallback
    const localKeys = getLocalStorageItem<ActivationKey[]>('spp_activation_keys', []);
    const matchingKeyIndex = localKeys.findIndex(k => k.activation_key.toUpperCase() === formattedKey.toUpperCase());

    if (matchingKeyIndex !== -1) {
      const matchedKey = localKeys[matchingKeyIndex];
      if (matchedKey.status !== 'unused') {
        return { success: false, message: 'This key has already been activated in a different session.' };
      }

      // Mark key as active
      matchedKey.status = 'active';
      matchedKey.assigned_user = userId;
      matchedKey.activated_at = new Date().toISOString();
      localKeys[matchingKeyIndex] = matchedKey;
      setLocalStorageItem('spp_activation_keys', localKeys);

      // Update profile locally
      const localProfiles = getLocalStorageItem<Record<string, Profile>>('spp_profiles', {});
      let userEmail = 'merchant@simupay.pro';
      if (localProfiles[userId]) {
        localProfiles[userId].license_active = true;
        localProfiles[userId].license_type = matchedKey.license_type;
        localProfiles[userId].subscription_status = 'Active';
        localProfiles[userId].expiry_date = matchedKey.expires_at || undefined;
        userEmail = localProfiles[userId].email || 'merchant@simupay.pro';
        setLocalStorageItem('spp_profiles', localProfiles);
      }

      // Add subscription and notifications
      await dbService.createSubscription(userId, userEmail, `${matchedKey.license_type} License`, undefined, 999, matchedKey.license_type === 'Standard' ? 'Annual' : 'Lifetime');
      await dbService.logActivity(userId, 'activation', `Activated local license key ${formattedKey} type: ${matchedKey.license_type}`);
      await dbService.createNotification(userId, 'License Key Activated', `Congratulations! Your account license has been upgraded to ${matchedKey.license_type} Unlimited.`, 'success');

      return { success: true, licenseType: matchedKey.license_type, message: 'License key validated and activated locally!' };
    }

    // Admin override check
    if (formattedKey === 'SPP-ADMIN-UNLIMITED-2026') {
      const localProfiles = getLocalStorageItem<Record<string, Profile>>('spp_profiles', {});
      let userEmail = 'merchant@simupay.pro';
      if (localProfiles[userId]) {
        localProfiles[userId].license_active = true;
        localProfiles[userId].license_type = 'Enterprise';
        localProfiles[userId].subscription_status = 'Active';
        userEmail = localProfiles[userId].email || 'merchant@simupay.pro';
        setLocalStorageItem('spp_profiles', localProfiles);
      }

      await dbService.createSubscription(userId, userEmail, 'Enterprise License (Admin Bypass)', undefined, 0, 'Lifetime');
      await dbService.logActivity(userId, 'activation', `Bypassed license using administrative master code: ${formattedKey}`);
      await dbService.createNotification(userId, 'Admin License Unlocked', 'Administrative master key accepted. All premium portals unlocked.', 'success');

      return { success: true, licenseType: 'Enterprise', message: 'Administrative master code accepted!' };
    }

    return { success: false, message: 'Invalid activation key. Please contact support or request a sandbox code.' };
  },

  // 4. TRANSACTION OPERATIONS
  getTransactions: async (userId: string): Promise<Transaction[]> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) return data as Transaction[];
    } catch (e) {
      console.warn('Supabase transactions list failed, fetching local transactions.', e);
    }

    const localTx = getLocalStorageItem<Transaction[]>('spp_transactions', []);
    return localTx.filter(t => t.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  createTransaction: async (userId: string, txData: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<Transaction> => {
    const transactionId = `SPP-TX-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const newTx: Transaction = {
      ...txData,
      id: transactionId,
      user_id: userId,
      created_at: new Date().toISOString()
    };

    // Try Supabase first
    try {
      const { error } = await supabase.from('transactions').insert([newTx]);
      if (!error) {
        // Also deduct balance in profiles
        const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).maybeSingle();
        if (profile) {
          const newBalance = profile.wallet_balance + txData.amount;
          await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', userId);
        }
        
        // Dynamic balance update for relevant wallet
        await dbService.updateWalletBalance(userId, txData.wallet, txData.network, txData.amount);

        // Generate matching receipt
        await dbService.createReceipt(transactionId, txData.amount, txData.network, txData.wallet, txData.status);

        // Log action and notify
        await dbService.logActivity(userId, 'transfers', `Initiated asset transfer of ${txData.amount} via ${txData.network} to ${txData.wallet}`);
        await dbService.createNotification(
          userId, 
          txData.amount < 0 ? 'Asset Dispatched Successfully' : 'Deposit Confirmed',
          `Dispatched $${Math.abs(txData.amount).toLocaleString()} ${txData.network} securely to address ${txData.wallet.substring(0, 10)}...`,
          txData.amount < 0 ? 'info' : 'success'
        );

        return newTx;
      }
    } catch (e) {
      console.warn('Supabase transaction insert failed, falling back to local simulation.', e);
    }

    // LocalStorage Fallback
    const localTx = getLocalStorageItem<Transaction[]>('spp_transactions', []);
    localTx.unshift(newTx);
    setLocalStorageItem('spp_transactions', localTx);

    // Deduct profile balance locally
    const localProfiles = getLocalStorageItem<Record<string, Profile>>('spp_profiles', {});
    if (localProfiles[userId]) {
      localProfiles[userId].wallet_balance = Math.max(0, localProfiles[userId].wallet_balance + txData.amount);
      setLocalStorageItem('spp_profiles', localProfiles);
    }

    // Update wallet balance locally
    await dbService.updateWalletBalance(userId, txData.wallet, txData.network, txData.amount);

    // Create a local receipt
    await dbService.createReceipt(transactionId, txData.amount, txData.network, txData.wallet, txData.status);

    await dbService.logActivity(userId, 'transfers', `Created local transfer simulation of ${txData.amount} via ${txData.network}`);
    await dbService.createNotification(
      userId, 
      txData.amount < 0 ? 'Asset Dispatched Locally' : 'Local Deposit Completed',
      `Transferred $${Math.abs(txData.amount).toLocaleString()} ${txData.network} locally to recipient ${txData.wallet.substring(0, 10)}...`,
      txData.amount < 0 ? 'info' : 'success'
    );

    return newTx;
  },

  // 5. RECEIPT OPERATIONS
  getReceipts: async (): Promise<Receipt[]> => {
    try {
      const { data, error } = await supabase.from('receipts').select('*');
      if (!error && data && data.length > 0) return data as Receipt[];
    } catch (e) {
      console.warn('Supabase receipts query failed, querying locally.', e);
    }

    return getLocalStorageItem<Receipt[]>('spp_receipts', []);
  },

  createReceipt: async (transactionId: string, amount: number, network: string, wallet: string, status: 'pending' | 'completed' | 'failed'): Promise<Receipt> => {
    const referenceNumber = `REF-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const barcode = `BAR-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const qr_code = `QR-${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const newReceipt: Receipt = {
      id: `RCP-${Math.floor(100000 + Math.random() * 900000)}`,
      transaction_id: transactionId,
      reference_number: referenceNumber,
      amount,
      network,
      wallet,
      status,
      barcode,
      qr_code,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('receipts').insert([newReceipt]);
      if (!error) return newReceipt;
    } catch (e) {
      console.warn('Supabase receipts write failed, storing locally.', e);
    }

    const localReceipts = getLocalStorageItem<Receipt[]>('spp_receipts', []);
    localReceipts.push(newReceipt);
    setLocalStorageItem('spp_receipts', localReceipts);
    return newReceipt;
  },

  // 6. NOTIFICATION OPERATIONS
  getNotifications: async (userId: string): Promise<AppNotification[]> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase notifications retrieval failed (non-critical):', error.message);
        return getLocalStorageItem<AppNotification[]>('spp_notifications', []).filter(n => n.user_id === userId);
      }
      
      if (data) return data as AppNotification[];
    } catch (e) {
      console.warn('Supabase notifications retrieval failed (unexpected):', e);
    }

    const localNotifs = getLocalStorageItem<AppNotification[]>('spp_notifications', []);
    const filtered = localNotifs.filter(n => n.user_id === userId);
    
    if (filtered.length === 0) {
      const seed: AppNotification = {
        id: 'n-init',
        user_id: userId,
        title: 'Security Sync Completed',
        message: 'Your cryptographic transaction network connection is fully established and secure.',
        type: 'success',
        read: false,
        created_at: new Date().toISOString()
      };
      const updatedAll = [...localNotifs, seed];
      setLocalStorageItem('spp_notifications', updatedAll);
      return [seed];
    }

    return filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  createNotification: async (userId: string, title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): Promise<AppNotification> => {
    const newNotif: AppNotification = {
      id: `NTF-${Math.floor(100000 + Math.random() * 900000)}`,
      user_id: userId,
      title,
      message,
      type,
      read: false,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('notifications').insert([newNotif]);
      if (!error) return newNotif;
    } catch (e) {
      console.warn('Supabase notification insertion failed, writing locally.', e);
    }

    const localNotifs = getLocalStorageItem<AppNotification[]>('spp_notifications', []);
    localNotifs.unshift(newNotif);
    setLocalStorageItem('spp_notifications', localNotifs);
    return newNotif;
  },

  markNotificationRead: async (userId: string, notifId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notifId);

      if (!error) return;
    } catch (e) {
      console.warn('Supabase read update failed, updating locally.', e);
    }

    const localNotifs = getLocalStorageItem<AppNotification[]>('spp_notifications', []);
    const updated = localNotifs.map(n => n.id === notifId ? { ...n, read: true } : n);
    setLocalStorageItem('spp_notifications', updated);
  },

  deleteNotification: async (userId: string, notifId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notifId);

      if (!error) return;
    } catch (e) {
      console.warn('Supabase notification deletion failed, removing locally.', e);
    }

    const localNotifs = getLocalStorageItem<AppNotification[]>('spp_notifications', []);
    const updated = localNotifs.filter(n => n.id !== notifId);
    setLocalStorageItem('spp_notifications', updated);
  },

  updateTransactionStatus: async (txId: string, status: 'success' | 'failed'): Promise<void> => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', txId);
      
      if (!error) {
        await dbService.logActivity('system', 'transfers', `Transaction ${txId} updated to ${status}`);
      }
    } catch (e) {
      console.warn('Supabase transaction status update failed', e);
    }
  },

  // 7. SUBSCRIPTION OPERATIONS
  getSubscriptions: async (userId: string): Promise<Subscription[]> => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      if (data && data.length > 0) return data as Subscription[];
    } catch (e) {
      console.warn('Supabase subscriptions retrieval failed, fetching locally.', e);
    }

    const localSubs = getLocalStorageItem<Subscription[]>('spp_subscriptions', []);
    const userSubs = localSubs.filter(s => s.user_id === userId);
    
    if (userSubs.length === 0) {
      const baseSub: Subscription = {
        id: 'sub-init',
        user_id: userId,
        email: 'merchant@simupay.pro',
        plan_name: 'Standard Pro Sandbox',
        status: 'active',
        amount: 0,
        billing_cycle: 'Annual',
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const updatedAll = [...localSubs, baseSub];
      setLocalStorageItem('spp_subscriptions', updatedAll);
      return [baseSub];
    }
    return userSubs;
  },

  createSubscription: async (
    userId: string, 
    email: string,
    planName: string, 
    planCode: string | undefined,
    amount: number, 
    cycle: 'Monthly' | 'Quarterly' | 'Annual' | 'Lifetime',
    paymentReference?: string
  ): Promise<Subscription> => {
    const newSub: Subscription = {
      id: `SUB-${Math.floor(100000 + Math.random() * 900000)}`,
      user_id: userId,
      email,
      plan_name: planName,
      plan_code: planCode,
      amount,
      billing_cycle: cycle,
      payment_reference: paymentReference,
      status: 'active',
      started_at: new Date().toISOString(),
      expires_at: cycle === 'Lifetime' 
        ? new Date(Date.now() + 100 * 365 * 24 * 3600 * 1000).toISOString() 
        : new Date(Date.now() + (cycle === 'Monthly' ? 30 : cycle === 'Quarterly' ? 90 : 365) * 24 * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('subscriptions').insert([newSub]);
      if (!error) return newSub;
    } catch (e) {
      console.warn('Supabase subscriptions insert failed, updating locally.', e);
    }

    const localSubs = getLocalStorageItem<Subscription[]>('spp_subscriptions', []);
    localSubs.unshift(newSub);
    setLocalStorageItem('spp_subscriptions', localSubs);
    return newSub;
  },

  // 7B. ADMIN AND SECURITY APIs
  getAllProfiles: async (): Promise<Profile[]> => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Profile[];
    } catch (e) {
      console.warn('Supabase getAllProfiles failed, reading local database.', e);
    }
    const localProfiles = getLocalStorageItem<Record<string, Profile>>('spp_profiles', {});
    return Object.values(localProfiles).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  getAllTransactions: async (): Promise<Transaction[]> => {
    try {
      const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Transaction[];
    } catch (e) {
      console.warn('Supabase getAllTransactions failed, reading local database.', e);
    }
    return getLocalStorageItem<Transaction[]>('spp_transactions', []);
  },

  getAllSubscriptions: async (): Promise<Subscription[]> => {
    try {
      const { data, error } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Subscription[];
    } catch (e) {
      console.warn('Supabase getAllSubscriptions failed, reading local database.', e);
    }
    return getLocalStorageItem<Subscription[]>('spp_subscriptions', []);
  },

  getAllSupportTicketsAdmin: async (): Promise<SupportTicket[]> => {
    try {
      const { data, error } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as SupportTicket[];
    } catch (e) {
      console.warn('Supabase getAllSupportTicketsAdmin failed, reading local database.', e);
    }
    return getLocalStorageItem<SupportTicket[]>('spp_support_tickets', []);
  },

  updateSupportTicketStatus: async (ticketId: string, status: 'open' | 'resolved' | 'pending'): Promise<void> => {
    try {
      await supabase.from('support_tickets').update({ status }).eq('id', ticketId);
    } catch (e) {
      console.warn('Supabase updateSupportTicketStatus failed, updating locally.', e);
    }
    const localTickets = getLocalStorageItem<SupportTicket[]>('spp_support_tickets', []);
    const updated = localTickets.map(t => t.id === ticketId ? { ...t, status } : t);
    setLocalStorageItem('spp_support_tickets', updated);
  },

  updateUserRole: async (userId: string, role: 'admin' | 'user'): Promise<void> => {
    try {
      await supabase.from('profiles').update({ role }).eq('id', userId);
    } catch (e) {
      console.warn('Supabase updateUserRole failed, updating locally.', e);
    }
    const localProfiles = getLocalStorageItem<Record<string, Profile>>('spp_profiles', {});
    if (localProfiles[userId]) {
      localProfiles[userId].role = role;
      setLocalStorageItem('spp_profiles', localProfiles);
    }
  },

  updateUserBalance: async (userId: string, balance: number): Promise<void> => {
    try {
      await supabase.from('profiles').update({ wallet_balance: balance }).eq('id', userId);
    } catch (e) {
      console.warn('Supabase updateUserBalance failed, updating locally.', e);
    }
    const localProfiles = getLocalStorageItem<Record<string, Profile>>('spp_profiles', {});
    if (localProfiles[userId]) {
      localProfiles[userId].wallet_balance = balance;
      setLocalStorageItem('spp_profiles', localProfiles);
    }
  },

  createActivationKey: async (key: string, licenseType: 'Standard' | 'Enterprise', expiresDays: number | null): Promise<ActivationKey> => {
    const newKey: ActivationKey = {
      id: `KEY-${Math.floor(100000 + Math.random() * 900000)}`,
      activation_key: key,
      license_type: licenseType,
      status: 'unused',
      assigned_user: null,
      activated_at: null,
      expires_at: expiresDays ? new Date(Date.now() + expiresDays * 24 * 3600 * 1000).toISOString() : null
    };

    try {
      await supabase.from('activation_keys').insert([newKey]);
    } catch (e) {
      console.warn('Supabase createActivationKey failed, writing locally.', e);
    }

    const localKeys = getLocalStorageItem<ActivationKey[]>('spp_activation_keys', []);
    localKeys.push(newKey);
    setLocalStorageItem('spp_activation_keys', localKeys);
    return newKey;
  },

  deleteActivationKey: async (keyId: string): Promise<void> => {
    try {
      await supabase.from('activation_keys').delete().eq('id', keyId);
    } catch (e) {
      console.warn('Supabase deleteActivationKey failed, removing locally.', e);
    }
    const localKeys = getLocalStorageItem<ActivationKey[]>('spp_activation_keys', []);
    const filtered = localKeys.filter(k => k.id !== keyId);
    setLocalStorageItem('spp_activation_keys', filtered);
  },

  deleteSubscription: async (subId: string): Promise<void> => {
    try {
      await supabase.from('subscriptions').delete().eq('id', subId);
    } catch (e) {
      console.warn('Supabase deleteSubscription failed, removing locally.', e);
    }
    const localSubs = getLocalStorageItem<Subscription[]>('spp_subscriptions', []);
    const filtered = localSubs.filter(s => s.id !== subId);
    setLocalStorageItem('spp_subscriptions', filtered);
  },

  updateSubscriptionStatus: async (subId: string, status: 'active' | 'expired' | 'canceled'): Promise<void> => {
    try {
      await supabase.from('subscriptions').update({ status }).eq('id', subId);
    } catch (e) {
      console.warn('Supabase updateSubscriptionStatus failed, updating locally.', e);
    }
    const localSubs = getLocalStorageItem<Subscription[]>('spp_subscriptions', []);
    const updated = localSubs.map(s => s.id === subId ? { ...s, status } : s);
    setLocalStorageItem('spp_subscriptions', updated);
  },

  // 8. ACTIVITY LOGS OPERATIONS
  getActivityLogs: async (userId: string): Promise<ActivityLog[]> => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) return data as ActivityLog[];
    } catch (e) {
      console.warn('Supabase activity logs fetch failed, loading local logs.', e);
    }

    const localLogs = getLocalStorageItem<ActivityLog[]>('spp_activity_logs', []);
    return localLogs.filter(l => l.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  logActivity: async (userId: string, action: ActivityLog['action'], details: string): Promise<ActivityLog> => {
    const newLog: ActivityLog = {
      id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
      user_id: userId,
      action,
      details,
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('activity_logs').insert([newLog]);
      if (!error) return newLog;
    } catch (e) {
      console.warn('Supabase activity log insertion failed, writing to local storage.', e);
    }

    const localLogs = getLocalStorageItem<ActivityLog[]>('spp_activity_logs', []);
    localLogs.unshift(newLog);
    setLocalStorageItem('spp_activity_logs', localLogs);
    return newLog;
  },

  // 9. SUPPORT TICKETS OPERATIONS
  getSupportTickets: async (userId: string): Promise<SupportTicket[]> => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase support tickets fetch failed (non-critical):', error.message);
        return getLocalStorageItem<SupportTicket[]>('spp_support_tickets', []).filter(t => t.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
      }
      
      if (data) return data as SupportTicket[];
    } catch (e) {
      console.warn('Supabase support tickets fetch failed (unexpected):', e);
    }

    const localTickets = getLocalStorageItem<SupportTicket[]>('spp_support_tickets', []);
    return localTickets.filter(t => t.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  createSupportTicket: async (userId: string, subject: string, message: string): Promise<SupportTicket> => {
    const newTicket: SupportTicket = {
      id: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
      user_id: userId,
      subject,
      message,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('support_tickets').insert([newTicket]);
      if (!error) {
        await dbService.logActivity(userId, 'support', `Opened technical support ticket: "${subject}"`);
        return newTicket;
      }
    } catch (e) {
      console.warn('Supabase support ticket creation failed, adding locally.', e);
    }

    const localTickets = getLocalStorageItem<SupportTicket[]>('spp_support_tickets', []);
    localTickets.unshift(newTicket);
    setLocalStorageItem('spp_support_tickets', localTickets);

    await dbService.logActivity(userId, 'support', `Created local support ticket simulation: "${subject}"`);
    return newTicket;
  },

  getPaymentProviders: async (): Promise<PaymentProvider[]> => {
    try {
      const { data, error } = await supabase
        .from('payment_providers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase providers fetch failed, using defaults.', e);
    }

    // Default Fallback Providers
    return [
      {
        id: 'cashapp-id',
        name: 'Cash App',
        category: 'Electronic',
        color_hex: '#00D632',
        required_fields: ['amount', 'recipient_name', 'recipient_tag', 'sender_name', 'sender_tag', 'memo', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: 'venmo-id',
        name: 'Venmo',
        category: 'Electronic',
        color_hex: '#3D95CE',
        required_fields: ['amount', 'recipient_name', 'recipient_tag', 'sender_name', 'memo', 'status'],
        is_active: true
      },
      {
        id: 'paypal-id',
        name: 'PayPal',
        category: 'Electronic',
        color_hex: '#003087',
        required_fields: ['amount', 'recipient_name', 'recipient_tag', 'memo', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: 'zelle-id',
        name: 'Zelle',
        category: 'Bank',
        color_hex: '#7414CA',
        required_fields: ['amount', 'recipient_name', 'bank_name', 'memo', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: 'mtn-airtime-id',
        name: 'MTN Airtime',
        category: 'Electronic',
        color_hex: '#FFCC00',
        required_fields: ['amount', 'recipient_name', 'memo', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: 'airtel-airtime-id',
        name: 'Airtel Airtime',
        category: 'Electronic',
        color_hex: '#FF0000',
        required_fields: ['amount', 'recipient_name', 'memo', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: 'glo-airtime-id',
        name: 'Glo Airtime',
        category: 'Electronic',
        color_hex: '#00FF00',
        required_fields: ['amount', 'recipient_name', 'memo', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: '9mobile-airtime-id',
        name: '9mobile Airtime',
        category: 'Electronic',
        color_hex: '#006600',
        required_fields: ['amount', 'recipient_name', 'memo', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: 'mtn-data-id',
        name: 'MTN Data',
        category: 'Electronic',
        color_hex: '#FFCC33',
        required_fields: ['amount', 'recipient_name', 'memo', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: 'airtel-data-id',
        name: 'Airtel Data',
        category: 'Electronic',
        color_hex: '#FF3333',
        required_fields: ['amount', 'recipient_name', 'memo', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: 'glo-data-id',
        name: 'Glo Data',
        category: 'Electronic',
        color_hex: '#33FF33',
        required_fields: ['amount', 'recipient_name', 'memo', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: '9mobile-data-id',
        name: '9mobile Data',
        category: 'Electronic',
        color_hex: '#336633',
        required_fields: ['amount', 'recipient_name', 'memo', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: 'coinbase-id',
        name: 'Coinbase',
        category: 'Crypto',
        color_hex: '#0052FF',
        required_fields: ['amount', 'asset', 'network', 'recipient_address', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: 'metamask-id',
        name: 'MetaMask',
        category: 'Crypto',
        color_hex: '#F6851B',
        required_fields: ['amount', 'asset', 'network', 'recipient_address', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: 'trustwallet-id',
        name: 'Trust Wallet',
        category: 'Crypto',
        color_hex: '#3375BB',
        required_fields: ['amount', 'asset', 'network', 'recipient_address', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: 'exodus-id',
        name: 'Exodus',
        category: 'Crypto',
        color_hex: '#2B2E4A',
        required_fields: ['amount', 'asset', 'network', 'recipient_address', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: 'bybit-id',
        name: 'Bybit',
        category: 'Crypto',
        color_hex: '#F7A600',
        required_fields: ['amount', 'asset', 'network', 'recipient_address', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: 'cryptocom-id',
        name: 'Crypto.com',
        category: 'Crypto',
        color_hex: '#103F68',
        required_fields: ['amount', 'asset', 'network', 'recipient_address', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: 'bitcoincom-id',
        name: 'Bitcoin.com',
        category: 'Crypto',
        color_hex: '#F7931A',
        required_fields: ['amount', 'asset', 'network', 'recipient_address', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: 'kucoin-id',
        name: 'KuCoin',
        category: 'Crypto',
        color_hex: '#24AE8F',
        required_fields: ['amount', 'asset', 'network', 'recipient_address', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: 'kraken-id',
        name: 'Kraken',
        category: 'Crypto',
        color_hex: '#5841D8',
        required_fields: ['amount', 'asset', 'network', 'recipient_address', 'status', 'reference_no'],
        is_active: true
      },
      {
        id: 'revolut-id',
        name: 'Revolut',
        category: 'Electronic',
        color_hex: '#ffffff',
        required_fields: ['amount', 'recipient_name', 'recipient_tag', 'memo', 'status'],
        is_active: true
      }
    ];
  },

  saveReceiptRecord: async (userId: string, record: Omit<ReceiptRecord, 'id' | 'created_at' | 'user_id'>): Promise<ReceiptRecord> => {
    const newRecord: ReceiptRecord = {
      ...record,
      id: Math.random().toString(36).substring(2, 15),
      user_id: userId,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('receipt_records').insert([newRecord]);
      if (!error) {
        await dbService.logActivity(userId, 'receipt generation', `Generated and saved ${record.provider_name} receipt for $${record.amount}`);
        return newRecord;
      }
    } catch (e) {
      console.warn('Supabase receipt save failed, storing locally.', e);
    }

    const localReceipts = getLocalStorageItem<ReceiptRecord[]>('spp_receipt_records', []);
    localReceipts.unshift(newRecord);
    setLocalStorageItem('spp_receipt_records', localReceipts);

    await dbService.logActivity(userId, 'receipt generation', `Generated local ${record.provider_name} receipt simulation for $${record.amount}`);
    return newRecord;
  },

  getReceiptRecords: async (userId: string): Promise<ReceiptRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('receipt_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data as ReceiptRecord[];
      }
    } catch (e) {
      console.warn('Supabase receipts query failed, querying locally.', e);
    }
    const localReceipts = getLocalStorageItem<ReceiptRecord[]>('spp_receipt_records', []);
    return localReceipts.filter(r => r.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // 11. SLIPMINT MARKET COMMERCE OPERATIONS
  getProductCategories: async (): Promise<ProductCategory[]> => {
    const defaultCategories: ProductCategory[] = [
      { id: 'cat-founder-vault', title: 'Founder Vault', handle: 'founder-vault', description: 'Elite membership vault containing digital tools, premium code, and priority access signals.', seo_title: 'Founder Vault - Premium Membership', seo_description: 'Elite membership vault containing digital tools, premium code, and priority access signals.', sort_order: 'best selling', created_at: new Date().toISOString() },
      { id: 'cat-trading-tools', title: 'Trading Tools', handle: 'trading-tools', description: 'High-performance calculators, lockout tools, and journals to keep you disciplined.', seo_title: 'Trading Tools - Professional Forex & Crypto Utilities', seo_description: 'High-performance calculators, lockout tools, and journals to keep you disciplined.', sort_order: 'best selling', created_at: new Date().toISOString() },
      { id: 'cat-signals', title: 'Signals', handle: 'signals', description: 'Real-time Telegram feed and automated priority alerts for FX and Crypto trading setups.', seo_title: 'Trading Signals - Live Automated Forex & Crypto Alerts', seo_description: 'Real-time Telegram feed and automated priority alerts for FX and Crypto trading setups.', sort_order: 'best selling', created_at: new Date().toISOString() },
      { id: 'cat-courses-education', title: 'Courses & Education', handle: 'courses-education', description: 'Masterclass series, tutorial booklets, and full courses on algorithmic trading systems.', seo_title: 'Fintech Courses & Algorithmic Education', seo_description: 'Masterclass series, tutorial booklets, and full courses on algorithmic trading systems.', sort_order: 'best selling', created_at: new Date().toISOString() },
      { id: 'cat-ai-research', title: 'AI Research', handle: 'ai-research', description: 'Machine learning market prediction models, sentiment analyzers, and AI reports.', seo_title: 'AI Market Research & Quantitative Sentiment Reports', seo_description: 'Machine learning market prediction models, sentiment analyzers, and AI reports.', sort_order: 'best selling', created_at: new Date().toISOString() },
      { id: 'cat-beginner-resources', title: 'Beginner Resources', handle: 'beginner-resources', description: 'Introduction materials, glossary lists, and safety checklists for retail starters.', seo_title: 'Beginner Trading Resources & Starter Kit', seo_description: 'Introduction materials, glossary lists, and safety checklists for retail starters.', sort_order: 'best selling', created_at: new Date().toISOString() },
      { id: 'cat-community', title: 'Community', handle: 'community', description: 'Discord invites, private discussion forums, and community events with team members.', seo_title: 'Private Discussion Forums & Trader Community', seo_description: 'Discord invites, private discussion forums, and community events with team members.', sort_order: 'best selling', created_at: new Date().toISOString() }
    ];

    try {
      const { data, error } = await supabase.from('product_categories').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as ProductCategory[];
      }
    } catch (e) {
      console.warn('Supabase product categories query failed, fallback to local storage.', e);
    }

    const localCategories = getLocalStorageItem<ProductCategory[]>('spp_product_categories', []);
    if (localCategories.length === 0) {
      setLocalStorageItem('spp_product_categories', defaultCategories);
      return defaultCategories;
    }
    return localCategories;
  },

  getProducts: async (): Promise<Product[]> => {
    const defaultProducts: Product[] = [
      {
        id: 'prod-founder-vault',
        title: 'Founder Vault Membership',
        handle: 'founder-vault-membership',
        description: 'Gain full access to our monthly elite subscription. Includes advanced artificial intelligence tools, priority institutional level trading signals, private community forums, and masterclass code files.',
        price: 25000,
        currency: 'NGN',
        image_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80',
        category_id: 'cat-founder-vault',
        is_digital: true,
        status: 'Draft',
        benefits: [
          'Instant access to private Discord channels',
          'Automated daily AI sentiment reports',
          'Priority trade entry signals via Telegram',
          'Exclusive monthly founder townhalls'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: 'prod-trading-toolkit',
        title: 'Trading Discipline Toolkit',
        handle: 'trading-discipline-toolkit',
        description: 'Stop giving back profits. This professional toolbox features our advanced position sizing calculator, interactive risk-to-reward ratio builder, pre-flight safety checklists, a dynamic revenge trade lockout timer, and an automated trader journal.',
        price: 15000,
        currency: 'NGN',
        image_url: 'https://images.unsplash.com/photo-1642390061910-0f71214e73db?auto=format&fit=crop&w=600&q=80',
        category_id: 'cat-trading-tools',
        is_digital: true,
        status: 'Draft',
        benefits: [
          'Pre-flight risk calculator software',
          'Dynamic revenge trade lockout countdown',
          'Automated metrics visualizer sheet',
          'Lifetime software updates'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: 'prod-signal-pass',
        title: 'Signal Pass Add-on',
        handle: 'signal-pass',
        description: 'Unlock elite weekly Telegram signals. Integrates seamlessly with your dashboard and delivers high-probability setups directly to your phone with complete take-profit, stop-loss, and invalidation targets.',
        price: 5000,
        currency: 'NGN',
        image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        category_id: 'cat-signals',
        is_digital: true,
        status: 'Draft',
        benefits: [
          'Automated trading channel entry',
          '24/7 priority forex/crypto alert alerts',
          'Real-time take-profit/stop-loss updates',
          'Direct mentorship feedback line'
        ],
        created_at: new Date().toISOString()
      }
    ];

    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch (e) {
      console.warn('Supabase products query failed, fallback to local storage.', e);
    }

    const localProducts = getLocalStorageItem<Product[]>('spp_products', []);
    if (localProducts.length === 0) {
      setLocalStorageItem('spp_products', defaultProducts);
      return defaultProducts;
    }
    return localProducts;
  },

  updateProductStatus: async (productId: string, status: 'Draft' | 'Active'): Promise<Product> => {
    try {
      const { data, error } = await supabase.from('products').update({ status }).eq('id', productId).select().maybeSingle();
      if (!error && data) {
        return data as Product;
      }
    } catch (e) {
      console.warn('Supabase update product status failed, persisting locally.', e);
    }

    const products = getLocalStorageItem<Product[]>('spp_products', []);
    const updated = products.map(p => p.id === productId ? { ...p, status } : p);
    setLocalStorageItem('spp_products', updated);
    return updated.find(p => p.id === productId) as Product;
  },

  getCoupons: async (): Promise<Coupon[]> => {
    const defaultCoupons: Coupon[] = [
      {
        id: 'coupon-launch15',
        code: 'LAUNCH15',
        discount_percent: 15,
        category_scope: 'cat-founder-vault',
        expiry_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        is_active: true
      }
    ];

    try {
      const { data, error } = await supabase.from('coupons').select('*');
      if (!error && data && data.length > 0) {
        return data as Coupon[];
      }
    } catch (e) {
      console.warn('Supabase coupons query failed, fallback to local storage.', e);
    }

    const localCoupons = getLocalStorageItem<Coupon[]>('spp_coupons', []);
    if (localCoupons.length === 0) {
      setLocalStorageItem('spp_coupons', defaultCoupons);
      return defaultCoupons;
    }
    return localCoupons;
  },

  getProductReviews: async (productId: string): Promise<ProductReview[]> => {
    const defaultReviews: ProductReview[] = [
      { id: 'rev-1', product_id: 'prod-founder-vault', user_id: 'user-xyz', user_name: 'Adekunle S.', rating: 5, comment: 'Simply outstanding. The signals alone recovered my subscription in the first 2 days.', created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
      { id: 'rev-2', product_id: 'prod-trading-toolkit', user_id: 'user-abc', user_name: 'Chinedu O.', rating: 5, comment: 'The revenge trade lockout countdown timer saved my account twice this week. Every emotional trader needs this.', created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() }
    ];

    try {
      const { data, error } = await supabase.from('product_reviews').select('*').eq('product_id', productId);
      if (!error && data && data.length > 0) {
        return data as ProductReview[];
      }
    } catch (e) {
      console.warn('Supabase reviews query failed, fallback to local storage.', e);
    }

    const localReviews = getLocalStorageItem<ProductReview[]>('spp_product_reviews', []);
    if (localReviews.length === 0) {
      setLocalStorageItem('spp_product_reviews', defaultReviews);
      return defaultReviews.filter(r => r.product_id === productId);
    }
    return localReviews.filter(r => r.product_id === productId);
  },

  saveProductReview: async (review: Omit<ProductReview, 'id' | 'created_at'>): Promise<ProductReview> => {
    const newReview: ProductReview = {
      ...review,
      id: 'rev-' + Math.random().toString(36).substring(2, 10),
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('product_reviews').insert([newReview]);
      if (!error) return newReview;
    } catch (e) {
      console.warn('Supabase review save failed, storing locally.', e);
    }

    const reviews = getLocalStorageItem<ProductReview[]>('spp_product_reviews', []);
    reviews.unshift(newReview);
    setLocalStorageItem('spp_product_reviews', reviews);
    return newReview;
  },

  getProductOrders: async (userId: string): Promise<ProductOrder[]> => {
    try {
      const { data, error } = await supabase.from('product_orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (!error && data) return data as ProductOrder[];
    } catch (e) {
      console.warn('Supabase product orders query failed, querying locally.', e);
    }
    const localOrders = getLocalStorageItem<ProductOrder[]>('spp_product_orders', []);
    return localOrders.filter(o => o.user_id === userId);
  },

  createProductOrder: async (
    userId: string, 
    productId: string, 
    pricePaid: number, 
    currency: string, 
    paymentMethod: string,
    couponId?: string
  ): Promise<{ order: ProductOrder; message: string }> => {
    const orderId = 'order-' + Math.random().toString(36).substring(2, 12);
    const newOrder: ProductOrder = {
      id: orderId,
      user_id: userId,
      total_amount: pricePaid,
      currency: currency,
      status: 'Completed',
      coupon_id: couponId,
      payment_method: paymentMethod,
      created_at: new Date().toISOString()
    };

    const newOrderItem: OrderItem = {
      id: 'item-' + Math.random().toString(36).substring(2, 12),
      order_id: orderId,
      product_id: productId,
      price: pricePaid,
      quantity: 1,
      created_at: new Date().toISOString()
    };

    // 1. Save order to DB
    try {
      await supabase.from('product_orders').insert([newOrder]);
      await supabase.from('order_items').insert([newOrderItem]);
    } catch (e) {
      console.warn('Supabase product order save failed, executing locally.', e);
    }

    // Save locally
    const localOrders = getLocalStorageItem<ProductOrder[]>('spp_product_orders', []);
    localOrders.unshift(newOrder);
    setLocalStorageItem('spp_product_orders', localOrders);

    const localOrderItemList = getLocalStorageItem<OrderItem[]>('spp_order_items', []);
    localOrderItemList.unshift(newOrderItem);
    setLocalStorageItem('spp_order_items', localOrderItemList);

    // 2. Auto register user's download token
    const newDownload: ProductDownload = {
      id: 'dl-' + Math.random().toString(36).substring(2, 12),
      user_id: userId,
      product_id: productId,
      download_count: 0,
      last_downloaded_at: new Date().toISOString()
    };
    try {
      await supabase.from('product_downloads').insert([newDownload]);
    } catch (e) {
      console.warn('Supabase downloads registry failed, saving locally.', e);
    }
    const localDownloads = getLocalStorageItem<ProductDownload[]>('spp_product_downloads', []);
    localDownloads.unshift(newDownload);
    setLocalStorageItem('spp_product_downloads', localDownloads);

    // 3. Integrate with notifications
    const productName = productId === 'prod-founder-vault' ? 'Founder Vault Membership' :
                        productId === 'prod-trading-toolkit' ? 'Trading Discipline Toolkit' : 'Signal Pass Add-on';
    
    await dbService.createNotification(
      userId,
      'Digital Purchase Success 🛍️',
      `Your payment of ${currency} ${pricePaid.toLocaleString()} for "${productName}" was successful. Your downloadable file resources are active!`,
      'success'
    );

    // 4. Integrate with activity logs
    await dbService.logActivity(userId, 'marketplace purchase', `Purchased digital product: ${productName} for ${currency} ${pricePaid}`);

    // 5. Integrate with subscriptions if it's the Founder Vault
    if (productId === 'prod-founder-vault') {
      try {
        await dbService.updateProfile(userId, {
          license_active: true,
          license_type: 'Enterprise',
          subscription_status: 'Active',
          expiry_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
        });

        // Also add or update subscription table record
        const newSubscription: Subscription = {
          id: 'sub-' + Math.random().toString(36).substring(2, 10),
          user_id: userId,
          email: 'merchant@simupay.pro',
          plan_name: 'Founder Vault',
          status: 'active',
          billing_cycle: 'Monthly',
          amount: pricePaid,
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        try {
          await supabase.from('subscriptions').insert([newSubscription]);
        } catch (subErr) {
          console.warn('Supabase subscription record save failed:', subErr);
        }
        
        const localSubs = getLocalStorageItem<Subscription[]>('spp_subscriptions', []);
        localSubs.unshift(newSubscription);
        setLocalStorageItem('spp_subscriptions', localSubs);

      } catch (e) {
        console.error('Failed to auto-upgrade subscription parameters:', e);
      }
    }

    // 6. Integrate with receipts generation!
    try {
      await dbService.saveReceiptRecord(userId, {
        provider_id: paymentMethod,
        provider_name: paymentMethod === 'wallet' ? 'SimuPay Wallet Balance' : 'Card Processor',
        amount: pricePaid,
        currency: currency,
        status: 'completed',
        transaction_date: new Date().toLocaleDateString(),
        transaction_time: new Date().toLocaleTimeString(),
        reference_no: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        sender_name: 'SimuPay Wallet Address',
        recipient_name: 'SlipMint Market Merchant Account',
        memo: `Purchase: ${productName}`
      });
    } catch (e) {
      console.warn('Failed to auto-save receipt record for digital purchase:', e);
    }

    return {
      order: newOrder,
      message: `Purchase completed successfully! ${productName} resources are ready for instant download.`
    };
  },

  getVTUProviders: async (): Promise<VTUProvider[]> => {
    try {
      const response = await fetch('/api/vtu/providers');
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.error('[dbService] Failed to fetch VTU providers:', e);
    }
    return [];
  },

  getVTUNetworks: async (): Promise<VTUNetwork[]> => {
    try {
      const response = await fetch('/api/vtu/networks');
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.error('[dbService] Failed to fetch VTU networks:', e);
    }
    return [];
  },

  getVTUDataPlans: async (networkId?: string): Promise<VTUDataPlan[]> => {
    try {
      const url = networkId ? `/api/vtu/data-plans?network_id=${networkId}` : '/api/vtu/data-plans';
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.error('[dbService] Failed to fetch VTU data plans:', e);
    }
    return [];
  },

  getAirtimeOrders: async (userId: string): Promise<any[]> => {
    try {
      const response = await fetch(`/api/airtime-orders?userId=${userId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.error('[dbService] Failed to fetch airtime orders:', e);
    }
    return [];
  }
};
