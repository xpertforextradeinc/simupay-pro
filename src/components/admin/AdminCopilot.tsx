import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bot, Send, User, Sparkles, Zap, Shield, Search, Terminal } from 'lucide-react';

interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AdminCopilot() {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([{
    id: 'msg-1',
    role: 'assistant',
    content: "Hello! I'm your AI Copilot. How can I assist you with platform administration today?",
    timestamp: new Date()
  }]);

  // Reusable Action Registry for future Gemini Integration
  const actionRegistry: Record<string, { description: string, placeholderResponse: string }> = {
    search_users: {
      description: "Search Users",
      placeholderResponse: "User search functionality will be activated once Gemini is connected. This will invoke the `search_users` function call to query the database."
    },
    search_transactions: {
      description: "Search Transactions",
      placeholderResponse: "Transaction search functionality will be activated once Gemini is connected. This will invoke the `search_transactions` function call to filter ledger records."
    },
    review_subscriptions: {
      description: "Review Subscriptions",
      placeholderResponse: "Subscription review functionality will be activated once Gemini is connected. This will invoke the `review_subscriptions` function call to analyze plans."
    },
    summarize_activity: {
      description: "Summarize Platform Activity",
      placeholderResponse: "Activity summarization will be activated once Gemini is connected. This will invoke the `summarize_activity` function call to analyze recent platform metrics."
    },
    generate_reports: {
      description: "Generate Reports",
      placeholderResponse: "Report generation will be activated once Gemini is connected. This will invoke the `generate_reports` function call to compile data."
    },
    view_audit_logs: {
      description: "View Audit Logs",
      placeholderResponse: "Audit log viewing will be activated once Gemini is connected. This will invoke the `view_audit_logs` function call to retrieve system events."
    }
  };

  const suggestedActions = [
    { id: 'search_users', label: "Search Users", icon: Search },
    { id: 'search_transactions', label: "Search Transactions", icon: Search },
    { id: 'review_subscriptions', label: "Review Subscriptions", icon: Shield },
    { id: 'summarize_activity', label: "Summarize Platform Activity", icon: Zap },
    { id: 'generate_reports', label: "Generate Reports", icon: Terminal },
    { id: 'view_audit_logs', label: "View Audit Logs", icon: Terminal }
  ];

  const handleSend = (e?: React.FormEvent, customInput?: string) => {
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
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Determine if it matches an action registry item (for demo purposes)
    let aiResponse = "I'm currently in UI-only mode. Gemini integration will be activated in a future update to handle natural language requests.";
    
    const matchedAction = Object.values(actionRegistry).find(a => query.toLowerCase().includes(a.description.toLowerCase()));
    if (matchedAction) {
      aiResponse = matchedAction.placeholderResponse;
    }

    // Simulate AI response delay
    setTimeout(() => {
      const aiMsg: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestedClick = (actionLabel: string) => {
    handleSend(undefined, actionLabel);
  };

  return (
    <div className="flex flex-col h-[600px] bg-[#091714] border border-[#16362F] rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-[#050E0C] p-4 border-b border-[#16362F] flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#00C853]/10 flex items-center justify-center text-[#00C853]">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-white font-display font-bold flex items-center gap-2">
            AI Copilot
            <span className="bg-[#00C853]/20 text-[#00C853] text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">
              Beta
            </span>
          </h2>
          <p className="text-[#9CB1AC] text-xs">Platform intelligence and administrative assistance</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-[#050E0C]/30">
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-[#16362F] text-white' : 'bg-[#00C853]/10 text-[#00C853]'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            
            <div className={`max-w-[75%] rounded-2xl p-4 text-sm ${
              msg.role === 'user' 
                ? 'bg-[#16362F] text-white rounded-tr-sm' 
                : 'bg-[#050E0C] border border-[#16362F] text-[#9CB1AC] rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-[#00C853]/10 flex items-center justify-center shrink-0 text-[#00C853]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-[#050E0C] border border-[#16362F] rounded-2xl rounded-tl-sm p-4 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-[#00C853] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-[#00C853] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-[#00C853] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                className="flex items-center gap-1.5 text-xs bg-[#050E0C] border border-[#16362F] text-[#9CB1AC] px-3 py-1.5 rounded-full hover:bg-[#16362F] hover:text-white transition-colors"
              >
                <action.icon className="w-3 h-3 text-[#00C853]" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-[#050E0C] border-t border-[#16362F]">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Copilot to search users, summarize data, or review limits..."
            className="w-full bg-[#091714] border border-[#16362F] text-white px-4 py-3 pr-12 rounded-xl focus:outline-none focus:border-[#00C853] placeholder:text-[#9CB1AC]/50 text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-[#00C853] text-[#050E0C] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00E676] transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[10px] text-[#9CB1AC]/50 mt-2">
          AI Copilot may produce inaccurate results. Verify administrative actions manually.
        </p>
      </div>
    </div>
  );
}
