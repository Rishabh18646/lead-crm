import { Lead, OutreachSequence, SubscriptionPlan, CreditWallet, OutreachLog, UserProfile } from '../types';

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    firstName: 'Marcus',
    lastName: 'Vance',
    fullName: 'Marcus Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    headline: 'VP of Global Enterprise Sales at Datadog | Scaling Cloud Observability',
    currentTitle: 'VP of Global Enterprise Sales',
    currentCompany: 'Datadog',
    companyDomain: 'datadog.com',
    companySize: '5,000 - 10,000 employees',
    industry: 'Cloud Software & Monitoring',
    location: 'San Francisco, California, USA',
    linkedinUrl: 'https://linkedin.com/in/marcus-vance-datadog',
    email: 'marcus.vance@datadog.com',
    emailStatus: 'verified',
    secondaryEmail: 'mvance.sales@gmail.com',
    alternateEmail: 'mvance@datadog-enterprise.com',
    phone: '+1 (415) 628-9412',
    mobilePhone: '+1 (415) 628-9412',
    directPhone: '+1 (415) 890-4100',
    hqPhone: '+1 (866) 328-2364',
    phoneType: 'mobile',
    phoneConfidence: 96,
    mobileVerified: true,
    jobHistory: [
      {
        id: 'job-1',
        title: 'VP of Global Enterprise Sales',
        company: 'Datadog',
        period: 'Jan 2022 - Present',
        duration: '4 yrs 8 mos',
        location: 'San Francisco Bay Area',
        description: 'Leading 45+ enterprise account executives and sales engineers across North America and EMEA. Grew ARR from $180M to $460M.',
        isCurrent: true
      },
      {
        id: 'job-2',
        title: 'Senior Director of Strategic Accounts',
        company: 'Snowflake',
        period: 'Mar 2018 - Dec 2021',
        duration: '3 yrs 10 mos',
        location: 'San Mateo, CA',
        description: 'Managed Top 50 Fortune 500 strategic data cloud migrations. Exceeded 140% annual quota 3 years consecutively.',
        isCurrent: false
      },
      {
        id: 'job-3',
        title: 'Regional Sales Manager',
        company: 'Salesforce',
        period: 'Jun 2014 - Feb 2018',
        duration: '3 yrs 9 mos',
        location: 'San Francisco, CA',
        description: 'Enterprise cloud CRM solutions for West Coast tech unicorns.',
        isCurrent: false
      }
    ],
    education: [
      {
        id: 'edu-1',
        school: 'Stanford University',
        degree: 'B.S. in Management Science & Engineering',
        years: '2010 - 2014'
      }
    ],
    skills: ['Enterprise SaaS', 'B2B Sales Cadence', 'Cloud Architecture', 'Revenue Operations', 'Executive Negotiation'],
    summary: 'Seasoned enterprise sales leader with 12+ years driving hyper-growth in infrastructure software, observability, and data warehousing.',
    stage: 'in_sequence',
    source: 'linkedin_extension',
    tags: ['Enterprise', 'Tier 1 Target', 'Q3 Outbound'],
    notes: 'Ex-Snowflake colleague of David. Warm approach referencing their recent Gartner Magic Quadrant announcement.',
    sequenceId: 'seq-1',
    sequenceName: 'Enterprise B2B Cold Outbound',
    sequenceStep: 2,
    sequenceStatus: 'active',
    createdAt: '2026-08-10T14:30:00Z',
    updatedAt: '2026-09-14T09:15:00Z',
    lastContactedAt: '2026-09-14T09:15:00Z'
  },
  {
    id: 'lead-2',
    firstName: 'Elena',
    lastName: 'Rostova',
    fullName: 'Elena Rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    headline: 'Head of Infrastructure & Cloud Security @ Stripe | Kubernetes Contributor',
    currentTitle: 'Head of Infrastructure & Cloud Security',
    currentCompany: 'Stripe',
    companyDomain: 'stripe.com',
    companySize: '7,000+ employees',
    industry: 'Financial Technology',
    location: 'Seattle, Washington, USA',
    linkedinUrl: 'https://linkedin.com/in/elena-rostova-infra',
    email: 'elena.rostova@stripe.com',
    secondaryEmail: 'elena.rostova.personal@gmail.com',
    alternateEmail: 'erostova@stripe-security.net',
    emailStatus: 'verified',
    phone: '+1 (206) 489-3217',
    mobilePhone: '+1 (206) 489-3217',
    directPhone: '+1 (206) 555-8910',
    hqPhone: '+1 (888) 963-8955',
    phoneType: 'mobile',
    phoneConfidence: 94,
    mobileVerified: true,
    jobHistory: [
      {
        id: 'job-21',
        title: 'Head of Infrastructure & Cloud Security',
        company: 'Stripe',
        period: 'May 2021 - Present',
        duration: '5 yrs 4 mos',
        location: 'Seattle, WA',
        description: 'Overseeing multi-region payment gateway uptime (99.999%), zero-trust security postures, and global service mesh architectures.',
        isCurrent: true
      },
      {
        id: 'job-22',
        title: 'Staff Site Reliability Engineer',
        company: 'Amazon Web Services (AWS)',
        period: 'Aug 2016 - Apr 2021',
        duration: '4 yrs 9 mos',
        location: 'Seattle, WA',
        description: 'Core developer on AWS IAM and container security policies.',
        isCurrent: false
      }
    ],
    education: [
      {
        id: 'edu-21',
        school: 'University of Washington',
        degree: 'M.S. in Computer Science',
        years: '2014 - 2016'
      }
    ],
    skills: ['Kubernetes', 'Cloud Security', 'Zero Trust', 'Site Reliability', 'Distributed Systems'],
    summary: 'Engineering executive passionate about resilient architectures, automated compliance, and developer productivity tooling.',
    stage: 'meeting_booked',
    source: 'linkedin_extension',
    tags: ['Tech Decision Maker', 'High Intent'],
    notes: 'Booked discovery call for next Tuesday at 2 PM PST to review automated audit pipelines.',
    sequenceId: 'seq-1',
    sequenceName: 'Enterprise B2B Cold Outbound',
    sequenceStep: 3,
    sequenceStatus: 'replied',
    createdAt: '2026-08-15T11:00:00Z',
    updatedAt: '2026-09-16T16:20:00Z',
    lastContactedAt: '2026-09-16T16:20:00Z'
  },
  {
    id: 'lead-3',
    firstName: 'Devon',
    lastName: 'Chen',
    fullName: 'Devon Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    headline: 'Chief Product Officer @ NextScale | Ex-Figma, Airbnb | Angel Investor',
    currentTitle: 'Chief Product Officer',
    currentCompany: 'NextScale',
    companyDomain: 'nextscale.ai',
    companySize: '200 - 500 employees',
    industry: 'Artificial Intelligence & Productivity',
    location: 'Austin, Texas, USA',
    linkedinUrl: 'https://linkedin.com/in/devon-chen-product',
    email: 'devon@nextscale.ai',
    secondaryEmail: 'devon.chen.investor@gmail.com',
    alternateEmail: 'devon@founders-alumni.org',
    emailStatus: 'verified',
    phone: '+1 (512) 831-7704',
    mobilePhone: '+1 (512) 831-7704',
    directPhone: '+1 (512) 555-4321',
    hqPhone: '+1 (800) 555-7225',
    phoneType: 'mobile',
    phoneConfidence: 91,
    mobileVerified: true,
    jobHistory: [
      {
        id: 'job-31',
        title: 'Chief Product Officer',
        company: 'NextScale',
        period: 'Oct 2023 - Present',
        duration: '2 yrs 11 mos',
        location: 'Austin, TX',
        description: 'Directing AI agent product suites, developer platform SDKs, and enterprise collaboration features.',
        isCurrent: true
      },
      {
        id: 'job-32',
        title: 'Principal Product Manager',
        company: 'Figma',
        period: 'Jan 2020 - Sep 2023',
        duration: '3 yrs 9 mos',
        location: 'San Francisco, CA',
        description: 'Led FigJam enterprise adoption and collaboration integrations.',
        isCurrent: false
      },
      {
        id: 'job-33',
        title: 'Senior Product Manager',
        company: 'Airbnb',
        period: 'Jun 2017 - Dec 2019',
        duration: '2 yrs 7 mos',
        location: 'San Francisco, CA',
        description: 'Host growth tools and messaging automation.',
        isCurrent: false
      }
    ],
    education: [
      {
        id: 'edu-31',
        school: 'University of California, Berkeley - Haas School of Business',
        degree: 'B.S. in Business Administration',
        years: '2013 - 2017'
      }
    ],
    skills: ['Product Strategy', 'AI Agents', 'Product-Led Growth', 'UX Research', 'Roadmap Planning'],
    summary: 'Product leader focused on generative workflows, delightful UI ergonomics, and modern B2B SaaS distribution.',
    stage: 'contacted',
    source: 'public_profile_search',
    tags: ['C-Suite', 'AI Tooling'],
    notes: 'Sent personalized message on LinkedIn regarding their recent Product Hunt launch.',
    sequenceId: 'seq-2',
    sequenceName: 'Executive Founder & CPO Outreach',
    sequenceStep: 1,
    sequenceStatus: 'active',
    createdAt: '2026-09-01T08:20:00Z',
    updatedAt: '2026-09-12T13:45:00Z',
    lastContactedAt: '2026-09-12T13:45:00Z'
  },
  {
    id: 'lead-4',
    firstName: 'Amara',
    lastName: 'Okafor',
    fullName: 'Amara Okafor',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    headline: 'Director of Talent Acquisition & GTM Recruitment @ Ramp | Hiring top 1%',
    currentTitle: 'Director of Talent Acquisition',
    currentCompany: 'Ramp',
    companyDomain: 'ramp.com',
    companySize: '1,000 - 2,000 employees',
    industry: 'Fintech & Corporate Cards',
    location: 'New York City, New York, USA',
    linkedinUrl: 'https://linkedin.com/in/amara-okafor-talent',
    email: 'amara.okafor@ramp.com',
    emailStatus: 'verified',
    phone: '+1 (917) 554-0982',
    phoneType: 'mobile',
    phoneConfidence: 89,
    mobileVerified: true,
    jobHistory: [
      {
        id: 'job-41',
        title: 'Director of Talent Acquisition',
        company: 'Ramp',
        period: 'Feb 2022 - Present',
        duration: '4 yrs 7 mos',
        location: 'New York, NY',
        description: 'Built the sales recruiting machine that hired 120+ top-tier enterprise sellers in 18 months.',
        isCurrent: true
      },
      {
        id: 'job-42',
        title: 'Lead Recruiter',
        company: 'Brex',
        period: 'Jan 2019 - Jan 2022',
        duration: '3 yrs 1 mo',
        location: 'New York, NY',
        description: 'Scaled engineering and marketing divisions during Series B through Series D.',
        isCurrent: false
      }
    ],
    education: [
      {
        id: 'edu-41',
        school: 'Columbia University',
        degree: 'B.A. in Psychology & Organizational Behavior',
        years: '2015 - 2019'
      }
    ],
    skills: ['Talent Sourcing', 'GTM Recruitment', 'Executive Search', 'Candidate Experience', 'Compensation Design'],
    summary: 'Passionate recruiter scaling world-class venture-backed fintech engineering and GTM teams in NYC.',
    stage: 'enriched',
    source: 'linkedin_extension',
    tags: ['Recruiting', 'Fintech NY'],
    notes: 'Looking for prospecting automation for their in-house executive search teams.',
    createdAt: '2026-09-10T15:10:00Z',
    updatedAt: '2026-09-15T18:00:00Z'
  },
  {
    id: 'lead-5',
    firstName: 'Julian',
    lastName: 'Kessler',
    fullName: 'Julian Kessler',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    headline: 'Head of Demand Generation @ Figma | ex-HubSpot | RevOps Specialist',
    currentTitle: 'Head of Demand Generation',
    currentCompany: 'Figma',
    companyDomain: 'figma.com',
    companySize: '1,500+ employees',
    industry: 'Design & Software',
    location: 'San Francisco, California, USA',
    linkedinUrl: 'https://linkedin.com/in/julian-kessler-demandgen',
    email: 'jkessler@figma.com',
    emailStatus: 'verified',
    phone: '+1 (415) 791-4458',
    phoneType: 'mobile',
    phoneConfidence: 93,
    mobileVerified: true,
    jobHistory: [
      {
        id: 'job-51',
        title: 'Head of Demand Generation',
        company: 'Figma',
        period: 'Jul 2022 - Present',
        duration: '4 yrs 2 mos',
        location: 'San Francisco, CA',
        description: 'Managing $14M annual pipeline generation budget across digital paid, ABM, webinars, and outbound cadences.',
        isCurrent: true
      },
      {
        id: 'job-52',
        title: 'Senior Growth Marketing Manager',
        company: 'HubSpot',
        period: 'Aug 2018 - Jun 2022',
        duration: '3 yrs 11 mos',
        location: 'Boston, MA',
        description: 'Owned organic acquisition and enterprise lead routing optimizations.',
        isCurrent: false
      }
    ],
    education: [
      {
        id: 'edu-51',
        school: 'Northwestern University',
        degree: 'B.S. in Integrated Marketing Communications',
        years: '2014 - 2018'
      }
    ],
    skills: ['Demand Gen', 'Account Based Marketing (ABM)', 'Lead Enrichment', 'HubSpot', 'Salesforce CRM'],
    summary: 'Growth marketer blending technical data pipelines with high-converting creative outbound campaigns.',
    stage: 'new',
    source: 'linkedin_extension',
    tags: ['Marketing VP', 'Inbound/Outbound'],
    notes: 'Just imported via Chrome extension from public LinkedIn profile. Ready for enrichment verification.',
    createdAt: '2026-09-17T19:00:00Z',
    updatedAt: '2026-09-17T19:00:00Z'
  }
];

