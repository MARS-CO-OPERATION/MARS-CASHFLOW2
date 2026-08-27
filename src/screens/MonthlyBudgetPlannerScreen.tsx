import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx, formatUgxShort } from '../utils/formatters';
import {
  PieChart,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Save,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

interface MonthlyBudgetPlannerScreenProps {
  onNavigate: (route: string) => void;
}

export const MonthlyBudgetPlannerScreen: React.FC<MonthlyBudgetPlannerScreenProps> = ({
  onNavigate,
}) => {
  const { expenses } = useMars();

  // Budget state allocations in UGX
  const [budgets, setBudgets] = useState<Record<string, number>>({
    Maintenance: 400000,
    Utilities: 300000,
    'Caretaker Wage': 500000,
    Repairs: 250000,
    Security: 350000,
    General: 150000,
  });

  const [savedNotice, setSavedNotice] = useState(false);

  // Compute actual spent per category
  const actualSpent: Record<string, number> = {};
  Object.keys(budgets).forEach((cat) => {
    actualSpent[cat] = expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
  });

  const totalBudget = Object.values(budgets).reduce((a, b) => a + b, 0);
  const totalActual = Object.values(actualSpent).reduce((a, b) => a + b, 0);
  const budgetUtilization = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;

  const handleBudgetChange = (cat: string, value: string) => {
    const num = parseFloat(value.replace(/[^0-9]/g, '')) || 0;
    setBudgets((prev) => ({ ...prev, [cat]: num }));
  };

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto px-4 sm:px-6 pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0AB77F] text-white flex items-center justify-center text-xl">
            📊
          </div>
          <div>
            <h1 className="text-xl font-black text-[#17231E]">Monthly Budget Planner</h1>
            <p className="text-xs text-[#65766F]">
              Operating cost cap allocations & variance control
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          {savedNotice ? 'Budget Saved!' : 'Save Allocations'}
        </button>
      </div>

      {/* Summary Hero Card */}
      <div className="bg-[#101915] rounded-3xl p-6 text-white shadow-xl border border-white/5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-[#62E3B6] uppercase block">
              Budget Target vs Actual Outflow
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white">
              UGX {formatMoney(totalActual)} / UGX {formatMoney(totalBudget)}
            </div>
            <span className="text-xs text-[#9FB2A9]">
              {budgetUtilization}% of monthly budget allocated utilized
            </span>
          </div>

          <div
            className={`px-4 py-2 rounded-2xl border font-black text-xs ${
              totalActual <= totalBudget
                ? 'bg-[#0AB77F]/20 text-[#62E3B6] border-[#0AB77F]/40'
                : 'bg-red-950/60 text-red-400 border-red-500'
            }`}
          >
            {totalActual <= totalBudget
              ? `✅ UGX ${formatMoney(totalBudget - totalActual)} Under Budget`
              : `⚠️ UGX ${formatMoney(totalActual - totalBudget)} Over Budget`}
          </div>
        </div>

        <div className="w-full bg-[#20322A] h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetUtilization > 100 ? 'bg-red-500' : 'bg-[#0AB77F]'
            }`}
            style={{ width: `${Math.min(100, budgetUtilization)}%` }}
          />
        </div>
      </div>

      {/* Budget Allocation Rows */}
      <div className="bg-white rounded-3xl p-6 border border-[#DFE8E3] shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-[#17231E]">Category Allocations & Variance</h3>

        <div className="space-y-4">
          {Object.keys(budgets).map((cat) => {
            const budgetVal = budgets[cat];
            const spentVal = actualSpent[cat] || 0;
            const pct = budgetVal > 0 ? Math.round((spentVal / budgetVal) * 100) : 0;
            const isOver = spentVal > budgetVal;

            return (
              <div
                key={cat}
                className="p-4 bg-[#F5F8F6] rounded-2xl border border-[#DFE8E3] space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-extrabold text-xs text-[#17231E]">{cat}</div>
                    <span className="text-[11px] text-[#65766F]">
                      Spent: {formatUgx(spentVal)} of {formatUgx(budgetVal)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#65766F]">Target Cap (UGX):</span>
                    <input
                      type="number"
                      value={budgetVal}
                      onChange={(e) => handleBudgetChange(cat, e.target.value)}
                      className="w-32 px-2.5 py-1 bg-white border border-[#DFE8E3] rounded-xl text-xs font-black text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                    />
                  </div>
                </div>

                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOver ? 'bg-red-500' : 'bg-[#0AB77F]'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className={isOver ? 'text-[#D93838]' : 'text-[#0AB77F]'}>
                    {pct}% Spent
                  </span>
                  <span className={isOver ? 'text-[#D93838]' : 'text-[#65766F]'}>
                    {isOver
                      ? `Over budget by ${formatUgx(spentVal - budgetVal)}`
                      : `Remaining: ${formatUgx(budgetVal - spentVal)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
