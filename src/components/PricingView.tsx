import React, { useState } from 'react';
import { 
  ArrowLeft, 
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
  HelpCircle,
  Clock,
  Coins
} from 'lucide-react';
import { SubscriptionPlan, CreditWallet } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/mockData';

interface PricingViewProps {
  wallet: CreditWallet;
  onUpgradePlan: (tier: 'starter' | 'growth' | 'enterprise') => void;
  onTopUpCredits: (type: 'email' | 'mobile', amount: number) => void;
  onBack: () => void;
  previousPageTitle?: string;
}

export const PricingView: React.FC<PricingViewProps> = ({
  wallet,
  onUpgradePlan,
  onTopUpCredits,
  onBack,
  previousPageTitle = 'Dashboard'
}) => {
  const [isAnnual, setIsAnnual] = useState<boolean>(true);
  const [upgradedTierToast, setUpgradedTierToast] = useState<string | null>(null);

  const handleSelectPlan = (tier: 'starter' | 'growth' | 'enterprise') => {
    onUpgradePlan(tier);
    setUpgradedTierToast(`Successfully upgraded to the ${tier.toUpperCase()} Plan! Credits replenished.`);
    setTimeout(() => setUpgradedTierToast(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top In-App Navigation Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs transition-all active:scale-95 shadow-sm group"
            title={`Go back to ${previousPageTitle}`}
            id="btn-back-from-pricing"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to {previousPageTitle}</span>
          </button>
          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight font-['Space_Grotesk']">
                Subscription Plans & Credit Wallet
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Live Pricing
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Scale your direct mobile dial and validated work email prospecting credits with zero lock-in.
            </p>
          </div>
        </div>

        {/* Current Active Tier Pill */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Active Plan</span>
            <span className="text-xs font-bold text-indigo-400 capitalize">{wallet.currentPlan} Tier</span>
          </div>
        </div>
      </div>

      {/* Upgraded Feedback Notification */}
      {upgradedTierToast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top duration-300 shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{upgradedTierToast}</span>
        </div>
      )}

      {/* Real-Time Credit Balance Tracker */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Current Credit Allowances
            </h2>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Renews on: <strong className="text-slate-200">{new Date(wallet.renewsAt).toLocaleDateString()}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Mobile Credits Card */}
          <div className="p-5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200">Direct Mobile Credits</h3>
                  <span className="text-[11px] text-slate-500">5 credits per mobile unlock</span>
                </div>
              </div>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {wallet.mobileCreditsRemaining} <span className="text-xs text-slate-500 font-normal">/ {wallet.mobileCreditsTotal}</span>
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (wallet.mobileCreditsRemaining / Math.max(1, wallet.mobileCreditsTotal)) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">Need more direct dials?</span>
              <button
                onClick={() => onTopUpCredits('mobile', 100)}
                className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-semibold transition-colors active:scale-95"
              >
                +100 pack ($29)
              </button>
            </div>
          </div>

          {/* Email Credits Card */}
          <div className="p-5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200">Verified Work Email Credits</h3>
                  <span className="text-[11px] text-slate-500">1 credit per verified email</span>
                </div>
              </div>
              <span className="text-lg font-bold font-mono text-blue-400">
                {wallet.emailCreditsRemaining} <span className="text-xs text-slate-500 font-normal">/ {wallet.emailCreditsTotal}</span>
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (wallet.emailCreditsRemaining / Math.max(1, wallet.emailCreditsTotal)) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">Outreach volume spike?</span>
              <button
                onClick={() => onTopUpCredits('email', 1000)}
                className="px-2.5 py-1 rounded-lg bg-blue-950 hover:bg-blue-900 border border-blue-700/60 text-blue-300 text-xs font-semibold transition-colors active:scale-95"
              >
                +1,000 pack ($19)
              </button>
            </div>
          </div>

          {/* Free Duplicate Defense Card */}
          <div className="p-5 bg-slate-950 rounded-xl border border-purple-500/20 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200">Anti-Duplicate Protection</h3>
                  <span className="text-[11px] text-purple-400 font-semibold">100% Free & Unlimited</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scanning incoming prospects, merging duplicates, and cross-checking against team leads is free forever on all tiers.
              </p>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero credit deduction for duplicates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Interval Toggle (Monthly vs Annual) */}
      <div className="flex items-center justify-center gap-3 py-2">
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
                  : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
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
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
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
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400">Team Seats:</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {plan.teamSeats} {plan.teamSeats === 1 ? 'user' : 'users'}
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
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95'
                      : 'bg-slate-800 hover:bg-slate-700 text-white active:scale-95'
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

      {/* Frequently Asked Questions */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          <span>Frequently Asked Questions</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/60 space-y-1">
            <h4 className="font-bold text-slate-200">What happens if a mobile number is unverified?</h4>
            <p className="text-slate-400">If our verification network cannot validate a direct dial or email with 95%+ confidence, zero credits are deducted from your balance.</p>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/60 space-y-1">
            <h4 className="font-bold text-slate-200">Do unused credits rollover?</h4>
            <p className="text-slate-400">Yes, active paid accounts roll over unused credit balances month-over-month for up to 12 months as long as the subscription remains active.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
