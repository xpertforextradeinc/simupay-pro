import React, { useState, useEffect } from 'react';
import { 
  Sliders, Settings, ShieldAlert, CheckCircle, Save, Info, AlertTriangle,
  Lock, RefreshCw, Mail, Globe, Sparkles
} from 'lucide-react';
import { adminService, FreePlanConfig, SystemSettings } from '../../services/adminService';

export function AdminSettingsAndLimits() {
  const [limits, setLimits] = useState<FreePlanConfig | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLimits(adminService.getFreeConfig());
    setSettings(adminService.getSystemSettings());
  }, []);

  const handleSaveLimits = () => {
    if (!limits) return;
    adminService.saveFreeConfig(limits);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveSettings = () => {
    if (!settings) return;
    adminService.saveSystemSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (!limits || !settings) {
    return (
      <div className="p-8 text-center text-gray-500 font-mono text-xs">
        Booting Settings Node...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: FREE PLAN BUSINESS LIMITS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-[#091714] p-5 rounded-2xl border border-[#16362F] shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#16362F] pb-2">
            <Sliders className="w-4 h-4 text-[#00C853]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Free Plan Parameters & Quotas
            </h3>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Daily Free Cap</label>
                <input
                  type="number"
                  value={limits.dailyLimit}
                  onChange={(e) => setLimits({ ...limits, dailyLimit: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg p-2.5 text-white"
                  placeholder="5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Monthly Free Cap</label>
                <input
                  type="number"
                  value={limits.monthlyLimit}
                  onChange={(e) => setLimits({ ...limits, monthlyLimit: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg p-2.5 text-white"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Upgrade Promotional Warning Banner</label>
              <textarea
                value={limits.upgradeMessage}
                onChange={(e) => setLimits({ ...limits, upgradeMessage: e.target.value })}
                className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg p-2.5 text-white h-24"
                placeholder="Message shown to free tier users when they exceed or attempt to generate receipts..."
              />
            </div>

            <button
              onClick={handleSaveLimits}
              className="w-full bg-[#00C853] hover:bg-emerald-400 text-black font-bold py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Save className="w-4 h-4" /> Save Plan Restrictions
            </button>
          </div>
        </div>

        {/* SECTION 2: APPLICATION GLOBAL METADATA */}
        <div className="bg-[#091714] p-5 rounded-2xl border border-[#16362F] shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#16362F] pb-2">
            <Settings className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              System Settings & Corporate Profile
            </h3>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Application Name</label>
                <input
                  type="text"
                  value={settings.appName}
                  onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                  className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Logo Monogram</label>
                <input
                  type="text"
                  value={settings.logo}
                  onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                  className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg p-2.5 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Contact Email (Admin)</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Session Timeout (Minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 30 })}
                  className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg p-2.5 text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Support Descriptor Tagline</label>
              <input
                type="text"
                value={settings.supportInfo}
                onChange={(e) => setSettings({ ...settings, supportInfo: e.target.value })}
                className="w-full bg-[#050E0C] border border-[#16362F] rounded-lg p-2.5 text-white"
              />
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Save className="w-4 h-4" /> Save System Settings
            </button>
          </div>
        </div>

      </div>

      {/* SECTION 3: EMERGENCY MAINTENANCE MODE LOCKOUT */}
      <div className="bg-[#091714] p-5 rounded-2xl border border-red-950/40 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-red-950/60 pb-2">
          <ShieldAlert className="w-4 h-4 text-red-500" />
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider font-mono">
            Administrative Sovereign Emergency Node Overrides
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
          <div className="bg-black/30 p-4 rounded-xl border border-red-950/50 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-white block">Maintenance Lockout</span>
              <p className="text-[10px] text-gray-500 mt-1">
                Toggle globall lockout. Prevents non-administrative merchants from compiling receipts or requesting licenses.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400">STATUS: {settings.maintenanceMode ? 'ENABLED (OFFLINE)' : 'DISABLED (LIVE)'}</span>
              <button
                onClick={() => {
                  const updated = !settings.maintenanceMode;
                  setSettings({ ...settings, maintenanceMode: updated });
                  adminService.saveSystemSettings({ ...settings, maintenanceMode: updated });
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all
                  ${settings.maintenanceMode 
                    ? 'bg-red-600 hover:bg-red-500 text-white' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
              >
                {settings.maintenanceMode ? 'Deactivate Lock' : 'Activate Lock'}
              </button>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-red-950/50 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-white block">Mandate Two-Factor Authentication</span>
              <p className="text-[10px] text-gray-500 mt-1">
                Requires standard users to setup email/MFA tokens before accessing high-velocity Flash transfer options.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400">STATUS: {settings.securityOptions.twoFactorRequired ? 'ENFORCED' : 'OPTIONAL'}</span>
              <button
                onClick={() => {
                  const updatedOpts = { ...settings.securityOptions, twoFactorRequired: !settings.securityOptions.twoFactorRequired };
                  setSettings({ ...settings, securityOptions: updatedOpts });
                  adminService.saveSystemSettings({ ...settings, securityOptions: updatedOpts });
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all
                  ${settings.securityOptions.twoFactorRequired 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
              >
                {settings.securityOptions.twoFactorRequired ? 'Make Optional' : 'Make Enforced'}
              </button>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-red-950/50 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-white block">IP Whitelisting Filter</span>
              <p className="text-[10px] text-gray-500 mt-1">
                Restricts standard login requests to whitelisted merchant terminal locations for strict corporate custody.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400">STATUS: {settings.securityOptions.ipWhitelisting ? 'FILTER LIVE' : 'UNRESTRICTED'}</span>
              <button
                onClick={() => {
                  const updatedOpts = { ...settings.securityOptions, ipWhitelisting: !settings.securityOptions.ipWhitelisting };
                  setSettings({ ...settings, securityOptions: updatedOpts });
                  adminService.saveSystemSettings({ ...settings, securityOptions: updatedOpts });
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all
                  ${settings.securityOptions.ipWhitelisting 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
              >
                {settings.securityOptions.ipWhitelisting ? 'Disable Filter' : 'Enable Filter'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isSaved && (
        <div className="fixed bottom-20 right-6 bg-[#00C853] text-[#050E0C] font-bold px-4 py-2 rounded-xl text-xs shadow-2xl flex items-center gap-1.5 animate-bounce z-50">
          <CheckCircle className="w-4 h-4" /> Global Platform Settings Synchronized Successfully
        </div>
      )}

    </div>
  );
}
