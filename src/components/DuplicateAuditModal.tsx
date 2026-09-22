import React, { useState } from 'react';
import { 
  CopyCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Merge, 
  Trash2, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink,
  Plus,
  Sparkles,
  Phone,
  Mail,
  Building2,
  Check
} from 'lucide-react';
import { Lead, DuplicateMatch } from '../types';
import { findDuplicateMatches, mergeLeads } from '../services/deduplicationService';

interface DuplicateAuditProps {
  leads: Lead[];
  onMergeLeads: (mergedLead: Lead, removedLeadId: string) => void;
  onSimulateDuplicate: () => void;
}

export const DuplicateAudit: React.FC<DuplicateAuditProps> = ({
  leads,
  onMergeLeads,
  onSimulateDuplicate
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'exact' | 'fuzzy'>('all');
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  // Scan leads for duplicates
  const allDuplicates: { leadA: Lead; leadB: Lead; match: DuplicateMatch }[] = [];
  const checkedPairs = new Set<string>();

  for (let i = 0; i < leads.length; i++) {
    const leadA = leads[i];
    for (let j = i + 1; j < leads.length; j++) {
      const leadB = leads[j];
      const pairKey = [leadA.id, leadB.id].sort().join('_');
      if (checkedPairs.has(pairKey)) continue;
      checkedPairs.add(pairKey);

      const matches = findDuplicateMatches(leadB, [leadA]);
      if (matches.length > 0) {
        allDuplicates.push({
          leadA,
          leadB,
          match: matches[0]
        });
      }
    }
  }

  const handleMerge = (leadA: Lead, leadB: Lead) => {
    // Merge B into A
    const merged = mergeLeads(leadA, leadB);
    onMergeLeads(merged, leadB.id);
    setResolvedIds(prev => [...prev, `${leadA.id}_${leadB.id}`]);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Banner / Overview */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 flex-shrink-0">
              <CopyCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Lead Duplicacy Defense & CRM Hygiene
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  Real-time Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Automatically flags duplicate contacts across LinkedIn public URLs, direct mobile phones, corporate emails, and fuzzy full-name matches to prevent sales rep conflicts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSimulateDuplicate}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate Adding Duplicate Lead</span>
            </button>
          </div>
        </div>

        {/* Deduplication Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px]">Total CRM Records</span>
            <p className="text-xl font-bold text-white mt-0.5">{leads.length}</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px]">Duplicate Conflicts</span>
            <p className={`text-xl font-bold mt-0.5 ${allDuplicates.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {allDuplicates.length}
            </p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px]">Database Health</span>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">
              {allDuplicates.length === 0 ? '100% Clean' : `${Math.round((1 - allDuplicates.length / leads.length) * 100)}% Clean`}
            </p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px]">Matching Criteria</span>
            <p className="text-xs font-medium text-slate-300 mt-1">
              LinkedIn • Email • Mobile • Name
            </p>
          </div>
        </div>
      </div>

      {/* Duplicate Pairs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Detected Duplicate Pairs ({allDuplicates.length})</span>
          </h3>
        </div>

        {allDuplicates.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">No Duplicate Leads Found</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your CRM database has zero duplicate records. When you enrich contacts or import leads from the browser extension, duplicates will be detected in real-time.
            </p>
            <button
              onClick={onSimulateDuplicate}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Simulate Duplicate Prospect To Test</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {allDuplicates.map(({ leadA, leadB, match }) => {
              const pairKey = `${leadA.id}_${leadB.id}`;
              const isResolved = resolvedIds.includes(pairKey);

              if (isResolved) return null;

              return (
                <div 
                  key={pairKey}
                  className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-lg space-y-4"
                >
                  {/* Alert Tag */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/40">
                        {match.confidenceScore}% Confidence Duplicate
                      </span>
                      <span className="text-xs text-slate-300 font-medium">
                        {match.matchReason}
                      </span>
                    </div>

                    <button
                      onClick={() => handleMerge(leadA, leadB)}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition-all"
                    >
                      <Merge className="w-3.5 h-3.5" />
                      <span>Smart Merge Records</span>
                    </button>
                  </div>

                  {/* Side-by-Side Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    
                    {/* Record 1 */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Existing Lead Record #1
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Added: {new Date(leadA.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white text-xs">
                          {leadA.firstName[0]}{leadA.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{leadA.fullName}</p>
                          <p className="text-indigo-400 text-xs">{leadA.currentTitle}</p>
                          <p className="text-slate-400 text-[11px]">{leadA.currentCompany}</p>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1 text-[11px]">
                        <div className="flex items-center gap-1 text-slate-300">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span className="font-mono">{leadA.phone || 'No phone recorded'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-300">
                          <Mail className="w-3 h-3 text-blue-400" />
                          <span className="font-mono">{leadA.email || 'No email recorded'}</span>
                        </div>
                        <div className="text-slate-500 text-[10px]">
                          Pipeline Stage: <strong className="text-slate-300 capitalize">{leadA.stage}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Record 2 */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Duplicate Candidate Record #2
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Added: {new Date(leadB.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white text-xs">
                          {leadB.firstName[0]}{leadB.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{leadB.fullName}</p>
                          <p className="text-indigo-400 text-xs">{leadB.currentTitle}</p>
                          <p className="text-slate-400 text-[11px]">{leadB.currentCompany}</p>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1 text-[11px]">
                        <div className="flex items-center gap-1 text-slate-300">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span className="font-mono">{leadB.phone || 'No phone recorded'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-300">
                          <Mail className="w-3 h-3 text-blue-400" />
                          <span className="font-mono">{leadB.email || 'No email recorded'}</span>
                        </div>
                        <div className="text-slate-500 text-[10px]">
                          Pipeline Stage: <strong className="text-slate-300 capitalize">{leadB.stage}</strong>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Resolution Footnote */}
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>
                      Smart Merge combines contact records, preserves the verified direct mobile, appends past job experiences, and deletes the redundant profile safely.
                    </span>
                    <button
                      onClick={() => handleMerge(leadA, leadB)}
                      className="text-purple-400 hover:text-purple-300 font-semibold text-xs ml-3 whitespace-nowrap"
                    >
                      Resolve & Merge →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
