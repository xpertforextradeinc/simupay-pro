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

  // Flutterwave payment endpoint
  app.post('/api/payment/initiate', async (req, res) => {
    try {
      const { amount, currency, email, tx_ref } = req.body;
      const response = await flw.Payment.initiate({
        tx_ref,
        amount,
        currency,
        redirect_url: `${process.env.APP_URL}/api/payment/verify`,
        customer: { email },
      });
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to initiate payment' });
    }
  });

  app.get('/api/payment/verify', async (req, res) => {
    try {
      const { transaction_id } = req.query;
      const response = await flw.Transaction.verify({ id: transaction_id });
      if (response.status === 'success') {
        res.json({ status: 'success' });
      } else {
        res.json({ status: 'failed' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to verify payment' });
    }
  });

  app.post('/api/webhook/flutterwave', express.json(), async (req, res) => {
    try {
      const { transaction_id, status, tx_ref } = req.body;
      
      // Verify with Flutterwave
      const response = await flw.Transaction.verify({ id: transaction_id });
      
      if (response.status === 'success' && response.data.status === 'successful') {
        // Update transaction in DB
        await fetch(`${process.env.SUPABASE_URL}/rest/v1/transactions?id=eq.${tx_ref}`, {
          method: 'PATCH',
          headers: {
            'apikey': process.env.SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ status: 'completed' })
        });
        
        res.status(200).send('Webhook processed');
      } else {
        res.status(400).send('Transaction verification failed');
      }
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
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
