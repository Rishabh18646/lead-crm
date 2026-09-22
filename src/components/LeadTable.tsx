import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  MapPin, 
  Briefcase, 
  ChevronRight, 
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  Send, 
  Trash2, 
  Filter, 
  CopyCheck, 
  Check, 
  Copy,
  Sparkles,
  Download,
  UserPlus,
  FileSpreadsheet
} from 'lucide-react';
import { Lead, LeadStage, UserProfile } from '../types';
import { getCompanyWebsiteUrl, getGmailComposeUrl, getOutlookComposeUrl, getMailtoUrl } from '../utils/linkUtils';

interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdateStage: (leadId: string, stage: LeadStage) => void;
  onDeleteLead: (leadId: string) => void;
  onBulkEnroll: (leadIds: string[]) => void;
  onBulkExport: (leadIds: string[]) => void;
  onRunDedup: () => void;
  onOpenEnrichModal: () => void;
  onOpenExcelImportModal?: () => void;
  currentUser?: UserProfile | null;
}

const STAGE_CONFIG: Record<LeadStage, { label: string; bg: string; text: string; border: string }> = {
  new: { label: 'New Lead', bg: 'bg-slate-800/80', text: 'text-slate-300', border: 'border-slate-700' },
  enriched: { label: 'Enriched', bg: 'bg-blue-950/60', text: 'text-blue-400', border: 'border-blue-800/60' },
  in_sequence: { label: 'In Sequence', bg: 'bg-indigo-950/60', text: 'text-indigo-400', border: 'border-indigo-800/60' },
  contacted: { label: 'Contacted', bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-800/60' },
  meeting_booked: { label: 'Meeting Booked', bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-700/60' },
  qualified: { label: 'Qualified Deal', bg: 'bg-purple-950/60', text: 'text-purple-300', border: 'border-purple-700/60' },
  won: { label: 'Closed Won', bg: 'bg-teal-950/60', text: 'text-teal-300', border: 'border-teal-700/60' },
  lost: { label: 'Disqualified', bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-800/40' }
};

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  onSelectLead,
  onUpdateStage,
  onDeleteLead,
  onBulkEnroll,
  onBulkExport,
  onRunDedup,
  onOpenEnrichModal,
  onOpenExcelImportModal,
  currentUser
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [contactFilter, setContactFilter] = useState<'all' | 'has_mobile' | 'verified_email'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    if (stageFilter !== 'all' && lead.stage !== stageFilter) return false;
    if (contactFilter === 'has_mobile' && !lead.phone && !lead.mobilePhone && !lead.directPhone && !lead.hqPhone) return false;
    if (contactFilter === 'verified_email' && lead.emailStatus !== 'verified' && !lead.email) return false;
    return true;
  });

  // Reset page when filter or total leads change
  useEffect(() => {
    setCurrentPage(1);
  }, [stageFilter, contactFilter, leads.length]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredLeads.length);
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  const isCurrentPageFullySelected = paginatedLeads.length > 0 && paginatedLeads.every(l => selectedIds.includes(l.id));

  const toggleSelectCurrentPage = () => {
    if (isCurrentPageFullySelected) {
      setSelectedIds(prev => prev.filter(id => !paginatedLeads.some(l => l.id === id)));
    } else {
      const pageIds = paginatedLeads.map(l => l.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const selectAllFiltered = () => {
    setSelectedIds(filteredLeads.map(l => l.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handlePageChange = (newPage: number) => {
    const valid = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(valid);
    // Smoothly scroll table container into view if scrolled down
    const tableEl = document.getElementById('lead-table-anchor');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const copyToClipboard = (text: string, key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="space-y-4" id="lead-table-anchor">
      {/* Control bar: Filters, Metrics summary, & Bulk actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
        
        {/* Stage & Contact Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Stages ({leads.length})</option>
            <option value="new">New ({leads.filter(l => l.stage === 'new').length})</option>
            <option value="enriched">Enriched ({leads.filter(l => l.stage === 'enriched').length})</option>
            <option value="in_sequence">In Sequence ({leads.filter(l => l.stage === 'in_sequence').length})</option>
            <option value="contacted">Contacted ({leads.filter(l => l.stage === 'contacted').length})</option>
            <option value="meeting_booked">Meeting Booked ({leads.filter(l => l.stage === 'meeting_booked').length})</option>
            <option value="qualified">Qualified ({leads.filter(l => l.stage === 'qualified').length})</option>
          </select>

          {/* Quick Contact Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setContactFilter('all')}
              className={`px-2 py-0.5 rounded ${contactFilter === 'all' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              All ({filteredLeads.length})
            </button>
            <button
              onClick={() => setContactFilter('has_mobile')}
              className={`px-2 py-0.5 rounded flex items-center gap-1 ${contactFilter === 'has_mobile' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Phone className="w-3 h-3" />
              <span>With Mobile</span>
            </button>
            <button
              onClick={() => setContactFilter('verified_email')}
              className={`px-2 py-0.5 rounded flex items-center gap-1 ${contactFilter === 'verified_email' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Mail className="w-3 h-3" />
              <span>Verified Email</span>
            </button>
          </div>
        </div>

        {/* Action Controls & Excel Import Button */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenExcelImportModal && (
            <button
              onClick={onOpenExcelImportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              title="Import 1,000+ leads via Excel (.xlsx) or CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Import Excel Sheet (1000+)</span>
            </button>
          )}

          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-700/60 px-3 py-1 rounded-lg animate-in fade-in">
              <span className="text-xs font-semibold text-indigo-300">
                {selectedIds.length.toLocaleString()} selected
              </span>
              <button
                onClick={() => onBulkEnroll(selectedIds)}
                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>Enroll in Sequence</span>
              </button>
              <button
                onClick={() => onBulkExport(selectedIds)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={clearSelection}
                className="text-xs text-slate-400 hover:text-white px-1"
                title="Deselect all"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onRunDedup}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
              >
                <CopyCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Scan CRM Duplicates</span>
              </button>
              <button
                onClick={() => onBulkExport(leads.map(l => l.id))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export ({leads.length.toLocaleString()})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Select all across pages banner */}
      {isCurrentPageFullySelected && filteredLeads.length > paginatedLeads.length && (
        <div className="bg-indigo-950/60 border border-indigo-700/60 px-4 py-2 rounded-xl flex items-center justify-between text-xs text-indigo-300 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span>
              All <strong>{paginatedLeads.length}</strong> leads on this page are selected.
            </span>
            {selectedIds.length < filteredLeads.length && (
              <button
                onClick={selectAllFiltered}
                className="font-bold text-white underline hover:text-indigo-200 ml-2"
              >
                Select all {filteredLeads.length.toLocaleString()} leads across all pages
              </button>
            )}
          </div>
          {selectedIds.length === filteredLeads.length && (
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> All {filteredLeads.length.toLocaleString()} leads selected
            </span>
          )}
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    checked={isCurrentPageFullySelected}
                    onChange={toggleSelectCurrentPage}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                </th>
                <th className="p-3">Prospect & Role</th>
                <th className="p-3">Company & Past History</th>
                <th className="p-3">Phone Numbers (3 Categories)</th>
                <th className="p-3">Email Addresses (All)</th>
                <th className="p-3">Pipeline Stage</th>
                <th className="p-3">Outreach Sequence</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-200">No leads found in this filter view</p>
                      <p className="text-xs text-slate-500">
                        Extract contacts directly using the LinkedIn Browser Extension or click Enrich to pull public profile data.
                      </p>
                      <button
                        onClick={onOpenEnrichModal}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Enrich First Prospect</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const isSelected = selectedIds.includes(lead.id);
                  const stage = STAGE_CONFIG[lead.stage];
                  const previousJob = lead.jobHistory.find(j => !j.isCurrent);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className={`group hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        isSelected ? 'bg-indigo-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(lead.id)}
                          className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                      </td>

                      {/* Prospect Name & Title */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            {lead.avatarUrl ? (
                              <img
                                src={lead.avatarUrl}
                                alt={lead.fullName}
                                className="w-9 h-9 rounded-full object-cover border border-slate-700"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-semibold text-xs">
                                {lead.firstName[0]}{lead.lastName[0]}
                              </div>
                            )}
                            {lead.linkedinUrl && (
                              <a
                                href={lead.linkedinUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                title="Open LinkedIn Public Profile"
                                className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0A66C2] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                              >
                                <span className="text-[8px] font-black">in</span>
                              </a>
                            )}
                          </div>
                          <div className="min-w-0 max-w-[200px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                                {lead.fullName}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">
                              {lead.currentTitle}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5" />
                              {lead.location}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Company & Career History */}
                      <td className="p-3">
                        <div className="space-y-1 max-w-[180px]">
                          <a
                            href={getCompanyWebsiteUrl(lead.companyDomain, lead.currentCompany)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title={`Open ${lead.currentCompany} website in new tab`}
                            className="flex items-center gap-1.5 text-slate-200 hover:text-indigo-400 font-medium truncate group/link transition-colors"
                          >
                            <Building2 className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-indigo-400 flex-shrink-0" />
                            <span className="truncate hover:underline underline-offset-2">{lead.currentCompany}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-slate-500 group-hover/link:text-indigo-400 opacity-60 group-hover/link:opacity-100 flex-shrink-0" />
                          </a>
                          {previousJob && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                              <span className="text-slate-500">Ex:</span>
                              <span className="bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700 truncate">
                                {previousJob.company} ({previousJob.duration})
                              </span>
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500 truncate">
                            {lead.jobHistory.length} recorded positions
                          </div>
                        </div>
                      </td>

                      {/* Phone Numbers (All 3 Categories) */}
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        {(() => {
                          const mPhone = lead.mobilePhone || (lead.phoneType === 'mobile' ? lead.phone : '');
                          const dPhone = lead.directPhone || (lead.phoneType === 'direct' ? lead.phone : '');
                          const hPhone = lead.hqPhone || (lead.phoneType === 'hq' ? lead.phone : '');
                          const fallbackPhone = (!mPhone && !dPhone && !hPhone) ? lead.phone : '';

                          const hasAnyPhone = mPhone || dPhone || hPhone || fallbackPhone;

                          if (!hasAnyPhone) {
                            return (
                              <button
                                onClick={() => onSelectLead(lead)}
                                className="text-[11px] text-slate-500 hover:text-indigo-400 flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Find Numbers</span>
                              </button>
                            );
                          }

                          return (
                            <div className="space-y-1.5 max-w-[200px]">
                              {/* 1. Mobile Phone */}
                              {mPhone && (
                                <div className="flex items-center justify-between gap-1 group/row">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className="px-1 py-0.2 text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded flex-shrink-0">
                                      Mobile
                                    </span>
                                    <a
                                      href={`tel:${mPhone}`}
                                      className="font-mono text-emerald-400 hover:text-emerald-300 font-medium hover:underline text-xs truncate"
                                      title={`Dial Mobile: ${mPhone}`}
                                    >
                                      {mPhone}
                                    </a>
                                  </div>
                                  <button
                                    onClick={(e) => copyToClipboard(mPhone, `mphone-${lead.id}`, e)}
                                    title="Copy mobile number"
                                    className="text-slate-500 hover:text-slate-300 p-0.5 flex-shrink-0"
                                  >
                                    {copiedKey === `mphone-${lead.id}` ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              )}

                              {/* 2. Direct Work Phone */}
                              {dPhone && (
                                <div className="flex items-center justify-between gap-1 group/row">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className="px-1 py-0.2 text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded flex-shrink-0">
                                      Direct
                                    </span>
                                    <a
                                      href={`tel:${dPhone}`}
                                      className="font-mono text-blue-300 hover:text-blue-200 font-medium hover:underline text-xs truncate"
                                      title={`Dial Direct Line: ${dPhone}`}
                                    >
                                      {dPhone}
                                    </a>
                                  </div>
                                  <button
                                    onClick={(e) => copyToClipboard(dPhone, `dphone-${lead.id}`, e)}
                                    title="Copy direct phone number"
                                    className="text-slate-500 hover:text-slate-300 p-0.5 flex-shrink-0"
                                  >
                                    {copiedKey === `dphone-${lead.id}` ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              )}

                              {/* 3. Company HQ Phone */}
                              {hPhone && (
                                <div className="flex items-center justify-between gap-1 group/row">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className="px-1 py-0.2 text-[9px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded flex-shrink-0">
                                      HQ
                                    </span>
                                    <a
                                      href={`tel:${hPhone}`}
                                      className="font-mono text-purple-300 hover:text-purple-200 font-medium hover:underline text-xs truncate"
                                      title={`Dial HQ Switchboard: ${hPhone}`}
                                    >
                                      {hPhone}
                                    </a>
                                  </div>
                                  <button
                                    onClick={(e) => copyToClipboard(hPhone, `hphone-${lead.id}`, e)}
                                    title="Copy HQ switchboard phone"
                                    className="text-slate-500 hover:text-slate-300 p-0.5 flex-shrink-0"
                                  >
                                    {copiedKey === `hphone-${lead.id}` ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              )}

                              {/* Fallback Phone if none of the above */}
                              {fallbackPhone && (
                                <div className="flex items-center justify-between gap-1 group/row">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className="px-1 py-0.2 text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700 rounded flex-shrink-0">
                                      Phone
                                    </span>
                                    <a
                                      href={`tel:${fallbackPhone}`}
                                      className="font-mono text-emerald-400 hover:text-emerald-300 font-medium hover:underline text-xs truncate"
                                      title={`Dial: ${fallbackPhone}`}
                                    >
                                      {fallbackPhone}
                                    </a>
                                  </div>
                                  <button
                                    onClick={(e) => copyToClipboard(fallbackPhone, `phone-${lead.id}`, e)}
                                    title="Copy phone number"
                                    className="text-slate-500 hover:text-slate-300 p-0.5 flex-shrink-0"
                                  >
                                    {copiedKey === `phone-${lead.id}` ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Email Addresses (All Categories) */}
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        {(() => {
                          const hasEmail = lead.email || lead.secondaryEmail || lead.alternateEmail;

                          if (!hasEmail) {
                            return <span className="text-[11px] text-slate-500">No email found</span>;
                          }

                          return (
                            <div className="space-y-1.5 max-w-[210px]">
                              {/* Primary / Work Email */}
                              {lead.email && (
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className="px-1 py-0.2 text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded flex-shrink-0">
                                      Work
                                    </span>
                                    <a
                                      href={getMailtoUrl(lead.email, `Inquiry: ${lead.currentCompany}`)}
                                      className="text-slate-200 hover:text-indigo-400 font-mono text-xs truncate hover:underline"
                                      title={`Send email to ${lead.email}`}
                                    >
                                      {lead.email}
                                    </a>
                                  </div>
                                  <div className="flex items-center gap-0.5 flex-shrink-0">
                                    <a
                                      href={getGmailComposeUrl(lead.email, `Inquiry: ${lead.currentCompany}`)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Compose in Gmail (New tab)"
                                      className="p-0.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                                    >
                                      <Mail className="w-3 h-3" />
                                    </a>
                                    <button
                                      onClick={(e) => copyToClipboard(lead.email, `email-${lead.id}`, e)}
                                      title="Copy work email"
                                      className="text-slate-500 hover:text-slate-300 p-0.5"
                                    >
                                      {copiedKey === `email-${lead.id}` ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Secondary / Personal Email */}
                              {lead.secondaryEmail && (
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className="px-1 py-0.2 text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700 rounded flex-shrink-0">
                                      Personal
                                    </span>
                                    <a
                                      href={getMailtoUrl(lead.secondaryEmail, `Connecting with ${lead.firstName}`)}
                                      className="text-slate-300 hover:text-indigo-400 font-mono text-xs truncate hover:underline"
                                      title={`Send email to ${lead.secondaryEmail}`}
                                    >
                                      {lead.secondaryEmail}
                                    </a>
                                  </div>
                                  <div className="flex items-center gap-0.5 flex-shrink-0">
                                    <a
                                      href={getGmailComposeUrl(lead.secondaryEmail, `Connecting with ${lead.firstName}`)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Compose in Gmail (New tab)"
                                      className="p-0.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                                    >
                                      <Mail className="w-3 h-3" />
                                    </a>
                                    <button
                                      onClick={(e) => copyToClipboard(lead.secondaryEmail!, `semail-${lead.id}`, e)}
                                      title="Copy personal email"
                                      className="text-slate-500 hover:text-slate-300 p-0.5"
                                    >
                                      {copiedKey === `semail-${lead.id}` ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Alternate / Corporate Email */}
                              {lead.alternateEmail && (
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className="px-1 py-0.2 text-[9px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded flex-shrink-0">
                                      Alt
                                    </span>
                                    <a
                                      href={getMailtoUrl(lead.alternateEmail, `Inquiry: ${lead.currentCompany}`)}
                                      className="text-indigo-200 hover:text-indigo-300 font-mono text-xs truncate hover:underline"
                                      title={`Send email to ${lead.alternateEmail}`}
                                    >
                                      {lead.alternateEmail}
                                    </a>
                                  </div>
                                  <div className="flex items-center gap-0.5 flex-shrink-0">
                                    <a
                                      href={getGmailComposeUrl(lead.alternateEmail, `Inquiry: ${lead.currentCompany}`)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Compose in Gmail (New tab)"
                                      className="p-0.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                                    >
                                      <Mail className="w-3 h-3" />
                                    </a>
                                    <button
                                      onClick={(e) => copyToClipboard(lead.alternateEmail!, `aemail-${lead.id}`, e)}
                                      title="Copy alternate email"
                                      className="text-slate-500 hover:text-slate-300 p-0.5"
                                    >
                                      {copiedKey === `aemail-${lead.id}` ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Pipeline Stage Dropdown */}
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.stage}
                          onChange={(e) => onUpdateStage(lead.id, e.target.value as LeadStage)}
                          className={`text-xs px-2 py-1 rounded-md font-medium border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${stage.bg} ${stage.text} ${stage.border}`}
                        >
                          <option value="new">New Lead</option>
                          <option value="enriched">Enriched</option>
                          <option value="in_sequence">In Sequence</option>
                          <option value="contacted">Contacted</option>
                          <option value="meeting_booked">Meeting Booked</option>
                          <option value="qualified">Qualified</option>
                          <option value="won">Closed Won</option>
                          <option value="lost">Disqualified</option>
                        </select>
                      </td>

                      {/* Outreach Sequence */}
                      <td className="p-3">
                        {lead.sequenceName ? (
                          <div className="space-y-0.5 max-w-[150px]">
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-full truncate block">
                              {lead.sequenceName}
                            </span>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <span>Step {lead.sequenceStep || 1}/4</span>
                              <span className="text-slate-600">•</span>
                              <span className="capitalize text-emerald-400">{lead.sequenceStatus || 'active'}</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onBulkEnroll([lead.id]);
                            }}
                            className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 py-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Enroll</span>
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onSelectLead(lead)}
                            title="Open Lead Dossier"
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteLead(lead.id)}
                            title="Delete Lead"
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredLeads.length > 0 && (
          <div className="border-t border-slate-800 bg-slate-950/70 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            
            {/* Range and counts */}
            <div className="flex items-center gap-3">
              <span>
                Showing <strong className="text-white font-mono">{(startIndex + 1).toLocaleString()}</strong> – <strong className="text-white font-mono">{endIndex.toLocaleString()}</strong> of <strong className="text-emerald-400 font-mono">{filteredLeads.length.toLocaleString()}</strong> leads
              </span>

              {/* Page size selector */}
              <div className="flex items-center gap-1.5 ml-2 border-l border-slate-800 pl-3">
                <span className="text-slate-500">Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={250}>250</option>
                  <option value={500}>500</option>
                </select>
              </div>
            </div>

            {/* Page navigation buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={() => handlePageChange(safePage - 1)}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="px-3 py-1 font-medium text-slate-300">
                Page <strong className="text-white">{safePage}</strong> of <strong className="text-white">{totalPages}</strong>
              </span>

              <button
                onClick={() => handlePageChange(safePage + 1)}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                title="Last Page"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
