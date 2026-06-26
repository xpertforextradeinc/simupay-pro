import React from 'react';
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
  Database
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
  walletBalance
}: SidebarProps) {
  interface MenuItem {
    readonly id: ActiveTab;
    readonly label: string;
    readonly icon: React.ComponentType<any>;
    readonly premium?: boolean;
  }

  const menuItems: readonly MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'account', label: 'My Account', icon: User },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'activation', label: 'Activation Key', icon: Key },
    { id: 'flash-transfer', label: 'Flash Transfer', icon: Zap, premium: true },
    { id: 'receipt-generator', label: 'Receipt Generator', icon: Receipt },
    { id: 'transactions', label: 'Transaction History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'sms-center', label: 'SMS Center', icon: Smartphone },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'db-setup', label: 'Database Setup', icon: Database }
  ];

  const handleTabClick = (tabId: ActiveTab) => {
    onTabChange(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden h-16 bg-brand-card border-b border-emerald-950/40 px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-lg text-white">
            SimuPay <span className="text-[#00C853]">Pro</span>
          </span>
          {licenseActive && (
            <span className="text-[10px] bg-[#00C853]/20 text-[#00C853] px-2 py-0.5 rounded font-mono font-bold tracking-wider">
              PRO
            </span>
          )}
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-gray-400 hover:text-[#00C853] transition-colors"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-brand-card/95 backdrop-blur-xl border-r border-emerald-950/40 flex flex-col transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:z-30
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
          ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="hidden lg:flex items-center justify-between h-20 px-6 border-b border-emerald-950/40">
          {!collapsed ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="font-display font-bold text-xl text-white tracking-tight whitespace-nowrap">
                SimuPay <span className="text-[#00C853]">Pro</span>
              </span>
              {licenseActive && (
                <span className="text-[10px] bg-[#00C853]/20 text-[#00C853] px-2 py-0.5 rounded font-mono font-bold tracking-wider">
                  PRO
                </span>
              )}
            </div>
          ) : (
            <div className="mx-auto w-8 h-8 rounded-lg bg-emerald-950/40 border border-[#00C853]/30 flex items-center justify-center font-bold text-xs text-[#00C853]">
              SP
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-brand-bg hover:text-[#00C853] text-gray-400 border border-emerald-950/50 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Mini-Profile */}
        {!collapsed && (
          <div className="p-4 mx-4 my-3 bg-brand-bg/50 border border-emerald-950/30 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00C853]/10 border border-[#00C853]/30 flex items-center justify-center font-bold text-[#00C853]">
              {fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-white truncate">{fullName || 'User Profile'}</h4>
              <p className="text-[10px] text-gray-500 font-mono truncate">${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
                    ? 'bg-[#00C853]/10 text-[#00C853] border-l-2 border-[#00C853]'
                    : 'text-gray-400 hover:bg-brand-bg/80 hover:text-white'
                  }
                `}
              >
                <IconComponent className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-[#00C853]' : 'text-gray-400 group-hover:text-[#00C853]'}`} />

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
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-brand-bg border border-emerald-950 text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap z-50">
                    {item.label}
                    {item.premium && " (PRO)"}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-3 border-t border-emerald-950/40">
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-brand-card border-t border-emerald-950/40 flex items-center justify-around px-2 pb-safe z-40">
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${activeTab === 'dashboard' ? 'text-[#00C853]' : 'text-gray-400'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => handleTabClick('wallet')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${activeTab === 'wallet' ? 'text-[#00C853]' : 'text-gray-400'}`}
        >
          <Wallet className="w-5 h-5" />
          <span>Wallet</span>
        </button>
        <button
          onClick={() => handleTabClick('flash-transfer')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${activeTab === 'flash-transfer' ? 'text-amber-500' : 'text-gray-400'}`}
        >
          <Zap className="w-5 h-5 text-amber-500" />
          <span>Flash</span>
        </button>
        <button
          onClick={() => handleTabClick('receipt-generator')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${activeTab === 'receipt-generator' ? 'text-[#00C853]' : 'text-gray-400'}`}
        >
          <Receipt className="w-5 h-5" />
          <span>Receipt</span>
        </button>
        <button
          onClick={() => handleTabClick('transactions')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${activeTab === 'transactions' ? 'text-[#00C853]' : 'text-gray-400'}`}
        >
          <History className="w-5 h-5" />
          <span>History</span>
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
