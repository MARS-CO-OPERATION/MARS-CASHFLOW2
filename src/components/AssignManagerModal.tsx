import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { PropertyEntity, ManagerEntity } from '../types';
import {
  X,
  UserCheck,
  UserPlus,
  Shield,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

interface AssignManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyEntity | null;
}

export const AssignManagerModal: React.FC<AssignManagerModalProps> = ({
  isOpen,
  onClose,
  property,
}) => {
  const { managers, reassignPropertyManager } = useMars();

  const [assignmentMode, setAssignmentMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedManagerId, setSelectedManagerId] = useState<string>(
    property?.managerId || managers[0]?.id || ''
  );

  // New manager inputs
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [expenseCap, setExpenseCap] = useState('500000');
  const [canCollectRent, setCanCollectRent] = useState(true);
  const [canLogExpenses, setCanLogExpenses] = useState(true);
  const [canDispatchRepairs, setCanDispatchRepairs] = useState(true);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !property) return null;

  const handleCopyInvite = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setCreatedInviteUrl(null);

    if (assignmentMode === 'EXISTING') {
      const existing = managers.find((m) => m.id === selectedManagerId);
      if (!existing) {
        setFeedback({ type: 'error', message: 'Please select an existing property manager.' });
        return;
      }

      setLoading(true);
      const res = await reassignPropertyManager(property.id, {
        managerId: existing.id,
        managerName: existing.name,
        managerPhone: existing.phone,
        managerEmail: existing.email,
        permissions: existing.permissions,
      });
      setLoading(false);

      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to assign manager.' });
      }
    } else {
      if (!newName.trim() || !newPhone.trim()) {
        setFeedback({ type: 'error', message: 'Manager name and phone number are required.' });
        return;
      }

      setLoading(true);
      const parsedCap = parseFloat(expenseCap.replace(/[^0-9]/g, '')) || 500000;
      const res = await reassignPropertyManager(property.id, {
        managerName: newName.trim(),
        managerPhone: newPhone.trim(),
        managerEmail: newEmail.trim() || undefined,
        permissions: {
          canCollectRent,
          canLogExpenses,
          maxExpenseLimitUgx: parsedCap,
          canIssueReceipts: true,
          canDispatchRepairs,
        },
      });
      setLoading(false);

      if (res.success) {
        if (res.inviteToken) {
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          const url = `${origin}?inviteToken=${res.inviteToken}`;
          setCreatedInviteUrl(url);
        }
        setFeedback({ type: 'success', message: res.message });
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to assign manager.' });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#DFE8E3] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-[#101915] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0AB77F] flex items-center justify-center text-white">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Assign Property Manager</h3>
              <p className="text-xs text-[#9FB2A9] flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>{property.name}</span>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
          {feedback && (
            <div
              className={`p-3 rounded-xl flex items-start gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-[#0AB77F]'
                  : 'bg-red-50 border border-red-200 text-[#D93838]'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-semibold">{feedback.message}</div>
            </div>
          )}

          {createdInviteUrl && (
            <div className="p-3.5 bg-[#E2F8EF] border border-[#0AB77F]/40 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-[#07885E]">
                  🔑 One-Time Manager Invitation Link
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyInvite(createdInviteUrl)}
                  className="px-2.5 py-1 bg-[#0AB77F] text-white rounded-lg font-bold flex items-center gap-1 hover:bg-[#07885E] cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#263D33] font-mono break-all bg-white p-2 rounded-xl border border-[#DFE8E3]">
                {createdInviteUrl}
              </p>
              <p className="text-[10px] text-[#65766F]">
                Send this link to the manager via WhatsApp or SMS. Valid for 7 days.
              </p>
            </div>
          )}

          {/* Current Manager Banner */}
          <div className="p-3 bg-[#F5F8F6] rounded-2xl border border-[#DFE8E3] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-extrabold text-[#65766F] block">
                Currently Assigned
              </span>
              <span className="font-bold text-xs text-[#17231E]">
                {property.managerName ? property.managerName : '⚠️ None (Assignment Required)'}
              </span>
            </div>
            {property.managerPhone && (
              <span className="text-[11px] font-mono text-[#65766F]">{property.managerPhone}</span>
            )}
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-[#F5F8F6] p-1 border border-[#DFE8E3]">
            <button
              type="button"
              onClick={() => setAssignmentMode('EXISTING')}
              className={`flex-1 py-2 rounded-lg font-extrabold text-center transition-all cursor-pointer ${
                assignmentMode === 'EXISTING'
                  ? 'bg-white shadow-xs text-[#17231E]'
                  : 'text-[#65766F] hover:text-[#17231E]'
              }`}
            >
              Select Existing Manager
            </button>
            <button
              type="button"
              onClick={() => setAssignmentMode('NEW')}
              className={`flex-1 py-2 rounded-lg font-extrabold text-center transition-all cursor-pointer ${
                assignmentMode === 'NEW'
                  ? 'bg-white shadow-xs text-[#17231E]'
                  : 'text-[#65766F] hover:text-[#17231E]'
              }`}
            >
              Invite / Add New Manager
            </button>
          </div>

          {assignmentMode === 'EXISTING' ? (
            <div className="space-y-3">
              <label className="block font-bold text-[#17231E]">
                Choose Property Manager from Portfolio Roster
              </label>
              {managers.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                  No existing managers found in your portfolio roster. Please switch to &quot;Invite / Add
                  New Manager&quot; to onboard your first manager.
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
                          name="managerSelection"
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
              <div>
                <label className="block font-bold text-[#17231E] mb-1">
                  Manager Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Patrick Mukasa"
                  className="w-full px-3 py-2.5 bg-white border border-[#DFE8E3] rounded-xl font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#17231E] mb-1">
                  Manager Phone Number (MTN/Airtel for MoMo & SMS) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+256 772 000 000"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#DFE8E3] rounded-xl font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#17231E] mb-1">
                  Manager Email (For secure one-time invite token)
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="manager@domain.ug"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#DFE8E3] rounded-xl font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                  />
                </div>
              </div>

              {/* Authority & Delegation */}
              <div className="p-3 bg-[#F5F8F6] rounded-2xl border border-[#DFE8E3] space-y-2.5">
                <div className="flex items-center gap-2 text-[#17231E] font-bold text-xs">
                  <Shield className="w-4 h-4 text-[#0AB77F]" />
                  <span>Delegated Financial Authorities</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={canCollectRent}
                      onChange={(e) => setCanCollectRent(e.target.checked)}
                      className="rounded text-[#0AB77F] focus:ring-[#0AB77F]"
                    />
                    <span>Issue Rent Receipts</span>
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
                    Max Expense Authorization Cap (UGX)
                  </label>
                  <input
                    type="text"
                    value={expenseCap}
                    onChange={(e) => setExpenseCap(e.target.value)}
                    placeholder="500,000"
                    className="w-full px-3 py-1.5 bg-white border border-[#DFE8E3] rounded-xl font-bold text-[#17231E]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-[#DFE8E3] flex items-center justify-between">
            <p className="text-[10px] text-[#65766F]">
              Historical payment and expense records are preserved.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#65766F] hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-[#0AB77F] hover:bg-[#07885E] shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Confirm Assignment'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
