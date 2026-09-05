import React, { useState } from 'react';
import { usePlatform } from '../PlatformContext';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Crown,
  Sparkles,
  Building,
  Eye,
  EyeOff,
} from 'lucide-react';

interface PlatformLoginProps {
  onReturnToCashflow: () => void;
}

export const PlatformLoginScreen: React.FC<PlatformLoginProps> = ({ onReturnToCashflow }) => {
  const { platformLogin, acceptInvitation, isLoading } = usePlatform();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'INVITATION'>('LOGIN');

  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Invitation form
  const [invToken, setInvToken] = useState('');
  const [invDisplayName, setInvDisplayName] = useState('');
  const [invPassword, setInvPassword] = useState('');
  const [showInvPassword, setShowInvPassword] = useState(false);
  const [invSuccessMsg, setInvSuccessMsg] = useState<string | null>(null);

  const handleLoginSubmit申 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) return;

    const res = await platformLogin(email, password);
    if (!res.success) {
      setErrorMsg(res.message || 'Corporate authentication failed.');
    }
  };

  const handleInvitationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!invToken || !invPassword) return;

    const res = await acceptInvitation(invToken.trim(), invPassword, invDisplayName.trim());
    if (res.success) {
      setInvSuccessMsg('Platform account activated successfully! Logging in...');
    } else {
      setErrorMsg(res.message || 'Invitation activation failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#090D0B] flex flex-col justify-center items-center p-4 text-[#F5F8F6] relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#0AB77F]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top back button */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 relative z-10">
        <button
          onClick={onReturnToCashflow}
          className="flex items-center gap-1.5 text-xs text-[#A1B8AE] hover:text-white font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to MARS Cashflow Customer App</span>
        </button>
        <span className="text-[10px] font-mono text-gray-500 uppercase">
          SECURE PORT 3000 / PLATFORM HQ
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#101915] border border-[#0AB77F]/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#0AB77F] to-[#07885E] flex items-center justify-center shadow-lg shadow-[#0AB77F]/20">
            <span className="text-white font-black text-2xl tracking-tighter">M</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              MARS PLATFORM HQ
            </h1>
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#62E3B6] font-bold mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Corporate Sovereign Control Plane</span>
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-[#17231E] p-1 rounded-2xl border border-white/5 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('LOGIN');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'LOGIN'
                ? 'bg-[#0AB77F] text-white shadow-xs'
                : 'text-[#A1B8AE] hover:text-white'
            }`}
          >
            Corporate Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('INVITATION');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'INVITATION'
                ? 'bg-[#0AB77F] text-white shadow-xs'
                : 'text-[#A1B8AE] hover:text-white'
            }`}
          >
            Redeem Invitation
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {invSuccessMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-[#62E3B6] rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{invSuccessMsg}</span>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'LOGIN' ? (
          <form onSubmit={handleLoginSubmit申} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#A1B8AE] mb-1.5">
                Corporate Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@marscorporation.com"
                className="w-full px-4 py-3 bg-[#17231E] border border-[#2D3E35] focus:border-[#0AB77F] rounded-2xl text-xs font-medium text-white placeholder-gray-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A1B8AE] mb-1.5">
                Master Security Key / Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="platform-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-4 pr-12 py-3 bg-[#17231E] border border-[#2D3E35] focus:border-[#0AB77F] rounded-2xl text-xs font-medium text-white placeholder-gray-500 focus:outline-none transition-colors"
                />
                <button
                  id="platform-password-toggle-btn"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white active:scale-90 transition-all rounded-xl focus:outline-none cursor-pointer touch-manipulation z-10"
                >
                  {showPassword ? (
                    <EyeOff className="w-4.5 h-4.5 text-[#0AB77F]" />
                  ) : (
                    <Eye className="w-4.5 h-4.5 text-gray-400 hover:text-gray-200" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-[#0AB77F] to-[#07885E] hover:opacity-95 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-[#0AB77F]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Verifying Corporate Credentials...' : 'Authenticate Platform Access'}
            </button>
          </form>
        ) : (
          /* Redeem Invitation Form */
          <form onSubmit={handleInvitationSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#A1B8AE] mb-1.5">
                Invitation Token *
              </label>
              <input
                type="text"
                required
                value={invToken}
                onChange={(e) => setInvToken(e.target.value)}
                placeholder="inv_..."
                className="w-full px-4 py-3 bg-[#17231E] border border-[#2D3E35] focus:border-[#0AB77F] rounded-2xl text-xs font-mono font-bold text-[#62E3B6] placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A1B8AE] mb-1.5">
                Your Full Name / Corporate Title
              </label>
              <input
                type="text"
                value={invDisplayName}
                onChange={(e) => setInvDisplayName(e.target.value)}
                placeholder="e.g. Co-Founder / Director"
                className="w-full px-4 py-3 bg-[#17231E] border border-[#2D3E35] focus:border-[#0AB77F] rounded-2xl text-xs font-medium text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A1B8AE] mb-1.5">
                Set Account Master Password *
              </label>
              <div className="relative flex items-center">
                <input
                  id="platform-inv-password-input"
                  type={showInvPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={invPassword}
                  onChange={(e) => setInvPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-4 pr-12 py-3 bg-[#17231E] border border-[#2D3E35] focus:border-[#0AB77F] rounded-2xl text-xs font-medium text-white placeholder-gray-500 focus:outline-none"
                />
                <button
                  id="platform-inv-password-toggle-btn"
                  type="button"
                  onClick={() => setShowInvPassword(!showInvPassword)}
                  aria-label={showInvPassword ? 'Hide password' : 'Show password'}
                  title={showInvPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white active:scale-90 transition-all rounded-xl focus:outline-none cursor-pointer touch-manipulation z-10"
                >
                  {showInvPassword ? (
                    <EyeOff className="w-4.5 h-4.5 text-[#0AB77F]" />
                  ) : (
                    <Eye className="w-4.5 h-4.5 text-gray-400 hover:text-gray-200" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-[#0AB77F] to-[#07885E] hover:opacity-95 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-[#0AB77F]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Activating Credentials...' : 'Redeem & Activate Account'}
            </button>
          </form>
        )}

        {/* Informational Security Notice */}
        <div className="pt-4 border-t border-white/10 text-center space-y-1.5">
          <p className="text-[11px] text-[#A1B8AE]">
            Customer Accounts (Landlord, Caretaker, Tenant) are strictly managed via MARS Cashflow.
          </p>
          <button
            onClick={onReturnToCashflow}
            className="text-xs font-bold text-[#62E3B6] hover:underline cursor-pointer"
          >
            Go to MARS Cashflow Customer Portal →
          </button>
        </div>
      </div>
    </div>
  );
};
