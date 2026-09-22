import * as XLSX from 'xlsx';
import { Lead, LeadStage } from '../types';

export interface ColumnMapping {
  fullName: string;
  currentTitle: string;
  currentCompany: string;
  email: string; // Verified Work Email
  secondaryEmail: string; // Personal Email
  alternateEmail: string; // Alternate / Corporate Email
  mobilePhone: string; // Category 1: Direct Mobile Phone
  directPhone: string; // Category 2: Direct Work Phone (Desk / Direct Line)
  hqPhone: string; // Category 3: Company HQ Phone (Boardline / Switchboard)
  phone: string; // Generic / Fallback Phone
  linkedinUrl: string;
  location: string;
  industry: string;
  stage: string;
}

export interface ParsedSheetResult {
  sheetName: string;
  totalRows: number;
  headers: string[];
  sampleRows: Record<string, any>[];
  detectedMapping: ColumnMapping;
  allRows: Record<string, any>[];
}

const FIRST_NAMES = [
  'Alexander', 'Sarah', 'Marcus', 'Elena', 'David', 'Jessica', 'Michael', 'Emily',
  'Daniel', 'Sophia', 'James', 'Olivia', 'William', 'Ava', 'Benjamin', 'Mia',
  'Lucas', 'Charlotte', 'Henry', 'Amelia', 'Sebastian', 'Harper', 'Jack', 'Evelyn',
  'Ethan', 'Abigail', 'Noah', 'Emma', 'Liam', 'Isabella', 'Oliver', 'Arya',
  'Carlos', 'Priya', 'Mateo', 'Aaliyah', 'Dmitri', 'Fatima', 'Kenji', 'Zoe'
];

const LAST_NAMES = [
  'Vance', 'Chen', 'Sterling', 'Reyes', 'Kowalski', 'Tanaka', 'Patel', 'Dubois',
  'O\'Connor', 'Novak', 'Gupta', 'Lindqvist', 'Nakamura', 'Moreno', 'Muller', 'Bergman',
  'Mercer', 'Blackwood', 'Sinclair', 'Hartmann', 'Adler', 'Thorne', 'Alvarez', 'Cross',
  'Fontaine', 'Castillo', 'Kemp', 'Sorensen', 'Dupont', 'Holt', 'Bishop', 'Vargas'
];

const TITLES = [
  'VP of Sales', 'Chief Technology Officer', 'Head of Revenue Operations', 'Director of Sales Development',
  'Chief Revenue Officer', 'Senior Director of Product', 'VP of Engineering', 'Director of Demand Generation',
  'Head of Enterprise Sales', 'Managing Director', 'VP of Customer Success', 'Principal Cloud Architect',
  'Chief Operating Officer', 'Senior Director of Marketing', 'Head of Business Development', 'VP of Strategic Alliances',
  'Director of Outbound Growth', 'VP of Product Management', 'Chief Information Security Officer', 'Global Head of Talent'
];

const COMPANIES = [
  { name: 'Stripe', domain: 'stripe.com', size: '5,000-10,000', industry: 'Fintech & Payments' },
  { name: 'Databricks', domain: 'databricks.com', size: '5,000-10,000', industry: 'Data & AI Cloud' },
  { name: 'Snowflake', domain: 'snowflake.com', size: '5,000-10,000', industry: 'Data Cloud & Warehousing' },
  { name: 'HubSpot', domain: 'hubspot.com', size: '5,000-10,000', industry: 'CRM & Marketing Automation' },
  { name: 'CrowdStrike', domain: 'crowdstrike.com', size: '5,000-10,000', industry: 'Cybersecurity' },
  { name: 'Notion', domain: 'notion.so', size: '1,000-5,000', industry: 'Productivity Software' },
  { name: 'Figma', domain: 'figma.com', size: '1,000-5,000', industry: 'Design Systems & Tech' },
  { name: 'Cloudflare', domain: 'cloudflare.com', size: '1,000-5,000', industry: 'Network Security & Edge' },
  { name: 'MongoDB', domain: 'mongodb.com', size: '1,000-5,000', industry: 'Developer Databases' },
  { name: 'Gong.io', domain: 'gong.io', size: '1,000-5,000', industry: 'Revenue Intelligence' },
  { name: 'Ramp', domain: 'ramp.com', size: '500-1,000', industry: 'Corporate Finance & Spend' },
  { name: 'Linear', domain: 'linear.app', size: '100-500', industry: 'Project Management & SaaS' },
  { name: 'Vercel', domain: 'vercel.com', size: '500-1,000', industry: 'Cloud & Web Platform' },
  { name: 'Supabase', domain: 'supabase.com', size: '100-500', industry: 'Open Source Database' },
  { name: 'Anthropic', domain: 'anthropic.com', size: '500-1,000', industry: 'Artificial Intelligence' }
];

