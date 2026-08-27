import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx, formatUgxShort } from '../utils/formatters';
import { AddPropertyModal } from '../components/AddPropertyModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
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
  ShieldAlert
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
  } = useMars();

  const [showAddPropModal, setShowAddPropModal] = useState(false);
  const [arrearsFilter, setArrearsFilter] = useState<'All' | 'Overdue' | 'Paid'>('All');
  const [selectedTenantForPay, setSelectedTenantForPay] = useState<TenantEntity | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalArrears = tenants.reduce((sum, t) => sum + t.arrears, 0);
  const netCash = totalCollected - totalExpenses;

  const filteredTenants = tenants.filter((t) => {
    if (arrearsFilter === 'Overdue') return t.arrears > 0;
    if (arrearsFilter === 'Paid') return t.arrears === 0;
    return true;
  });

  const handleSendReminder = (t: TenantEntity) => {
    sendTenantReminder(t.name, t.phone, t.arrears, t.propertyName, t.unitName, () => {
      setActionNotice(`SMS reminder dispatched to ${t.name} (${t.phone}).`);
      setTimeout(() => setActionNotice(null), 4000);
    });
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 pt-4">
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
          <div className="w-10 h-10 rounded-xl bg-[#0AB77F] text-white flex items-center justify-center text-xl">
            👑
          </div>
          <div>
            <h1 className="text-xl font-black text-[#17231E]">Landlord Executive Dashboard</h1>
            <p className="text-xs text-[#65766F]">Estate portfolio oversight & yield control</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('budget_planner')}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PieChart className="w-3.5 h-3.5 text-[#0AB77F]" />
            Budget Planner
          </button>
          <button
            onClick={() => onNavigate('pdf_export')}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#0AB77F]" />
            Financial PDF
          </button>
          <button
            onClick={() => setShowAddPropModal(true)}
            className="px-4 py-2 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </div>
      </div>

      {/* Portfolio Financial Performance Card */}
      <div className="bg-[#101915] rounded-3xl p-6 text-white shadow-xl border border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-[#62E3B6] uppercase block">
              Portfolio Yield & Cash Flow
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              UGX {formatMoney(netCash)}
            </h2>
            <span className="text-xs text-[#9FB2A9]">Net Inflow after verified expenses</span>
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
            <span className="text-[10px] text-gray-400">{expenses.length} approved items</span>
          </div>
          <div className="p-3 bg-[#1A2621] rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-[#9FB2A9] uppercase">Outstanding Arrears</span>
            <div className="text-lg font-black text-amber-400">{formatUgx(totalArrears)}</div>
            <span className="text-[10px] text-gray-400">
              {tenants.filter((t) => t.arrears > 0).length} overdue tenants
            </span>
          </div>
        </div>
      </div>

      {/* Property Breakdown Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-[#17231E]">Estate Properties & Units</h3>
          <span className="text-xs text-[#65766F]">{properties.length} Total Estates</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {properties.map((prop) => {
            const propTenants = tenants.filter((t) => t.propertyName === prop.name);
            const propPayments = payments.filter((p) => p.propertyName === prop.name);
            const propInflow = propPayments.reduce((s, p) => s + p.amount, 0);
            const propArrears = propTenants.reduce((s, t) => s + t.arrears, 0);

            return (
              <div
                key={prop.id}
                className="bg-white rounded-3xl p-5 border border-[#DFE8E3] shadow-xs space-y-4 hover:border-[#0AB77F]/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#E2F8EF] flex items-center justify-center text-xl">
                    🏢
                  </div>
                  <span className="px-2.5 py-0.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-full text-[10px] font-bold text-[#65766F]">
                    {propTenants.length} / {prop.totalUnits} Units Occupied
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-sm text-[#17231E]">{prop.name}</h4>
                  <p className="text-[11px] text-[#65766F]">{prop.location}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#DFE8E3]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#65766F]">Total Rent Collected</span>
                    <span className="font-black text-[#0AB77F]">{formatUgxShort(propInflow)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#65766F]">Pending Debt / Arrears</span>
                    <span
                      className={`font-black ${
                        propArrears > 0 ? 'text-[#D93838]' : 'text-[#0AB77F]'
                      }`}
                    >
                      {formatUgxShort(propArrears)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tenant Debtors & Lease Watchlist */}
      <div className="bg-white rounded-3xl p-6 border border-[#DFE8E3] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm text-[#17231E]">Occupant Ledger & Payment Status</h3>
            <p className="text-xs text-[#65766F]">Review tenant accounts and send direct collection notices</p>
          </div>

          <div className="flex items-center gap-1 bg-[#F5F8F6] p-1 rounded-xl border border-[#DFE8E3]">
            {(['All', 'Overdue', 'Paid'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setArrearsFilter(filter)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  arrearsFilter === filter
                    ? 'bg-[#101915] text-white shadow-xs'
                    : 'text-[#65766F] hover:text-[#17231E]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DFE8E3] text-[#65766F] font-bold">
                <th className="pb-3 px-2">Occupant</th>
                <th className="pb-3 px-2">Property & Unit</th>
                <th className="pb-3 px-2">Monthly Rent</th>
                <th className="pb-3 px-2">Arrears</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredTenants.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-2 font-bold text-[#17231E]">
                    {t.name}
                    <span className="block text-[10px] text-[#65766F] font-normal">{t.phone}</span>
                  </td>
                  <td className="py-3 px-2 text-[#65766F]">
                    {t.propertyName} • {t.unitName}
                  </td>
                  <td className="py-3 px-2 font-bold text-[#17231E]">{formatUgx(t.monthlyRent)}</td>
                  <td className="py-3 px-2 font-black">
                    <span className={t.arrears > 0 ? 'text-[#D93838]' : 'text-[#0AB77F]'}>
                      {formatUgx(t.arrears)}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.arrears > 0
                          ? 'bg-red-100 text-[#D93838]'
                          : 'bg-[#E2F8EF] text-[#0AB77F]'
                      }`}
                    >
                      {t.arrears > 0 ? 'Overdue' : 'Current'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {t.arrears > 0 && (
                        <button
                          onClick={() => handleSendReminder(t)}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-[#D93838] rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Send SMS
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedTenantForPay(t);
                          setShowPaymentModal(true);
                        }}
                        className="px-2.5 py-1 bg-[#E2F8EF] hover:bg-emerald-100 text-[#0AB77F] rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Record
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddPropertyModal isOpen={showAddPropModal} onClose={() => setShowAddPropModal(false)} />
      <RecordPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        initialTenant={selectedTenantForPay}
        onPaymentSuccess={(pId) => onViewReceipt(pId)}
      />
    </div>
  );
};
