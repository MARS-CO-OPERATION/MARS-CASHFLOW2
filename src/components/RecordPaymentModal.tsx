import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { TenantEntity } from '../types';
import { formatMoney, formatUgx } from '../utils/formatters';
import {
  X,
  Receipt,
  Smartphone,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTenant?: TenantEntity | null;
  onPaymentSuccess?: (paymentId: string) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  initialTenant,
  onPaymentSuccess,
}) => {
  const { tenants, recordPayment } = useMars();

  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    initialTenant?.id || tenants[0]?.id || ''
  );
  const selectedTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];

  const [amount, setAmount] = useState<string>(
    initialTenant
      ? initialTenant.arrears > 0
        ? initialTenant.arrears.toString()
        : initialTenant.monthlyRent.toString()
      : selectedTenant
      ? selectedTenant.arrears > 0
        ? selectedTenant.arrears.toString()
        : selectedTenant.monthlyRent.toString()
      : '1200000'
  );

  const [paymentMethod, setPaymentMethod] = useState<string>('Mobile Money (MTN)');
  const [payerPhone, setPayerPhone] = useState<string>(initialTenant?.phone || selectedTenant?.phone || '0772123456');
  const [notes, setNotes] = useState<string>('Rent Collection via MARS Web Ledger');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    const tenant = tenants.find((t) => t.id === tenantId);
    if (tenant) {
      setPayerPhone(tenant.phone);
      setAmount(tenant.arrears > 0 ? tenant.arrears.toString() : tenant.monthlyRent.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/[^0-9]/g, ''));

    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid payment amount in UGX.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = recordPayment({
        tenantName: selectedTenant?.name || 'Valued Tenant',
        propertyName: selectedTenant?.propertyName || 'Kampala Apartments',
        unitName: selectedTenant?.unitName || 'Unit 101',
        amount: numAmount,
        paymentMethod: `${paymentMethod}${payerPhone ? ` (${payerPhone})` : ''}`,
        notes: notes || 'Verified rent collection',
      });

      if (result.success && result.paymentId) {
        setIsSubmitting(false);
        onClose();
        if (onPaymentSuccess) {
          onPaymentSuccess(result.paymentId);
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to record payment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#DFE8E3] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-[#101915] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0AB77F] flex items-center justify-center text-white">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Record Rent Payment</h3>
              <p className="text-xs text-[#9FB2A9]">Issue instant verified digital receipt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#D93838] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Select Tenant */}
          <div>
            <label className="block font-bold text-[#17231E] mb-1.5">
              Select Tenant & Unit
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-1 bg-[#F5F8F6] rounded-xl border border-[#DFE8E3]">
              {tenants.map((t) => {
                const isSelected = t.id === selectedTenantId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTenantChange(t.id)}
                    className={`p-2 rounded-lg text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#101915] text-white shadow-xs'
                        : 'bg-white hover:bg-gray-100 text-[#17231E] border border-gray-200'
                    }`}
                  >
                    <div className="font-bold text-xs truncate">{t.name}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-gray-300' : 'text-[#65766F]'}`}>
                      {t.propertyName} • {t.unitName}
                    </div>
                    {t.arrears > 0 ? (
                      <div className={`text-[10px] font-bold ${isSelected ? 'text-[#62E3B6]' : 'text-[#D93838]'}`}>
                        Owes: UGX {formatMoney(t.arrears)}
                      </div>
                    ) : (
                      <div className={`text-[10px] font-bold ${isSelected ? 'text-emerald-300' : 'text-[#0AB77F]'}`}>
                        Paid Up
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Tenant Summary Box */}
          {selectedTenant && (
            <div className="p-3 bg-[#E2F8EF] border border-[#0AB77F]/30 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#0AB77F] uppercase tracking-wider block">
                  Active Unit Info
                </span>
                <span className="font-extrabold text-sm text-[#17231E]">
                  {selectedTenant.name} ({selectedTenant.unitName})
                </span>
                <span className="text-xs text-[#65766F] block">
                  Monthly Rent: {formatUgx(selectedTenant.monthlyRent)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#65766F] block">Outstanding</span>
                <span
                  className={`text-sm font-black ${
                    selectedTenant.arrears > 0 ? 'text-[#D93838]' : 'text-[#0AB77F]'
                  }`}
                >
                  {selectedTenant.arrears > 0
                    ? formatUgx(selectedTenant.arrears)
                    : 'Clear (0 UGX)'}
                </span>
              </div>
            </div>
          )}

          {/* Amount Input & Quick Chips */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-[#17231E]">Amount Paid (UGX)</label>
              <div className="flex gap-1">
                {selectedTenant && selectedTenant.arrears > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount(selectedTenant.arrears.toString())}
                    className="px-2 py-0.5 bg-red-100 text-[#D93838] hover:bg-red-200 rounded text-[10px] font-bold cursor-pointer"
                  >
                    Clear Arrears ({formatUgx(selectedTenant.arrears)})
                  </button>
                )}
                {selectedTenant && (
                  <button
                    type="button"
                    onClick={() => setAmount(selectedTenant.monthlyRent.toString())}
                    className="px-2 py-0.5 bg-[#E2F8EF] text-[#0AB77F] hover:bg-emerald-100 rounded text-[10px] font-bold cursor-pointer"
                  >
                    1 Month ({formatUgx(selectedTenant.monthlyRent)})
                  </button>
                )}
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm">
                UGX
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1,200,000"
                className="w-full pl-14 pr-4 py-2.5 bg-white border border-[#DFE8E3] rounded-xl text-base font-extrabold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F] focus:ring-2 focus:ring-[#0AB77F]/20"
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-bold text-[#17231E] mb-1.5">
              Payment Gateway / Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: 'Mobile Money (MTN)', icon: '🟡', label: 'MTN MoMo' },
                { name: 'Mobile Money (Airtel)', icon: '🔴', label: 'Airtel Money' },
                { name: 'Bank Transfer', icon: '🏦', label: 'Bank (EFT)' },
                { name: 'Cash', icon: '💵', label: 'Cash at Desk' },
              ].map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => setPaymentMethod(m.name)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    paymentMethod === m.name
                      ? 'border-[#0AB77F] bg-[#E2F8EF] text-[#17231E] font-bold shadow-xs'
                      : 'border-[#DFE8E3] bg-white text-[#65766F] hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{m.icon}</span>
                  <span className="text-[11px] leading-tight">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payer Phone & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#17231E] mb-1">
                Payer Uganda Mobile No.
              </label>
              <input
                type="text"
                value={payerPhone}
                onChange={(e) => setPayerPhone(e.target.value)}
                placeholder="0772 123 456"
                className="w-full px-3 py-2 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#17231E] mb-1">
                Receipt Memo / Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="August 2026 Rent Settlement"
                className="w-full px-3 py-2 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#DFE8E3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#65766F] hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#0AB77F] hover:bg-[#07885E] shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Recording...' : 'Confirm & Issue Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
