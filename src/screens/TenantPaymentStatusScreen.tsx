import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx } from '../utils/formatters';
import { TenantEntity } from '../types';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { BatchReminderModal } from '../components/BatchReminderModal';
import {
  ListOrdered,
  Send,
  Receipt,
  Search,
  CheckCircle2,
  AlertTriangle,
  Filter
} from 'lucide-react';

interface TenantPaymentStatusScreenProps {
  onNavigate: (route: string) => void;
  onViewReceipt: (paymentId: string) => void;
}

export const TenantPaymentStatusScreen: React.FC<TenantPaymentStatusScreenProps> = ({
  onNavigate,
  onViewReceipt,
}) => {
  const { tenants, properties, sendTenantReminder } = useMars();

  const [selectedProperty, setSelectedProperty] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Overdue' | 'Current'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedTenantForPay, setSelectedTenantForPay] = useState<TenantEntity | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showBatchReminder, setShowBatchReminder] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredTenants = tenants.filter((t) => {
    const matchProp = selectedProperty === 'All' || t.propertyName === selectedProperty;
    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Overdue' && t.arrears > 0) ||
      (statusFilter === 'Current' && t.arrears === 0);
    const matchSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.unitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery);

    return matchProp && matchStatus && matchSearch;
  });

  const handleSingleReminder = (t: TenantEntity) => {
    sendTenantReminder(t.name, t.phone, t.arrears, t.propertyName, t.unitName, () => {
      setToastMessage(`SMS reminder dispatched to ${t.name} (${t.phone}).`);
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
          className="px-4 py-2 bg-[#D93838] hover:bg-red-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Send className="w-4 h-4" />
          Broadcast SMS Notices
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-3xl p-4 border border-[#DFE8E3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {(['All', 'Overdue', 'Current'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#101915] text-white shadow-xs'
                  : 'bg-[#F5F8F6] text-[#65766F] hover:text-[#17231E]'
              }`}
            >
              {st} ({tenants.filter((t) => (st === 'All' ? true : st === 'Overdue' ? t.arrears > 0 : t.arrears === 0)).length})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
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

      {/* Matrix Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#DFE8E3] shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#DFE8E3] text-[#65766F] font-bold">
              <th className="pb-3 px-2">Unit & Property</th>
              <th className="pb-3 px-2">Tenant Name</th>
              <th className="pb-3 px-2">Phone / Contact</th>
              <th className="pb-3 px-2">Monthly Rent</th>
              <th className="pb-3 px-2">Arrears Balance</th>
              <th className="pb-3 px-2">Status</th>
              <th className="pb-3 px-2 text-right">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {filteredTenants.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3.5 px-2 font-black text-[#17231E]">
                  {t.unitName}
                  <span className="block text-[10px] text-[#65766F] font-normal">{t.propertyName}</span>
                </td>
                <td className="py-3.5 px-2 font-bold text-[#17231E]">{t.name}</td>
                <td className="py-3.5 px-2 text-[#65766F]">{t.phone}</td>
                <td className="py-3.5 px-2 font-bold text-[#17231E]">{formatUgx(t.monthlyRent)}</td>
                <td className="py-3.5 px-2 font-black">
                  <span className={t.arrears > 0 ? 'text-[#D93838]' : 'text-[#0AB77F]'}>
                    {formatUgx(t.arrears)}
                  </span>
                </td>
                <td className="py-3.5 px-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.arrears > 0
                        ? 'bg-red-100 text-[#D93838]'
                        : 'bg-[#E2F8EF] text-[#0AB77F]'
                    }`}
                  >
                    {t.arrears > 0 ? '⚠️ Overdue' : '✅ Clear'}
                  </span>
                </td>
                <td className="py-3.5 px-2 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {t.arrears > 0 && (
                      <button
                        onClick={() => handleSingleReminder(t)}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-[#D93838] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        title="Send SMS"
                      >
                        SMS
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedTenantForPay(t);
                        setShowPayModal(true);
                      }}
                      className="px-3 py-1 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Record Pay
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
          setToastMessage(`Dispatched SMS payment reminders to ${count} occupants.`);
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />
    </div>
  );
};
