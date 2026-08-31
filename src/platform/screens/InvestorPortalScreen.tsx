import React, { useState } from 'react';
import { usePlatform } from '../PlatformContext';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Lock,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  Users,
} from 'lucide-react';

export const InvestorPortalScreen: React.FC = () => {
  const { investorMetrics, isPrincipalFounder, hasScope, updateInvestorKpis } = usePlatform();

  const [isEditing, setIsEditing] = useState(false);
  const [arrUgx, setArrUgx] = useState(investorMetrics?.arrUgx.toString() || '222000000');
  const [mrrUgx, setMrrUgx] = useState(investorMetrics?.mrrUgx.toString() || '18500000');
  const [retention, setRetention] = useState(
    investorMetrics?.customerRetentionRate.toString() || '96.4'
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!investorMetrics) {
    return <div className="p-8 text-center text-xs text-gray-500">Loading investor metrics...</div>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateInvestorKpis({
      arrUgx: parseInt(arrUgx) || 0,
      mrrUgx: parseInt(mrrUgx) || 0,
      customerRetentionRate: parseFloat(retention) || 95,
    });
    if (res.success) {
      setIsEditing(false);
      setFeedback('Investor KPIs updated successfully.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231E]">
            MARS Corporation Investor Relations & Growth KPIs
          </h2>
          <p className="text-xs text-[#65766F] mt-0.5">
            Sovereign platform business traction, ARR expansion & capital round governance (Audited Financial Abstracts)
          </p>
        </div>
        {(isPrincipalFounder() || hasScope('platform.analytics.read')) && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-[#101915] hover:bg-[#17231E] text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
          >
            {isEditing ? 'Cancel KPI Edit' : 'Update Investment KPIs'}
          </button>
        )}
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[#0AB77F] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Security Privacy Notice */}
      <div className="p-4 bg-[#F5F8F6] border border-[#DFE8E3] rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#17231E]">
          <ShieldCheck className="w-4 h-4 text-[#0AB77F]" />
          <span className="font-bold">
            Data Isolation Compliance: Investor metrics provide macro ecosystem KPIs without exposing landlord or tenant private PII.
          </span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
          Audited
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#DFE8E3] shadow-xs">
          <span className="text-xs font-extrabold text-[#65766F] uppercase tracking-wider">
            Annual Recurring Revenue (ARR)
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#17231E] mt-2">
            UGX {(investorMetrics.arrUgx / 1000000).toLocaleString()}M
          </div>
          <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{investorMetrics.yoyGrowthPercent}% YoY Expansion</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#DFE8E3] shadow-xs">
          <span className="text-xs font-extrabold text-[#65766F] uppercase tracking-wider">
            Monthly Recurring Revenue (MRR)
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#17231E] mt-2">
            UGX {(investorMetrics.mrrUgx / 1000000).toLocaleString()}M
          </div>
          <div className="text-[11px] font-bold text-[#65766F] mt-1">
            Subscription software revenue
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#DFE8E3] shadow-xs">
          <span className="text-xs font-extrabold text-[#65766F] uppercase tracking-wider">
            Throughput Processed (GMV)
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#0AB77F] mt-2">
            UGX {(investorMetrics.totalRentProcessedUgx / 1000000000).toFixed(2)}B
          </div>
          <div className="text-[11px] font-bold text-[#65766F] mt-1">
            Validated double-entry ledger flow
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#DFE8E3] shadow-xs">
          <span className="text-xs font-extrabold text-[#65766F] uppercase tracking-wider">
            Net Customer Retention
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#17231E] mt-2">
            {investorMetrics.customerRetentionRate}%
          </div>
          <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Top-quartile SaaS benchmark</span>
          </div>
        </div>
      </div>

      {/* Edit Form if enabled */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-[#0AB77F] shadow-md space-y-4">
          <h3 className="text-sm font-black text-[#17231E]">
            Update Sovereign Investment Metrics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#17231E] mb-1">ARR (UGX)</label>
              <input
                type="number"
                value={arrUgx}
                onChange={(e) => setArrUgx(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#17231E] mb-1">MRR (UGX)</label>
              <input
                type="number"
                value={mrrUgx}
                onChange={(e) => setMrrUgx(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#17231E] mb-1">Retention (%)</label>
              <input
                type="number"
                step="0.1"
                value={retention}
                onChange={(e) => setRetention(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Save Investment KPIs
          </button>
        </form>
      )}

      {/* Capitalization Rounds & Funding Pipeline */}
      <div className="bg-white rounded-3xl border border-[#DFE8E3] shadow-xs p-6 space-y-4">
        <div>
          <h3 className="text-sm font-black text-[#17231E]">
            MARS Corporation Capitalization & Investment Rounds
          </h3>
          <p className="text-xs text-[#65766F]">
            Funding governance, target allocations & sovereign capital structure
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {investorMetrics.investmentRounds.map((rnd, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-[#DFE8E3] bg-[#F5F8F6] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-extrabold text-sm text-[#17231E]">{rnd.roundName}</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      rnd.status === 'CLOSED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rnd.status}
                  </span>
                </div>
                <div className="text-xs text-[#65766F] font-semibold">
                  Target: UGX {(rnd.targetUgx / 1000000).toLocaleString()}M | Allocated:{' '}
                  <strong>UGX {(rnd.raisedUgx / 1000000).toLocaleString()}M</strong>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full sm:w-48 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                  <span>Progress</span>
                  <span>{Math.round((rnd.raisedUgx / rnd.targetUgx) * 100)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-[#0AB77F]"
                    style={{
                      width: `${Math.min(100, Math.round((rnd.raisedUgx / rnd.targetUgx) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
