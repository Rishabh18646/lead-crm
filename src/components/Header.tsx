import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Send, 
  BarChart3, 
  Chrome, 
  CopyCheck, 
  CreditCard, 
  Plus, 
  Search,
  Sparkles,
  PhoneCall,
  Mail,
  ArrowLeft,
  FileSpreadsheet,
  User,
  ShieldCheck,
  ChevronDown,
  LogOut,
  UserPlus
} from 'lucide-react';
import { CreditWallet, UserProfile } from '../types';

export type TabType = 'crm' | 'sequences' | 'analytics' | 'extension' | 'dedup' | 'pricing' | 'team';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  previousTab?: TabType | null;
  onBackToPreviousTab?: () => void;
  wallet: CreditWallet;
  leadsCount: number;
  duplicateCount: number;
  onOpenEnrichModal: () => void;
  onOpenPricingModal: () => void;
  onOpenExcelImportModal?: () => void;
  currentUser: UserProfile | null;
  onOpenProfileModal: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const TAB_LABELS: Record<TabType, string> = {
  crm: 'Leads Pipeline',
  sequences: 'Outreach Sequences',
  analytics: 'Analytics',
  extension: 'Browser Extension',
  dedup: 'Duplicate Defense',
  pricing: 'Subscription & Credits',
  team: 'Team & Profiles'
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  previousTab,
  onBackToPreviousTab,
  wallet,
  leadsCount,
  duplicateCount,
  onOpenEnrichModal,
  onOpenPricingModal,
  onOpenExcelImportModal,
  currentUser,
  onOpenProfileModal,
  onOpenAuthModal,
  onLogout,
  searchQuery,
  setSearchQuery,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md shadow-lg transition-all">
      {/* Top utility bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveTab('crm')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-xl">
              LP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white font-['Space_Grotesk']">
                  LeadPulse
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full">
                  CRM & Contact Finder
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                LinkedIn Enrichment • Mobile & Email • Duplication Defense
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex-1 max-w-sm hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads by name, company, email, phone..."
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action buttons & Credits status & Profile Pill */}
          <div className="flex items-center gap-2">
            {/* Excel 1000+ Import Button */}
            {onOpenExcelImportModal && (
              <button
                onClick={onOpenExcelImportModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
                title="Import 1,000+ leads via Excel (.xlsx) or CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Import Excel</span>
                <span className="sm:hidden">Excel</span>
              </button>
            )}

            {/* Credit Tracker Pill */}
            <button
              onClick={onOpenPricingModal}
              title="Click to view subscription & credit packages"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left group"
            >
              <div className="flex items-center gap-1.5 text-xs">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-emerald-300">{wallet.mobileCreditsRemaining}</span>
              </div>
              <div className="w-[1px] h-3.5 bg-slate-800" />
              <div className="flex items-center gap-1.5 text-xs">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-semibold text-blue-300">{wallet.emailCreditsRemaining}</span>
              </div>
              <span className="text-[10px] font-medium text-indigo-400 group-hover:text-indigo-300 ml-0.5">
                +Add
              </span>
            </button>

            {/* Enrich LinkedIn Lead Button */}
            <button
              onClick={onOpenEnrichModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Enrich Lead</span>
            </button>

            {/* User Profile Pill & Dropdown */}
            {currentUser ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all select-none"
                  title="View user profile & permissions"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-slate-100 max-w-[90px] truncate">
                        {currentUser.name}
                      </span>
                      {currentUser.role === 'admin' ? (
                        <span className="px-1 py-0.2 text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded font-bold">
                          Admin
                        </span>
                      ) : (
                        <span className="px-1 py-0.2 text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded font-medium">
                          Normal
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 p-2">
                    
                    {/* User Info Header */}
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                          alt={currentUser.name}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {currentUser.role === 'admin' ? (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded flex items-center gap-1">
                                <ShieldCheck className="w-2.5 h-2.5" /> Admin Access
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 text-[9px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded flex items-center gap-1">
                                <User className="w-2.5 h-2.5" /> Normal Access
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dropdown Action Links */}
                    <div className="space-y-0.5 pt-1">
                      <button
                        onClick={() => {
                          onOpenProfileModal();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
                      >
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Manage Profiles & Permissions</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenAuthModal();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                        <span>+ Create / Sign Up New Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          onLogout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>Sign Out of Profile</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Log In / Sign Up</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Navigation tabs & Quick Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5 border-t border-slate-900">
        
        {/* Quick Return / In-App Back Button */}
        {onBackToPreviousTab && (previousTab || activeTab !== 'crm') && (
          <button
            onClick={onBackToPreviousTab}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-indigo-950/90 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 shadow-sm transition-all mr-2 shrink-0 group animate-in fade-in"
            title={previousTab ? `Return back to ${TAB_LABELS[previousTab]}` : "Return to Leads Pipeline"}
            id="btn-nav-back"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to {previousTab ? TAB_LABELS[previousTab] : 'Leads Pipeline'}</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('crm')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'crm'
              ? 'text-white bg-slate-800/90 shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Leads Pipeline</span>
          <span className="ml-1 px-1.5 py-0.2 bg-slate-900 text-slate-400 border border-slate-800 rounded-full text-[10px]">
            {leadsCount.toLocaleString()}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sequences')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'sequences'
              ? 'text-white bg-slate-800/90 shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Send className="w-4 h-4 text-cyan-400" />
          <span>Automated Outreach</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'text-white bg-slate-800/90 shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Performance Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('extension')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'extension'
              ? 'text-white bg-slate-800/90 shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Chrome className="w-4 h-4 text-amber-400" />
          <span>Browser Extension</span>
          <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
            SIMULATOR & V3
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dedup')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'dedup'
              ? 'text-white bg-slate-800/90 shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <CopyCheck className="w-4 h-4 text-purple-400" />
          <span>Duplicate Defense</span>
          {duplicateCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full text-[10px] font-bold animate-pulse">
              {duplicateCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'pricing'
              ? 'text-white bg-slate-800/90 shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4 text-rose-400" />
          <span>Subscription & Credits</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'team'
              ? 'text-white bg-slate-800/90 shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Team & Profiles</span>
        </button>
      </div>
    </header>
  );
};
