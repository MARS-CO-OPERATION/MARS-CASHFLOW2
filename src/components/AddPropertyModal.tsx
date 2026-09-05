import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { PropertyEntity, ManagerEntity } from '../types';
import {
  X,
  Building2,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  UserCheck,
  Phone,
  Mail,
  Shield,
  Copy,
  Check,
} from 'lucide-react';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ isOpen, onClose }) => {
  const { addProperty, managers } = useMars();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [totalUnits, setTotalUnits] = useState('10');
  const [propertyType, setPropertyType] = useState<PropertyEntity['propertyType']>('Residential');

  // Manager Assignment State
  const [managerSelectionMode, setManagerSelectionMode] = useState<'EXISTING' | 'NEW'>(
    managers.length > 0 ? 'EXISTING' : 'NEW'
  );
  const [selectedManagerId, setSelectedManagerId] = useState<string>(managers[0]?.id || '');
  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [maxExpenseLimitUgx, setMaxExpenseLimitUgx] = useState('500000');
  const [canCollectRent, setCanCollectRent] = useState(true);
  const [canLogExpenses, setCanLogExpenses] = useState(true);
  const [canDispatchRepairs, setCanDispatchRepairs] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message: string; inviteUrl?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCopyInvite = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);

    if (!name.trim() || !location.trim()) {
      setErrorMessage('Please provide the property name and physical location.');
      return;
    }

    const units = parseInt(totalUnits, 10) || 1;
    let chosenMgrId: string | undefined;
    let chosenMgrName: string | undefined;
    let chosenMgrPhone: string | undefined;
    let chosenMgrEmail: string | undefined;

    if (managerSelectionMode === 'EXISTING') {
      const existing = managers.find((m) => m.id === selectedManagerId);
      if (!existing) {
        setErrorMessage('Please select an active manager from your portfolio roster.');
        return;
      }
      chosenMgrId = existing.id;
      chosenMgrName = existing.name;
      chosenMgrPhone = existing.phone;
      chosenMgrEmail = existing.email;
    } else {
      if (!managerName.trim() || !managerPhone.trim()) {
        setErrorMessage('Manager full name and phone number are required for operational records.');
        return;
      }
      chosenMgrName = managerName.trim();
      chosenMgrPhone = managerPhone.trim();
      chosenMgrEmail = managerEmail.trim() || undefined;
    }

    setIsSubmitting(true);
    try {
      const parsedCap = parseFloat(maxExpenseLimitUgx.replace(/[^0-9]/g, '')) || 500000;
      const res = await addProperty({
        name: name.trim(),
        location: location.trim(),
        totalUnits: units,
        propertyType,
        managerId: chosenMgrId,
        managerName: chosenMgrName,
        managerPhone: chosenMgrPhone,
        managerEmail: chosenMgrEmail,
        permissions: {
          canCollectRent,
          canLogExpenses,
          maxExpenseLimitUgx: parsedCap,
          canIssueReceipts: true,
          canDispatchRepairs,
        },
      });

      setIsSubmitting(false);

      if (res.success) {
        let inviteUrl: string | undefined;
        if (res.inviteToken) {
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          inviteUrl = `${origin}?inviteToken=${res.inviteToken}`;
        }
        setSuccessInfo({
          message: `Property "${name}" successfully registered with manager ${chosenMgrName}.`,
          inviteUrl,
        });

        // If no invite token needed, auto-close after 1.5s
        if (!res.inviteToken) {
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else {
        setErrorMessage(res.message || 'Failed to register property.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Unexpected error creating property.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#DFE8E3] w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 bg-[#101915] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0AB77F] flex items-center justify-center text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Add New Property</h3>
              <p className="text-xs text-[#9FB2A9]">
                Assign an operational manager & provision units
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-[#D93838] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-bold leading-snug">{errorMessage}</div>
            </div>
          )}

          {successInfo && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0AB77F] space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successInfo.message}</span>
              </div>
              {successInfo.inviteUrl && (
                <div className="pt-2 border-t border-emerald-200/60 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#07885E] font-bold">
                    <span>🔑 One-Time Manager Invitation Link:</span>
                    <button
                      type="button"
                      onClick={() => handleCopyInvite(successInfo.inviteUrl!)}
                      className="px-2.5 py-1 bg-[#0AB77F] text-white rounded-lg font-bold flex items-center gap-1 hover:bg-[#07885E] cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-emerald-200 font-mono text-[10px] break-all text-gray-700">
                    {successInfo.inviteUrl}
                  </div>
                  <p className="text-[10px] text-[#65766F]">
                    Share this link with the manager. Upon accepting, they will create their secure account.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2 bg-[#0AB77F] text-white font-bold rounded-xl mt-2 cursor-pointer hover:bg-[#07885E]"
                  >
                    Done & View Property
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Section 1: Property Info */}
          <div className="space-y-3">
            <div className="text-[10px] uppercase font-extrabold text-[#65766F] tracking-wider">
              1. Property Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-[#17231E] mb-1">
                  Property / Estate Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Kololo Heights Apartments"
                  className="w-full px-3 py-2.5 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#17231E] mb-1">
                  Physical Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Plot 14 Acacia Avenue, Kololo"
                  className="w-full px-3 py-2.5 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#17231E] mb-1">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Mixed-Use">Mixed-Use</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#17231E] mb-1">
                  Total Rentable Units <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={totalUnits}
                  onChange={(e) => setTotalUnits(e.target.value)}
                  placeholder="10"
                  min="1"
                  className="w-full px-3 py-2.5 bg-white border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Assigned Property Manager (MANDATORY) */}
          <div className="pt-3 border-t border-[#DFE8E3] space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase font-extrabold text-[#65766F] tracking-wider">
                2. Assigned Property Manager <span className="text-red-500">*</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-[#07885E] rounded-full">
                Mandatory Assignment
              </span>
            </div>

            {/* Switch Mode: Existing vs New */}
            <div className="flex rounded-xl bg-[#F5F8F6] p-1 border border-[#DFE8E3]">
              <button
                type="button"
                onClick={() => setManagerSelectionMode('EXISTING')}
                className={`flex-1 py-1.5 rounded-lg font-extrabold text-center transition-all cursor-pointer ${
                  managerSelectionMode === 'EXISTING'
                    ? 'bg-white shadow-xs text-[#17231E]'
                    : 'text-[#65766F] hover:text-[#17231E]'
                }`}
              >
                Select Existing Manager
              </button>
              <button
                type="button"
                onClick={() => setManagerSelectionMode('NEW')}
                className={`flex-1 py-1.5 rounded-lg font-extrabold text-center transition-all cursor-pointer ${
                  managerSelectionMode === 'NEW'
                    ? 'bg-white shadow-xs text-[#17231E]'
                    : 'text-[#65766F] hover:text-[#17231E]'
                }`}
              >
                Onboard / Invite New Manager
              </button>
            </div>

            {managerSelectionMode === 'EXISTING' ? (
              <div className="space-y-2">
                {managers.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                    No managers found in portfolio roster yet. Please choose &quot;Onboard / Invite
                    New Manager&quot; below.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {managers.map((mgr) => {
                      const isSelected = selectedManagerId === mgr.id;
                      return (
                        <div
                          key={mgr.id}
                          onClick={() => setSelectedManagerId(mgr.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#E2F8EF] border-[#0AB77F] shadow-xs'
                              : 'bg-white border-[#DFE8E3] hover:border-gray-300'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold text-[#17231E] flex items-center gap-1.5">
                              <span>{mgr.name}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${
                                  mgr.status === 'ACTIVE'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {mgr.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#65766F] flex items-center gap-2">
                              <span>📞 {mgr.phone}</span>
                              {mgr.email && <span>✉️ {mgr.email}</span>}
                            </div>
                          </div>
                          <input
                            type="radio"
                            name="propertyManagerRadio"
                            checked={isSelected}
                            onChange={() => setSelectedManagerId(mgr.id)}
                            className="text-[#0AB77F] focus:ring-[#0AB77F]"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#17231E] mb-1">
                      Manager Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      placeholder="e.g., Patrick Mukasa"
                      className="w-full px-3 py-2 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                      required={managerSelectionMode === 'NEW'}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#17231E] mb-1">
                      Manager Phone (MoMo & SMS) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
                      <input
                        type="tel"
                        value={managerPhone}
                        onChange={(e) => setManagerPhone(e.target.value)}
                        placeholder="+256 772 000 000"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                        required={managerSelectionMode === 'NEW'}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-[#17231E] mb-1">
                      Manager Email (For secure one-time invite token)
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
                      <input
                        type="email"
                        value={managerEmail}
                        onChange={(e) => setManagerEmail(e.target.value)}
                        placeholder="manager@estate.ug"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                      />
                    </div>
                  </div>
                </div>

                {/* Manager Delegated Authorities */}
                <div className="p-3 bg-[#F5F8F6] rounded-2xl border border-[#DFE8E3] space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#17231E]">
                    <Shield className="w-3.5 h-3.5 text-[#0AB77F]" />
                    <span>Delegated Authorities & Cap</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input
                        type="checkbox"
                        checked={canCollectRent}
                        onChange={(e) => setCanCollectRent(e.target.checked)}
                        className="rounded text-[#0AB77F] focus:ring-[#0AB77F]"
                      />
                      <span>Collect Rent & Receipts</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input
                        type="checkbox"
                        checked={canLogExpenses}
                        onChange={(e) => setCanLogExpenses(e.target.checked)}
                        className="rounded text-[#0AB77F] focus:ring-[#0AB77F]"
                      />
                      <span>Log Ground Expenses</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input
                        type="checkbox"
                        checked={canDispatchRepairs}
                        onChange={(e) => setCanDispatchRepairs(e.target.checked)}
                        className="rounded text-[#0AB77F] focus:ring-[#0AB77F]"
                      />
                      <span>Dispatch Repairs</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#65766F] mb-1">
                      Max Expense Limit (UGX)
                    </label>
                    <input
                      type="text"
                      value={maxExpenseLimitUgx}
                      onChange={(e) => setMaxExpenseLimitUgx(e.target.value)}
                      placeholder="500,000"
                      className="w-full px-3 py-1.5 bg-white border border-[#DFE8E3] rounded-xl font-bold text-[#17231E]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          {!successInfo?.inviteUrl && (
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#DFE8E3]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#65766F] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#0AB77F] hover:bg-[#07885E] shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering...' : 'Register Property & Manager'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
