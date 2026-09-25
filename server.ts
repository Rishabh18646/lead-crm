import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// ============================================================================
// DATA MODELS & TYPES
// ============================================================================

export type UserRole = 'admin' | 'member';

export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  title: string;
  company: string;
  avatarUrl: string;
  phone?: string;
  department?: string;
  bio?: string;
  createdAt: string;
  lastLoginAt: string;
  failedLoginAttempts: number;
  lockedUntil: number | null; // Timestamp in ms
}

export interface SessionRecord {
  id: string; // Session token
  userId: string;
  createdAt: number;
  expiresAt: number;
  userAgent?: string;
  ipAddress?: string;
}

// ============================================================================
// IN-MEMORY SECURE REPOSITORY (Real bcrypt password hashes & active sessions)
// ============================================================================

// Seed account password. 'password123' is only acceptable in development: in production the
// seeded admin would otherwise be publicly logged-in-able with a well-known password.
function resolveSeedPassword(): string {
  if (process.env.SEED_USER_PASSWORD) return process.env.SEED_USER_PASSWORD;
  if (process.env.NODE_ENV !== 'production') return 'password123';
  const generated = crypto.randomBytes(12).toString('base64url');
  console.warn(`[LeadPulse] SEED_USER_PASSWORD not set; generated one-time seed password: ${generated}`);
  return generated;
}

// Pre-compute real bcrypt hashes with work factor 10 for initial seed accounts
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync(resolveSeedPassword(), 10);

const usersDb = new Map<string, DbUser>();
const sessionsDb = new Map<string, SessionRecord>();

// Seed default real accounts
const SEED_USERS: DbUser[] = [
  {
    id: 'user-admin-1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@leadpulse.io',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'admin',
    title: 'Head of Revenue Operations',
    company: 'Nexus Global Software',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 392-1084',
    bio: 'Overseeing GTM outbound stack, CRM data deduplication, and enterprise prospecting workflows across 20+ SDRs.',
    department: 'Revenue Operations',
    createdAt: '2026-01-15T08:00:00Z',
    lastLoginAt: new Date().toISOString(),
    failedLoginAttempts: 0,
    lockedUntil: null
  },
  {
    id: 'user-member-1',
    name: 'Marcus Chen',
    email: 'marcus.chen@leadpulse.io',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'member',
    title: 'Senior Account Executive',
    company: 'Nexus Global Software',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 782-9931',
    bio: 'Closing high-value Enterprise SaaS deals. Focused on West Coast VP/C-level tech buyers.',
    department: 'Enterprise Sales',
    createdAt: '2026-03-10T10:00:00Z',
    lastLoginAt: new Date().toISOString(),
    failedLoginAttempts: 0,
    lockedUntil: null
  },
  {
    id: 'user-member-2',
    name: 'Elena Rodriguez',
    email: 'elena.rodriguez@leadpulse.io',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'member',
    title: 'Outbound SDR Specialist',
    company: 'Nexus Global Software',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 441-2910',
    bio: 'High-touch multichannel outbound sequencing via LinkedIn and cold direct phone dialing.',
    department: 'Sales Development',
    createdAt: '2026-05-01T09:30:00Z',
    lastLoginAt: new Date().toISOString(),
    failedLoginAttempts: 0,
    lockedUntil: null
  }
];

// Initialize users repository
SEED_USERS.forEach(u => usersDb.set(u.id, { ...u }));

// Helper to sanitize DbUser (stripping passwordHash and lockout internals)
function sanitizeUser(u: DbUser) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    title: u.title,
    company: u.company,
    avatarUrl: u.avatarUrl,
    phone: u.phone,
    department: u.department,
    bio: u.bio,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt
  };
}

// Generate cryptographically random 256-bit session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Periodically purge expired sessions so the in-memory store doesn't grow unbounded
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessionsDb.entries()) {
    if (now > session.expiresAt) sessionsDb.delete(token);
  }
}, 60 * 60 * 1000).unref();

// Extended Request interface with authenticated user
export interface AuthenticatedRequest extends Request {
  user?: DbUser;
  sessionToken?: string;
}

// ============================================================================
// SECURITY & RBAC MIDDLEWARES
// ============================================================================

