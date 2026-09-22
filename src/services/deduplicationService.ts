import { Lead, DuplicateMatch } from '../types';

/**
 * Normalizes LinkedIn URLs for exact comparison
 */
export function normalizeLinkedinUrl(url?: string): string {
  if (!url) return '';
  return url
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '')
    .split('?')[0];
}

/**
 * Normalizes phone numbers by stripping formatting characters
 */
export function normalizePhone(phone?: string): string {
  if (!phone) return '';
  // Extract all digits; if starts with +1 or 1, normalize to standard 10 or 11 digits
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

/**
 * Checks an incoming lead candidate against an existing database of leads
 * Returns all potential duplicate matches with confidence scores and matching reasons
 */
export function findDuplicateMatches(
  candidate: Partial<Lead>,
  existingLeads: Lead[]
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];

  const normCandidateUrl = normalizeLinkedinUrl(candidate.linkedinUrl);
  const normCandidateEmail = candidate.email?.toLowerCase().trim() || '';
  const normCandidatePhone = normalizePhone(candidate.phone);
  const candFirst = candidate.firstName?.toLowerCase().trim() || '';
  const candLast = candidate.lastName?.toLowerCase().trim() || '';
  const candCompany = candidate.currentCompany?.toLowerCase().trim() || '';

  for (const existing of existingLeads) {
    // 1. Exact LinkedIn URL match
    if (normCandidateUrl && normalizeLinkedinUrl(existing.linkedinUrl) === normCandidateUrl) {
      matches.push({
        matchedLeadId: existing.id,
        existingLead: existing,
        incomingLead: candidate,
        matchType: 'exact_linkedin',
        matchReason: `Exact LinkedIn profile match (${candidate.linkedinUrl})`,
        confidenceScore: 100
      });
      continue;
    }

    // 2. Exact Email match
    if (normCandidateEmail && existing.email?.toLowerCase().trim() === normCandidateEmail) {
      matches.push({
        matchedLeadId: existing.id,
        existingLead: existing,
        incomingLead: candidate,
        matchType: 'exact_email',
        matchReason: `Exact email address match (${candidate.email})`,
        confidenceScore: 99
      });
      continue;
    }

    // 3. Exact Phone match (if provided)
    if (normCandidatePhone && normalizePhone(existing.phone) === normCandidatePhone && normCandidatePhone.length >= 7) {
      matches.push({
        matchedLeadId: existing.id,
        existingLead: existing,
        incomingLead: candidate,
        matchType: 'exact_phone',
        matchReason: `Direct phone number match (${candidate.phone})`,
        confidenceScore: 95
      });
      continue;
    }

    // 4. Fuzzy Name + Company match
    const existFirst = existing.firstName?.toLowerCase().trim() || '';
    const existLast = existing.lastName?.toLowerCase().trim() || '';
    const existCompany = existing.currentCompany?.toLowerCase().trim() || '';

    if (
      candFirst &&
      candLast &&
      existFirst === candFirst &&
      existLast === candLast &&
      candCompany &&
      (existCompany.includes(candCompany) || candCompany.includes(existCompany))
    ) {
      matches.push({
        matchedLeadId: existing.id,
        existingLead: existing,
        incomingLead: candidate,
        matchType: 'fuzzy_name_company',
        matchReason: `Identical person (${candidate.fullName || `${candFirst} ${candLast}`}) at ${existing.currentCompany}`,
        confidenceScore: 88
      });
    }
  }

  // Sort matches by highest confidence first
  return matches.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

/**
 * Merges incoming lead attributes into an existing lead, preserving non-empty existing values
 * and enriching with any new contact or job history data.
 */
export function mergeLeads(existing: Lead, incoming: Partial<Lead>): Lead {
  // Combine job history without duplicates
  const existingTitles = new Set(existing.jobHistory.map(j => `${j.title}_${j.company}`.toLowerCase()));
  const newJobs = (incoming.jobHistory || []).filter(
    j => !existingTitles.has(`${j.title}_${j.company}`.toLowerCase())
  );

  // Combine tags
  const mergedTags = Array.from(new Set([...(existing.tags || []), ...(incoming.tags || [])]));

  return {
    ...existing,
    // Fill in contact info if existing had none or incoming is verified
    email: incoming.emailStatus === 'verified' ? (incoming.email || existing.email) : (existing.email || incoming.email || ''),
    emailStatus: existing.emailStatus === 'verified' ? 'verified' : (incoming.emailStatus || existing.emailStatus),
    phone: incoming.phone && (!existing.phone || incoming.mobileVerified) ? incoming.phone : existing.phone,
    phoneType: incoming.phoneType || existing.phoneType,
    phoneConfidence: Math.max(existing.phoneConfidence || 0, incoming.phoneConfidence || 0),
    mobileVerified: existing.mobileVerified || incoming.mobileVerified || false,
    
    // Update professional current title if incoming is newer
    currentTitle: incoming.currentTitle || existing.currentTitle,
    currentCompany: incoming.currentCompany || existing.currentCompany,
    companyDomain: incoming.companyDomain || existing.companyDomain,
    headline: incoming.headline || existing.headline,
    location: incoming.location || existing.location,
    
    jobHistory: [...newJobs, ...existing.jobHistory],
    skills: Array.from(new Set([...(existing.skills || []), ...(incoming.skills || [])])),
    tags: mergedTags,
    notes: incoming.notes ? `${existing.notes ? `${existing.notes}\n` : ''}[Enriched]: ${incoming.notes}` : existing.notes,
    updatedAt: new Date().toISOString()
  };
}