export const INITIAL_SEQUENCES: OutreachSequence[] = [
  {
    id: 'seq-1',
    name: 'Enterprise B2B Cold Outbound',
    description: 'High-touch 4-step multichannel sequence for VPs of Sales, Heads of Revenue, and GTM leaders.',
    targetRole: 'VP Sales, Head of RevOps, CRO',
    status: 'active',
    enrolledCount: 142,
    openRate: 67.4,
    replyRate: 23.8,
    bounceRate: 1.4,
    meetingCount: 28,
    createdAt: '2026-07-15T00:00:00Z',
    steps: [
      {
        id: 'step-1',
        order: 1,
        day: 1,
        channel: 'linkedin_connect',
        title: 'LinkedIn Connection Request with personalized note',
        templateBody: 'Hi {{first_name}}, loved your recent insights on scaling {{company}}\'s team. Would love to stay connected and follow your growth journey here in the SaaS space!',
        enabled: true
      },
      {
        id: 'step-2',
        order: 2,
        day: 3,
        channel: 'email',
        title: 'Initial Value Email: Eliminating Lead Duplication & Enrichment Gaps',
        templateSubject: 'Quick question regarding {{company}}\'s outbound lead quality',
        templateBody: 'Hi {{first_name}},\n\nSaw your background leading the team at {{company}} (and your previous run at {{previous_company}}!).\n\nMost enterprise sales leaders we talk to lose 15-20% of rep time chasing duplicated CRM contacts or bouncing emails. We built LeadPulse to automate direct mobile extraction and real-time deduplication right from LinkedIn.\n\nAre you open to a 7-minute peer teardown of your current prospecting stack this Thursday?\n\nBest,\nSales Team',
        enabled: true
      },
      {
        id: 'step-3',
        order: 3,
        day: 6,
        channel: 'call',
        title: 'Direct Phone Touchpoint & Voicemail Drop',
        templateBody: 'Call direct mobile ({{phone}}). Reference email sent on Day 3. Leave 20-second voicemail highlighting 98% phone validation rate.',
        enabled: true
      },
      {
        id: 'step-4',
        order: 4,
        day: 9,
        channel: 'email',
        title: 'Social Proof & Closing Case Study',
        templateSubject: 'How Datadog reps cut bounce rates under 1.5%',
        templateBody: 'Hi {{first_name}},\n\nWanted to share a quick 1-page case study on how similar sales organizations at your stage automated their LinkedIn prospecting workflow without polluting their CRM with duplicate records.\n\nWorth sharing the PDF over here, or should I reach out next month instead?\n\nCheers,\nAlex',
        enabled: true
      }
    ]
  },
  {
    id: 'seq-2',
    name: 'Executive Founder & CPO Outreach',
    description: 'Concise, value-dense 3-step sequence tailored for C-suite founders and product executives.',
    targetRole: 'Founder, CEO, CPO, CTO',
    status: 'active',
    enrolledCount: 88,
    openRate: 72.1,
    replyRate: 19.5,
    bounceRate: 0.9,
    meetingCount: 16,
    createdAt: '2026-08-01T00:00:00Z',
    steps: [
      {
        id: 'step-201',
        order: 1,
        day: 1,
        channel: 'linkedin_inmail',
        title: 'InMail: Mutual founder respect & brief question',
        templateSubject: 'Quick question about {{company}}\'s tech roadmap',
        templateBody: 'Hi {{first_name}},\n\nMassive congrats on {{company}}\'s momentum! Given your product pedigree from {{previous_company}}, wanted to see how you are currently handling outbound data integrity for your GTM pipeline.\n\nOpen to a quick exchange?',
        enabled: true
      },
      {
        id: 'step-202',
        order: 2,
        day: 4,
        channel: 'email',
        title: 'Short Value-Add & Interactive Demo Link',
        templateSubject: 'Enriching {{company}}\'s prospective accounts without duplicates',
        templateBody: 'Hi {{first_name}},\n\nReaching back out since product executives usually care about clean pipeline telemetry as much as revenue teams do.\n\nHere is a 60-second interactive preview of how our extension extracts direct mobiles and checks CRM duplicates on the fly. Would this save your team headache this quarter?\n\nBest,\nLeadPulse Team',
        enabled: true
      },
      {
        id: 'step-203',
        order: 3,
        day: 8,
        channel: 'email',
        title: 'Graceful Breakup / Permission to Close Loop',
        templateSubject: 'Closing the loop for now, {{first_name}}',
        templateBody: 'Hi {{first_name}},\n\nAssuming you are heads-down building {{company}} right now! I will step back, but if you ever need verified direct mobiles or automated deduplication down the road, feel free to give our chrome extension a spin.\n\nWishing you and the team continued success!\nAlex',
        enabled: true
      }
    ]
  },
  {
    id: 'seq-3',
    name: 'Tech Talent & Executive Recruitment',
    description: 'Nurture cadence for sourcing Senior Engineering Leaders and Technical Architects.',
    targetRole: 'VP Engineering, Staff SRE, Architect',
    status: 'paused',
    enrolledCount: 54,
    openRate: 59.3,
    replyRate: 14.8,
    bounceRate: 2.2,
    meetingCount: 8,
    createdAt: '2026-08-20T00:00:00Z',
    steps: [
      {
        id: 'step-301',
        order: 1,
        day: 1,
        channel: 'linkedin_connect',
        title: 'Connection request celebrating technical milestones',
        templateBody: 'Hi {{first_name}}, impressed by your engineering leadership at {{company}}. Would love to connect!',
        enabled: true
      },
      {
        id: 'step-302',
        order: 2,
        day: 4,
        channel: 'email',
        title: 'Exclusive confidential advisory or executive role',
        templateSubject: 'Confidential inquiry regarding {{company}} engineering',
        templateBody: 'Hi {{first_name}},\n\nHope your week is going well. We are working with top Series C tech firms seeking advisors with your specific background in {{skills}}.\n\nWould you be open to an exploratory 10-minute catchup?',
        enabled: true
      }
    ]
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-starter',
    tier: 'starter',
    name: 'Starter Prospector',
    priceMonthly: 39,
    priceAnnualMonthly: 29,
    creditsEmailPerMonth: 500,
    creditsMobilePerMonth: 100,
    teamSeats: 1,
    features: [
      '500 Verified Work Emails / month',
      '100 Direct Mobile Phone numbers',
      'Instant Duplicate Detection',
      'Chrome Browser Extension',
      'Basic CRM Pipeline & Export',
      '1 Active Automated Sequence',
      'Standard Email Support'
    ]
  },
  {
    id: 'plan-growth',
    tier: 'growth',
    name: 'Growth & Sales Pro',
    badge: 'MOST POPULAR',
    isPopular: true,
    priceMonthly: 89,
    priceAnnualMonthly: 69,
    creditsEmailPerMonth: 2500,
    creditsMobilePerMonth: 500,
    teamSeats: 3,
    features: [
      '2,500 Verified Work Emails / month',
      '500 Direct Mobile Phone numbers',
      'Automated Multi-Match Deduplication',
      'Unlimited Chrome Extension Injections',
      'Unlimited Outreach Sequences',
      'Multi-touch Email + LinkedIn Cadences',
      'Full Sales Performance Analytics',
      'CSV Bulk Enrichment & Auto-Merge',
      '3 Team Member Seats Included',
      'Priority Support & SLA'
    ]
  },
  {
    id: 'plan-enterprise',
    tier: 'enterprise',
    name: 'Enterprise Scale',
    priceMonthly: 219,
    priceAnnualMonthly: 179,
    creditsEmailPerMonth: 10000,
    creditsMobilePerMonth: 2500,
    teamSeats: 10,
    features: [
      '10,000 Verified Work Emails / month',
      '2,500 Direct Mobile Phone numbers',
      'AI-Powered Outreach Personalization',
      'Real-time Webhook & REST API Access',
      'Custom CRM Fields & Stage Mapping',
      'Dedicated Customer Success Manager',
      'Custom Deduplication Rules Engine',
      'Phone Number Validation Guarantee',
      '10 Team Seats + Role Permissions',
      'Custom SLA & Invoicing Available'
    ]
  }
];

