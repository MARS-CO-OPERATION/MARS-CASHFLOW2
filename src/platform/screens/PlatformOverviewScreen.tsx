import React from 'react';
import { usePlatform } from '../PlatformContext';
import {
  Layers,
  Users,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Server,
  Zap,
  Globe,
  FileText,
  Lock,
} from 'lucide-react';

interface PlatformOverviewProps {
  onNavigateTab: (tab: string) => void;
}

export const PlatformOverviewScreen: React.FC<PlatformOverviewProps> = ({ onNavigateTab }) => {
  const {
    products,
    platformUsers,
    subscriptions,
    investorMetrics,
    auditLogs,
    isPrincipalFounder,
  } = usePlatform();

  const totalRegisteredProducts = products.length;
  const activeProducts = products.filter((p) => p.status === 'ACTIVE').length;
  const totalSubTiers = subscriptions.length;
  const totalAuditEvents = auditLogs.length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Corporate Master Directive */}
      <div className="bg-gradient-to-r from-[#101915] via-[#17231E] to-[#0A1F18] p-6 rounded-3xl border border-[#0AB77F]/30 shadow-xl text-white relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-[#0AB77F]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0AB77F]/20 text-[#62E3B6] border border-[#0AB77F]/40">
                Sovereign Control Plane
              </span>
              <span className="text-xs text-gray-400 font-semibold">| Uganda & East Africa Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              MARS CORPORATION PLATFORM HQ
            </h2>
            <p className="text-xs sm:text-sm text-[#A1B8AE] max-w-2xl mt-1 leading-relaxed">
              Unified command center governing MARS Cashflow, MARS Properties, MARS Urban Services, MARS Projects, and platform-wide ecosystem telemetry.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-[#1C2C25] border border-white/10 px-4 py-3 rounded-2xl text-right">
              <div className="text-[10px] font-bold text-[#62E3B6] uppercase tracking-wider">
                Ecosystem Health
              </div>
              <div className="text-lg font-black text-white flex items-center gap-1.5 justify-end">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0AB77F] animate-pulse"></span>
                99.98% Operational
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Products */}
        <div
          onClick={() => onNavigateTab('products')}
          className="bg-white p-5 rounded-3xl border border-[#DFE8E3] shadow-xs hover:border-[#0AB77F] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#65766F] uppercase tracking-wider">
              Ecosystem Products
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#E2F8EF] flex items-center justify-center text-[#0AB77F] group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#17231E] mt-2">
            {totalRegisteredProducts}
          </div>
          <div className="text-[11px] font-bold text-[#0AB77F] mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{activeProducts} Active in Production</span>
          </div>
        </div>

        {/* Financial Flow */}
        <div
          onClick={() => onNavigateTab('investors')}
          className="bg-white p-5 rounded-3xl border border-[#DFE8E3] shadow-xs hover:border-[#0AB77F] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#65766F] uppercase tracking-wider">
              Ecosystem ARR (UGX)
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#E2F8EF] flex items-center justify-center text-[#0AB77F] group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#17231E] mt-2">
            UGX {(investorMetrics ? investorMetrics.arrUgx / 1000000 : 222).toLocaleString()}M
          </div>
          <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+284% YoY Platform Expansion</span>
          </div>
        </div>

        {/* Corporate & Platform Personnel */}
        <div
          onClick={() => onNavigateTab('users')}
          className="bg-white p-5 rounded-3xl border border-[#DFE8E3] shadow-xs hover:border-[#0AB77F] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#65766F] uppercase tracking-wider">
              Platform Personnel
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#E2F8EF] flex items-center justify-center text-[#0AB77F] group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#17231E] mt-2">
            {platformUsers.length}
          </div>
          <div className="text-[11px] font-bold text-[#65766F] mt-1">
            Founder, Co-Founders, Board, Investors & Gov
          </div>
        </div>

        {/* Security & Audit Pulse */}
        <div
          onClick={() => onNavigateTab('security')}
          className="bg-white p-5 rounded-3xl border border-[#DFE8E3] shadow-xs hover:border-[#0AB77F] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#65766F] uppercase tracking-wider">
              Platform Audit Events
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#E2F8EF] flex items-center justify-center text-[#0AB77F] group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#17231E] mt-2">
            {totalAuditEvents}
          </div>
          <div className="text-[11px] font-bold text-[#0AB77F] mt-1 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Zero Security Violations</span>
          </div>
        </div>
      </div>

      {/* Product Ecosystem Grid */}
      <div className="bg-white p-6 rounded-3xl border border-[#DFE8E3] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-[#17231E]">
              Registered MARS Corporation Products
            </h3>
            <p className="text-xs text-[#65766F]">
              Directly connected to Platform HQ corporate infrastructure & telemetry
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('products')}
            className="px-3 py-1.5 bg-[#E2F8EF] hover:bg-[#0AB77F] hover:text-white text-[#0AB77F] rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Manage Product Registry
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="p-4 rounded-2xl border border-[#DFE8E3] bg-[#F5F8F6] hover:bg-white hover:border-[#0AB77F]/50 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{prod.icon}</span>
                    <span className="font-extrabold text-sm text-[#17231E]">{prod.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      prod.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : prod.status === 'BETA'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    {prod.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#65766F] leading-snug line-clamp-2">
                  {prod.tagline}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] font-bold">
                <span className="text-gray-500">{prod.version}</span>
                <span className="text-[#0AB77F]">{prod.customerRoles.length} Customer Roles</span>
                <span className="text-gray-700">
                  {Object.keys(prod.featureFlags || {}).length} Feature Flags
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Quick Telemetry & Governance Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Governance & Board Memo abstract */}
        <div className="bg-white p-5 rounded-3xl border border-[#DFE8E3] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#65766F] uppercase tracking-wider">
              Board Governance
            </span>
            <button
              onClick={() => onNavigateTab('board')}
              className="text-[11px] font-bold text-[#0AB77F] hover:underline cursor-pointer"
            >
              View Memos →
            </button>
          </div>
          <div className="p-3.5 bg-[#F5F8F6] rounded-2xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#17231E]">Q2 2026 Governance Memo</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                PUBLISHED
              </span>
            </div>
            <p className="text-[11px] text-[#65766F] line-clamp-3 leading-relaxed">
              Double-entry ledger integrity at 99.98%. Zero customer cross-tenant data leaks. Formalization partnership with Uganda Revenue Authority active.
            </p>
          </div>
        </div>

        {/* Regulatory & Government Gateway Status */}
        <div className="bg-white p-5 rounded-3xl border border-[#DFE8E3] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#65766F] uppercase tracking-wider">
              Government Gateway
            </span>
            <button
              onClick={() => onNavigateTab('government')}
              className="text-[11px] font-bold text-[#0AB77F] hover:underline cursor-pointer"
            >
              View Scopes →
            </button>
          </div>
          <div className="space-y-2">
            <div className="p-3 bg-[#F5F8F6] rounded-2xl border border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#17231E]">Uganda Revenue Authority</div>
                <div className="text-[10px] text-gray-500 font-semibold">
                  Aggregated Tax Index Scope
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <div className="p-3 bg-[#F5F8F6] rounded-2xl border border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#17231E]">KCCA Physical Planning</div>
                <div className="text-[10px] text-gray-500 font-semibold">
                  Urban Density Statistics
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Money Infrastructure Boundary */}
        <div className="bg-[#17231E] text-white p-5 rounded-3xl border border-[#0AB77F]/30 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#62E3B6] uppercase tracking-wider">
              Payment Gateway Preparation
            </span>
            <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
              Provider Boundary
            </span>
          </div>
          <p className="text-xs text-[#A1B8AE] leading-relaxed">
            Payment ledger recognizes <strong className="text-white">MTN_MOMO</strong>, <strong className="text-white">AIRTEL_MONEY</strong>, <strong className="text-white">CASH</strong> & <strong className="text-white">BANK_TRANSFER</strong>. Direct webhook and settlement API integrations connect securely at next deployment stage.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] text-[#62E3B6] font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#0AB77F]" />
            <span>Strict Ledger Idempotency Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