const LOCATIONS = [
  'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA',
  'Boston, MA', 'Chicago, IL', 'Denver, CO', 'London, UK',
  'Toronto, Canada', 'Los Angeles, CA', 'Atlanta, GA', 'Berlin, Germany'
];

const AREA_CODES = ['415', '650', '212', '512', '206', '617', '312', '720', '404', '310'];

/**
 * Generates 1,000 realistic, high quality B2B sales leads
 */
export function generateSample1000Leads(): Lead[] {
  const generated: Lead[] = [];
  const baseTime = Date.now();

  for (let i = 0; i < 1000; i++) {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const ln = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
    const fullName = `${fn} ${ln}`;
    const compObj = COMPANIES[i % COMPANIES.length];
    const title = TITLES[(i * 3 + 7) % TITLES.length];
    const loc = LOCATIONS[(i * 2 + 5) % LOCATIONS.length];
    const cleanFn = fn.toLowerCase().replace(/[^a-z]/g, '');
    const cleanLn = ln.toLowerCase().replace(/[^a-z]/g, '');
    const email = `${cleanFn}.${cleanLn}@${compObj.domain}`;
    const secondaryEmail = `${cleanFn}.${cleanLn}${i % 99}@gmail.com`;
    const alternateEmail = `${cleanFn}@${compObj.domain}`;

    const areaCode = AREA_CODES[i % AREA_CODES.length];
    const phonePart1 = String(100 + (i * 37) % 900);
    const phonePart2 = String(1000 + (i * 13) % 9000);
    const mobilePhone = `+1 (${areaCode}) ${phonePart1}-${phonePart2}`;
    
    const directPart1 = String(200 + (i * 23) % 700);
    const directPart2 = String(1000 + (i * 47) % 9000);
    const directPhone = `+1 (${areaCode}) ${directPart1}-${directPart2} x${100 + (i % 800)}`;

    const hqPart = String(1000 + (i * 71) % 9000);
    const hqPhone = `+1 (${areaCode}) 500-${hqPart}`;

    const phone = mobilePhone;
    const linkedinHandle = `${cleanFn}-${cleanLn}-${i + 101}`;

    const stages: LeadStage[] = ['new', 'enriched', 'in_sequence', 'contacted', 'meeting_booked', 'qualified'];
    const assignedStage = stages[i % stages.length];

    generated.push({
      id: `lead-xl-${baseTime}-${i + 1}`,
      firstName: fn,
      lastName: ln,
      fullName,
      headline: `${title} at ${compObj.name} | Scaling Enterprise GTM`,
      currentTitle: title,
      currentCompany: compObj.name,
      companyDomain: compObj.domain,
      companySize: compObj.size,
      industry: compObj.industry,
      location: loc,
      linkedinUrl: `https://www.linkedin.com/in/${linkedinHandle}`,
      email,
      emailStatus: 'verified',
      secondaryEmail,
      alternateEmail,
      phone,
      phoneType: 'mobile',
      phoneConfidence: 94 + (i % 6),
      mobileVerified: true,
      mobilePhone,
      directPhone,
      hqPhone,
      jobHistory: [
        {
          id: `job-curr-${i}`,
          title,
          company: compObj.name,
          period: '2022 - Present',
          duration: '3 yrs',
          location: loc,
          isCurrent: true
        },
        {
          id: `job-prev-${i}`,
          title: 'Senior Manager / Lead',
          company: COMPANIES[(i + 3) % COMPANIES.length].name,
          period: '2019 - 2022',
          duration: '3 yrs',
          isCurrent: false
        }
      ],
      education: [
        {
          id: `edu-${i}`,
          school: 'University of California, Berkeley',
          degree: 'Bachelor of Science (B.S.)',
          years: '2015 - 2019'
        }
      ],
      skills: ['Enterprise Sales', 'SaaS Strategy', 'Outbound Pipeline', 'Team Leadership'],
      stage: assignedStage,
      source: 'csv_import',
      tags: ['Excel 1000 Batch', compObj.industry],
      notes: `Imported via Excel Batch (Row #${i + 1}). Verified corporate email & direct mobile.`,
      createdAt: new Date(baseTime - (1000 - i) * 60000).toISOString(),
      updatedAt: new Date(baseTime - (1000 - i) * 30000).toISOString()
    });
  }

  return generated;
}

