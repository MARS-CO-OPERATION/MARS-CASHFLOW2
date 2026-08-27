import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx, formatUgxShort } from '../utils/formatters';
import { TenantEntity } from '../types';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { BatchReminderModal } from '../components/BatchReminderModal';
import {
  Wallet,
  AlertTriangle,
  ArrowUpRight,
  Send,
  PlusCircle,
  BarChart3,
  ListOrdered,
  Building,
  Briefcase,
  UserCheck,
  Wrench,
  TrendingDown,
  Camera,
  FileText,
  Receipt,
  CheckCircle2,
  X,
  ExternalLink
} from 'lucide-react';

interface MainDashboardScreenProps {
  onNavigate: (route: string) => void;
  onViewReceipt: (paymentId: string) => void;
}

export const MainDashboardScreen: React.FC<MainDashboardScreenProps> = ({
  onNavigate,
  onViewReceipt,
}) => {
  const {
    properties,
    tenants,
    payments,
    expenses,
    currentUser,
    sendTenantReminder,
  } = useMars();

  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState('All Properties');
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [selectedTenantForPayment, setSelectedTenantForPayment] = useState<TenantEntity | null>(null);
  const [showBatchReminderModal, setShowBatchReminderModal] = useState(false);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Filter datasets
  const filteredProperties =
    selectedPropertyFilter === 'All Properties'
      ? properties
      : properties.filter((p) => p.name === selectedPropertyFilter);

  const filteredTenants =
    selectedPropertyFilter === 'All Properties'
      ? tenants
      : tenants.filter((t) => t.propertyName === selectedPropertyFilter);

  const filteredPayments =
    selectedPropertyFilter === 'All Properties'
      ? payments
      : payments.filter((p) => p.propertyName === selectedPropertyFilter);

  const filteredExpenses =
    selectedPropertyFilter === 'All Properties'
      ? expenses
      : expenses.filter((e) => e.propertyName === selectedPropertyFilter);

  // Core metrics
  const totalCollected = filteredPayments
    .filter((p) => p.paymentStatus === 'SUCCESSFUL')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalExpectedRent = filteredTenants.reduce((sum, t) => sum + t.rentDue, 0);
  const totalPendingArrears = filteredTenants.reduce((sum, t) => sum + t.arrears, 0);
  const totalOperatingExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netOperatingCashflow = totalCollected - totalOperatingExpenses;

  const tenantsInArrears = filteredTenants
    .filter((t) => t.arrears > 0)
    .sort((a, b) => b.arrears - a.arrears);

  const collectionRate =
    totalExpectedRent > 0
      ? Math.min(1, Math.max(0, totalCollected / totalExpectedRent))
      : 0.88;

  const totalUnits = properties.reduce((sum, p) => sum + p.totalUnits, 0);
  const occupiedUnits = tenants.length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 100;

  const handleSendSingleReminder = (t: TenantEntity) => {
    sendTenantReminder(
      t.name,
      t.phone,
      t.arrears,
      t.propertyName,
      t.unitName,
      () => {
        setReminderToast(`SMS payment reminder dispatched to ${t.name} (${t.phone}).`);
        setTimeout(() => setReminderToast(null), 4000);
      }
    );
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      {/* Reminder Alert Banner */}
      {reminderToast && (
        <div className="bg-[#0AB77F]/15 border border-[#0AB77F]/40 text-[#17231E] px-4 py-3 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#0AB77F] shrink-0" />
            <span className="text-xs font-bold">{reminderToast}</span>
          </div>
          <button
            onClick={() => setReminderToast(null)}
            className="text-gray-400 hover:text-gray-700 font-bold p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Property Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['All Properties', ...properties.map((p) => p.name)].map((propName) => {
          const isSelected = selectedPropertyFilter === propName;
          return (
            <button
              key={propName}
              onClick={() => setSelectedPropertyFilter(propName)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-[#101915] text-white shadow-xs'
                  : 'bg-white text-[#17231E] border border-[#DFE8E3] hover:bg-gray-50'
              }`}
            >
              {propName}
            </button>
          );
        })}
      </div>

      {/* Main Top 2 Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ==========================================
            1. TOTAL RENT COLLECTED HERO CARD
            ========================================== */}
        <div className="bg-[#101915] rounded-3xl p-6 text-white shadow-xl border border-white/5 flex flex-col justify-between space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0AB77F]/20 flex items-center justify-center text-[#62E3B6]">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold tracking-wider text-[#62E3B6] uppercase">
                  Total Rent Collected
                </h3>
                <p className="text-[11px] text-[#9FB2A9]">Verified Ledger Inflow</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#0AB77F] text-white text-[11px] font-black">
              {filteredPayments.filter((p) => p.paymentStatus === 'SUCCESSFUL').length} Receipts
            </span>
          </div>

          {/* Big Figure Display */}
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              UGX {formatMoney(totalCollected)}
            </div>
            <div className="text-xs text-[#C5D7CE] font-semibold">
              Target Monthly Inflow: UGX {formatMoney(totalExpectedRent)}
            </div>
          </div>

          {/* Progress Bar & Occupancy */}
          <div className="space-y-2">
            <div className="w-full bg-[#20322A] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#0AB77F] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.round(collectionRate * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#62E3B6]">
                {Math.round(collectionRate * 100)}% collected of expected rent
              </span>
              <span className="text-[#9FB2A9] font-semibold">
                Occupancy: {occupancyRate}%
              </span>
            </div>
          </div>

          <div className="border-t border-[#263D33] pt-4 flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedTenantForPayment(null);
                setShowRecordPaymentModal(true);
              }}
              className="flex-1 py-2.5 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-extrabold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Record Payment
            </button>
            <button
              onClick={() => onNavigate('income_expense_chart')}
              className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-[#38574A] rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              Trends Chart
            </button>
          </div>
        </div>

        {/* ==========================================
            2. PENDING ARREARS SUMMARY CARD
            ========================================== */}
        <div
          className={`rounded-3xl p-6 shadow-md border flex flex-col justify-between space-y-5 ${
            totalPendingArrears > 0
              ? 'bg-white border-red-200'
              : 'bg-white border-[#DFE8E3]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-[#D93838]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wider text-[#D93838] uppercase">
                  Pending Arrears
                </h3>
                <p className="text-[11px] text-[#65766F]">Overdue Rent Balances</p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                totalPendingArrears > 0
                  ? 'bg-red-50 text-[#D93838] border-red-200'
                  : 'bg-[#E2F8EF] text-[#0AB77F] border-emerald-200'
              }`}
            >
              {totalPendingArrears > 0
                ? `⚠️ ${tenantsInArrears.length} Units Overdue`
                : '✅ All Clear'}
            </span>
          </div>

          {/* Big Figure Display */}
          <div className="space-y-1">
            <div
              className={`text-3xl sm:text-4xl font-black tracking-tight ${
                totalPendingArrears > 0 ? 'text-[#D93838]' : 'text-[#17231E]'
              }`}
            >
              UGX {formatMoney(totalPendingArrears)}
            </div>
            <div className="text-xs text-[#65766F] font-semibold">
              {tenantsInArrears.length > 0
                ? `${tenantsInArrears.length} tenant(s) currently carry outstanding rent balances`
                : 'No pending rent arrears. Full collection achieved.'}
            </div>
          </div>

          {/* Micro Breakdown Row */}
          <div className="p-3 bg-[#F5F8F6] rounded-2xl flex items-center justify-between border border-[#DFE8E3]">
            <div>
              <span className="text-[10px] font-semibold text-[#65766F] block">
                Avg. Arrears / Unit
              </span>
              <span className="text-xs font-bold text-[#17231E]">
                UGX{' '}
                {tenantsInArrears.length > 0
                  ? formatMoney(Math.round(totalPendingArrears / tenantsInArrears.length))
                  : '0'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-semibold text-[#65766F] block">
                Arrears Ratio
              </span>
              <span className="text-xs font-extrabold text-[#D93838]">
                {totalExpectedRent > 0
                  ? `${Math.round((totalPendingArrears / totalExpectedRent) * 100)}% of Expected`
                  : '0%'}
              </span>
            </div>
          </div>

          <div className="border-t border-[#DFE8E3] pt-4 flex items-center gap-3">
            <button
              onClick={() => setShowBatchReminderModal(true)}
              disabled={tenantsInArrears.length === 0}
              className="flex-1 py-2.5 bg-[#D93838] hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Send SMS Reminders
            </button>
            <button
              onClick={() => onNavigate('tenant_payment_status')}
              className="flex-1 py-2.5 bg-white hover:bg-gray-50 text-[#17231E] border border-[#DFE8E3] rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ListOrdered className="w-4 h-4" />
              Status Matrix
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================
          3. NET CASHFLOW & EXPENSE METRIC STRIP
          ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Operating Expenses */}
        <div
          onClick={() => onNavigate('expenses')}
          className="bg-white rounded-2xl p-4 border border-[#DFE8E3] hover:border-[#0AB77F]/40 transition-all cursor-pointer shadow-xs flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#65766F]">
              <span className="text-base">📉</span>
              <span>Operating Expenses</span>
            </div>
            <div className="text-xl font-black text-[#17231E]">
              {formatUgxShort(totalOperatingExpenses)}
            </div>
            <div className="text-[11px] text-[#65766F]">
              {filteredExpenses.length} Approved Vouchers
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-gray-400" />
        </div>

        {/* Net Cashflow */}
        <div
          className={`rounded-2xl p-4 border shadow-xs flex items-center justify-between ${
            netOperatingCashflow >= 0
              ? 'bg-[#E2F8EF] border-[#0AB77F]/40'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#17231E]">
              <span className="text-base">{netOperatingCashflow >= 0 ? '💰' : '⚠️'}</span>
              <span>Net Operating Cashflow</span>
            </div>
            <div
              className={`text-xl font-black ${
                netOperatingCashflow >= 0 ? 'text-[#0AB77F]' : 'text-[#D93838]'
              }`}
            >
              {formatUgxShort(netOperatingCashflow)}
            </div>
            <div className="text-[11px] text-[#65766F]">Inflow - Outflow</div>
          </div>
        </div>
      </div>

      {/* ==========================================
          4. OVERDUE TENANTS WATCHLIST
          ========================================== */}
      {tenantsInArrears.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-[#DFE8E3] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D93838] animate-ping" />
              <h3 className="font-extrabold text-sm text-[#17231E]">
                Arrears Action Queue ({tenantsInArrears.length} Tenants)
              </h3>
            </div>
            <button
              onClick={() => onNavigate('landlord')}
              className="text-xs font-bold text-[#0AB77F] hover:underline cursor-pointer"
            >
              Full Debtor List →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tenantsInArrears.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="p-3.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-2xl flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-[#17231E]">{t.name}</div>
                  <div className="text-[10px] text-[#65766F]">
                    {t.propertyName} • {t.unitName} ({t.phone})
                  </div>
                  <div className="text-xs font-black text-[#D93838]">
                    Owed: {formatUgx(t.arrears)}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSendSingleReminder(t)}
                    className="p-2 rounded-xl bg-red-100 hover:bg-red-200 text-[#D93838] transition-colors cursor-pointer"
                    title="Send SMS Payment Reminder"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTenantForPayment(t);
                      setShowRecordPaymentModal(true);
                    }}
                    className="p-2 rounded-xl bg-[#E2F8EF] hover:bg-emerald-100 text-[#0AB77F] transition-colors cursor-pointer"
                    title="Record Immediate Rent Receipt"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          5. OPERATIONS & MANAGEMENT HUB
          ========================================== */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-sm text-[#17231E]">Operations & Management Hub</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'property_map', icon: '📍', label: 'Property & Field Map', desc: 'Google Maps platform' },
            { id: 'workspace_hub', icon: '☁️', label: 'Google Workspace', desc: 'Drive, Gmail, Docs' },
            { id: 'landlord', icon: '👑', label: 'Landlord Master', desc: 'Portfolio oversight' },
            { id: 'caretaker', icon: '👨🏾‍💼', label: 'Caretaker Desk', desc: 'Ground collections' },
            { id: 'tenant', icon: '👤', label: 'Tenant Portal', desc: 'Self-service view' },
            { id: 'service_providers', icon: '🔧', label: 'Contractors', desc: 'Vendor directory' },
            { id: 'expenses', icon: '📉', label: 'Operating Expenses', desc: 'Bills & Vouchers' },
            { id: 'maintenance', icon: '🛠️', label: 'Repairs & Work', desc: 'Job order board' },
            { id: 'document_scanner', icon: '📷', label: 'Receipt OCR Scan', desc: 'Auto-scan receipts' },
            { id: 'pdf_export', icon: '📄', label: 'PDF Export Center', desc: 'Monthly statements' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="p-3.5 bg-white border border-[#DFE8E3] hover:border-[#0AB77F] hover:shadow-xs rounded-2xl text-left transition-all group cursor-pointer"
            >
              <div className="text-xl mb-1 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div className="font-bold text-xs text-[#17231E]">{item.label}</div>
              <div className="text-[10px] text-[#65766F]">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ==========================================
          6. RECENT VERIFIED PAYMENTS STREAM
          ========================================== */}
      <div className="bg-white rounded-3xl p-6 border border-[#DFE8E3] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-[#17231E]">Recent Verified Payments</h3>
            <p className="text-[11px] text-[#65766F]">Instant digital receipt audit record</p>
          </div>
          <button
            onClick={() => onNavigate('timeline')}
            className="text-xs font-bold text-[#0AB77F] hover:underline cursor-pointer"
          >
            Audit Trail →
          </button>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="text-center py-8 text-[#65766F] text-xs">
            No payment transactions recorded for this filter.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredPayments.slice(0, 5).map((pay) => (
              <div
                key={pay.id}
                onClick={() => onViewReceipt(pay.id)}
                className="p-3 bg-[#F5F8F6] hover:bg-[#E2F8EF]/40 border border-[#E2E8F0] rounded-2xl flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0AB77F]/15 flex items-center justify-center text-lg">
                    {pay.paymentMethod.includes('MTN')
                      ? '🟡'
                      : pay.paymentMethod.includes('Airtel')
                      ? '🔴'
                      : '🏦'}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#17231E]">
                      {pay.tenantName}
                    </div>
                    <div className="text-[10px] text-[#65766F]">
                      {pay.propertyName} • {pay.unitName} ({pay.paymentMethod})
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-xs text-[#0AB77F]">
                    +{formatUgx(pay.amount)}
                  </div>
                  <div className="text-[10px] text-[#65766F] flex items-center gap-1 justify-end">
                    <span>{pay.date}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <RecordPaymentModal
        isOpen={showRecordPaymentModal}
        onClose={() => setShowRecordPaymentModal(false)}
        initialTenant={selectedTenantForPayment}
        onPaymentSuccess={(pId) => onViewReceipt(pId)}
      />

      <BatchReminderModal
        isOpen={showBatchReminderModal}
        onClose={() => setShowBatchReminderModal(false)}
        onSuccess={(count) => {
          setReminderToast(`Dispatched SMS payment reminders to ${count} overdue occupants.`);
          setTimeout(() => setReminderToast(null), 4000);
        }}
      />
    </div>
  );
};
