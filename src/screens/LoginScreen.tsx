import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { UserRoleKey, USER_ROLES } from '../types';
import {
  Building2,
  ShieldCheck,
  Smartphone,
  Mail,
  Lock,
  ArrowRight,
  UserCheck,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface LoginScreenProps {
  onNavigate: (route: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const { login, register } = useMars();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRoleKey>('LANDLORD');

  // Login form
  const [identifier, setIdentifier] = useState('landlord@marscashflow.ug');
  const [pin, setPin] = useState('1234');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regOrg, setRegOrg] = useState('');
  const [regPin, setRegPin] = useState('1234');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const success = login(identifier, pin, selectedRole);
    if (success) {
      onNavigate(USER_ROLES[selectedRole].defaultRoute);
    } else {
      setLoginError('Invalid credentials. Please verify your phone/email.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPhone) {
      setLoginError('Please provide your name and Uganda phone number.');
      return;
    }

    const success = register({
      displayName: regName,
      phone: regPhone,
      email: regEmail || `${regName.toLowerCase().replace(/\s+/g, '')}@marscashflow.ug`,
      role: selectedRole,
      orgName: regOrg,
    });

    if (success) {
      onNavigate(USER_ROLES[selectedRole].defaultRoute);
    }
  };

  const quickLoginAs = (roleKey: UserRoleKey) => {
    setSelectedRole(roleKey);
    const idMap: Record<UserRoleKey, string> = {
      LANDLORD: 'landlord@marscashflow.ug',
      MANAGER: 'caretaker@marscashflow.ug',
      TENANT: 'tenant@marscashflow.ug',
      SERVICE_PROVIDER: 'contractor@marscashflow.ug',
      MULTIROLE: 'landlord@marscashflow.ug',
    };
    login(idMap[roleKey], '1234', roleKey);
    onNavigate(USER_ROLES[roleKey].defaultRoute);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#101915] via-[#17231E] to-[#101915] text-white flex flex-col justify-between p-4 sm:p-6 select-none">
      <div className="max-w-md w-full mx-auto my-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0AB77F] to-[#07885E] items-center justify-center shadow-xl shadow-emerald-950/50">
            <span className="font-black text-3xl text-white">M</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              MARS CASHFLOW
            </h1>
            <p className="text-xs font-bold tracking-widest text-[#62E3B6] uppercase mt-1">
              Uganda Real Estate & Rent Ledger
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl text-[#17231E] border border-white/10 space-y-5">
          {/* Tab Switcher */}
          <div className="flex bg-[#F5F8F6] p-1 rounded-2xl border border-[#DFE8E3]">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-[#101915] text-white shadow-xs'
                  : 'text-[#65766F] hover:text-[#17231E]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-[#101915] text-white shadow-xs'
                  : 'text-[#65766F] hover:text-[#17231E]'
              }`}
            >
              Create Account
            </button>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[#D93838] text-xs font-semibold">
              {loginError}
            </div>
          )}

          {/* Role selector chips */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#65766F] uppercase tracking-wider mb-2">
              Select Workspace Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['LANDLORD', 'MANAGER', 'TENANT', 'SERVICE_PROVIDER'] as UserRoleKey[]).map((rKey) => {
                const role = USER_ROLES[rKey];
                const isChosen = selectedRole === rKey;
                return (
                  <button
                    key={rKey}
                    type="button"
                    onClick={() => setSelectedRole(rKey)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      isChosen
                        ? 'border-[#0AB77F] bg-[#E2F8EF] text-[#17231E] font-bold shadow-xs'
                        : 'border-[#DFE8E3] bg-white text-[#65766F] hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{role.icon}</span>
                    <div className="leading-tight">
                      <div className="text-xs font-bold">{role.title.split('/')[0]}</div>
                      <div className="text-[9px] text-[#65766F] truncate">{rKey.toLowerCase()}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#17231E] mb-1">
                  Email or Uganda Phone (077/070...)
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="0772 123 456 or name@domain.ug"
                    className="w-full pl-10 pr-3 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl font-semibold text-[#17231E] focus:bg-white focus:outline-hidden focus:border-[#0AB77F]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#17231E] mb-1">
                  4-Digit Security PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    className="w-full pl-10 pr-3 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl font-semibold text-[#17231E] focus:bg-white focus:outline-hidden focus:border-[#0AB77F]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0AB77F] hover:bg-[#07885E] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Enter {USER_ROLES[selectedRole].title.split('/')[0]} Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#17231E] mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Ronald Mugerwa"
                  className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl font-semibold text-[#17231E] focus:bg-white focus:outline-hidden focus:border-[#0AB77F]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#17231E] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0772 000 111"
                    className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl font-semibold text-[#17231E] focus:bg-white focus:outline-hidden focus:border-[#0AB77F]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#17231E] mb-1">Estate / Org Name</label>
                  <input
                    type="text"
                    value={regOrg}
                    onChange={(e) => setRegOrg(e.target.value)}
                    placeholder="Mugerwa Properties"
                    className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl font-semibold text-[#17231E] focus:bg-white focus:outline-hidden focus:border-[#0AB77F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#17231E] mb-1">Security PIN</label>
                <input
                  type="password"
                  maxLength={6}
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value)}
                  placeholder="1234"
                  className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl font-semibold text-[#17231E] focus:bg-white focus:outline-hidden focus:border-[#0AB77F]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0AB77F] hover:bg-[#07885E] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Register & Open Ledger</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Instant Roles */}
          <div className="pt-2 border-t border-[#DFE8E3] text-center space-y-2">
            <div className="text-[10px] font-bold text-[#65766F] uppercase tracking-wider">
              ⚡ Quick Demo 1-Click Launchers
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => quickLoginAs('LANDLORD')}
                className="p-1.5 rounded-lg bg-[#F5F8F6] hover:bg-[#E2F8EF] border border-[#DFE8E3] text-[11px] font-bold text-[#17231E] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>👑</span> Owner (Landlord)
              </button>
              <button
                type="button"
                onClick={() => quickLoginAs('MANAGER')}
                className="p-1.5 rounded-lg bg-[#F5F8F6] hover:bg-[#E2F8EF] border border-[#DFE8E3] text-[11px] font-bold text-[#17231E] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>👨🏾‍💼</span> Caretaker Hub
              </button>
              <button
                type="button"
                onClick={() => quickLoginAs('TENANT')}
                className="p-1.5 rounded-lg bg-[#F5F8F6] hover:bg-[#E2F8EF] border border-[#DFE8E3] text-[11px] font-bold text-[#17231E] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>👤</span> Tenant Portal
              </button>
              <button
                type="button"
                onClick={() => quickLoginAs('SERVICE_PROVIDER')}
                className="p-1.5 rounded-lg bg-[#F5F8F6] hover:bg-[#E2F8EF] border border-[#DFE8E3] text-[11px] font-bold text-[#17231E] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>🛠️</span> Contractor Jobs
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-[#65766F] font-semibold space-y-1">
          <p>Bank-Grade Security • Mobile Money (MTN/Airtel) Verified</p>
          <p className="text-[10px] text-[#65766F]/80">MARS Cashflow 2.0 • Kampala, Uganda</p>
        </div>
      </div>
    </div>
  );
};
