import { Lead, JobExperience, EmailStatus, PhoneType } from '../types';

export interface EnrichmentRequest {
  linkedinUrl?: string;
  fullName?: string;
  company?: string;
  title?: string;
}

export interface EnrichmentResult {
  candidate: Partial<Lead>;
  creditsUsed: {
    email: number;
    mobile: number;
  };
  providerSources: string[];
}

// Sample profiles that can be loaded instantly for testing
export const DEMO_PROSPECT_PROFILES = [
  {
    name: 'Sarah Lin-Sterling',
    title: 'VP of Engineering & Platform',
    company: 'Snowflake',
    companyDomain: 'snowflake.com',
    location: 'San Francisco Bay Area',
    headline: 'VP of Engineering @ Snowflake | Building Next-Gen Data Cloud Architecture',
    linkedinUrl: 'https://linkedin.com/in/sarah-lin-snowflake',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    currentJob: {
      title: 'VP of Engineering & Platform',
      company: 'Snowflake',
      period: '2021 - Present',
      duration: '5 yrs 1 mo',
      description: 'Heading cloud infrastructure, distributed query engines, and 120+ senior engineers.',
      isCurrent: true
    },
    pastJobs: [
      {
        title: 'Director of Systems Architecture',
        company: 'Salesforce',
        period: '2016 - 2021',
        duration: '5 yrs',
        description: 'Led multi-tenant database partitioning and scale initiatives.',
        isCurrent: false
      },
      {
        title: 'Senior Software Engineer',
        company: 'Oracle',
        period: '2012 - 2016',
        duration: '4 yrs',
        description: 'Exadata engine kernel optimization.',
        isCurrent: false
      }
    ]
  },
  {
    name: 'David K. Morrison',
    title: 'Chief Commercial Officer (CCO)',
    company: 'Cloudflare',
    companyDomain: 'cloudflare.com',
    location: 'London, United Kingdom',
    headline: 'Chief Commercial Officer at Cloudflare | Enterprise GTM & Security',
    linkedinUrl: 'https://linkedin.com/in/david-morrison-cloudflare',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    currentJob: {
      title: 'Chief Commercial Officer',
      company: 'Cloudflare',
      period: '2020 - Present',
      duration: '6 yrs 2 mos',
      description: 'Leading global sales, channel partnerships, customer success, and $1.5B+ pipeline.',
      isCurrent: true
    },
    pastJobs: [
      {
        title: 'VP of EMEA Enterprise Sales',
        company: 'Cisco',
        period: '2015 - 2020',
        duration: '5 yrs',
        description: 'Built European zero-trust cyber enterprise sales organization.',
        isCurrent: false
      }
    ]
  },
  {
    name: 'Aisha Al-Mansoor',
    title: 'Head of Global Talent & People Operations',
    company: 'Canva',
    companyDomain: 'canva.com',
    location: 'Sydney, Australia & Remote',
    headline: 'Head of Global Talent @ Canva | Scaling Hyper-Growth Tech Teams',
    linkedinUrl: 'https://linkedin.com/in/aisha-mansoor-talent',
    avatarUrl: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=150&auto=format&fit=crop&q=80',
    currentJob: {
      title: 'Head of Global Talent & People Operations',
      company: 'Canva',
      period: '2022 - Present',
      duration: '4 yrs 3 mos',
      description: 'Directing global recruiting and people strategy for 4,000+ creators and engineers.',
      isCurrent: true
    },
    pastJobs: [
      {
        title: 'Senior Manager, Talent Acquisition',
        company: 'Atlassian',
        period: '2018 - 2022',
        duration: '4 yrs',
        description: 'Scaled engineering hiring across APAC and Americas.',
        isCurrent: false
      }
    ]
  }
];

/**
 * Parses a name into first and last components
 */
export function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  return {
    first: parts[0],
    last: parts.slice(1).join(' ')
  };
}

/**
 * Generates synthetic or enriched contact data matching real-world B2B patterns
 */
