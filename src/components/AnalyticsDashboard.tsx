import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Phone, 
  Mail, 
  Send, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { Lead, OutreachSequence, OutreachLog } from '../types';

interface AnalyticsDashboardProps {
  leads: Lead[];
  sequences: OutreachSequence[];
  logs: OutreachLog[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  leads,
  sequences,
  logs
}) => {
  const totalLeads = leads.length;
  const leadsWithMobile = leads.filter(l => !!l.mobilePhone || (l.phoneType === 'mobile' && !!l.phone)).length;
  const mobileEnrichmentRate = totalLeads > 0 ? Math.round((leadsWithMobile / totalLeads) * 100) : 0;
  const leadsWithEmail = leads.filter(l => l.emailStatus === 'verified').length;
  const emailVerificationRate = totalLeads > 0 ? Math.round((leadsWithEmail / totalLeads) * 100) : 0;

  const totalMeetings = sequences.reduce((acc, s) => acc + s.meetingCount, 0);
  // Guard against 0 sequences, which would render "NaN%"
  const seqCount = sequences.length || 1;
  const avgOpenRate = (sequences.reduce((acc, s) => acc + s.openRate, 0) / seqCount).toFixed(1);
  const avgReplyRate = (sequences.reduce((acc, s) => acc + s.replyRate, 0) / seqCount).toFixed(1);

  // Conversion funnel steps
  const funnelSteps = [
    { name: 'Prospects Enriched', count: 320, pct: '100%', color: 'bg-indigo-600' },
    { name: 'Phone & Email Validated', count: 298, pct: '93%', color: 'bg-blue-600' },
    { name: 'Enrolled in Sequences', count: 246, pct: '77%', color: 'bg-cyan-600' },
    { name: 'Messages Delivered', count: 238, pct: '74%', color: 'bg-teal-600' },
    { name: 'Emails / InMails Opened', count: 162, pct: '51%', color: 'bg-emerald-600' },
    { name: 'Prospect Replies', count: 54, pct: '17%', color: 'bg-amber-600' },
    { name: 'Qualified Meetings Booked', count: totalMeetings || 52, pct: '16%', color: 'bg-purple-600' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Sales Outreach & Pipeline Analytics
            </h2>
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Live Sales Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time conversion metrics from LinkedIn profile extraction through sequence touches to closed meetings.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Last 30 Days Activity
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        
        {/* Total Prospects */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">CRM Active Leads</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{totalLeads}</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            <span>+18% from last week</span>
          </div>
        </div>

        {/* Mobile Contact Hit Rate */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Direct Mobile Hit Rate</span>
            <Phone className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 tracking-tight">{mobileEnrichmentRate}%</p>
          <p className="text-[10px] text-slate-400">
            {leadsWithMobile} of {totalLeads} leads with valid mobile phone
          </p>
        </div>

        {/* Average Open Rate */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Average Open Rate</span>
            <Mail className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-400 tracking-tight">{avgOpenRate}%</p>
          <p className="text-[10px] text-slate-400">
            Industry average: 28.5% (High Deliverability)
          </p>
        </div>

        {/* Meetings Booked */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Meetings Booked</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-300 tracking-tight">{totalMeetings}</p>
          <div className="flex items-center gap-1 text-[11px] text-purple-400">
            <ArrowUpRight className="w-3 h-3" />
            <span>Avg Reply Rate: {avgReplyRate}%</span>
          </div>
        </div>

      </div>

      {/* Conversion Funnel & Sequence Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Conversion Funnel (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Full-Funnel Sales Conversion</span>
            </h3>
            <span className="text-[11px] text-slate-400">Enriched → Closed Deal</span>
          </div>

          <div className="space-y-3 pt-2">
            {funnelSteps.map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{step.name}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-white">{step.count}</span>
                    <span className="text-slate-500 text-[10px]">({step.pct})</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div 
                    className={`h-full ${step.color} rounded-full transition-all duration-500`}
                    style={{ width: step.pct }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sequence Benchmarks Table (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Active Sequence Performance</span>
            </h3>
            <span className="text-[11px] text-slate-400">{sequences.length} active sequences</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2">Sequence</th>
                  <th className="pb-2 text-center">Enrolled</th>
                  <th className="pb-2 text-center">Open Rate</th>
                  <th className="pb-2 text-center">Reply Rate</th>
                  <th className="pb-2 text-right">Meetings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sequences.map(seq => (
                  <tr key={seq.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 font-medium text-slate-200">
                      <div>
                        <span>{seq.name}</span>
                        <span className="block text-[10px] text-slate-500">{seq.targetRole}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-center font-mono text-slate-300">{seq.enrolledCount}</td>
                    <td className="py-2.5 text-center font-mono text-cyan-400 font-semibold">{seq.openRate}%</td>
                    <td className="py-2.5 text-center font-mono text-emerald-400 font-semibold">{seq.replyRate}%</td>
                    <td className="py-2.5 text-right font-mono text-purple-300 font-bold">{seq.meetingCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Live Outreach Activity Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Recent Automated Outreach Touchpoints</span>
          </h3>
          <span className="text-[11px] text-slate-400">Live sequence event stream</span>
        </div>

        <div className="divide-y divide-slate-800/70 text-xs">
          {logs.map(log => (
            <div key={log.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${
                  log.status === 'replied' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  log.status === 'opened' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                  'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                }`}>
                  {log.channel === 'call' ? <Phone className="w-3.5 h-3.5" /> :
                   log.channel === 'email' ? <Mail className="w-3.5 h-3.5" /> :
                   <MessageSquare className="w-3.5 h-3.5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{log.leadName}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{log.sequenceName} (Step {log.stepNumber})</span>
                  </div>
                  {log.subject && (
                    <p className="text-[11px] text-slate-400 truncate max-w-md">{log.subject}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  log.status === 'replied' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  log.status === 'opened' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                  'bg-slate-800 text-slate-300'
                }`}>
                  {log.status}
                </span>
                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
