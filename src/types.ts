export type EmailStatus = 'verified' | 'unverified' | 'risky' | 'catchall';
export type PhoneType = 'mobile' | 'direct' | 'hq';
export type LeadStage = 'new' | 'enriched' | 'in_sequence' | 'contacted' | 'meeting_booked' | 'qualified' | 'won' | 'lost';
export type LeadSource = 'linkedin_extension' | 'public_profile_search' | 'csv_import' | 'manual';

export interface JobExperience {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  period: string; // e.g., "2021 - Present"
  duration: string; // e.g., "3 yrs 2 mos"
  location?: string;
  description?: string;
  isCurrent: boolean;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy?: string;
  years: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  headline: string;
  currentTitle: string;
  currentCompany: string;
  companyDomain?: string;
  companySize?: string;
  industry?: string;
  location: string;
  linkedinUrl: string;
  
  // Contact details
  // Emails (Work, Personal, Alternate)
  email: string;
  emailStatus: EmailStatus;
  secondaryEmail?: string; // Personal Email
  alternateEmail?: string; // Corporate / Alternate Email

  // 3 Categories of Phone Numbers
  phone: string; // Primary phone (defaults to mobilePhone || directPhone || hqPhone)
  phoneType: PhoneType;
  phoneConfidence: number; // 0 - 100
  mobileVerified: boolean;
  mobilePhone?: string; // Category 1: Direct Mobile / Cell
  directPhone?: string; // Category 2: Direct Work Phone (Desk / Extension)
  hqPhone?: string;     // Category 3: Company HQ Phone (Boardline / Switchboard)

  // Professional background
  jobHistory: JobExperience[];
  education: EducationItem[];
  skills: string[];
  summary?: string;

  // CRM status
  stage: LeadStage;
  source: LeadSource;
  tags: string[];
  notes: string;
  
  // Sequence Tracking
  sequenceId?: string;
  sequenceName?: string;
  sequenceStep?: number;
  sequenceStatus?: 'active' | 'paused' | 'completed' | 'replied';

  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
}

export type DuplicateMatchType = 'exact_linkedin' | 'exact_email' | 'exact_phone' | 'fuzzy_name_company';

export interface DuplicateMatch {
  matchedLeadId: string;
  existingLead: Lead;
  incomingLead: Partial<Lead>;
  matchType: DuplicateMatchType;
  matchReason: string;
  confidenceScore: number; // 0 - 100
}

export type SequenceChannel = 'email' | 'linkedin_connect' | 'linkedin_inmail' | 'call' | 'wait';

export interface SequenceStep {
  id: string;
  order: number;
  day: number; // Day offset (e.g. Day 1, Day 3, Day 7)
  channel: SequenceChannel;
  title: string;
  templateSubject?: string;
  templateBody: string;
  enabled: boolean;
}

export interface OutreachSequence {
  id: string;
  name: string;
  description: string;
  targetRole: string;
  status: 'active' | 'paused' | 'draft';
  steps: SequenceStep[];
  enrolledCount: number;
  openRate: number; // percentage e.g. 64.5
  replyRate: number; // percentage e.g. 21.3
  bounceRate: number; // percentage e.g. 1.8
  meetingCount: number;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  tier: 'starter' | 'growth' | 'enterprise';
  name: string;
  badge?: string;
  priceMonthly: number;
  priceAnnualMonthly: number; // discounted
  creditsEmailPerMonth: number;
  creditsMobilePerMonth: number;
  teamSeats: number;
  features: string[];
  isPopular?: boolean;
}

export interface CreditWallet {
  emailCreditsRemaining: number;
  emailCreditsTotal: number;
  mobileCreditsRemaining: number;
  mobileCreditsTotal: number;
  currentPlan: 'free' | 'starter' | 'growth' | 'enterprise';
  renewsAt: string;
}

export interface OutreachLog {
  id: string;
  leadId: string;
  leadName: string;
  sequenceId: string;
  sequenceName: string;
  stepNumber: number;
  channel: SequenceChannel;
  status: 'sent' | 'opened' | 'replied' | 'bounced' | 'call_logged';
  timestamp: string;
  subject?: string;
}

export type UserRole = 'admin' | 'member';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole; // 'admin' (admin access) | 'member' (normal access)
  title: string;
  company: string;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  department?: string;
  createdAt: string;
  lastLoginAt: string;
}
