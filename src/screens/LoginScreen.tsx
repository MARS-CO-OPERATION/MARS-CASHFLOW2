import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import {
  ShieldCheck,
  Smartphone,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  KeyRound,
  Sparkles
} from 'lucide-react';

interface LoginScreenProps {
  onNavigate: (route: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const { login, loginWithGoogle, register, sendPasswordReset, currentUser, language, setLanguage, t } = useMars();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Sign-in states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration states (Landlord only)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [propertyName, setPropertyName] = useState('');
  
  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // General processing states
  const [loadingState, setLoadingState] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Google Sign-In
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoadingState('Connecting with Google...');
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        onNavigate('landlord');
      } else if (res.message) {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Unable to connect with Google. Please try email sign-in or check your connection.');
    } finally {
      setLoadingState(null);
    }
  };

  // 2. Email Sign-In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setLoadingState('Signing you in...');
    try {
      const res = await login(cleanEmail, password);
      if (res.success) {
        onNavigate('landlord');
      } else {
        setErrorMessage(res.message || 'Invalid email or password. Please check your credentials.');
      }
    } catch {
      setErrorMessage('An error occurred while signing in. Please try again.');
    } finally {
      setLoadingState(null);
    }
  };

  // 3. Landlord Self-Registration
  const handleLandlordRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = regEmail.trim();

    if (!cleanName) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }
    if (!cleanPhone) {
      setErrorMessage('Please enter your Uganda phone number.');
      return;
    }
    if (!cleanEmail.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (regPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (regPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoadingState('Creating your Landlord account...');
    try {
      const res = await register({
        displayName: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        password: regPassword,
        role: 'LANDLORD',
        propertyName: propertyName.trim() || undefined,
      });

      if (res.success) {
        onNavigate('landlord');
      } else {
        setErrorMessage(res.message || 'Registration could not be completed. Please check your details.');
      }
    } catch {
      setErrorMessage('Account creation failed. Please check your internet connection.');
    } finally {
      setLoadingState(null);
    }
  };

  // 4. Password Reset Submission
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus(null);
    const cleanEmail = forgotEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setForgotStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setForgotLoading(true);
    try {
      const res = await sendPasswordReset(cleanEmail);
      setForgotStatus({
        type: 'success',
        message: res.message || 'If an account exists for this email address, password reset instructions have been sent.',
      });
    } catch {
      setForgotStatus({
        type: 'success',
        message: 'If an account exists for this email address, password reset instructions have been sent.',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101915] text-[#F5F8F6] flex flex-col justify-between p-4 sm:p-6 selection:bg-[#0AB77F] selection:text-white">
      {/* Top Bar: Language Selector */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-xs text-[#9FB2A9] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#0AB77F] animate-pulse"></span>
          <span>Uganda Production Server</span>
        </div>
        <div className="flex items-center gap-1 bg-[#17231E] p-1 rounded-xl border border-white/10 text-xs font-bold">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              language === 'en' ? 'bg-[#0AB77F] text-white shadow-xs' : 'text-[#9FB2A9] hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('lg')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              language === 'lg' ? 'bg-[#0AB77F] text-white shadow-xs' : 'text-[#9FB2A9] hover:text-white'
            }`}
          >
            LG (Luganda)
          </button>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0AB77F] to-[#07885E] items-center justify-center shadow-2xl shadow-emerald-950 border border-white/20">
            <span className="font-black text-3xl text-white tracking-tighter">M</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              MARS CASHFLOW
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-[#62E3B6] tracking-wide mt-1">
              Your rental property operating system.
            </p>
          </div>
        </div>

        {/* Auth Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl text-[#17231E] border border-gray-100 space-y-5">
          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-[#D93838] text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{errorMessage}</div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-600 font-bold ml-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Success Notice */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-[#0AB77F] text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{successMessage}</div>
            </div>
          )}

          {/* Primary Action: Google Authentication */}
          <div>
            <button
              type="button"
              disabled={!!loadingState}
              onClick={handleGoogleSignIn}
              className="w-full py-3.5 px-4 bg-white hover:bg-gray-50 active:scale-[0.99] border-2 border-[#DFE8E3] hover:border-[#0AB77F]/60 text-[#17231E] rounded-2xl text-xs sm:text-sm font-extrabold shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingState === 'Connecting with Google...' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0AB77F]" />
                  <span>Connecting with Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

          {/* Clean Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#DFE8E3] w-full"></div>
            <span className="bg-white px-3 text-[11px] font-black uppercase tracking-wider text-[#65766F] absolute">
              OR
            </span>
          </div>

          {/* Mode Switcher: Sign In vs Create Account */}
          <div className="flex bg-[#F5F8F6] p-1 rounded-2xl border border-[#DFE8E3]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-[#101915] text-white shadow-xs'
                  : 'text-[#65766F] hover:text-[#17231E]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-[#101915] text-white shadow-xs'
                  : 'text-[#65766F] hover:text-[#17231E]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* TAB 1: SIGN IN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleEmailSignIn} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-extrabold text-[#17231E] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="landlord@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#F5F8F6] border border-[#DFE8E3] rounded-2xl text-xs sm:text-sm font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-extrabold text-[#17231E]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotStatus(null);
                      setShowForgotModal(true);
                    }}
                    className="text-[11px] font-bold text-[#0AB77F] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password (min 8 chars)"
                    className="w-full pl-10 pr-11 py-3 bg-[#F5F8F6] border border-[#DFE8E3] rounded-2xl text-xs sm:text-sm font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!!loadingState}
                className="w-full py-3.5 bg-[#0AB77F] hover:bg-[#07885E] active:scale-[0.98] text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingState === 'Signing you in...' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing you in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to MARS</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: LANDLORD SELF-REGISTRATION FORM */}
          {activeTab === 'register' && (
            <div className="space-y-4 pt-1">
              {/* Landlord Self-Registration Rule Notice */}
              <div className="p-3 bg-[#E2F8EF] border border-[#0AB77F]/30 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-[#07885E] font-black text-xs">
                  <span>👑</span>
                  <span>Landlord Portfolio Registration</span>
                </div>
                <p className="text-[11px] text-[#263D33] leading-relaxed">
                  Only landlords self-register. Caretakers, managers, and tenants are provisioned directly from the Landlord dashboard.
                </p>
              </div>

              <form onSubmit={handleLandlordRegister} className="space-y-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#17231E] mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Hajji Musa Kigozi"
                    className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs sm:text-sm font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#17231E] mb-1">
                    Uganda Phone Number (MoMo Enabled) *
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0772 123 456 or +256 772 123456"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs sm:text-sm font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#17231E] mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="landlord@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs sm:text-sm font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#17231E] mb-1">
                    Password (min 8 characters) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Create strong password"
                      className="w-full pl-9 pr-10 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs sm:text-sm font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#17231E] mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-10 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs sm:text-sm font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#17231E] mb-1">
                    First Property / Estate Name (Optional)
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={propertyName}
                      onChange={(e) => setPropertyName(e.target.value)}
                      placeholder="e.g. Kampala Heights Apartments"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs sm:text-sm font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F] focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!!loadingState}
                  className="w-full py-3.5 bg-[#0AB77F] hover:bg-[#07885E] active:scale-[0.98] text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loadingState === 'Creating your Landlord account...' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating your account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Landlord Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Security badge & Corporate Portal */}
        <div className="text-center space-y-2">
          <div className="text-[11px] text-[#9FB2A9] flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0AB77F]" />
            <span>Secured with Uganda Real Estate Ledger Integrity & Firebase Auth</span>
          </div>

          <div className="pt-2 border-t border-[#DFE8E3]/60">
            <button
              onClick={() => onNavigate('platform_hq')}
              className="text-[11px] font-extrabold text-[#17231E] hover:text-[#0AB77F] inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>🏛️ MARS Corporation Executive or Partner? Access Platform HQ →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-[#17231E] shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#E2F8EF] flex items-center justify-center text-[#0AB77F]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#17231E]">Reset Password</h3>
                  <p className="text-[11px] text-[#65766F]">Receive reset instructions via email</p>
                </div>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-start gap-2 ${
                  forgotStatus.type === 'success'
                    ? 'bg-emerald-50 text-[#0AB77F] border border-emerald-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}
              >
                {forgotStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{forgotStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. landlord@example.com"
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#65766F] rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-2.5 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Email</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
