import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx } from '../utils/formatters';
import { AddTenantModal } from '../components/AddTenantModal';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { LogMaintenanceModal } from '../components/LogMaintenanceModal';
import { EmptyState } from '../components/EmptyState';
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
  ExternalLink,
  Users
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
    t,
  } = useMars();

  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showLogMaintModal, setShowLogMaintModal] = useState(false);

  // Quick Payment form in Caretaker Hub
  const [selectedTenantId, setSelectedTenantId] = useState(tenants[0]?.id || '');
  const selectedTenant = tenants.find((item) => item.id === selectedTenantId) || tenants[0];

  const [amountInput, setAmountInput] = useState(
    selectedTenant
      ? selectedTenant.arrears > 0
        ? selectedTenant.arrears.toString()
        : selectedTenant.monthlyRent.toString()
      : ''
  );
  const [phoneInput, setPhoneInput] = useState(selectedTenant?.phone || '');
  const [method, setMethod] = useState('Mobile Money (MTN)');
  const [notes, setNotes] = useState('Collected by Caretaker on site');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search filter for tenants
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectTenant = (tId: string) => {
    setSelectedTenantId(tId);
    const tItem = tenants.find((item) => item.id === tId);
    if (tItem) {
      setPhoneInput(tItem.phone);
      setAmountInput(tItem.arrears > 0 ? tItem.arrears.toString() : tItem.monthlyRent.toString());
    }
  };

  const handleCollectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) {
      setFeedback({ type: 'error', message: 'Please select a tenant.' });
      return;
    }

    const numAmount = parseFloat(amountInput.replace(/[^0-9]/g, ''));

    if (isNaN(numAmount) || numAmount <= 0) {
      setFeedback({ type: 'error', message: 'Please enter a valid amount in UGX.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = recordPayment({
        tenantName: selectedTenant.name,
        propertyName: selectedTenant.propertyName,
        unitName: selectedTenant.unitName,
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
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      {/* Modals */}
      <AddTenantModal isOpen={showAddTenantModal} onClose={() => setShowAddTenantModal(false)} />
      <AddExpenseModal isOpen={showAddExpenseModal} onClose={() => setShowAddExpenseModal(false)} />
      <LogMaintenanceModal isOpen={showLogMaintModal} onClose={() => setShowLogMaintModal(false)} />

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
            <span>Log Expense</span>
          </button>
          <button
            onClick={() => setShowLogMaintModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-500" />
            <span>Report Repair</span>
          </button>
          <button
            onClick={() => setShowAddTenantModal(true)}
            className="px-4 py-2 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Tenant</span>
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

      {tenants.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t.noTenantsTitle}
          description={t.noTenantsDesc}
          actionLabel={t.onboardTenant}
          onAction={() => setShowAddTenantModal(true)}
          tips={[
            'Caretakers can quickly onboard tenants on-site by taking their phone number and assigning a unit.',
            'Instant digital receipts can be issued on-site when cash or Mobile Money is received.',
          ]}
        />
      ) : (
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
                  {tenants.map((tItem) => (
                    <option key={tItem.id} value={tItem.id}>
                      {tItem.name} — {tItem.propertyName} ({tItem.unitName}) [
                      {tItem.arrears > 0 ? `Owes UGX ${formatMoney(tItem.arrears)}` : 'Paid Up'}]
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
                  type="text"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="e.g. 1,200,000"
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
                className="w-full py-3 bg-[#0AB77F] hover:bg-[#07885E] active:scale-[0.98] text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Logging Payment...' : 'Record Payment & View Receipt'}</span>
              </button>
            </form>
          </div>

          {/* Tenant Roster & Cloud Sync (Right Column) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Cloud Sync Strip */}
            <div className="bg-[#101915] rounded-3xl p-5 text-white flex items-center justify-between border border-white/5 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0AB77F]/20 text-[#62E3B6] flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-xs text-white">Offline-First Cloud Sync</h4>
                  <p className="text-[11px] text-[#9FB2A9]">
                    Status: <strong className="text-[#62E3B6]">{syncStatus}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => triggerSync()}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#62E3B6]" />
                <span>Sync Now</span>
              </button>
            </div>

            {/* Quick Tenant Arrears Watchlist */}
            <div className="bg-white rounded-3xl p-5 border border-[#DFE8E3] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-extrabold text-sm text-[#17231E]">
                  Occupant Roster & Arrears Queue
                </h3>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, unit, phone..."
                    className="pl-8 pr-3 py-1.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-medium focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {filteredTenants.map((tItem) => (
                  <div
                    key={tItem.id}
                    className="p-3 bg-[#F5F8F6] rounded-2xl border border-[#DFE8E3] flex items-center justify-between hover:border-[#0AB77F]/40 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-xs text-[#17231E]">{tItem.name}</div>
                      <div className="text-[10px] text-[#65766F]">
                        {tItem.propertyName} • {tItem.unitName} ({tItem.phone})
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div
                          className={`text-xs font-black ${
                            tItem.arrears > 0 ? 'text-[#D93838]' : 'text-[#0AB77F]'
                          }`}
                        >
                          {tItem.arrears > 0 ? formatUgx(tItem.arrears) : 'Paid'}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Rent: {formatUgx(tItem.monthlyRent)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectTenant(tItem.id)}
                        className="px-2.5 py-1.5 bg-[#0AB77F] hover:bg-[#07885E] text-white text-[11px] font-bold rounded-xl cursor-pointer"
                      >
                        Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