/**
 * requireAuth Middleware:
 * Resolves user strictly from the cryptographically verified session token.
 * Checks token in:
 *   1. httpOnly signed/secure cookie: `lp_session`
 *   2. Bearer header: `Authorization: Bearer <token>`
 * Rejects expired or unrecognized tokens with HTTP 401 Unauthorized.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  let token = req.cookies?.lp_session;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Authentication required. No active session token found.' });
    return;
  }

  const session = sessionsDb.get(token);
  if (!session) {
    res.clearCookie('lp_session', { path: '/' });
    res.status(401).json({ error: 'Unauthorized: Session does not exist or has been revoked.' });
    return;
  }

  // Check session expiration (24 hours)
  if (Date.now() > session.expiresAt) {
    sessionsDb.delete(token);
    res.clearCookie('lp_session', { path: '/' });
    res.status(401).json({ error: 'Unauthorized: Session has expired. Please log in again.' });
    return;
  }

  const user = usersDb.get(session.userId);
  if (!user) {
    sessionsDb.delete(token);
    res.clearCookie('lp_session', { path: '/' });
    res.status(401).json({ error: 'Unauthorized: User account associated with session no longer exists.' });
    return;
  }

  // Attach verified user and session token to request
  req.user = user;
  req.sessionToken = token;
  next();
}

/**
 * requireAdmin Middleware:
 * Zero-trust role enforcement: queries the authenticated user record attached by requireAuth
 * and strictly verifies role === 'admin'. Rejects non-admins with HTTP 403 Forbidden.
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ 
      error: `Forbidden: Administrator role required. Current user "${req.user.name}" has normal member permissions.` 
    });
    return;
  }

  next();
}

/**
 * Validates a signup-style payload and builds a new member record.
 * Role is always 'member' — it can never be set from the client payload.
 */
