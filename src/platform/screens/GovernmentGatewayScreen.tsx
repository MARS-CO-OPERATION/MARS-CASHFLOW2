import React, { useState } from 'react';
import { usePlatform } from '../PlatformContext';
import { GovernmentAccessEntity } from '../../types';
import {
  Scale,
  ShieldCheck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Trash2,
  Lock,
  Building,
  Globe,
  X,
} from 'lucide-react';

export const GovernmentGatewayScreen: React.FC = () => {
  const {
    governmentAccesses,
    authorizeGovernmentPartner,
    revokeGovernmentAccess,
    isPrincipalFounder,
    hasScope,
  } = usePlatform();

  const [showAuthorizeModal, setShowAuthorizeModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New government access form
  const [orgName, setOrgName] = useState('');
  const [department, setDepartment] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [jurisdiction, setJurisdiction] = useState('Republic of Uganda');
  const [scope, setScope] = useState<GovernmentAccessEntity['authorizedScope']>(
    'AGGREGATED_STATISTICAL_RENTAL_INDEX'
  );
  const [limits, setLimits] = useState(
    'Anonymized macro index summaries only. Strictly zero access to tenant or landlord personal identity data.'
  );

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !contactEmail) return;

    const res = await authorizeGovernmentPartner({
      organizationName: orgName.trim(),
      department: department.trim(),
      contactEmail: contactEmail.trim(),
      contactPerson: contactPerson.trim(),
      jurisdiction: jurisdiction.trim(),
      authorizedScope: scope,
      dataAccessLimits: limits.trim(),
      status: 'ACTIVE',
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    });

    if (res.success) {
      setShowAuthorizeModal(false);
      setOrgName('');
      setContactEmail('');
      setFeedback(`Authorized regulatory scope issued for ${orgName}.`);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleRevoke = async (id: string) => {
    const res = await revokeGovernmentAccess(id);
    if (res.success) {
      setFeedback('Government access authorization revoked.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231E]">
            MARS Sovereign Government & Regulatory Gateway
          </h2>
          <p className="text-xs text-[#65766F] mt-0.5">
            Scoped statutory compliance data access for authorized public bodies (URA, KCCA, Ministry of Housing)
          </p>
        </div>
        {(isPrincipalFounder() || hasScope('platform.government.manage')) && (
          <button
            onClick={() => setShowAuthorizeModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#101915] hover:bg-[#17231E] text-white rounded-2xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#62E3B6]" />
            <span>Authorize Regulatory Agency</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[#0AB77F] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Statutory Protection Banner */}
      <div className="p-5 bg-gradient-to-r from-[#17231E] to-[#101915] text-white rounded-3xl border border-[#0AB77F]/30 shadow-md space-y-2">
        <div className="flex items-center gap-2 text-xs font-black text-[#62E3B6] uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-[#0AB77F]" />
          <span>Sovereign Privacy & Statutory Compliance Firewalls</span>
        </div>
        <p className="text-xs text-[#A1B8AE] leading-relaxed">
          MARS Corporation guarantees absolute citizen tenant privacy. Government integrations are restricted strictly to high-level statistical rental price indexes, housing density aggregates, and anonymous formalization rates. Direct inspection of private tenant names, phone numbers, or leases is strictly forbidden by cryptographic boundary.
        </p>
      </div>

      {/* Authorized Entities List */}
      <div className="bg-white rounded-3xl border border-[#DFE8E3] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#DFE8E3]">
          <h3 className="text-sm font-black text-[#17231E]">
            Authorized Public Regulatory Clearances ({governmentAccesses.length})
          </h3>
          <p className="text-xs text-[#65766F]">
            Legally bound data sharing protocols authorized by MARS Corporation Executive Council
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {governmentAccesses.map((gov) => (
            <div
              key={gov.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F5F8F6]/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E2F8EF] text-[#0AB77F] flex items-center justify-center font-bold text-lg shrink-0">
                  🏛️
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#17231E]">
                      {gov.organizationName}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        gov.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {gov.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 font-semibold">
                    {gov.department} • Contact: {gov.contactPerson} ({gov.contactEmail})
                  </div>
                  <div className="text-xs font-semibold text-[#0AB77F]">
                    Authorized Scope: <strong>{gov.authorizedScope}</strong>
                  </div>
                  <div className="text-[11px] text-[#65766F] italic bg-gray-50 p-2 rounded-xl border border-gray-100 mt-1 max-w-xl">
                    Limits: {gov.dataAccessLimits}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isPrincipalFounder() && gov.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleRevoke(gov.id)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Revoke Statutory Scope
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Authorize Modal */}
      {showAuthorizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full text-[#17231E] shadow-2xl space-y-4 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-sm text-[#17231E]">
                  Authorize Government Regulatory Agency
                </h3>
                <p className="text-[11px] text-[#65766F]">
                  Issue scoped statutory access clearance
                </p>
              </div>
              <button
                onClick={() => setShowAuthorizeModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAuthorize} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Agency / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Ministry of Lands, Housing and Urban Development"
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Department / Directorate
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Department of Housing Statistics"
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17231E] mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Undersecretary"
                    className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17231E] mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. housing@lands.go.ug"
                    className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Authorized Regulatory Scope *
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                >
                  <option value="AGGREGATED_STATISTICAL_RENTAL_INDEX">
                    Aggregated Statistical Rental Index
                  </option>
                  <option value="URBAN_HOUSING_DENSITY">
                    Urban Housing Density & Municipal Demographics
                  </option>
                  <option value="RENTAL_TAX_COMPLIANCE_SUMMARY">
                    Rental Income Tax & Formalization Summary
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Data Access Boundary & Limitations
                </label>
                <textarea
                  rows={2}
                  value={limits}
                  onChange={(e) => setLimits(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs text-[#17231E]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuthorizeModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#65766F] rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#101915] hover:bg-[#17231E] text-white rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  Issue Clearance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
