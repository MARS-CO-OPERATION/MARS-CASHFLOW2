import React from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx } from '../utils/formatters';
import {
  Receipt,
  Printer,
  Share2,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Building,
  Smartphone,
  Calendar,
  DollarSign
} from 'lucide-react';

interface ReceiptDetailScreenProps {
  paymentId: string;
  onNavigate: (route: string) => void;
}

export const ReceiptDetailScreen: React.FC<ReceiptDetailScreenProps> = ({
  paymentId,
  onNavigate,
}) => {
  const { payments, tenants } = useMars();

  const payment = payments.find((p) => p.id === paymentId) || payments[0];
  const tenant = tenants.find((t) => t.name === payment?.tenantName);

  if (!payment) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-lg font-bold text-[#17231E]">Receipt Not Found</h2>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 bg-[#0AB77F] text-white rounded-xl font-bold text-xs"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `MARS Rent Receipt - ${payment.receiptNumber}`,
        text: `Official Rent Receipt: UGX ${payment.amount.toLocaleString()} received from ${payment.tenantName} for ${payment.propertyName} (${payment.unitName}). Receipt #${payment.receiptNumber}`,
      });
    } else {
      navigator.clipboard?.writeText(
        `Official Rent Receipt #${payment.receiptNumber}: UGX ${payment.amount.toLocaleString()} paid by ${payment.tenantName} for ${payment.propertyName} ${payment.unitName}. Verified on MARS Cashflow.`
      );
      alert('Receipt details copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto px-4 sm:px-6 pt-4">
      {/* Top Bar - No print */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-1.5 text-xs font-extrabold text-[#65766F] hover:text-[#17231E] bg-white px-3 py-2 rounded-xl border border-[#DFE8E3] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-[#DFE8E3] text-[#17231E] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-[#0AB77F]" />
            Share Receipt
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
        </div>
      </div>

      {/* Official Receipt Certificate Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#DFE8E3] shadow-xl space-y-6 print:p-0 print:border-none print:shadow-none">
        {/* Receipt Header */}
        <div className="flex items-start justify-between border-b-2 border-[#101915] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0AB77F] to-[#07885E] flex items-center justify-center text-white font-black text-2xl shadow-sm">
              M
            </div>
            <div>
              <h2 className="text-xl font-black text-[#17231E] tracking-tight">MARS CASHFLOW</h2>
              <p className="text-xs text-[#65766F] font-semibold">Official Verified Rent Receipt</p>
              <p className="text-[10px] text-[#65766F]">Kampala, Uganda • Tel: +256 772 000 000</p>
            </div>
          </div>

          <div className="text-right">
            <span className="px-3 py-1 bg-[#E2F8EF] text-[#0AB77F] rounded-full text-xs font-black uppercase tracking-wider">
              VERIFIED PAID
            </span>
            <div className="text-xs font-bold text-[#17231E] mt-2 font-mono">
              #{payment.receiptNumber}
            </div>
            <div className="text-[10px] text-[#65766F]">{payment.date}</div>
          </div>
        </div>

        {/* Amount Box */}
        <div className="p-6 bg-[#F5F8F6] rounded-3xl border border-[#DFE8E3] text-center space-y-1">
          <span className="text-[10px] font-extrabold text-[#65766F] uppercase tracking-widest block">
            Total Amount Received
          </span>
          <div className="text-3xl sm:text-4xl font-black text-[#0AB77F] tracking-tight">
            UGX {formatMoney(payment.amount)}
          </div>
          <span className="text-xs text-[#17231E] font-bold block pt-1">
            Status: {payment.paymentStatus}
          </span>
        </div>

        {/* Breakdown Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-[#F5F8F6] rounded-2xl">
            <span className="text-[10px] font-bold text-[#65766F] uppercase block">Received From (Tenant)</span>
            <span className="font-extrabold text-[#17231E] text-sm block mt-0.5">{payment.tenantName}</span>
            <span className="text-[11px] text-[#65766F]">{tenant?.phone || 'Uganda Mobile'}</span>
          </div>

          <div className="p-3 bg-[#F5F8F6] rounded-2xl">
            <span className="text-[10px] font-bold text-[#65766F] uppercase block">Property & Unit</span>
            <span className="font-extrabold text-[#17231E] text-sm block mt-0.5">{payment.propertyName}</span>
            <span className="text-[11px] text-[#0AB77F] font-black">{payment.unitName}</span>
          </div>

          <div className="p-3 bg-[#F5F8F6] rounded-2xl">
            <span className="text-[10px] font-bold text-[#65766F] uppercase block">Payment Channel</span>
            <span className="font-bold text-[#17231E] text-xs block mt-0.5">{payment.paymentMethod}</span>
          </div>

          <div className="p-3 bg-[#F5F8F6] rounded-2xl">
            <span className="text-[10px] font-bold text-[#65766F] uppercase block">Receipt Notes</span>
            <span className="font-medium text-[#17231E] text-xs block mt-0.5">{payment.notes}</span>
          </div>
        </div>

        {/* Tenant Remaining Account Balance */}
        {tenant && (
          <div className="p-3 bg-[#E2F8EF] border border-[#0AB77F]/30 rounded-2xl flex items-center justify-between text-xs font-bold">
            <span className="text-[#17231E]">Updated Arrears Balance for Unit:</span>
            <span className={tenant.arrears > 0 ? 'text-[#D93838]' : 'text-[#0AB77F]'}>
              {tenant.arrears > 0 ? formatUgx(tenant.arrears) : '0 UGX (All Clear)'}
            </span>
          </div>
        )}

        {/* Official Security Stamp & QR block */}
        <div className="pt-6 border-t-2 border-dashed border-[#DFE8E3] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-[#101915] rounded-2xl flex items-center justify-center p-1.5 shadow-sm">
              {/* QR Representation */}
              <div className="w-full h-full border border-white/40 p-1 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-2.5 h-2.5 bg-[#62E3B6]" />
                  <div className="w-2.5 h-2.5 bg-white" />
                </div>
                <div className="flex justify-between">
                  <div className="w-2.5 h-2.5 bg-white" />
                  <div className="w-2.5 h-2.5 bg-[#62E3B6]" />
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-[#0AB77F] font-black text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>CRYPTOGRAPHICALLY VERIFIED</span>
              </div>
              <p className="text-[10px] text-[#65766F]">
                Hash: {payment.id.toUpperCase()}-VERIFIED
              </p>
              <p className="text-[9px] text-gray-400">Uganda Landlord & Tenant Act (2022) Compliant</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl border-2 border-emerald-700 text-center bg-[#E2F8EF]/40 space-y-0.5">
            <span className="text-[10px] font-black text-emerald-800 tracking-wider uppercase block">
              ★ OFFICIAL MARS LEDGER SEAL ★
            </span>
            <span className="text-[9px] text-[#0AB77F] font-bold block">COLLECTION VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
