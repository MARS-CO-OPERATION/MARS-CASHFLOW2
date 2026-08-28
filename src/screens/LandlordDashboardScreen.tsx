import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx, formatUgxShort } from '../utils/formatters';
import { AddPropertyModal } from '../components/AddPropertyModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { EmptyState } from '../components/EmptyState';
import {
  Building2,
  Plus,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  PieChart,
  UserCheck,
  Send,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Sparkles,
  Building
} from 'lucide-react';
import { TenantEntity } from '../types';

interface LandlordDashboardScreenProps {
  onNavigate: (route: string) => void;
  onViewReceipt: (paymentId: string) => void;
}

export const LandlordDashboardScreen: React.FC<LandlordDashboardScreenProps> = ({
  onNavigate,
  onViewReceipt,
}) => {
  const {
    properties,
    tenants,
    payments,
    expenses,
    sendTenantReminder,
    trialDaysRemaining,
    t,
  } = useMars();

  const [showAddPropModal, setShowAddPropModal] = useState(false);
  const [arrearsFilter, setArrearsFilter] = useState<'All' | 'Overdue' | 'Paid'>('All');
  const [selectedTenantForPay, setSelectedTenantForPay] = useState<TenantEntity | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalArrears = tenants.reduce((sum, tItem) => sum + tItem.arrears, 0);
  const netCash = totalCollected - totalExpenses;

  const filteredTenants = tenants.filter((tItem) => {
    if (arrearsFilter === 'Overdue') return tItem.arrears > 0;
    if (arrearsFilter === 'Paid') return tItem.arrears === 0;
    return true;
  });

  const handleSendReminder = (tItem: TenantEntity) => {
    sendTenantReminder(tItem.name, tItem.phone, tItem.arrears, tItem.propertyName, tItem.unitName, () => {
      setActionNotice(`SMS reminder dispatched to ${tItem.name} (${tItem.phone}).`);
      setTimeout(() => setActionNotice(null), 4000);
    });
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      {/* Modals */}
      <AddPropertyModal isOpen={showAddPropModal} onClose={() => setShowAddPropModal(false)} />
      <RecordPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        initialTenant={selectedTenantForPay}
        onPaymentSuccess={(pId) => onViewReceipt(pId)}
      />

      {/* Action Notification */}
      {actionNotice && (
        <div className="bg-[#0AB77F]/15 border border-[#0AB77F]/40 text-[#17231E] px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0AB77F]" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-gray-400 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Screen Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#101915] text-[#62E3B6] flex items-center justify-center text-xl">
            👑
          </div>
          <div>
            <h1 className="text-xl font-black text-[#17231E]">Landlord Executive Dashboard</h1>
            <p className="text-xs text-[#65766F]">Estate portfolio oversight, yield control & manager delegation</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('landlord_settings')}
            className="px-3.5 py-2 bg-[#101915] hover:bg-gray-800 text-[#62E3B6] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-[#62E3B6]" />
            <span>Settings & Managers</span>
          </button>

          <button
            onClick={() => onNavigate('pdf_export')}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#0AB77F]" />
            <span>Financial PDF</span>
          </button>

          <button
            onClick={() => setShowAddPropModal(true)}
            className="px-4 py-2 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          icon={Building}
          title={t.noPropertiesTitle}
          description={t.noPropertiesDesc}
          actionLabel={t.addProperty}
          onAction={() => setShowAddPropModal(true)}
          tips={[
            'Add your first rental building to track occupancy, monthly collections, and expense vouchers.',
            'Caretakers can be assigned with custom spending permissions in Landlord Settings.',
          ]}
        />
      ) : (
        <>
          {/* Portfolio Financial Performance Card */}
          <div className="bg-[#101915] rounded-3xl p-6 text-white shadow-xl border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-[#62E3B6] uppercase block">
                  Portfolio Net Cash Flow
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  UGX {formatMoney(netCash)}
                </h2>
                <span className="text-xs text-[#9FB2A9]">Net Inflow after verified operating expenses</span>
              </div>
              <div className="px-3 py-1 bg-[#0AB77F]/20 text-[#62E3B6] border border-[#0AB77F]/40 rounded-xl text-xs font-bold">
                {properties.length} Properties • {tenants.length} Tenants
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#263D33] pt-4">
              <div className="p-3 bg-[#1A2621] rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-[#9FB2A9] uppercase">Total Inflow</span>
                <div className="text-lg font-black text-[#62E3B6]">{formatUgx(totalCollected)}</div>
                <span className="text-[10px] text-gray-400">{payments.length} verified receipts</span>
              </div>
              <div className="p-3 bg-[#1A2621] rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-[#9FB2A9] uppercase">Operating Expenses</span>
                <div className="text-lg font-black text-red-400">{formatUgx(totalExpenses)}</div>
                <span className="text-[10px] text-gray-400">{expenses.length} approved vouchers</span>
              </div>
              <div className="p-3 bg-[#1A2621] rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-[#9FB2A9] uppercase">Total Overdue Arrears</span>
                <div className="text-lg font-black text-amber-400">{formatUgx(totalArrears)}</div>
                <span className="text-[10px] text-gray-400">
                  {tenants.filter((t) => t.arrears > 0).length} tenants overdue
                </span>
              </div>
            </div>
          </div>

          {/* Properties Portfolio Grid */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-[#17231E]">Managed Property Portfolios</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {properties.map((prop) => {
                const propTenants = tenants.filter((t) => t.propertyName === prop.name);
                const propCollected = payments
                  .filter((p) => p.propertyName === prop.name)
                  .reduce((sum, p) => sum + p.amount, 0);

                return (
                  <div
                    key={prop.id}
                    className="bg-white rounded-3xl p-5 border border-[#DFE8E3] shadow-xs space-y-3 hover:border-[#0AB77F]/50 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F5F8F6] text-[#17231E]">
                          {prop.propertyType || 'Residential'}
                        </span>
                        <span className="text-xs font-bold text-[#0AB77F]">
                          {propTenants.length} / {prop.totalUnits} Units
                        </span>
                      </div>
                      <h4 className="font-black text-base text-[#17231E]">{prop.name}</h4>
                      <p className="text-xs text-[#65766F]">{prop.location}</p>
                    </div>

                    <div className="pt-3 border-t border-[#DFE8E3] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[#65766F] block">Inflow</span>
                        <span className="font-bold text-[#17231E]">{formatUgx(propCollected)}</span>
                      </div>
                      <button
                        onClick={() => onNavigate('dashboard')}
                        className="text-xs font-bold text-[#0AB77F] hover:underline cursor-pointer"
                      >
                        View Units →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tenants Arrears & Collections Ledger */}
          <div className="bg-white rounded-3xl p-6 border border-[#DFE8E3] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-[#17231E]">Tenant Rent & Arrears Ledger</h3>
                <p className="text-xs text-[#65766F]">Direct dispatch for payment reminders and receipts</p>
              </div>

              <div className="flex items-center gap-1 bg-[#F5F8F6] p-1 rounded-xl border border-[#DFE8E3]">
                {(['All', 'Overdue', 'Paid'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setArrearsFilter(filter)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      arrearsFilter === filter ? 'bg-[#101915] text-white shadow-xs' : 'text-[#65766F]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {filteredTenants.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#65766F]">
                No tenants match this status filter.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTenants.map((tItem) => (
                  <div
                    key={tItem.id}
                    className="p-3.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-xs text-[#17231E]">{tItem.name}</div>
                      <div className="text-[11px] text-[#65766F]">
                        {tItem.propertyName} • {tItem.unitName} ({tItem.phone})
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Monthly Rent: {formatUgx(tItem.monthlyRent)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right sm:text-right">
                        <div
                          className={`text-xs font-black ${
                            tItem.arrears > 0 ? 'text-[#D93838]' : 'text-[#0AB77F]'
                          }`}
                        >
                          {tItem.arrears > 0 ? `Arrears: ${formatUgx(tItem.arrears)}` : 'Fully Paid'}
                        </div>
                        {(tItem.advanceBalance ?? 0) > 0 && (
                          <div className="text-[10px] text-[#0AB77F]">
                            Advance: {formatUgx(tItem.advanceBalance || 0)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {tItem.arrears > 0 && (
                          <button
                            onClick={() => handleSendReminder(tItem)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl cursor-pointer"
                            title="Send SMS Reminder"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedTenantForPay(tItem);
                            setShowPaymentModal(true);
                          }}
                          className="px-3 py-1.5 bg-[#0AB77F] hover:bg-[#07885E] text-white text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Record Payment
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
