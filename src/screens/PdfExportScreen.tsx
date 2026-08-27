import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx } from '../utils/formatters';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Building,
  Calendar,
  CheckCircle2,
  Share2,
  FileText
} from 'lucide-react';

interface PdfExportScreenProps {
  onNavigate: (route: string) => void;
}

export const PdfExportScreen: React.FC<PdfExportScreenProps> = ({ onNavigate }) => {
  const { properties, tenants, payments, expenses, currentUser } = useMars();

  const [selectedProperty, setSelectedProperty] = useState('All');
  const [reportMonth, setReportMonth] = useState('August 2026');
  const [preparedBy, setPreparedBy] = useState(currentUser?.displayName || 'Lead Estate Manager');

  const filteredProperties =
    selectedProperty === 'All' ? properties : properties.filter((p) => p.name === selectedProperty);
  const filteredPayments =
    selectedProperty === 'All' ? payments : payments.filter((p) => p.propertyName === selectedProperty);
  const filteredExpenses =
    selectedProperty === 'All' ? expenses : expenses.filter((e) => e.propertyName === selectedProperty);
  const filteredTenants =
    selectedProperty === 'All' ? tenants : tenants.filter((t) => t.propertyName === selectedProperty);

  const totalInflow = filteredPayments.reduce((s, p) => s + p.amount, 0);
  const totalOutflow = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalArrears = filteredTenants.reduce((s, t) => s + t.arrears, 0);
  const netSurplus = totalInflow - totalOutflow;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto px-4 sm:px-6 pt-4">
      {/* Top Header - No print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0AB77F] text-white flex items-center justify-center text-xl">
            📄
          </div>
          <div>
            <h1 className="text-xl font-black text-[#17231E]">Monthly Statement & PDF Generator</h1>
            <p className="text-xs text-[#65766F]">
              Generate bank-grade financial statements and tenancy schedules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Configuration Controls - No print */}
      <div className="bg-white rounded-3xl p-5 border border-[#DFE8E3] shadow-xs flex flex-wrap items-center gap-4 text-xs font-bold no-print">
        <div>
          <label className="block text-[#65766F] mb-1">Estate Target</label>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="px-3 py-1.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-[#17231E]"
          >
            <option value="All">All Estates</option>
            {properties.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[#65766F] mb-1">Reporting Month</label>
          <input
            type="text"
            value={reportMonth}
            onChange={(e) => setReportMonth(e.target.value)}
            className="px-3 py-1.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-[#17231E]"
          />
        </div>

        <div>
          <label className="block text-[#65766F] mb-1">Signatory / Prepared By</label>
          <input
            type="text"
            value={preparedBy}
            onChange={(e) => setPreparedBy(e.target.value)}
            className="px-3 py-1.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-[#17231E]"
          />
        </div>
      </div>

      {/* Official Printable Statement Sheet */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#DFE8E3] shadow-lg space-y-8 print:p-0 print:border-none print:shadow-none">
        {/* Letterhead */}
        <div className="flex items-start justify-between border-b-2 border-[#101915] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0AB77F] text-white flex items-center justify-center font-black text-2xl">
              M
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-[#17231E]">MARS CASHFLOW</h2>
              <p className="text-xs text-[#65766F]">Real Estate Property Management & Rent Ledger</p>
              <p className="text-[10px] text-[#65766F]">Plot 14 Acacia Avenue, Kololo • Kampala, Uganda</p>
            </div>
          </div>

          <div className="text-right">
            <span className="px-3 py-1 bg-[#E2F8EF] text-[#0AB77F] rounded-full text-xs font-black uppercase">
              Official Statement
            </span>
            <div className="text-xs font-bold text-[#17231E] mt-2">Period: {reportMonth}</div>
            <div className="text-[10px] text-[#65766F]">Date Generated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Executive Summary Grid */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-[#F5F8F6] rounded-2xl border border-[#DFE8E3] text-center">
          <div>
            <span className="text-[10px] font-bold text-[#65766F] uppercase">Total Inflow</span>
            <div className="text-base font-black text-[#0AB77F]">{formatUgx(totalInflow)}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#65766F] uppercase">Operating Expenses</span>
            <div className="text-base font-black text-[#D93838]">{formatUgx(totalOutflow)}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#65766F] uppercase">Net Cashflow</span>
            <div className="text-base font-black text-[#17231E]">{formatUgx(netSurplus)}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#65766F] uppercase">Arrears Due</span>
            <div className="text-base font-black text-amber-700">{formatUgx(totalArrears)}</div>
          </div>
        </div>

        {/* Section 1: Rent Inflows Table */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#17231E] border-b pb-1">
            1. Verified Rent Receipts Schedule ({filteredPayments.length})
          </h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b text-[#65766F]">
                <th className="pb-2">Date</th>
                <th className="pb-2">Tenant</th>
                <th className="pb-2">Property & Unit</th>
                <th className="pb-2">Method</th>
                <th className="pb-2 text-right">Amount (UGX)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.map((p) => (
                <tr key={p.id}>
                  <td className="py-2 text-[#65766F]">{p.date}</td>
                  <td className="py-2 font-bold text-[#17231E]">{p.tenantName}</td>
                  <td className="py-2 text-[#65766F]">{p.propertyName} • {p.unitName}</td>
                  <td className="py-2 text-[#65766F]">{p.paymentMethod}</td>
                  <td className="py-2 font-black text-right text-[#0AB77F]">
                    {formatMoney(p.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 2: Outflow Expenses Table */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#17231E] border-b pb-1">
            2. Approved Operating Expenses ({filteredExpenses.length})
          </h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b text-[#65766F]">
                <th className="pb-2">Date</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Description</th>
                <th className="pb-2">Property</th>
                <th className="pb-2 text-right">Amount (UGX)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.map((e) => (
                <tr key={e.id}>
                  <td className="py-2 text-[#65766F]">{e.date}</td>
                  <td className="py-2 font-bold text-[#17231E]">{e.category}</td>
                  <td className="py-2 text-[#65766F]">{e.description}</td>
                  <td className="py-2 text-[#65766F]">{e.propertyName}</td>
                  <td className="py-2 font-black text-right text-[#D93838]">
                    {formatMoney(e.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 3: Debtor Arrears Schedule */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#17231E] border-b pb-1">
            3. Outstanding Debtor Arrears Schedule
          </h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b text-[#65766F]">
                <th className="pb-2">Occupant</th>
                <th className="pb-2">Property & Unit</th>
                <th className="pb-2">Monthly Rent</th>
                <th className="pb-2 text-right">Overdue Arrears (UGX)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTenants
                .filter((t) => t.arrears > 0)
                .map((t) => (
                  <tr key={t.id}>
                    <td className="py-2 font-bold text-[#17231E]">{t.name} ({t.phone})</td>
                    <td className="py-2 text-[#65766F]">{t.propertyName} • {t.unitName}</td>
                    <td className="py-2 text-[#65766F]">{formatUgx(t.monthlyRent)}</td>
                    <td className="py-2 font-black text-right text-[#D93838]">
                      {formatMoney(t.arrears)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Signature & Stamp Certification Block */}
        <div className="pt-8 border-t-2 border-dashed border-[#DFE8E3] flex items-end justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#65766F] uppercase block">Certified Correct</span>
            <div className="w-48 border-b-2 border-[#17231E] pt-8" />
            <div className="text-xs font-black text-[#17231E]">{preparedBy}</div>
            <div className="text-[10px] text-[#65766F]">MARS Ledger System Auditor</div>
          </div>

          <div className="p-3 bg-[#F5F8F6] border-2 border-emerald-600 rounded-2xl text-center space-y-0.5">
            <div className="text-[10px] font-black text-emerald-800 tracking-wider uppercase">
              MARS AUDIT VERIFIED
            </div>
            <div className="text-[9px] text-[#0AB77F] font-bold">DIGITAL LEDGER SEAL</div>
            <div className="text-[8px] text-gray-500">UGANDA REVENUE COMPLIANT</div>
          </div>
        </div>
      </div>
    </div>
  );
};