export const INITIAL_WALLET: CreditWallet = {
  emailCreditsRemaining: 1840,
  emailCreditsTotal: 2500,
  mobileCreditsRemaining: 345,
  mobileCreditsTotal: 500,
  currentPlan: 'growth',
  renewsAt: '2026-10-01T00:00:00Z'
};

export const SAMPLE_OUTREACH_LOGS: OutreachLog[] = [
  {
    id: 'log-1',
    leadId: 'lead-1',
    leadName: 'Marcus Vance',
    sequenceId: 'seq-1',
    sequenceName: 'Enterprise B2B Cold Outbound',
    stepNumber: 1,
    channel: 'linkedin_connect',
    status: 'sent',
    timestamp: '2026-09-10T14:32:00Z'
  },
  {
    id: 'log-2',
    leadId: 'lead-1',
    leadName: 'Marcus Vance',
    sequenceId: 'seq-1',
    sequenceName: 'Enterprise B2B Cold Outbound',
    stepNumber: 2,
    channel: 'email',
    status: 'opened',
    timestamp: '2026-09-14T09:15:00Z',
    subject: 'Quick question regarding Datadog\'s outbound lead quality'
  },
  {
    id: 'log-3',
    leadId: 'lead-2',
    leadName: 'Elena Rostova',
    sequenceId: 'seq-1',
    sequenceName: 'Enterprise B2B Cold Outbound',
    stepNumber: 3,
    channel: 'email',
    status: 'replied',
    timestamp: '2026-09-16T16:20:00Z',
    subject: 'Re: Quick question regarding Stripe\'s outbound lead quality'
  },
  {
    id: 'log-4',
    leadId: 'lead-3',
    leadName: 'Devon Chen',
    sequenceId: 'seq-2',
    sequenceName: 'Executive Founder & CPO Outreach',
    stepNumber: 1,
    channel: 'linkedin_inmail',
    status: 'opened',
    timestamp: '2026-09-12T13:45:00Z'
  }
];

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user-admin-1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@leadpulse.io',
    role: 'admin',
    title: 'Head of Revenue Operations',
    company: 'Nexus Global Software',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 392-1084',
    bio: 'Overseeing GTM outbound stack, CRM data deduplication, and enterprise prospecting workflows across 20+ SDRs.',
    department: 'Revenue Operations',
    createdAt: '2026-01-15T08:00:00Z',
    lastLoginAt: '2026-09-18T07:15:00Z'
  },
  {
    id: 'user-member-1',
    name: 'Marcus Chen',
    email: 'marcus.chen@leadpulse.io',
    role: 'member',
    title: 'Senior Account Executive',
    company: 'Nexus Global Software',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 782-9931',
    bio: 'Closing high-value Enterprise SaaS deals. Focused on West Coast VP/C-level tech buyers.',
    department: 'Enterprise Sales',
    createdAt: '2026-03-10T10:00:00Z',
    lastLoginAt: '2026-09-17T18:40:00Z'
  },
  {
    id: 'user-member-2',
    name: 'Elena Rodriguez',
    email: 'elena.rodriguez@leadpulse.io',
    role: 'member',
    title: 'Outbound SDR Specialist',
    company: 'Nexus Global Software',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 441-2910',
    bio: 'High-touch multichannel outbound sequencing via LinkedIn and cold direct phone dialing.',
    department: 'Sales Development',
    createdAt: '2026-05-01T09:30:00Z',
    lastLoginAt: '2026-09-18T06:20:00Z'
  }
];
