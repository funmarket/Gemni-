/**
 * Domain 01: Identity & Authentication (D01)
 * Canonical member identity, account categories ('vibe' | 'pro' | 'business'),
 * sessions, Google/Telegram account links, and credential recovery.
 */

export type AccountCategory = 'vibe' | 'pro' | 'business';

export interface CanonicalMember {
  id: string; // Canonical D01 UUID
  handle: string; // Public display and lookup handle (e.g. @hannibal)
  displayName: string;
  category: AccountCategory;
  email?: string;
  authProviders: ('email' | 'google' | 'telegram')[];
  telegramUserId?: string;
  isVerified: boolean;
  createdAt: string;
  lastActiveAt: string;
}

export interface AuthSession {
  sessionId: string;
  memberId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}

const STORAGE_KEY = 'vq_identity_members_v1';
const SESSION_KEY = 'vq_identity_current_session_v1';

const DEFAULT_MEMBERS: CanonicalMember[] = [
  {
    id: 'usr_hannibal_1337',
    handle: 'hannibal',
    displayName: 'Hannibal',
    category: 'vibe',
    email: 'hannibal@vibequest.xyz',
    authProviders: ['email', 'telegram'],
    isVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    lastActiveAt: new Date().toISOString()
  },
  {
    id: 'guardian_yassine_01',
    handle: 'yassine_medina',
    displayName: 'Yassine B.',
    category: 'pro',
    email: 'yassine@vibeguardians.xyz',
    authProviders: ['email'],
    isVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    lastActiveAt: new Date().toISOString()
  },
  {
    id: 'biz_cafe_el_alia',
    handle: 'cafe_el_alia',
    displayName: 'Café El Alia',
    category: 'business',
    email: 'contact@elalia.tn',
    authProviders: ['email'],
    isVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    lastActiveAt: new Date().toISOString()
  }
];

class IdentityDomain {
  private members: CanonicalMember[] = [];
  private currentSession: AuthSession | null = null;
  private listeners: Set<(member: CanonicalMember | null) => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.members = raw ? JSON.parse(raw) : [...DEFAULT_MEMBERS];
      if (!raw) this.save();

      const sessionRaw = localStorage.getItem(SESSION_KEY);
      if (sessionRaw) {
        this.currentSession = JSON.parse(sessionRaw);
      } else {
        this.currentSession = {
          sessionId: 'sess_default_001',
          memberId: 'usr_hannibal_1337',
          token: `vq_sess_${Date.now()}`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000 * 7).toISOString()
        };
        this.saveSession();
      }
    } catch {
      this.members = [...DEFAULT_MEMBERS];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.members));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }

  private saveSession() {
    try {
      if (this.currentSession) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(this.currentSession));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // Storage unavailable
    }
  }

  public getCurrentMember(): CanonicalMember | null {
    if (!this.currentSession) return null;
    return this.members.find(m => m.id === this.currentSession?.memberId) || null;
  }

  public getMemberById(id: string): CanonicalMember | null {
    return this.members.find(m => m.id === id) || null;
  }

  public getMemberByHandle(handle: string): CanonicalMember | null {
    const clean = handle.replace(/^@/, '').toLowerCase();
    return this.members.find(m => m.handle.toLowerCase() === clean) || null;
  }

  public register(
    handle: string, 
    displayName: string, 
    category: AccountCategory = 'vibe', 
    email?: string
  ): CanonicalMember {
    const cleanHandle = handle.replace(/^@/, '').toLowerCase().trim();
    const existing = this.getMemberByHandle(cleanHandle);
    if (existing) {
      throw new Error(`Handle @${cleanHandle} is already registered.`);
    }

    const newMember: CanonicalMember = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      handle: cleanHandle,
      displayName: displayName.trim(),
      category,
      email: email?.trim(),
      authProviders: ['email'],
      isVerified: false,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };

    this.members.push(newMember);
    this.save();

    // Create session
    this.currentSession = {
      sessionId: `sess_${Date.now()}`,
      memberId: newMember.id,
      token: `tok_${Date.now()}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString()
    };
    this.saveSession();
    this.notify();

    return newMember;
  }

  public updateCategory(memberId: string, category: AccountCategory): CanonicalMember {
    const member = this.getMemberById(memberId);
    if (!member) throw new Error('Member not found');
    member.category = category;
    this.save();
    this.notify();
    return member;
  }

  public subscribe(cb: (member: CanonicalMember | null) => void): () => void {
    this.listeners.add(cb);
    cb(this.getCurrentMember());
    return () => this.listeners.delete(cb);
  }

  private notify() {
    const current = this.getCurrentMember();
    this.listeners.forEach(cb => cb(current));
  }
}

export const identityDomain = new IdentityDomain();
