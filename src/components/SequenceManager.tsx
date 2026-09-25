import React, { useState } from 'react';
import { 
  Send, 
  Plus, 
  Clock, 
  Mail, 
  Phone, 
  Linkedin, 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  Play, 
  Pause,
  Copy,
  Check,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { OutreachSequence, SequenceStep, Lead, SequenceChannel } from '../types';
import { renderTemplate } from '../services/outreachService';

interface SequenceManagerProps {
  sequences: OutreachSequence[];
  leads: Lead[];
  onUpdateSequence: (seq: OutreachSequence) => void;
  onCreateSequence: (seq: OutreachSequence) => void;
  onAdvanceLeadInSequence: (leadId: string) => void;
}

const CHANNEL_ICONS: Record<SequenceChannel, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  email: { icon: Mail, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', label: 'Automated Email' },
  linkedin_connect: { icon: Linkedin, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30', label: 'LinkedIn Connect' },
  linkedin_inmail: { icon: MessageSquare, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', label: 'LinkedIn InMail' },
  call: { icon: Phone, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', label: 'Direct Phone Call' },
  wait: { icon: Clock, color: 'text-slate-400 bg-slate-500/10 border-slate-500/30', label: 'Wait Delay' }
};

export const SequenceManager: React.FC<SequenceManagerProps> = ({
  sequences,
  leads,
  onUpdateSequence,
  onCreateSequence,
  onAdvanceLeadInSequence
}) => {
  const [selectedSeqId, setSelectedSeqId] = useState<string>(sequences[0]?.id || '');
  const [previewLeadId, setPreviewLeadId] = useState<string>(leads[0]?.id || '');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [copiedTemplate, setCopiedTemplate] = useState<boolean>(false);

  const currentSequence = sequences.find(s => s.id === selectedSeqId) || sequences[0];
  const previewLead = leads.find(l => l.id === previewLeadId) || leads[0];

  const enrolledLeads = leads.filter(l => l.sequenceId === currentSequence?.id);

  const insertVariable = (tag: string) => {
    if (!currentSequence) return;
    const currentStep = currentSequence.steps[activeStepIndex];
    if (!currentStep) return;

    const updatedSteps = [...currentSequence.steps];
    updatedSteps[activeStepIndex] = {
      ...currentStep,
      templateBody: `${currentStep.templateBody} ${tag}`
    };

    onUpdateSequence({
      ...currentSequence,
      steps: updatedSteps
    });
  };

  const handleStepTextChange = (field: 'templateSubject' | 'templateBody', val: string) => {
    if (!currentSequence) return;
    const currentStep = currentSequence.steps[activeStepIndex];
    if (!currentStep) return;

    const updatedSteps = [...currentSequence.steps];
    updatedSteps[activeStepIndex] = {
      ...currentStep,
      [field]: val
    };

    onUpdateSequence({
      ...currentSequence,
      steps: updatedSteps
    });
  };

  const currentStep = currentSequence?.steps[activeStepIndex];
  const renderedSubject = previewLead && currentStep?.templateSubject ? renderTemplate(currentStep.templateSubject, previewLead) : '';
  const renderedBody = previewLead && currentStep?.templateBody ? renderTemplate(currentStep.templateBody, previewLead) : '';

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Sequences Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Automated Sales Outreach Sequences
            </h2>
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Multi-Touch Cadence
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Build multichannel sequences combining LinkedIn connection requests, verified direct emails, and phone call reminders.
          </p>
        </div>

        {/* Sequence Selector Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {sequences.map(seq => (
            <button
              key={seq.id}
              onClick={() => {
                setSelectedSeqId(seq.id);
                setActiveStepIndex(0);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedSeqId === seq.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>{seq.name}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${selectedSeqId === seq.id ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'}`}>
                  {seq.enrolledCount} leads
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {currentSequence && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Sequence Performance Stats & Cadence Steps (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Sequence Metrics Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">{currentSequence.name}</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                  {currentSequence.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">{currentSequence.description}</p>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Enrolled</span>
                  <span className="text-sm font-bold text-slate-100">{currentSequence.enrolledCount}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Open Rate</span>
                  <span className="text-sm font-bold text-cyan-400">{currentSequence.openRate}%</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Reply Rate</span>
                  <span className="text-sm font-bold text-emerald-400">{currentSequence.replyRate}%</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Meetings</span>
                  <span className="text-sm font-bold text-indigo-300">{currentSequence.meetingCount}</span>
                </div>
              </div>
            </div>

            {/* Step-by-Step Cadence Timeline */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Outreach Cadence Steps ({currentSequence.steps.length})
                </span>
                <span className="text-[10px] text-slate-500">Select step to edit</span>
              </div>

              <div className="space-y-2">
                {currentSequence.steps.map((step, idx) => {
                  const channelInfo = CHANNEL_ICONS[step.channel];
                  const Icon = channelInfo.icon;
                  const isSelected = activeStepIndex === idx;

                  return (
                    <div
                      key={step.id}
                      onClick={() => setActiveStepIndex(idx)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className={`p-2 rounded-lg border ${channelInfo.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-100 truncate">
                            Step {step.order}: {channelInfo.label}
                          </span>
                          <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.2 rounded">
                            Day {step.day}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {step.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enrolled Prospects in this Sequence */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  Active Enrolled Leads ({enrolledLeads.length})
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {enrolledLeads.length === 0 ? (
                  <p className="text-slate-500 text-xs text-center py-4">No leads currently enrolled</p>
                ) : (
                  enrolledLeads.map(lead => (
                    <div
                      key={lead.id}
                      className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white block">{lead.fullName}</span>
                        <span className="text-[11px] text-slate-400">{lead.currentTitle} @ {lead.currentCompany}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                          Step {lead.sequenceStep || 1}/{currentSequence.steps.length}
                        </span>
                        <button
                          onClick={() => onAdvanceLeadInSequence(lead.id)}
                          className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                          title="Advance lead to next sequence touchpoint"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Step Editor & Live Variable Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {currentStep ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
                
                {/* Editor Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Step {currentStep.order} Editor</span>
                      <span className="text-xs text-indigo-400 font-normal">
                        ({CHANNEL_ICONS[currentStep.channel].label} • Offset Day {currentStep.day})
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{currentStep.title}</p>
                  </div>

                  {/* Preview Selector */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400">Preview with:</span>
                    <select
                      value={previewLeadId}
                      onChange={(e) => setPreviewLeadId(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-1.5 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      {leads.map(l => (
                        <option key={l.id} value={l.id}>{l.fullName} ({l.currentCompany})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Variable Tags Toolbar */}
                <div className="space-y-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Click to insert dynamic personalization variables:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      '{{first_name}}',
                      '{{last_name}}',
                      '{{company}}',
                      '{{title}}',
                      '{{previous_company}}',
                      '{{location}}',
                      '{{phone}}'
                    ].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => insertVariable(tag)}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-indigo-950 hover:text-indigo-300 text-slate-300 rounded border border-slate-700 text-[11px] font-mono transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject Line (if email) */}
                {currentStep.templateSubject !== undefined && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Email Subject Line
                    </label>
                    <input
                      type="text"
                      value={currentStep.templateSubject}
                      onChange={(e) => handleStepTextChange('templateSubject', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {/* Message Body Template */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Message Template Copy
                  </label>
                  <textarea
                    rows={6}
                    value={currentStep.templateBody}
                    onChange={(e) => handleStepTextChange('templateBody', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                {/* Live Real-Time Rendering for Preview Lead */}
                <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Live Rendered Preview for {previewLead?.fullName || 'Prospect'}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(renderedBody);
                        setCopiedTemplate(true);
                        setTimeout(() => setCopiedTemplate(false), 2000);
                      }}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                    >
                      {copiedTemplate ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Rendered Message</span>
                    </button>
                  </div>

                  {renderedSubject && (
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Subject:</span>
                      <p className="text-xs font-semibold text-white mt-0.5">{renderedSubject}</p>
                    </div>
                  )}

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold mb-1">Body:</span>
                    <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                      {renderedBody}
                    </p>
                  </div>
                </div>

              </div>
            ) : null}
          </div>

        </div>
      )}

    </div>
  );
};
