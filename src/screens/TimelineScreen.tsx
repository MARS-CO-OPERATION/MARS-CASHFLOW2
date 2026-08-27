import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx } from '../utils/formatters';
import {
  History,
  Receipt,
  TrendingDown,
  Wrench,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface TimelineScreenProps {
  onNavigate: (route: string) => void;
  onViewReceipt: (paymentId: string) => void;
}

export const TimelineScreen: React.FC<TimelineScreenProps> = ({
  onNavigate,
  onViewReceipt,
}) => {
  const { payments, expenses, maintenance } = useMars();

  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PAYMENT' | 'EXPENSE' | 'MAINTENANCE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Merge events into a unified chronological stream
  const events = [
    ...payments.map((p) => ({
      id: `p-${p.id}`,
      originalId: p.id,
      type: 'PAYMENT' as const,
      title: `Rent Paid: ${p.tenantName}`,
      subtitle: `${p.propertyName} • ${p.unitName} (${p.paymentMethod})`,
      amount: p.amount,
      isCredit: true,
      timestamp: p.paymentTimestamp || p.createdAt || 0,
      date: p.date,
      notes: p.notes,
    })),
    ...expenses.map((e) => ({
      id: `e-${e.id}`,
      originalId: e.id,
      type: 'EXPENSE' as const,
      title: `Expense Voucher: ${e.description}`,
      subtitle: `${e.propertyName} • ${e.category}`,
      amount: e.amount,
      isCredit: false,
      timestamp: e.expenseTimestamp || e.createdAt || 0,
      date: e.date,
      notes: `Approved operating cost`,
    })),
    ...maintenance.map((m) => ({
      id: `m-${m.id}`,
      originalId: m.id,
      type: 'MAINTENANCE' as const,
      title: `Repair Request: ${m.issue}`,
      subtitle: `${m.propertyName} • ${m.unitName} (Assigned: ${m.assignedProviderName || 'Unassigned'})`,
      amount: m.estimatedCost,
      isCredit: false,
      timestamp: m.reportedTimestamp || m.createdAt || 0,
      date: m.date || new Date(m.createdAt).toLocaleDateString(),
      notes: `Status: ${m.status} | Priority: ${m.priority}`,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const filteredEvents = events.filter((ev) => {
    const matchType = typeFilter === 'ALL' || ev.type === typeFilter;
    const matchSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto px-4 sm:px-6 pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0AB77F] text-white flex items-center justify-center text-xl">
            📜
          </div>
          <div>
            <h1 className="text-xl font-black text-[#17231E]">Master Activity Audit Trail</h1>
            <p className="text-xs text-[#65766F]">
              Immutable chronological record of receipts, vouchers & operations
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#0AB77F]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white p-2 rounded-2xl border border-[#DFE8E3]">
        {[
          { id: 'ALL', label: `All Events (${events.length})` },
          { id: 'PAYMENT', label: `Receipts Inflow (${payments.length})` },
          { id: 'EXPENSE', label: `Expenses Outflow (${expenses.length})` },
          { id: 'MAINTENANCE', label: `Work Orders (${maintenance.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTypeFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              typeFilter === tab.id
                ? 'bg-[#101915] text-white shadow-xs'
                : 'text-[#65766F] hover:bg-gray-100 hover:text-[#17231E]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      <div className="bg-white rounded-3xl p-6 border border-[#DFE8E3] shadow-sm space-y-6">
        <div className="relative pl-6 border-l-2 border-[#DFE8E3] space-y-6">
          {filteredEvents.map((ev) => (
            <div key={ev.id} className="relative group">
              {/* Timeline marker node */}
              <div
                className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                  ev.type === 'PAYMENT'
                    ? 'bg-[#0AB77F]'
                    : ev.type === 'EXPENSE'
                    ? 'bg-[#D93838]'
                    : 'bg-amber-500'
                }`}
              />

              <div
                onClick={() => {
                  if (ev.type === 'PAYMENT') onViewReceipt(ev.originalId);
                }}
                className={`p-4 rounded-2xl border transition-all ${
                  ev.type === 'PAYMENT'
                    ? 'bg-[#F5F8F6] hover:bg-[#E2F8EF]/40 border-[#DFE8E3] cursor-pointer'
                    : 'bg-white border-[#DFE8E3]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#65766F] block">{ev.date}</span>
                    <h4 className="font-black text-xs sm:text-sm text-[#17231E]">{ev.title}</h4>
                    <p className="text-xs text-[#65766F] mt-0.5">{ev.subtitle}</p>
                    <p className="text-[11px] text-[#65766F] italic mt-1">{ev.notes}</p>
                  </div>

                  <div className="text-right sm:self-center">
                    <span
                      className={`text-sm sm:text-base font-black ${
                        ev.isCredit ? 'text-[#0AB77F]' : 'text-[#D93838]'
                      }`}
                    >
                      {ev.isCredit ? `+${formatUgx(ev.amount)}` : `-${formatUgx(ev.amount)}`}
                    </span>
                    {ev.type === 'PAYMENT' && (
                      <span className="block text-[10px] text-[#0AB77F] font-bold">
                        View Receipt →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
