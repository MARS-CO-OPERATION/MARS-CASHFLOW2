import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx } from '../utils/formatters';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { LogMaintenanceModal } from '../components/LogMaintenanceModal';
import {
  UserCheck,
  CreditCard,
  Receipt,
  Wrench,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Download
} from 'lucide-react';

interface TenantPortalScreenProps {
  onNavigate: (route: string) => void;
  onViewReceipt: (paymentId: string) => void;
}

export const TenantPortalScreen: React.FC<TenantPortalScreenProps> = ({
  onNavigate,
  onViewReceipt,
}) => {
  const { tenants, payments, properties, currentUser } = useMars();

  // Find current tenant or default to the first tenant
  const activeTenant =
    tenants.find((t) => (currentUser && (t.userId === currentUser.id || t.phone === currentUser.phoneNumber))) ||
    tenants[0];

  const tenantPayments = payments.filter((p) => p.tenantName === activeTenant?.name);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const handleCopyLandlordPhone = () => {
    navigator.clipboard?.writeText('0772000000');
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto px-4 sm:px-6 pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0AB77F] text-white flex items-center justify-center text-xl">
            👤
          </div>
          <div>
            <h1 className="text-xl font-black text-[#17231E]">Tenant Self-Service Portal</h1>
            <p className="text-xs text-[#65766F]">Welcome, {activeTenant?.name || 'Valued Occupant'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMaintModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-500" />
            Request Repair
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-4 py-2 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            Pay Rent Now
          </button>
        </div>
      </div>

      {/* Lease Overview Card */}
      <div className="bg-[#101915] rounded-3xl p-6 text-white shadow-xl border border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-[#62E3B6] uppercase block">
              Unit Lease Profile
            </span>
            <h2 className="text-2xl font-black text-white">
              {activeTenant?.propertyName} • {activeTenant?.unitName}
            </h2>
            <p className="text-xs text-[#9FB2A9] mt-0.5">
              Monthly Contract Rent: {formatUgx(activeTenant?.monthlyRent || 0)}
            </p>
          </div>

          <div className="bg-[#1A2621] p-4 rounded-2xl border border-white/10 text-right sm:text-right">
            <span className="text-[10px] font-bold text-[#9FB2A9] uppercase block">
              Outstanding Account Balance
            </span>
            <div
              className={`text-2xl font-black ${
                (activeTenant?.arrears || 0) > 0 ? 'text-[#D93838]' : 'text-[#62E3B6]'
              }`}
            >
              {(activeTenant?.arrears || 0) > 0
                ? formatUgx(activeTenant?.arrears || 0)
                : 'Fully Paid (0 UGX)'}
            </div>
            <span className="text-[10px] text-gray-400">Next cycle due: 1st of month</span>
          </div>
        </div>

        {/* Quick Payment Action Strip */}
        <div className="border-t border-[#263D33] pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#C5D7CE]">
            <ShieldCheck className="w-4 h-4 text-[#62E3B6]" />
            <span>Instant automated digital receipt upon Mobile Money settlement</span>
          </div>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0AB77F] hover:bg-[#07885E] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Settle Rent via MTN / Airtel MoMo →
          </button>
        </div>
      </div>

      {/* Payment History Stream */}
      <div className="bg-white rounded-3xl p-6 border border-[#DFE8E3] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-[#17231E]">Your Verified Payment Receipts</h3>
            <p className="text-[11px] text-[#65766F]">Click any transaction to view and print official receipt</p>
          </div>
          <span className="text-xs font-bold text-[#0AB77F]">
            {tenantPayments.length} Verified Entries
          </span>
        </div>

        {tenantPayments.length === 0 ? (
          <div className="text-center py-8 text-[#65766F] text-xs">
            No historical payments recorded for this account yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {tenantPayments.map((p) => (
              <div
                key={p.id}
                onClick={() => onViewReceipt(p.id)}
                className="p-3.5 bg-[#F5F8F6] hover:bg-[#E2F8EF]/50 border border-[#DFE8E3] rounded-2xl flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0AB77F]/15 flex items-center justify-center text-lg">
                    🧾
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#17231E]">
                      Rent Payment ({p.paymentMethod})
                    </div>
                    <div className="text-[10px] text-[#65766F]">
                      Date: {p.date} • Unit {p.unitName}
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="font-black text-xs text-[#0AB77F]">
                      {formatUgx(p.amount)}
                    </div>
                    <span className="text-[10px] text-[#65766F]">Verified</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Property Manager Assistance Contact Box */}
      <div className="bg-[#F5F8F6] rounded-3xl p-5 border border-[#DFE8E3] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-[#DFE8E3] flex items-center justify-center text-lg shadow-xs">
            🏢
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#17231E]">Estate Management Help Desk</h4>
            <p className="text-[11px] text-[#65766F]">
              Direct assistance for water, power tokens, or key replacements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLandlordPhone}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#0AB77F]" />
            {copiedNotice ? 'Phone Copied!' : 'Call Caretaker (0772 000 000)'}
          </button>
        </div>
      </div>

      <RecordPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        initialTenant={activeTenant}
        onPaymentSuccess={(pId) => onViewReceipt(pId)}
      />

      <LogMaintenanceModal
        isOpen={showMaintModal}
        onClose={() => setShowMaintModal(false)}
        initialUnit={activeTenant?.unitName}
        initialTenant={activeTenant?.name}
        initialProperty={activeTenant?.propertyName}
      />
    </div>
  );
};
