import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: !!apiKey });
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
If they ask for actions like searching a user or viewing logs, explain how the context maps to their request and give a highly detailed, data-informed response.
`;

      // Map messages for Gemini
      const contents = messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

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
