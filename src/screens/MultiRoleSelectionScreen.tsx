import React from 'react';
import { useMars } from '../context/MarsContext';
import { USER_ROLES, UserRoleKey } from '../types';
import {
  ShieldCheck,
  Building2,
  Briefcase,
  UserCheck,
  Wrench,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface MultiRoleSelectionScreenProps {
  onNavigate: (route: string) => void;
}

export const MultiRoleSelectionScreen: React.FC<MultiRoleSelectionScreenProps> = ({
  onNavigate,
}) => {
  const { currentUser, switchWorkspace } = useMars();

  const handleRoleSelect = (roleKey: UserRoleKey) => {
    const role = USER_ROLES[roleKey];
    switchWorkspace(roleKey, role.title);
    onNavigate(role.defaultRoute);
  };

  const roleKeys: UserRoleKey[] = ['LANDLORD', 'MANAGER', 'TENANT'];

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto px-4 sm:px-6 pt-4">
      {/* Title */}
      <div className="text-center space-y-2 max-w-lg mx-auto">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-[#0AB77F] items-center justify-center text-2xl text-white shadow-md">
          🔀
        </div>
        <h1 className="text-2xl font-black text-[#17231E]">Multi-Role Workspace Selector</h1>
        <p className="text-xs text-[#65766F]">
          Switch perspectives to test the complete property management ecosystem
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roleKeys.map((key) => {
          const role = USER_ROLES[key];
          const isCurrent = currentUser?.primaryRole === key;

          return (
            <div
              key={key}
              onClick={() => handleRoleSelect(key)}
              className={`rounded-3xl p-6 border transition-all cursor-pointer space-y-4 flex flex-col justify-between ${
                isCurrent
                  ? 'bg-[#101915] text-white border-[#0AB77F] shadow-xl ring-2 ring-[#0AB77F]/50'
                  : 'bg-white text-[#17231E] border-[#DFE8E3] hover:border-[#0AB77F] shadow-sm'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#0AB77F]/20 flex items-center justify-center text-2xl">
                    {role.icon}
                  </div>
                  {isCurrent && (
                    <span className="px-3 py-1 bg-[#0AB77F] text-white text-[11px] font-black rounded-full">
                      ACTIVE WORKSPACE
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-black tracking-tight">{role.title}</h3>
                  <p
                    className={`text-xs mt-1 font-semibold ${
                      isCurrent ? 'text-[#9FB2A9]' : 'text-[#65766F]'
                    }`}
                  >
                    {role.subtitle}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider block ${
                      isCurrent ? 'text-[#62E3B6]' : 'text-[#0AB77F]'
                    }`}
                  >
                    Included Modules & Capabilities:
                  </span>
                  <ul className="space-y-1 text-xs">
                    {key === 'LANDLORD' && (
                      <>
                        <li>• Estate Yield & Net Cashflow Analysis</li>
                        <li>• Bank-grade PDF Statements & Export</li>
                        <li>• Debtor Overdue Arrears Notifications</li>
                        <li>• Budget Allocation & Variance Caps</li>
                      </>
                    )}
                    {key === 'MANAGER' && (
                      <>
                        <li>• Rapid Rent Recording & Digital Receipts</li>
                        <li>• New Tenant Onboarding & Intake</li>
                        <li>• Work Order Dispatch to Artisans</li>
                        <li>• Offline Room SQLite & Cloud Sync</li>
                      </>
                    )}
                    {key === 'TENANT' && (
                      <>
                        <li>• Rent Balance & Payment Receipts Archive</li>
                        <li>• 1-Click Mobile Money (MTN/Airtel) Payments</li>
                        <li>• Submit Direct Repair Tickets & Photos</li>
                        <li>• Management Help Desk Direct Dial</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              <div
                className={`pt-4 border-t flex items-center justify-between font-extrabold text-xs ${
                  isCurrent ? 'border-[#263D33] text-[#62E3B6]' : 'border-[#DFE8E3] text-[#0AB77F]'
                }`}
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
