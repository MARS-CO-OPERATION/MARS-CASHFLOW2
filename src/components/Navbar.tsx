import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import {
  Building2,
  RefreshCw,
  CheckCircle2,
  LogOut,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  HelpCircle,
  BarChart3,
  Receipt,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { USER_ROLES, UserRoleKey } from '../types';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  const {
    currentUser,
    currentRole,
    activeContext,
    syncStatus,
    syncMessage,
    triggerSync,
    logout,
    switchWorkspace,
    tenants
  } = useMars();

  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const overdueCount = tenants.filter(t => t.arrears > 0).length;

  const handleSync = () => {
    triggerSync((_success, msg) => {
      setToastMessage(msg);
      setShowNotificationToast(true);
      setTimeout(() => setShowNotificationToast(false), 3500);
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F5F8F6]/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
      {/* Toast Alert */}
      {showNotificationToast && (
        <div className="bg-[#0AB77F] text-white text-xs px-4 py-2 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setShowNotificationToast(false)}
            className="text-white/80 hover:text-white font-bold text-sm ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
        {/* Brand & Identity */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0AB77F] to-[#07885E] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-xl tracking-tighter">M</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#17231E]">
                MARS CASHFLOW
              </span>
              {overdueCount > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-red-100 text-[#D93838] rounded-full border border-red-200">
                  <AlertTriangle className="w-3 h-3" />
                  {overdueCount} Overdue
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0AB77F]" />
              <span className="text-[10px] font-bold tracking-wider text-[#0AB77F] uppercase">
                UGANDA MASTER LEDGER (LIVE)
              </span>
            </div>
          </div>
        </div>

        {/* Quick Nav Links for Desktop */}
        <div className="hidden lg:flex items-center gap-1 text-xs font-semibold text-[#65766F]">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentRoute === 'dashboard'
                ? 'bg-[#101915] text-white font-bold'
                : 'hover:bg-[#E2F8EF] hover:text-[#17231E]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('landlord')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentRoute === 'landlord'
                ? 'bg-[#101915] text-white font-bold'
                : 'hover:bg-[#E2F8EF] hover:text-[#17231E]'
            }`}
          >
            👑 Landlord
          </button>
          <button
            onClick={() => onNavigate('caretaker')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentRoute === 'caretaker'
                ? 'bg-[#101915] text-white font-bold'
                : 'hover:bg-[#E2F8EF] hover:text-[#17231E]'
            }`}
          >
            👨🏾‍💼 Caretaker
          </button>
          <button
            onClick={() => onNavigate('tenant')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentRoute === 'tenant'
                ? 'bg-[#101915] text-white font-bold'
                : 'hover:bg-[#E2F8EF] hover:text-[#17231E]'
            }`}
          >
            👤 Tenant
          </button>
          <button
            onClick={() => onNavigate('property_map')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              currentRoute === 'property_map'
                ? 'bg-[#101915] text-white font-bold'
                : 'hover:bg-[#E2F8EF] hover:text-[#17231E]'
            }`}
          >
            <span>📍 Map</span>
          </button>
          <button
            onClick={() => onNavigate('workspace_hub')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              currentRoute === 'workspace_hub'
                ? 'bg-[#101915] text-white font-bold'
                : 'hover:bg-[#E2F8EF] hover:text-[#17231E]'
            }`}
          >
            <span>☁️ Workspace</span>
          </button>
          <button
            onClick={() => onNavigate('income_expense_chart')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              currentRoute === 'income_expense_chart'
                ? 'bg-[#101915] text-white font-bold'
                : 'hover:bg-[#E2F8EF] hover:text-[#17231E]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Trends
          </button>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Multi-role Workspace Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#E2F8EF] hover:bg-[#D3F3E6] border border-[#0AB77F]/40 rounded-xl text-xs font-bold text-[#17231E] transition-colors cursor-pointer"
              title="Switch Workspace Role"
            >
              <span className="text-sm">🔀</span>
              <span className="hidden sm:inline">
                {currentRole ? USER_ROLES[currentRole]?.title.split('/')[0] : 'Workspace'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#65766F]" />
            </button>

            {showWorkspaceMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowWorkspaceMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#DFE8E3] z-50 p-2 text-xs divide-y divide-gray-100 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-[10px] font-bold text-[#65766F] uppercase tracking-wider">
                    Switch Workspace Role
                  </div>
                  <div className="py-1 space-y-1">
                    {(Object.keys(USER_ROLES) as UserRoleKey[]).map((key) => {
                      const role = USER_ROLES[key];
                      const isCurrent = currentRole === key;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            switchWorkspace(key, role.title);
                            setShowWorkspaceMenu(false);
                            onNavigate(role.defaultRoute);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-semibold transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-[#101915] text-white'
                              : 'hover:bg-[#F5F8F6] text-[#17231E]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{role.icon}</span>
                            <div>
                              <div className="font-bold text-xs">{role.title}</div>
                              <div className={`text-[10px] truncate max-w-[150px] ${isCurrent ? 'text-gray-300' : 'text-[#65766F]'}`}>
                                {role.subtitle}
                              </div>
                            </div>
                          </div>
                          {isCurrent && <span className="text-[#62E3B6] font-bold">●</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-2 px-2">
                    <button
                      onClick={() => {
                        setShowWorkspaceMenu(false);
                        onNavigate('multi_role_selection');
                      }}
                      className="w-full text-center py-1.5 text-xs text-[#0AB77F] font-bold hover:underline cursor-pointer"
                    >
                      Manage Workspaces →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Cloud & Local DB Sync Button */}
          <button
            onClick={handleSync}
            disabled={syncStatus === 'SYNCING'}
            title={syncMessage || 'Synchronize Cloud Firestore & Room DB'}
            className="w-9 h-9 flex items-center justify-center bg-white hover:bg-gray-50 border border-[#DFE8E3] rounded-xl shadow-xs text-[#0AB77F] hover:text-[#07885E] transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${syncStatus === 'SYNCING' ? 'animate-spin text-amber-500' : ''}`}
            />
          </button>

          {/* Quick FAQ / Guide */}
          <button
            onClick={() => onNavigate('faq')}
            className="w-9 h-9 hidden sm:flex items-center justify-center bg-white hover:bg-gray-50 border border-[#DFE8E3] rounded-xl shadow-xs text-[#65766F] hover:text-[#17231E] transition-colors cursor-pointer"
            title="Uganda Rent & Ledger FAQs"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* User Profile Pill & Sign Out */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-[#E6EFEA] px-2.5 py-1 rounded-xl border border-[#CDE1D7]">
              <div className="w-6 h-6 rounded-full bg-[#0AB77F] text-white flex items-center justify-center font-bold text-[11px]">
                {currentUser.displayName.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-[#17231E] leading-tight truncate max-w-[110px]">
                  {currentUser.displayName}
                </div>
                <div className="text-[9px] font-semibold text-[#65766F] uppercase">
                  {currentUser.primaryRole}
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  onNavigate('login');
                }}
                className="text-[#D93838] hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="px-3 py-1.5 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
