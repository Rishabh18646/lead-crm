import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  User, 
  Plus, 
  Trash2, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2, 
  Check, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { getMailtoUrl, getGmailComposeUrl } from '../utils/linkUtils';

interface TeamViewProps {
  currentUser: UserProfile | null;
  allProfiles: UserProfile[];
  onOpenCreateProfile: () => void;
  onChangeUserRole: (profileId: string, role: UserRole) => void;
  onDeleteProfile: (profileId: string) => void;
  onOpenProfileModal: () => void;
}

export const TeamView: React.FC<TeamViewProps> = ({
  currentUser,
  allProfiles,
  onOpenCreateProfile,
  onChangeUserRole,
  onDeleteProfile,
  onOpenProfileModal
}) => {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Workspace Team & Access Control</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Server-enforced Role-Based Access Control (RBAC). All permissions and sessions are validated in the backend database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <button
              onClick={onOpenCreateProfile}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Team Member</span>
            </button>
          )}

          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all active:scale-95"
          >
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span>My Profile</span>
          </button>
        </div>
      </div>

      {/* Active User Session Banner */}
      {currentUser && (
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isAdmin 
            ? 'bg-purple-950/20 border-purple-500/40 text-purple-200' 
            : 'bg-indigo-950/20 border-indigo-500/40 text-indigo-200'
        }`}>
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
              alt={currentUser.name}
              className="w-10 h-10 rounded-xl object-cover border border-slate-700"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{currentUser.name}</span>
                <span className="text-xs text-slate-400">({currentUser.email})</span>
                {isAdmin ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Full Administrator
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-medium uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <User className="w-3 h-3" /> Normal Access Member
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isAdmin 
                  ? 'Authenticated as Administrator. You have permissions to configure member roles, delete CRM records, manage subscriptions, and audit security logs.' 
                  : 'Authenticated as Normal Member. You have permissions to search, extract, enrich, and run sequences on sales leads.'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-Trust Server Verified</span>
          </div>
        </div>
      )}

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allProfiles.map((prof) => {
          const isCurrent = currentUser?.id === prof.id;
          const isProfAdmin = prof.role === 'admin';

          return (
            <div
              key={prof.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                isCurrent 
                  ? 'bg-slate-900/90 border-indigo-500/60 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/20' 
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-4">
                {/* Profile Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={prof.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                      alt={prof.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-white text-sm">{prof.name}</h3>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-indigo-400 font-medium">{prof.title}</p>
                      <p className="text-[10px] text-slate-400">{prof.company}</p>
                    </div>
                  </div>

                  {isProfAdmin ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Admin
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <User className="w-3 h-3" /> Normal
                    </span>
                  )}
                </div>

                {/* Contact information with clickable links */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <a
                        href={getMailtoUrl(prof.email)}
                        className="truncate hover:text-indigo-400 hover:underline"
                        title={`Send email to ${prof.email}`}
                      >
                        {prof.email}
                      </a>
                    </div>
                    <a
                      href={getGmailComposeUrl(prof.email)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-slate-400 hover:text-red-400 transition-colors flex items-center gap-0.5 ml-1 shrink-0"
                      title="Compose in Gmail"
                    >
                      <span>Gmail</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  {prof.phone && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <a href={`tel:${prof.phone}`} className="hover:text-emerald-300 hover:underline font-mono">
                        {prof.phone}
                      </a>
                    </div>
                  )}

                  {prof.department && (
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{prof.department}</span>
                    </div>
                  )}
                </div>

                {/* Role Switcher: Server-Enforced RBAC. Disabled if not Administrator */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Role & Permissions:
                    </label>
                    {!isAdmin && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Admin-only
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => onChangeUserRole(prof.id, 'admin')}
                      disabled={!isAdmin}
                      className={`py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                        prof.role === 'admin'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                      } ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </button>

                    <button
                      onClick={() => onChangeUserRole(prof.id, 'member')}
                      disabled={!isAdmin}
                      className={`py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                        prof.role === 'member'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                      } ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Normal</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2 mt-4">
                {isCurrent ? (
                  <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Active Session
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 italic">
                    Requires real login to switch
                  </span>
                )}

                {allProfiles.length > 1 && !isCurrent && isAdmin && (
                  <button
                    onClick={() => onDeleteProfile(prof.id)}
                    title="Remove Profile (Admin Only)"
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* RBAC Permission Matrix Reference */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" />
            <span>Role-Based Access Control Matrix (Backend Verified)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every API endpoint independently re-checks identity and permissions from the server-side session token.
          </p>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-medium">
                <th className="p-3">Permission / Capability</th>
                <th className="p-3 text-center w-36">
                  <span className="text-purple-300 font-bold">👑 Admin Access</span>
                </th>
                <th className="p-3 text-center w-36">
                  <span className="text-emerald-300 font-medium">👤 Normal Access</span>
                </th>
                <th className="p-3 text-slate-500 hidden md:table-cell">Server Verification Enforcement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="p-3 font-medium">CRM Lead Deletion</td>
                <td className="p-3 text-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                </td>
                <td className="p-3 text-center">
                  <XCircle className="w-4 h-4 text-slate-600 inline" />
                </td>
                <td className="p-3 text-slate-400 text-[11px] hidden md:table-cell">
                  Server blocks DELETE /api/leads/:id with HTTP 403 Forbidden
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Team Member Role Reassignment</td>
                <td className="p-3 text-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                </td>
                <td className="p-3 text-center">
                  <XCircle className="w-4 h-4 text-slate-600 inline" />
                </td>
                <td className="p-3 text-slate-400 text-[11px] hidden md:table-cell">
                  Server blocks PATCH /api/team/members/:id/role with HTTP 403
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Workspace Member Account Removal</td>
                <td className="p-3 text-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                </td>
                <td className="p-3 text-center">
                  <XCircle className="w-4 h-4 text-slate-600 inline" />
                </td>
                <td className="p-3 text-slate-400 text-[11px] hidden md:table-cell">
                  Server blocks DELETE /api/team/members/:id with HTTP 403
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Prospect Extraction & AI Enrichment</td>
                <td className="p-3 text-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                </td>
                <td className="p-3 text-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                </td>
                <td className="p-3 text-slate-400 text-[11px] hidden md:table-cell">
                  Requires valid session token
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Outreach Sequencing & CSV Export</td>
                <td className="p-3 text-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                </td>
                <td className="p-3 text-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                </td>
                <td className="p-3 text-slate-400 text-[11px] hidden md:table-cell">
                  Requires valid session token
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
