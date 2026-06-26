import React from 'react';
import { Bell, Check, Trash2, Shield, AlertTriangle, XCircle, Info, CheckSquare } from 'lucide-react';
import { AppNotification } from '../types';
import { dbService } from '../services/dbService';
import { useToast } from './Toast';

interface NotificationsViewProps {
  userId: string;
  notifications: AppNotification[];
  onRefresh: () => void;
}

export function NotificationsView({ userId, notifications, onRefresh }: NotificationsViewProps) {
  const { showToast } = useToast();

  const handleMarkRead = async (id: string) => {
    try {
      await dbService.markNotificationRead(userId, id);
      showToast('Notification marked as read.', 'success');
      onRefresh();
    } catch (e) {
      showToast('Failed to update notification.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dbService.deleteNotification(userId, id);
      showToast('Notification deleted successfully.', 'success');
      onRefresh();
    } catch (e) {
      showToast('Failed to delete notification.', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) {
      showToast('All notifications are already read.', 'info');
      return;
    }

    try {
      for (const n of unread) {
        await dbService.markNotificationRead(userId, n.id);
      }
      showToast('All notifications marked as read.', 'success');
      onRefresh();
    } catch (e) {
      showToast('Failed to update notifications.', 'error');
    }
  };

  const getTypeStyle = (type: AppNotification['type']) => {
    switch (type) {
      case 'success':
        return {
          icon: Shield,
          color: 'text-[#00C853]',
          bg: 'bg-[#00C853]/10',
          border: 'border-[#00C853]/20',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-amber-500',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
        };
      case 'info':
      default:
        return {
          icon: Info,
          color: 'text-blue-400',
          bg: 'bg-blue-400/10',
          border: 'border-blue-400/20',
        };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#16362F]/60 pb-5">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Security Notifications</h2>
          <p className="text-xs text-[#9CB1AC]">Review system telemetry notices, ledger updates, and license allocation alerts.</p>
        </div>
        
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 bg-[#16362F] hover:bg-[#1f4e43] text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border border-emerald-950/40"
          >
            <CheckSquare className="w-4 h-4 text-[#00C853]" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-brand-card p-12 rounded-2xl border border-emerald-950/40 shadow-xl text-center space-y-3 flex flex-col items-center">
          <div className="p-4 bg-emerald-950/30 rounded-full border border-emerald-900/30">
            <Bell className="w-8 h-8 text-emerald-800" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">Your log is completely clear</h3>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
              No recent security logs or audit notifications have been dispatched to your merchant node.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const style = getTypeStyle(notif.type);
            const Icon = style.icon;

            return (
              <div
                key={notif.id}
                className={`p-4 bg-brand-card rounded-xl border flex gap-4 items-start justify-between transition-all group
                  ${notif.read ? 'opacity-70 border-emerald-950/25' : `${style.border} border`}
                `}
              >
                <div className="flex gap-3.5 items-start">
                  <div className={`p-2.5 rounded-xl ${style.bg} ${style.color} shrink-0 border ${style.border}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs font-bold text-white tracking-wide">{notif.title}</h4>
                      {!notif.read && (
                        <span className="text-[9px] bg-[#00C853]/15 text-[#00C853] font-mono font-bold px-1.5 py-0.2 rounded">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">{notif.message}</p>
                    <span className="text-[10px] text-gray-500 font-mono block pt-1">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1 shrink-0">
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="p-1.5 rounded-lg bg-emerald-950/40 text-[#00C853] hover:bg-[#00C853]/15 border border-[#00C853]/10 transition-colors cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-1.5 rounded-lg bg-red-950/20 text-red-400 hover:bg-red-500/10 border border-red-500/10 transition-colors cursor-pointer"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
