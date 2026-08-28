import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx } from '../utils/formatters';
import { MaintenanceEntity, MaintenanceStatus, MaintenanceUrgency } from '../types';
import { LogMaintenanceModal } from '../components/LogMaintenanceModal';
import { EmptyState } from '../components/EmptyState';
import { MARS_PROJECTS_CONTACT, MARS_PROJECT_CATEGORIES } from '../services/store';
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  UserCheck,
  Calendar,
  Phone,
  Globe,
  Mail,
  ShieldCheck,
  FileCheck,
  DollarSign,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  XCircle,
  Receipt
} from 'lucide-react';

interface MaintenanceScreenProps {
  onNavigate: (route: string) => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ onNavigate }) => {
  const {
    maintenance,
    updateMaintenanceStatus,
    approveMaintenanceQuotation,
    declineMaintenanceQuotation,
    linkMaintenanceToCashflowExpense,
    submitMaintenanceQuotation,
    t,
  } = useMars();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showLogModal, setShowLogModal] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quote generator simulation helper modal for demo/testing
  const [quotingTicket, setQuotingTicket] = useState<MaintenanceEntity | null>(null);
  const [quoteMaterials, setQuoteMaterials] = useState('120000');
  const [quoteLabour, setQuoteLabour] = useState('80000');
  const [quoteNotes, setQuoteNotes] = useState('Includes genuine copper fittings, high-grade sealant, and 6-month work warranty.');

  const filteredTickets = maintenance.filter((m: MaintenanceEntity) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'QUOTATION_PROVIDED') return m.status === 'QUOTATION_PROVIDED';
    if (statusFilter === 'IN_PROGRESS') return m.status === 'IN_PROGRESS' || m.status === 'APPROVED';
    if (statusFilter === 'COMPLETED') return m.status === 'COMPLETED' || m.status === 'CLOSED';
    if (statusFilter === 'SUBMITTED') return m.status === 'SUBMITTED' || m.status === 'UNDER_REVIEW';
    return m.status === statusFilter;
  });

  const getUrgencyBadge = (u?: MaintenanceUrgency, p?: MaintenanceEntity['priority']) => {
    if (u === 'Emergency' || p === 'EMERGENCY') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-[#D93838] border border-red-200 animate-pulse">
          🚨 EMERGENCY (1-3 hrs)
        </span>
      );
    }
    if (u === 'Urgent' || p === 'HIGH') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
          ⚡ URGENT (Within 24 hrs)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E2F8EF] text-[#0AB77F] border border-emerald-200">
        🗓️ NORMAL / SCHEDULED
      </span>
    );
  };

  const getStatusBadge = (s: MaintenanceStatus) => {
    switch (s) {
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
            ⏳ Inspection Dispatched
          </span>
        );
      case 'QUOTATION_PROVIDED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 ring-2 ring-amber-400/40">
            📑 Quotation Ready for Approval
          </span>
        );
      case 'APPROVED':
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
            🛠️ Work In Progress
          </span>
        );
      case 'COMPLETED':
      case 'CLOSED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E2F8EF] text-[#0AB77F] border border-emerald-200">
            ✅ Job Verified & Completed
          </span>
        );
      case 'DECLINED':
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-600">
            🚫 Cancelled / Declined
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100">{s}</span>;
    }
  };

  const handleApproveQuote = (ticketId: string) => {
    approveMaintenanceQuotation(ticketId);
    setActionFeedback({ type: 'success', text: 'Quotation approved! MARS Projects dispatched for execution.' });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleDeclineQuote = (ticketId: string) => {
    declineMaintenanceQuotation(ticketId, 'Landlord requested re-assessment of costs.');
    setActionFeedback({ type: 'error', text: 'Quotation declined. Ticket updated.' });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleLinkExpense = (ticketId: string) => {
    const res = linkMaintenanceToCashflowExpense(ticketId);
    if (res.success) {
      setActionFeedback({ type: 'success', text: res.message });
    } else {
      setActionFeedback({ type: 'error', text: res.message });
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleSimulateProvideQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotingTicket) return;
    const mat = parseFloat(quoteMaterials.replace(/[^0-9]/g, '')) || 0;
    const lab = parseFloat(quoteLabour.replace(/[^0-9]/g, '')) || 0;
    submitMaintenanceQuotation(quotingTicket.id, {
      materialsCost: mat,
      labourCost: lab,
      totalCost: mat + lab,
      inspectorNotes: quoteNotes,
      validUntil: Date.now() + 14 * 86400000,
    });
    setQuotingTicket(null);
    setActionFeedback({ type: 'success', text: 'Official MARS Projects quotation generated & attached.' });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      {/* Log Service Modal */}
      <LogMaintenanceModal isOpen={showLogModal} onClose={() => setShowLogModal(false)} />

      {/* Quote Creation Modal (for simulated contractor quotation) */}
      {quotingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#DFE8E3] shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E2F8EF] text-[#0AB77F] flex items-center justify-center text-xl">
                📑
              </div>
              <div>
                <h3 className="font-black text-sm text-[#17231E]">Submit MARS Projects Quotation</h3>
                <p className="text-xs text-[#65766F]">Ticket #{quotingTicket.marsProjectsTicketNumber || quotingTicket.id}</p>
              </div>
            </div>

            <form onSubmit={handleSimulateProvideQuote} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-[#17231E] mb-1">Materials / Hardware Cost (UGX)</label>
                <input
                  type="text"
                  required
                  value={quoteMaterials}
                  onChange={(e) => setQuoteMaterials(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#17231E] mb-1">Labour & Field Workmanship (UGX)</label>
                <input
                  type="text"
                  required
                  value={quoteLabour}
                  onChange={(e) => setQuoteLabour(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#17231E] mb-1">Inspector / Scope Notes</label>
                <textarea
                  rows={2}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-medium text-[#17231E]"
                />
              </div>

              <div className="p-3 bg-[#E2F8EF] rounded-xl text-xs font-bold text-[#0AB77F] flex items-center justify-between">
                <span>Total Quotation Sum:</span>
                <span className="text-sm font-black">
                  {formatUgx(
                    (parseFloat(quoteMaterials.replace(/[^0-9]/g, '')) || 0) +
                    (parseFloat(quoteLabour.replace(/[^0-9]/g, '')) || 0)
                  )}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuotingTicket(null)}
                  className="px-4 py-2 bg-[#F5F8F6] text-xs font-bold text-gray-600 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0AB77F] hover:bg-[#07885E] text-white text-xs font-black rounded-xl cursor-pointer"
                >
                  Submit Official Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MARS Projects Uganda Official Partner Header */}
      <div className="bg-[#101915] rounded-3xl p-6 text-white border border-[#263D33] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0AB77F] text-white flex items-center justify-center text-2xl shadow-md">
              🛠️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">
                  MARS Projects Uganda
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#62E3B6]/20 text-[#62E3B6] border border-[#62E3B6]/30">
                  OFFICIAL PARTNER
                </span>
              </div>
              <p className="text-xs text-[#9FB2A9] font-medium">
                Vetted Repairs, Capital Works, Property Renovations & Maintenance Engineering
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('recurring_maintenance')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/15 border border-[#38574A] rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#62E3B6]" />
              <span>Recurring Schedules</span>
            </button>

            <button
              onClick={() => setShowLogModal(true)}
              className="px-4 py-2 bg-[#0AB77F] hover:bg-[#07885E] active:scale-[0.98] text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Request Service / Quote</span>
            </button>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-[#263D33] text-xs text-[#C5D7CE]">
          <a
            href={`tel:${MARS_PROJECTS_CONTACT.phoneRaw}`}
            className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#62E3B6]" />
            <span>Hotline: {MARS_PROJECTS_CONTACT.phone}</span>
          </a>
          <a
            href={`https://wa.me/${MARS_PROJECTS_CONTACT.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span>💬 WhatsApp Helpdesk</span>
          </a>
          <a
            href={`mailto:${MARS_PROJECTS_CONTACT.email}`}
            className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-[#62E3B6]" />
            <span>{MARS_PROJECTS_CONTACT.email}</span>
          </a>
          <a
            href={MARS_PROJECTS_CONTACT.website}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-[#62E3B6]" />
            <span>marsprojects.ug</span>
          </a>
        </div>
      </div>

      {/* Action Toast Feedback */}
      {actionFeedback && (
        <div
          className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in ${
            actionFeedback.type === 'success'
              ? 'bg-[#0AB77F]/15 border border-[#0AB77F]/40 text-[#17231E]'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#0AB77F]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>{actionFeedback.text}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-gray-400 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Lifecycle Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white p-2 rounded-2xl border border-[#DFE8E3]">
        {[
          { id: 'ALL', label: `All Requests (${maintenance.length})` },
          {
            id: 'SUBMITTED',
            label: `Under Review (${maintenance.filter((m) => m.status === 'SUBMITTED' || m.status === 'UNDER_REVIEW').length})`,
          },
          {
            id: 'QUOTATION_PROVIDED',
            label: `Quotation Ready (${maintenance.filter((m) => m.status === 'QUOTATION_PROVIDED').length})`,
          },
          {
            id: 'IN_PROGRESS',
            label: `In Progress (${maintenance.filter((m) => m.status === 'IN_PROGRESS' || m.status === 'APPROVED').length})`,
          },
          {
            id: 'COMPLETED',
            label: `Completed (${maintenance.filter((m) => m.status === 'COMPLETED' || m.status === 'CLOSED').length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === tab.id
                ? 'bg-[#101915] text-white shadow-xs'
                : 'text-[#65766F] hover:bg-gray-100 hover:text-[#17231E]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tickets List or Empty State */}
      {filteredTickets.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title={t.noMaintenanceTitle}
          description={t.noMaintenanceDesc}
          actionLabel={t.logMaintenance}
          onAction={() => setShowLogModal(true)}
          tips={[
            'MARS Projects Uganda handles plumbing, electricals, roofing, masonry, painting, and complete estate renovations.',
            'Dispatches include transparent material & labour quotations with genuine parts warranty.',
            'Completed repair costs link seamlessly into your Cashflow Operating Expense ledger.',
          ]}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTickets.map((ticket: MaintenanceEntity) => (
            <div
              key={ticket.id}
              className="bg-white rounded-3xl p-5 border border-[#DFE8E3] shadow-xs space-y-4 hover:border-[#0AB77F]/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Strip */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getUrgencyBadge(ticket.urgency, ticket.priority)}
                    {getStatusBadge(ticket.status)}
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#65766F]">
                    #{ticket.marsProjectsTicketNumber || ticket.id}
                  </span>
                </div>

                {/* Service Category & Issue Title */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#F5F8F6] border border-[#DFE8E3] text-[#17231E] uppercase">
                      {ticket.serviceCategory || 'General Repairs'}
                    </span>
                    {ticket.preferredDate && (
                      <span className="text-[11px] text-[#65766F]">
                        Target: {ticket.preferredDate} {ticket.preferredTime && `(${ticket.preferredTime})`}
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-sm text-[#17231E]">{ticket.issue}</h3>
                  <p className="text-xs text-[#65766F] mt-0.5">
                    {ticket.propertyName} • {ticket.unitName} (Occupant: {ticket.tenantName})
                  </p>
                </div>

                {/* Quotation Breakdown (if available) */}
                {ticket.quotation && (
                  <div className="bg-[#F5F8F6] p-4 rounded-2xl border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#17231E] flex items-center gap-1.5">
                        <span>📑</span>
                        <span>MARS Projects Verified Quotation</span>
                      </span>
                      <span className="font-black text-amber-900 text-sm">
                        {formatUgx(ticket.quotation.totalCost)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#65766F] pt-1 border-t border-[#DFE8E3]">
                      <div>Materials: {formatUgx(ticket.quotation.materialsCost ?? ticket.quotation.materialCost ?? 0)}</div>
                      <div>Labour: {formatUgx(ticket.quotation.labourCost ?? ticket.quotation.laborCost ?? 0)}</div>
                    </div>

                    {ticket.quotation.inspectorNotes && (
                      <p className="text-[11px] text-[#65766F] italic bg-white p-2 rounded-xl border border-[#DFE8E3]">
                        "{ticket.quotation.inspectorNotes}"
                      </p>
                    )}

                    {/* Approve / Decline Buttons if status is QUOTATION_PROVIDED */}
                    {ticket.status === 'QUOTATION_PROVIDED' && (
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleApproveQuote(ticket.id)}
                          className="flex-1 py-2 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve Quotation
                        </button>
                        <button
                          onClick={() => handleDeclineQuote(ticket.id)}
                          className="px-3 py-2 bg-white hover:bg-gray-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons & Status Controllers */}
              <div className="pt-3 border-t border-[#DFE8E3] flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-[#65766F]">
                  Est. Cost: <span className="text-[#17231E]">{formatUgx(ticket.actualCost || ticket.estimatedCost || 0)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* If still submitted/under review, allow submitting a demo quote */}
                  {(ticket.status === 'SUBMITTED' || ticket.status === 'UNDER_REVIEW') && !ticket.quotation && (
                    <button
                      onClick={() => setQuotingTicket(ticket)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      + Attach Quote
                    </button>
                  )}

                  {/* Mark In Progress */}
                  {ticket.status === 'APPROVED' && (
                    <button
                      onClick={() => updateMaintenanceStatus(ticket.id, 'IN_PROGRESS')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Start Execution
                    </button>
                  )}

                  {/* Mark Completed */}
                  {ticket.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => updateMaintenanceStatus(ticket.id, 'COMPLETED', ticket.estimatedCost || 150000)}
                      className="px-3 py-1.5 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                    >
                      Mark Completed
                    </button>
                  )}

                  {/* 1-Click Link to Cashflow Operating Expense Voucher */}
                  {(ticket.status === 'COMPLETED' || ticket.status === 'CLOSED') && (
                    <>
                      {ticket.linkedExpenseId ? (
                        <span className="px-3 py-1 bg-emerald-50 text-[#0AB77F] border border-emerald-200 rounded-xl text-[11px] font-bold flex items-center gap-1">
                          <Receipt className="w-3.5 h-3.5" />
                          Linked to Expense
                        </span>
                      ) : (
                        <button
                          onClick={() => handleLinkExpense(ticket.id)}
                          className="px-3 py-1.5 bg-[#101915] hover:bg-gray-800 text-[#62E3B6] rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          Link to Cashflow Expense
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
