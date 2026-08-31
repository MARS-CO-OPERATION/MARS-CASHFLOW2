import React, { useState } from 'react';
import { usePlatform } from './PlatformContext';
import { PLATFORM_ROLES } from '../types';
import { PlatformOverviewScreen } from './screens/PlatformOverviewScreen';
import { ProductRegistryScreen } from './screens/ProductRegistryScreen';
import { PlatformUsersScreen } from './screens/PlatformUsersScreen';
import { SubscriptionManagementScreen } from './screens/SubscriptionManagementScreen';
import { BoardPortalScreen } from './screens/BoardPortalScreen';
import { InvestorPortalScreen } from './screens/InvestorPortalScreen';
import { GovernmentGatewayScreen } from './screens/GovernmentGatewayScreen';
import { PlatformSecurityAuditScreen } from './screens/PlatformSecurityAuditScreen';
import { FounderControlsScreen } from './screens/FounderControlsScreen';
import { PlatformLoginScreen } from './screens/PlatformLoginScreen';
import {
  Layers,
  Users,
  CreditCard,
  Building,
  TrendingUp,
  Scale,
  ShieldCheck,
  Crown,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  ExternalLink,
  Shield,
  Zap,
} from 'lucide-react';

interface PlatformHQLayoutProps {
  onReturnToCashflow: () => void;
}

export const PlatformHQLayout: React.FC<PlatformHQLayoutProps> = ({ onReturnToCashflow }) => {
  const { platformUser, platformLogout, isPrincipalFounder } = usePlatform();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user is not authenticated on platform, show Platform Login
  if (!platformUser) {
    return <PlatformLoginScreen onReturnToCashflow={onReturnToCashflow} />;
  }

  const roleInfo = PLATFORM_ROLES[platformUser.platformRole] || {
    title: platformUser.platformRole,
    icon: '👤',
  };

  const navItems = [
    { id: 'overview', label: 'Platform Overview', icon: Layers },
    { id: 'products', label: 'Product Registry', icon: Zap },
    { id: 'users', label: 'Personnel & Hierarchy', icon: Users },
    { id: 'subscriptions', label: 'Subscription Engine', icon: CreditCard },
    { id: 'board', label: 'Board Governance', icon: Building },
    { id: 'investors', label: 'Investor Relations', icon: TrendingUp },
    { id: 'government', label: 'Government Gateway', icon: Scale },
    { id: 'security', label: 'Security & Audit Trail', icon: ShieldCheck },
  ];

  // If Principal Founder, add Founder Controls
  if (isPrincipalFounder()) {
    navItems.push({ id: 'founder', label: 'Founder Master Controls', icon: Crown });
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <PlatformOverviewScreen onNavigateTab={(tab) => setActiveTab(tab)} />;
      case 'products':
        return <ProductRegistryScreen />;
      case 'users':
        return <PlatformUsersScreen />;
      case 'subscriptions':
        return <SubscriptionManagementScreen />;
      case 'board':
        return <BoardPortalScreen />;
      case 'investors':
        return <InvestorPortalScreen />;
      case 'government':
        return <GovernmentGatewayScreen />;
      case 'security':
        return <PlatformSecurityAuditScreen />;
      case 'founder':
        return <FounderControlsScreen />;
      default:
        return <PlatformOverviewScreen onNavigateTab={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8F6] text-[#17231E] flex flex-col">
      {/* Top Corporate Nav Header */}
      <header className="sticky top-0 z-40 bg-[#101915] text-white border-b border-[#0AB77F]/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand & Organization Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-gray-300 hover:text-white rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-3 cursor-pointer select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0AB77F] to-[#07885E] flex items-center justify-center shadow-xs">
                <span className="text-white font-black text-lg tracking-tighter">M</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                    MARS CORPORATION
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#0AB77F]/20 text-[#62E3B6] border border-[#0AB77F]/40">
                    PLATFORM HQ
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-semibold hidden sm:block">
                  Sovereign Multi-Product Operating System Control Plane
                </div>
              </div>
            </div>
          </div>

          {/* Right Top Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Switch to Cashflow Customer App */}
            <button
              onClick={onReturnToCashflow}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#1C2C25] hover:bg-[#253A31] border border-white/10 rounded-xl text-xs font-bold text-[#A1B8AE] hover:text-white transition-colors cursor-pointer"
              title="Open MARS Cashflow Customer Experience"
            >
              <span>Switch to MARS Cashflow</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Platform User Profile Pill */}
            <div className="flex items-center gap-2 bg-[#1C2C25] border border-white/10 px-2.5 py-1 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-[#0AB77F] text-white flex items-center justify-center font-bold text-[11px]">
                {roleInfo.icon}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                  {platformUser.displayName}
                </div>
                <div className="text-[9px] font-semibold text-[#62E3B6] uppercase">
                  {roleInfo.title}
                </div>
              </div>
              <button
                onClick={platformLogout}
                className="text-red-400 hover:text-red-300 p-1 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer ml-1"
                title="Sign Out of Platform HQ"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Layout with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar (lg+) */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-1">
          <div className="text-[11px] font-extrabold text-[#65766F] uppercase tracking-wider px-3 mb-2">
            Platform Command
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isFounderTab = item.id === 'founder';

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isActive
                    ? isFounderTab
                      ? 'bg-amber-900/90 text-amber-100 shadow-sm'
                      : 'bg-[#101915] text-white shadow-sm'
                    : 'text-[#65766F] hover:bg-white hover:text-[#17231E]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? isFounderTab
                        ? 'text-amber-300'
                        : 'text-[#62E3B6]'
                      : 'text-gray-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-6 border-t border-gray-200 mt-6 px-3">
            <div className="text-[10px] font-extrabold uppercase text-[#65766F] tracking-wider mb-2">
              Statutory Clearance
            </div>
            <div className="p-3 bg-white rounded-2xl border border-[#DFE8E3] text-[11px] text-[#65766F] space-y-1">
              <div className="font-bold text-[#17231E]">MARS CORPORATION</div>
              <div>Class A Sovereign Node</div>
              <div className="text-[10px] text-[#0AB77F] font-mono font-bold">
                ENCRYPTED TLS 1.3
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border border-[#DFE8E3] rounded-3xl p-4 shadow-xl space-y-1 mb-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">
              Platform Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-left cursor-pointer ${
                    isActive ? 'bg-[#101915] text-white' : 'text-[#65766F] hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={onReturnToCashflow}
                className="w-full py-2 bg-[#E2F8EF] text-[#0AB77F] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Open MARS Cashflow</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Pane */}
        <main className="flex-1 min-w-0">{renderContent()}</main>
      </div>
    </div>
  );
};
