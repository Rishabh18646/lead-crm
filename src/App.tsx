import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { findDuplicateMatches, mergeLeads } from './services/deduplicationService';
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
  const isInviteModalOpen = modalParam === 'invite';

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

  // Sync business entities with localStorage (writes can throw on quota exceeded / private mode)
  const persist = (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`Could not persist ${key} to localStorage:`, err);
    }
  };

  useEffect(() => persist('leadpulse_leads', leads), [leads]);
  useEffect(() => persist('leadpulse_sequences', sequences), [sequences]);
  useEffect(() => persist('leadpulse_wallet', wallet), [wallet]);
  useEffect(() => persist('leadpulse_logs', logs), [logs]);

  // Scroll listener for Back to Top helper
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 280);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    // Cancel the previous timer so it doesn't hide this newer toast early
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3800);
  };

  const handleSwitchTab = (newTab: TabType) => {
    if (newTab !== activeTab) {
      navigate(`/${newTab}`);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleBackToPreviousTab = () => {
    // Only go back if the previous history entry belongs to this app (idx is set by React Router)
    if (window.history.state && window.history.state.idx > 0) {
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
      // Switching between leads replaces the entry so closing the drawer doesn't reopen the previous lead
      const alreadyOpen = params.has('lead');
      params.set('lead', lead.id);
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: alreadyOpen });
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

  const openModal = (modalName: 'enrich' | 'pricing' | 'import' | 'auth' | 'profile' | 'invite') => {
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

  // Swap the open modal for another in place. Calling closeModal() then openModal() races:
  // closeModal's navigate(-1) resolves after the push and pops right back to the old modal.
  const switchModal = (modalName: 'enrich' | 'pricing' | 'import' | 'auth' | 'profile' | 'invite') => {
    const params = new URLSearchParams(location.search);
    params.set('modal', modalName);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImportCompleted = (newLeads: Lead[], duplicateCount: number, mergedLeads: Lead[] = []) => {
    const mergedById = new Map(mergedLeads.map(l => [l.id, l]));
    setLeads(prev => [...newLeads, ...prev.map(l => mergedById.get(l.id) || l)]);
    showToast(`Successfully imported ${newLeads.length.toLocaleString()} leads into CRM! (${duplicateCount} duplicates handled${mergedLeads.length ? `, ${mergedLeads.length} existing leads updated` : ''}).`);
    handleSwitchTab('crm');
  };

  // Duplicate detection count across CRM. O(n^2), so only recompute when leads change —
  // not on every render (e.g. each keystroke in the search box).
  const duplicateCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < leads.length; i++) {
      for (let j = i + 1; j < leads.length; j++) {
        if (findDuplicateMatches(leads[j], [leads[i]]).length > 0) {
          count++;
        }
      }
    }
    return count;
  }, [leads]);

  // Filter leads based on search query
  const displayedLeads = leads.filter(lead => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return [
      lead.fullName,
      lead.currentCompany,
      lead.currentTitle,
      lead.email,
      lead.secondaryEmail,
      lead.alternateEmail,
      lead.phone,
      lead.mobilePhone,
      lead.directPhone,
      lead.hqPhone,
      lead.location
    ].some(field => (field || '').toLowerCase().includes(q));
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

    const target = leads.find(l => l.id === leadId);
    if (!window.confirm(`Delete lead "${target?.fullName || 'Prospect'}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await authService.deleteLeadServer(leadId);
      if (!res.success) {
        showToast(res.error || 'Server error: permission denied.');
        return;
      }
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
    setProfiles([]);
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

  // Admin adds a member without switching the admin's own session (signup would log in as the new user)
  const handleCreateMember = async (profileData: Parameters<typeof authService.createMember>[0]): Promise<{ success: boolean; error?: string }> => {
    const res = await authService.createMember(profileData);
    if (res.success && res.member) {
      setProfiles(prev => [...prev, res.member!]);
      showToast(`Added ${res.member.name} to the workspace.`);
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to add team member.' };
  };

  // Secure Server-Enforced Member Deletion (Admin Only)
  const handleDeleteProfile = async (profileId: string) => {
    if (!currentUser) {
      showToast('Authentication required.');
      return;
    }

    const target = profiles.find(p => p.id === profileId);
    if (!window.confirm(`Remove "${target?.name || 'this member'}" from the workspace? Their sessions will be revoked.`)) {
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
    // Prefer an active sequence; paused/draft sequences shouldn't receive new enrollments by default
    const targetSeq = sequences.find(s => s.status === 'active') || sequences[0];
    if (!targetSeq) return;

    // Skip leads already in this sequence so enrolledCount isn't double-counted
    const idsToEnroll = new Set(
      leads.filter(l => leadIds.includes(l.id) && l.sequenceId !== targetSeq.id).map(l => l.id)
    );
    if (idsToEnroll.size === 0) {
      showToast(`Selected lead(s) are already enrolled in "${targetSeq.name}".`);
      return;
    }

    setLeads(prev => prev.map(l => {
      if (idsToEnroll.has(l.id)) {
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

    setSequences(prev => prev.map(s => s.id === targetSeq.id ? { ...s, enrolledCount: s.enrolledCount + idsToEnroll.size } : s));
    showToast(`${idsToEnroll.size} lead(s) enrolled into "${targetSeq.name}".`);
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

    // Quote every cell, and neutralise spreadsheet formula injection (=, @, +cmd, -cmd, tab, CR)
    const csvCell = (value: string | number | undefined) => {
      let text = String(value ?? '');
      if (/^[=@\t\r]/.test(text) || /^[+-][^\d\s(]/.test(text)) {
        text = `'${text}`;
      }
      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = exportTargets.map(l => [
      l.fullName,
      l.firstName,
      l.lastName,
      l.currentTitle,
      l.currentCompany,
      l.mobilePhone || (l.phoneType === 'mobile' ? l.phone : ''),
      l.directPhone || (l.phoneType === 'direct' ? l.phone : ''),
      l.hqPhone || (l.phoneType === 'hq' ? l.phone : ''),
      l.email,
      l.secondaryEmail,
      l.alternateEmail,
      l.linkedinUrl,
      l.location,
      l.industry,
      l.stage,
      l.sequenceName || 'None',
      l.sequenceStep || 0
    ].map(csvCell));

    // Use a Blob: a data: URI built with encodeURI() is cut off at the first '#' in any cell
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LeadPulse_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${exportTargets.length} leads with multi-category contacts to CSV.`);
  };

  const handleAdvanceLead = (leadId: string) => {
    const target = leads.find(l => l.id === leadId);
    if (!target || !target.sequenceId) return;

    const targetSeq = sequences.find(s => s.id === target.sequenceId);
    if (!targetSeq) return;

    if (target.sequenceStatus === 'completed') {
      showToast(`"${target.fullName}" has already completed "${targetSeq.name}".`);
      return;
    }

    const orderedSteps = [...targetSeq.steps].sort((a, b) => a.order - b.order);
    // Clamp instead of falling back to step 1, which used to restart the cadence from the top
    const stepIdx = Math.min(Math.max((target.sequenceStep || 1) - 1, 0), orderedSteps.length - 1);
    const currentStep = orderedSteps[stepIdx];
    if (!currentStep) return;

    const result = advanceLeadInSequence(target, currentStep, targetSeq.name, orderedSteps.length);
    setLeads(prev => prev.map(l => l.id === leadId ? result.updatedLead : l));
    setLogs(prev => [result.log, ...prev]);
    showToast(result.updatedLead.sequenceStatus === 'completed'
      ? `Final step executed — "${target.fullName}" completed "${targetSeq.name}".`
      : `Lead advanced to Step ${result.updatedLead.sequenceStep || 1} in "${targetSeq.name}".`);
  };

  const handleEnrollSingleLead = (leadId: string, sequenceId: string) => {
    const targetSeq = sequences.find(s => s.id === sequenceId);
    if (!targetSeq) return;

    const lead = leads.find(l => l.id === leadId);
    if (lead?.sequenceId === sequenceId && lead.sequenceStatus !== 'completed') {
      showToast(`Prospect is already enrolled in "${targetSeq.name}".`);
      return;
    }

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

    setSequences(prev => prev.map(s => {
      if (s.id === sequenceId) return { ...s, enrolledCount: s.enrolledCount + 1 };
      // Moving the lead out of its previous sequence
      if (lead?.sequenceId && s.id === lead.sequenceId) return { ...s, enrolledCount: Math.max(0, s.enrolledCount - 1) };
      return s;
    }));
    showToast(`Prospect enrolled in "${targetSeq.name}".`);
  };

  // Accepts a plan id ('plan-growth') or a tier ('growth') — SubscriptionModal passes the tier
  const handleUpgradePlan = (planIdOrTier: string) => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planIdOrTier || p.tier === planIdOrTier);
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
            sequences={sequences}
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
              const creditsUsed = { email: newLead.email ? 1 : 0, mobile: newLead.mobilePhone ? 5 : 0 };
              const match = findDuplicateMatches(newLead, leads)[0];
              if (match) {
                handleMergeLead(mergeLeads(match.existingLead, newLead), creditsUsed);
              } else {
                handleAddLead(newLead, creditsUsed);
              }
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
            onUpgradePlan={handleUpgradePlan}
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
            onOpenCreateProfile={() => openModal('invite')}
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
          // Replace the modal entry rather than closeModal() + navigate, which race each other
          navigate('/pricing', { replace: true });
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

      {/* Admin: add a team member without switching sessions */}
      {currentUser?.role === 'admin' && (
        <AuthModal
          isOpen={isInviteModalOpen}
          onClose={closeModal}
          onLogin={handleLogin}
          onSignup={handleCreateMember}
          initialMode="signup"
          inviteMode
        />
      )}

      {/* Profile & Team Permissions Modal */}
      {currentUser && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={closeModal}
          currentUser={currentUser}
          allProfiles={profiles}
          onUpdateProfile={handleUpdateProfile}
          onOpenCreateProfile={() => switchModal('invite')}
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
