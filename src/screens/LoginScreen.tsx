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
  PhoneCall,
  Eye,
  EyeOff
} from 'lucide-react';

interface LoginScreenProps {
  onNavigate: (route: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const { login, googleLogin, completeGoogleOnboarding, register, currentUser, language, setLanguage, t } = useMars();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const selectedRole: UserRoleKey = 'LANDLORD';

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
  const [regPinConfirmation, setRegPinConfirmation] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmation, setShowRegConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleSetup, setGoogleSetup] = useState(false);
  const [googleRole, setGoogleRole] = useState<UserRoleKey>('LANDLORD');

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
      onNavigate(USER_ROLES[currentUser?.primaryRole || selectedRole].defaultRoute);
    } else {
      setLoginError('Invalid email or password.');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoginError(null);
    setIsSubmitting(true);
    const result = await googleLogin();
    setIsSubmitting(false);
    if (result === 'NEW') {
      setGoogleSetup(true);
      setLoginError(null);
      setActiveTab('register');
    } else if (result === 'EXISTING') {
      onNavigate('dashboard');
  } else if (result.startsWith('ERROR:')) {
    const reason = result.slice('ERROR:'.length);
    const messages: Record<string, string> = {
      cancelled: 'Google sign-in was cancelled.',
      'popup-blocked': 'Your browser blocked the Google sign-in window. Please allow pop-ups and try again.',
      'unauthorized-domain': 'This preview domain is not authorized for Google sign-in. Please use the deployed MARS domain or contact an administrator.',
      configuration: 'Google sign-in is not configured for this MARS environment.',
      network: 'Google sign-in could not connect. Check your internet connection and try again.',
      'invalid-credential': 'Google could not verify this account. Please try again.',
      'account-exists': 'This email already uses another sign-in method. Sign in with email/password first to link Google safely.',
      unknown: 'Google sign-in could not be completed. Please try again.',
    };
    setLoginError(messages[reason] ?? messages.unknown);
  } else {
    setLoginError('Google sign-in could not be completed. Please try again.');
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
    if (regPin !== regPinConfirmation) {
      setLoginError('Passwords do not match.');
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
      onNavigate(USER_ROLES[currentUser?.primaryRole || selectedRole].defaultRoute);
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

          <button type="button" onClick={handleGoogleSignIn} disabled={isSubmitting} className="w-full py-3 border border-[#DFE8E3] bg-white hover:bg-[#F5F8F6] text-[#17231E] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60">
            <span className="font-black text-base">G</span>
            <span>Continue with Google</span>
          </button>
          <div className="flex items-center gap-3 text-[10px] font-bold text-[#8A9992]"><span className="h-px flex-1 bg-[#DFE8E3]" /><span>OR USE EMAIL</span><span className="h-px flex-1 bg-[#DFE8E3]" /></div>

          {googleSetup && (
            <div className="rounded-2xl border border-[#BFE9D8] bg-[#F0FBF6] p-4 space-y-3">
              <div><p className="text-sm font-black text-[#17231E]">Complete your MARS account</p><p className="text-xs text-[#65766F] mt-1">Choose your role. Manager and Tenant access requires an assignment or invitation.</p></div>
              <div className="grid grid-cols-3 gap-2">
                {(['LANDLORD', 'MANAGER', 'TENANT'] as UserRoleKey[]).map((role) => <button key={role} type="button" onClick={() => role === 'LANDLORD' && setGoogleRole(role)} disabled={role !== 'LANDLORD'} className={`rounded-xl border px-2 py-2 text-[10px] font-black ${googleRole === role ? 'border-[#0AB77F] bg-[#DDF7EB] text-[#07885E]' : 'border-[#DFE8E3] text-[#65766F]'}`}>{role === 'LANDLORD' ? 'Landlord' : role === 'MANAGER' ? 'Manager' : 'Tenant'}</button>)}
              </div>
              <button type="button" disabled={isSubmitting} onClick={async () => { setIsSubmitting(true); const ok = await completeGoogleOnboarding(googleRole); setIsSubmitting(false); if (ok) onNavigate(USER_ROLES[googleRole].defaultRoute); else setLoginError('Account setup could not be completed.'); }} className="w-full rounded-xl bg-[#0AB77F] py-2.5 text-xs font-black text-white disabled:opacity-60">Continue with selected role</button>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[#17231E] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#17231E] mb-1">
Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter your password"
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
Email Address *
                </label>
                <input
                  type="email"
                  required
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

              <div>
                <label className="block text-xs font-extrabold text-[#17231E] mb-1">Password *</label>
                <div className="relative">
                  <input type={showRegPassword ? 'text' : 'password'} required minLength={8} autoComplete="new-password" value={regPin} onChange={(e) => setRegPin(e.target.value)} placeholder="Create a secure password" className="w-full px-3.5 py-2.5 pr-10 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]" />
                  <button type="button" aria-label={showRegPassword ? 'Hide password' : 'Show password'} onClick={() => setShowRegPassword((visible) => !visible)} className="absolute right-3 top-2.5 text-gray-400 cursor-pointer">{showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#17231E] mb-1">Confirm Password *</label>
                <div className="relative">
                  <input type={showRegConfirmation ? 'text' : 'password'} required minLength={8} autoComplete="new-password" value={regPinConfirmation} onChange={(e) => setRegPinConfirmation(e.target.value)} placeholder="Re-enter your password" className="w-full px-3.5 py-2.5 pr-10 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]" />
                  <button type="button" aria-label={showRegConfirmation ? 'Hide confirmation' : 'Show confirmation'} onClick={() => setShowRegConfirmation((visible) => !visible)} className="absolute right-3 top-2.5 text-gray-400 cursor-pointer">{showRegConfirmation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0AB77F] hover:bg-[#07885E] active:scale-[0.98] text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Create Free Account</span>
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
