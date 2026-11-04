import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/infrastructure/supabase/supabaseClient';
import { queuePendingProfileAvatar, uploadPendingProfileAvatar, uploadProfileAvatar } from '@/lib/profileAvatar';

export interface UserProfile {
  id: string;
  handle: string;
  displayName: string;
  accountType: 'vibe' | 'pro' | 'business' | 'voyager' | 'hunter' | 'guardian';
  points: number;
  streaks: number;
  city: string;
  bio?: string;
  location?: string;
  tags?: string[];
  languages?: string[];
  contactMethod?: string;
  xHandle?: string;
  telegramHandle?: string;
  oracleMode?: boolean;
  culturalPassport: string[];
  photoUrl?: string;
  lastActive: string;
  avatarFile?: File;
  wallet?: string;
  isProGuardian?: boolean;
  guardianshipType?: string;
}

type AuthUser = { uid: string; email: string; displayName: string; photoURL?: string };
type Registration = Partial<UserProfile> & { email?: string; password?: string; avatarFile?: File };
type RegistrationResult = UserProfile | { pendingVerification: true; email: string; authUserId: string };
interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  userProfile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  loading: boolean;
  login: () => Promise<void>;
  loginAsGuest: (customHandle?: string) => void;
  loginWithHandleAndPassword: (identifier: string, password?: string) => Promise<UserProfile>;
  registerProfile: (profileData: Registration) => Promise<RegistrationResult>;
  isPlatformAdmin: boolean;
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
    city: typeof row.city === 'string' ? row.city : '',
    location: typeof row.city === 'string' ? row.city : '',
    bio: typeof row.bio === 'string' ? row.bio : '',
    tags: Array.isArray(row.interests) ? row.interests as string[] : [],
    languages: Array.isArray(row.languages) ? row.languages as string[] : [],
    culturalPassport: Array.isArray(row.cultural_passport) ? row.cultural_passport as string[] : [],
    photoUrl: typeof row.photo_url === 'string' ? row.photo_url : undefined,
    lastActive: String(row.last_active || new Date().toISOString()),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const hydrate = async (authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null) => {
    if (!authUser) { setUser(null); setProfile(null); setIsPlatformAdmin(false); return; }
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
    const { data: adminAssignment, error: adminError } = await supabase.from('vq_admin_assignments')
      .select('role').eq('auth_user_id', authUser.id).eq('active', true).maybeSingle();
    if (adminError) console.warn('Admin assignment lookup failed:', adminError.message);
    setIsPlatformAdmin(Boolean(adminAssignment && adminAssignment.role === 'platform_admin'));
    if (row) {
      let avatarUrl = typeof row.photo_url === 'string' ? row.photo_url : '';
      try {
        const uploadedUrl = await uploadPendingProfileAvatar(authUser.id, profileId);
        if (uploadedUrl) avatarUrl = uploadedUrl;
      } catch (avatarError) {
        console.warn('Pending avatar upload not completed:', avatarError);
      }
      const { data: preferences, error: preferencesError } = await supabase.from('profile_preferences')
        .select('telegram_handle,x_handle,preferred_contact_method,cozy_diary_mode')
        .eq('profile_id', profileId).maybeSingle();
      if (preferencesError) console.warn('Profile preferences unavailable:', preferencesError.message);
      setProfile({
        ...fromRow(row),
        photoUrl: avatarUrl,
        telegramHandle: preferences?.telegram_handle || '',
        xHandle: preferences?.x_handle || '',
        contactMethod: preferences?.preferred_contact_method || 'none',
        oracleMode: Boolean(preferences?.cozy_diary_mode),
      });
    } else setProfile(null);
    if (row) setUser(prev => prev?.uid === authUser.id ? { ...prev, displayName: String(row.display_name || row.handle) } : prev);
  };

  useEffect(() => {
    let active = true;
    // Preserve historical browser data for S00 recovery. Supabase alone controls the active session.
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
    if (!row) {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      throw new Error('Your account exists but its profile is not linked yet. Contact the administrator.');
    }
    return fromRow(row);
  };

  const registerProfile = async (data: Registration): Promise<RegistrationResult> => {
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
      email, password: data.password, options: {
        emailRedirectTo: 'https://vqgemni.vercel.app/',
        data: {
          handle, display_name: displayName,
          photo_url: data.photoUrl || '',
          bio: data.bio || '', city: data.location || data.city || '',
          interests: data.tags || [],
          telegram_handle: data.telegramHandle || '', x_handle: data.xHandle || '',
          preferred_contact_method: data.contactMethod || 'none',
          cozy_diary_mode: Boolean(data.oracleMode),
        },
      },
    });
    if (error) throw new Error(error.message);
    if (!signup.user) throw new Error('Account creation failed.');
    if (data.avatarFile) {
      await queuePendingProfileAvatar(signup.user.id, data.avatarFile);
    }
    // Database trigger creates the profile atomically for verified new Auth users.
    if (!signup.session) return { pendingVerification: true, email, authUserId: signup.user.id };
    await hydrate(signup.user);
    const { data: row } = await supabase.from('profiles').select('*').eq('id', 'usr_' + signup.user.id).maybeSingle();
    if (!row) throw new Error('Account created, but profile provisioning is pending.');
    if (data.avatarFile) await uploadPendingProfileAvatar(signup.user.id, row.id);
    return fromRow(row);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user || !profile) throw new Error('Sign in to edit your profile.');
    const fields: Record<string, unknown> = {};
    if (typeof updates.displayName === 'string') {
      const name = updates.displayName.trim();
      if (!name || name.length > 80) throw new Error('Display name must be 1–80 characters.');
      fields.display_name = name;
    }
    if (typeof updates.photoUrl === 'string') fields.photo_url = updates.photoUrl.trim();
    if (typeof updates.bio === 'string') {
      if (updates.bio.length > 280) throw new Error('Bio must be 280 characters or less.');
      fields.bio = updates.bio.trim();
    }
    const city = updates.location ?? updates.city;
    if (typeof city === 'string') {
      if (city.length > 100) throw new Error('Broad location must be 100 characters or less.');
      fields.city = city.trim();
    }
    if (updates.tags !== undefined) {
      if (updates.tags.length > 30 || updates.tags.some(tag => !tag.trim() || tag.length > 60)) {
        throw new Error('Choose up to 30 interests of 1–60 characters each.');
      }
      fields.interests = [...new Set(updates.tags.map(tag => tag.trim().toLowerCase()))];
    }
    if (updates.languages !== undefined) fields.languages = updates.languages;
    const hasPrivateUpdates = ['telegramHandle', 'xHandle', 'contactMethod', 'oracleMode']
      .some(key => Object.prototype.hasOwnProperty.call(updates, key));
    const nextTelegram = updates.telegramHandle ?? profile.telegramHandle ?? '';
    const nextX = updates.xHandle ?? profile.xHandle ?? '';
    const nextContactMethod = updates.contactMethod ?? profile.contactMethod ?? 'none';
    const nextCozyDiaryMode = updates.oracleMode ?? profile.oracleMode ?? false;
    if (nextCozyDiaryMode && (!String(fields.bio ?? profile.bio ?? '').trim()
      || !String(fields.city ?? profile.city ?? '').trim() || (!nextTelegram.trim() && !nextX.trim()))) {
      throw new Error('Cozy Diary Mode requires a biography, broad location and at least one contact handle.');
    }
    if (nextTelegram.length > 64 || nextX.length > 64) throw new Error('Contact handle is too long.');
    if (!['none', 'telegram', 'x', 'email'].includes(nextContactMethod)) throw new Error('Invalid contact preference.');
    // Supabase RLS owns authorization. Never submit client-controlled IDs, roles or rewards.
    let saved = profile;
    if (updates.avatarFile) {
      fields.photo_url = await uploadProfileAvatar(updates.avatarFile, profile.id);
    }
    if (Object.keys(fields).length) {
      const { data, error } = await supabase.from('profiles').update(fields)
        .eq('id', profile.id).select('*').single();
      if (error) throw new Error(error.message);
      saved = fromRow(data);
    }
    if (hasPrivateUpdates) {
      const { data: existing, error: lookupError } = await supabase.from('profile_preferences')
        .select('profile_id').eq('profile_id', profile.id).maybeSingle();
      if (lookupError) throw new Error(lookupError.message);
      const privateFields = {
        telegram_handle: nextTelegram.trim(), x_handle: nextX.trim(),
        preferred_contact_method: nextContactMethod, cozy_diary_mode: nextCozyDiaryMode,
      };
      const result = existing
        ? await supabase.from('profile_preferences').update(privateFields).eq('profile_id', profile.id)
        : await supabase.from('profile_preferences').insert({ profile_id: profile.id, ...privateFields });
      if (result.error) throw new Error(result.error.message);
    }
    setProfile({
      ...saved,
      telegramHandle: nextTelegram, xHandle: nextX,
      contactMethod: nextContactMethod, oracleMode: nextCozyDiaryMode,
    });
  };

  const login = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw new Error(error.message);
  };
  // Guest means no identity, not an invented authorized user.
  const loginAsGuest = () => {
    void supabase.auth.signOut().then(({ error }) => {
      if (error) console.warn('Guest sign-out failed:', error.message);
      else { setUser(null); setProfile(null); }
    });
  };
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    setUser(null); setProfile(null); setIsPlatformAdmin(false);
  };
  const updateProfilePoints = async (_pointsEarned: number) => {
    // Do not mint rewards client-side. D20 must authorize actual ledger credits.
  };
  return <AuthContext.Provider value={{
    user, profile, userProfile: profile, setProfile, loading, isPlatformAdmin, login, loginAsGuest,
    loginWithHandleAndPassword, registerProfile, updateProfile, logout, updateProfilePoints,
  }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
