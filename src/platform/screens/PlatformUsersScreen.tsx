import React, { useState } from 'react';
import { usePlatform } from '../PlatformContext';
import { PlatformRoleKey, PLATFORM_ROLES, PlatformUserEntity } from '../../types';
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Clock,
  Trash2,
  Lock,
  Crown,
  Building,
} from 'lucide-react';

const AVAILABLE_SCOPES = [
  { key: 'platform.users.read', label: 'View Platform Users' },
  { key: 'platform.users.manage', label: 'Invite & Manage Personnel' },
  { key: 'platform.products.read', label: 'View Products & Flags' },
  { key: 'platform.products.manage', label: 'Manage Products & Features' },
  { key: 'platform.subscriptions.read', label: 'View Subscription Tiers' },
  { key: 'platform.subscriptions.manage', label: 'Edit Pricing & Plans' },
  { key: 'platform.billing.manage', label: 'Billing & Invoicing Engine' },
  { key: 'corporate.governance.read', label: 'Read Governance & Board Filings' },
  { key: 'corporate.governance.manage', label: 'Publish Board Filings' },
  { key: 'platform.investors.read', label: 'Access Investor KPI Dashboard' },
  { key: 'platform.government.read', label: 'Government Scoped Access' },
  { key: 'platform.security.manage', label: 'Security & Access Control' },
  { key: 'platform.audit.read', label: 'Inspect Audit Log Stream' },
];

