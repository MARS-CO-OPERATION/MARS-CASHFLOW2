import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { MARS_SUBSCRIPTION_PLANS } from '../services/store';
import { SubscriptionPlanKey } from '../types';
import { formatUgx } from '../utils/formatters';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Calendar,
  Sparkles,
  ArrowRight,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    trialDaysRemaining,
    trialEndDate,
    isTrialActive,
    isSubscriptionRequired,
    activateSubscription,
    language,
    t,
  } = useMars();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanKey>('STANDARD_ESTATE');
  const [provider, setProvider] = useState<'MTN_MOMO' | 'AIRTEL_MONEY'>('MTN_MOMO');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid Ugandan phone number (e.g. 0772 123 456).' });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const res = await activateSubscription(
        selectedPlan,
        provider === 'MTN_MOMO' ? 'MTN Mobile Money' : 'Airtel Money',
        phone
      );

      setIsProcessing(false);
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setIsProcessing(false);
      setStatusMessage({ type: 'error', text: err.message || 'Subscription payment failed.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-[#DFE8E3] relative space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#DFE8E3]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E2F8EF] border border-[#0AB77F]/40 flex items-center justify-center text-2xl text-[#0AB77F]">
              💎
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-[#17231E]">
                  {t.subscriptionPlans}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#E2F8EF] text-[#0AB77F]">
                  2 MONTHS FREE
                </span>
              </div>
              <p className="text-xs text-[#65766F] font-medium mt-0.5">
                {t.month3Notice}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F8F6] text-gray-500 hover:text-gray-900 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Trial Status Card */}
        <div className="bg-[#101915] rounded-2xl p-5 text-white shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#62E3B6]" />
              <span className="text-xs font-black tracking-wider uppercase text-[#62E3B6]">
                {currentUser?.subscriptionPlan === 'FREE_TRIAL' ? 'Free Trial Period' : 'Active Subscription'}
              </span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-white/10 rounded-full text-white">
              {currentUser?.subscriptionPlan === 'FREE_TRIAL'
                ? `${trialDaysRemaining} Days Remaining`
                : 'Active Tier'}
            </span>
          </div>

          <div className="text-sm font-medium text-[#9FB2A9] leading-relaxed">
            {currentUser?.subscriptionPlan === 'FREE_TRIAL' ? (
              <span>
                Your 2-month introductory free trial is valid until{' '}
                <strong className="text-white">
                  {new Date(trialEndDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </strong>
                . Choose a plan now or let subscription seamlessly begin from month 3.
              </span>
            ) : (
              <span>
                You are currently subscribed to the{' '}
                <strong className="text-white">{currentUser?.subscriptionPlan}</strong> tier. Thank
                you for choosing MARS Cashflow Uganda.
              </span>
            )}
          </div>
        </div>

        {/* Plan Selector Grid */}
        <div className="space-y-3">
          <label className="block text-xs font-extrabold text-[#17231E] uppercase tracking-wider">
            Select Your Preferred Tier (Billed from Month 3):
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MARS_SUBSCRIPTION_PLANS.filter((p) => p.id !== 'FREE_TRIAL').map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id as SubscriptionPlanKey)}
                  className={`rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-[#E2F8EF]/40 border-[#0AB77F] ring-2 ring-[#0AB77F]/40 shadow-xs'
                      : 'bg-white border-[#DFE8E3] hover:border-gray-400'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#101915] text-white">
                        {plan.badge}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0AB77F]" />}
                    </div>
                    <h4 className="text-xs font-black text-[#17231E]">
                      {language === 'lg' ? plan.nameLg : plan.name}
                    </h4>
                    <div className="text-base font-black text-[#0AB77F]">
                      {formatUgx(plan.priceUgx)}
                    </div>
                    <div className="text-[10px] text-[#65766F] font-semibold">
                      {language === 'lg' ? plan.periodLg : plan.period}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#65766F] leading-snug border-t border-[#DFE8E3] pt-2">
                    {plan.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Money Checkout Form */}
        <form onSubmit={handleSubscribe} className="space-y-4 pt-2 border-t border-[#DFE8E3]">
          <div className="space-y-1">
            <label className="block text-xs font-extrabold text-[#17231E]">
              Payment Channel (Uganda Mobile Money)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProvider('MTN_MOMO')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-black cursor-pointer transition-all ${
                  provider === 'MTN_MOMO'
                    ? 'bg-amber-400/20 border-amber-500 text-amber-900 ring-2 ring-amber-400/40'
                    : 'bg-white border-[#DFE8E3] text-[#17231E]'
                }`}
              >
                <span>🟡</span>
                <span>MTN Mobile Money</span>
              </button>

              <button
                type="button"
                onClick={() => setProvider('AIRTEL_MONEY')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-black cursor-pointer transition-all ${
                  provider === 'AIRTEL_MONEY'
                    ? 'bg-red-500/15 border-red-500 text-red-900 ring-2 ring-red-400/40'
                    : 'bg-white border-[#DFE8E3] text-[#17231E]'
                }`}
              >
                <span>🔴</span>
                <span>Airtel Money</span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-extrabold text-[#17231E]">
              MoMo Registered Phone Number
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0772 123 456"
              className="w-full px-4 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
            />
            <span className="text-[10px] text-[#65766F]">
              A secure PIN prompt will be sent directly to your handset.
            </span>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-[#0AB77F]/15 border border-[#0AB77F]/40 text-[#0AB77F]'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-[#65766F] hover:text-[#17231E] bg-[#F5F8F6] rounded-xl cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2.5 bg-[#0AB77F] hover:bg-[#07885E] active:scale-[0.98] text-white text-xs font-black rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Dispatching MoMo Request...</span>
              ) : (
                <>
                  <span>Confirm Plan Subscription</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
