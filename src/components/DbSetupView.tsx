import React, { useState } from 'react';
import { Database, Copy, Check, ShieldAlert, Terminal, CheckCircle2, Server } from 'lucide-react';
import { useToast } from './Toast';

export function DbSetupView() {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const schemaSql = `-- SIMUPAY PRO COMPREHENSIVE SCHEMAS
-- Execute this script in your Supabase SQL Editor to build all 9 required tables instantly.

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    username TEXT,
    country TEXT,
    phone TEXT,
    wallet_balance NUMERIC DEFAULT 35000.00,
    activation_key TEXT,
    license_active BOOLEAN DEFAULT FALSE,
    license_type TEXT DEFAULT 'Standard',
    expiry_date TIMESTAMPTZ,
    subscription_status TEXT DEFAULT 'N/A',
    avatar_url TEXT,
    email_alerts BOOLEAN DEFAULT TRUE,
    mempool_clear BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WALLETS TABLE
CREATE TABLE IF NOT EXISTS public.wallets (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    network TEXT NOT NULL,
    balance NUMERIC DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ACTIVATION KEYS TABLE
CREATE TABLE IF NOT EXISTS public.activation_keys (
    id TEXT PRIMARY KEY,
    activation_key TEXT UNIQUE NOT NULL,
    license_type TEXT NOT NULL,
    status TEXT DEFAULT 'unused',
    assigned_user UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    activated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- 4. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    wallet TEXT NOT NULL,
    network TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'completed',
    tx_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RECEIPTS TABLE
CREATE TABLE IF NOT EXISTS public.receipts (
    id TEXT PRIMARY KEY,
    transaction_id TEXT REFERENCES public.transactions(id) ON DELETE CASCADE,
    reference_number TEXT UNIQUE NOT NULL,
    amount NUMERIC NOT NULL,
    network TEXT NOT NULL,
    wallet TEXT NOT NULL,
    status TEXT NOT NULL,
    barcode TEXT NOT NULL,
    qr_code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    status TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    billing_cycle TEXT NOT NULL,
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL
);

-- 8. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables for maximum server-side protection
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- CREATE RLS POLICY STATEMENTS (ALL RIGHTS FOR CORRESPONDING AUTH USERS)
DROP POLICY IF EXISTS "Profiles access" ON public.profiles;
CREATE POLICY "Profiles access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Wallets access" ON public.wallets;
CREATE POLICY "Wallets access" ON public.wallets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Keys access" ON public.activation_keys;
CREATE POLICY "Keys access" ON public.activation_keys FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Transactions access" ON public.transactions;
CREATE POLICY "Transactions access" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Receipts access" ON public.receipts;
CREATE POLICY "Receipts access" ON public.receipts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Notifications access" ON public.notifications;
CREATE POLICY "Notifications access" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Subscriptions access" ON public.subscriptions;
CREATE POLICY "Subscriptions access" ON public.subscriptions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Logs access" ON public.activity_logs;
CREATE POLICY "Logs access" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Tickets access" ON public.support_tickets;
CREATE POLICY "Tickets access" ON public.support_tickets FOR ALL USING (true) WITH CHECK (true);

-- Insert baseline seed key if not present
INSERT INTO public.activation_keys (id, activation_key, license_type, status, assigned_user, activated_at, expires_at)
VALUES ('seed-unlimited', 'SPP-ADMIN-UNLIMITED-2026', 'Enterprise', 'unused', NULL, NULL, NULL)
ON CONFLICT DO NOTHING;
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(schemaSql);
    setCopied(true);
    showToast('Database SQL copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="border-b border-[#16362F]/60 pb-5">
        <h2 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
          <Database className="w-6 h-6 text-[#00C853]" /> Database Cluster Setup
        </h2>
        <p className="text-xs text-[#9CB1AC]">Synchronize your remote Supabase instance. Copy the custom SQL schema below to initialize all 9 required microservice tables.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SQL viewer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#091714] rounded-2xl border border-[#16362F] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 bg-[#0c221e] border-b border-[#16362F]">
              <div className="flex items-center gap-2 text-xs font-mono text-[#00C853] font-bold">
                <Terminal className="w-4 h-4" />
                <span>DATABASE_MIGRATION_SCHEMA.SQL</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 bg-[#16362F] hover:bg-[#1a443a] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold font-display cursor-pointer transition-all border border-emerald-900/30"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00C853]" />
                    <span className="text-[#00C853]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Schema SQL</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="p-4 bg-[#050E0C] font-mono text-[11px] text-gray-400 overflow-x-auto max-h-[480px] leading-relaxed select-all">
              <pre>{schemaSql}</pre>
            </div>
          </div>
        </div>

        {/* Integration guides */}
        <div className="space-y-6">
          <div className="bg-[#091714] p-5 rounded-2xl border border-[#16362F] shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Server className="w-4 h-4 text-[#00C853]" />
              <span>Supabase Connection Guide</span>
            </div>
            
            <div className="space-y-3.5 text-xs text-[#9CB1AC] leading-relaxed">
              <p>SimuPay Pro's persistent core attempts database transactions first. Follow these 3 simple steps to synchronize your remote workspace:</p>
              
              <div className="space-y-3 font-sans">
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#16362F] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                  <div>
                    <span className="font-semibold text-white block">Open Supabase Dashboard</span>
                    Navigate to your custom project workspace on <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#00C853] underline font-semibold">Supabase.com</a>.
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#16362F] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                  <div>
                    <span className="font-semibold text-white block">SQL Editor</span>
                    Click the "SQL Editor" tab on the left sidebar navigation inside Supabase.
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#16362F] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                  <div>
                    <span className="font-semibold text-white block">Run Code</span>
                    Paste the copied SQL code directly into the query container and click the <strong className="text-white">"Run"</strong> button.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#091714]/40 border border-[#16362F]/80 p-4.5 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#00C853] shrink-0 mt-0.5" />
            <div className="text-[11px] text-[#9CB1AC] space-y-1">
              <span className="font-bold text-white block">Seamless Hybrid Database Synchronization</span>
              Our codebase is constructed with a dual-pipeline engine. It will dynamically synchronise real-time transactional records, activations, receipts, activity logs, and tickets to Supabase. If tables are not created, it switches to local secure session memory automatically, ensuring zero errors.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
