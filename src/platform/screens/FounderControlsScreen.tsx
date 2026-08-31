import React, { useState } from 'react';
import { usePlatform } from '../PlatformContext';
import {
  Crown,
  ShieldAlert,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Database,
  Lock,
} from 'lucide-react';

export const FounderControlsScreen: React.FC = () => {
  const { isPrincipalFounder, platformUser, recordPlatformAudit } = usePlatform();

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [readOnlyLock, setReadOnlyLock] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isPrincipalFounder()) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-red-200 text-xs text-red-700 font-bold space-y-2">
        <ShieldAlert className="w-8 h-8 mx-auto text-red-600" />
        <div>ACCESS RESTRICTED: Principal Founder Sovereign Authority Required</div>
        <p className="text-gray-500 font-normal">
          This control suite is exclusively accessible by the Principal Founder / Owner of MARS Corporation.
        </p>
      </div>
    );
  }

  const handleToggleMaintenance = async () => {
    const nextState = !maintenanceMode;
    setMaintenanceMode(nextState);
    await recordPlatformAudit(
      'FOUNDER_MAINTENANCE_TOGGLE',
      'SYSTEM',
      'platform_core',
      `Maintenance mode set to ${nextState}`
    );
    setFeedback(`Ecosystem maintenance mode set to ${nextState ? 'ACTIVE' : 'INACTIVE'}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleToggleLockdown = async () => {
    const nextState = !readOnlyLock;
    setReadOnlyLock(nextState);
    await recordPlatformAudit(
      'FOUNDER_READONLY_LOCKDOWN',
      'SYSTEM',
      'platform_core',
      `Emergency read-only lockdown set to ${nextState}`
    );
    setFeedback(`Emergency read-only lockdown set to ${nextState ? 'ENGAGED' : 'DISENGAGED'}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-700" />
              Sovereign Founder Command
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231E] mt-1">
            MARS Corporation Executive Master Controls
          </h2>
          <p className="text-xs text-[#65766F] mt-0.5">
            Supreme system levers, emergency lockdowns & platform infrastructure integrity
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[#0AB77F] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Founder Profile Card */}
      <div className="bg-gradient-to-r from-[#101915] via-[#17231E] to-[#1C2C25] text-white p-6 rounded-3xl border border-[#0AB77F]/40 shadow-xl space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center text-2xl font-black shrink-0">
            👑
          </div>
          <div>
            <div className="text-xs font-extrabold text-[#62E3B6] uppercase tracking-wider">
              Principal Founder & Executive Chairman
            </div>
            <h3 className="text-lg sm:text-xl font-black">{platformUser?.displayName}</h3>
            <div className="text-xs text-gray-400 font-mono">{platformUser?.email}</div>
          </div>
        </div>
      </div>

      {/* Emergency Levers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Maintenance Toggle */}
        <div className="bg-white p-6 rounded-3xl border border-[#DFE8E3] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#17231E]">
                  Platform Maintenance Switch
                </h4>
                <p className="text-xs text-[#65766F]">
                  Temporarily display sovereign maintenance status to non-admin customers
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#F5F8F6] rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-[#17231E]">
              Current Status: {maintenanceMode ? 'ACTIVE (Locked)' : 'NORMAL OPERATION'}
            </span>
            <button
              onClick={handleToggleMaintenance}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                maintenanceMode
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {maintenanceMode ? 'Deactivate Maintenance' : 'Activate Maintenance'}
            </button>
          </div>
        </div>

        {/* Read-Only Emergency Lockdown */}
        <div className="bg-white p-6 rounded-3xl border border-[#DFE8E3] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-800 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#17231E]">
                  Emergency Read-Only Freeze
                </h4>
                <p className="text-xs text-[#65766F]">
                  Freeze all database writes in event of security audit or external incident
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#F5F8F6] rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-[#17231E]">
              Current Status: {readOnlyLock ? 'FROZEN' : 'WRITES ENABLED'}
            </span>
            <button
              onClick={handleToggleLockdown}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                readOnlyLock
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {readOnlyLock ? 'Disengage Freeze' : 'Engage Emergency Freeze'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
