import React from 'react';
import { ExternalLink, CheckCircle, Shield, ArrowUpRight } from 'lucide-react';
import { partners, DISCLOSURE_TEXT } from '../data/partners';

export function ResourcesView() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="border-b border-[#16362F] pb-5">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#00C853]" />
          <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">
            Partner Resources
          </h2>
        </div>
        <p className="text-xs text-gray-500 mt-1 max-w-2xl">
          Carefully curated tools and platforms to streamline your digital asset transactions. Get exclusive terms by registering through SlipMint partner nodes.
        </p>
      </div>

      {/* Partners List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partners.map((partner) => (
          <div 
            key={partner.id} 
            className="bg-[#091714] border border-[#16362F] hover:border-[#00C853]/40 p-6 rounded-2xl flex flex-col justify-between space-y-6 transition-all duration-300 shadow-xl relative overflow-hidden group"
          >
            {/* Top decorative glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-300 pointer-events-none" />
            
            <div className="space-y-4">
              {/* Partner Category Badge & Top Row */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-wider bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-950">
                  {partner.category}
                </span>
                
                {partner.badge && (
                  <span className="text-[9px] uppercase font-bold text-[#00C853] bg-[#00C853]/10 border border-[#00C853]/20 px-2 py-0.5 rounded-full font-mono">
                    {partner.badge}
                  </span>
                )}
              </div>

              {/* Partner Name & Description */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5 font-display">
                  {partner.name}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {partner.description}
                </p>
              </div>

              {/* Benefits checklist */}
              {partner.benefits && partner.benefits.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#16362F]/40">
                  <span className="text-[10px] font-bold text-gray-500 uppercase font-mono tracking-wider">Key Benefits</span>
                  <ul className="space-y-1.5">
                    {partner.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                        <CheckCircle className="w-3.5 h-3.5 text-[#00C853] mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action button */}
            <div className="pt-2">
              <a
                href={partner.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#00C853] hover:bg-[#00E676] text-black font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all duration-300 transform active:scale-[0.98] cursor-pointer"
              >
                {partner.buttonText}
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Trading Resources & Learning Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-brand-card p-6 rounded-2xl border border-emerald-950/40 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-emerald-950/30 pb-2">Trading Resources</h3>
          <div className="space-y-3">
            {[
              { title: "Market Analysis Tools", link: "https://www.tradingview.com/markets/" },
              { title: "Risk Management Templates", link: "https://www.babypips.com/trading-tools" },
              { title: "Trade Journal System", link: "https://www.edgewonk.com/" },
              { title: "Asset Correlation Matrix", link: "https://www.myfxbook.com/forex-calculators/correlation" }
            ].map((item, idx) => (
              <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-brand-bg/40 rounded-xl border border-emerald-950/20 group hover:border-[#00C853]/30 transition-all cursor-pointer">
                <span className="text-xs text-gray-400 group-hover:text-gray-200">{item.title}</span>
                <ExternalLink className="w-3 h-3 text-emerald-600 group-hover:text-[#00C853] transition-colors" />
              </a>
            ))}
          </div>
        </div>

        <div className="bg-brand-card p-6 rounded-2xl border border-emerald-950/40 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-emerald-950/30 pb-2">Learning Articles</h3>
          <div className="space-y-3">
            {[
              { title: "Introduction to Forex Trading", link: "https://www.babypips.com/learn/forex" },
              { title: "Understanding Crypto Wallets", link: "https://academy.binance.com/en/articles/crypto-wallet-types-explained" },
              { title: "Secure Transaction Best Practices", link: "https://www.ledger.com/academy/security" },
              { title: "Enterprise Risk Mitigation", link: "https://www.investopedia.com/articles/forex/11/forex-risk-management-tools.asp" }
            ].map((item, idx) => (
              <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-brand-bg/40 rounded-xl border border-emerald-950/20 group hover:border-[#00C853]/30 transition-all cursor-pointer">
                <span className="text-xs text-gray-400 group-hover:text-gray-200">{item.title}</span>
                <ExternalLink className="w-3 h-3 text-emerald-600 group-hover:text-[#00C853] transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Affiliate Disclosure Box */}
      <div className="bg-[#050E0C] border border-[#16362F]/50 p-4 rounded-xl text-[11px] text-gray-500 font-mono leading-relaxed text-center">
        {DISCLOSURE_TEXT}
      </div>
    </div>
  );
}
