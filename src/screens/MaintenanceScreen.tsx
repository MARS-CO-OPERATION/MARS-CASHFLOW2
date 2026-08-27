import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx } from '../utils/formatters';
import { MaintenanceEntity } from '../types';
import { LogMaintenanceModal } from '../components/LogMaintenanceModal';
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  UserCheck,
  Calendar
} from 'lucide-react';

interface MaintenanceScreenProps {
  onNavigate: (route: string) => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ onNavigate }) => {
  const { maintenance, updateMaintenanceStatus } = useMars();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showLogModal, setShowLogModal] = useState(false);

  const filteredTickets = maintenance.filter((m: MaintenanceEntity) => {
    if (statusFilter === 'ALL') return true;
    return m.status === statusFilter;
  });

  const getPriorityBadge = (p: MaintenanceEntity['priority']) => {
    switch (p) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-[#D93838]">🔴 URGENT</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">🟠 HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">🟡 MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">🟢 LOW</span>;
    }
  };

  const getStatusBadge = (s: MaintenanceEntity['status']) => {
    switch (s) {
      case 'Pending':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">⏳ Pending Dispatch</span>;
      case 'In Progress':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">🛠️ Work In Progress</span>;
      case 'Resolved':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E2F8EF] text-[#0AB77F] border border-emerald-200">✅ Job Completed</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">🚫 Cancelled</span>;
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl">
            🛠️
          </div>
          <div>
            <h1 className="text-xl font-black text-[#17231E]">Repairs & Maintenance Board</h1>
            <p className="text-xs text-[#65766F]">
              Track work orders, plumbing, electricals & contractor dispatches
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('recurring_maintenance')}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#0AB77F]" />
            Recurring Tasks
          </button>
          <button
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Log Work Order
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white p-2 rounded-2xl border border-[#DFE8E3]">
        {['ALL', 'Pending', 'In Progress', 'Resolved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === tab
                ? 'bg-[#101915] text-white shadow-xs'
                : 'text-[#65766F] hover:bg-gray-100 hover:text-[#17231E]'
            }`}
          >
            {tab === 'ALL'
              ? `All Tickets (${maintenance.length})`
              : tab === 'Pending'
              ? `Pending (${maintenance.filter((m: MaintenanceEntity) => m.status === 'Pending').length})`
              : tab === 'In Progress'
              ? `In Progress (${maintenance.filter((m: MaintenanceEntity) => m.status === 'In Progress').length})`
              : `Resolved (${maintenance.filter((m: MaintenanceEntity) => m.status === 'Resolved').length})`}
          </button>
        ))}
      </div>

      {/* Ticket Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTickets.map((ticket: MaintenanceEntity) => (
          <div
            key={ticket.id}
            className="bg-white rounded-3xl p-5 border border-[#DFE8E3] shadow-xs space-y-4 hover:border-[#0AB77F]/50 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPriorityBadge(ticket.priority)}
                  {getStatusBadge(ticket.status)}
                </div>
                <span className="text-[10px] text-[#65766F] font-semibold">{ticket.date || new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-[#17231E]">{ticket.issue}</h3>
                <p className="text-xs text-[#65766F] mt-0.5">
                  {ticket.propertyName} • {ticket.unitName} (Tenant: {ticket.tenantName})
                </p>
              </div>

              <div className="p-3 bg-[#F5F8F6] rounded-2xl border border-[#DFE8E3] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#65766F] block">Assigned Contractor</span>
                  <span className="font-bold text-[#17231E]">{ticket.assignedProviderName || 'Unassigned'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#65766F] block">Estimated Cost</span>
                  <span className="font-extrabold text-amber-700">
                    {formatUgx(ticket.estimatedCost)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status change actions */}
            <div className="pt-2 border-t border-[#DFE8E3] flex items-center justify-end gap-2">
              {ticket.status === 'Pending' && (
                <button
                  onClick={() => updateMaintenanceStatus(ticket.id, 'In Progress')}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Start Work
                </button>
              )}
              {ticket.status === 'In Progress' && (
                <button
                  onClick={() => updateMaintenanceStatus(ticket.id, 'Resolved')}
                  className="px-3 py-1.5 bg-[#E2F8EF] hover:bg-emerald-100 text-[#0AB77F] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Mark Resolved
                </button>
              )}
              {ticket.status === 'Resolved' && (
                <span className="text-[11px] font-bold text-[#0AB77F] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completed & Closed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <LogMaintenanceModal isOpen={showLogModal} onClose={() => setShowLogModal(false)} />
    </div>
  );
};
