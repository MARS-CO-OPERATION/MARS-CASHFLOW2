import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx } from '../utils/formatters';
import {
  Calendar,
  Wrench,
  CheckCircle2,
  Clock,
  Plus,
  Building,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface RecurringMaintenanceScreenProps {
  onNavigate: (route: string) => void;
}

export const RecurringMaintenanceScreen: React.FC<RecurringMaintenanceScreenProps> = ({
  onNavigate,
}) => {
  const { properties, addMaintenance } = useMars();

  const [tasks, setTasks] = useState([
    {
      id: 'rec-1',
      title: 'Quarterly Pest Fumigation & Sanitization',
      frequency: 'Every 3 Months',
      nextDueDate: '15 Sep 2026',
      propertyName: 'Kampala Apartments',
      estimatedCost: 350000,
      contractor: 'Kampala Pest Masters',
      status: 'SCHEDULED',
    },
    {
      id: 'rec-2',
      title: 'Borehole / Underground Water Pump Servicing',
      frequency: 'Every 2 Months',
      nextDueDate: '02 Sep 2026',
      propertyName: 'Kampala Apartments',
      estimatedCost: 180000,
      contractor: 'Alex Kato (Plumber)',
      status: 'DUE_SOON',
    },
    {
      id: 'rec-3',
      title: 'Compound Landscaping & Hedge Trimming',
      frequency: 'Monthly',
      nextDueDate: '30 Aug 2026',
      propertyName: 'Entebbe Lake Breeze',
      estimatedCost: 120000,
      contractor: 'Grace Achieng (Cleaner)',
      status: 'DUE_SOON',
    },
    {
      id: 'rec-4',
      title: 'Roof & Gutter Drainage Clearing (Rainy Season Prep)',
      frequency: 'Bi-Annual',
      nextDueDate: '01 Oct 2026',
      propertyName: 'Jinja Road Commercial Plaza',
      estimatedCost: 450000,
      contractor: 'Moses Ssemwogerere (Carpenter)',
      status: 'SCHEDULED',
    },
  ]);

  const [dispatchedNotice, setDispatchedNotice] = useState<string | null>(null);

  const handleDispatch = (task: typeof tasks[0]) => {
    addMaintenance({
      propertyName: task.propertyName,
      unitName: 'Entire Estate Compound',
      tenantName: 'Estate Management',
      issue: `[Recurring Preventive Task] ${task.title}`,
      priority: 'MEDIUM',
      estimatedCost: task.estimatedCost,
      assignedProviderName: task.contractor,
    });

    setDispatchedNotice(`Work order created for "${task.title}". View in Repairs board.`);
    setTimeout(() => setDispatchedNotice(null), 4000);
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto px-4 sm:px-6 pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl">
            📅
          </div>
          <div>
            <h1 className="text-xl font-black text-[#17231E]">Preventative Maintenance Schedule</h1>
            <p className="text-xs text-[#65766F]">
              Automated recurring servicing schedules & estate asset protection
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('maintenance')}
          className="px-4 py-2 bg-white hover:bg-gray-50 border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] transition-all cursor-pointer"
        >
          View Active Work Orders →
        </button>
      </div>

      {dispatchedNotice && (
        <div className="p-4 bg-[#0AB77F]/15 border border-[#0AB77F]/40 rounded-2xl flex items-center gap-3 text-xs font-bold text-[#17231E]">
          <CheckCircle2 className="w-5 h-5 text-[#0AB77F] shrink-0" />
          <span>{dispatchedNotice}</span>
        </div>
      )}

      {/* Task Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-3xl p-5 border border-[#DFE8E3] shadow-xs space-y-4 hover:border-[#0AB77F]/50 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {task.frequency}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    task.status === 'DUE_SOON'
                      ? 'bg-red-100 text-[#D93838]'
                      : 'bg-[#E2F8EF] text-[#0AB77F]'
                  }`}
                >
                  {task.status === 'DUE_SOON' ? '⚠️ Due Soon' : '✅ Scheduled'}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-[#17231E]">{task.title}</h3>
                <p className="text-xs text-[#65766F] mt-0.5">{task.propertyName}</p>
              </div>

              <div className="p-3 bg-[#F5F8F6] rounded-2xl border border-[#DFE8E3] space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#65766F]">Next Target Date</span>
                  <span className="font-bold text-[#17231E]">{task.nextDueDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#65766F]">Assigned Artisan</span>
                  <span className="font-bold text-[#17231E]">{task.contractor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#65766F]">Estimated Cost</span>
                  <span className="font-black text-amber-700">{formatUgx(task.estimatedCost)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#DFE8E3] flex items-center justify-end">
              <button
                onClick={() => handleDispatch(task)}
                className="w-full py-2 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                Dispatch Preventative Work Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