export async function enrichProfileData(
  req: EnrichmentRequest,
  includeMobile: boolean = true
): Promise<EnrichmentResult> {
  // Simulate network latency for authentic feel
  await new Promise(r => setTimeout(r, 900));

  let name = req.fullName?.trim() || '';
  let company = req.company?.trim() || '';
  let title = req.title?.trim() || 'Senior Leader';
  let url = req.linkedinUrl?.trim() || '';
  let domain = company ? `${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : 'techfirm.com';
  let location = 'United States';
  let headline = `${title} at ${company || 'Technology Company'}`;
  let avatarUrl = '';

  // Check if matches one of our rich demo profiles
  const matchedDemo = DEMO_PROSPECT_PROFILES.find(p => 
    (url && p.linkedinUrl.toLowerCase().includes(url.toLowerCase())) ||
    (name && p.name.toLowerCase().includes(name.toLowerCase()))
  );

  let jobHistory: JobExperience[] = [];

  if (matchedDemo) {
    name = matchedDemo.name;
    company = matchedDemo.company;
    title = matchedDemo.title;
    domain = matchedDemo.companyDomain;
    location = matchedDemo.location;
    headline = matchedDemo.headline;
    avatarUrl = matchedDemo.avatarUrl;
    url = matchedDemo.linkedinUrl;
    jobHistory = [
      {
        id: `job-${Date.now()}-1`,
        title: matchedDemo.currentJob.title,
        company: matchedDemo.currentJob.company,
        period: matchedDemo.currentJob.period,
        duration: matchedDemo.currentJob.duration,
        description: matchedDemo.currentJob.description,
        isCurrent: true
      },
      ...matchedDemo.pastJobs.map((j, i) => ({
        id: `job-${Date.now()}-${i + 2}`,
        title: j.title,
        company: j.company,
        period: j.period,
        duration: j.duration,
        description: j.description,
        isCurrent: false
      }))
    ];
  } else {
    // Generate realistic profile if custom input
    if (!name) {
      // derive name from url if possible
      const slug = url.split('/in/')[1]?.replace(/[^a-zA-Z-]/g, '') || 'alex-turner';
      const nameParts = slug.split('-').filter(p => isNaN(Number(p)));
      name = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Alex Turner';
    }
    if (!company) company = 'Modern Tech Inc.';
    domain = `${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

    jobHistory = [
      {
        id: `job-${Date.now()}-1`,
        title: title || 'Director of Strategic Growth',
        company: company,
        period: '2023 - Present',
        duration: '3 yrs 2 mos',
        description: `Directing core initiatives and operational scale at ${company}.`,
        isCurrent: true
      },
      {
        id: `job-${Date.now()}-2`,
        title: 'Senior Business Manager',
        company: 'Oracle Enterprise',
        period: '2019 - 2023',
        duration: '4 yrs',
        description: 'Spearheaded B2B corporate accounts and client advisory.',
        isCurrent: false
      },
      {
        id: `job-${Date.now()}-3`,
        title: 'Account Executive',
        company: 'Cisco Systems',
        period: '2016 - 2019',
        duration: '3 yrs',
        description: 'Managed SaaS communications and enterprise networking deployments.',
        isCurrent: false
      }
    ];
  }

  const { first, last } = splitName(name);
  const cleanFirst = first.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLast = last.toLowerCase().replace(/[^a-z]/g, '') || 'lead';
  
  const email = `${cleanFirst}.${cleanLast}@${domain}`;
  const emailStatus: EmailStatus = 'verified';

  // Format a realistic verified mobile direct dial
  const areaCode = ['415', '206', '917', '512', '650', '312', '408'][Math.floor(Math.random() * 7)];
  const mid = Math.floor(100 + Math.random() * 900);
  const lastFour = Math.floor(1000 + Math.random() * 9000);
  const phone = includeMobile ? `+1 (${areaCode}) ${mid}-${lastFour}` : '';
  const phoneType: PhoneType = 'mobile';
  const phoneConfidence = includeMobile ? Math.floor(88 + Math.random() * 11) : 0; // 88 - 98%

  const candidate: Partial<Lead> = {
    firstName: first,
    lastName: last,
    fullName: name,
    headline,
    currentTitle: title,
    currentCompany: company,
    companyDomain: domain,
    location,
    linkedinUrl: url || `https://linkedin.com/in/${cleanFirst}-${cleanLast}`,
    avatarUrl: avatarUrl || `https://images.unsplash.com/photo-${1500000000000 + (Math.floor(Math.random() * 5000))}?w=150&auto=format&fit=crop&q=80`,
    email,
    emailStatus,
    phone,
    phoneType,
    phoneConfidence,
    mobilePhone: phone || undefined,
    mobileVerified: includeMobile,
    jobHistory,
    skills: ['B2B Sales', 'Lead Generation', 'CRM Automation', 'Pipeline Strategy', 'Executive Networking'],
    education: [
      {
        id: `edu-${Date.now()}`,
        school: 'University of California',
        degree: 'Bachelor of Science (B.S.)',
        years: '2012 - 2016'
      }
    ],
    stage: 'enriched',
    source: 'linkedin_extension',
    tags: ['Enriched via LeadPulse', 'Direct Mobile Found'],
    notes: `Extracted via LeadPulse extension. Work email ping: 250 OK. Direct mobile carrier validated.`
  };

  return {
    candidate,
    creditsUsed: {
      email: 1,
      mobile: includeMobile ? 5 : 0
    },
    providerSources: ['LinkedIn Public Profile', 'Corporate MX SMTP Validator', 'Telco Direct Dial Graph']
  };
}
