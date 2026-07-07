import React, { useState } from 'react';
import { 
  Bell, Volume2, HelpCircle, Reply, CheckCircle, Search, Clock, 
  MessageSquare, Send, Users, Sparkles, AlertCircle, X
} from 'lucide-react';
import { SupportTicket, AppNotification } from '../../types';
import { adminService } from '../../services/adminService';

interface AdminNotificationsAndSupportProps {
  tickets: SupportTicket[];
  onReplyTicket: (ticketId: string, replyMessage: string) => Promise<void>;
  onCloseTicket: (ticketId: string) => Promise<void>;
  onBroadcastNotification: (title: string, message: string, target: 'all' | 'premium' | 'free' | 'selected', selectedUserId?: string) => Promise<void>;
}

export function AdminNotificationsAndSupport({
  tickets,
  onReplyTicket,
  onCloseTicket,
  onBroadcastNotification
}: AdminNotificationsAndSupportProps) {

  // Ticket desk states
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'open' | 'resolved' | 'pending'>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReply, setTicketReply] = useState('');

  // Notification center states
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifTarget, setNotifTarget] = useState<'all' | 'premium' | 'free' | 'selected'>('all');
  const [notifSelectedUserId, setNotifSelectedUserId] = useState('');
  const [broadcastCount, setBroadcastCount] = useState<number | null>(null);

  // Filtered support tickets
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.subject?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.message?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.user_id?.toLowerCase().includes(ticketSearch.toLowerCase());
      
    const matchesStatus = 
      ticketStatusFilter === 'all' || 
      t.status === ticketStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    await onBroadcastNotification(notifTitle, notifMessage, notifTarget, notifSelectedUserId || undefined);
    
    // Call administrative mock broadcast to show telemetry
    const count = await adminService.broadcastNotification(notifTarget, notifMessage, notifSelectedUserId);
    setBroadcastCount(count);
    
    setNotifTitle('');
    setNotifMessage('');
    setNotifSelectedUserId('');

    setTimeout(() => setBroadcastCount(null), 4000);
  };

  const handleSendTicketReply = async () => {
    if (!selectedTicket || !ticketReply.trim()) return;
    await onReplyTicket(selectedTicket.id, ticketReply);
    setTicketReply('');
    setSelectedTicket(null);
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* SECTION 1: SYSTEM ANNOUNCEMENT BROADCAST CENTER */}
        <form onSubmit={handleSendBroadcast} className="lg:col-span-2 bg-brand-card p-5 rounded-2xl border border-brand-border shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-2">
            <Volume2 className="w-4 h-4 text-brand-accent" />
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider font-mono">
              Announcements & Push Node
            </h3>
          </div>

          <div className="space-y-3.5 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-brand-text-muted uppercase tracking-wider">Announcement Headline</label>
              <input
                type="text"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="e.g. System Upgrades Completed"
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-2.5 py-1.5 text-brand-text focus:outline-none focus:border-brand-accent"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-brand-text-muted uppercase tracking-wider">Target Audience Segments</label>
              <select
                value={notifTarget}
                onChange={(e) => setNotifTarget(e.target.value as any)}
                className="w-full bg-brand-bg border border-brand-border rounded-lg p-2 text-brand-text focus:outline-none"
              >
                <option value="all">Broadcast globally (All Merchants)</option>
                <option value="premium">Premium Pro Merchants Only</option>
                <option value="free">Free Tier Trial accounts Only</option>
                <option value="selected">Target individual user segment</option>
              </select>
            </div>

            {notifTarget === 'selected' && (
              <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[9px] font-bold text-brand-text-muted uppercase tracking-wider">Target User ID</label>
                <input
                  type="text"
                  value={notifSelectedUserId}
                  onChange={(e) => setNotifSelectedUserId(e.target.value)}
                  placeholder="usr_921820..."
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-2.5 py-1.5 text-brand-text focus:outline-none focus:border-brand-accent"
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-brand-text-muted uppercase tracking-wider">Announcement Payload Body</label>
              <textarea
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                placeholder="Write detailed broadcast notice..."
                className="w-full bg-brand-bg border border-brand-border rounded-lg p-2 text-brand-text h-24 focus:outline-none focus:border-brand-accent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-accent hover:bg-emerald-400 text-[#050E0C] font-bold py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 shadow-lg"
            >
              <Bell className="w-3.5 h-3.5" /> Dispatch Broadcast Push
            </button>
          </div>

          {broadcastCount !== null && (
            <div className="bg-brand-bg p-3 rounded-xl border border-brand-accent/30 text-[10px] text-emerald-400 font-mono text-center flex items-center justify-center gap-1.5 animate-bounce">
              <CheckCircle className="w-4 h-4" /> Dispatched notice to {broadcastCount} active merchant sockets.
            </div>
          )}
        </form>

        {/* SECTION 2: COMPREHENSIVE TICKET SUPPORT DESK */}
        <div className="lg:col-span-3 bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 bg-brand-bg border-b border-brand-border flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-accent" />
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider font-mono">
                  Corporate Priority Support Queue
                </h3>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  placeholder="Search subject..."
                  className="bg-brand-bg border border-brand-border rounded-lg px-2.5 py-1 text-brand-text text-[10px] font-mono focus:outline-none"
                />
                <select
                  value={ticketStatusFilter}
                  onChange={(e) => setTicketStatusFilter(e.target.value as any)}
                  className="bg-brand-bg border border-brand-border rounded-lg px-2 py-1 text-brand-text text-[10px]"
                >
                  <option value="all">All</option>
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[300px] divide-y divide-[#16362F]/30 text-xs font-mono">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-brand-text-dim italic">No support tickets match filtration criteria.</div>
              ) : (
                filteredTickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className="p-4 hover:bg-brand-bg/15 cursor-pointer transition-colors flex justify-between items-start"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="space-y-1 min-w-0 pr-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-brand-text block">{ticket.subject}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase
                          ${ticket.status === 'open' ? 'bg-red-500/10 text-red-500' : ''}
                          ${ticket.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : ''}
                          ${ticket.status === 'resolved' ? 'bg-brand-accent/10 text-brand-accent' : ''}
                        `}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-brand-text-muted line-clamp-1 text-[11px]">{ticket.message}</p>
                      <span className="text-[9px] text-gray-600 block">From user: {ticket.user_id}</span>
                    </div>

                    <div className="text-[10px] text-gray-600 flex-shrink-0">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 bg-brand-bg/30 border-t border-brand-border text-[10px] text-brand-text-dim italic">
            * Clicking on a ticket opens the prioritized reply and closure console immediately.
          </div>
        </div>

      </div>

      {/* SUPPORT TICKET CONSOLE MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            {/* Header */}
            <div className="px-6 py-4 bg-brand-bg border-b border-brand-border flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-accent" />
                <h3 className="text-xs font-bold text-brand-text uppercase font-mono">Ticket Console: {selectedTicket.id}</h3>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="p-1 text-brand-text-muted hover:text-brand-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="space-y-1.5 bg-brand-bg p-4 rounded-xl border border-brand-border">
                <div className="flex justify-between text-[10px] text-brand-text-dim">
                  <span>SENDER: {selectedTicket.user_id}</span>
                  <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                </div>
                <h4 className="text-sm font-bold text-brand-text">{selectedTicket.subject}</h4>
                <p className="text-brand-text-muted leading-relaxed pt-2 text-[11px] whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>

              {/* Reply field */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-brand-text-muted uppercase tracking-wider">Priority Reply Message Payload</label>
                <textarea
                  value={ticketReply}
                  onChange={(e) => setTicketReply(e.target.value)}
                  placeholder="Type prioritized reply instructions..."
                  className="w-full bg-brand-bg border border-brand-border rounded-xl p-3 text-brand-text h-24 focus:outline-none focus:border-brand-accent"
                />
              </div>

              {/* Controls */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={async () => {
                    await onCloseTicket(selectedTicket.id);
                    setSelectedTicket(null);
                  }}
                  className="px-4 py-2 bg-brand-surface text-brand-text hover:bg-slate-900 rounded-lg font-bold text-[10px] uppercase"
                >
                  Close & Mark Resolved
                </button>
                <button
                  onClick={handleSendTicketReply}
                  className="px-4 py-2 bg-brand-accent hover:bg-emerald-400 text-black rounded-lg font-bold text-[10px] uppercase flex items-center gap-1 shadow-lg"
                >
                  <Send className="w-3 h-3" /> Transmit Priority Reply
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
