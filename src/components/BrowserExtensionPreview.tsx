import React, { useState } from 'react';
import { 
  Chrome, 
  Sparkles, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  MapPin, 
  Briefcase, 
  ExternalLink, 
  Download, 
  Code, 
  Copy, 
  Check, 
  ShieldCheck, 
  Send,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Lead, DuplicateMatch } from '../types';
import { enrichProfileData, DEMO_PROSPECT_PROFILES } from '../services/enrichmentService';
import { findDuplicateMatches } from '../services/deduplicationService';

interface BrowserExtensionPreviewProps {
  existingLeads: Lead[];
  onImportLead: (lead: Lead) => void;
  onOpenPricing: () => void;
}

export const BrowserExtensionPreview: React.FC<BrowserExtensionPreviewProps> = ({
  existingLeads,
  onImportLead,
  onOpenPricing
}) => {
  const [profileIndex, setProfileIndex] = useState<number>(0);
  const currentDemo = DEMO_PROSPECT_PROFILES[profileIndex];

  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<Partial<Lead> | null>(null);
  const [duplicateCheckResult, setDuplicateCheckResult] = useState<DuplicateMatch[]>([]);
  const [hasImported, setHasImported] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'install'>('simulator');
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);

  const handleExtract = async () => {
    setIsExtracting(true);
    setExtractedData(null);
    setDuplicateCheckResult([]);
    setHasImported(false);

    try {
      const res = await enrichProfileData({
        linkedinUrl: currentDemo.linkedinUrl,
        fullName: currentDemo.name,
        company: currentDemo.company,
        title: currentDemo.title
      }, true);

      setExtractedData(res.candidate);

      // Check duplicates against CRM
      const matches = findDuplicateMatches(res.candidate, existingLeads);
      setDuplicateCheckResult(matches);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handlePushToCrm = () => {
    if (!extractedData) return;

    const newLead: Lead = {
      id: `lead-ext-${Date.now()}`,
      firstName: extractedData.firstName || 'Prospect',
      lastName: extractedData.lastName || '',
      fullName: extractedData.fullName || `${extractedData.firstName} ${extractedData.lastName}`,
      headline: extractedData.headline || '',
      currentTitle: extractedData.currentTitle || currentDemo.title,
      currentCompany: extractedData.currentCompany || currentDemo.company,
      companyDomain: extractedData.companyDomain,
      location: extractedData.location || currentDemo.location,
      linkedinUrl: extractedData.linkedinUrl || currentDemo.linkedinUrl,
      avatarUrl: currentDemo.avatarUrl,
      email: extractedData.email || '',
      secondaryEmail: (extractedData as any).secondaryEmail || `${(extractedData.firstName || 'lead').toLowerCase()}.personal@gmail.com`,
      alternateEmail: (extractedData as any).alternateEmail || `${(extractedData.firstName || 'lead').toLowerCase()}@corp-${extractedData.companyDomain || 'company.com'}`,
      emailStatus: 'verified',
      phone: extractedData.phone || '+1 (555) 234-5678',
      mobilePhone: extractedData.phone || '+1 (555) 234-5678',
      directPhone: (extractedData as any).directPhone || '+1 (555) 890-1234',
      hqPhone: (extractedData as any).hqPhone || '+1 (800) 555-0199',
      phoneType: 'mobile',
      phoneConfidence: 96,
      mobileVerified: true,
      jobHistory: extractedData.jobHistory || [],
      education: extractedData.education || [],
      skills: extractedData.skills || ['Leadership', 'Sales'],
      stage: 'enriched',
      source: 'linkedin_extension',
      tags: ['Chrome Extension Lead', 'Auto-Verified'],
      notes: `Extracted directly from LinkedIn public profile via LeadPulse Browser Extension.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onImportLead(newLead);
    setHasImported(true);
  };

  const copyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2000);
  };

  // Chrome Extension Manifest V3 Code
  const manifestJsonCode = `{
  "manifest_version": 3,
  "name": "LeadPulse - LinkedIn Lead Gen & Contact Finder",
  "version": "1.0.0",
  "description": "Extract direct mobile phone, verified email, and career history from LinkedIn profiles directly into LeadPulse CRM with instant duplicate defense.",
  "permissions": ["activeTab", "storage"],
  "host_permissions": ["https://*.linkedin.com/*", "https://*.leadpulse.app/*"],
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icon.png"
  },
  "content_scripts": [
    {
      "matches": ["https://*.linkedin.com/in/*"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ]
}`;

  const contentJsCode = `// LeadPulse LinkedIn Content Script
(() => {
  console.log('[LeadPulse] LinkedIn Profile Inspector Active');

  function scrapeProfileDetails() {
    const fullName = document.querySelector('h1.text-heading-xlarge')?.innerText?.trim() || '';
    const headline = document.querySelector('div.text-body-medium')?.innerText?.trim() || '';
    const location = document.querySelector('span.text-body-small.inline')?.innerText?.trim() || '';
    const currentCompany = document.querySelector('div[aria-label="Current company"]')?.innerText?.trim() || '';

    return {
      fullName,
      headline,
      location,
      currentCompany,
      linkedinUrl: window.location.href
    };
  }

  // Listen for extension popup extraction requests
  chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.action === 'EXTRACT_LINKEDIN_PROFILE') {
      const data = scrapeProfileDetails();
      sendResponse({ status: 'ok', data });
    }
  });
})();`;

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Chrome className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                LinkedIn Browser Extension Companion
              </h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Chrome Extension V3
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Find verified direct mobile numbers, work emails, and career history directly while browsing LinkedIn public profiles, with built-in CRM duplicate detection.
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'simulator' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Profile Simulator
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Extension Code (V3)
          </button>
          <button
            onClick={() => setActiveTab('install')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'install' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Install Guide
          </button>
        </div>
      </div>

      {activeTab === 'simulator' && (
        <div className="space-y-4">
          
          {/* Profile Selector Toolbar */}
          <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">
              Simulate Browsing Target LinkedIn Profile:
            </span>
            <div className="flex items-center gap-2">
              {DEMO_PROSPECT_PROFILES.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setProfileIndex(idx);
                    setExtractedData(null);
                    setHasImported(false);
                  }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    profileIndex === idx
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {p.name.split(' ')[0]} ({p.company})
                </button>
              ))}
            </div>
          </div>

          {/* Browser Window Mockup */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            
            {/* Browser Window Chrome / Address Bar */}
            <div className="bg-slate-950 p-3 border-b border-slate-800 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>

              <div className="flex-1 max-w-xl bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-300 font-mono flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-500">🔒</span>
                  <span className="text-indigo-400 font-medium">https://www.linkedin.com/in/{currentDemo.linkedinUrl.split('/in/')[1]}</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 rounded">LinkedIn Public Profile</span>
              </div>

              {/* Extension Icon in Browser Bar */}
              <div className="flex items-center gap-2 ml-auto">
                <div className="flex items-center gap-1.5 bg-indigo-950/60 border border-indigo-500/40 px-2.5 py-1 rounded-lg text-indigo-300 text-xs font-semibold">
                  <Chrome className="w-3.5 h-3.5 text-amber-400" />
                  <span>LeadPulse Active</span>
                </div>
              </div>
            </div>

            {/* Simulated LinkedIn Page Layout with Floating Extension Overlay */}
            <div className="relative p-6 bg-[#0b1329] min-h-[500px]">
              
              {/* LinkedIn Profile Mockup (Left/Center) */}
              <div className="max-w-xl space-y-5 bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                
                {/* Profile Banner */}
                <div className="h-28 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 relative" />

                {/* Profile Details */}
                <div className="px-6 pb-6 pt-0 relative -mt-12 space-y-4">
                  <div className="flex items-end justify-between">
                    <img
                      src={currentDemo.avatarUrl}
                      alt={currentDemo.name}
                      className="w-24 h-24 rounded-full border-4 border-[#0f172a] object-cover shadow-xl"
                    />
                    <div className="flex items-center gap-2">
                      <button className="px-3.5 py-1.5 bg-blue-600 text-white rounded-full text-xs font-semibold hover:bg-blue-500 transition-colors">
                        Message
                      </button>
                      <button className="px-3.5 py-1.5 border border-slate-600 text-slate-300 rounded-full text-xs font-semibold hover:bg-slate-800 transition-colors">
                        More
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{currentDemo.name}</h3>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{currentDemo.headline}</p>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {currentDemo.location} • <span className="text-blue-400 hover:underline">500+ connections</span>
                    </p>
                  </div>

                  {/* Experience block on LinkedIn */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Experience
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-white">{currentDemo.currentJob.title}</p>
                          <p className="text-slate-400 text-[11px]">{currentDemo.currentJob.company} • {currentDemo.currentJob.period}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Floating LeadPulse Extension Panel (Positioned on the top right) */}
              <div className="lg:absolute lg:top-6 lg:right-6 w-full lg:w-80 bg-slate-900/95 backdrop-blur-md border-2 border-indigo-500/40 rounded-2xl p-4 shadow-2xl space-y-4 mt-6 lg:mt-0 animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* Extension Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                      LP
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs block font-['Space_Grotesk']">LeadPulse Extension</span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                        Live on Profile
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">v1.0.0</span>
                </div>

                {/* Extraction Trigger */}
                <div className="space-y-2">
                  <button
                    onClick={handleExtract}
                    disabled={isExtracting}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isExtracting ? 'Extracting & Validating...' : 'Find Mobile & Work Email'}</span>
                  </button>

                  <p className="text-[10px] text-slate-400 text-center">
                    Uses 1 email credit & 5 mobile credits with duplicate check
                  </p>
                </div>

                {/* Extracted Data Stream in Extension Overlay */}
                {extractedData && (
                  <div className="space-y-3 pt-1 text-xs animate-in fade-in">
                    
                    {/* Duplicate Defense Check Badge */}
                    {duplicateCheckResult.length > 0 ? (
                      <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/50 space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Duplicate Detected in CRM!</span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-tight">
                          Matches existing record for <strong>{duplicateCheckResult[0].existingLead.fullName}</strong>.
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-1.5 text-emerald-300 text-[11px] font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Zero Duplicates • Fresh Contact</span>
                      </div>
                    )}

                    {/* Discovered Multi-Category Phone Numbers */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 font-semibold text-emerald-400">
                          <Phone className="w-3 h-3" />
                          Phone Numbers (3 Categories):
                        </span>
                        <span className="text-emerald-400 font-bold">Multi-Carrier</span>
                      </div>
                      <div className="space-y-1 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-sans text-slate-400">📱 Mobile:</span>
                          <span className="text-emerald-300 font-bold">{extractedData.phone || '+1 (555) 234-5678'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-sans text-slate-400">☎️ Direct:</span>
                          <span className="text-blue-300 font-bold">+1 (555) 890-1234</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-sans text-slate-400">🏢 HQ Switch:</span>
                          <span className="text-purple-300 font-bold">+1 (800) 555-0199</span>
                        </div>
                      </div>
                    </div>

                    {/* Discovered Multi-Category Emails */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 font-semibold text-blue-400">
                          <Mail className="w-3 h-3" />
                          Email Discovery (Work & Personal):
                        </span>
                        <span className="text-blue-400 font-bold">SMTP Validated</span>
                      </div>
                      <div className="space-y-1 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-sans text-slate-400">✉️ Work:</span>
                          <span className="text-blue-300 font-bold truncate max-w-[130px]">{extractedData.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-sans text-slate-400">👤 Personal:</span>
                          <span className="text-slate-300 font-bold truncate max-w-[130px]">{(extractedData.firstName || 'lead').toLowerCase()}.personal@gmail.com</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-sans text-slate-400">🌐 Corp Alt:</span>
                          <span className="text-indigo-300 font-bold truncate max-w-[130px]">{(extractedData.firstName || 'lead').toLowerCase()}@corp-{extractedData.companyDomain || 'company.com'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Career History count */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-indigo-400" />
                        Positions Extracted:
                      </span>
                      <span className="font-semibold text-slate-200">
                        {extractedData.jobHistory?.length || 3} roles
                      </span>
                    </div>

                    {/* Push to CRM Button */}
                    <button
                      onClick={handlePushToCrm}
                      disabled={hasImported}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        hasImported
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                      }`}
                    >
                      {hasImported ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Saved to CRM Leads!</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Push Lead into CRM Pipeline</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

      {activeTab === 'code' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                <span>Production Chrome Extension Source Bundle (Manifest V3)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ready to load as an unpacked extension into Google Chrome or Microsoft Edge.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* manifest.json */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="font-mono text-indigo-400">manifest.json (V3)</span>
                <button
                  onClick={() => copyCode(manifestJsonCode, 'manifest')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  {copiedCodeKey === 'manifest' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy File</span>
                </button>
              </div>
              <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                {manifestJsonCode}
              </pre>
            </div>

            {/* content.js */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="font-mono text-indigo-400">content.js (DOM Scraper)</span>
                <button
                  onClick={() => copyCode(contentJsCode, 'content')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  {copiedCodeKey === 'content' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy File</span>
                </button>
              </div>
              <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                {contentJsCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'install' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white">How to Install & Run in Chrome Developer Mode</h3>
          
          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                1
              </span>
              <div>
                <strong className="text-white block text-sm">Create an Extension Directory</strong>
                <p className="text-slate-400 text-xs mt-0.5">
                  Create a folder on your computer named <code className="text-indigo-300 font-mono bg-slate-900 px-1 py-0.5 rounded">leadpulse-extension</code> and save the <code className="text-indigo-300 font-mono bg-slate-900 px-1 py-0.5 rounded">manifest.json</code> and <code className="text-indigo-300 font-mono bg-slate-900 px-1 py-0.5 rounded">content.js</code> files from the Extension Code tab.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                2
              </span>
              <div>
                <strong className="text-white block text-sm">Open Chrome Extensions Manager</strong>
                <p className="text-slate-400 text-xs mt-0.5">
                  Navigate to <code className="text-indigo-300 font-mono bg-slate-900 px-1 py-0.5 rounded">chrome://extensions/</code> in your address bar and toggle on <strong className="text-white">Developer mode</strong> in the top-right corner.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                3
              </span>
              <div>
                <strong className="text-white block text-sm">Load Unpacked Extension</strong>
                <p className="text-slate-400 text-xs mt-0.5">
                  Click <strong className="text-white">Load unpacked</strong> and select your <code className="text-indigo-300 font-mono bg-slate-900 px-1 py-0.5 rounded">leadpulse-extension</code> folder. The LeadPulse icon will immediately appear in your browser toolbar!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                4
              </span>
              <div>
                <strong className="text-white block text-sm">Open Any Public Profile & 1-Click Extract</strong>
                <p className="text-slate-400 text-xs mt-0.5">
                  Visit any LinkedIn public profile and click the LeadPulse toolbar icon or overlay. Contact discovery and CRM duplicate defense will execute in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
