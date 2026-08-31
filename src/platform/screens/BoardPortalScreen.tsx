import React, { useState } from 'react';
import { usePlatform } from '../PlatformContext';
import { BoardReportEntity } from '../../types';
import {
  Landmark,
  FileText,
  Plus,
  CheckCircle2,
  Lock,
  Download,
  Calendar,
  Layers,
  Sparkles,
  X,
  ShieldCheck,
} from 'lucide-react';

export const BoardPortalScreen: React.FC = () => {
  const {
    boardReports,
    publishBoardReport,
    isPrincipalFounder,
    isBoardMember,
    hasScope,
  } = usePlatform();

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<BoardReportEntity>(
    boardReports[0] || null
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  // New report form
  const [newTitle, setNewTitle] = useState('');
  const [newPeriod, setNewPeriod] = useState('Q3 2026');
  const [newType, setNewType] = useState<BoardReportEntity['reportType']>('QUARTERLY_GOVERNANCE');
  const [newSummary, setNewSummary] = useState('');
  const [newHighlights, setNewHighlights] = useState(
    'Ledger uptime maintained at 99.98%, Revenue grew 28% QoQ, Zero data security incidents'
  );

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSummary) return;

    const highlightsArray = newHighlights
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean);

    const res = await publishBoardReport({
      title: newTitle.trim(),
      period: newPeriod.trim(),
      reportType: newType,
      summary: newSummary.trim(),
      highlights: highlightsArray,
      metrics: {
        activeProducts: 4,
        totalTenanciesTracked: 1350,
        grossLedgerUgx: 2890000000,
        mrrUgx: 21500000,
        systemUptime: '99.99%',
      },
      status: 'PUBLISHED',
    });

    if (res.success) {
      setShowPublishModal(false);
      setFeedback('New Corporate Board Governance Memo published.');
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231E]">
            MARS Corporation Board Governance Portal
          </h2>
          <p className="text-xs text-[#65766F] mt-0.5">
            Executive filings, quarterly governance memos & sovereign compliance disclosures (Zero Tenant PII Exposure)
          </p>
        </div>
        {(isPrincipalFounder() || hasScope('corporate.governance.manage')) && (
          <button
            onClick={() => setShowPublishModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#101915] hover:bg-[#17231E] text-white rounded-2xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#62E3B6]" />
            <span>Publish Board Memo</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[#0AB77F] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Governance Security Badge */}
      <div className="p-4 bg-[#F5F8F6] border border-[#DFE8E3] rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#17231E]">
          <ShieldCheck className="w-4 h-4 text-[#0AB77F]" />
          <span className="font-bold">
            Strict Corporate Isolation: Board reports contain aggregated audited metrics and governance summaries only.
          </span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
          Confidential
        </span>
      </div>

      {/* Main Grid: Reports List + Selected Memo Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Reports Archive (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-extrabold text-[#65766F] uppercase tracking-wider px-1">
            Board Filings Archive ({boardReports.length})
          </div>
          <div className="space-y-2">
            {boardReports.map((rep) => {
              const isSelected = selectedReport?.id === rep.id;
              return (
                <button
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#101915] text-white border-[#101915] shadow-md'
                      : 'bg-white text-[#17231E] border-[#DFE8E3] hover:border-[#0AB77F]/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        isSelected ? 'bg-[#1C2C25] text-[#62E3B6]' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {rep.period}
                    </span>
                    <span className="text-[10px] font-mono opacity-70">
                      {new Date(rep.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="font-extrabold text-xs leading-snug">{rep.title}</div>
                  <div className="text-[11px] opacity-75 mt-1 truncate">{rep.summary}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Filing Viewer (8 cols) */}
        <div className="lg:col-span-8">
          {selectedReport ? (
            <div className="bg-white rounded-3xl border border-[#DFE8E3] shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black px-2.5 py-0.5 bg-[#E2F8EF] text-[#07885E] rounded-md uppercase">
                      {selectedReport.period}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold">
                      Published by {selectedReport.publishedBy}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#17231E]">{selectedReport.title}</h3>
                </div>
              </div>

              {/* Metrics Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#F5F8F6] rounded-2xl border border-gray-200">
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">
                    Ecosystem Products
                  </div>
                  <div className="text-lg font-black text-[#17231E]">
                    {selectedReport.metrics.activeProducts}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">
                    Ledger Throughput
                  </div>
                  <div className="text-lg font-black text-[#0AB77F]">
                    UGX {(selectedReport.metrics.grossLedgerUgx / 1000000000).toFixed(2)}B
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">
                    Platform MRR
                  </div>
                  <div className="text-lg font-black text-[#17231E]">
                    UGX {(selectedReport.metrics.mrrUgx / 1000000).toFixed(1)}M
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">
                    System Uptime
                  </div>
                  <div className="text-lg font-black text-emerald-600">
                    {selectedReport.metrics.systemUptime}
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-[#65766F] uppercase tracking-wider">
                  Executive Abstract & Governance Context
                </h4>
                <p className="text-xs sm:text-sm text-[#17231E] leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  {selectedReport.summary}
                </p>
              </div>

              {/* Key Governance Highlights */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-[#65766F] uppercase tracking-wider">
                  Governance Milestones & Compliance Actions
                </h4>
                <div className="space-y-2">
                  {selectedReport.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white border border-gray-200 rounded-xl flex items-start gap-2.5 text-xs text-[#17231E] font-semibold"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#0AB77F] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#DFE8E3] text-xs text-gray-500">
              Select a board report from the archive to inspect.
            </div>
          )}
        </div>
      </div>

      {/* Publish Memo Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full text-[#17231E] shadow-2xl space-y-4 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-sm text-[#17231E]">
                  Draft Board Governance Filing
                </h3>
                <p className="text-[11px] text-[#65766F]">
                  Publish audited platform memo to Board of Directors
                </p>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublish} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Report Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Q3 2026 Sovereign Governance & Security Audit"
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17231E] mb-1">
                    Reporting Period
                  </label>
                  <input
                    type="text"
                    required
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                    placeholder="e.g. Q3 2026"
                    className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17231E] mb-1">
                    Filing Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                  >
                    <option value="QUARTERLY_GOVERNANCE">Quarterly Governance</option>
                    <option value="ANNUAL_FINANCIAL">Annual Financial Abstract</option>
                    <option value="PRODUCT_GROWTH">Product Line Growth</option>
                    <option value="COMPLIANCE">Regulatory Compliance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Executive Summary *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Core executive abstract and governance updates..."
                  className="w-full px-3.5 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs text-[#17231E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Governance Highlights (comma separated)
                </label>
                <textarea
                  rows={2}
                  value={newHighlights}
                  onChange={(e) => setNewHighlights(e.target.value)}
                  placeholder="Item 1, Item 2, Item 3"
                  className="w-full px-3.5 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs text-[#17231E]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#65766F] rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#101915] hover:bg-[#17231E] text-white rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  Publish Memo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
