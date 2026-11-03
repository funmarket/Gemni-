import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/infrastructure/supabase/supabaseClient';

export interface UserProfile {
  id: string;
  handle: string;
  displayName: string;
  accountType: 'vibe' | 'pro' | 'business' | 'voyager' | 'hunter' | 'guardian';
  points: number;
  streaks: number;
  city: string;
  culturalPassport: string[];
  photoUrl?: string;
  lastActive: string;
  isProGuardian?: boolean;
  guardianshipType?: string;
}

type AuthUser = { uid: string; email: string; displayName: string; photoURL?: string };
type Registration = Partial<UserProfile> & { email?: string; password?: string };
interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  userProfile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  loading: boolean;
  login: () => Promise<void>;
  loginAsGuest: (customHandle?: string) => void;
  loginWithHandleAndPassword: (identifier: string, password?: string) => Promise<UserProfile>;
  registerProfile: (profileData: Registration) => Promise<UserProfile>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  updateProfilePoints: (pointsEarned: number) => Promise<void>;
  updateProfileWallet?: (address: string) => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function fromRow(row: Record<string, unknown>): UserProfile {
  return {
    id: String(row.id), handle: String(row.handle),
    displayName: String(row.display_name || row.handle),
    accountType: (row.account_type as UserProfile['accountType']) || 'vibe',
    points: Number(row.points || 0), streaks: Number(row.streaks || 0),
    city: '', culturalPassport: Array.isArray(row.cultural_passport) ? row.cultural_passport as string[] : [],
    photoUrl: typeof row.photo_url === 'string' ? row.photo_url : undefined,
    lastActive: String(row.last_active || new Date().toISOString()),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = async (authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null) => {
    if (!authUser) { setUser(null); setProfile(null); return; }
    const metadata = authUser.user_metadata || {};
    setUser({
      uid: authUser.id, email: authUser.email || '',
      displayName: typeof metadata.display_name === 'string' ? metadata.display_name : '',
    });
    const { data: link, error: linkError } = await supabase.from('s00_test_identity_links')
      .select('legacy_profile_id').eq('auth_user_id', authUser.id).maybeSingle();
    if (linkError) console.warn('Profile identity link not available:', linkError.message);
    const profileId = link?.legacy_profile_id || 'usr_' + authUser.id;
    const { data: row, error } = await supabase.from('profiles').select('*').eq('id', profileId).maybeSingle();
    if (error) console.warn('Profile lookup failed:', error.message);
    // Never fabricate a logged-in local account or silently impersonate a legacy identity.
    setProfile(row ? fromRow(row) : null);
    if (row) setUser(prev => prev?.uid === authUser.id ? { ...prev, displayName: String(row.display_name || row.handle) } : prev);
  };

  useEffect(() => {
    let active = true;
    // Invalidate old simulated browser credentials; Supabase session is the only identity authority.
    localStorage.removeItem('vq_auth_user_v2');
    localStorage.removeItem('vq_auth_profile_v2');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer Supabase queries outside the auth callback to avoid client auth lock reentrancy.
      Promise.resolve().then(() => { if (active) void hydrate(session?.user || null); });
    });
    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      if (error) console.warn('Session validation:', error.message);
      return hydrate(data.user || null);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const loginWithHandleAndPassword = async (identifier: string, password?: string): Promise<UserProfile> => {
    if (!password || !identifier.trim()) throw new Error('Email or username and password are required.');
    const value = identifier.trim();
    if (value.includes('@') && !value.startsWith('@')) {
      const { error } = await supabase.auth.signInWithPassword({ email: value, password });
      if (error) throw new Error(error.message);
    } else {
      const handle = value.replace(/^@/, '').toLowerCase();
      if (!/^[a-z0-9_]{3,32}$/.test(handle)) throw new Error('Invalid username.');
      // The trusted Edge Function resolves the username without revealing another user's email.
      const { data, error } = await supabase.functions.invoke('sign-in-by-username', { body: { username: handle, password } });
      if (error || !data?.access_token || !data?.refresh_token) throw new Error('Invalid username or password.');
      const { error: sessionError } = await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
      if (sessionError) throw new Error(sessionError.message);
    }
    const { data: result } = await supabase.auth.getUser();
    await hydrate(result.user || null);
    const { data: link } = await supabase.from('s00_test_identity_links').select('legacy_profile_id').eq('auth_user_id', result.user?.id || '').maybeSingle();
    const { data: row } = await supabase.from('profiles').select('*').eq('id', link?.legacy_profile_id || 'usr_' + result.user?.id).maybeSingle();
    if (!row) throw new Error('Signed in, but your profile is not linked yet. Contact the administrator.');
    return fromRow(row);
  };

  const registerProfile = async (data: Registration): Promise<UserProfile> => {
    const handle = (data.handle || '').replace(/^@/, '').trim().toLowerCase();
    const displayName = (data.displayName || '').trim();
    const email = (data.email || '').trim();
    if (!/^[a-z0-9_]{3,32}$/.test(handle)) throw new Error('Choose a username of 3–32 letters, numbers or underscores.');
    if (!displayName || displayName.length > 80) throw new Error('Enter a display name (up to 80 characters).');
    if (!email || !data.password || data.password.length < 8) throw new Error('Email and a password of at least 8 characters are required.');
    const { data: existing, error: lookupError } = await supabase.from('profiles').select('id').ilike('handle', handle).maybeSingle();
    if (lookupError) throw new Error('Cannot verify username availability.');
    if (existing) throw new Error('Username is already taken.');
    const { data: signup, error } = await supabase.auth.signUp({
      email, password: data.password, options: { data: { handle, display_name: displayName } },
    });
    if (error) throw new Error(error.message);
    if (!signup.user) throw new Error('Account creation failed.');
    // Database trigger creates the profile atomically for verified new Auth users.
    if (!signup.session) throw new Error('Account created. Verify your email, then sign in.');
    await hydrate(signup.user);
    const { data: row } = await supabase.from('profiles').select('*').eq('id', 'usr_' + signup.user.id).maybeSingle();
    if (!row) throw new Error('Account created, but profile provisioning is pending.');
    return fromRow(row);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user || !profile) throw new Error('Sign in to edit your profile.');
    const fields: Record<string, unknown> = {};
    if (typeof updates.displayName === 'string') fields.display_name = updates.displayName.trim();
    if (typeof updates.photoUrl === 'string') fields.photo_url = updates.photoUrl;
    if (Object.keys(fields).length === 0) return;
    const { data, error } = await supabase.from('profiles').update(fields).eq('id', profile.id).select('*').single();
    if (error) throw new Error(error.message);
    setProfile(fromRow(data));
  };

  const login = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw new Error(error.message);
  };
  // Guest means no identity, not an invented authorized user.
  const loginAsGuest = () => { setUser(null); setProfile(null); };
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    setUser(null); setProfile(null);
  };
  const updateProfilePoints = async (_pointsEarned: number) => {
    // Do not mint rewards client-side. D20 must authorize actual ledger credits.
  };
  return <AuthContext.Provider value={{
    user, profile, userProfile: profile, setProfile, loading, login, loginAsGuest,
    loginWithHandleAndPassword, registerProfile, updateProfile, logout, updateProfilePoints,
  }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
