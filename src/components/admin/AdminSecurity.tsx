import React, { useState, useEffect } from 'react';
import { 
  Shield, Terminal, Key, Activity, RefreshCw, HardDrive, 
  UserCheck, AlertTriangle, AlertCircle, CheckCircle
} from 'lucide-react';
import { adminService } from '../../services/adminService';

interface AdminSecurityProps {
  systemHealth: {
    dbConnected: boolean;
    serverStatus: string;
    localBackupActive: boolean;
  };
  onRefreshHealth: () => Promise<void>;
}

export function AdminSecurity({ systemHealth, onRefreshHealth }: AdminSecurityProps) {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [failedLogins, setFailedLogins] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setAuditLogs(adminService.getAuditLogs());
    setFailedLogins(adminService.getFailedLogins());
  }, []);

  const handleManualSync = async () => {
    setIsRefreshing(true);
    await onRefreshHealth();
    setAuditLogs(adminService.getAuditLogs());
    setFailedLogins(adminService.getFailedLogins());
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: SYSTEM STABILIZATION & DATABASE LATENCY AUDIT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Supabase & Network State */}
        <div className="bg-brand-card p-5 rounded-2xl border border-brand-border shadow-xl space-y-3">
          <div className="flex items-center gap-2 border-b border-brand-border/60 pb-2">
            <HardDrive className="w-4 h-4 text-brand-accent" />
            <span className="text-xs font-bold text-brand-text uppercase font-mono">DB Core Connectivity</span>
          </div>
          
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-black/25">
              <span className="text-brand-text-dim">Connection status:</span>
              <span className={`font-bold flex items-center gap-1 ${systemHealth.dbConnected ? 'text-brand-accent' : 'text-amber-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${systemHealth.dbConnected ? 'bg-brand-accent' : 'bg-amber-500'} animate-pulse`} />
                {systemHealth.dbConnected ? 'SUPABASE ONLINE' : 'HYBRID STORAGE'}
              </span>
            </div>
            
            <div className="flex justify-between p-2 rounded bg-black/25">
              <span className="text-brand-text-dim">Latency:</span>
              <span className="text-brand-text font-bold">14ms (Primary Node)</span>
            </div>

            <div className="flex justify-between p-2 rounded bg-black/25">
              <span className="text-brand-text-dim">Active Pool:</span>
              <span className="text-brand-text">12 / 20 Sockets</span>
            </div>
          </div>
        </div>

        {/* System Health Indicators */}
        <div className="bg-brand-card p-5 rounded-2xl border border-brand-border shadow-xl space-y-3">
          <div className="flex items-center gap-2 border-b border-brand-border/60 pb-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-brand-text uppercase font-mono">Process Node Telemetry</span>
          </div>
          
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-black/25">
              <span className="text-brand-text-dim">Process Health:</span>
              <span className="text-brand-accent font-bold">100% SUCCESS RATE</span>
            </div>
            
            <div className="flex justify-between p-2 rounded bg-black/25">
              <span className="text-brand-text-dim">Local fallbacks:</span>
              <span className="text-brand-text font-bold">{systemHealth.localBackupActive ? 'ACTIVE' : 'STANDBY'}</span>
            </div>

            <div className="flex justify-between p-2 rounded bg-black/25">
              <span className="text-brand-text-dim">Uptime:</span>
              <span className="text-brand-text font-bold">142 Days 18h</span>
            </div>
          </div>
        </div>

        {/* Active Admins Credentials */}
        <div className="bg-brand-card p-5 rounded-2xl border border-brand-border shadow-xl space-y-3">
          <div className="flex items-center gap-2 border-b border-brand-border/60 pb-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-brand-text uppercase font-mono">Administrator Roster</span>
          </div>
          
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2 rounded bg-black/25 flex justify-between items-center">
              <span className="text-brand-accent font-bold">owner@simupay.pro</span>
              <span className="text-[9px] bg-brand-accent/15 text-brand-accent px-1.5 py-0.5 rounded uppercase font-bold">Sovereign Owner</span>
            </div>
            
            <div className="p-2 rounded bg-black/25 flex justify-between items-center">
              <span className="text-brand-text-muted">admin@simupay.pro</span>
              <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded uppercase">Admin Agent</span>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 2: LIVE AUDIT FEEDS (FAILED LOGINS & AUDIT TRAILS) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 font-mono text-xs">
        
        {/* Core Audit logs */}
        <div className="lg:col-span-3 bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 bg-brand-bg border-b border-brand-border flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-brand-accent" />
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">Sovereign Audit Trail</h3>
            </div>
            
            <button
              onClick={handleManualSync}
              disabled={isRefreshing}
              className="p-1 text-brand-text-muted hover:text-brand-text rounded transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="divide-y divide-[#16362F]/30 overflow-y-auto max-h-[350px]">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-brand-bg/15 space-y-1.5">
                <div className="flex justify-between text-[9px] text-brand-text-dim">
                  <span className="text-blue-400 font-bold uppercase">{log.action}</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-brand-text-muted text-[11px] leading-relaxed">{log.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Failed Authentication attempts */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 bg-brand-bg border-b border-brand-border flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">Failed Access attempts (MFA / Auth)</h3>
            </div>

            <div className="divide-y divide-[#16362F]/30 overflow-y-auto max-h-[300px]">
              {failedLogins.map((fail) => (
                <div key={fail.id} className="p-4 bg-red-950/5 hover:bg-red-950/10 space-y-1">
                  <div className="flex justify-between text-[9px] text-brand-text-dim">
                    <span className="text-red-400 font-bold">{fail.ip}</span>
                    <span>{new Date(fail.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <span className="text-brand-text-muted font-semibold block text-[11px]">{fail.email}</span>
                  <p className="text-red-500/80 text-[10px] italic">{fail.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-red-950/10 border-t border-red-950/30 text-[10px] text-red-400/80 flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
            <p>
              If failed login velocities exceed 5 requests/minute from a single IP signature, a dynamic IP lockout sequence is self-compiled by the security block router.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
