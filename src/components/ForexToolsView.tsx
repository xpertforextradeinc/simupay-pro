import React from 'react';
import { 
  TrendingUp, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe2
} from 'lucide-react';

export default function ForexToolsView() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-display font-bold text-brand-text flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-brand-accent" /> Forex Trading Platforms
        </h2>
        <p className="text-brand-text-muted text-sm">Recommended brokers and trading platforms for execution.</p>
      </header>

      <div className="bg-brand-card rounded-2xl border border-brand-border/40 shadow-2xl overflow-hidden min-h-[600px] flex flex-col p-8 items-center justify-center relative">
        {/* Background Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-2xl w-full space-y-8 relative z-10 text-center">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-brand-surface/30 border border-brand-accent/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-900/20">
              <TrendingUp className="w-10 h-10 text-brand-accent" />
            </div>
            <h3 className="text-3xl font-display font-bold text-brand-text">Start Trading with LiteFinance</h3>
            <p className="text-brand-text-muted text-lg leading-relaxed">
              We recommend LiteFinance for its low spreads, fast execution, and excellent copy-trading platform. Perfect for both beginners and experienced traders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-brand-card border border-brand-border/50 p-4 rounded-xl flex items-start gap-3">
              <Zap className="w-5 h-5 text-brand-accent mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-brand-text">Fast Execution</h4>
                <p className="text-xs text-brand-text-dim mt-1">ECN technology for instant market execution.</p>
              </div>
            </div>
            <div className="bg-brand-card border border-brand-border/50 p-4 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-brand-accent mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-brand-text">Regulated & Secure</h4>
                <p className="text-xs text-brand-text-dim mt-1">15+ years of reliable brokerage services.</p>
              </div>
            </div>
            <div className="bg-brand-card border border-brand-border/50 p-4 rounded-xl flex items-start gap-3">
              <Globe2 className="w-5 h-5 text-brand-accent mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-brand-text">Social Trading</h4>
                <p className="text-xs text-brand-text-dim mt-1">Copy successful traders automatically.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-brand-border/40">
            <button 
              disabled
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-card border border-brand-border/50 text-brand-text-dim font-bold rounded-xl text-lg cursor-not-allowed transition-all"
            >
              Partner Link Coming Soon
              <ExternalLink className="w-5 h-5 opacity-50" />
            </button>
            <p className="text-xs text-brand-text-dim mt-4">
              *We are currently finalizing our official partnership with our recommended broker. Check back soon for exclusive signup bonuses!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
