import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx } from '../utils/formatters';
import { AddTenantModal } from '../components/AddTenantModal';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { LogMaintenanceModal } from '../components/LogMaintenanceModal';
import {
  Briefcase,
  UserPlus,
  Receipt,
  Smartphone,
  PlusCircle,
  TrendingDown,
  Wrench,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';
import { TenantEntity } from '../types';

interface CaretakerHubScreenProps {
  onNavigate: (route: string) => void;
  onViewReceipt: (paymentId: string) => void;
}

export const CaretakerHubScreen: React.FC<CaretakerHubScreenProps> = ({
  onNavigate,
  onViewReceipt,
}) => {
  const {
    tenants,
    payments,
    properties,
    currentUser,
    syncStatus,
    triggerSync,
    recordPayment,
    sendTenantReminder,
  } = useMars();

  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showLogMaintModal, setShowLogMaintModal] = useState(false);

  // Quick Payment form in Caretaker Hub
  const [selectedTenantId, setSelectedTenantId] = useState(tenants[0]?.id || '');
  const selectedTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];

  const [amountInput, setAmountInput] = useState(
    selectedTenant ? (selectedTenant.arrears > 0 ? selectedTenant.arrears.toString() : selectedTenant.monthlyRent.toString()) : '1200000'
  );
  const [phoneInput, setPhoneInput] = useState(selectedTenant?.phone || '0772123456');
  const [method, setMethod] = useState('Mobile Money (MTN)');
  const [notes, setNotes] = useState('Collected by Caretaker on site');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search filter for tenants
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectTenant = (tId: string) => {
    setSelectedTenantId(tId);
    const t = tenants.find((item) => item.id === tId);
    if (t) {
      setPhoneInput(t.phone);
      setAmountInput(t.arrears > 0 ? t.arrears.toString() : t.monthlyRent.toString());
    }
  };

  const handleCollectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amountInput.replace(/[^0-9]/g, ''));

    if (isNaN(numAmount) || numAmount <= 0) {
      setFeedback({ type: 'error', message: 'Please enter a valid amount in UGX.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = recordPayment({
        tenantName: selectedTenant?.name || 'Occupant',
        propertyName: selectedTenant?.propertyName || 'Kampala Apartments',
        unitName: selectedTenant?.unitName || 'Unit 101',
        amount: numAmount,
        paymentMethod: `${method}${phoneInput ? ` (${phoneInput})` : ''}`,
        notes: notes || 'Ground collection via Caretaker Desk',
      });

      setIsSubmitting(false);
      if (res.success && res.paymentId) {
        setFeedback({
          type: 'success',
          message: `Payment of UGX ${numAmount.toLocaleString()} logged! Opening receipt...`,
        });
        setTimeout(() => {
          if (res.paymentId) onViewReceipt(res.paymentId);
        }, 1000);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setFeedback({ type: 'error', message: err.message || 'Payment recording failed.' });
    }
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.unitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0AB77F] text-white flex items-center justify-center text-xl">
            👨🏾‍💼
          </div>
          <div>
            <h1 className="text-xl font-black text-[#17231E]">Caretaker Operations Hub</h1>
            <p className="text-xs text-[#65766F]">Ground collections, tenant intake & repair dispatches</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <TrendingDown className="w-3.5 h-3.5 text-[#D93838]" />
            Log Expense
          </button>
          <button
            onClick={() => setShowLogMaintModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-500" />
            Report Repair
          </button>
          <button
            onClick={() => setShowAddTenantModal(true)}
            className="px-4 py-2 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add Tenant
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${
            feedback.type === 'success'
              ? 'bg-[#0AB77F]/15 border border-[#0AB77F]/40 text-[#17231E]'
              : 'bg-red-50 border border-red-200 text-[#D93838]'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#0AB77F] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#D93838] shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Grid: Left is Fast Payment Recorder, Right is Sync & Quick Tenant Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rapid Payment Recorder Card (Left Column) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#DFE8E3] shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-[#DFE8E3] pb-3">
            <div className="w-9 h-9 rounded-xl bg-[#0AB77F]/15 flex items-center justify-center text-[#0AB77F]">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#17231E]">Fast Rent Receipting</h3>
              <p className="text-[11px] text-[#65766F]">Issue instant verified digital receipt</p>
            </div>
          </div>

          <form onSubmit={handleCollectPayment} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-[#17231E] mb-1">Target Tenant</label>
              <select
                value={selectedTenantId}
                onChange={(e) => handleSelectTenant(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.propertyName} ({t.unitName}) [
                    {t.arrears > 0 ? `Owes UGX ${formatMoney(t.arrears)}` : 'Paid Up'}]
                  </option>
                ))}
              </select>
            </div>

            {selectedTenant && (
              <div className="p-3 bg-[#E2F8EF] rounded-2xl border border-[#0AB77F]/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#0AB77F] uppercase block">
                    {selectedTenant.unitName}
                  </span>
                  <span className="font-bold text-xs text-[#17231E]">{selectedTenant.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#65766F] block">Arrears Due</span>
                  <span
                    className={`font-black text-xs ${
                      selectedTenant.arrears > 0 ? 'text-[#D93838]' : 'text-[#0AB77F]'
                    }`}
                  >
                    {formatUgx(selectedTenant.arrears)}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-[#17231E] mb-1">Amount Paid (UGX)</label>
              <input
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="1,200,000"
                className="w-full px-3 py-2 bg-white border border-[#DFE8E3] rounded-xl font-extrabold text-sm text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-[#17231E] mb-1">Collection Channel</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Mobile Money (MTN)', label: '🟡 MTN MoMo' },
                  { id: 'Mobile Money (Airtel)', label: '🔴 Airtel Money' },
                  { id: 'Cash', label: '💵 Cash Handover' },
                  { id: 'Bank Transfer', label: '🏦 Bank / POS' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMethod(item.id)}
                    className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                      method === item.id
                        ? 'border-[#0AB77F] bg-[#E2F8EF] text-[#17231E]'
                        : 'border-[#DFE8E3] bg-white text-[#65766F]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#17231E] mb-1">Payer Phone Number</label>
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="0772 123 456"
                className="w-full px-3 py-2 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#17231E] mb-1">Receipt Memo / Description</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Rent settlement"
                className="w-full px-3 py-2 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#0AB77F] hover:bg-[#07885E] text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Logging Payment...' : 'Record Payment & View Receipt'}
            </button>
          </form>
        </div>

        {/* Tenant Roster & Cloud Sync (Right Column) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Cloud Sync Strip */}
          <div className="bg-[#101915] rounded-3xl p-5 text-white flex items-center justify-between border border-white/5 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0AB77F]/20 flex items-center justify-center text-[#62E3B6]">
                <RefreshCw className={`w-5 h-5 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white">Cloud Firestore & Offline DB</h4>
                <p className="text-[11px] text-[#9FB2A9]">All offline collections queued for sync</p>
              </div>
            </div>
            <button
              onClick={() => triggerSync()}
              disabled={syncStatus === 'SYNCING'}
              className="px-3.5 py-1.5 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50"
            >
              {syncStatus === 'SYNCING' ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>

          {/* Tenants Directory Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#DFE8E3] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-extrabold text-sm text-[#17231E]">
                Occupant Roster ({tenants.length})
              </h3>
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tenant or unit..."
                  className="w-full pl-9 pr-3 py-1.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#0AB77F]"
                />
              </div>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredTenants.map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-[#F5F8F6] border border-[#DFE8E3] rounded-2xl flex items-center justify-between hover:border-[#0AB77F]/40 transition-colors"
                >
                  <div>
                    <div className="font-bold text-xs text-[#17231E]">{t.name}</div>
                    <div className="text-[10px] text-[#65766F]">
                      {t.propertyName} • {t.unitName} ({t.phone})
                    </div>
                    <div className="text-[11px] font-semibold text-[#17231E] mt-0.5">
                      Rent: {formatUgx(t.monthlyRent)}
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <span
                      className={`text-xs font-black ${
                        t.arrears > 0 ? 'text-[#D93838]' : 'text-[#0AB77F]'
                      }`}
                    >
                      {t.arrears > 0 ? `Owes: ${formatUgx(t.arrears)}` : '✅ Paid'}
                    </span>
                    <button
                      onClick={() => handleSelectTenant(t.id)}
                      className="px-2.5 py-1 bg-white hover:bg-[#E2F8EF] border border-[#DFE8E3] rounded-lg text-[10px] font-bold text-[#0AB77F] transition-colors cursor-pointer"
                    >
                      Select to Pay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AddTenantModal isOpen={showAddTenantModal} onClose={() => setShowAddTenantModal(false)} />
      <AddExpenseModal isOpen={showAddExpenseModal} onClose={() => setShowAddExpenseModal(false)} />
      <LogMaintenanceModal isOpen={showLogMaintModal} onClose={() => setShowLogMaintModal(false)} />
    </div>
  );
};
