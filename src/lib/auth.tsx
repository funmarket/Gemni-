import React, { createContext, useContext, useEffect, useState } from 'react';
import { vqLedger } from '@/domains/d20_vq_ledger';

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

interface AuthContextType {
  user: {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
  } | null;
  profile: UserProfile | null;
  userProfile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  loading: boolean;
  login: () => Promise<void>;
  loginAsGuest: (customHandle?: string) => void;
  loginWithHandleAndPassword: (handle: string, password?: string) => Promise<UserProfile>;
  registerProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfilePoints: (pointsEarned: number) => Promise<void>;
  updateProfileWallet?: (address: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USER_KEY = 'vq_auth_user_v2';
const STORAGE_PROFILE_KEY = 'vq_auth_profile_v2';

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_hannibal_1337',
  handle: 'hannibal',
  displayName: 'Hannibal',
  accountType: 'voyager',
  points: 650,
  streaks: 5,
  city: 'Tunis',
  culturalPassport: ['Tunis Medina', 'Carthage', 'Sidi Bou Said'],
  lastActive: new Date().toISOString(),
};

const DEFAULT_USER = {
  uid: 'usr_hannibal_1337',
  email: 'hannibal@vibequest.xyz',
  displayName: 'Hannibal',
  photoURL: '',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
  } | null>(DEFAULT_USER);

  const [profile, setProfile] = useState<UserProfile | null>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and sync with D20 VQ Ledger
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_USER_KEY);
      const storedProfile = localStorage.getItem(STORAGE_PROFILE_KEY);

      if (storedUser && storedProfile) {
        setUser(JSON.parse(storedUser));
        setProfile(JSON.parse(storedProfile));
      } else {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(DEFAULT_USER));
        localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(DEFAULT_PROFILE));
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }

    // Subscribe to D20 Ledger balance updates to keep profile points synchronized authoritatively
    const unsubscribe = vqLedger.subscribe((summary) => {
      setProfile((prev) => {
        if (!prev) return prev;
        if (prev.points === summary.currentBalance) return prev;
        const updated = { ...prev, points: summary.currentBalance };
        localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(updated));
        return updated;
      });
    });

    return () => unsubscribe();
  }, []);

  const loginWithHandleAndPassword = async (handle: string, _password?: string): Promise<UserProfile> => {
    setLoading(true);
    const cleanHandle = handle.trim().toLowerCase();
    const newProfile: UserProfile = {
      id: `usr_${cleanHandle}_${Date.now()}`,
      handle: cleanHandle,
      displayName: cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1),
      accountType: 'voyager',
      points: vqLedger.getBalance('current_user'),
      streaks: 1,
      city: 'Tunis',
      culturalPassport: ['Tunis Medina'],
      lastActive: new Date().toISOString(),
    };

    const newUser = {
      uid: newProfile.id,
      email: `${cleanHandle}@vibequest.xyz`,
      displayName: newProfile.displayName,
      photoURL: '',
    };

    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(newProfile));

    setUser(newUser);
    setProfile(newProfile);
    setLoading(false);
    return newProfile;
  };

  const registerProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    setLoading(true);
    const handle = (profileData.handle || 'voyager').toLowerCase().trim();
    const created: UserProfile = {
      id: `usr_${handle}_${Date.now()}`,
      handle,
      displayName: profileData.displayName || handle.toUpperCase(),
      accountType: profileData.accountType || 'voyager',
      points: vqLedger.getBalance('current_user') || 500,
      streaks: 1,
      city: profileData.city || 'Tunis',
      culturalPassport: profileData.culturalPassport || ['Tunis Medina'],
      photoUrl: profileData.photoUrl,
      lastActive: new Date().toISOString(),
    };

    const newUser = {
      uid: created.id,
      email: `${handle}@vibequest.xyz`,
      displayName: created.displayName,
      photoURL: created.photoUrl || '',
    };

    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(created));

    setUser(newUser);
    setProfile(created);
    setLoading(false);
    return created;
  };

  const login = async () => {
    loginAsGuest('hannibal');
  };

  const loginAsGuest = (customHandle?: string) => {
    setLoading(true);
    const guestHandle = (customHandle && customHandle.trim())
      ? customHandle.replace(/\s+/g, '_').toLowerCase()
      : 'cyber_voyager';

    const guestUser = {
      uid: `usr_${guestHandle}_guest`,
      email: `${guestHandle}@vibequest.xyz`,
      displayName: guestHandle.toUpperCase(),
      photoURL: '',
    };

    const guestProfile: UserProfile = {
      id: guestUser.uid,
      handle: guestHandle,
      displayName: guestHandle.toUpperCase(),
      accountType: 'voyager',
      points: vqLedger.getBalance('current_user'),
      streaks: 4,
      city: 'Tunis',
      culturalPassport: ['Tunis', 'Carthage'],
      lastActive: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(guestUser));
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(guestProfile));

    setUser(guestUser);
    setProfile(guestProfile);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_PROFILE_KEY);
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const updateProfilePoints = async (pointsEarned: number) => {
    if (!profile) return;
    if (pointsEarned !== 0) {
      vqLedger.credit(
        'current_user',
        pointsEarned,
        'DAILY_STREAK',
        `Earned points update: ${pointsEarned} VQ`
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        userProfile: profile,
        setProfile,
        loading,
        login,
        loginAsGuest,
        loginWithHandleAndPassword,
        registerProfile,
        logout,
        updateProfilePoints,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