export const PlatformUsersScreen: React.FC = () => {
  const {
    platformUsers,
    invitations,
    createPlatformInvitation,
    revokeInvitation,
    revokePlatformUser,
    isPrincipalFounder,
    hasScope,
  } = usePlatform();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDisplayName, setInviteDisplayName] = useState('');
  const [inviteRole, setInviteRole] = useState<PlatformRoleKey>('CO_FOUNDER');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(
    PLATFORM_ROLES['CO_FOUNDER'].defaultScopes
  );
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleRoleSelectChange = (role: PlatformRoleKey) => {
    setInviteRole(role);
    setSelectedScopes(PLATFORM_ROLES[role]?.defaultScopes || ['platform.users.read']);
  };

  const handleScopeToggle = (scopeKey: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeKey) ? prev.filter((s) => s !== scopeKey) : [...prev, scopeKey]
    );
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteDisplayName) return;

    const res = await createPlatformInvitation({
      email: inviteEmail,
      displayName: inviteDisplayName,
      platformRole: inviteRole,
      permissionScopes: selectedScopes,
    });

    if (res.success) {
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteDisplayName('');
      setFeedback({
        type: 'success',
        message: `Corporate invitation generated for ${inviteDisplayName}. Token: ${res.token}`,
      });
      setTimeout(() => setFeedback(null), 6000);
    } else {
      setFeedback({ type: 'error', message: res.message || 'Invitation creation failed.' });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231E]">
            MARS Platform Personnel & Governance Hierarchy
          </h2>
          <p className="text-xs text-[#65766F] mt-0.5">
            Strict Class A Platform Accounts: Principal Founder, Co-Founders, Board Members, Investors & Regulatory Partners
          </p>
        </div>
        {(isPrincipalFounder() || hasScope('platform.users.manage')) && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#101915] hover:bg-[#17231E] text-white rounded-2xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#62E3B6]" />
            <span>Invite Platform Personnel</span>
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-[#0AB77F] border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Active Platform Personnel List */}
      <div className="bg-white rounded-3xl border border-[#DFE8E3] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#DFE8E3] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-[#17231E]">
              Authorized Corporate Accounts ({platformUsers.length})
            </h3>
            <p className="text-xs text-[#65766F]">
              Direct authorization to MARS Corporation governance & Platform HQ
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {platformUsers.map((user) => {
            const roleInfo = PLATFORM_ROLES[user.platformRole] || {
              title: user.platformRole,
              icon: '👤',
            };
            const isFounder = user.platformRole === 'PRINCIPAL_FOUNDER';

            return (
              <div
                key={user.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F5F8F6]/50 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#101915] to-[#1C2C25] text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
                    {roleInfo.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#17231E]">
                        {user.displayName}
                      </span>
                      {isFounder && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-700" />
                          Founder / Supreme
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          user.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#65766F] font-semibold mt-0.5">{user.email}</div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-[#E2F8EF] text-[#07885E] rounded-md">
                        {roleInfo.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                        {user.permissionScopes.includes('*')
                          ? 'Full Sovereign Access (*)'
                          : `${user.permissionScopes.length} Granular Scopes`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right">
                  {isPrincipalFounder() && !isFounder && user.status === 'ACTIVE' && (
                    <button
                      onClick={() => revokePlatformUser(user.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Suspend Access
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invitations Section */}
      <div className="bg-white rounded-3xl border border-[#DFE8E3] shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-[#17231E]">
              Pending Platform Invitations ({invitations.filter((i) => i.status === 'PENDING').length})
            </h3>
            <p className="text-xs text-[#65766F]">
              Secure tokens awaiting activation by prospective corporate executives or partners
            </p>
          </div>
        </div>

        {invitations.length === 0 ? (
          <div className="p-8 text-center bg-[#F5F8F6] rounded-2xl border border-dashed border-gray-200 text-xs text-[#65766F] font-semibold">
            No pending platform invitations. Click 'Invite Platform Personnel' above to provision access.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-[#17231E]">
                      {inv.displayName}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold">({inv.email})</span>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        inv.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : inv.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#65766F] mt-0.5 flex items-center gap-2">
                    <span>Role: <strong>{inv.platformRole}</strong></span>
                    <span>•</span>
                    <span className="font-mono text-gray-500">Token: {inv.token}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(inv.token)}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedToken === inv.token ? 'Copied!' : 'Copy Token'}</span>
                  </button>
                  {inv.status === 'PENDING' && (
                    <button
                      onClick={() => revokeInvitation(inv.id)}
                      className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                      title="Revoke Invitation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full text-[#17231E] shadow-2xl space-y-4 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E2F8EF] flex items-center justify-center text-[#0AB77F]">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#17231E]">
                    Provision Corporate Platform Account
                  </h3>
                  <p className="text-[11px] text-[#65766F]">
                    Issue secure clearance for corporate governance
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Full Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={inviteDisplayName}
                  onChange={(e) => setInviteDisplayName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Mugisha (Board Member)"
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. arthur@marscorporation.com"
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Platform Role / Clearance Tier *
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => handleRoleSelectChange(e.target.value as PlatformRoleKey)}
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                >
                  <option value="CO_FOUNDER">⚡ Co-Founder (Strategic Governance)</option>
                  <option value="CORPORATE_ADMIN">🏢 Corporate Administrator</option>
                  <option value="BOARD">🏛️ Board Member (Governance Oversight)</option>
                  <option value="INVESTOR">📈 Investor (Financial Metrics / ARR)</option>
                  <option value="GOVERNMENT">⚖️ Government Regulatory Partner</option>
                  <option value="PLATFORM_ADMIN">🛠️ Platform Operations Admin</option>
                  <option value="PRODUCT_ADMIN">📦 Product Line Administrator</option>
                  <option value="FINANCE_ADMIN">💰 Corporate Finance Administrator</option>
                  <option value="SECURITY_ADMIN">🛡️ Security & Audit Officer</option>
                </select>
              </div>

              {/* Scopes checkboxes */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-[#65766F] uppercase tracking-wider">
                  Permission Scopes ({selectedScopes.length} selected):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-[#F5F8F6] rounded-2xl border border-gray-200 text-xs">
                  {AVAILABLE_SCOPES.map((sc) => {
                    const isChecked = selectedScopes.includes(sc.key);
                    return (
                      <label
                        key={sc.key}
                        className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-white border-[#0AB77F] text-[#17231E] font-bold shadow-xs'
                            : 'border-transparent text-gray-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleScopeToggle(sc.key)}
                          className="accent-[#0AB77F] w-4 h-4 rounded"
                        />
                        <span className="text-[11px] leading-tight">{sc.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#65766F] rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#101915] hover:bg-[#17231E] text-white rounded-xl text-xs font-extrabold cursor-pointer shadow-xs"
                >
                  Generate Invitation Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
