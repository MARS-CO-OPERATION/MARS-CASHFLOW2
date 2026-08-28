import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx } from '../utils/formatters';
import { ExpenseEntity } from '../types';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { EmptyState } from '../components/EmptyState';
import {
  TrendingDown,
  Plus,
  Camera,
  Filter,
  FileSpreadsheet,
  X,
  CheckCircle2,
  Image as ImageIcon,
  Receipt
} from 'lucide-react';

interface ExpensesScreenProps {
  onNavigate: (route: string) => void;
}

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({ onNavigate }) => {
  const { expenses, properties, t } = useMars();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProperty, setSelectedProperty] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const categories = [
    'All',
    'Maintenance',
    'Utilities',
    'Caretaker Wage',
    'Repairs',
    'Security',
    'Cleaning',
    'General',
  ];

  const filteredExpenses = expenses.filter((e) => {
    const matchCat = selectedCategory === 'All' || e.category === selectedCategory;
    const matchProp = selectedProperty === 'All' || e.propertyName === selectedProperty;
    return matchCat && matchProp;
  });

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="bg-white rounded-3xl p-4 max-w-lg w-full relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-[#17231E]">Expense Receipt Voucher</h3>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center max-h-[70vh] overflow-hidden rounded-2xl bg-gray-50 border border-gray-200">
              <img
                src={previewPhoto}
                alt="Receipt voucher"
                className="max-h-[65vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      <AddExpenseModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />

      {/* Screen Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D93838] text-white flex items-center justify-center text-xl">
            📉
          </div>
          <div>
            <h1 className="text-xl font-black text-[#17231E]">Operating Expenses Ledger</h1>
            <p className="text-xs text-[#65766F]">
              Verify and log maintenance, utilities, contractor wages & tokens
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('document_scanner')}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-[#0AB77F]" />
            <span>Scan Receipt OCR</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#D93838] hover:bg-red-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Expense Summary Banner */}
      <div className="bg-[#101915] rounded-3xl p-6 text-white shadow-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-[#62E3B6] uppercase block">
            Filtered Total Expenditure
          </span>
          <div className="text-3xl font-black text-white">UGX {formatMoney(totalSpent)}</div>
          <span className="text-xs text-[#9FB2A9]">
            {filteredExpenses.length} Approved Vouchers logged
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('budget_planner')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Compare with Monthly Budget →
          </button>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#DFE8E3]">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#101915] text-white shadow-xs'
                  : 'text-[#65766F] hover:bg-gray-100 hover:text-[#17231E]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {properties.length > 0 && (
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="px-3 py-1.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden"
          >
            <option value="All">All Properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Expenses List or Empty State */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={t.noExpensesTitle}
          description={t.noExpensesDesc}
          actionLabel={t.recordExpense}
          onAction={() => setShowAddModal(true)}
          tips={[
            'Keep your Net Operating Cashflow accurate by logging bills like Umeme tokens, NWSC water, garbage, and caretaker allowances.',
            'Repair tickets completed through MARS Projects Uganda can be linked directly with 1 click.',
          ]}
        />
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((exp: ExpenseEntity) => (
            <div
              key={exp.id}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-[#DFE8E3] hover:border-[#0AB77F]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#D93838] flex items-center justify-center text-lg shrink-0">
                  {exp.category === 'Utilities' ? '⚡' : exp.category === 'Maintenance' ? '🔧' : '📉'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#17231E]">{exp.description}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F5F8F6] text-[#65766F] border border-[#DFE8E3]">
                      {exp.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#65766F] mt-0.5">
                    {exp.propertyName} • Logged by: {exp.recordedBy || 'Management'} on {exp.date}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                <div className="text-right">
                  <div className="font-black text-sm text-[#D93838] sm:text-base">
                    -{formatUgx(exp.amount)}
                  </div>
                  <div className="text-[10px] text-gray-400">Approved Voucher</div>
                </div>

                {exp.receiptPhotoUri && (
                  <button
                    onClick={() => setPreviewPhoto(exp.receiptPhotoUri || null)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                    title="View Attached Photo Voucher"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
