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
  CheckCircle2,
  PhoneCall
} from 'lucide-react';

interface LoginScreenProps {
  onNavigate: (route: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const { login, register, language, setLanguage, t } = useMars();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRoleKey>('LANDLORD');

  // Login form
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regProperty, setRegProperty] = useState('');
  const [regPin, setRegPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!identifier.includes('@') || pin.length < 8) {
      setLoginError('Enter a valid email address and password of at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    const success = await login(identifier, pin);
    setIsSubmitting(false);
    if (success) {
      onNavigate(USER_ROLES[selectedRole].defaultRoute);
    } else {
      setLoginError('Invalid email or password.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPhone) {
      setLoginError('Please provide your legal name and Uganda phone number.');
      return;
    }

    if (!regEmail.includes('@') || regPin.length < 8) {
      setLoginError('Email and a password of at least 8 characters are required.');
      return;
    }
    setIsSubmitting(true);
    const success = await register({
      displayName: regName,
      phone: regPhone,
      email: regEmail,
      password: regPin,
      role: selectedRole,
      propertyName: regProperty,
    });

    setIsSubmitting(false);
    if (success) {
      onNavigate(USER_ROLES[selectedRole].defaultRoute);
    } else {
      setLoginError('Registration could not be completed. Check your details and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#101915] via-[#17231E] to-[#101915] text-white flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top language selector */}
      <div className="max-w-md w-full mx-auto flex justify-end">
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl text-xs font-black">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              language === 'en' ? 'bg-[#0AB77F] text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('lg')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              language === 'lg' ? 'bg-[#0AB77F] text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            LG (Luganda)
          </button>
        </div>
      </div>

      <div className="max-w-md w-full mx-auto my-auto space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0AB77F] to-[#07885E] items-center justify-center shadow-xl shadow-emerald-950/50">
            <span className="font-black text-3xl text-white">M</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">MARS CASHFLOW</h1>
            <p className="text-xs font-bold tracking-widest text-[#62E3B6] uppercase mt-0.5">
              Uganda Real Estate & Rent Ledger
            </p>
          </div>
        </div>

        {/* 2 Months Free Trial Promo Pill */}
        <div className="bg-gradient-to-r from-emerald-950/80 to-emerald-900/60 border border-[#0AB77F]/50 rounded-2xl p-3.5 text-center space-y-1 shadow-lg">
          <div className="flex items-center justify-center gap-2 text-xs font-black text-[#62E3B6]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2-MONTH FREE TRIAL INCLUDED</span>
          </div>
          <p className="text-[11px] text-gray-300">
            Full unrestricted access for your first 60 days. Subscription begins from month 3.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl text-[#17231E] border border-white/10 space-y-5">
          {/* Tab Switcher */}
          <div className="flex bg-[#F5F8F6] p-1 rounded-2xl border border-[#DFE8E3]">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === 'login' ? 'bg-[#101915] text-white shadow-xs' : 'text-[#65766F] hover:text-[#17231E]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === 'register' ? 'bg-[#101915] text-white shadow-xs' : 'text-[#65766F] hover:text-[#17231E]'
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

          {/* Role Picker for Context */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-[#17231E]">
              Account Working Authority
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['LANDLORD', 'MANAGER', 'TENANT', 'SERVICE_PROVIDER'] as UserRoleKey[]).map((roleKey) => {
                const isSelected = selectedRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => setSelectedRole(roleKey)}
                    className={`py-2 px-3 rounded-xl border text-xs font-extrabold transition-all cursor-pointer text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#E2F8EF] border-[#0AB77F] text-[#0AB77F]'
                        : 'bg-[#F5F8F6] border-[#DFE8E3] text-[#65766F] hover:bg-gray-100'
                    }`}
                  >
                    <span>{USER_ROLES[roleKey].title.split('/')[0]}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#0AB77F]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[#17231E] mb-1">
                  Phone Number or Email
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 0772 123 456 or email"
                    className="w-full pl-9 pr-4 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#17231E] mb-1">
                  4-Digit Security PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    className="w-full pl-9 pr-4 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0AB77F] hover:bg-[#07885E] active:scale-[0.98] text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Sign In to {USER_ROLES[selectedRole].title.split('/')[0]}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-[#17231E] mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Dr. Michael Ssempa"
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#17231E] mb-1">
                  Uganda Phone Number (MoMo Enabled) *
                </label>
                <input
                  type="text"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="e.g. 0772 123 456"
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#17231E] mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. owner@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                />
              </div>

              {selectedRole === 'LANDLORD' && (
                <div>
                  <label className="block text-xs font-extrabold text-[#17231E] mb-1">
                    First Property / Estate Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={regProperty}
                    onChange={(e) => setRegProperty(e.target.value)}
                    placeholder="e.g. Kampala Heights Apartments"
                    className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#0AB77F] hover:bg-[#07885E] active:scale-[0.98] text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Start 2-Month Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Security badge */}
        <div className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#0AB77F]" />
          <span>Secured with Uganda Real Estate Ledger Integrity</span>
        </div>
      </div>
    </div>
  );
};
