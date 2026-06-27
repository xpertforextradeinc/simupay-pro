import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, X, Info, AlertTriangle, ExternalLink } from 'lucide-react';
import { Transaction, AppNotification, ActiveTab } from '../types';
import { dbService } from '../services/dbService';

// Helper to build smart notification messages
export const buildTransactionNotification = (tx: Transaction, direction: 'incoming' | 'outgoing' = 'incoming'): Omit<AppNotification, 'id' | 'user_id' | 'created_at' | 'read'> => {
  const isIncoming = direction === 'incoming';
  
  let title = '';
  let message = '';
  let type: AppNotification['type'] = 'info';

  if (tx.status === 'completed') {
    type = 'success';
    title = `${tx.network} ${isIncoming ? 'Received' : 'Sent'}`;
    message = `Your ${tx.network} transaction of ${tx.amount} has been successfully ${isIncoming ? 'received' : 'sent'}.`;
  } else if (tx.status === 'failed') {
    type = 'error';
    title = 'Transaction Failed';
    message = `Your transaction of ${tx.amount} on ${tx.network} could not be completed. Please contact support.`;
  } else {
    type = 'warning';
    title = 'Transaction Pending';
    message = `Your transaction of ${tx.amount} on ${tx.network} is currently pending confirmation.`;
  }

  return { title, message, type };
};

// Hook for integration
export function useTransactionNotifier(userId: string, onRefresh: () => void) {
  const notifyTransaction = useCallback(async (tx: Transaction, direction: 'incoming' | 'outgoing' = 'incoming') => {
    try {
      if (!userId) return;
      const notificationData = buildTransactionNotification(tx, direction);
      await dbService.createNotification(userId, notificationData.title, notificationData.message, notificationData.type);
      onRefresh();
    } catch (error) {
      console.error('Failed to create notification', error);
    }
  }, [userId, onRefresh]);

  return { notifyTransaction };
}

// UI Component: Notification Bell
export const TransactionNotificationBell: React.FC<{
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (tab: ActiveTab) => void;
}> = ({ notifications, onMarkRead, onMarkAllRead, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-emerald-950/40 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 w-80 bg-brand-card border border-emerald-950/40 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-emerald-950/40 bg-brand-bg">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            <button onClick={onMarkAllRead} className="text-[10px] text-[#00C853] hover:text-emerald-400">Mark all read</button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">No notifications</div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div key={n.id} className={`p-3 border-b border-emerald-950/20 ${!n.read ? 'bg-emerald-950/10' : ''}`}>
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white">{n.title}</h4>
                    {!n.read && <button onClick={() => onMarkRead(n.id)} className="text-[10px] text-[#00C853]">Mark read</button>}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{n.message}</p>
                </div>
              ))
            )}
          </div>
          
          <button 
            onClick={() => { setIsOpen(false); onNavigate('notifications'); }}
            className="w-full p-2 text-xs text-center text-gray-300 bg-brand-bg hover:bg-emerald-950/40"
          >
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};