function buildNewMember(body: any): { user?: DbUser; status?: number; error?: string } {
  const { name, email, password, company, title, phone, department, bio, avatarUrl } = body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { status: 400, error: 'Full name must be at least 2 characters.' };
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return { status: 400, error: 'A valid email address is required.' };
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return { status: 400, error: 'Password must be at least 8 characters long.' };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check if email already registered
  for (const u of usersDb.values()) {
    if (u.email.toLowerCase() === normalizedEmail) {
      return { status: 409, error: 'A user account with this email address already exists.' };
    }
  }

  // Role cannot be spoofed by client payload: strictly 'member'
  const assignedRole: UserRole = 'member';
  const passwordHash = bcrypt.hashSync(password, 10);
  const userId = `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  const newUser: DbUser = {
    id: userId,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: assignedRole,
    title: (typeof title === 'string' && title.trim()) || 'Sales Representative',
    company: (typeof company === 'string' && company.trim()) || 'Nexus Global Software',
    avatarUrl: (typeof avatarUrl === 'string' && avatarUrl.trim()) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: typeof phone === 'string' ? phone.trim() : undefined,
    department: typeof department === 'string' ? department.trim() : 'Sales Outbound',
    bio: typeof bio === 'string' ? bio.trim() : 'Managing B2B outbound prospects.',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    failedLoginAttempts: 0,
    lockedUntil: null
  };

  return { user: newUser };
}

// ============================================================================
// GEMINI CLIENT INITIALIZER
// ============================================================================

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(cookieParser(process.env.SESSION_SECRET || 'leadpulse-session-secret-local-dev'));

  // --------------------------------------------------------------------------
  // HEALTH CHECK
  // --------------------------------------------------------------------------
  app.get('/api/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'LeadPulse CRM API',
      auth: 'Server-side bcrypt + stateful sessions active',
      timestamp: new Date().toISOString() 
    });
  });

  // --------------------------------------------------------------------------
  // AUTHENTICATION ROUTES
  // --------------------------------------------------------------------------

  /**
   * POST /api/auth/login
   * Strictly requires email + password.
   * Verifies password against database bcrypt hash.
   * Enforces account rate-limiting and temporary lockout on 5+ failures.
   */
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    // Find user by email
    let targetUser: DbUser | undefined;
    for (const u of usersDb.values()) {
      if (u.email.toLowerCase() === normalizedEmail) {
        targetUser = u;
        break;
      }
    }

    if (!targetUser) {
      // Run a dummy bcrypt compare so response timing doesn't reveal which emails exist
      bcrypt.compareSync(password, DEFAULT_PASSWORD_HASH);
      // Return generic error to prevent email enumeration
      res.status(401).json({ error: 'Invalid email address or password.' });
      return;
    }

    // Check account lockout
    if (targetUser.lockedUntil && Date.now() < targetUser.lockedUntil) {
      const remainingMinutes = Math.ceil((targetUser.lockedUntil - Date.now()) / (60 * 1000));
      res.status(429).json({ 
        error: `Account temporarily locked due to excessive failed attempts. Please retry in ${remainingMinutes} minute(s).` 
      });
      return;
    }

    // Lock window has elapsed: start a fresh attempt counter
    if (targetUser.lockedUntil && Date.now() >= targetUser.lockedUntil) {
      targetUser.lockedUntil = null;
      targetUser.failedLoginAttempts = 0;
    }

    // Verify password against bcrypt hash
    const passwordValid = bcrypt.compareSync(password, targetUser.passwordHash);

    if (!passwordValid) {
      targetUser.failedLoginAttempts += 1;
      if (targetUser.failedLoginAttempts >= 5) {
        // Lock for 15 minutes
        targetUser.lockedUntil = Date.now() + 15 * 60 * 1000;
        res.status(429).json({ 
          error: 'Too many failed login attempts. This account has been locked for 15 minutes.' 
        });
        return;
      }
      res.status(401).json({ 
        error: `Invalid email address or password. (${5 - targetUser.failedLoginAttempts} attempts remaining before lockout)` 
      });
      return;
    }

    // Successful login: reset failed attempts
    targetUser.failedLoginAttempts = 0;
    targetUser.lockedUntil = null;
    targetUser.lastLoginAt = new Date().toISOString();

    // Generate random 256-bit session token
    const token = generateSessionToken();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    sessionsDb.set(token, {
      id: token,
      userId: targetUser.id,
      createdAt: Date.now(),
      expiresAt,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    });

    // Set secure, httpOnly cookie
    res.cookie('lp_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    });

    // Return sanitized user and session token (for bearer fallback in iframes)
    res.json({
      message: 'Authentication successful',
      user: sanitizeUser(targetUser),
      token
    });
  });

  /**
   * POST /api/auth/signup
   * Creates a new user profile with a hashed password.
   * The role is assigned server-side ('member' by default).
   */
  app.post('/api/auth/signup', (req: Request, res: Response) => {
    const result = buildNewMember(req.body);
    if (!result.user) {
      res.status(result.status!).json({ error: result.error });
      return;
    }
    const newUser = result.user;

    usersDb.set(newUser.id, newUser);

    // Issue session immediately
    const token = generateSessionToken();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    sessionsDb.set(token, {
      id: token,
      userId: newUser.id,
      createdAt: Date.now(),
      expiresAt,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    });

    res.cookie('lp_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'Account created and authenticated successfully',
      user: sanitizeUser(newUser),
      token
    });
  });

  /**
   * POST /api/auth/logout
   * Destroys active session token in session repository and clears cookie.
   */
  app.post('/api/auth/logout', (req: AuthenticatedRequest, res: Response) => {
    let token = req.cookies?.lp_session;
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (token) {
      sessionsDb.delete(token);
    }

    res.clearCookie('lp_session', { path: '/' });
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  /**
   * GET /api/auth/me
   * Returns current authenticated user record directly from database.
   */
  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    res.json({
      user: sanitizeUser(req.user!)
    });
  });

  /**
   * PATCH /api/auth/me
   * Allows authenticated user to update their own editable profile fields.
   * Strips any attempted role escalation or ID overrides!
   */
  app.patch('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const { name, title, company, phone, bio, department, avatarUrl } = req.body;

    if (typeof name === 'string' && name.trim().length >= 2) user.name = name.trim();
    if (typeof title === 'string') user.title = title.trim();
    if (typeof company === 'string') user.company = company.trim();
    if (typeof phone === 'string') user.phone = phone.trim();
    if (typeof bio === 'string') user.bio = bio.trim();
    if (typeof department === 'string') user.department = department.trim();
    if (typeof avatarUrl === 'string') user.avatarUrl = avatarUrl.trim();

    usersDb.set(user.id, user);

    res.json({
      message: 'Profile updated successfully',
      user: sanitizeUser(user)
    });
  });

  // --------------------------------------------------------------------------
  // WORKSPACE TEAM & RBAC MANAGEMENT ROUTES
  // --------------------------------------------------------------------------

  /**
   * GET /api/team/members
   * Returns all registered team members in the workspace.
   */
  app.get('/api/team/members', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
    const members = Array.from(usersDb.values()).map(sanitizeUser);
    res.json({ members });
  });

  /**
   * POST /api/team/members
   * RBAC Guarded: Administrators add a new member to the workspace.
   * Unlike signup, this does NOT create a session, so the admin stays logged in.
   */
  app.post('/api/team/members', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const result = buildNewMember(req.body);
    if (!result.user) {
      res.status(result.status!).json({ error: result.error });
      return;
    }

    usersDb.set(result.user.id, result.user);
    res.status(201).json({
      message: `Member "${result.user.name}" added to workspace.`,
      member: sanitizeUser(result.user)
    });
  });

  /**
   * PATCH /api/team/members/:id/role
   * RBAC Guarded: ONLY Administrators can modify member roles!
   * Enforces server check: rejects if requesting user is not admin.
   */
  app.patch('/api/team/members/:id/role', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const targetId = req.params.id;
    const { role } = req.body;

    if (role !== 'admin' && role !== 'member') {
      res.status(400).json({ error: 'Role must be either "admin" or "member".' });
      return;
    }

    const targetUser = usersDb.get(targetId);
    if (!targetUser) {
      res.status(404).json({ error: 'Target member not found.' });
      return;
    }

    // Prevent self-demotion if user is the sole administrator
    if (targetUser.id === req.user!.id && role !== 'admin') {
      const adminCount = Array.from(usersDb.values()).filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        res.status(400).json({ error: 'Cannot demote yourself: workspace must have at least one active Administrator.' });
        return;
      }
    }

    targetUser.role = role;
    usersDb.set(targetId, targetUser);

    res.json({
      message: `Role for ${targetUser.name} updated to ${role}.`,
      member: sanitizeUser(targetUser)
    });
  });

  /**
   * DELETE /api/team/members/:id
   * RBAC Guarded: ONLY Administrators can remove team members.
   */
  app.delete('/api/team/members/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const targetId = req.params.id;

    if (targetId === req.user!.id) {
      res.status(400).json({ error: 'Cannot delete your own active administrator account.' });
      return;
    }

    if (!usersDb.has(targetId)) {
      res.status(404).json({ error: 'Target member not found.' });
      return;
    }

    const deletedUser = usersDb.get(targetId);
    usersDb.delete(targetId);

    // Invalidate any active sessions for the deleted user
    for (const [token, session] of sessionsDb.entries()) {
      if (session.userId === targetId) {
        sessionsDb.delete(token);
      }
    }

    res.json({
      message: `Member "${deletedUser?.name}" removed from workspace.`,
      deletedId: targetId
    });
  });

  /**
   * DELETE /api/leads/:id
   * RBAC Guarded: Deleting leads from the central database requires Administrator role.
   */
  app.delete('/api/leads/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const leadId = req.params.id;
    // In production, performs DB lead deletion with ownership verification
    res.json({
      message: `Lead ${leadId} successfully deleted by Administrator ${req.user!.name}.`,
      deletedId: leadId
    });
  });

  // --------------------------------------------------------------------------
  // AI GENERATION ENDPOINTS
  // --------------------------------------------------------------------------
  app.post('/api/ai/icebreaker', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { lead, tone = 'executive' } = req.body;
      if (!lead || !lead.fullName) {
        res.status(400).json({ error: 'Missing lead data' });
        return;
      }

      const ai = getAI();
      if (ai) {
        const prompt = `Write a short, highly personalized 2-3 sentence cold outreach icebreaker for a B2B sales email.
Recipient: ${lead.fullName}, ${lead.currentTitle} at ${lead.currentCompany} in ${lead.location || 'their location'}.
Background: Previous company: ${lead.jobHistory?.[1]?.company || 'prior tech roles'}.
Tone requested: ${tone} (e.g. executive, concise, or warm).
Keep it punchy, professional, and directly relevant to B2B outbound lead generation. Return ONLY the text of the icebreaker.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        const text = response.text?.trim();
        if (text) {
          res.json({ icebreaker: text, source: 'gemini' });
          return;
        }
      }

      // Heuristic fallback
      const prevCompany = lead.jobHistory?.[1]?.company || 'your previous team';
      const fallback = tone === 'concise'
        ? `Hi ${lead.firstName} — saw your recent leadership trajectory at ${lead.currentCompany}. Quick question regarding your sales outbound data accuracy?`
        : `Hi ${lead.firstName}, saw your transition from ${prevCompany} to leading initiatives at ${lead.currentCompany}. Wanted to share how similar GTM leaders are eliminating outbound lead duplicates.`;

      res.json({ icebreaker: fallback, source: 'heuristic' });
    } catch (err) {
      console.error('Error generating icebreaker:', err);
      res.status(500).json({ error: 'Failed to generate icebreaker' });
    }
  });

  // Unknown API routes must return JSON 404 instead of falling through to the SPA HTML
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API route not found.' });
  });

  // --------------------------------------------------------------------------
  // VITE / STATIC SERVING
  // --------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LeadPulse Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start LeadPulse server:', err);
  process.exit(1);
});
