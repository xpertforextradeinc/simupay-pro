import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import dotenv from 'dotenv';
import Flutterwave from 'flutterwave-node-v3';

// Load environment variables
dotenv.config();

const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY || '',
  process.env.FLUTTERWAVE_SECRET_KEY || ''
);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON body parsing
  app.use(express.json());

  // Setup Gemini client
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // Function declarations for Gemini Function Calling
  const searchUsers: FunctionDeclaration = {
    name: 'searchUsers',
    description: 'Search for users registered on the platform by name, email, or ID.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'A search query (email, name, or part of ID).'
        }
      },
      required: ['query']
    }
  };

  const searchTransactions: FunctionDeclaration = {
    name: 'searchTransactions',
    description: 'Search transaction logs by transaction ID or network type (e.g. TRC20, ERC20).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'A transaction ID or blockchain network name.'
        }
      },
      required: ['query']
    }
  };

  const getPlatformStatistics: FunctionDeclaration = {
    name: 'getPlatformStatistics',
    description: 'Fetch aggregate platform usage stats including volume, active users, success rates, etc.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  };

  const getSubscriptionSummary: FunctionDeclaration = {
    name: 'getSubscriptionSummary',
    description: 'Fetch monthly recurring revenue (MRR), active subscriptions count, and plan breakdowns.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  };

  const getRecentActivity: FunctionDeclaration = {
    name: 'getRecentActivity',
    description: 'Fetch a list of the most recent system activity logs (e.g. upgrades, logins, signups).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: {
          type: Type.INTEGER,
          description: 'Number of recent activity entries to fetch.'
        }
      }
    }
  };

  const getDashboardMetrics: FunctionDeclaration = {
    name: 'getDashboardMetrics',
    description: 'Fetch high-level business growth metrics, open tickets count, and general health status.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  };

  const executeFunctionCall = async (name: string, args: any) => {
    console.log(`[AI Copilot] Backend executing function call: ${name} with args:`, args);
    switch (name) {
      case 'searchUsers': {
        const query = (args.query || '').toLowerCase();
        const mockUsers = [
          { id: 'usr-1', email: 'john.doe@example.com', name: 'John Doe', role: 'user', status: 'active', balance: 4500, created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString() },
          { id: 'usr-2', email: 'jane.smith@example.com', name: 'Jane Smith', role: 'user', status: 'active', balance: 12500, created_at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString() },
          { id: 'usr-3', email: 'admin@simupay.pro', name: 'SimuPay Admin', role: 'admin', status: 'active', balance: 0, created_at: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString() }
        ];
        const filtered = mockUsers.filter(u => 
          !query || 
          u.email.toLowerCase().includes(query) || 
          u.name.toLowerCase().includes(query) || 
          u.id.includes(query)
        );
        return { users: filtered };
      }
      case 'searchTransactions': {
        const query = (args.query || '').toLowerCase();
        const mockTxs = [
          { id: 'tx-1', userId: 'usr-1', amount: 1500, status: 'completed', network: 'TRC20', date: new Date().toISOString() },
          { id: 'tx-2', userId: 'usr-2', amount: 50000, status: 'pending', network: 'ERC20', date: new Date().toISOString() }
        ];
        const filtered = mockTxs.filter(t => 
          !query || 
          t.id.includes(query) || 
          t.network.toLowerCase().includes(query)
        );
        return { transactions: filtered };
      }
      case 'getPlatformStatistics': {
        return {
          totalUsers: 1254,
          activeUsers24h: 342,
          totalVolume: 4500000,
          successRate: 98.5
        };
      }
      case 'getSubscriptionSummary': {
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
      }
      case 'getRecentActivity': {
        const limit = args.limit || 5;
        const mockActivities = [
          { id: 'act-1', type: 'user_signup', user: 'new_user@example.com', timestamp: new Date(Date.now() - 5000).toISOString() },
          { id: 'act-2', type: 'large_transaction', amount: 150000, user: 'whale@example.com', timestamp: new Date(Date.now() - 15000).toISOString() },
          { id: 'act-3', type: 'subscription_upgrade', user: 'john.doe@example.com', plan: 'pro', timestamp: new Date(Date.now() - 60000).toISOString() }
        ];
        return { activities: mockActivities.slice(0, limit) };
      }
      case 'getDashboardMetrics': {
        return {
          revenueGrowth: 15.4, // %
          userGrowth: 8.2, // %
          systemHealth: 'Optimal',
          openSupportTickets: 12
        };
      }
      default:
        throw new Error(`Function ${name} not supported`);
    }
  };

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: !!apiKey });
  });

  // Audit logging utility
  const logAudit = (message: string, context?: any) => {
    console.log(`[AUDIT LOG] [${new Date().toISOString()}] ${message}`, context ? JSON.stringify(context) : '');
  };

  // Helper to construct Supabase Headers
  const getSupabaseHeaders = () => {
    const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    return {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  };

  // Helper to resolve Supabase URL
  const getSupabaseUrl = () => {
    return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  };

  interface AirtimeOrder {
    id: string;
    user_id: string;
    network: string;
    phone_number: string;
    amount: number;
    payment_reference: string;
    flutterwave_transaction_id?: string;
    provider_reference?: string;
    status: 'pending' | 'paid' | 'processing' | 'successful' | 'failed';
    created_at: string;
  }

  // In-memory fallback database
  const inMemoryOrders: AirtimeOrder[] = [];

  // Database operations for airtime orders
  async function createOrderInDb(order: AirtimeOrder): Promise<AirtimeOrder> {
    logAudit(`Creating pending order: ${order.id}`, { userId: order.user_id, network: order.network, phone: order.phone_number, amount: order.amount });
    try {
      const res = await fetch(`${getSupabaseUrl()}/rest/v1/airtime_orders`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(order)
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Supabase returned status ${res.status}: ${errText}`);
      }
      const data = await res.json();
      return data[0] || order;
    } catch (e: any) {
      logAudit(`Supabase order creation failed. Storing in memory fallback. Reason: ${e.message}`);
      if (!inMemoryOrders.some(o => o.id === order.id)) {
        inMemoryOrders.push(order);
      }
      return order;
    }
  }

  async function getOrderFromDbByRef(txRef: string): Promise<AirtimeOrder | null> {
    try {
      const res = await fetch(`${getSupabaseUrl()}/rest/v1/airtime_orders?payment_reference=eq.${txRef}`, {
        method: 'GET',
        headers: getSupabaseHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) return data[0] as AirtimeOrder;
      }
    } catch (e: any) {
      logAudit(`Supabase order lookup failed, using in-memory search. Reason: ${e.message}`);
    }
    return inMemoryOrders.find(o => o.payment_reference === txRef) || null;
  }

  async function updateOrderInDb(orderId: string, updates: Partial<AirtimeOrder>): Promise<AirtimeOrder | null> {
    logAudit(`Updating order ${orderId}`, updates);
    try {
      const res = await fetch(`${getSupabaseUrl()}/rest/v1/airtime_orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) return data[0] as AirtimeOrder;
      }
    } catch (e: any) {
      logAudit(`Supabase order update failed, updating in memory fallback. Reason: ${e.message}`);
    }
    const memOrder = inMemoryOrders.find(o => o.id === orderId);
    if (memOrder) {
      Object.assign(memOrder, updates);
      return memOrder;
    }
    return null;
  }

  async function getOrdersForUser(userId: string): Promise<AirtimeOrder[]> {
    try {
      const res = await fetch(`${getSupabaseUrl()}/rest/v1/airtime_orders?user_id=eq.${userId}&order=created_at.desc`, {
        method: 'GET',
        headers: getSupabaseHeaders()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e: any) {
      logAudit(`Supabase query user orders failed: ${e.message}`);
    }
    return inMemoryOrders.filter(o => o.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async function getUserIdByEmail(email: string): Promise<string | null> {
    try {
      const res = await fetch(`${getSupabaseUrl()}/rest/v1/profiles?email=eq.${email}`, {
        method: 'GET',
        headers: getSupabaseHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) return data[0].id;
      }
    } catch (e: any) {
      logAudit(`Failed to find user ID for email ${email}: ${e.message}`);
    }
    return null;
  }

  async function createNotificationInDb(
    userId: string,
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) {
    const newNotif = {
      id: `NTF-${Math.floor(100000 + Math.random() * 900000)}`,
      user_id: userId,
      title,
      message,
      type,
      read: false,
      created_at: new Date().toISOString()
    };
    try {
      await fetch(`${getSupabaseUrl()}/rest/v1/notifications`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(newNotif)
      });
    } catch (e: any) {
      logAudit(`Failed to create platform notification: ${e.message}`);
    }
  }

  async function logActivityInDb(userId: string, type: string, action: string) {
    const newActivity = {
      id: `ACT-${Math.floor(100000 + Math.random() * 900000)}`,
      user_id: userId,
      type,
      action,
      created_at: new Date().toISOString()
    };
    try {
      await fetch(`${getSupabaseUrl()}/rest/v1/activity_logs`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(newActivity)
      });
    } catch (e: any) {
      logAudit(`Failed to create platform activity log: ${e.message}`);
    }
  }

  async function integrateSuccessfulPurchase(order: AirtimeOrder, providerRef: string) {
    const userId = order.user_id;
    const amount = order.amount;
    const network = order.network;
    const phone = order.phone_number;
    
    logAudit(`Integrating successful purchase with platform modules for order ${order.id}`);
    
    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const transactionId = `SPP-TX-${Math.floor(10000000 + Math.random() * 90000000)}`;
    
    const txRecord = {
      id: transactionId,
      user_id: userId,
      wallet: phone,
      network: network,
      amount: -amount,
      status: 'completed',
      tx_hash: txHash,
      created_at: new Date().toISOString()
    };
    
    try {
      await fetch(`${getSupabaseUrl()}/rest/v1/transactions`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(txRecord)
      });
    } catch (e: any) {
      logAudit(`Failed to insert platform transaction: ${e.message}`);
    }
    
    const providerId = `${network.toLowerCase().replace(' ', '-')}-id`;
    const receiptRecord = {
      id: Math.random().toString(36).substring(2, 15),
      user_id: userId,
      provider_id: providerId,
      provider_name: network,
      amount: amount,
      currency: 'NGN',
      status: 'completed',
      transaction_date: new Date().toISOString().split('T')[0],
      transaction_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      reference_no: order.id,
      recipient_name: phone,
      memo: `${network} Mobile Purchase`,
      created_at: new Date().toISOString()
    };
    
    try {
      await fetch(`${getSupabaseUrl()}/rest/v1/receipt_records`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(receiptRecord)
      });
    } catch (e: any) {
      logAudit(`Failed to insert receipt record: ${e.message}`);
    }
    
    const notifMsg = `Successfully delivered ${network} topup of ₦${amount.toLocaleString()} to ${phone}. Provider Ref: ${providerRef}`;
    await createNotificationInDb(userId, 'Topup Dispatched 📱', notifMsg, 'success');
    await logActivityInDb(userId, 'vtu purchase', `Completed ₦${amount} ${network} mobile topup to ${phone}`);
  }

  function validateVTUInputs(phone: string, network: string, amount: number, type: 'AIRTIME' | 'DATA_BUNDLE') {
    if (!phone) {
      return { valid: false, message: 'Phone number is required' };
    }
    const cleanPhone = phone.replace(/[+\s-]/g, '');
    if (!/^\d{10,14}$/.test(cleanPhone)) {
      return { valid: false, message: 'Invalid phone number format. Must be between 10 and 14 digits.' };
    }

    if (!network) {
      return { valid: false, message: 'Network provider is required' };
    }
    const allowedNetworks = ['mtn', 'airtel', 'glo', '9mobile'];
    if (!allowedNetworks.includes(network.toLowerCase())) {
      return { valid: false, message: `Unsupported network provider: ${network}. Must be MTN, Airtel, Glo, or 9mobile.` };
    }

    if (isNaN(amount) || amount <= 0) {
      return { valid: false, message: 'Amount must be a positive number' };
    }

    if (type === 'AIRTIME') {
      if (amount < 50 || amount > 50000) {
        return { valid: false, message: 'Airtime amount must be between ₦50 and ₦50,000' };
      }
    } else if (type === 'DATA_BUNDLE') {
      const allowedAmounts = [1000, 2500, 4000];
      if (!allowedAmounts.includes(amount)) {
        return { valid: false, message: 'Invalid data bundle amount. Allowed: ₦1000 (1GB), ₦2500 (3GB), ₦4000 (5GB)' };
      }
    }

    return { valid: true };
  }

  async function callVTUProviderWithRetries(
    type: 'AIRTIME' | 'DATA_BUNDLE',
    network: string,
    phoneNumber: string,
    amount: number,
    txRef: string,
    maxRetries = 3,
    delayMs = 2000
  ): Promise<{ success: boolean; provider_reference?: string; response_payload?: any; error_message?: string }> {
    let attempt = 0;
    while (attempt < maxRetries) {
      attempt++;
      logAudit(`VTU Purchase Attempt ${attempt} of ${maxRetries} for order ${txRef}`, { type, network, phoneNumber, amount });
      try {
        if (process.env.FLUTTERWAVE_SECRET_KEY && process.env.FLUTTERWAVE_SECRET_KEY !== 'MY_FLUTTERWAVE_SECRET_KEY') {
          const billPayload = {
            country: 'NG',
            customer: phoneNumber,
            amount: amount,
            recurrence: 'ONCE',
            type: type,
            reference: `${txRef}-vtu-${attempt}`,
            biller_name: network.toUpperCase()
          };
          
          logAudit(`Calling Flutterwave Bills API on attempt ${attempt}`, billPayload);
          const billResponse = await flw.Bills.create_bill(billPayload);
          
          if (billResponse && billResponse.status === 'success') {
            logAudit(`Flutterwave Bills API returned success on attempt ${attempt}`, billResponse);
            return {
              success: true,
              provider_reference: billResponse.data?.tx_ref || billResponse.data?.reference || `FLW-BLL-${Date.now()}`,
              response_payload: billResponse
            };
          } else {
            throw new Error(billResponse?.message || 'Flutterwave Bills API returned unsuccessful status');
          }
        } else {
          // Simulated behavior for development/testing
          if (attempt < 2) {
            throw new Error('Simulated temporary VTU provider timeout/outage');
          }
          logAudit(`Simulated VTU purchase succeeded on attempt ${attempt}`);
          return {
            success: true,
            provider_reference: `SIM-VTU-${Math.floor(100000 + Math.random() * 900000)}`,
            response_payload: {
              status: 'success',
              message: 'VTU purchase simulated successfully',
              data: { network, phone: phoneNumber, amount, timestamp: new Date().toISOString() }
            }
          };
        }
      } catch (err: any) {
        logAudit(`VTU Purchase Attempt ${attempt} failed. Reason: ${err.message || err}`);
        if (attempt < maxRetries) {
          logAudit(`Waiting ${delayMs}ms before next retry...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          delayMs = delayMs * 1.5;
        } else {
          logAudit(`All ${maxRetries} VTU purchase attempts failed.`);
          return { success: false, error_message: err.message || 'All retry attempts exhausted' };
        }
      }
    }
    return { success: false, error_message: 'Max retries exceeded' };
  }

  const processingOrders = new Set<string>();

  async function verifyAndProcessVTU(transaction_id: string, tx_ref: string): Promise<boolean> {
    if (processingOrders.has(tx_ref)) {
      logAudit(`Order ${tx_ref} is already actively being processed. Skipping duplicate handler execution.`);
      return false;
    }
    processingOrders.add(tx_ref);
    try {
      logAudit(`Beginning VTU verification and processing for tx_ref: ${tx_ref}, transaction_id: ${transaction_id}`);
      
      const order = await getOrderFromDbByRef(tx_ref);
      if (!order) {
        logAudit(`Order not found for tx_ref: ${tx_ref}. Cannot process VTU.`);
        return false;
      }
      
      if (order.status === 'successful' || order.status === 'failed') {
        logAudit(`Order ${tx_ref} is already in a final state: ${order.status}. Skipping.`);
        return true;
      }
      
      logAudit(`Verifying transaction ${transaction_id} with Flutterwave...`);
      const flwVerification = await flw.Transaction.verify({ id: transaction_id });
      
      if (flwVerification.status !== 'success' || flwVerification.data?.status !== 'successful') {
        logAudit(`Flutterwave transaction verification failed for id: ${transaction_id}`);
        await updateOrderInDb(order.id, { status: 'failed' });
        return false;
      }
      
      logAudit(`Flutterwave payment verified successfully for order ${order.id}. Transitioning status to 'paid'.`);
      
      await updateOrderInDb(order.id, {
        status: 'paid',
        flutterwave_transaction_id: String(transaction_id)
      });
      
      await updateOrderInDb(order.id, { status: 'processing' });
      
      const vtuType = order.network.toLowerCase().includes('data') ? 'DATA_BUNDLE' : 'AIRTIME';
      const cleanNetwork = order.network.replace(' Airtime', '').replace(' Data', '');
      
      const vtuResult = await callVTUProviderWithRetries(
        vtuType,
        cleanNetwork,
        order.phone_number,
        order.amount,
        order.id
      );
      
      if (vtuResult.success) {
        logAudit(`VTU delivery successful for order ${order.id}. Reference: ${vtuResult.provider_reference}`);
        
        await updateOrderInDb(order.id, {
          status: 'successful',
          provider_reference: vtuResult.provider_reference
        });
        
        await integrateSuccessfulPurchase(order, vtuResult.provider_reference || `VTU-${Date.now()}`);
        return true;
      } else {
        logAudit(`VTU delivery failed for order ${order.id} after all retries. Error: ${vtuResult.error_message}`);
        
        await updateOrderInDb(order.id, { status: 'failed' });
        
        await createNotificationInDb(
          order.user_id,
          'Mobile Topup Failed',
          `Your payment of ₦${order.amount.toLocaleString()} was successful, but we encountered an issue delivering your topup. Please contact support.`,
          'error'
        );
        return false;
      }
    } catch (error) {
      logAudit(`Error during verifyAndProcessVTU for order ${tx_ref}:`, error);
      return false;
    } finally {
      processingOrders.delete(tx_ref);
    }
  }

  // Flutterwave payment endpoint
  app.post('/api/payment/initiate', async (req, res) => {
    try {
      const { amount, currency, email, meta, userId } = req.body;
      const amountNum = Number(amount);
      const isVTUPurchase = meta && (meta.type === 'AIRTIME' || meta.type === 'DATA_BUNDLE');

      let orderUserId = userId || '';
      
      if (isVTUPurchase) {
        const vtuType = meta.type as 'AIRTIME' | 'DATA_BUNDLE';
        const phone = String(meta.phone || '');
        const network = String(meta.network || '');

        // 1. Inputs Validation (Network, Phone, Amount)
        const val = validateVTUInputs(phone, network, amountNum, vtuType);
        if (!val.valid) {
          logAudit(`Validation failed for initiate payment: ${val.message}`);
          return res.status(400).json({ error: val.message });
        }

        // 2. Resolve User ID
        if (!orderUserId && email) {
          orderUserId = await getUserIdByEmail(email) || '';
        }
        if (!orderUserId) {
          logAudit(`Failed to resolve merchant user ID for topup order`);
          return res.status(400).json({ error: 'User ID could not be identified for this merchant.' });
        }

        // 3. Generate Structured Unique Order ID
        const cleanNetwork = network.toUpperCase();
        const orderId = `ORD-${vtuType}-${cleanNetwork}-${Date.now()}`;

        // 4. Save Pending Order to Database/Memory Ledger
        const pendingOrder: AirtimeOrder = {
          id: orderId,
          user_id: orderUserId,
          network: `${network.toUpperCase()} ${vtuType === 'AIRTIME' ? 'Airtime' : 'Data'}`,
          phone_number: phone,
          amount: amountNum,
          payment_reference: orderId,
          status: 'pending',
          created_at: new Date().toISOString()
        };

        await createOrderInDb(pendingOrder);

        // 5. Initiate Flutterwave Session using Order ID as tx_ref
        logAudit(`Initiating Flutterwave checkout session for order ${orderId}`);
        const response = await flw.Payment.initiate({
          tx_ref: orderId,
          amount: amountNum,
          currency: currency || 'NGN',
          redirect_url: `${process.env.APP_URL || 'https://ais-dev-edkn4xpdqgodb7wl6juv5h-571192572309.europe-west1.run.app'}/api/payment/verify`,
          customer: { email },
          meta: {
            ...meta,
            orderId,
            userId: orderUserId
          }
        });

        return res.json(response);
      }

      // Default non-VTU payment flow (licenses etc.)
      const defaultTxRef = req.body.tx_ref || `tx-${Date.now()}`;
      logAudit(`Initiating standard/license payment session with ref ${defaultTxRef}`);
      const response = await flw.Payment.initiate({
        tx_ref: defaultTxRef,
        amount: amountNum,
        currency: currency || 'USD',
        redirect_url: `${process.env.APP_URL || 'https://ais-dev-edkn4xpdqgodb7wl6juv5h-571192572309.europe-west1.run.app'}/api/payment/verify`,
        customer: { email },
        meta: meta || {},
      });
      res.json(response);
    } catch (error: any) {
      logAudit(`Failed to initiate payment: ${error.message || error}`);
      res.status(500).json({ error: 'Failed to initiate payment session.' });
    }
  });

  app.get('/api/payment/verify', async (req, res) => {
    try {
      const { transaction_id, tx_ref, status } = req.query;
      const flwTxId = String(transaction_id || '');
      const orderRef = String(tx_ref || '');
      
      logAudit(`Redirect verification check hit`, { transaction_id, tx_ref, status });

      let redirectStatus = 'failed';

      if (flwTxId && orderRef) {
        // Run verify and process logic (with idempotency check built inside!)
        const processed = await verifyAndProcessVTU(flwTxId, orderRef);
        if (processed) {
          redirectStatus = 'success';
        }
      }

      // Redirect browser seamlessly back to the React client
      const appUrl = process.env.APP_URL || 'https://ais-dev-edkn4xpdqgodb7wl6juv5h-571192572309.europe-west1.run.app';
      res.redirect(`${appUrl}/?status=${redirectStatus}&tx_ref=${orderRef}`);
    } catch (error: any) {
      logAudit(`Redirect verification error: ${error.message || error}`);
      const appUrl = process.env.APP_URL || 'https://ais-dev-edkn4xpdqgodb7wl6juv5h-571192572309.europe-west1.run.app';
      res.redirect(`${appUrl}/?status=failed`);
    }
  });

  app.post('/api/webhook/flutterwave', express.json(), async (req, res) => {
    try {
      const transaction_id = req.body.transaction_id || req.body.data?.id;
      const tx_ref = req.body.tx_ref || req.body.data?.tx_ref;
      
      logAudit(`Flutterwave Webhook Event Received`, { transaction_id, tx_ref });
      
      if (transaction_id && tx_ref) {
        // Run the exact same idempotent verification and VTU processing logic
        await verifyAndProcessVTU(String(transaction_id), String(tx_ref));
        res.status(200).send('Webhook processed');
      } else {
        res.status(400).send('Invalid webhook payload');
      }
    } catch (error: any) {
      logAudit(`Webhook processing exception: ${error.message || error}`);
      res.status(500).send('Webhook processing failed');
    }
  });

  app.get('/api/airtime-orders', async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'userId parameter is required' });
      }
      const orders = await getOrdersForUser(String(userId));
      res.json(orders);
    } catch (error: any) {
      logAudit(`Error retrieving airtime orders: ${error.message || error}`);
      res.status(500).json({ error: 'Failed to fetch airtime orders' });
    }
  });

  app.get('/api/market/prices', async (req, res) => {
    try {
      const cgApiKey = process.env.COINGECKO_API_KEY;
      let url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd&include_24hr_change=true';
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };

      if (cgApiKey) {
        if (cgApiKey.startsWith('CG-pro-') || cgApiKey.includes('pro')) {
          url = 'https://pro-api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd&include_24hr_change=true';
          headers['x-cg-pro-api-key'] = cgApiKey;
        } else {
          headers['x-cg-demo-api-key'] = cgApiKey;
        }
      }

      const cgRes = await fetch(url, { headers });
      if (!cgRes.ok) {
        throw new Error(`CoinGecko responded with status: ${cgRes.status}`);
      }
      const data = await cgRes.json();
      res.json(data);
    } catch (err: any) {
      console.warn('[CoinGecko Proxy Error]:', err.message);
      res.status(502).json({ error: 'Failed to retrieve prices from CoinGecko', details: err.message });
    }
  });

  app.post('/api/copilot/chat', async (req, res) => {
    try {
      const { messages, context } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages array is required' });
      }

      if (!ai) {
        return res.status(500).json({ 
          error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in the Settings > Secrets panel.' 
        });
      }

      // Build context summary
      const contextStr = context ? `
Current Platform Context:
- Registered Users Count: ${context.profilesCount || 0}
- Active Premium Users Count: ${context.activePremiumCount || 0}
- Subscriptions Active Count: ${context.subscriptionsCount || 0}
- Support Tickets Count: ${context.ticketsCount || 0}
- Total Receipts Generated: ${context.receiptsCount || 0}
- System Health Server Status: ${context.systemHealthStatus || 'UNKNOWN'}
- Available User Profile Names (sample): ${JSON.stringify(context.userSample || [])}
- Open Support Tickets (sample): ${JSON.stringify(context.ticketSample || [])}
` : 'No direct platform context available.';

      const systemInstruction = `
You are the AI Admin Copilot for the "SlipMint" sovereign transaction and dashboard platform.
You are assisting a platform administrator who has full credentials.
${contextStr}

Use this context to answer administrative queries intelligently, perform analysis, summarize data, or compose professional support replies.
Provide clean, concise, and professional answers using Markdown formatting. Use tables, bold text, lists, or code blocks where appropriate.
If the administrator asks about search, statistics, or reports, reference the facts and metrics from the platform context above.
You can call functions (tools) like searchUsers, searchTransactions, getPlatformStatistics, getSubscriptionSummary, getRecentActivity, or getDashboardMetrics to query real-time mock database parameters.
Always answer using information retrieved from these tools when appropriate.
`;

      // Map messages for Gemini
      const contents: any[] = messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const toolsList = [{
        functionDeclarations: [
          searchUsers,
          searchTransactions,
          getPlatformStatistics,
          getSubscriptionSummary,
          getRecentActivity,
          getDashboardMetrics
        ]
      }];

      let response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
          tools: toolsList
        }
      });

      // Handle Function/Tool Calls
      if (response.functionCalls && response.functionCalls.length > 0) {
        console.log(`[AI Copilot] Executing ${response.functionCalls.length} function calls from model in parallel.`);
        
        const functionResponses = await Promise.all(
          response.functionCalls.map(async (call) => {
            const result = await executeFunctionCall(call.name, call.args);
            return {
              name: call.name,
              response: result
            };
          })
        );

        // Append the assistant call turn
        contents.push(response.candidates?.[0]?.content || {
          role: 'model',
          parts: response.functionCalls.map(call => ({ functionCall: call }))
        });

        // Append the function responses turn
        contents.push({
          role: 'user',
          parts: functionResponses.map(fr => ({
            functionResponse: {
              name: fr.name,
              response: fr.response
            }
          }))
        });

        // Run next turn to generate final textual answer
        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            tools: toolsList
          }
        });
      }

      const reply = response.text || 'I was unable to generate a response. Please check back later.';
      res.json({ reply });

    } catch (error: any) {
      console.error('[Gemini API Error]:', error);
      res.status(500).json({ error: error?.message || 'Internal server error while calling Gemini' });
    }
  });

  app.post('/api/user/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages array is required' });
      }

      if (!ai) {
        return res.status(500).json({ error: 'AI not configured' });
      }

      const contents: any[] = messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction: "You are a helpful, entertaining, and insightful trading assistant for the SlipMint platform. Focus on explaining trading concepts, helping with platform navigation, and encouraging a positive trading experience. Keep answers concise and engaging."
        }
      });

      res.json({ reply: response.text || '...' });
    } catch (error: any) {
      res.status(500).json({ error: 'Chat failed' });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
