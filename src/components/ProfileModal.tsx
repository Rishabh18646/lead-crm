import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Building2, 
  Briefcase, 
  Phone, 
  ShieldCheck, 
  Users, 
  Plus, 
  Check, 
  Trash2, 
  LogOut, 
  Key, 
  Sparkles,
  FileCheck,
  ArrowLeft
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allProfiles: UserProfile[];
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenCreateProfile: () => void;
  onDeleteProfile: (profileId: string) => void;
  onChangeUserRole: (profileId: string, newRole: UserRole) => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allProfiles,
  onUpdateProfile,
  onOpenCreateProfile,
  onDeleteProfile,
  onChangeUserRole,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'permissions'>('profile');
  
  // Profile edit fields
  const [name, setName] = useState(currentUser.name);
  const [title, setTitle] = useState(currentUser.title);
  const [company, setCompany] = useState(currentUser.company);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [department, setDepartment] = useState(currentUser.department || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [isSaved, setIsSaved] = useState(false);

  // Sync state if currentUser changes
  React.useEffect(() => {
    setName(currentUser.name);
    setTitle(currentUser.title);
    setCompany(currentUser.company);
    setPhone(currentUser.phone || '');
    setBio(currentUser.bio || '');
    setDepartment(currentUser.department || '');
    setAvatarUrl(currentUser.avatarUrl || '');
  }, [currentUser]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...currentUser,
      name: name.trim(),
      title: title.trim(),
      company: company.trim(),
      // Send '' (not undefined) so clearing a field reaches the server — JSON.stringify drops undefined keys
      phone: phone.trim(),
      bio: bio.trim(),
      department: department.trim(),
      avatarUrl: avatarUrl.trim()
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
              alt={currentUser.name}
              className="w-11 h-11 rounded-xl object-cover border-2 border-slate-700 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{currentUser.name}</h2>
                {isAdmin ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-purple-400" />
                    Admin Access
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full flex items-center gap-1">
                    <User className="w-3 h-3 text-emerald-400" />
                    Normal Access
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {currentUser.title} • {currentUser.company}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
              title="Return / Close (Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={onLogout}
              className="px-2.5 py-1.5 text-xs text-rose-300 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 rounded-lg border border-rose-800/50 flex items-center gap-1.5 transition-colors"
              title="Sign out of profile"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'team'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Workspace Profiles ({allProfiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'permissions'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Access & Permissions</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB 1: Profile Editor */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Profile Card Header Info */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Account Credentials</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-white font-mono text-xs">{currentUser.email}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Access Role</span>
                  <p className="font-semibold text-xs text-white capitalize mt-0.5">
                    {currentUser.role === 'admin' ? '👑 Workspace Administrator' : '👤 Normal Sales User'}
                  </p>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-medium text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-slate-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Company
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Direct Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-300">Avatar Image URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-300">Professional Bio & Outbound Focus</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your role, target accounts, or responsibilities..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {isSaved ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-medium animate-in fade-in">
                    <Check className="w-4 h-4" /> Profile changes saved!
                  </span>
                ) : <div />}

                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Multiple Profiles / Team Switcher */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">Multiple Workspace Profiles</h3>
                  <p className="text-slate-400 text-xs">
                    Switch between active profiles or create new members with Admin or Normal access.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenCreateProfile}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Create Profile</span>
                </button>
              </div>

              {/* Profiles List */}
              <div className="space-y-2.5">
                {allProfiles.map((prof) => {
                  const isActive = prof.id === currentUser.id;
                  const isProfAdmin = prof.role === 'admin';

                  return (
                    <div
                      key={prof.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                        isActive
                          ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-500/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={prof.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                          alt={prof.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-xs">{prof.name}</span>
                            {isProfAdmin ? (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded">
                                Admin
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 text-[9px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
                                Normal
                              </span>
                            )}
                            {isActive && (
                              <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 rounded-full">
                                Active Profile
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {prof.title} • <span className="font-mono text-slate-500">{prof.email}</span>
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isActive ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold text-xs px-2.5 py-1 bg-emerald-950/40 border border-emerald-800/50 rounded-lg">
                            <Check className="w-3.5 h-3.5" /> Authenticated
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic px-2 py-1">
                            Requires sign-in
                          </span>
                        )}

                        {/* Admin Role Toggle */}
                        {isAdmin && !isActive && (
                          <button
                            type="button"
                            onClick={() => onChangeUserRole(prof.id, isProfAdmin ? 'member' : 'admin')}
                            className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 text-[11px] hover:border-slate-700"
                            title={isProfAdmin ? 'Demote to Normal Access' : 'Promote to Admin Access'}
                          >
                            {isProfAdmin ? 'Demote to Normal' : 'Promote to Admin'}
                          </button>
                        )}

                        {/* Delete profile (if not active and not only profile) */}
                        {isAdmin && !isActive && allProfiles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onDeleteProfile(prof.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900 transition-colors"
                            title="Delete profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Permissions Matrix */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-white text-sm">Role-Based Access Control (RBAC)</h3>
                <p className="text-slate-400 text-xs">
                  Summary of operational capabilities enabled for Admin Access versus Normal Member Access.
                </p>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-medium">
                      <th className="p-3">Workspace Feature / Action</th>
                      <th className="p-3 text-center w-36">
                        <span className="text-purple-300 font-bold">👑 Admin Access</span>
                      </th>
                      <th className="p-3 text-center w-36">
                        <span className="text-emerald-300 font-medium">👤 Normal Access</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr>
                      <td className="p-3 font-medium">Permanently Delete Leads & Prospects</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                      <td className="p-3 text-center text-rose-400 font-bold">✕ Restricted</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Manage Team Profiles & Promote Admins</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                      <td className="p-3 text-center text-rose-400 font-bold">✕ Restricted</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Manage Billing, Subscriptions & Top-ups</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                      <td className="p-3 text-center text-rose-400 font-bold">✕ Restricted</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Bulk Export Leads to CSV</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Import Excel Sheet (1000+ Leads)</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Run Multi-Channel Outreach Sequences</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Enrich Mobile & Verified Email Contacts</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-3.5 flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <p className="text-indigo-200 text-xs leading-relaxed">
                  You are currently using <strong>{currentUser.name}</strong> with <strong>{currentUser.role === 'admin' ? 'Admin Access' : 'Normal Access'}</strong>. Switch to any profile from the Workspace Profiles tab to test access rules immediately.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
