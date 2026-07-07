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
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#00C853]" /> Forex Trading Platforms
        </h2>
        <p className="text-gray-400 text-sm">Recommended brokers and trading platforms for execution.</p>
      </header>

      <div className="bg-brand-card rounded-2xl border border-emerald-950/40 shadow-2xl overflow-hidden min-h-[600px] flex flex-col p-8 items-center justify-center relative">
        {/* Background Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00C853]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-2xl w-full space-y-8 relative z-10 text-center">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-emerald-950/30 border border-[#00C853]/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-900/20">
              <TrendingUp className="w-10 h-10 text-[#00C853]" />
            </div>
            <h3 className="text-3xl font-display font-bold text-white">Start Trading with LiteFinance</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              We recommend LiteFinance for its low spreads, fast execution, and excellent copy-trading platform. Perfect for both beginners and experienced traders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-[#091714] border border-emerald-950/50 p-4 rounded-xl flex items-start gap-3">
              <Zap className="w-5 h-5 text-[#00C853] mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Fast Execution</h4>
                <p className="text-xs text-gray-500 mt-1">ECN technology for instant market execution.</p>
              </div>
            </div>
            <div className="bg-[#091714] border border-emerald-950/50 p-4 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#00C853] mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Regulated & Secure</h4>
                <p className="text-xs text-gray-500 mt-1">15+ years of reliable brokerage services.</p>
              </div>
            </div>
            <div className="bg-[#091714] border border-emerald-950/50 p-4 rounded-xl flex items-start gap-3">
              <Globe2 className="w-5 h-5 text-[#00C853] mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Social Trading</h4>
                <p className="text-xs text-gray-500 mt-1">Copy successful traders automatically.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-emerald-950/40">
            <button 
              disabled
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#091714] border border-emerald-950/50 text-gray-500 font-bold rounded-xl text-lg cursor-not-allowed transition-all"
            >
              Partner Link Coming Soon
              <ExternalLink className="w-5 h-5 opacity-50" />
            </button>
            <p className="text-xs text-gray-500 mt-4">
              *We are currently finalizing our official partnership with our recommended broker. Check back soon for exclusive signup bonuses!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
