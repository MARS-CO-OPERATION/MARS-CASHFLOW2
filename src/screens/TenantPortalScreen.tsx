import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx } from '../utils/formatters';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { LogMaintenanceModal } from '../components/LogMaintenanceModal';
import { EmptyState } from '../components/EmptyState';
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
  Download,
  Building,
  Sparkles,
  Phone
} from 'lucide-react';

interface TenantPortalScreenProps {
  onNavigate: (route: string) => void;
  onViewReceipt: (paymentId: string) => void;
}

export const TenantPortalScreen: React.FC<TenantPortalScreenProps> = ({
  onNavigate,
  onViewReceipt,
}) => {
  const { tenants, payments, currentUser, currentRole, t } = useMars();

  // Find active tenant or first in list
  const activeTenant =
    tenants.find((tItem) => currentUser && (tItem.phone === currentUser.phone || tItem.name === currentUser.displayName)) ||
    tenants[0];

  const tenantPayments = payments.filter((p) => p.tenantName === activeTenant?.name);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const handleCopyLandlordPhone = () => {
    navigator.clipboard?.writeText('0772123456');
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  if (!activeTenant) {
    return (
      <div className="space-y-6 pb-20 max-w-5xl mx-auto px-4 sm:px-6 pt-4">
        <EmptyState
          icon={UserCheck}
          title={t.noTenantsTitle}
          description={t.noTenantsDesc}
          actionLabel="Onboard Tenant Account"
          onAction={() => onNavigate('dashboard')}
          secondaryActionLabel="Switch to Landlord Master"
          onSecondaryAction={() => onNavigate('landlord')}
          tips={[
            'Tenants can log in with their phone number to check rent due, download receipts, and pay with MTN/Airtel MoMo.',
            'Once you onboard a tenant on the dashboard or landlord screen, their unit dashboard appears here.',
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto px-4 sm:px-6 pt-4">
      {/* Modals */}
      <RecordPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        initialTenant={activeTenant}
        onPaymentSuccess={(pId) => onViewReceipt(pId)}
      />

      <LogMaintenanceModal
        isOpen={showMaintModal}
        onClose={() => setShowMaintModal(false)}
        initialProperty={activeTenant.propertyName}
        initialUnit={activeTenant.unitName}
        initialTenant={activeTenant.name}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0AB77F] text-white flex items-center justify-center text-xl">
            👤
          </div>
          <div>
            <h1 className="text-xl font-black text-[#17231E]">Tenant Self-Service Portal</h1>
            <p className="text-xs text-[#65766F]">
              Welcome, <span className="font-bold text-[#17231E]">{activeTenant.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMaintModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-500" />
            <span>Request Repair (MARS Projects)</span>
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-4 py-2 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Rent with MoMo</span>
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
              {activeTenant.propertyName} • {activeTenant.unitName}
            </h2>
            <p className="text-xs text-[#9FB2A9] mt-0.5">
              Monthly Contract Rent: <strong className="text-white">{formatUgx(activeTenant.monthlyRent)}</strong>
            </p>
          </div>

          <div className="bg-[#1A2621] p-4 rounded-2xl border border-white/10 text-right sm:text-right">
            <span className="text-[10px] font-bold text-[#9FB2A9] uppercase block">
              Outstanding Balance
            </span>
            <div
              className={`text-2xl font-black ${
                activeTenant.arrears > 0 ? 'text-[#D93838]' : 'text-[#62E3B6]'
              }`}
            >
              {activeTenant.arrears > 0
                ? formatUgx(activeTenant.arrears)
                : 'Fully Paid (0 UGX)'}
            </div>
            <span className="text-[10px] text-gray-400">
              {(activeTenant.advanceBalance ?? 0) > 0
                ? `Advance Credit: ${formatUgx(activeTenant.advanceBalance || 0)}`
                : 'Next cycle due 1st of month'}
            </span>
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
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0AB77F] hover:bg-[#07885E] active:scale-[0.98] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
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
            No historical payments recorded for this account yet. Click "Pay Rent with MoMo" above to make your first payment.
          </div>
        ) : (
          <div className="space-y-2.5">
            {tenantPayments.map((pay) => (
              <div
                key={pay.id}
                onClick={() => onViewReceipt(pay.id)}
                className="p-3.5 bg-[#F5F8F6] hover:bg-[#E2F8EF]/40 border border-[#DFE8E3] rounded-2xl flex items-center justify-between transition-colors cursor-pointer"
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
                      Receipt #{pay.receiptNumber}
                    </div>
                    <div className="text-[10px] text-[#65766F]">
                      {pay.date} • {pay.paymentMethod} ({pay.notes || 'Rent settlement'})
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-xs text-[#0AB77F]">
                    {formatUgx(pay.amount)}
                  </div>
                  <div className="text-[10px] text-[#65766F] flex items-center gap-1 justify-end">
                    <span>View Receipt</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Direct Landlord Contact Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#DFE8E3] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5F8F6] flex items-center justify-center text-[#17231E] text-lg">
            🏢
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#17231E]">Need Help or Lease Renewal?</h4>
            <p className="text-[11px] text-[#65766F]">
              Direct contact line for estate caretaker & landlord office
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyLandlordPhone}
          className="px-4 py-2 bg-[#F5F8F6] hover:bg-gray-100 text-[#17231E] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5 text-[#0AB77F]" />
          <span>{copiedNotice ? 'Phone Number Copied!' : 'Copy Landlord Contact (0772 123 456)'}</span>
        </button>
      </div>
    </div>
  );
};
