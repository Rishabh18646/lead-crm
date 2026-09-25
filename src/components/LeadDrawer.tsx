import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  ExternalLink, 
  Building2, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  Check, 
  Copy, 
  Send, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Wand2, 
  MessageSquare,
  Tag,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { Lead, LeadStage, OutreachSequence } from '../types';
import { generateAiIcebreaker } from '../services/outreachService';
import { authService } from '../services/authService';
import { getCompanyWebsiteUrl, getGmailComposeUrl, getOutlookComposeUrl, getMailtoUrl } from '../utils/linkUtils';

interface LeadDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (updated: Lead) => void;
  sequences: OutreachSequence[];
  onEnrollLead: (leadId: string, sequenceId: string) => void;
  onAdvanceLead: (leadId: string) => void;
}

export const LeadDrawer: React.FC<LeadDrawerProps> = ({
  lead,
  onClose,
  onUpdateLead,
  sequences,
  onEnrollLead,
  onAdvanceLead
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedSequenceId, setSelectedSequenceId] = useState<string>(lead?.sequenceId || sequences[0]?.id || '');
  const [generatedHook, setGeneratedHook] = useState<string>('');
  const [hookTone, setHookTone] = useState<'executive' | 'concise' | 'warm'>('executive');
  const [isGeneratingHook, setIsGeneratingHook] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>(lead?.notes || '');
  const leadIdRef = React.useRef<string | undefined>(lead?.id);
  leadIdRef.current = lead?.id;

  // Keep state in sync when lead changes
  useEffect(() => {
    if (lead) {
      setSelectedSequenceId(lead.sequenceId || sequences[0]?.id || '');
      setNoteText(lead.notes || '');
      setGeneratedHook('');
    }
    // Only reset when a different lead is opened — sequence edits (e.g. enroll counts) must not wipe unsaved notes
  }, [lead?.id]);

  // Close on Escape key
  useEffect(() => {
    if (!lead) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lead, onClose]);

  if (!lead) return null;

  const copyText = (text: string, key: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Uses the server's Gemini endpoint; falls back to the local template if unauthenticated/offline
  const handleGenerateHook = async () => {
    setIsGeneratingHook(true);
    const leadId = lead.id;
    const hook = (await authService.generateIcebreaker(lead, hookTone)) || generateAiIcebreaker(lead, hookTone);
    // Ignore the result if the user switched to another lead while waiting
    if (leadIdRef.current === leadId) {
      setGeneratedHook(hook);
    }
    setIsGeneratingHook(false);
  };

  const handleSaveNotes = () => {
    onUpdateLead({
      ...lead,
      notes: noteText,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10 flex items-start justify-between">
          <div className="flex items-start gap-4">
            {lead.avatarUrl ? (
              <img
                src={lead.avatarUrl}
                alt={lead.fullName}
                className="w-14 h-14 rounded-xl object-cover border-2 border-indigo-500/40 shadow-lg"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-slate-800 border border-slate-700 flex items-center justify-center text-xl font-bold text-white">
                {lead.firstName[0]}{lead.lastName[0]}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">{lead.fullName}</h2>
                {lead.linkedinUrl && (
                  <a
                    href={lead.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-[#0A66C2] hover:text-blue-400 bg-blue-500/10 rounded border border-blue-500/20"
                    title="Open LinkedIn Public Profile"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <p className="text-xs text-indigo-400 font-medium mt-0.5">{lead.currentTitle}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 flex-wrap">
                <a
                  href={getCompanyWebsiteUrl(lead.companyDomain, lead.currentCompany)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-300 hover:text-indigo-400 font-medium hover:underline transition-colors"
                  title={`Open ${lead.currentCompany} website`}
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lead.currentCompany}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                </a>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {lead.location}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
              title="Return to leads table (Esc / Browser Back)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-6 flex-1 text-xs">

          {/* Contact Verification Hub */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Multi-Category Contact Hub
              </span>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                Carrier & SMTP Validated
              </span>
            </div>

            {/* 1. Phone Numbers (All 3 Categories) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  Phone Numbers (3 Categories)
                </span>
                <span className="text-[10px] text-slate-400">Direct dial & switchboard</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Direct Mobile */}
                {(() => {
                  const mPhone = lead.mobilePhone || (lead.phoneType === 'mobile' ? lead.phone : '');
                  return (
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-emerald-500/20 space-y-1.5">
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          📱 Mobile Phone
                        </span>
                        <span className="text-emerald-400 font-semibold text-[9px] bg-emerald-500/10 px-1 rounded">
                          {lead.phoneConfidence || 95}% Match
                        </span>
                      </div>
                      {mPhone ? (
                        <div className="flex items-center justify-between">
                          <a
                            href={`tel:${mPhone}`}
                            className="text-emerald-300 font-mono text-xs font-bold hover:underline truncate"
                            title={`Call Mobile: ${mPhone}`}
                          >
                            {mPhone}
                          </a>
                          <button
                            onClick={() => copyText(mPhone, 'mphone')}
                            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                            title="Copy mobile phone"
                          >
                            {copiedKey === 'mphone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-500 italic text-[11px]">No mobile on file</p>
                      )}
                    </div>
                  );
                })()}

                {/* 2. Direct Desk Phone */}
                {(() => {
                  const dPhone = lead.directPhone || (lead.phoneType === 'direct' ? lead.phone : '');
                  return (
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-blue-500/20 space-y-1.5">
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span className="flex items-center gap-1 text-blue-400 font-semibold">
                          ☎️ Direct Work Line
                        </span>
                        <span className="text-blue-400 font-semibold text-[9px] bg-blue-500/10 px-1 rounded">
                          Desk Ext
                        </span>
                      </div>
                      {dPhone ? (
                        <div className="flex items-center justify-between">
                          <a
                            href={`tel:${dPhone}`}
                            className="text-blue-300 font-mono text-xs font-bold hover:underline truncate"
                            title={`Call Direct Line: ${dPhone}`}
                          >
                            {dPhone}
                          </a>
                          <button
                            onClick={() => copyText(dPhone, 'dphone')}
                            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                            title="Copy direct phone"
                          >
                            {copiedKey === 'dphone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-500 italic text-[11px]">No direct line on file</p>
                      )}
                    </div>
                  );
                })()}

                {/* 3. Company HQ Phone */}
                {(() => {
                  const hPhone = lead.hqPhone || (lead.phoneType === 'hq' ? lead.phone : '');
                  return (
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-purple-500/20 space-y-1.5">
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span className="flex items-center gap-1 text-purple-400 font-semibold">
                          🏢 Company HQ Phone
                        </span>
                        <span className="text-purple-400 font-semibold text-[9px] bg-purple-500/10 px-1 rounded">
                          Switchboard
                        </span>
                      </div>
                      {hPhone ? (
                        <div className="flex items-center justify-between">
                          <a
                            href={`tel:${hPhone}`}
                            className="text-purple-300 font-mono text-xs font-bold hover:underline truncate"
                            title={`Call HQ Switchboard: ${hPhone}`}
                          >
                            {hPhone}
                          </a>
                          <button
                            onClick={() => copyText(hPhone, 'hphone')}
                            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                            title="Copy HQ phone"
                          >
                            {copiedKey === 'hphone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-500 italic text-[11px]">No HQ phone on file</p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Fallback indicator if only generic phone is available */}
              {!lead.mobilePhone && !lead.directPhone && !lead.hqPhone && lead.phone && (
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Standard Contact Phone:</span>
                    <a href={`tel:${lead.phone}`} className="text-emerald-400 font-mono font-semibold hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                  <button
                    onClick={() => copyText(lead.phone, 'phone-gen')}
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                  >
                    {copiedKey === 'phone-gen' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* 2. Email Addresses (All Categories) */}
            <div className="space-y-2 pt-2 border-t border-slate-800/70">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Email Addresses (Work, Personal & Alternate)
                </span>
                <span className="text-[10px] text-slate-400">1-click Gmail & Outlook compose</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Primary Work Email */}
                <div className="bg-slate-900 p-2.5 rounded-lg border border-blue-500/20 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="flex items-center gap-1 text-blue-400 font-semibold">
                      ✉️ Verified Work Email
                    </span>
                    <span className="text-blue-400 font-semibold text-[9px] bg-blue-500/10 px-1 rounded">
                      SMTP 250 OK
                    </span>
                  </div>
                  {lead.email ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <a
                          href={getMailtoUrl(lead.email, `Opportunity Inquiry: ${lead.currentCompany}`)}
                          className="text-blue-300 font-mono text-xs truncate max-w-[130px] hover:underline"
                          title={lead.email}
                        >
                          {lead.email}
                        </a>
                        <button
                          onClick={() => copyText(lead.email, 'wemail')}
                          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                          title="Copy work email"
                        >
                          {copiedKey === 'wemail' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-1 pt-1 border-t border-slate-800/70">
                        <a
                          href={getGmailComposeUrl(lead.email, `Opportunity: ${lead.currentCompany}`, `Hi ${lead.firstName},\n\n`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-0.5 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[9px] font-medium flex items-center justify-center gap-1 transition-colors border border-slate-700"
                          title="Compose in Gmail"
                        >
                          <Mail className="w-2.5 h-2.5 text-red-400" />
                          <span>Gmail</span>
                        </a>
                        <a
                          href={getOutlookComposeUrl(lead.email, `Opportunity: ${lead.currentCompany}`, `Hi ${lead.firstName},\n\n`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-0.5 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[9px] font-medium flex items-center justify-center gap-1 transition-colors border border-slate-700"
                          title="Compose in Outlook"
                        >
                          <Mail className="w-2.5 h-2.5 text-blue-400" />
                          <span>Outlook</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic text-[11px]">No work email on file</p>
                  )}
                </div>

                {/* 2. Personal Email */}
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="flex items-center gap-1 text-slate-300 font-semibold">
                      👤 Personal Email
                    </span>
                    <span className="text-slate-400 text-[9px] bg-slate-800 px-1 rounded">
                      Secondary
                    </span>
                  </div>
                  {lead.secondaryEmail ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <a
                          href={getMailtoUrl(lead.secondaryEmail, `Connecting with ${lead.firstName}`)}
                          className="text-slate-300 font-mono text-xs truncate max-w-[130px] hover:underline"
                          title={lead.secondaryEmail}
                        >
                          {lead.secondaryEmail}
                        </a>
                        <button
                          onClick={() => copyText(lead.secondaryEmail!, 'semail')}
                          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                          title="Copy personal email"
                        >
                          {copiedKey === 'semail' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-1 pt-1 border-t border-slate-800/70">
                        <a
                          href={getGmailComposeUrl(lead.secondaryEmail, `Connecting with ${lead.firstName}`, `Hi ${lead.firstName},\n\n`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-0.5 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[9px] font-medium flex items-center justify-center gap-1 transition-colors border border-slate-700"
                          title="Compose in Gmail"
                        >
                          <Mail className="w-2.5 h-2.5 text-red-400" />
                          <span>Gmail</span>
                        </a>
                        <a
                          href={getOutlookComposeUrl(lead.secondaryEmail, `Connecting with ${lead.firstName}`, `Hi ${lead.firstName},\n\n`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-0.5 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[9px] font-medium flex items-center justify-center gap-1 transition-colors border border-slate-700"
                          title="Compose in Outlook"
                        >
                          <Mail className="w-2.5 h-2.5 text-blue-400" />
                          <span>Outlook</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic text-[11px]">No personal email on file</p>
                  )}
                </div>

                {/* 3. Alternate Corporate Email */}
                <div className="bg-slate-900 p-2.5 rounded-lg border border-indigo-500/20 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                      🌐 Alternate Corporate Email
                    </span>
                    <span className="text-indigo-400 text-[9px] bg-indigo-500/10 px-1 rounded">
                      Corporate Alt
                    </span>
                  </div>
                  {lead.alternateEmail ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <a
                          href={getMailtoUrl(lead.alternateEmail, `Opportunity Inquiry: ${lead.currentCompany}`)}
                          className="text-indigo-300 font-mono text-xs truncate max-w-[130px] hover:underline"
                          title={lead.alternateEmail}
                        >
                          {lead.alternateEmail}
                        </a>
                        <button
                          onClick={() => copyText(lead.alternateEmail!, 'aemail')}
                          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                          title="Copy alternate email"
                        >
                          {copiedKey === 'aemail' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-1 pt-1 border-t border-slate-800/70">
                        <a
                          href={getGmailComposeUrl(lead.alternateEmail, `Opportunity: ${lead.currentCompany}`, `Hi ${lead.firstName},\n\n`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-0.5 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[9px] font-medium flex items-center justify-center gap-1 transition-colors border border-slate-700"
                          title="Compose in Gmail"
                        >
                          <Mail className="w-2.5 h-2.5 text-red-400" />
                          <span>Gmail</span>
                        </a>
                        <a
                          href={getOutlookComposeUrl(lead.alternateEmail, `Opportunity: ${lead.currentCompany}`, `Hi ${lead.firstName},\n\n`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-0.5 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[9px] font-medium flex items-center justify-center gap-1 transition-colors border border-slate-700"
                          title="Compose in Outlook"
                        >
                          <Mail className="w-2.5 h-2.5 text-blue-400" />
                          <span>Outlook</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic text-[11px]">No alternate email on file</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Cold Outreach Icebreaker Generator */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-slate-100 text-xs">
                  AI Personalized Outreach Hook
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                {(['executive', 'concise', 'warm'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setHookTone(t)}
                    className={`px-2 py-0.5 rounded capitalize ${hookTone === t ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-slate-400 text-[11px]">
              Synthesizes an opening hook referencing {lead.firstName}'s career at {lead.currentCompany} and past experience.
            </p>

            <button
              onClick={handleGenerateHook}
              disabled={isGeneratingHook}
              className="w-full py-2 px-3 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingHook ? 'Synthesizing...' : 'Generate Personalized Cold Hook'}</span>
            </button>

            {generatedHook && (
              <div className="bg-slate-950 p-3 rounded-lg border border-indigo-500/30 space-y-2 animate-in fade-in">
                <p className="text-slate-200 text-xs leading-relaxed italic">
                  "{generatedHook}"
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => copyText(generatedHook, 'ai-hook')}
                    className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                  >
                    {copiedKey === 'ai-hook' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Hook</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sequence Cadence Status */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="font-semibold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              Automated Outreach Cadence
            </span>

            {lead.sequenceName ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="font-semibold text-white text-xs">{lead.sequenceName}</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Current cadence step: <strong className="text-indigo-400">Step {lead.sequenceStep || 1} of {sequences.find(s => s.id === lead.sequenceId)?.steps.length ?? '?'}</strong>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {lead.sequenceStatus || 'active'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAdvanceLead(lead.id)}
                    className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Execute & Advance to Next Step</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={selectedSequenceId}
                  onChange={(e) => setSelectedSequenceId(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  {sequences.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.steps.length} steps)</option>
                  ))}
                </select>
                <button
                  onClick={() => onEnrollLead(lead.id, selectedSequenceId)}
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-xs whitespace-nowrap"
                >
                  Enroll Lead
                </button>
              </div>
            )}
          </div>

          {/* Job History Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                Verified Job & Career History
              </span>
              <span className="text-slate-500 text-[11px]">
                {lead.jobHistory.length} positions extracted
              </span>
            </div>

            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {lead.jobHistory.map((job) => (
                <div key={job.id} className="relative pl-7 group">
                  <div className={`absolute left-2 top-1.5 w-2.5 h-2.5 rounded-full -translate-x-1/2 border-2 ${
                    job.isCurrent ? 'bg-indigo-500 border-indigo-400 ring-4 ring-indigo-500/20' : 'bg-slate-800 border-slate-600'
                  }`} />
                  
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-100 text-xs">{job.title}</h4>
                      {job.isCurrent && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded">
                          Current Role
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <a
                        href={getCompanyWebsiteUrl(undefined, job.company)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 font-medium hover:text-indigo-400 hover:underline flex items-center gap-1 transition-colors"
                        title={`Open ${job.company} website`}
                      >
                        <span>{job.company}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                      <span>•</span>
                      <span>{job.period}</span>
                      <span>•</span>
                      <span className="text-slate-500">({job.duration})</span>
                    </div>
                    {job.description && (
                      <p className="text-slate-400 text-[11px] leading-relaxed pt-1">
                        {job.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education & Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Education */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                Education
              </span>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1">
                {lead.education.length > 0 ? (
                  lead.education.map(edu => (
                    <div key={edu.id}>
                      <p className="font-semibold text-slate-200 text-xs">{edu.school}</p>
                      <p className="text-slate-400 text-[11px]">{edu.degree}</p>
                      <p className="text-slate-500 text-[10px]">{edu.years}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No formal education listed</p>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Top Domain Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {lead.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 text-[10px]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Notes & Rep Log */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Prospect Notes & Deal Context
            </span>
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add qualification notes, objection handling, or call logs..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium border border-slate-700"
              >
                Save Notes
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
