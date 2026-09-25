import { Lead, SequenceStep, OutreachLog } from '../types';

/**
 * Replaces dynamic variables in cold email / message templates
 */
export function renderTemplate(template: string, lead: Lead): string {
  const previousCompany = lead.jobHistory.find(j => !j.isCurrent)?.company || 'your previous company';
  const topSkill = lead.skills[0] || 'your domain expertise';

  return template
    .replace(/\{\{first_name\}\}/gi, lead.firstName || 'there')
    .replace(/\{\{last_name\}\}/gi, lead.lastName || '')
    .replace(/\{\{full_name\}\}/gi, lead.fullName || `${lead.firstName} ${lead.lastName}`)
    .replace(/\{\{company\}\}/gi, lead.currentCompany || 'your company')
    .replace(/\{\{title\}\}/gi, lead.currentTitle || 'your leadership role')
    .replace(/\{\{previous_company\}\}/gi, previousCompany)
    .replace(/\{\{location\}\}/gi, lead.location || 'your area')
    .replace(/\{\{phone\}\}/gi, lead.phone || 'your direct line')
    .replace(/\{\{email\}\}/gi, lead.email || 'your email')
    .replace(/\{\{skills\}\}/gi, topSkill);
}

/**
 * Generates an AI-driven tailored outreach icebreaker hook
 */
export function generateAiIcebreaker(lead: Lead, tone: 'executive' | 'concise' | 'warm' = 'executive'): string {
  const previous = lead.jobHistory.find(j => !j.isCurrent);
  const yearsCurrent = lead.jobHistory[0]?.duration || 'several years';

  if (tone === 'executive') {
    if (previous) {
      return `Hi ${lead.firstName}, saw your transition from ${previous.company} to spearheading initiatives at ${lead.currentCompany}. Given your ${yearsCurrent} leading the team, wanted to share how similar GTM leaders are eliminating outbound lead duplicates.`;
    }
    return `Hi ${lead.firstName}, impressed by the growth curve of ${lead.currentCompany}'s team in ${lead.location}. As ${lead.currentTitle}, keeping your reps focused on verified direct lines is critical.`;
  }

  if (tone === 'concise') {
    return `Hi ${lead.firstName} — loved your team's recent trajectory at ${lead.currentCompany}. Quick question regarding your sales outbound data accuracy?`;
  }

  // Warm tone
  return `Hi ${lead.firstName}, hope you're having an awesome week in ${lead.location}! Saw your background at ${previous ? `${previous.company} and now ` : ''}${lead.currentCompany} and couldn't resist reaching out.`;
}

/**
 * Simulates advancing a lead in a sequence and creating an outreach log
 */
export function advanceLeadInSequence(
  lead: Lead,
  step: SequenceStep,
  sequenceName: string,
  totalSteps: number
): { updatedLead: Lead; log: OutreachLog } {
  const isLast = step.order >= totalSteps;

  const updatedLead: Lead = {
    ...lead,
    stage: 'in_sequence',
    // Stay on the final step once the cadence is finished
    sequenceStep: isLast ? totalSteps : step.order + 1,
    sequenceStatus: isLast ? 'completed' : 'active',
    lastContactedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const log: OutreachLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    leadId: lead.id,
    leadName: lead.fullName,
    sequenceId: lead.sequenceId || 'seq-1',
    sequenceName: sequenceName,
    stepNumber: step.order,
    channel: step.channel,
    status: step.channel === 'call' ? 'call_logged' : 'sent',
    timestamp: new Date().toISOString(),
    subject: step.templateSubject ? renderTemplate(step.templateSubject, lead) : undefined
  };

  return { updatedLead, log };
}
