import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { MaintenancePriority, MaintenanceUrgency } from '../types';
import { MARS_PROJECT_CATEGORIES, MARS_PROJECTS_CONTACT } from '../services/store';
import { X, Wrench, CheckCircle2, AlertCircle, Phone, Calendar, Clock, Sparkles } from 'lucide-react';

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
  const { properties, requestMarsProjectsService, currentUser } = useMars();

  const [propertyName, setPropertyName] = useState(initialProperty || properties[0]?.name || '');
  const [unitName, setUnitName] = useState(initialUnit || '');
  const [tenantName, setTenantName] = useState(initialTenant || currentUser?.displayName || '');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '');
  const [serviceCategory, setServiceCategory] = useState<string>(MARS_PROJECT_CATEGORIES[0]);
  const [issue, setIssue] = useState('');
  const [urgency, setUrgency] = useState<MaintenanceUrgency>('Normal');
  const [preferredDate, setPreferredDate] = useState(new Date().toISOString().split('T')[0]);
  const [preferredTime, setPreferredTime] = useState('Morning (8:00 AM - 12:00 PM)');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue.trim()) {
      setErrorMessage('Please describe the repair or maintenance issue.');
      return;
    }
    if (!propertyName) {
      setErrorMessage('Please enter or select a property name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = requestMarsProjectsService({
      propertyName,
      unitName: unitName || 'Entire Building / Compound',
      tenantName: tenantName || 'Estate Management',
      contactPhone,
      serviceCategory,
      issue,
      urgency,
      priority: urgency === 'Emergency' ? 'EMERGENCY' : urgency === 'Urgent' ? 'HIGH' : 'MEDIUM',
      preferredDate,
      preferredTime,
      additionalNotes,
    });

    setIsSubmitting(false);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    } else {
      setErrorMessage('Failed to submit maintenance request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#DFE8E3] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-[#101915] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0AB77F] flex items-center justify-center text-white text-lg">
              🛠️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm tracking-tight text-white">
                  Request MARS Projects Service
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#62E3B6]/20 text-[#62E3B6]">
                  UGANDA PARTNER
                </span>
              </div>
              <p className="text-[11px] text-[#9FB2A9]">
                Plumbing, Electricals, Renovations & Maintenance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#D93838] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-[#0AB77F]/15 border border-[#0AB77F]/40 text-[#0AB77F] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Service Category */}
          <div>
            <label className="block font-extrabold text-[#17231E] mb-1">
              Service / Trade Category *
            </label>
            <select
              value={serviceCategory}
              onChange={(e) => setServiceCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
            >
              {MARS_PROJECT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Property & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-extrabold text-[#17231E] mb-1">Estate / Property *</label>
              {properties.length > 0 ? (
                <select
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                >
                  <option value="">Select Property</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="e.g. Kampala Apartments"
                  className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                />
              )}
            </div>
            <div>
              <label className="block font-extrabold text-[#17231E] mb-1">Unit / Location</label>
              <input
                type="text"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder="e.g. Unit 102 or Main Gate"
                className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
              />
            </div>
          </div>

          {/* Tenant Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-extrabold text-[#17231E] mb-1">Contact Person Name</label>
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="e.g. Sarah Namubiru"
                className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
              />
            </div>
            <div>
              <label className="block font-extrabold text-[#17231E] mb-1">Phone (Field Contact)</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. 0772 123 456"
                className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
              />
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <label className="block font-extrabold text-[#17231E] mb-1">
              Issue / Project Description *
            </label>
            <textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              rows={2}
              placeholder="Detailed description of defect or required works (e.g., Burst water pipe leaking in bathroom floor)"
              className="w-full px-3.5 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-medium text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
              required
            />
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block font-extrabold text-[#17231E] mb-1">Urgency Level</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Emergency', label: '🚨 Emergency', sub: '1-3 hrs dispatch' },
                { id: 'Urgent', label: '⚡ Urgent', sub: 'Within 24 hrs' },
                { id: 'Normal', label: '🗓️ Scheduled', sub: 'Standard visit' },
              ].map((urg) => (
                <button
                  key={urg.id}
                  type="button"
                  onClick={() => setUrgency(urg.id as MaintenanceUrgency)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    urgency === urg.id
                      ? 'bg-[#E2F8EF] border-[#0AB77F] text-[#0AB77F] ring-1 ring-[#0AB77F]'
                      : 'bg-[#F5F8F6] border-[#DFE8E3] text-[#65766F]'
                  }`}
                >
                  <div className="font-extrabold text-xs">{urg.label}</div>
                  <div className="text-[9px]">{urg.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-extrabold text-[#17231E] mb-1">Preferred Inspection Date</label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
              />
            </div>
            <div>
              <label className="block font-extrabold text-[#17231E] mb-1">Preferred Time Window</label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
              >
                <option value="Morning (8:00 AM - 12:00 PM)">Morning (8:00 AM - 12:00 PM)</option>
                <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon (1:00 PM - 5:00 PM)</option>
                <option value="Anytime during working hours">Anytime during working hours</option>
              </select>
            </div>
          </div>

          {/* Footer & Submit */}
          <div className="pt-2 border-t border-[#DFE8E3] flex items-center justify-between">
            <div className="text-[10px] text-[#65766F]">
              Dispatches directly to MARS Projects Uganda.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#0AB77F] hover:bg-[#07885E] active:scale-[0.98] text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Submit Service Order</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