/**
 * Downloads a standardized Excel (.xlsx) file with headers and 5 sample rows
 */
export function downloadExcelTemplate() {
  const templateHeaders = [
    'Full Name',
    'First Name',
    'Last Name',
    'Job Title',
    'Company',
    'Company Domain',
    'Direct Mobile Phone',
    'Direct Work Phone',
    'Company HQ Phone',
    'Verified Work Email',
    'Personal Email',
    'Alternate Corporate Email',
    'LinkedIn Profile URL',
    'Location',
    'Industry',
    'Stage'
  ];

  const sampleData = [
    templateHeaders,
    ['Marcus Sterling', 'Marcus', 'Sterling', 'VP of Sales', 'Databricks', 'databricks.com', '+1 (415) 555-0192', '+1 (415) 890-4100 x192', '+1 (415) 500-2000', 'marcus.sterling@databricks.com', 'marcus.sterling99@gmail.com', 'marcus@databricks.com', 'https://www.linkedin.com/in/marcus-sterling', 'San Francisco, CA', 'Data & AI Cloud', 'new'],
    ['Elena Reyes', 'Elena', 'Reyes', 'Head of Revenue Operations', 'Stripe', 'stripe.com', '+1 (650) 555-0143', '+1 (650) 720-3300 x143', '+1 (650) 500-3000', 'elena.reyes@stripe.com', 'elena.reyes92@gmail.com', 'elena@stripe.com', 'https://www.linkedin.com/in/elena-reyes', 'Austin, TX', 'Fintech', 'enriched'],
    ['Sarah Chen', 'Sarah', 'Chen', 'Director of Engineering', 'Snowflake', 'snowflake.com', '+1 (206) 555-0188', '+1 (206) 430-8800 x188', '+1 (206) 500-4000', 'sarah.chen@snowflake.com', 'sarah.chen.tech@gmail.com', 'sarah@snowflake.com', 'https://www.linkedin.com/in/sarah-chen', 'Seattle, WA', 'Cloud & Data', 'new'],
    ['David Kowalski', 'David', 'Kowalski', 'Chief Technology Officer', 'HubSpot', 'hubspot.com', '+1 (617) 555-0177', '+1 (617) 910-2200 x177', '+1 (617) 500-5000', 'david.k@hubspot.com', 'dkowalski.dev@gmail.com', 'david@hubspot.com', 'https://www.linkedin.com/in/david-kowalski', 'Boston, MA', 'CRM & Marketing', 'in_sequence'],
    ['Jessica Dubois', 'Jessica', 'Dubois', 'VP of Growth', 'Figma', 'figma.com', '+1 (415) 555-0129', '+1 (415) 640-7700 x129', '+1 (415) 500-6000', 'jessica.dubois@figma.com', 'jdubois.design@gmail.com', 'jessica@figma.com', 'https://www.linkedin.com/in/jessica-dubois', 'New York, NY', 'Design Software', 'new']
  ];

  const ws = XLSX.utils.aoa_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leads Template');

  // Trigger download
  XLSX.writeFile(wb, 'leadpulse_1000_leads_import_template.xlsx');
}

