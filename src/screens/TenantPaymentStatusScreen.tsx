import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx } from '../utils/formatters';
import { TenantEntity } from '../types';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { BatchReminderModal } from '../components/BatchReminderModal';
import { EmptyState } from '../components/EmptyState';
import {
  ListOrdered,
  Send,
  Receipt,
  Search,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Users
} from 'lucide-react';

interface TenantPaymentStatusScreenProps {
  onNavigate: (route: string) => void;
  onViewReceipt: (paymentId: string) => void;
}

export const TenantPaymentStatusScreen: React.FC<TenantPaymentStatusScreenProps> = ({
  onNavigate,
  onViewReceipt,
}) => {
  const { tenants, properties, sendTenantReminder, t } = useMars();

  const [selectedProperty, setSelectedProperty] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Overdue' | 'Current'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedTenantForPay, setSelectedTenantForPay] = useState<TenantEntity | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showBatchReminder, setShowBatchReminder] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredTenants = tenants.filter((tItem) => {
    const matchProp = selectedProperty === 'All' || tItem.propertyName === selectedProperty;
    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Overdue' && tItem.arrears > 0) ||
      (statusFilter === 'Current' && tItem.arrears === 0);
    const matchSearch =
      tItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tItem.unitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tItem.phone.includes(searchQuery);

    return matchProp && matchStatus && matchSearch;
  });

  const handleSingleReminder = (tItem: TenantEntity) => {
    sendTenantReminder(tItem.name, tItem.phone, tItem.arrears, tItem.propertyName, tItem.unitName, () => {
      setToastMessage(`SMS reminder dispatched to ${tItem.name} (${tItem.phone}).`);
      setTimeout(() => setToastMessage(null), 4000);
    });
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      {/* Toast */}
      {toastMessage && (
        <div className="bg-[#0AB77F]/15 border border-[#0AB77F]/40 text-[#17231E] px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0AB77F]" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-gray-400 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Modals */}
      <RecordPaymentModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        initialTenant={selectedTenantForPay}
        onPaymentSuccess={(pId) => onViewReceipt(pId)}
      />

      <BatchReminderModal
        isOpen={showBatchReminder}
        onClose={() => setShowBatchReminder(false)}
        onSuccess={(count) => {
          setToastMessage(`Broadcasted SMS payment notices to ${count} overdue occupants.`);
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0AB77F] text-white flex items-center justify-center text-xl">
            📋
          </div>
          <div>
            <h1 className="text-xl font-black text-[#17231E]">Tenant Payment Matrix</h1>
            <p className="text-xs text-[#65766F]">
              Real-time lease status, collection compliance & arrears monitor
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowBatchReminder(true)}
          disabled={tenants.filter((tItem) => tItem.arrears > 0).length === 0}
          className="px-4 py-2 bg-[#D93838] hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Send className="w-4 h-4" />
          <span>Broadcast SMS Notices</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-3xl p-4 border border-[#DFE8E3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {(['All', 'Overdue', 'Current'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#101915] text-white shadow-xs'
                  : 'bg-[#F5F8F6] text-[#65766F] hover:text-[#17231E]'
              }`}
            >
              {st} ({tenants.filter((tItem) => (st === 'All' ? true : st === 'Overdue' ? tItem.arrears > 0 : tItem.arrears === 0)).length})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {properties.length > 0 && (
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="px-3 py-1.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
            >
              <option value="All">All Estates</option>
              {properties.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tenant..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#0AB77F]"
            />
          </div>
        </div>
      </div>

      {/* Tenants Table / Cards */}
      {filteredTenants.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t.noTenantsTitle}
          description={t.noTenantsDesc}
          actionLabel="Onboard First Tenant"
          onAction={() => onNavigate('dashboard')}
          tips={[
            'The payment status matrix provides a bird’s-eye view of all lease agreements, monthly rent, and overdue balances.',
            'You can broadcast automated SMS payment reminders with 1 click.',
          ]}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-[#DFE8E3] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F8F6] text-[#65766F] font-bold border-b border-[#DFE8E3]">
                <tr>
                  <th className="p-4">Tenant / Contact</th>
                  <th className="p-4">Estate & Unit</th>
                  <th className="p-4">Monthly Rent</th>
                  <th className="p-4">Status & Arrears</th>
                  <th className="p-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE8E3]">
                {filteredTenants.map((tItem) => (
                  <tr key={tItem.id} className="hover:bg-[#F5F8F6]/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#17231E]">{tItem.name}</div>
                      <div className="text-[11px] text-[#65766F]">{tItem.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-[#17231E]">{tItem.propertyName}</div>
                      <div className="text-[11px] text-[#65766F]">{tItem.unitName}</div>
                    </td>
                    <td className="p-4 font-black text-[#17231E]">
                      {formatUgx(tItem.monthlyRent)}
                    </td>
                    <td className="p-4">
                      {tItem.arrears > 0 ? (
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-[#D93838]">
                            ⚠️ Overdue
                          </span>
                          <div className="text-xs font-black text-[#D93838]">
                            {formatUgx(tItem.arrears)}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E2F8EF] text-[#0AB77F]">
                            ✅ Paid Current
                          </span>
                          {(tItem.advanceBalance ?? 0) > 0 && (
                            <div className="text-[10px] text-[#0AB77F]">
                              Advance: {formatUgx(tItem.advanceBalance || 0)}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {tItem.arrears > 0 && (
                          <button
                            onClick={() => handleSingleReminder(tItem)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-[#D93838] rounded-xl transition-colors cursor-pointer"
                            title="Dispatch SMS Reminder"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedTenantForPay(tItem);
                            setShowPayModal(true);
                          }}
                          className="px-3 py-1.5 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                        >
                          Record Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
