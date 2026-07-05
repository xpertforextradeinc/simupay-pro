import React, { useState } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  Newspaper, 
  Activity, 
  Clock, 
  BarChart2, 
  PieChart,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';
import { TradingViewWidget } from './TradingViewWidget';

type ToolId = 'calendar' | 'news' | 'strength' | 'rates' | 'charts' | 'sentiment';

export default function ForexToolsView() {
  const [activeTool, setActiveTool] = useState<ToolId>('calendar');

  const tools = [
    { id: 'calendar', title: 'Economic Calendar', icon: Calendar },
    { id: 'news', title: 'Live News', icon: Newspaper },
    { id: 'strength', title: 'Currency Heatmap', icon: Activity },
    { id: 'rates', title: 'Live Rates', icon: TrendingUp },
    { id: 'charts', title: 'Advanced Charts', icon: BarChart2 },
    { id: 'sentiment', title: 'Market Sentiment', icon: PieChart },
  ] as const;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#00C853]" /> Forex Trading Tools
        </h2>
        <p className="text-gray-400 text-sm">Professional financial data and market utility suite.</p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono whitespace-nowrap transition-colors border ${
              activeTool === tool.id 
                ? 'bg-[#00C853]/10 text-[#00C853] border-[#00C853]/30' 
                : 'bg-brand-card text-gray-400 border-emerald-950/40 hover:text-white hover:border-emerald-950/80'
            }`}
          >
            <tool.icon className="w-4 h-4" />
            {tool.title}
          </button>
        ))}
      </div>

      <div className="bg-brand-card rounded-2xl border border-emerald-950/40 shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-4 border-b border-emerald-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tools.find(t => t.id === activeTool)?.icon({ className: "w-5 h-5 text-[#00C853]" })}
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{tools.find(t => t.id === activeTool)?.title}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
            <ShieldAlert className="w-3 h-3" />
            REAL-TIME_FEED
          </div>
        </div>
        
        <div className="flex-1 w-full relative">
          {activeTool === 'calendar' && (
            <iframe 
              src="https://widget.myfxbook.com/widget/calendar.html?lang=en&impacts=0,1,2,3&symbols=AUD,CAD,CHF,CNY,EUR,GBP,JPY,NZD,USD" 
              className="w-full h-full absolute inset-0 border-0 bg-transparent grayscale opacity-90 contrast-125"
              title="Economic Calendar"
              loading="lazy"
            />
          )}

          {activeTool === 'news' && (
            <TradingViewWidget 
              containerId="news"
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-timeline.js"
              config={{
                "feedMode": "all_symbols",
                "isTransparent": true,
                "displayMode": "regular",
                "width": "100%",
                "height": "100%",
                "colorTheme": "dark",
                "locale": "en"
              }}
            />
          )}

          {activeTool === 'strength' && (
            <TradingViewWidget 
              containerId="heatmap"
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-forex-heat-map.js"
              config={{
                "width": "100%",
                "height": "100%",
                "currencies": ["EUR","USD","JPY","GBP","CHF","AUD","CAD","NZD","CNY"],
                "isTransparent": true,
                "colorTheme": "dark",
                "locale": "en"
              }}
            />
          )}

          {activeTool === 'rates' && (
            <TradingViewWidget 
              containerId="rates"
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js"
              config={{
                "width": "100%",
                "height": "100%",
                "currencies": ["EUR","USD","JPY","GBP","CHF","AUD","CAD","NZD"],
                "isTransparent": true,
                "colorTheme": "dark",
                "locale": "en"
              }}
            />
          )}

          {activeTool === 'charts' && (
            <TradingViewWidget 
              containerId="charts"
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
              config={{
                "autosize": true,
                "symbol": "FX:EURUSD",
                "interval": "D",
                "timezone": "Etc/UTC",
                "theme": "dark",
                "style": "1",
                "locale": "en",
                "enable_publishing": false,
                "backgroundColor": "rgba(9, 23, 20, 1)",
                "gridColor": "rgba(22, 54, 47, 0.4)",
                "hide_top_toolbar": false,
                "hide_legend": false,
                "save_image": false,
                "support_host": "https://www.tradingview.com"
              }}
            />
          )}

          {activeTool === 'sentiment' && (
            <TradingViewWidget 
              containerId="sentiment"
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js"
              config={{
                "interval": "1m",
                "width": "100%",
                "isTransparent": true,
                "height": "100%",
                "symbol": "FX:EURUSD",
                "showIntervalTabs": true,
                "displayMode": "single",
                "locale": "en",
                "colorTheme": "dark"
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
