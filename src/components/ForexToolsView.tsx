import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe2,
  Sliders,
  Cpu,
  History,
  Save,
  Copy,
  Check,
  Loader2,
  Activity,
  Sparkles,
  AlertTriangle,
  Gauge,
  Terminal,
  ArrowRight,
  Database,
  Smartphone,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../supabase';

interface ForexToolsViewProps {
  profile?: any;
}

interface ParsedAnalysis {
  directionalBias: string;
  directionalBiasConfidence: number;
  biasType: 'Bullish' | 'Bearish' | 'Neutral';
  keyDrivers: string[];
  fundamentalJustification: string;
  systemHealth: string[];
  technicalImprovement: string;
  businessRecommendation: string;
}

export default function ForexToolsView({ profile }: ForexToolsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'agent' | 'broker'>('agent');
  
  // Market Inputs
  const [goldPrice, setGoldPrice] = useState<number>(2350);
  const [dxy, setDxy] = useState<number>(104.2);
  const [tenYearYield, setTenYearYield] = useState<number>(2.1);
  
  // Workspace Metrics Inputs
  const [latency, setLatency] = useState<number>(850);
  const [poolLoad, setPoolLoad] = useState<number>(88);
  const [cacheAge, setCacheAge] = useState<number>(48);

  // States for AI Strategy Execution
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisText, setAnalysisText] = useState<string>('');
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<ParsedAnalysis | null>(null);

  // Supabase Table status & logs list
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Load saved analysis logs on mount
  useEffect(() => {
    fetchLogs();
  }, [profile]);

  const fetchLogs = async () => {
    if (!profile?.id) return;
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('beauty_breakout_logs')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          // Relation does not exist - this is expected if user has not run the SQL script
          setSaveError('Table "beauty_breakout_logs" does not exist yet.');
        } else {
          console.error('Error loading logs:', error);
        }
      } else if (data) {
        setLogs(data);
        setSaveError(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleRunAnalysis = async () => {
    setLoading(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const response = await fetch('/api/smart-workspace-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketPayload: {
            goldPrice: `$${goldPrice}/oz`,
            dxy: dxy.toString(),
            tenYearYield: `${tenYearYield}%`
          },
          workspaceMetrics: {
            financialApiLatency: `${latency}ms`,
            supabaseConnectionPool: `${poolLoad}% full`,
            lastCacheFlush: `${cacheAge} hours ago`
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.dashboardUpdate) {
        setAnalysisText(data.dashboardUpdate);
        setIsSimulated(!!data.isSimulated);
        const parsed = parseResponse(data.dashboardUpdate);
        setParsedData(parsed);
      } else {
        throw new Error(data.error || 'Failed to fetch insights');
      }
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || 'Error executing AI Operations Agent.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToSupabase = async () => {
    if (!profile?.id || !analysisText) return;
    setSaveSuccess(false);
    setSaveError(null);
    setShowSqlGuide(false);

    const campaign_traffic = `Gold: $${goldPrice}/oz, DXY: ${dxy}, Yield: ${tenYearYield}%`;
    const checkout_success_rate = `Supabase Pool: ${poolLoad}% full, Cache: ${cacheAge}h ago`;
    const api_latency = `Latency: ${latency}ms`;

    try {
      const { error } = await supabase
        .from('beauty_breakout_logs')
        .insert([
          {
            user_id: profile.id,
            campaign_traffic,
            checkout_success_rate,
            api_latency,
            analysis_text: analysisText
          }
        ]);

      if (error) {
        if (error.code === '42P01') {
          // Table missing
          setSaveError('Table "beauty_breakout_logs" relation not found. You must create this table on Supabase first.');
          setShowSqlGuide(true);
        } else {
          throw error;
        }
      } else {
        setSaveSuccess(true);
        fetchLogs();
      }
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || 'Failed to save to Supabase.');
    }
  };

  const parseResponse = (text: string): ParsedAnalysis => {
    const result: ParsedAnalysis = {
      directionalBias: 'Neutral',
      directionalBiasConfidence: 50,
      biasType: 'Neutral',
      keyDrivers: [],
      fundamentalJustification: '',
      systemHealth: [],
      technicalImprovement: '',
      businessRecommendation: ''
    };

    if (!text) return result;

    const parts = text.split(/=== DOMAIN 2: WORKSPACE & BUSINESS MAINTENANCE ===/i);
    const domain1 = parts[0] || '';
    const domain2 = parts[1] || '';

    // Parse Directional Bias
    const biasMatch = domain1.match(/## Directional Bias\s*\n*([^\n#]*)/i);
    if (biasMatch && biasMatch[1]) {
      const biasStr = biasMatch[1].trim();
      result.directionalBias = biasStr;
      if (biasStr.toLowerCase().includes('bullish')) {
        result.biasType = 'Bullish';
      } else if (biasStr.toLowerCase().includes('bearish')) {
        result.biasType = 'Bearish';
      } else {
        result.biasType = 'Neutral';
      }
      const confMatch = biasStr.match(/(\d+)\s*%/);
      if (confMatch && confMatch[1]) {
        result.directionalBiasConfidence = parseInt(confMatch[1], 10);
      }
    }

    // Parse Key Drivers
    const driversMatch = domain1.match(/## Key Drivers Analyzed\s*\n*([\s\S]*?)(?=##|$)/i);
    if (driversMatch && driversMatch[1]) {
      result.keyDrivers = driversMatch[1]
        .split('\n')
        .map(line => line.replace(/^[\s*-•*#]+/, '').trim())
        .filter(line => line.length > 0);
    }

    // Parse Fundamental Justification
    const justificationMatch = domain1.match(/## Fundamental Justification\s*\n*([\s\S]*?)(?=##|$|===)/i);
    if (justificationMatch && justificationMatch[1]) {
      result.fundamentalJustification = justificationMatch[1].trim();
    }

    // Parse System Health & Efficiency
    const systemHealthMatch = domain2.match(/## System Health & Efficiency\s*\n*([\s\S]*?)(?=##|$)/i);
    if (systemHealthMatch && systemHealthMatch[1]) {
      result.systemHealth = systemHealthMatch[1]
        .split('\n')
        .map(line => line.replace(/^[\s*-•*#]+/, '').trim())
        .filter(line => line.length > 0);
    }

    // Parse Technical Improvement
    const techImprovementMatch = domain2.match(/## Actionable Technical Improvement\s*\n*([\s\S]*?)(?=##|$)/i);
    if (techImprovementMatch && techImprovementMatch[1]) {
      result.technicalImprovement = techImprovementMatch[1].trim();
    }

    // Parse Business Recommendation
    const bizRecMatch = domain2.match(/## Business Process Recommendation\s*\n*([\s\S]*?)(?=##|$)/i);
    if (bizRecMatch && bizRecMatch[1]) {
      result.businessRecommendation = bizRecMatch[1].trim();
    }

    return result;
  };

  const sqlScript = `create table beauty_breakout_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id),
  campaign_traffic text,
  checkout_success_rate text,
  api_latency text,
  analysis_text text
);

-- Optional: Enable RLS and setup policies so users only see their own logs
alter table beauty_breakout_logs enable row level security;

create policy "Users can read their own logs"
  on beauty_breakout_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own logs"
  on beauty_breakout_logs for insert
  with check (auth.uid() = user_id);`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const getDialColor = (type: string) => {
    if (type === 'Bullish') return 'text-brand-accent';
    if (type === 'Bearish') return 'text-rose-500';
    return 'text-amber-500';
  };

  const getDialBg = (type: string) => {
    if (type === 'Bullish') return 'bg-brand-accent/10 border-brand-accent/30';
    if (type === 'Bearish') return 'bg-rose-500/10 border-rose-500/30';
    return 'bg-amber-500/10 border-amber-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-brand-text flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-brand-accent" /> Forex & Commodities Suite
          </h2>
          <p className="text-brand-text-muted text-sm">Automated precision macro-analytics and workspace operations advisor.</p>
        </div>
        
        {/* Tab Selection */}
        <div className="bg-brand-card border border-brand-border/40 p-1 rounded-xl flex items-center gap-1 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('agent')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5
              ${activeSubTab === 'agent' 
                ? 'bg-brand-accent/20 text-brand-accent border border-brand-accent/20 font-bold' 
                : 'text-brand-text-dim hover:text-brand-text'
              }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Operations Agent
          </button>
          <button
            onClick={() => setActiveSubTab('broker')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5
              ${activeSubTab === 'broker' 
                ? 'bg-brand-accent/20 text-brand-accent border border-brand-accent/20 font-bold' 
                : 'text-brand-text-dim hover:text-brand-text'
              }`}
          >
            <Globe2 className="w-3.5 h-3.5" /> Recommended Broker
          </button>
        </div>
      </header>

      {activeSubTab === 'agent' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Section (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-brand-card border border-brand-border/40 rounded-2xl p-6 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 border-b border-brand-border/40 pb-4">
                <Sliders className="w-5 h-5 text-brand-accent" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-text">Simulation Parameters</h3>
              </div>

              {/* Commodity Inputs */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-brand-accent uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Macro Data
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-text-muted">Gold Spot (XAUUSD)</span>
                    <span className="font-mono text-brand-text font-bold">${goldPrice}/oz</span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="2800"
                    step="10"
                    value={goldPrice}
                    onChange={(e) => setGoldPrice(Number(e.target.value))}
                    className="w-full accent-brand-accent cursor-ew-resize"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-text-muted">US Dollar Index (DXY)</span>
                    <span className="font-mono text-brand-text font-bold">{dxy}</span>
                  </div>
                  <input
                    type="range"
                    min="98"
                    max="112"
                    step="0.1"
                    value={dxy}
                    onChange={(e) => setDxy(Number(e.target.value))}
                    className="w-full accent-brand-accent cursor-ew-resize"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-text-muted">10-Year Treasury Yield</span>
                    <span className="font-mono text-brand-text font-bold">{tenYearYield}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="0.1"
                    value={tenYearYield}
                    onChange={(e) => setTenYearYield(Number(e.target.value))}
                    className="w-full accent-brand-accent cursor-ew-resize"
                  />
                </div>
              </div>

              {/* System Inputs */}
              <div className="space-y-4 pt-4 border-t border-brand-border/40">
                <h4 className="text-xs font-bold text-brand-accent uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> System Telemetry
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-text-muted">Financial API Latency</span>
                    <span className="font-mono text-brand-text font-bold">{latency}ms</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="50"
                    value={latency}
                    onChange={(e) => setLatency(Number(e.target.value))}
                    className="w-full accent-brand-accent cursor-ew-resize"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-text-muted">Supabase Pool Load</span>
                    <span className="font-mono text-brand-text font-bold">{poolLoad}% full</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="2"
                    value={poolLoad}
                    onChange={(e) => setPoolLoad(Number(e.target.value))}
                    className="w-full accent-brand-accent cursor-ew-resize"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-text-muted">Last Cache Flush Age</span>
                    <span className="font-mono text-brand-text font-bold">{cacheAge} hours ago</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="120"
                    step="1"
                    value={cacheAge}
                    onChange={(e) => setCacheAge(Number(e.target.value))}
                    className="w-full accent-brand-accent cursor-ew-resize"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleRunAnalysis}
                disabled={loading}
                className="w-full bg-brand-accent hover:bg-emerald-500 text-brand-bg font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Crunching Parameters...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Execute AI Operations
                  </>
                )}
              </button>
            </div>

            {/* Supabase Guide & Status Alerts */}
            {(saveError || saveSuccess || showSqlGuide) && (
              <div className="bg-brand-card border border-brand-border/40 rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-2.5">
                  {saveSuccess ? (
                    <CheckCircle2 className="w-5 h-5 text-brand-accent flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider">
                      {saveSuccess ? 'Report Saved Successfully' : 'Supabase Integration status'}
                    </h4>
                    <p className="text-xs text-brand-text-dim leading-relaxed">
                      {saveSuccess 
                        ? 'Your Gold and Workspace operational analysis has been persisted to public.beauty_breakout_logs.' 
                        : saveError}
                    </p>
                  </div>
                </div>

                {showSqlGuide && (
                  <div className="space-y-3 pt-3 border-t border-brand-border/40">
                    <p className="text-[11px] text-brand-text-muted leading-relaxed">
                      To persist reports, execute the following SQL statement in your <strong>Supabase SQL Editor</strong>:
                    </p>
                    <div className="relative">
                      <pre className="bg-brand-bg/80 border border-brand-border/40 p-3 rounded-lg text-[10px] font-mono text-brand-text-dim overflow-x-auto max-h-40 leading-relaxed">
                        {sqlScript}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(sqlScript)}
                        className="absolute top-2 right-2 p-1.5 rounded bg-brand-card/80 hover:bg-brand-card border border-brand-border/50 text-brand-text hover:text-brand-accent transition-all cursor-pointer"
                        title="Copy SQL"
                      >
                        {copiedSql ? <Check className="w-3.5 h-3.5 text-brand-accent" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Outputs / Results Viewer Section (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {!parsedData ? (
              <div className="bg-brand-card border border-brand-border/40 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
                <div className="w-16 h-16 bg-brand-surface/30 border border-brand-border/50 rounded-2xl flex items-center justify-center mb-6 text-brand-accent">
                  <Activity className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-brand-text">Awaiting Operations Directive</h3>
                <p className="text-brand-text-dim text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                  Use the simulation sliders on the left to configure precious metals market conditions and workspace telemetry, then run the AI Operations suite.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Save button card */}
                {profile?.id && (
                  <div className="bg-brand-card border border-brand-border/40 rounded-xl p-4 flex items-center justify-between gap-4">
                    <span className="text-xs text-brand-text-dim flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-brand-accent" />
                      {isSimulated ? (
                        <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold tracking-wide">
                          SANDBOX SIMULATION
                        </span>
                      ) : (
                        <span className="text-[10px] bg-brand-accent/10 text-brand-accent border border-brand-accent/20 px-2 py-0.5 rounded font-mono font-bold tracking-wide">
                          LIVE GEMINI COGNITION
                        </span>
                      )}
                    </span>
                    <button
                      onClick={handleSaveToSupabase}
                      className="inline-flex items-center gap-1.5 bg-brand-accent/10 hover:bg-brand-accent/20 border border-brand-accent/30 text-brand-accent px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Analysis Log
                    </button>
                  </div>
                )}

                {/* DOMAIN 1 card */}
                <div className="bg-brand-card border border-brand-border/40 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-[4px] h-full bg-brand-accent" />
                  
                  <div className="flex items-center justify-between gap-4 border-b border-brand-border/40 pb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-brand-accent" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-brand-text">Domain 1: Precious Metals & Gold Market</h3>
                    </div>
                    <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded font-bold font-mono tracking-wide uppercase">XAUUSD Strategy</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Gauge/Dial column (4 cols) */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-brand-border/20 bg-brand-bg/50">
                      <h4 className="text-[10px] font-bold text-brand-text-dim uppercase tracking-wider mb-4 flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-brand-accent" /> Directional Bias
                      </h4>
                      
                      <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center p-2 relative shadow-lg ${getDialBg(parsedData.biasType)}`}>
                        <div className={`text-sm font-black tracking-tight ${getDialColor(parsedData.biasType)}`}>
                          {parsedData.biasType}
                        </div>
                        <div className="text-[10px] text-brand-text-dim mt-0.5 font-mono">
                          {parsedData.directionalBiasConfidence}% Confidence
                        </div>
                      </div>

                      <p className="text-[11px] text-brand-text-dim italic mt-4 max-w-[150px] leading-relaxed">
                        &quot;{parsedData.directionalBias}&quot;
                      </p>
                    </div>

                    {/* Drivers & Justifications (8 cols) */}
                    <div className="md:col-span-8 space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2">Key Drivers</h4>
                        <ul className="space-y-2">
                          {parsedData.keyDrivers.map((driver, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-brand-text-muted leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-1.5 flex-shrink-0" />
                              <span>{driver}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 border-t border-brand-border/40">
                        <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2">Fundamental Justification</h4>
                        <p className="text-xs text-brand-text-muted leading-relaxed whitespace-pre-line">
                          {parsedData.fundamentalJustification}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DOMAIN 2 card */}
                <div className="bg-brand-card border border-brand-border/40 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-[4px] h-full bg-amber-500" />

                  <div className="flex items-center justify-between gap-4 border-b border-brand-border/40 pb-4">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-amber-500" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-brand-text">Domain 2: Workspace & Business Maintenance</h3>
                    </div>
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold font-mono tracking-wide uppercase">Infrastructure System Advisor</span>
                  </div>

                  <div className="space-y-5">
                    {/* System Health Issues */}
                    <div>
                      <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-amber-500" /> Telemetry Drift Analysis
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {parsedData.systemHealth.map((health, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl border border-brand-border/20 bg-brand-bg/40 text-xs text-brand-text-muted leading-relaxed">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>{health}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actionable Code Block */}
                    {parsedData.technicalImprovement && (
                      <div className="pt-4 border-t border-brand-border/40 space-y-2">
                        <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-amber-500" /> Actionable Technical Optimization
                        </h4>
                        
                        <div className="relative">
                          <pre className="bg-black/40 border border-brand-border/40 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                            {parsedData.technicalImprovement}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Business Process Recommendation */}
                    {parsedData.businessRecommendation && (
                      <div className="pt-4 border-t border-brand-border/40 space-y-2">
                        <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Strategic Business Workflow Change
                        </h4>
                        <p className="text-xs text-brand-text-muted leading-relaxed p-4 rounded-xl border border-amber-500/10 bg-amber-500/5">
                          {parsedData.businessRecommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Preserved LiteFinance Broker Tab */
        <div className="bg-brand-card rounded-2xl border border-brand-border/40 shadow-2xl overflow-hidden min-h-[600px] flex flex-col p-8 items-center justify-center relative">
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
      )}
    </div>
  );
}
