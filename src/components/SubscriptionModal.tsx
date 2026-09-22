import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  CreditCard, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Zap, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { SubscriptionPlan, CreditWallet } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/mockData';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: CreditWallet;
  onUpgradePlan: (tier: 'starter' | 'growth' | 'enterprise') => void;
  onTopUpCredits: (type: 'email' | 'mobile', amount: number) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onUpgradePlan,
  onTopUpCredits
}) => {
  const [isAnnual, setIsAnnual] = useState<boolean>(true);
  const [upgradedTierToast, setUpgradedTierToast] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectPlan = (tier: 'starter' | 'growth' | 'enterprise') => {
    onUpgradePlan(tier);
    setUpgradedTierToast(`Successfully upgraded to the ${tier.toUpperCase()} Plan! Credits replenished.`);
    setTimeout(() => setUpgradedTierToast(null), 3000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold mr-2 transition-all active:scale-95"
                title="Go back / close overlay"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                LeadPulse Subscriptions & Credits
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Current Plan: <strong className="text-white capitalize">{wallet.currentPlan}</strong>
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-2 font-['Space_Grotesk']">
              Simple, Predictable Contact Enrichment Pricing
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Extract verified mobile numbers, validated corporate emails, and career history with unlimited duplicate protection on every plan.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8 text-xs">
          
          {/* Toast Notification */}
          {upgradedTierToast && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{upgradedTierToast}</span>
            </div>
          )}

          {/* Current Wallet Credit Breakdown */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Mobile Credits */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Direct Mobile Credits
                </span>
                <span className="font-mono font-bold text-emerald-400 text-xs">
                  {wallet.mobileCreditsRemaining} / {wallet.mobileCreditsTotal}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (wallet.mobileCreditsRemaining / wallet.mobileCreditsTotal) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Cost: 5 credits / verified mobile</span>
                <button
                  onClick={() => onTopUpCredits('mobile', 100)}
                  className="text-emerald-400 hover:underline font-medium"
                >
                  +100 pack ($29)
                </button>
              </div>
            </div>

            {/* Email Credits */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  Verified Work Email Credits
                </span>
                <span className="font-mono font-bold text-blue-400 text-xs">
                  {wallet.emailCreditsRemaining} / {wallet.emailCreditsTotal}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (wallet.emailCreditsRemaining / wallet.emailCreditsTotal) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Cost: 1 credit / verified email</span>
                <button
                  onClick={() => onTopUpCredits('email', 1000)}
                  className="text-blue-400 hover:underline font-medium"
                >
                  +1,000 pack ($19)
                </button>
              </div>
            </div>

            {/* Free Duplicate Defense */}
            <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-1.5 text-purple-400 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Duplicate Protection</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-white">100% Free & Unlimited</strong> on all plans. Checking leads for duplicates costs 0 credits.
              </p>
            </div>

          </div>

          {/* Billing Interval Toggle (Monthly vs Annual) */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-xs font-semibold ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-12 h-6 rounded-full bg-slate-800 p-1 relative transition-colors focus:outline-none"
            >
              <div className={`w-4 h-4 rounded-full bg-indigo-500 transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${isAnnual ? 'text-white' : 'text-slate-400'}`}>
              Annual Billing
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Save 25%
              </span>
            </span>
          </div>

          {/* Subscription Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const price = isAnnual ? plan.priceAnnualMonthly : plan.priceMonthly;
              const isCurrent = wallet.currentPlan === plan.tier;

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-6 flex flex-col justify-between relative transition-all ${
                    plan.isPopular
                      ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900 border-2 border-indigo-500 shadow-xl shadow-indigo-600/10'
                      : 'bg-slate-950/60 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md">
                      {plan.badge}
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white">{plan.name}</h3>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-white font-['Space_Grotesk']">
                          ${price}
                        </span>
                        <span className="text-slate-400 text-xs">/month</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isAnnual ? 'Billed annually' : 'Billed month-to-month'}
                      </p>
                    </div>

                    {/* Monthly Credits Allocation */}
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Direct Mobiles:</span>
                        <span className="font-bold text-emerald-400 font-mono">
                          {plan.creditsMobilePerMonth.toLocaleString()}/mo
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Verified Emails:</span>
                        <span className="font-bold text-blue-400 font-mono">
                          {plan.creditsEmailPerMonth.toLocaleString()}/mo
                        </span>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Included in plan:
                      </span>
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2 text-slate-300 text-xs">
                          <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plan CTA button */}
                  <div className="pt-6">
                    <button
                      onClick={() => handleSelectPlan(plan.tier)}
                      disabled={isCurrent}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                        isCurrent
                          ? 'bg-slate-800 text-slate-400 cursor-default border border-slate-700'
                          : plan.isPopular
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Active Current Plan</span>
                        </>
                      ) : (
                        <>
                          <span>Select {plan.name}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
