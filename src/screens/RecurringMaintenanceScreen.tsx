import React, { useState, useEffect } from 'react';
import { useMars } from '../context/MarsContext';
import { formatMoney, formatUgx } from '../utils/formatters';
import { EmptyState } from '../components/EmptyState';
import {
  Calendar,
  Wrench,
  CheckCircle2,
  Clock,
  Plus,
  Building,
  Sparkles,
  AlertTriangle,
  X
} from 'lucide-react';

interface RecurringTask {
  id: string;
  title: string;
  frequency: string;
  nextDueDate: string;
  propertyName: string;
  estimatedCost: number;
  contractor: string;
  status: 'SCHEDULED' | 'DUE_SOON';
}

interface RecurringMaintenanceScreenProps {
  onNavigate: (route: string) => void;
}

export const RecurringMaintenanceScreen: React.FC<RecurringMaintenanceScreenProps> = ({
  onNavigate,
}) => {
  const { properties, requestMarsProjectsService, t } = useMars();

  const [tasks, setTasks] = useState<RecurringTask[]>(() => {
    const saved = localStorage.getItem('mars_recurring_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [];
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newFreq, setNewFreq] = useState('Every 3 Months');
  const [newProp, setNewProp] = useState(properties[0]?.name || '');
  const [newCost, setNewCost] = useState('250000');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [dispatchedNotice, setDispatchedNotice] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('mars_recurring_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: RecurringTask = {
      id: `rec-${Date.now()}`,
      title: newTitle.trim(),
      frequency: newFreq,
      nextDueDate: newDate,
      propertyName: newProp || properties[0]?.name || 'Estate Compound',
      estimatedCost: parseFloat(newCost.replace(/[^0-9]/g, '')) || 0,
      contractor: 'MARS Projects Uganda (Official)',
      status: 'SCHEDULED',
    };

    setTasks((prev) => [...prev, newTask]);
    setShowAddModal(false);
    setNewTitle('');
    setDispatchedNotice(`Created recurring schedule: "${newTask.title}"`);
    setTimeout(() => setDispatchedNotice(null), 4000);
  };

  const handleDispatch = (task: RecurringTask) => {
    requestMarsProjectsService({
      propertyName: task.propertyName,
      unitName: 'Entire Estate Compound',
      tenantName: 'Estate Management',
      issue: `[Recurring Preventive Task] ${task.title} (${task.frequency})`,
      serviceCategory: 'Preventive Maintenance',
      urgency: 'Normal',
      priority: 'MEDIUM',
    });

    setDispatchedNotice(`Dispatched MARS Projects work order for "${task.title}".`);
    setTimeout(() => setDispatchedNotice(null), 4000);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto px-4 sm:px-6 pt-4">
      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#DFE8E3] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg">
                  📅
                </div>
                <h3 className="font-black text-sm text-[#17231E]">Create Recurring Schedule</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#17231E] mb-1">Task Title / Scope</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Quarterly Fumigation & Tank Cleaning"
                  className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#17231E] mb-1">Frequency</label>
                  <select
                    value={newFreq}
                    onChange={(e) => setNewFreq(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl font-bold"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Every 2 Months">Every 2 Months</option>
                    <option value="Every 3 Months">Every 3 Months</option>
                    <option value="Bi-Annual (6 Mos)">Bi-Annual (6 Mos)</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#17231E] mb-1">First Due Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#17231E] mb-1">Target Property</label>
                {properties.length > 0 ? (
                  <select
                    value={newProp}
                    onChange={(e) => setNewProp(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl font-bold"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={newProp}
                    onChange={(e) => setNewProp(e.target.value)}
                    placeholder="e.g. Kampala Apartments"
                    className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl font-bold"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-[#17231E] mb-1">Estimated Cost (UGX)</label>
                <input
                  type="text"
                  value={newCost}
                  onChange={(e) => setNewCost(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0AB77F] hover:bg-[#07885E] text-white text-xs font-black rounded-xl cursor-pointer"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl">
            📅
          </div>
          <div>
            <h1 className="text-xl font-black text-[#17231E]">Preventative Maintenance Schedule</h1>
            <p className="text-xs text-[#65766F]">
              Automated recurring servicing schedules & MARS Projects dispatches
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('maintenance')}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] transition-all cursor-pointer"
          >
            View Work Orders →
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Schedule</span>
          </button>
        </div>
      </div>

      {dispatchedNotice && (
        <div className="p-4 bg-[#0AB77F]/15 border border-[#0AB77F]/40 rounded-2xl flex items-center gap-3 text-xs font-bold text-[#17231E] animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#0AB77F] shrink-0" />
          <span>{dispatchedNotice}</span>
        </div>
      )}

      {/* Task Schedule Grid */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Recurring Schedules Configured"
          description="Create recurring maintenance schedules for water pump servicing, tank sanitization, pest control, and generator maintenance."
          actionLabel="Add Recurring Schedule"
          onAction={() => setShowAddModal(true)}
          tips={[
            'Preventative maintenance saves up to 40% in emergency repair costs.',
            'Schedules automatically dispatch work orders to MARS Projects Uganda when due.',
          ]}
        />
      ) : (
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
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E2F8EF] text-[#0AB77F]">
                    🗓️ Due: {task.nextDueDate}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-[#17231E]">{task.title}</h3>
                  <p className="text-xs text-[#65766F] mt-0.5">{task.propertyName}</p>
                </div>

                <div className="p-3 bg-[#F5F8F6] rounded-2xl border border-[#DFE8E3] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#65766F] block">Service Partner</span>
                    <span className="font-bold text-[#17231E]">{task.contractor}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#65766F] block">Budget Estimate</span>
                    <span className="font-black text-[#17231E]">{formatUgx(task.estimatedCost)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#DFE8E3] flex items-center justify-between">
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                >
                  Remove
                </button>
                <button
                  onClick={() => handleDispatch(task)}
                  className="px-3.5 py-1.5 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Dispatch Work Order Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
