import { UserProfile, UserRole } from '../types';

const TOKEN_STORAGE_KEY = 'lp_session_token';

export function getStoredSessionToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredSessionToken(token: string | null) {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Session storage unavailable
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredSessionToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Login failed' };
    }

    if (data.token) {
      setStoredSessionToken(data.token);
    }

    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during login' };
  }
}

export async function signupUser(payload: {
  name: string;
  email: string;
  password: string;
  company?: string;
  title?: string;
  phone?: string;
  department?: string;
  bio?: string;
  avatarUrl?: string;
}): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to create account' };
    }

    if (data.token) {
      setStoredSessionToken(data.token);
    }

    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during signup' };
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
  } catch {
    // Ignore network error on logout
  } finally {
    setStoredSessionToken(null);
  }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!res.ok) {
      if (res.status === 401) {
        setStoredSessionToken(null);
      }
      return null;
    }

    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function updateCurrentUserProfile(update: Partial<UserProfile>): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(update)
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to update profile' };
    }

    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function fetchWorkspaceMembers(): Promise<UserProfile[]> {
  try {
    const res = await fetch('/api/team/members', {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.members || [];
  } catch {
    return [];
  }
}

export async function updateMemberRoleApi(memberId: string, role: UserRole): Promise<{ success: boolean; member?: UserProfile; error?: string }> {
  try {
    const res = await fetch(`/api/team/members/${memberId}/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ role })
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to update role' };
    }

    return { success: true, member: data.member };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function deleteMemberApi(memberId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/team/members/${memberId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to remove member' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function deleteLeadServerApi(leadId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/leads/${leadId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Permission denied' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export const authService = {
  loginUser,
  signupUser,
  logoutUser,
  getCurrentUser,
  updateCurrentUserProfile,
  fetchWorkspaceMembers,
  updateMemberRole: updateMemberRoleApi,
  deleteMember: deleteMemberApi,
  deleteLeadServer: deleteLeadServerApi,
  getStoredSessionToken,
  setStoredSessionToken
};
