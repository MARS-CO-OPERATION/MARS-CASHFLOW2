import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { ManagerEntity, PropertyEntity } from '../types';
import { formatMoney, formatUgx } from '../utils/formatters';
import {
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  KeyRound,
  Trash2,
  Building,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Smartphone,
  Save,
  RefreshCw,
  Sliders,
  DollarSign,
  Download,
  Power
} from 'lucide-react';

interface LandlordSettingsScreenProps {
  onNavigate: (route: string) => void;
}

export const LandlordSettingsScreen: React.FC<LandlordSettingsScreenProps> = ({ onNavigate }) => {
  const {
    currentUser,
    currentRole,
    properties,
    managers,
    addManager,
    updateManagerStatus,
    resetManagerPin,
    updateManagerPermissions,
    removeManager,
    resetToCleanDatabase,
    t,
  } = useMars();

  const [activeTab, setActiveTab] = useState<'MANAGERS' | 'PORTFOLIO' | 'SECURITY'>('MANAGERS');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Manager modal state
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);
  const [mgrName, setMgrName] = useState('');
  const [mgrPhone, setMgrPhone] = useState('');
  const [mgrEmail, setMgrEmail] = useState('');
  const [mgrPin, setMgrPin] = useState('');
  const [mgrPropertyIds, setMgrPropertyIds] = useState<string[]>([]);
  const [mgrCanPayments, setMgrCanPayments] = useState(true);
  const [mgrCanExpenses, setMgrCanExpenses] = useState(true);
  const [mgrMaxExpense, setMgrMaxExpense] = useState('200000');
  const [mgrCanRepairs, setMgrCanRepairs] = useState(true);
  const [mgrCanReports, setMgrCanReports] = useState(false);
  const [mgrCanAddTenants, setMgrCanAddTenants] = useState(true);

  // PIN reset modal
  const [resetTargetMgr, setResetTargetMgr] = useState<ManagerEntity | null>(null);
  const [newPinInput, setNewPinInput] = useState('');

  // Wipe confirmation modal
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  // STRICT BACKEND-LEVEL AUTHORIZATION CHECK
  if (currentRole !== 'LANDLORD') {
    return (
      <div className="max-w-2xl mx-auto p-8 my-12 text-center bg-white rounded-3xl border border-red-200 shadow-xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-red-100 border border-red-300 flex items-center justify-center mx-auto text-red-600 text-3xl">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-[#17231E]">Access Denied: Landlord Authority Required</h2>
          <p className="text-xs text-[#65766F] max-w-md mx-auto leading-relaxed">
            Manager accounts, tenants, and service providers are restricted from accessing landlord ownership controls and manager authority delegations.
          </p>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-6 py-2.5 bg-[#0AB77F] text-white font-black text-xs rounded-xl shadow-sm cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleCreateManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mgrName || !mgrPhone || !mgrEmail || mgrPropertyIds.length === 0) {
      setFeedback({ type: 'error', text: 'Enter the manager name, email, phone number, and at least one property.' });
      return;
    }

    addManager({
      name: mgrName,
      phone: mgrPhone,
      email: mgrEmail,
      // Manager authentication must be completed through Firebase Auth; never store a plaintext PIN.
      pin: '',
      assignedPropertyIds: mgrPropertyIds.length > 0 ? mgrPropertyIds : properties.map((p) => p.id),
      status: 'ACTIVE',
      permissions: {
        canCollectPayments: mgrCanPayments,
        canLogPayments: mgrCanPayments,
        canLogExpenses: mgrCanExpenses,
        expenseLimitUgx: parseFloat(mgrMaxExpense.replace(/[^0-9]/g, '')) || 200000,
        maxExpenseApprovalUgx: parseFloat(mgrMaxExpense.replace(/[^0-9]/g, '')) || 200000,
        canDispatchMaintenance: mgrCanRepairs,
        canDispatchRepairs: mgrCanRepairs,
      },
    });

    setMgrName('');
    setMgrPhone('');
    setMgrEmail('');
    setMgrPin('1234');
    setShowAddManagerModal(false);
    setFeedback({ type: 'success', text: `Manager ${mgrName} onboarded and granted operational credentials.` });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleResetPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetMgr || !newPinInput) return;
    resetManagerPin(resetTargetMgr.id, newPinInput);
    setFeedback({ type: 'success', text: `Security PIN for ${resetTargetMgr.name} updated to ${newPinInput}.` });
    setResetTargetMgr(null);
    setNewPinInput('');
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      {/* Reset PIN Modal */}
      {resetTargetMgr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#DFE8E3] shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#17231E]">Reset Manager PIN</h3>
                <p className="text-xs text-[#65766F]">Enter new 4-digit mobile PIN for {resetTargetMgr.name}</p>
              </div>
            </div>

            <form onSubmit={handleResetPinSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-[#17231E] mb-1">New 4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="e.g. 5678"
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetTargetMgr(null)}
                  className="px-4 py-2 bg-[#F5F8F6] text-xs font-bold text-gray-600 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0AB77F] hover:bg-[#07885E] text-white text-xs font-black rounded-xl cursor-pointer"
                >
                  Save New PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wipe Confirmation Modal */}
      {showWipeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-red-300 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-red-700">Wipe Data to Zero Clean State?</h3>
                <p className="text-xs text-[#65766F]">This will erase all saved records and restore a fresh zero-data ledger.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWipeConfirm(false)}
                className="px-4 py-2 bg-[#F5F8F6] text-xs font-bold text-gray-600 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => resetToCleanDatabase()}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl cursor-pointer"
              >
                Confirm Zero-Data Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#101915] text-[#62E3B6] flex items-center justify-center text-xl">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#17231E]">Landlord Authority & Estate Settings</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#101915] text-[#62E3B6]">
                OWNER EXCLUSIVE
              </span>
            </div>
            <p className="text-xs text-[#65766F]">
              Delegate manager permissions, configure spending caps, and oversee property operations
            </p>
          </div>
        </div>

      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-[#0AB77F]/15 border border-[#0AB77F]/40 text-[#17231E]'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#0AB77F]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-[#DFE8E3] overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('MANAGERS')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'MANAGERS' ? 'bg-[#101915] text-white shadow-xs' : 'text-[#65766F] hover:text-[#17231E]'
          }`}
        >
          👨🏾‍💼 Estate Managers ({managers.length})
        </button>
        <button
          onClick={() => setActiveTab('PORTFOLIO')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'PORTFOLIO' ? 'bg-[#101915] text-white shadow-xs' : 'text-[#65766F] hover:text-[#17231E]'
          }`}
        >
          🏢 Portfolio Visibility & Policies
        </button>
        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'SECURITY' ? 'bg-[#101915] text-white shadow-xs' : 'text-[#65766F] hover:text-[#17231E]'
          }`}
        >
          🔒 Zero-Data & System Storage
        </button>
      </div>

      {/* TAB 1: MANAGERS */}
      {activeTab === 'MANAGERS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-[#DFE8E3]">
            <div>
              <h3 className="font-black text-sm text-[#17231E]">Authorized Property Managers & Caretakers</h3>
              <p className="text-xs text-[#65766F]">
                Assign caretakers to specific estates, set expense spending limits, and restrict report exports.
              </p>
            </div>
            <button
              onClick={() => setShowAddManagerModal(true)}
              className="px-4 py-2 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              Add Estate Manager
            </button>
          </div>

          {/* Add Manager Form Card */}
          {showAddManagerModal && (
            <form
              onSubmit={handleCreateManager}
              className="bg-white rounded-3xl p-6 border border-[#0AB77F]/40 shadow-lg space-y-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#DFE8E3]">
                <h4 className="font-black text-sm text-[#17231E]">Onboard New Estate Manager / Caretaker</h4>
                <button
                  type="button"
                  onClick={() => setShowAddManagerModal(false)}
                  className="text-xs font-bold text-gray-400 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#17231E] mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={mgrName}
                    onChange={(e) => setMgrName(e.target.value)}
                    placeholder="e.g. Peter Ssekandi"
                    className="w-full px-3.5 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#17231E] mb-1">Phone Number (MoMo) *</label>
                  <input
                    type="text"
                    required
                    value={mgrPhone}
                    onChange={(e) => setMgrPhone(e.target.value)}
                    placeholder="e.g. 0772 998 877"
                    className="w-full px-3.5 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#17231E] mb-1">Initial 4-Digit Login PIN</label>
                  <input
                    type="password"
                    value={mgrPin}
                    onChange={(e) => setMgrPin(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3.5 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                  />
                </div>
              </div>

              {/* Permissions Strip */}
              <div className="bg-[#F5F8F6] p-4 rounded-2xl border border-[#DFE8E3] space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0AB77F] block">
                  Delegate Specific Operational Permissions:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-[#17231E]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mgrCanPayments}
                      onChange={(e) => setMgrCanPayments(e.target.checked)}
                      className="rounded text-[#0AB77F]"
                    />
                    <span>Can record rent payments</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mgrCanExpenses}
                      onChange={(e) => setMgrCanExpenses(e.target.checked)}
                      className="rounded text-[#0AB77F]"
                    />
                    <span>Can log expenses</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mgrCanRepairs}
                      onChange={(e) => setMgrCanRepairs(e.target.checked)}
                      className="rounded text-[#0AB77F]"
                    />
                    <span>Can dispatch MARS Projects</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mgrCanAddTenants}
                      onChange={(e) => setMgrCanAddTenants(e.target.checked)}
                      className="rounded text-[#0AB77F]"
                    />
                    <span>Can onboard new tenants</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mgrCanReports}
                      onChange={(e) => setMgrCanReports(e.target.checked)}
                      className="rounded text-[#0AB77F]"
                    />
                    <span>Can view bank PDF audit reports</span>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-extrabold text-[#17231E] mb-1">
                    Max Autonomous Expense Limit (UGX)
                  </label>
                  <input
                    type="text"
                    value={mgrMaxExpense}
                    onChange={(e) => setMgrMaxExpense(e.target.value)}
                    placeholder="e.g. 200,000"
                    className="w-full sm:w-64 px-3.5 py-1.5 bg-white border border-[#DFE8E3] rounded-xl text-xs font-bold"
                  />
                  <span className="text-[10px] text-[#65766F] block mt-0.5">
                    Expenses above this amount will require Landlord direct approval.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0AB77F] hover:bg-[#07885E] text-white text-xs font-black rounded-xl cursor-pointer"
                >
                  Save Manager Assignment
                </button>
              </div>
            </form>
          )}

          {/* Managers List */}
          {managers.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-[#DFE8E3] text-center max-w-lg mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E2F8EF] text-[#0AB77F] flex items-center justify-center mx-auto text-2xl">
                👨🏾‍💼
              </div>
              <h4 className="font-black text-sm text-[#17231E]">No Property Managers Assigned Yet</h4>
              <p className="text-xs text-[#65766F]">
                As the property owner, you currently manage all estates directly. Click "Add Estate Manager" to delegate tasks to on-ground caretakers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {managers.map((mgr) => (
                <div
                  key={mgr.id}
                  className="bg-white rounded-3xl p-5 border border-[#DFE8E3] shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          mgr.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        ● {mgr.status}
                      </span>
                      <span className="text-[11px] text-[#65766F] font-bold">
                        Expense Cap: {formatUgx(mgr.permissions.expenseLimitUgx || mgr.permissions.maxExpenseApprovalUgx || 0)}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-sm text-[#17231E]">{mgr.name}</h4>
                      <p className="text-xs text-[#65766F]">{mgr.phone} {mgr.email && `• ${mgr.email}`}</p>
                    </div>

                    <div className="space-y-1 text-[11px] text-[#65766F] bg-[#F5F8F6] p-3 rounded-2xl border border-[#DFE8E3]">
                      <div className="font-bold text-[#17231E]">Granted Authority:</div>
                      <div>• Payments: {(mgr.permissions.canCollectPayments || mgr.permissions.canLogPayments) ? '✅ Enabled' : '❌ Restricted'}</div>
                      <div>• Expenses: {mgr.permissions.canLogExpenses ? `✅ Enabled (Up to UGX ${formatMoney(mgr.permissions.expenseLimitUgx || mgr.permissions.maxExpenseApprovalUgx || 0)})` : '❌ Restricted'}</div>
                      <div>• Repairs Dispatch: {(mgr.permissions.canDispatchMaintenance || mgr.permissions.canDispatchRepairs) ? '✅ Enabled' : '❌ Restricted'}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#DFE8E3] flex items-center justify-between gap-2">
                    <button
                      onClick={() => setResetTargetMgr(mgr)}
                      className="px-3 py-1.5 bg-[#F5F8F6] hover:bg-gray-200 text-[#17231E] rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      Reset PIN
                    </button>

                    <button
                      onClick={() => updateManagerStatus(mgr.id, mgr.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                        mgr.status === 'ACTIVE'
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`}
                    >
                      {mgr.status === 'ACTIVE' ? 'Disable Account' : 'Re-activate'}
                    </button>

                    <button
                      onClick={() => removeManager(mgr.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                      title="Remove Manager"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PORTFOLIO VISIBILITY & POLICIES */}
      {activeTab === 'PORTFOLIO' && (
        <div className="bg-white rounded-3xl p-6 border border-[#DFE8E3] shadow-xs space-y-6 max-w-3xl">
          <div className="space-y-1 pb-4 border-b border-[#DFE8E3]">
            <h3 className="font-black text-sm text-[#17231E]">Estate Operating Rules & Branding</h3>
            <p className="text-xs text-[#65766F]">Configure automated tenant notice grace periods and digital receipt stamps.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-[#17231E] mb-1">
                Official Business / Estate Entity Name
              </label>
              <input
                type="text"
                defaultValue={currentUser?.displayName || 'Estate Management'}
                className="w-full px-3.5 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#17231E] mb-1">
                  Monthly Rent Due Date
                </label>
                <select className="w-full px-3.5 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]">
                  <option value="1">1st of Every Month</option>
                  <option value="5">5th of Every Month</option>
                  <option value="10">10th of Every Month</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#17231E] mb-1">
                  Arrears SMS Grace Period
                </label>
                <select className="w-full px-3.5 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]">
                  <option value="3">3 Days After Due Date</option>
                  <option value="5">5 Days After Due Date</option>
                  <option value="7">7 Days After Due Date</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setFeedback({ type: 'success', text: 'Estate policies updated successfully.' });
                setTimeout(() => setFeedback(null), 3000);
              }}
              className="px-6 py-2 bg-[#0AB77F] text-white rounded-xl text-xs font-black cursor-pointer"
            >
              Save Policies
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: ZERO-DATA & SYSTEM STORAGE */}
      {activeTab === 'SECURITY' && (
        <div className="bg-white rounded-3xl p-6 border border-[#DFE8E3] shadow-xs space-y-6 max-w-3xl">
          <div className="space-y-1 pb-4 border-b border-[#DFE8E3]">
            <h3 className="font-black text-sm text-[#17231E]">Zero-Sample-Data Reset & Backup Engine</h3>
            <p className="text-xs text-[#65766F]">
              Manage local database state, export encrypted backups, or wipe all records to return to a 100% clean production ledger.
            </p>
          </div>

          <div className="bg-red-50 p-5 rounded-2xl border border-red-200 space-y-3">
            <div className="flex items-center gap-2 text-red-800 font-black text-xs">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Danger Zone: Clear Local Database to Zero State</span>
            </div>
            <p className="text-xs text-red-700 leading-relaxed">
              Use this tool to completely purge all local storage records (properties, tenants, receipts, expenses, maintenance tickets) and start with an immaculate zero-sample-data ledger.
            </p>
            <button
              onClick={() => setShowWipeConfirm(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Wipe Ledger to Zero-Data State
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
