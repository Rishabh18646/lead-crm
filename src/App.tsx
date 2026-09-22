import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowUp, ShieldCheck, Lock, LogIn, AlertTriangle, Sparkles } from 'lucide-react';
import { Lead, OutreachSequence, CreditWallet, OutreachLog, LeadStage, UserProfile, UserRole } from './types';
import { INITIAL_LEADS, INITIAL_SEQUENCES, INITIAL_WALLET, SAMPLE_OUTREACH_LOGS, SUBSCRIPTION_PLANS } from './data/mockData';
import { Header, TabType, TAB_LABELS } from './components/Header';
import { LeadTable } from './components/LeadTable';
import { LeadDrawer } from './components/LeadDrawer';
import { LeadEnrichmentModal } from './components/LeadEnrichmentModal';
import { DuplicateAudit } from './components/DuplicateAuditModal';
import { SequenceManager } from './components/SequenceManager';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { BrowserExtensionPreview } from './components/BrowserExtensionPreview';
import { SubscriptionModal } from './components/SubscriptionModal';
import { ExcelLeadImportModal } from './components/ExcelLeadImportModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { TeamView } from './components/TeamView';
import { PricingView } from './components/PricingView';
import { findDuplicateMatches } from './services/deduplicationService';
import { advanceLeadInSequence } from './services/outreachService';
import { authService } from './services/authService';

