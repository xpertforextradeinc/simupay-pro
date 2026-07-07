import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bot, Send, User, Sparkles, Zap, Shield, Search, Terminal } from 'lucide-react';

interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AdminCopilotProps {
  profiles?: any[];
  subscriptions?: any[];
  tickets?: any[];
  receiptsCount?: number;
  systemHealth?: {
    dbConnected: boolean;
    serverStatus: string;
    localBackupActive: boolean;
  };
}

export function AdminCopilot({ 
  profiles = [], 
  subscriptions = [], 
  tickets = [], 
  receiptsCount = 0,
  systemHealth
}: AdminCopilotProps) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([{
    id: 'msg-1',
    role: 'assistant',
    content: "Hello! I'm your AI Copilot. I'm connected to the platform database and system metrics. How can I assist you with platform administration today?",
    timestamp: new Date()
  }]);

  const suggestedActions = [
    { label: "Summarize Platform Activity", icon: Zap },
    { label: "Search Premium Merchants", icon: Search },
    { label: "Audit Support Tickets", icon: Shield },
    { label: "System Health Report", icon: Terminal }
  ];

  const renderMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Replace **text** with <strong>text</strong>
      const parts = line.split('**');
      const renderedLine = parts.map((part, j) => {
        if (j % 2 === 1) {
          return <strong key={j} className="text-brand-text font-bold">{part}</strong>;
        }
        return part;
      });

      return (
        <div key={i} className={line.trim() === '' ? 'h-2' : 'min-h-[1.25rem]'}>
          {renderedLine}
        </div>
      );
    });
  };

  const handleSend = async (e?: React.FormEvent, customInput?: string) => {
    e?.preventDefault();
    const query = customInput || input;
    if (!query.trim()) return;

    // Add user message
    const userMsg: CopilotMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Extract active premium users
      const activePremiumCount = profiles.filter(p => p.license_active).length;

      // Build context payload
      const contextPayload = {
        profilesCount: profiles.length,
        activePremiumCount,
        subscriptionsCount: subscriptions.length,
        ticketsCount: tickets.length,
        receiptsCount,
        systemHealthStatus: systemHealth?.serverStatus || 'HEALTHY',
        userSample: profiles.slice(0, 8).map(p => ({
          name: p.full_name,
          email: p.email,
          role: p.role,
          balance: p.wallet_balance,
          license: p.license_active ? 'Premium' : 'Free'
        })),
        ticketSample: tickets.filter(t => t.status !== 'resolved').slice(0, 5).map(t => ({
          id: t.id,
          subject: t.subject,
          status: t.status,
          priority: t.priority
        }))
      };

      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          context: contextPayload
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to communicate with AI Copilot');
      }

      const data = await response.json();

      const aiMsg: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);

    } catch (err: any) {
      const aiMsg: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ Error: ${err.message || 'Something went wrong while contacting the Copilot service.'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedClick = (actionLabel: string) => {
    handleSend(undefined, actionLabel);
  };

  return (
    <div className="flex flex-col h-[600px] bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-brand-bg p-4 border-b border-brand-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-brand-text font-display font-bold flex items-center gap-2">
            AI Copilot
            <span className="bg-brand-accent/20 text-brand-accent text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-mono animate-pulse">
              Gemini Enabled
            </span>
          </h2>
          <p className="text-[#9CB1AC] text-xs">Platform intelligence and administrative assistance</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-brand-bg/30">
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-brand-surface text-brand-text' : 'bg-brand-accent/10 text-brand-accent'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            
            <div className={`max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-brand-surface text-brand-text rounded-tr-sm' 
                : 'bg-brand-bg border border-brand-border text-[#9CB1AC] rounded-tl-sm space-y-1'
            }`}>
              {msg.role === 'user' ? msg.content : renderMessageContent(msg.content)}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center shrink-0 text-brand-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-brand-bg border border-brand-border rounded-2xl rounded-tl-sm p-4 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Suggested Actions (Only show if empty or just started) */}
      {messages.length <= 2 && (
        <div className="px-6 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestedActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestedClick(action.label)}
                className="flex items-center gap-1.5 text-xs bg-brand-bg border border-brand-border text-[#9CB1AC] px-3 py-1.5 rounded-full hover:bg-brand-surface hover:text-brand-text transition-colors cursor-pointer"
              >
                <action.icon className="w-3 h-3 text-brand-accent" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-brand-bg border-t border-brand-border">
        <form onSubmit={(e) => handleSend(e)} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Copilot to summarize metrics, audit users, or check licenses..."
            className="w-full bg-brand-card border border-brand-border text-brand-text px-4 py-3 pr-12 rounded-xl focus:outline-none focus:border-brand-accent placeholder:text-[#9CB1AC]/50 text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-brand-accent text-[#050E0C] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00E676] transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[10px] text-[#9CB1AC]/50 mt-2">
          AI Copilot uses live telemetry & Google Gemini 3.5. Action audits should be verified.
        </p>
      </div>
    </div>
  );
}
