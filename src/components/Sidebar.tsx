import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  User,
  Wallet,
  Key,
  Zap,
  Receipt,
  History,
  Smartphone,
  Bell,
  ShoppingBag,
  HelpCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  BarChart3,
  Database,
  CreditCard,
  Shield,
  ShieldCheck,
  Globe,
  ArrowUpRight,
  Sun,
  Moon
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onLogout: () => void;
  fullName: string;
  email: string;
  licenseActive: boolean;
  walletBalance: number;
  role?: string;
}

export function Sidebar({
  activeTab,
  onTabChange,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onLogout,
  fullName,
  email,
  licenseActive,
  walletBalance,
  role
}: SidebarProps) {
  interface MenuItem {
    readonly id: ActiveTab;
    readonly label: string;
    readonly icon: React.ComponentType<any>;
    readonly premium?: boolean;
  }

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('spp_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('spp_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const baseMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'receipt-generator', label: 'Receipt Studio', icon: Receipt },
    { id: 'slipmint-market', label: 'SlipMint Market', icon: ShoppingBag },
    { id: 'airtime', label: 'Airtime', icon: Smartphone },
    { id: 'data-bundles', label: 'Data Bundles', icon: Database },
    { id: 'resources', label: 'Resources', icon: Globe },
    { id: 'forex-tools', label: 'Forex Tools', icon: Globe },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'security-center', label: 'Security Center', icon: ShieldCheck }
  ];

  // If user is Admin, insert Admin Dashboard as the second item and Database Setup at the end
  const menuItems: MenuItem[] = [...baseMenuItems];
  if (role === 'admin') {
    menuItems.splice(1, 0, { id: 'admin-panel', label: 'Admin Panel', icon: Shield });
    menuItems.push({ id: 'db-setup', label: 'Database Setup', icon: Database });
  }

  // Future features (Coming Soon)
  const futureItems: MenuItem[] = [
    { id: 'dashboard', label: 'Mempool Clearer', icon: Zap, premium: true },
    { id: 'dashboard', label: 'Exchange Bridge', icon: Globe, premium: true },
    { id: 'dashboard', label: 'Node Validator', icon: ShieldCheck, premium: true }
  ];

  const handleTabClick = (tabId: ActiveTab) => {
    onTabChange(tabId);
    setMobileOpen(false);
  };

  const [shortcutDismissed, setShortcutDismissed] = useState(() => {
    return localStorage.getItem('spp_sidebar_partner_dismissed') === 'true';
  });

  const handleDismissShortcut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShortcutDismissed(true);
    localStorage.setItem('spp_sidebar_partner_dismissed', 'true');
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden h-16 bg-brand-card border-b border-brand-border/40 px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-lg text-brand-text">
            SimuPay <span className="text-brand-accent">Pro</span>
          </span>
          {licenseActive && (
            <span className="text-[10px] bg-brand-accent/20 text-brand-accent px-2 py-0.5 rounded font-mono font-bold tracking-wider">
              PRO
            </span>
          )}
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-brand-text-muted hover:text-brand-accent transition-colors"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-brand-card/95 backdrop-blur-xl border-r border-brand-border/40 flex flex-col transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:z-30
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
          ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="hidden lg:flex items-center justify-between h-20 px-6 border-b border-brand-border/40">
          {!collapsed ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="font-display font-bold text-xl text-brand-text tracking-tight whitespace-nowrap">
                SimuPay <span className="text-brand-accent">Pro</span>
              </span>
              {licenseActive && (
                <span className="text-[10px] bg-brand-accent/20 text-brand-accent px-2 py-0.5 rounded font-mono font-bold tracking-wider">
                  PRO
                </span>
              )}
            </div>
          ) : (
            <div className="mx-auto w-8 h-8 rounded-lg bg-emerald-950/40 border border-brand-accent/30 flex items-center justify-center font-bold text-xs text-brand-accent">
              SP
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-brand-bg hover:text-brand-accent text-brand-text-muted border border-brand-border/50 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Mini-Profile */}
        {!collapsed && (
          <div className="p-4 mx-4 my-3 bg-brand-bg/50 border border-emerald-950/30 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center font-bold text-brand-accent">
              {fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-brand-text truncate">{fullName || 'User Profile'}</h4>
              <p className="text-[10px] text-brand-text-dim font-mono truncate">${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id as ActiveTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative cursor-pointer
                  ${isActive
                    ? 'bg-brand-accent/10 text-brand-accent border-l-2 border-brand-accent'
                    : 'text-brand-text-muted hover:bg-brand-bg/80 hover:text-brand-text'
                  }
                `}
              >
                <IconComponent className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-brand-accent' : 'text-brand-text-muted group-hover:text-brand-accent'}`} />

                {(!collapsed || mobileOpen) && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {(!collapsed || mobileOpen) && item.premium && (
                  <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-bold font-mono uppercase tracking-wider">
                    PRO
                  </span>
                )}

                {/* Desktop Collapsed Tooltip */}
                {collapsed && !mobileOpen && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-brand-bg border border-emerald-950 text-brand-text text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap z-50">
                    {item.label}
                    {item.premium && " (PRO)"}
                  </div>
                )}
              </button>
            );
          })}

          {/* Future Modules Section */}
          {!collapsed && (
            <div className="mt-6 px-4 py-2">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] block mb-2">Enterprise Modules</span>
              <div className="space-y-1">
                {futureItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3 px-4 py-2.5 text-gray-600 rounded-xl cursor-not-allowed group">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-medium flex-1">{item.label}</span>
                      <span className="text-[8px] border border-gray-800 text-gray-700 px-1.5 py-0.5 rounded font-mono">SOON</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Sidebar Partner Shortcut */}
        {!shortcutDismissed && (!collapsed || mobileOpen) && (
          <div className="mx-4 my-2 p-3 bg-gradient-to-br from-brand-card to-[#040e0c] border border-emerald-950/60 rounded-xl relative group/card">
            <button
              onClick={handleDismissShortcut}
              className="absolute top-2 right-2 text-brand-text-dim hover:text-brand-text-muted transition-colors p-0.5 rounded cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
            
            <div className="space-y-2">
              <span className="text-[9px] uppercase font-bold text-brand-text-dim font-mono tracking-wider block">
                Partner Recommendation
              </span>
              <div>
                <h5 className="text-xs font-bold text-brand-text flex items-center gap-1 font-display">
                  Gate
                  <span className="text-[8px] bg-brand-accent/10 text-brand-accent border border-brand-accent/20 px-1 rounded uppercase">PRO Choice</span>
                </h5>
                <p className="text-[10px] text-brand-text-muted">Create a free account</p>
              </div>
              
              <a
                href="https://www.gate.com/share/APPLYGAT"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-brand-accent hover:bg-[#00E676] text-black font-bold text-[10px] py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                Join Now
                <ArrowUpRight className="w-3 h-3" />
              </a>
              
              <p className="text-[8px] text-brand-text-dim font-mono leading-tight scale-90 origin-left mt-1">
                Partner link: We may earn a commission.
              </p>
            </div>
          </div>
        )}

        {/* Branding Footer */}
        {(!collapsed || mobileOpen) && (
          <div className="px-4 py-3 text-center opacity-60 hover:opacity-100 transition-opacity flex justify-between items-center">
            <p className="text-[10px] text-brand-text-dim font-mono leading-tight text-left">
              © 2026 SimuPay Pro
              <br />
              Powered by Luckman Dev World
            </p>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-brand-surface/50 text-brand-text-muted hover:text-brand-accent transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Logout Section */}
        <div className="p-3 border-t border-brand-border/40">
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/10 hover:text-red-300 transition-colors cursor-pointer group relative`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            {(!collapsed || mobileOpen) && <span className="text-left">Logout</span>}

            {collapsed && !mobileOpen && (
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-brand-bg border border-emerald-950 text-red-400 text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Bar for high-priority items */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-brand-card border-t border-brand-border/40 flex items-center justify-around px-2 pb-safe z-40">
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${activeTab === 'dashboard' ? 'text-brand-accent' : 'text-brand-text-muted'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => handleTabClick('airtime')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${activeTab === 'airtime' ? 'text-brand-accent' : 'text-brand-text-muted'}`}
        >
          <Smartphone className="w-5 h-5" />
          <span>Airtime</span>
        </button>
        <button
          onClick={() => handleTabClick('data-bundles')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${activeTab === 'data-bundles' ? 'text-brand-accent' : 'text-brand-text-muted'}`}
        >
          <Database className="w-5 h-5" />
          <span>Data</span>
        </button>
        <button
          onClick={() => handleTabClick('forex-tools')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${activeTab === 'forex-tools' ? 'text-brand-accent' : 'text-brand-text-muted'}`}
        >
          <Globe className="w-5 h-5" />
          <span>Forex</span>
        </button>
        <button
          onClick={() => handleTabClick('notifications')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${activeTab === 'notifications' ? 'text-brand-accent' : 'text-brand-text-muted'}`}
        >
          <Bell className="w-5 h-5" />
          <span>Alerts</span>
        </button>
      </div>

      {/* Overlay Backdrop for Mobile menu */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        />
      )}
    </>
  );
}
