import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { MaintenanceEntity } from '../types';
import { X, Wrench, CheckCircle2, AlertCircle } from 'lucide-react';

interface LogMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUnit?: string;
  initialTenant?: string;
  initialProperty?: string;
}

export const LogMaintenanceModal: React.FC<LogMaintenanceModalProps> = ({
  isOpen,
  onClose,
  initialUnit,
  initialTenant,
  initialProperty,
}) => {
  const { properties, serviceProviders, addMaintenance } = useMars();

  const [propertyName, setPropertyName] = useState(initialProperty || properties[0]?.name || 'Kampala Apartments');
  const [unitName, setUnitName] = useState(initialUnit || 'Unit 102');
  const [tenantName, setTenantName] = useState(initialTenant || 'Sarah Namubiru');
  const [issue, setIssue] = useState('');
  const [priority, setPriority] = useState<MaintenanceEntity['priority']>('MEDIUM');
  const [estimatedCost, setEstimatedCost] = useState('80000');
  const [assignedProvider, setAssignedProvider] = useState(serviceProviders[0]?.name || 'Alex Kato (Plumber)');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue.trim()) {
      setErrorMessage('Please describe the repair issue.');
      return;
    }

    const cost = parseFloat(estimatedCost.replace(/[^0-9]/g, '')) || 0;

    addMaintenance({
      propertyName,
      unitName,
      tenantName,
      issue,
      priority,
      estimatedCost: cost,
      assignedProviderName: assignedProvider,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#DFE8E3] w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-5 bg-[#101915] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Log Maintenance Ticket</h3>
              <p className="text-xs text-[#9FB2A9]">Dispatch repairs & work order</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#D93838] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#17231E] mb-1">Property</label>
              <select
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#17231E] mb-1">Unit / Location</label>
              <input
                type="text"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder="Unit 102"
                className="w-full px-3 py-2 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#17231E] mb-1">Reporting Tenant / Occupant</label>
            <input
              type="text"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder="Tenant Name"
              className="w-full px-3 py-2 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-[#17231E] mb-1">Issue Description</label>
            <textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              rows={2}
              placeholder="Describe malfunction (e.g., Burst pipe under sink, leaking into floor)"
              className="w-full px-3 py-2 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#17231E] mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as MaintenanceEntity['priority'])}
                className="w-full px-3 py-2 bg-white border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
              >
                <option value="LOW">🟢 Low</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="HIGH">🟠 High</option>
                <option value="URGENT">🔴 Urgent</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#17231E] mb-1">Estimated Cost (UGX)</label>
              <input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="80,000"
                className="w-full px-3 py-2 bg-white border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#17231E] mb-1">Assign Service Provider / Contractor</label>
            <select
              value={assignedProvider}
              onChange={(e) => setAssignedProvider(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
            >
              {serviceProviders.map((sp) => (
                <option key={sp.id} value={`${sp.name} (${sp.serviceType})`}>
                  {sp.name} ({sp.serviceType}) - {sp.status}
                </option>
              ))}
            </select>
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
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Dispatch Work Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
