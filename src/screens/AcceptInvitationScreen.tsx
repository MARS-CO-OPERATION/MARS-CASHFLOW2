import React, { useState, useEffect } from 'react';
import { useMars } from '../context/MarsContext';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  User,
  Mail,
  Phone,
  ArrowRight,
  Loader2,
  Banknote,
  Receipt,
  Wrench,
  DollarSign
} from 'lucide-react';
import { ManagerInvitationEntity } from '../types';

interface AcceptInvitationScreenProps {
  inviteToken: string;
  onNavigate: (route: string) => void;
}

export const AcceptInvitationScreen: React.FC<AcceptInvitationScreenProps> = ({
  inviteToken,
  onNavigate,
}) => {
  const { managerInvitations, acceptManagerInvitation } = useMars();

  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState<ManagerInvitationEntity | null>(null);
  const [invitationStatus, setInvitationStatus] = useState<'LOADING' | 'VALID' | 'NOT_FOUND' | 'EXPIRED' | 'ACCEPTED'>('LOADING');

  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteToken) {
      setInvitationStatus('NOT_FOUND');
      return;
    }

    // Find invitation in local context or check status
    const match = managerInvitations.find((inv) => inv.token === inviteToken);
    if (match) {
      setInvitation(match);
      setDisplayName(match.name || match.managerName || '');
      if (match.status === 'ACCEPTED') {
        setInvitationStatus('ACCEPTED');
      } else if (match.status === 'REVOKED' || match.expiresAt < Date.now()) {
        setInvitationStatus('EXPIRED');
      } else {
        setInvitationStatus('VALID');
      }
    } else {
      // In case state hasn't populated yet, set valid with token and allow acceptance
      setInvitationStatus('VALID');
    }
  }, [inviteToken, managerInvitations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!displayName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await acceptManagerInvitation(inviteToken, password, displayName.trim());
      setLoading(false);

      if (res.success) {
        setSuccessMessage(res.message || 'Invitation accepted! Initializing your Manager Command Center...');
        setTimeout(() => {
          onNavigate('dashboard');
        }, 1200);
      } else {
        setErrorMessage(res.message || 'Failed to accept invitation. Please try again.');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err?.message || 'An unexpected error occurred while accepting the invitation.');
    }
  };

  return (
    <div id="accept-invitation-container" className="min-h-screen bg-[#F6F8F7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#101915] text-[#0AB77F] shadow-lg mb-3">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#101915] tracking-tight">
          MARS Cashflow
        </h2>
        <p className="text-xs text-[#526059] uppercase tracking-wider font-semibold mt-1">
          Property Manager Onboarding
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-[#DFE8E3] sm:px-10">
          {invitationStatus === 'NOT_FOUND' ? (
            <div id="invitation-not-found" className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#101915]">Invalid Invitation Link</h3>
              <p className="text-xs text-[#526059] leading-relaxed">
                The manager invitation token was not found or is missing. Please check your invitation link or contact the property owner.
              </p>
              <button
                id="return-to-login-btn"
                onClick={() => onNavigate('login')}
                className="w-full py-3 px-4 bg-[#101915] text-white rounded-xl text-xs font-bold hover:bg-[#1A2621] transition-colors cursor-pointer"
              >
                Return to Login
              </button>
            </div>
          ) : invitationStatus === 'EXPIRED' ? (
            <div id="invitation-expired" className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#101915]">Invitation Expired or Revoked</h3>
              <p className="text-xs text-[#526059] leading-relaxed">
                This property manager invitation has expired or was revoked by the landlord. Please request a new invitation.
              </p>
              <button
                id="expired-return-btn"
                onClick={() => onNavigate('login')}
                className="w-full py-3 px-4 bg-[#101915] text-white rounded-xl text-xs font-bold hover:bg-[#1A2621] transition-colors cursor-pointer"
              >
                Return to Login
              </button>
            </div>
          ) : invitationStatus === 'ACCEPTED' ? (
            <div id="invitation-accepted" className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0AB77F] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#101915]">Already Activated</h3>
              <p className="text-xs text-[#526059] leading-relaxed">
                This manager invitation has already been accepted and activated. You can sign in using your manager credentials.
              </p>
              <button
                id="already-accepted-login-btn"
                onClick={() => onNavigate('login')}
                className="w-full py-3 px-4 bg-[#0AB77F] text-white rounded-xl text-xs font-bold hover:bg-[#099E6D] transition-colors cursor-pointer"
              >
                Sign In to Manager Center
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Property Assignment Badge */}
              <div className="p-4 bg-[#F2F7F4] rounded-2xl border border-[#D5E5DC] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0AB77F] bg-[#E0F2E9] px-2.5 py-0.5 rounded-full">
                    Official Appointment
                  </span>
                  <ShieldCheck className="w-4 h-4 text-[#0AB77F]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#101915]">
                    {invitation?.propertyName || 'Assigned Property'}
                  </h3>
                  <p className="text-xs text-[#526059]">
                    Appointed by {invitation?.landlordName || 'Property Owner'}
                  </p>
                </div>
              </div>

              {/* Delegated Authorities Overview */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#526059] uppercase tracking-wider">
                  Delegated Authorities & Limits
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-[#0AB77F] shrink-0" />
                    <span className="text-[#101915] font-medium text-[11px]">Rent Collection</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-[#0AB77F] shrink-0" />
                    <span className="text-[#101915] font-medium text-[11px]">Issue Receipts</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#0AB77F] shrink-0" />
                    <span className="text-[#101915] font-medium text-[11px]">
                      Expense Cap: UGX {((invitation?.permissions?.maxExpenseLimitUgx || invitation?.permissions?.expenseLimitUgx || 500000)).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#0AB77F] shrink-0" />
                    <span className="text-[#101915] font-medium text-[11px]">Dispatch Repairs</span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div id="accept-error-banner" className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div id="accept-success-banner" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#101915] mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A9E94]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="manager-name-input"
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. John Mukasa"
                      className="block w-full pl-9 pr-3 py-2.5 border border-[#DFE8E3] rounded-xl text-xs text-[#101915] placeholder-[#8A9E94] focus:outline-hidden focus:ring-2 focus:ring-[#0AB77F] focus:border-transparent"
                    />
                  </div>
                </div>

                {invitation?.email && (
                  <div>
                    <label className="block text-xs font-bold text-[#101915] mb-1">
                      Registered Manager Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A9E94]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        disabled
                        value={invitation.email}
                        className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#526059]"
                      />
                    </div>
                  </div>
                )}

                {invitation?.phone && (
                  <div>
                    <label className="block text-xs font-bold text-[#101915] mb-1">
                      Registered Phone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A9E94]">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        disabled
                        value={invitation.phone}
                        className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#526059]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#101915] mb-1">
                    Create Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A9E94]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="manager-password-input"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="block w-full pl-9 pr-3 py-2.5 border border-[#DFE8E3] rounded-xl text-xs text-[#101915] placeholder-[#8A9E94] focus:outline-hidden focus:ring-2 focus:ring-[#0AB77F] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101915] mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A9E94]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="manager-confirm-password-input"
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="block w-full pl-9 pr-3 py-2.5 border border-[#DFE8E3] rounded-xl text-xs text-[#101915] placeholder-[#8A9E94] focus:outline-hidden focus:ring-2 focus:ring-[#0AB77F] focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  id="accept-invitation-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0AB77F] hover:bg-[#099E6D] text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Activating Manager Center...</span>
                    </>
                  ) : (
                    <>
                      <span>Activate Manager Center</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => onNavigate('login')}
            className="text-xs font-medium text-[#526059] hover:text-[#101915] transition-colors cursor-pointer"
          >
            Already have an active account? Sign in here
          </button>
        </div>
      </div>
    </div>
  );
};