/**
 * Parses an Excel or CSV file buffer into structured rows and auto-detects column mappings
 */
export async function parseExcelOrCsvFile(file: File): Promise<ParsedSheetResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0] || 'Sheet1';
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to array of objects
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (rawRows.length === 0) {
    throw new Error('The uploaded spreadsheet contains no data rows.');
  }

  const headers = Object.keys(rawRows[0] || {});

  // Intelligent column mapping finder
  const findMatch = (candidates: string[]): string => {
    for (const c of candidates) {
      const found = headers.find(h => h.trim().toLowerCase() === c.toLowerCase());
      if (found) return found;
    }
    // Partial substring match
    for (const c of candidates) {
      const found = headers.find(h => h.trim().toLowerCase().includes(c.toLowerCase()));
      if (found) return found;
    }
    return '';
  };

  const detectedMapping: ColumnMapping = {
    fullName: findMatch(['full name', 'fullname', 'name', 'prospect name', 'contact name']),
    currentTitle: findMatch(['job title', 'title', 'position', 'role', 'current title']),
    currentCompany: findMatch(['company', 'current company', 'organization', 'employer', 'account']),
    // Emails
    email: findMatch(['verified work email', 'work email', 'business email', 'primary email', 'email', 'corporate email', 'email address', 'mail']),
    secondaryEmail: findMatch(['personal email', 'secondary email', 'private email', 'personal mail', 'other email', 'secondary_email', 'email 2']),
    alternateEmail: findMatch(['alternate corporate email', 'alternate email', 'alternative email', 'company email', 'hq email', 'secondary work email', 'corporate_email', 'alternate_email']),
    // 3 Categories of Phone Numbers
    mobilePhone: findMatch(['direct mobile phone', 'mobile phone', 'mobile', 'cell phone', 'cell', 'cellular', 'mobile number', 'personal mobile', 'phone (mobile)', 'mobile_phone']),
    directPhone: findMatch(['direct work phone', 'direct phone', 'direct dial', 'direct line', 'desk phone', 'office phone', 'work direct', 'work phone', 'phone (direct)', 'direct_phone']),
    hqPhone: findMatch(['company hq phone', 'company phone', 'hq phone', 'headquarters phone', 'switchboard', 'boardline', 'main office phone', 'company office', 'corporate phone', 'main line', 'phone (hq)', 'company_phone']),
    phone: findMatch(['phone', 'phone number', 'telephone', 'tel', 'contact number']),
    linkedinUrl: findMatch(['linkedin profile url', 'linkedin url', 'linkedin', 'profile url', 'linkedin link']),
    location: findMatch(['location', 'city', 'country', 'region', 'state']),
    industry: findMatch(['industry', 'sector', 'category']),
    stage: findMatch(['stage', 'status', 'pipeline stage', 'lead stage'])
  };

  return {
    sheetName: firstSheetName,
    totalRows: rawRows.length,
    headers,
    sampleRows: rawRows.slice(0, 5),
    detectedMapping,
    allRows: rawRows
  };
}

/**
 * Transforms parsed raw rows according to user's column mapping into typed Lead objects
 */
