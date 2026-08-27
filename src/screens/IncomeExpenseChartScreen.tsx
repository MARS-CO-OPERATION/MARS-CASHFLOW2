import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx, formatUgxShort } from '../utils/formatters';
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

  // Generate 6 months historical trend data
  const monthlyData = [
    { month: 'Mar 2026', income: 7200000, expense: 1100000, net: 6100000 },
    { month: 'Apr 2026', income: 8400000, expense: 1450000, net: 6950000 },
    { month: 'May 2026', income: 7800000, expense: 980000, net: 6820000 },
    { month: 'Jun 2026', income: 9200000, expense: 1300000, net: 7900000 },
    { month: 'Jul 2026', income: 8600000, expense: 1200000, net: 7400000 },
    { month: 'Aug 2026', income: 8900000, expense: 1120000, net: 7780000 },
  ];

  const total6MIncome = monthlyData.reduce((s, d) => s + d.income, 0);
  const total6MExpense = monthlyData.reduce((s, d) => s + d.expense, 0);
  const total6MNet = total6MIncome - total6MExpense;
  const profitMargin = Math.round((total6MNet / total6MIncome) * 100);

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
            Export Monthly Audit PDF
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
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'BAR' ? (
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#65766F" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#65766F"
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(value: any) => [`UGX ${Number(value).toLocaleString()}`, '']}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #DFE8E3', fontSize: '12px' }}
                />
                <Legend />
                <Bar dataKey="income" name="Rent Inflow" fill="#0AB77F" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Operating Expenses" fill="#D93838" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : chartType === 'AREA' ? (
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#65766F" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#65766F"
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(value: any) => [`UGX ${Number(value).toLocaleString()}`, '']}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #DFE8E3', fontSize: '12px' }}
                />
                <Legend />
                <Area type="monotone" dataKey="income" name="Rent Inflow" stroke="#0AB77F" fill="#0AB77F" fillOpacity={0.2} />
                <Area type="monotone" dataKey="expense" name="Operating Expenses" stroke="#D93838" fill="#D93838" fillOpacity={0.2} />
              </AreaChart>
            ) : (
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#65766F" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#65766F"
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(value: any) => [`UGX ${Number(value).toLocaleString()}`, '']}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #DFE8E3', fontSize: '12px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="net" name="Net Operating Cashflow" stroke="#0AB77F" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
