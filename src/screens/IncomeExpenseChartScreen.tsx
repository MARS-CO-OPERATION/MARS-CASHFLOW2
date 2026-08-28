import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx, formatUgxShort } from '../utils/formatters';
import { EmptyState } from '../components/EmptyState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUpRight,
  PieChart,
  FileSpreadsheet
} from 'lucide-react';

interface IncomeExpenseChartScreenProps {
  onNavigate: (route: string) => void;
}

export const IncomeExpenseChartScreen: React.FC<IncomeExpenseChartScreenProps> = ({ onNavigate }) => {
  const { payments, expenses, properties, tenants } = useMars();

  const [chartType, setChartType] = useState<'BAR' | 'AREA' | 'NET'>('BAR');

  // Compute real dynamic 6-month historical/trend data from actual ledger payments and expenses
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthName = d.toLocaleString('default', { month: 'short' });
    const year = d.getFullYear();
    const monthKey = `${monthName} ${year}`;
    const monthIndex = d.getMonth();
    const yearVal = d.getFullYear();

    // Sum payments in this month
    const income = payments
      .filter((p) => {
        const pDate = p.createdAt ? new Date(p.createdAt) : new Date(p.date);
        return !isNaN(pDate.getTime()) && pDate.getMonth() === monthIndex && pDate.getFullYear() === yearVal;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    // Sum expenses in this month
    const expense = expenses
      .filter((e) => {
        const eDate = e.createdAt ? new Date(e.createdAt) : new Date(e.date);
        return !isNaN(eDate.getTime()) && eDate.getMonth() === monthIndex && eDate.getFullYear() === yearVal;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      month: monthKey,
      income,
      expense,
      net: income - expense,
    };
  });

  const total6MIncome = monthlyData.reduce((s, d) => s + d.income, 0);
  const total6MExpense = monthlyData.reduce((s, d) => s + d.expense, 0);
  const total6MNet = total6MIncome - total6MExpense;
  const profitMargin = total6MIncome > 0 ? Math.round((total6MNet / total6MIncome) * 100) : 0;

  const hasAnyData = total6MIncome > 0 || total6MExpense > 0;

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0AB77F] text-white flex items-center justify-center text-xl">
            📊
          </div>
          <div>
            <h1 className="text-xl font-black text-[#17231E]">Income & Cashflow Trends</h1>
            <p className="text-xs text-[#65766F]">
              6-Month macro performance, collection efficiency & net margin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('pdf_export')}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#0AB77F]" />
            <span>Export Monthly Audit PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#101915] rounded-3xl p-5 text-white space-y-1 shadow-md border border-white/5">
          <span className="text-[10px] font-bold text-[#62E3B6] uppercase">6-Month Rent Collected</span>
          <div className="text-2xl font-black text-white">{formatUgxShort(total6MIncome)}</div>
          <span className="text-[11px] text-[#9FB2A9]">Avg: {formatUgxShort(total6MIncome / 6)} / mo</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#DFE8E3] space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-[#D93838] uppercase">6-Month Outflow / Bills</span>
          <div className="text-2xl font-black text-[#D93838]">{formatUgxShort(total6MExpense)}</div>
          <span className="text-[11px] text-[#65766F]">Avg: {formatUgxShort(total6MExpense / 6)} / mo</span>
        </div>

        <div className="bg-[#E2F8EF] rounded-3xl p-5 border border-[#0AB77F]/30 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-[#0AB77F] uppercase">Net Margin Efficiency</span>
          <div className="text-2xl font-black text-[#0AB77F]">{profitMargin}% Net Yield</div>
          <span className="text-[11px] text-[#17231E] font-medium">
            UGX {formatMoney(total6MNet)} total net surplus
          </span>
        </div>
      </div>

      {/* Chart Canvas Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#DFE8E3] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm text-[#17231E]">Monthly Cash Movement (UGX)</h3>
            <p className="text-xs text-[#65766F]">Historical comparison of rent inflow against operational costs</p>
          </div>

          <div className="flex items-center gap-1 bg-[#F5F8F6] p-1 rounded-xl border border-[#DFE8E3]">
            <button
              onClick={() => setChartType('BAR')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                chartType === 'BAR' ? 'bg-[#101915] text-white' : 'text-[#65766F]'
              }`}
            >
              Bar Inflow/Outflow
            </button>
            <button
              onClick={() => setChartType('AREA')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                chartType === 'AREA' ? 'bg-[#101915] text-white' : 'text-[#65766F]'
              }`}
            >
              Area Waves
            </button>
            <button
              onClick={() => setChartType('NET')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                chartType === 'NET' ? 'bg-[#101915] text-white' : 'text-[#65766F]'
              }`}
            >
              Net Surplus Line
            </button>
          </div>
        </div>

        {/* Recharts Canvas */}
        {!hasAnyData ? (
          <div className="py-12">
            <EmptyState
              icon={BarChart3}
              title="No Historical Data Yet"
              description="Record rent payments and operating expenses to generate real-time financial trajectory trends."
              actionLabel="Record Payment"
              onAction={() => onNavigate('dashboard')}
              secondaryActionLabel="Record Expense"
              onSecondaryAction={() => onNavigate('expenses')}
              tips={[
                'All charts dynamically recalculate whenever payments or vouchers are logged.',
                'Export audit-ready PDF reports anytime from the top button.',
              ]}
            />
          </div>
        ) : (
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'BAR' ? (
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="month" stroke="#65766F" fontSize={11} />
                  <YAxis
                    stroke="#65766F"
                    fontSize={11}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(val: number) => [`UGX ${val.toLocaleString()}`, '']}
                    contentStyle={{
                      backgroundColor: '#101915',
                      borderRadius: '16px',
                      color: '#FFF',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Rent Inflow" fill="#0AB77F" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Bills & Expenses" fill="#D93838" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : chartType === 'AREA' ? (
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="month" stroke="#65766F" fontSize={11} />
                  <YAxis
                    stroke="#65766F"
                    fontSize={11}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(val: number) => [`UGX ${val.toLocaleString()}`, '']}
                    contentStyle={{
                      backgroundColor: '#101915',
                      borderRadius: '16px',
                      color: '#FFF',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Rent Inflow"
                    stroke="#0AB77F"
                    fill="#0AB77F"
                    fillOpacity={0.2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Bills & Expenses"
                    stroke="#D93838"
                    fill="#D93838"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              ) : (
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="month" stroke="#65766F" fontSize={11} />
                  <YAxis
                    stroke="#65766F"
                    fontSize={11}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(val: number) => [`UGX ${val.toLocaleString()}`, '']}
                    contentStyle={{
                      backgroundColor: '#101915',
                      borderRadius: '16px',
                      color: '#FFF',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="net"
                    name="Net Cash Surplus"
                    stroke="#0AB77F"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#0AB77F' }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
