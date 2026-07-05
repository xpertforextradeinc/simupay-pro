import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2 } from 'lucide-react';

export function UserChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hi there! I am your trading companion. How can I help you learn about the markets today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch('/api/user/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMsg }] })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-[#00C853] p-4 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          <Bot className="w-6 h-6 text-black" />
        </button>
      )}
      {isOpen && (
        <div className="w-80 h-96 bg-brand-card border border-emerald-950/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-emerald-950/50 flex justify-between items-center bg-[#050E0C]">
            <span className="font-bold text-xs text-white">Trading Assistant</span>
            <button onClick={() => setIsOpen(false)}><X className="w-4 h-4 text-gray-500" /></button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`p-2 rounded-lg text-xs ${m.role === 'user' ? 'bg-[#00C853]/20 ml-auto max-w-[80%]' : 'bg-brand-bg mr-auto max-w-[80%]'}`}>
                {m.content}
              </div>
            ))}
            {loading && <Loader2 className="w-4 h-4 animate-spin text-[#00C853]" />}
            <div ref={chatEndRef} />
          </div>
          <div className="p-2 border-t border-emerald-950/50 flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-brand-bg text-white text-xs p-2 rounded-lg border border-emerald-950/50"
              placeholder="Ask me anything..."
            />
            <button onClick={handleSend} className="bg-[#00C853] p-2 rounded-lg"><Send className="w-4 h-4 text-black" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
