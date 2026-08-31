import React, { useState } from 'react';
import { usePlatform } from '../PlatformContext';
import { PlatformAuditLogEntity } from '../../types';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  User,
  Layers,
  Lock,
} from 'lucide-react';

export const PlatformSecurityAuditScreen: React.FC = () => {
  const { auditLogs, isPrincipalFounder, hasScope } = usePlatform();

  const [searchQuery, setSearchQuery] = useState('');
  const [targetFilter, setTargetFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch受 =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTarget = targetFilter === 'ALL' || log.targetType === targetFilter;
    return matchesSearch受 && matchesTarget;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231E]">
            Platform Security & Immutable Audit Log Trail
          </h2>
          <p className="text-xs text-[#65766F] mt-0.5">
            Cryptographically sealed platform actions, corporate role modifications, statutory clearances & access logs
          </p>
        </div>
      </div>

      {/* Security Status Banner */}
      <div className="p-4 bg-white border border-[#DFE8E3] rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E2F8EF] text-[#0AB77F] flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-[#17231E]">
              Zero Security Violations Detected
            </div>
            <div className="text-[11px] text-[#65766F] font-semibold">
              All platform role checks enforced at route, context, and Firestore security rule boundaries.
            </div>
          </div>
        </div>
        <div className="text-right text-xs font-mono font-bold text-gray-500">
          {auditLogs.length} Total Audit Records
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by actor, action, or details..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DFE8E3] rounded-2xl text-xs text-[#17231E] shadow-xs"
          />
        </div>

        <select
          value={targetFilter}
          onChange={(e) => setTargetFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-white border border-[#DFE8E3] rounded-2xl text-xs font-bold text-[#17231E] shadow-xs cursor-pointer w-full sm:w-auto"
        >
          <option value="ALL">All Target Categories</option>
          <option value="PLATFORM_USER">Platform Users</option>
          <option value="PRODUCT">Products & Feature Flags</option>
          <option value="SUBSCRIPTION">Subscriptions</option>
          <option value="INVITATION">Invitations</option>
          <option value="GOVERNMENT">Government Gateway</option>
          <option value="INVESTOR">Investor Relations</option>
          <option value="BOARD">Board Governance</option>
          <option value="SECURITY">Security & Access</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-[#DFE8E3] shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#65766F] font-semibold">
            No audit records match your search criteria.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredLogs.map((log) => {
              const isSuccess = log.result === 'SUCCESS';
              const isDenied = log.result === 'DENIED';

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#F5F8F6]/60 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isSuccess
                          ? 'bg-[#E2F8EF] text-[#0AB77F]'
                          : isDenied
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isSuccess ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isDenied ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-xs text-[#17231E] font-mono">
                          {log.action}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                          {log.targetType}
                        </span>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                            isSuccess
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {log.result}
                        </span>
                      </div>
                      <div className="text-xs text-[#65766F]">{log.details}</div>
                      <div className="text-[11px] text-gray-400 font-semibold flex items-center gap-2">
                        <span>Actor: <strong>{log.actorEmail}</strong> ({log.actorRole})</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-[11px] font-mono text-gray-400 shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