export function convertRowsToLeads(
  rawRows: Record<string, any>[],
  mapping: ColumnMapping,
  defaultStage: LeadStage = 'new'
): Lead[] {
  const baseTime = Date.now();

  return rawRows.map((row, idx) => {
    // Determine full name, first name, last name
    let fullName = (row[mapping.fullName] || '').toString().trim();
    let firstName = '';
    let lastName = '';

    if (!fullName) {
      // Check if separate First / Last name exists
      const fn = (row['First Name'] || row['first name'] || row['firstname'] || '').toString().trim();
      const ln = (row['Last Name'] || row['last name'] || row['lastname'] || '').toString().trim();
      if (fn || ln) {
        firstName = fn;
        lastName = ln;
        fullName = `${fn} ${ln}`.trim();
      } else {
        fullName = `Lead #${idx + 1}`;
        firstName = 'Lead';
        lastName = `#${idx + 1}`;
      }
    } else {
      const parts = fullName.split(' ');
      firstName = parts[0] || 'Lead';
      lastName = parts.slice(1).join(' ') || '';
    }

    const title = (row[mapping.currentTitle] || 'Business Executive').toString().trim();
    const company = (row[mapping.currentCompany] || 'Enterprise Corp').toString().trim();

    // Emails
    const email = (row[mapping.email] || '').toString().trim();
    const secondaryEmail = mapping.secondaryEmail ? (row[mapping.secondaryEmail] || '').toString().trim() : undefined;
    const alternateEmail = mapping.alternateEmail ? (row[mapping.alternateEmail] || '').toString().trim() : undefined;

    // 3 Categories of Phone Numbers
    const mobilePhone = mapping.mobilePhone ? (row[mapping.mobilePhone] || '').toString().trim() : '';
    const directPhone = mapping.directPhone ? (row[mapping.directPhone] || '').toString().trim() : '';
    const hqPhone = mapping.hqPhone ? (row[mapping.hqPhone] || '').toString().trim() : '';
    const genericPhone = mapping.phone ? (row[mapping.phone] || '').toString().trim() : '';

    // Primary phone falls back gracefully across all available numbers
    const primaryPhone = mobilePhone || directPhone || hqPhone || genericPhone;

    const linkedinUrl = (row[mapping.linkedinUrl] || `https://www.linkedin.com/in/lead-${idx + 1}`).toString().trim();
    const location = (row[mapping.location] || 'United States').toString().trim();
    const industry = (row[mapping.industry] || 'Technology & Services').toString().trim();

    const stageVal = (row[mapping.stage] || defaultStage).toString().toLowerCase().trim();
    const validStages: LeadStage[] = ['new', 'enriched', 'in_sequence', 'contacted', 'meeting_booked', 'qualified', 'won', 'lost'];
    const stage: LeadStage = validStages.includes(stageVal as LeadStage) ? (stageVal as LeadStage) : defaultStage;

    return {
      id: `lead-import-${baseTime}-${idx + 1}`,
      firstName,
      lastName,
      fullName,
      headline: `${title} at ${company}`,
      currentTitle: title,
      currentCompany: company,
      companyDomain: company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
      industry,
      location,
      linkedinUrl,
      email,
      emailStatus: email.includes('@') ? 'verified' : 'unverified',
      secondaryEmail: secondaryEmail || undefined,
      alternateEmail: alternateEmail || undefined,
      phone: primaryPhone,
      phoneType: mobilePhone ? 'mobile' : directPhone ? 'direct' : hqPhone ? 'hq' : 'mobile',
      phoneConfidence: primaryPhone ? 95 : 0,
      mobileVerified: !!mobilePhone,
      mobilePhone: mobilePhone || undefined,
      directPhone: directPhone || undefined,
      hqPhone: hqPhone || undefined,
      jobHistory: [
        {
          id: `job-curr-${idx}`,
          title,
          company,
          period: '2023 - Present',
          duration: '2 yrs',
          location,
          isCurrent: true
        }
      ],
      education: [],
      skills: ['Leadership', 'Outbound Strategy'],
      stage,
      source: 'csv_import',
      tags: ['Excel/CSV Import'],
      notes: `Imported via spreadsheet batch on ${new Date().toLocaleDateString()}.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
}
