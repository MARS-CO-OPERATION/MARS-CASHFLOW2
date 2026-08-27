import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { TenantEntity } from '../types';
import { formatMoney, formatUgx } from '../utils/formatters';
import { X, Send, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';

interface BatchReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export const BatchReminderModal: React.FC<BatchReminderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { tenants, sendTenantReminder } = useMars();
  const debtors = tenants.filter((t) => t.arrears > 0);

  const [selectedIds, setSelectedIds] = useState<string[]>(debtors.map((d) => d.id));
  const [customMessage, setCustomMessage] = useState(
    'Dear tenant, your rent balance is overdue. Please settle promptly via MTN/Airtel MoMo to avoid service disruptions. Thank you - MARS Management.'
  );
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSend = () => {
    setIsSending(true);
    let sentCount = 0;

    debtors
      .filter((d) => selectedIds.includes(d.id))
      .forEach((tenant) => {
        sendTenantReminder(
          tenant.name,
          tenant.phone,
          tenant.arrears,
          tenant.propertyName,
          tenant.unitName
        );
        sentCount++;
      });

    setTimeout(() => {
      setIsSending(false);
      onClose();
      onSuccess(sentCount);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#DFE8E3] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 bg-[#101915] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D93838] flex items-center justify-center text-white">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Broadcast SMS Reminders</h3>
              <p className="text-xs text-[#9FB2A9]">Dispatch automated collection notices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-[#D93838]">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>
              Targeting <strong>{selectedIds.length} overdue occupants</strong> with pending rent arrears.
            </span>
          </div>

          <div>
            <label className="block font-bold text-[#17231E] mb-2">
              Select Overdue Tenants ({debtors.length} Available)
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {debtors.map((d) => {
                const checked = selectedIds.includes(d.id);
                return (
                  <div
                    key={d.id}
                    onClick={() => toggleSelect(d.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      checked
                        ? 'border-[#D93838] bg-red-50/50'
                        : 'border-[#DFE8E3] bg-white opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}}
                        className="rounded text-[#D93838] focus:ring-[#D93838] cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-[#17231E]">{d.name}</div>
                        <div className="text-[10px] text-[#65766F]">
                          {d.propertyName} • {d.unitName} ({d.phone})
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-[#D93838] text-xs">
                        {formatUgx(d.arrears)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#17231E] mb-1">
              SMS Message Template
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white border border-[#DFE8E3] rounded-xl text-xs text-[#17231E] focus:outline-hidden focus:border-[#D93838]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#DFE8E3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#65766F] hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || selectedIds.length === 0}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#D93838] hover:bg-red-700 shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSending ? 'Dispatching SMS...' : `Send to ${selectedIds.length} Tenants`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