export default function App() {
  // Authentication & Session State - strictly server-governed (never client-forged)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isInitializingAuth, setIsInitializingAuth] = useState(true);

  // CRM & Workspace Data
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('leadpulse_leads');
      return saved ? JSON.parse(saved) : INITIAL_LEADS;
    } catch {
      return INITIAL_LEADS;
    }
  });

  const [sequences, setSequences] = useState<OutreachSequence[]>(() => {
    try {
      const saved = localStorage.getItem('leadpulse_sequences');
      return saved ? JSON.parse(saved) : INITIAL_SEQUENCES;
    } catch {
      return INITIAL_SEQUENCES;
    }
  });

  const [wallet, setWallet] = useState<CreditWallet>(() => {
    try {
      const saved = localStorage.getItem('leadpulse_wallet');
      return saved ? JSON.parse(saved) : INITIAL_WALLET;
    } catch {
      return INITIAL_WALLET;
    }
  });

  const [logs, setLogs] = useState<OutreachLog[]>(() => {
    try {
      const saved = localStorage.getItem('leadpulse_logs');
      return saved ? JSON.parse(saved) : SAMPLE_OUTREACH_LOGS;
    } catch {
      return SAMPLE_OUTREACH_LOGS;
    }
  });

  // Route & Navigation State - Powered by React Router
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract active tab from URL path (e.g. /crm, /pricing, /sequences)
  const pathSegment = location.pathname.replace(/^\/+/, '').split('/')[0] || '';
  const VALID_TABS: TabType[] = ['crm', 'sequences', 'analytics', 'extension', 'dedup', 'pricing', 'team'];
  const activeTab: TabType = (VALID_TABS.includes(pathSegment as TabType) ? pathSegment : 'crm') as TabType;

  // Track previous tab for intuitive in-app back navigation
  const [previousTab, setPreviousTab] = useState<TabType | null>(null);
  const previousTabRef = React.useRef<TabType>(activeTab);

  useEffect(() => {
    if (previousTabRef.current !== activeTab) {
      setPreviousTab(previousTabRef.current);
      previousTabRef.current = activeTab;
    }
  }, [activeTab]);

  // If path is root '/', redirect to '/crm' preserving any query params
  useEffect(() => {
    if (location.pathname === '' || location.pathname === '/') {
      navigate('/crm' + (location.search || ''), { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  // URL search params for drawer & modals
  const leadIdParam = searchParams.get('lead');
  const modalParam = searchParams.get('modal');

  // Selected lead derived directly from URL param (supports browser forward/back)
  const selectedLead = leadIdParam ? leads.find(l => l.id === leadIdParam) || null : null;

  // Modal overlays derived directly from URL param
  const isEnrichModalOpen = modalParam === 'enrich';
  const isPricingModalOpen = modalParam === 'pricing';
  const isExcelImportModalOpen = modalParam === 'import';
  const isAuthModalOpen = modalParam === 'auth';
  const isProfileModalOpen = modalParam === 'profile';

  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial Server Session Verification
  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      try {
        const user = await authService.getCurrentUser();
        if (isMounted && user) {
          setCurrentUser(user);
          const members = await authService.fetchWorkspaceMembers();
          if (isMounted && members.length > 0) {
            setProfiles(members);
          }
        } else if (isMounted) {
          setCurrentUser(null);
        }
      } catch (err) {
        if (isMounted) setCurrentUser(null);
      } finally {
        if (isMounted) setIsInitializingAuth(false);
      }
    }

    verifySession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync business entities with localStorage
  useEffect(() => {
    localStorage.setItem('leadpulse_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('leadpulse_sequences', JSON.stringify(sequences));
  }, [sequences]);

  useEffect(() => {
    localStorage.setItem('leadpulse_wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('leadpulse_logs', JSON.stringify(logs));
  }, [logs]);

  // Scroll listener for Back to Top helper
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 280);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const handleSwitchTab = (newTab: TabType) => {
    if (newTab !== activeTab) {
      navigate(`/${newTab}`);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleBackToPreviousTab = () => {
    // If browser history has an entry, go back
    if (window.history.length > 1) {
      navigate(-1);
    } else if (previousTab && previousTab !== activeTab) {
      navigate(`/${previousTab}`);
    } else {
      navigate('/crm');
    }
  };

  const handleSelectLead = (lead: Lead | null) => {
    const params = new URLSearchParams(location.search);
    if (lead) {
      params.set('lead', lead.id);
      navigate({ pathname: location.pathname, search: params.toString() });
    } else {
      handleCloseDrawer();
    }
  };

  const handleCloseDrawer = () => {
    if (searchParams.has('lead')) {
      if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        const params = new URLSearchParams(location.search);
        params.delete('lead');
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
      }
    }
  };

  const openModal = (modalName: 'enrich' | 'pricing' | 'import' | 'auth' | 'profile') => {
    const params = new URLSearchParams(location.search);
    params.set('modal', modalName);
    navigate({ pathname: location.pathname, search: params.toString() });
  };

  const closeModal = () => {
    if (searchParams.has('modal')) {
      if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        const params = new URLSearchParams(location.search);
        params.delete('modal');
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImportCompleted = (newLeads: Lead[], mergedCount: number) => {
    setLeads(prev => [...newLeads, ...prev]);
    showToast(`Successfully imported ${newLeads.length.toLocaleString()} leads into CRM! (${mergedCount} duplicates handled).`);
    handleSwitchTab('crm');
  };

  // Duplicate detection count across CRM
  let duplicateCount = 0;
  for (let i = 0; i < leads.length; i++) {
    for (let j = i + 1; j < leads.length; j++) {
      if (findDuplicateMatches(leads[j], [leads[i]]).length > 0) {
        duplicateCount++;
      }
    }
  }

  // Filter leads based on search query
  const displayedLeads = leads.filter(lead => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      lead.fullName.toLowerCase().includes(q) ||
      lead.currentCompany.toLowerCase().includes(q) ||
      lead.currentTitle.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      lead.phone.includes(q) ||
      lead.location.toLowerCase().includes(q)
    );
  });

  // Handlers
  const handleAddLead = (newLead: Lead, creditsUsed: { email: number; mobile: number }) => {
    setLeads(prev => [newLead, ...prev]);
    setWallet(prev => ({
      ...prev,
      emailCreditsRemaining: Math.max(0, prev.emailCreditsRemaining - creditsUsed.email),
      mobileCreditsRemaining: Math.max(0, prev.mobileCreditsRemaining - creditsUsed.mobile)
    }));
    showToast(`Lead "${newLead.fullName}" enriched & added to CRM.`);
  };

  const handleMergeLead = (updatedLead: Lead, creditsUsed: { email: number; mobile: number }) => {
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    setWallet(prev => ({
      ...prev,
      emailCreditsRemaining: Math.max(0, prev.emailCreditsRemaining - creditsUsed.email),
      mobileCreditsRemaining: Math.max(0, prev.mobileCreditsRemaining - creditsUsed.mobile)
    }));
    showToast(`Lead "${updatedLead.fullName}" successfully merged with enriched data.`);
  };

  const handleUpdateStage = (leadId: string, stage: LeadStage) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage, updatedAt: new Date().toISOString() } : l));
  };

  // Secure Server-Enforced Lead Deletion (Admin Only)
  const handleDeleteLead = async (leadId: string) => {
    // Optimistic guard check on client, but the real authority is the server
    if (!currentUser) {
      showToast('Authentication required to perform lead deletion.');
      openModal('auth');
      return;
    }

    try {
      const res = await authService.deleteLeadServer(leadId);
      if (!res.success) {
        showToast(res.error || 'Server error: permission denied.');
        return;
      }
      const target = leads.find(l => l.id === leadId);
      setLeads(prev => prev.filter(l => l.id !== leadId));
      if (selectedLead?.id === leadId) {
        handleCloseDrawer();
      }
      showToast(`Lead "${target?.fullName || 'Prospect'}" removed from CRM.`);
    } catch {
      showToast('Network error while deleting lead.');
    }
  };

  // User Profile & Authentication Handlers (Zero-Trust Server Flow)
  const handleLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const res = await authService.loginUser(email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      const members = await authService.fetchWorkspaceMembers();
      if (members.length > 0) {
        setProfiles(members);
      }
      showToast(`Welcome back, ${res.user.name}! Authenticated with ${res.user.role === 'admin' ? 'Admin Access' : 'Normal Access'}.`);
      return { success: true };
    }
    return { success: false, error: res.error || 'Invalid email or password.' };
  };

  const handleSignup = async (profileData: {
    name: string;
    email: string;
    password: string;
    company?: string;
    title?: string;
    phone?: string;
    department?: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const res = await authService.signupUser(profileData);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      const members = await authService.fetchWorkspaceMembers();
      if (members.length > 0) {
        setProfiles(members);
      }
      showToast(`Welcome to LeadPulse, ${res.user.name}! Account registered successfully.`);
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to create workspace account.' };
  };

  const handleLogout = async () => {
    await authService.logoutUser();
    setCurrentUser(null);
    showToast('Signed out of workspace session.');
    openModal('auth');
  };

  const handleUpdateProfile = async (updated: UserProfile) => {
    const res = await authService.updateCurrentUserProfile({
      name: updated.name,
      title: updated.title,
      company: updated.company,
      phone: updated.phone,
      avatarUrl: updated.avatarUrl,
      department: updated.department,
      bio: updated.bio
    });

    if (res.success && res.user) {
      setCurrentUser(res.user);
      setProfiles(prev => prev.map(p => p.id === res.user!.id ? res.user! : p));
      showToast(`Profile "${res.user.name}" updated successfully.`);
    } else {
      showToast(res.error || 'Server error updating profile.');
    }
  };

  // Secure Server-Enforced Role Change (Admin Only)
  const handleChangeUserRole = async (profileId: string, newRole: UserRole) => {
    if (!currentUser) {
      showToast('Authentication required.');
      return;
    }

    const res = await authService.updateMemberRole(profileId, newRole);
    if (res.success) {
      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, role: newRole } : p));
      if (currentUser?.id === profileId) {
        setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
      }
      showToast(`Updated role on server to ${newRole === 'admin' ? 'Administrator' : 'Normal Member'}.`);
    } else {
      showToast(res.error || 'Permission Denied: Administrator authority required.');
    }
  };

  // Secure Server-Enforced Member Deletion (Admin Only)
  const handleDeleteProfile = async (profileId: string) => {
    if (!currentUser) {
      showToast('Authentication required.');
      return;
    }

    const res = await authService.deleteMember(profileId);
    if (res.success) {
      setProfiles(prev => prev.filter(p => p.id !== profileId));
      showToast('Member removed from workspace.');
    } else {
      showToast(res.error || 'Server error: unable to remove member.');
    }
  };

  const handleBulkEnroll = (leadIds: string[]) => {
    const targetSeq = sequences[0];
    if (!targetSeq) return;

    setLeads(prev => prev.map(l => {
      if (leadIds.includes(l.id)) {
        return {
          ...l,
          stage: 'in_sequence',
          sequenceId: targetSeq.id,
          sequenceName: targetSeq.name,
          sequenceStep: 1,
          sequenceStatus: 'active',
          updatedAt: new Date().toISOString()
        };
      }
      return l;
    }));

    setSequences(prev => prev.map(s => s.id === targetSeq.id ? { ...s, enrolledCount: s.enrolledCount + leadIds.length } : s));
    showToast(`${leadIds.length} lead(s) enrolled into "${targetSeq.name}".`);
  };

  const handleBulkExport = (leadIds: string[]) => {
    const exportTargets = leads.filter(l => leadIds.includes(l.id));
    if (exportTargets.length === 0) return;

    const headers = [
      'Full Name',
      'First Name',
      'Last Name',
      'Current Title',
      'Current Company',
      'Direct Mobile Phone',
      'Direct Work Phone',
      'Company HQ Phone',
      'Verified Work Email',
      'Personal Email',
      'Alternate Corporate Email',
      'LinkedIn Profile',
      'Location',
      'Industry',
      'Stage',
      'Sequence',
      'Step'
    ];

    const rows = exportTargets.map(l => [
      `"${(l.fullName || '').replace(/"/g, '""')}"`,
      `"${(l.firstName || '').replace(/"/g, '""')}"`,
      `"${(l.lastName || '').replace(/"/g, '""')}"`,
      `"${(l.currentTitle || '').replace(/"/g, '""')}"`,
      `"${(l.currentCompany || '').replace(/"/g, '""')}"`,
      `"${(l.mobilePhone || (l.phoneType === 'mobile' ? l.phone : '') || '').replace(/"/g, '""')}"`,
      `"${(l.directPhone || (l.phoneType === 'direct' ? l.phone : '') || '').replace(/"/g, '""')}"`,
      `"${(l.hqPhone || (l.phoneType === 'hq' ? l.phone : '') || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.secondaryEmail || '').replace(/"/g, '""')}"`,
      `"${(l.alternateEmail || '').replace(/"/g, '""')}"`,
      `"${(l.linkedinUrl || '').replace(/"/g, '""')}"`,
      `"${(l.location || '').replace(/"/g, '""')}"`,
      `"${(l.industry || '').replace(/"/g, '""')}"`,
      `"${(l.stage || '').replace(/"/g, '""')}"`,
      `"${(l.sequenceName || 'None').replace(/"/g, '""')}"`,
      `"${l.sequenceStep || 0}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LeadPulse_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${exportTargets.length} leads with multi-category contacts to CSV.`);
  };

  const handleAdvanceLead = (leadId: string) => {
    const target = leads.find(l => l.id === leadId);
    if (!target || !target.sequenceId) return;

    const targetSeq = sequences.find(s => s.id === target.sequenceId);
    if (!targetSeq) return;

    const currentStep = targetSeq.steps[target.sequenceStep ? target.sequenceStep - 1 : 0] || targetSeq.steps[0];
    if (!currentStep) return;

    const result = advanceLeadInSequence(target, currentStep, targetSeq.name);
    setLeads(prev => prev.map(l => l.id === leadId ? result.updatedLead : l));
    setLogs(prev => [result.log, ...prev]);
    showToast(`Lead advanced to Step ${result.updatedLead.sequenceStep || 1} in "${targetSeq.name}".`);
  };

  const handleEnrollSingleLead = (leadId: string, sequenceId: string) => {
    const targetSeq = sequences.find(s => s.id === sequenceId);
    if (!targetSeq) return;

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          stage: 'in_sequence',
          sequenceId: targetSeq.id,
          sequenceName: targetSeq.name,
          sequenceStep: 1,
          sequenceStatus: 'active',
          updatedAt: new Date().toISOString()
        };
      }
      return l;
    }));

    setSequences(prev => prev.map(s => s.id === sequenceId ? { ...s, enrolledCount: s.enrolledCount + 1 } : s));
    showToast(`Prospect enrolled in "${targetSeq.name}".`);
  };

  const handleUpgradePlan = (planId: string) => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) return;

    setWallet(prev => ({
      ...prev,
      currentPlan: plan.tier,
      emailCreditsTotal: plan.creditsEmailPerMonth,
      emailCreditsRemaining: plan.creditsEmailPerMonth,
      mobileCreditsTotal: plan.creditsMobilePerMonth,
      mobileCreditsRemaining: plan.creditsMobilePerMonth,
      renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }));
    showToast(`Upgraded subscription to ${plan.name}! Credits refreshed.`);
  };

  const handleTopUpCredits = (type: 'email' | 'mobile', amount: number) => {
    setWallet(prev => ({
      ...prev,
      ...(type === 'email' ? {
        emailCreditsTotal: prev.emailCreditsTotal + amount,
        emailCreditsRemaining: prev.emailCreditsRemaining + amount
      } : {
        mobileCreditsTotal: prev.mobileCreditsTotal + amount,
        mobileCreditsRemaining: prev.mobileCreditsRemaining + amount
      })
    }));
    showToast(`Added +${amount.toLocaleString()} ${type} credits to your wallet.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* App Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleSwitchTab}
        previousTab={previousTab}
        onBackToPreviousTab={handleBackToPreviousTab}
        wallet={wallet}
        leadsCount={leads.length}
        duplicateCount={duplicateCount}
        onOpenEnrichModal={() => openModal('enrich')}
        onOpenPricingModal={() => handleSwitchTab('pricing')}
        onOpenExcelImportModal={() => openModal('import')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentUser={currentUser}
        onOpenProfileModal={() => openModal('profile')}
        onOpenAuthModal={() => openModal('auth')}
        onLogout={handleLogout}
      />

      {/* Unauthenticated Security Banner */}
      {!isInitializingAuth && !currentUser && (
        <div className="bg-amber-950/40 border-b border-amber-800/40 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>You are viewing workspace leads in read-only guest mode. Sign in to edit records, extract contacts, or run outreach sequences.</span>
            </div>
            <button
              onClick={() => openModal('auth')}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with Password</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <span>✨</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab 1: CRM Leads Pipeline & Table */}
        {activeTab === 'crm' && (
          <LeadTable
            leads={displayedLeads}
            currentUser={currentUser}
            onSelectLead={handleSelectLead}
            onUpdateStage={handleUpdateStage}
            onDeleteLead={handleDeleteLead}
            onBulkEnroll={handleBulkEnroll}
            onBulkExport={handleBulkExport}
            onRunDedup={() => handleSwitchTab('dedup')}
            onOpenEnrichModal={() => openModal('enrich')}
            onOpenExcelImportModal={() => openModal('import')}
          />
        )}

        {/* Tab 2: Automated Sequences */}
        {activeTab === 'sequences' && (
          <SequenceManager
            sequences={sequences}
            leads={leads}
            onUpdateSequence={(updated) => setSequences(prev => prev.map(s => s.id === updated.id ? updated : s))}
            onCreateSequence={(newSeq) => setSequences(prev => [...prev, newSeq])}
            onAdvanceLeadInSequence={handleAdvanceLead}
          />
        )}

        {/* Tab 3: Performance Analytics */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            leads={leads}
            sequences={sequences}
            logs={logs}
          />
        )}

        {/* Tab 4: Browser Extension Simulator & Manifest V3 */}
        {activeTab === 'extension' && (
          <BrowserExtensionPreview
            existingLeads={leads}
            onImportLead={(newLead) => {
              setLeads(prev => [newLead, ...prev]);
              showToast(`Lead "${newLead.fullName}" captured via LeadPulse Chrome Extension.`);
              handleSwitchTab('crm');
            }}
            onOpenPricing={() => handleSwitchTab('pricing')}
          />
        )}

        {/* Tab 5: Duplicate Defense & Audit */}
        {activeTab === 'dedup' && (
          <DuplicateAudit
            leads={leads}
            onMergeLeads={(mergedLead: Lead, removedLeadId: string) => {
              setLeads(prev => prev.filter(l => l.id !== removedLeadId).map(l => l.id === mergedLead.id ? mergedLead : l));
              showToast(`Lead "${mergedLead.fullName}" merged with duplicate.`);
            }}
            onSimulateDuplicate={() => {
              showToast('Duplicate scan completed. All prospect records checked.');
            }}
          />
        )}

        {/* Tab 6: Subscription & Plans */}
        {activeTab === 'pricing' && (
          <PricingView
            wallet={wallet}
            onUpgradePlan={(tier) => {
              const targetPlan = SUBSCRIPTION_PLANS.find(p => p.tier === tier);
              if (targetPlan) handleUpgradePlan(targetPlan.id);
            }}
            onTopUpCredits={handleTopUpCredits}
            onBack={handleBackToPreviousTab}
            previousPageTitle={TAB_LABELS[previousTab || 'crm'] || 'Dashboard'}
          />
        )}

        {/* Tab 7: Team & Role-Based Profiles (Admin vs Normal) */}
        {activeTab === 'team' && (
          <TeamView
            currentUser={currentUser}
            allProfiles={profiles}
            onOpenCreateProfile={() => openModal('auth')}
            onChangeUserRole={handleChangeUserRole}
            onDeleteProfile={handleDeleteProfile}
            onOpenProfileModal={() => openModal('profile')}
          />
        )}

      </main>

      {/* Modals & Drawers */}
      
      {/* Lead Dossier Side Drawer */}
      <LeadDrawer
        lead={selectedLead}
        onClose={handleCloseDrawer}
        onUpdateLead={(updated) => {
          setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
          showToast('Prospect notes and status updated.');
        }}
        sequences={sequences}
        onEnrollLead={handleEnrollSingleLead}
        onAdvanceLead={handleAdvanceLead}
      />

      {/* LinkedIn Profile Enrichment Modal */}
      <LeadEnrichmentModal
        isOpen={isEnrichModalOpen}
        onClose={closeModal}
        existingLeads={leads}
        wallet={wallet}
        onAddLead={handleAddLead}
        onMergeLead={handleMergeLead}
        onOpenPricing={() => {
          closeModal();
          handleSwitchTab('pricing');
        }}
      />

      {/* Subscription & Pricing Modal */}
      <SubscriptionModal
        isOpen={isPricingModalOpen}
        onClose={closeModal}
        wallet={wallet}
        onUpgradePlan={handleUpgradePlan}
        onTopUpCredits={handleTopUpCredits}
      />

      {/* Excel Sheet Bulk 1000+ Leads Import Modal */}
      <ExcelLeadImportModal
        isOpen={isExcelImportModalOpen}
        onClose={closeModal}
        existingLeads={leads}
        onImportCompleted={handleImportCompleted}
      />

      {/* Authentication & Signup Modal (Real Password Auth Flow) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeModal}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />

      {/* Profile & Team Permissions Modal */}
      {currentUser && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={closeModal}
          currentUser={currentUser}
          allProfiles={profiles}
          onUpdateProfile={handleUpdateProfile}
          onOpenCreateProfile={() => {
            closeModal();
            openModal('auth');
          }}
          onDeleteProfile={handleDeleteProfile}
          onChangeUserRole={handleChangeUserRole}
          onLogout={handleLogout}
        />
      )}

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-40 bg-slate-900/95 hover:bg-slate-800 text-slate-200 hover:text-white px-3.5 py-2.5 rounded-full border border-slate-700 shadow-2xl transition-all active:scale-95 flex items-center gap-2 text-xs font-semibold backdrop-blur-md animate-in fade-in slide-in-from-bottom-3"
          title="Scroll back to top"
        >
          <ArrowUp className="w-4 h-4 text-indigo-400" />
          <span>Back to Top</span>
        </button>
      )}

    </div>
  );
}
