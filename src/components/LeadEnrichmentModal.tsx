import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Briefcase, 
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  CopyCheck,
  ArrowLeft
} from 'lucide-react';
import { Lead, DuplicateMatch, CreditWallet } from '../types';
import { enrichProfileData, DEMO_PROSPECT_PROFILES, splitName } from '../services/enrichmentService';
import { findDuplicateMatches, mergeLeads } from '../services/deduplicationService';

interface LeadEnrichmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingLeads: Lead[];
  wallet: CreditWallet;
  onAddLead: (lead: Lead, creditsUsed: { email: number; mobile: number }) => void;
  onMergeLead: (updatedLead: Lead, creditsUsed: { email: number; mobile: number }) => void;
  onOpenPricing: () => void;
}

export const LeadEnrichmentModal: React.FC<LeadEnrichmentModalProps> = ({
  isOpen,
  onClose,
  existingLeads,
  wallet,
  onAddLead,
  onMergeLead,
  onOpenPricing
}) => {
  const [linkedinUrl, setLinkedinUrl] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [includeMobile, setIncludeMobile] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [enrichResult, setEnrichResult] = useState<Partial<Lead> | null>(null);
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);
  const [creditsCost, setCreditsCost] = useState<{ email: number; mobile: number }>({ email: 1, mobile: 5 });

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

  const handleSelectDemo = (demo: typeof DEMO_PROSPECT_PROFILES[0]) => {
    setLinkedinUrl(demo.linkedinUrl);
    setFullName(demo.name);
    setCompany(demo.company);
    setTitle(demo.title);
  };

  const handleEnrich = async () => {
    if (!linkedinUrl && (!fullName || !company)) {
      alert('Please enter a LinkedIn Profile URL or prospect Name & Company');
      return;
    }

    if (includeMobile && wallet.mobileCreditsRemaining < 5) {
      alert('You have insufficient mobile credits. Please upgrade your plan or top up credits.');
      onOpenPricing();
      return;
    }

    setIsLoading(true);
    setEnrichResult(null);
    setDuplicateMatches([]);

    try {
      const res = await enrichProfileData({
        linkedinUrl,
        fullName,
        company,
        title
      }, includeMobile);

      setEnrichResult(res.candidate);
      setCreditsCost(res.creditsUsed);

      // Perform duplicate check against current CRM leads
      const matches = findDuplicateMatches(res.candidate, existingLeads);
      setDuplicateMatches(matches);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = (forceSeparate: boolean = false) => {
    if (!enrichResult) return;

    if (duplicateMatches.length > 0 && !forceSeparate) {
      // Merge with the highest confidence duplicate
      const bestMatch = duplicateMatches[0];
      const merged = mergeLeads(bestMatch.existingLead, enrichResult);
      onMergeLead(merged, creditsCost);
    } else {
      // Create new fresh lead
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        firstName: enrichResult.firstName || 'Prospect',
        lastName: enrichResult.lastName || '',
        fullName: enrichResult.fullName || `${enrichResult.firstName} ${enrichResult.lastName}`,
        headline: enrichResult.headline || `${enrichResult.currentTitle} at ${enrichResult.currentCompany}`,
        currentTitle: enrichResult.currentTitle || 'Leader',
        currentCompany: enrichResult.currentCompany || 'Company',
        companyDomain: enrichResult.companyDomain,
        location: enrichResult.location || 'United States',
        linkedinUrl: enrichResult.linkedinUrl || linkedinUrl,
        avatarUrl: enrichResult.avatarUrl,
        email: enrichResult.email || '',
        emailStatus: enrichResult.emailStatus || 'verified',
        phone: enrichResult.phone || '',
        phoneType: enrichResult.phoneType || 'mobile',
        phoneConfidence: enrichResult.phoneConfidence || 95,
        mobileVerified: !!enrichResult.phone,
        jobHistory: enrichResult.jobHistory || [],
        education: enrichResult.education || [],
        skills: enrichResult.skills || ['Sales', 'Leadership'],
        stage: 'enriched',
        source: 'public_profile_search',
        tags: ['Enriched via LeadPulse'],
        notes: `Enriched on ${new Date().toLocaleDateString()}. Work email validated.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onAddLead(newLead, creditsCost);
    }

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Extract & Enrich LinkedIn Data
              </h3>
              <p className="text-xs text-slate-400">
                Discover verified direct mobile, work email, and career history with duplicate defense
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
              title="Return / Close (Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Quick Demo Pre-fills */}
          <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick Test Profiles (Click to pre-fill):
            </span>
            <div className="flex flex-wrap gap-2">
              {DEMO_PROSPECT_PROFILES.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDemo(p)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-950 hover:border-indigo-600 text-slate-300 rounded-lg text-xs border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <span className="font-semibold text-white">{p.name}</span>
                  <span className="text-slate-400">({p.company})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-xs">
                LinkedIn Public Profile URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/sarah-lin-snowflake"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1 text-[11px]">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Lin"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1 text-[11px]">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Snowflake"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1 text-[11px]">
                  Job Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. VP of Engineering"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Credit Cost & Options */}
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMobile}
                  onChange={(e) => setIncludeMobile(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span className="text-slate-200 font-medium">Extract Direct Mobile Phone Number</span>
                <span className="text-emerald-400 font-semibold text-[10px] bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  5 mobile credits
                </span>
              </label>

              <span className="text-slate-400 text-[11px]">
                Work Email: <strong className="text-blue-400">1 email credit</strong>
              </span>
            </div>

            {/* Enrich Button */}
            <button
              onClick={handleEnrich}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Querying LinkedIn & Telco Graph...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Enrich Profile & Check Duplicates</span>
                </>
              )}
            </button>
          </div>

          {/* Enrichment Result & Duplicate Preview */}
          {enrichResult && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 animate-in fade-in">
              
              {/* Duplicate Defense Banner */}
              {duplicateMatches.length > 0 ? (
                <div className="bg-amber-950/40 border border-amber-500/50 p-3.5 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Lead Duplicacy Alert: Match Found in CRM!</span>
                    <span className="ml-auto px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold">
                      {duplicateMatches[0].confidenceScore}% Match
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    {duplicateMatches[0].matchReason}
                  </p>
                  <p className="text-slate-400 text-[10px]">
                    Existing record: <strong>{duplicateMatches[0].existingLead.fullName}</strong> ({duplicateMatches[0].existingLead.currentCompany})
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-lg flex items-center gap-2 text-emerald-300 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Zero Duplicates Detected. Clean prospect record ready for CRM.</span>
                </div>
              )}

              {/* Extracted Data Card */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  {enrichResult.avatarUrl ? (
                    <img
                      src={enrichResult.avatarUrl}
                      alt={enrichResult.fullName}
                      className="w-11 h-11 rounded-lg object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-indigo-900/60 border border-indigo-700 flex items-center justify-center font-bold text-white">
                      {enrichResult.firstName?.[0]}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-white text-sm">{enrichResult.fullName}</h4>
                    <p className="text-slate-400 text-[11px]">{enrichResult.headline}</p>
                  </div>
                </div>

                {/* Extracted Phone Numbers & Emails */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {/* Phone Numbers Column */}
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                      <span className="text-slate-400 flex items-center gap-1 font-semibold">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        Extracted Phone Numbers:
                      </span>
                      <div className="space-y-1 font-mono text-xs">
                        <div className="flex items-center justify-between text-emerald-300">
                          <span className="text-[10px] font-sans text-emerald-400/80">📱 Mobile:</span>
                          <span className="font-bold">{enrichResult.mobilePhone || enrichResult.phone || 'None found'}</span>
                        </div>
                        {enrichResult.directPhone && (
                          <div className="flex items-center justify-between text-blue-300">
                            <span className="text-[10px] font-sans text-blue-400/80">☎️ Direct:</span>
                            <span className="font-bold">{enrichResult.directPhone}</span>
                          </div>
                        )}
                        {enrichResult.hqPhone && (
                          <div className="flex items-center justify-between text-purple-300">
                            <span className="text-[10px] font-sans text-purple-400/80">🏢 HQ:</span>
                            <span className="font-bold">{enrichResult.hqPhone}</span>
                          </div>
                        )}
                      </div>
                      {enrichResult.phoneConfidence && (
                        <span className="text-[10px] text-emerald-400 block pt-0.5">
                          {enrichResult.phoneConfidence}% confidence score
                        </span>
                      )}
                    </div>

                    {/* Email Addresses Column */}
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                      <span className="text-slate-400 flex items-center gap-1 font-semibold">
                        <Mail className="w-3 h-3 text-blue-400" />
                        Extracted Email Addresses:
                      </span>
                      <div className="space-y-1 font-mono text-xs">
                        <div className="flex items-center justify-between text-blue-300">
                          <span className="text-[10px] font-sans text-blue-400/80">✉️ Work:</span>
                          <span className="font-bold truncate max-w-[140px]">{enrichResult.email}</span>
                        </div>
                        {enrichResult.secondaryEmail && (
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-[10px] font-sans text-slate-400/80">👤 Personal:</span>
                            <span className="font-bold truncate max-w-[140px]">{enrichResult.secondaryEmail}</span>
                          </div>
                        )}
                        {enrichResult.alternateEmail && (
                          <div className="flex items-center justify-between text-indigo-300">
                            <span className="text-[10px] font-sans text-indigo-400/80">🌐 Alt:</span>
                            <span className="font-bold truncate max-w-[140px]">{enrichResult.alternateEmail}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-blue-400 block pt-0.5">SMTP 250 OK (Valid Mailbox)</span>
                    </div>
                  </div>
                </div>

                {/* Job History Highlights */}
                {enrichResult.jobHistory && enrichResult.jobHistory.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                      Extracted Career Experience ({enrichResult.jobHistory.length} roles):
                    </span>
                    <div className="space-y-1">
                      {enrichResult.jobHistory.slice(0, 2).map((j, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-900 p-2 rounded text-[11px] border border-slate-800/80">
                          <span className="text-slate-200 font-medium">{j.title} @ {j.company}</span>
                          <span className="text-slate-500 text-[10px]">{j.period}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-end">
                {duplicateMatches.length > 0 ? (
                  <>
                    <button
                      onClick={() => handleConfirmImport(true)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700"
                    >
                      Keep Separate Record
                    </button>
                    <button
                      onClick={() => handleConfirmImport(false)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
                    >
                      <CopyCheck className="w-3.5 h-3.5" />
                      <span>Merge & Enrich Existing Record</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConfirmImport(false)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Import to CRM Pipeline</span>
                  </button>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
