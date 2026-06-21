
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { Capacitor } from '@capacitor/core';
import { Profile, UserRole } from '../types/auth';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  authUser: User | null;
  profile: Profile | null;
  isGuest: boolean;
  needsOnboarding: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  retryAuth: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
  safeLogout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  completeOnboarding: (data: Partial<Profile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('isGuest') === 'true');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const authUserRef = React.useRef<User | null>(null);
  const profileRef = React.useRef<Profile | null>(null);

  useEffect(() => {
    authUserRef.current = authUser;
  }, [authUser]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const isProfileComplete = useCallback((p: Profile | null) => {
    return Boolean(p?.display_name?.trim()) && p?.onboarding_completed === true;
  }, []);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!supabase) {
      setAuthError("Supabase belum dikonfigurasi");
      return null;
    }
    
    try {
      setAuthError(null);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        setProfile(null);
        setAuthError(`Gagal memuat profil: ${profileError.message}`);
        return null;
      }

      if (!profileData) {
        setProfile(null);
        setNeedsOnboarding(true);
        return null;
      }

      const p = profileData as Profile;
      setProfile(p);
      
      const complete = isProfileComplete(p);
      setNeedsOnboarding(!complete);
      
      return p;
    } catch (err: any) {
      console.error("Error fetching profile details:", err);
      setProfile(null);
      setAuthError(err.message || "Gagal memuat data akun");
      setIsAuthLoading(false);
      return null;
    }
  }, [isProfileComplete]);

  const logout = async () => {
    try {
      if (supabase) await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setIsGuest(false);
      localStorage.removeItem('isGuest');
      setAuthUser(null);
      setProfile(null);
      setAuthError(null);
      setNeedsOnboarding(false);
      
      // Force clean any potentially stuck storage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }
  };

  const safeLogout = logout;

  const initializeAuth = useCallback(async () => {
    if (!supabase) {
      setIsAuthLoading(false);
      return;
    }

    try {
      setIsAuthLoading(true);
      setAuthError(null);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session error:", error);
        setAuthError(`Sesi bermasalah: ${error.message}`);
        setIsAuthLoading(false);
        return;
      }

      if (session?.user) {
        setAuthUser(session.user);
        setIsGuest(false);
        localStorage.setItem('isGuest', 'false');
        await fetchProfile(session.user.id);
      } else {
        setAuthUser(null);
        setProfile(null);
        setNeedsOnboarding(false);
      }
    } catch (err: any) {
      console.error("Auth init error:", err);
      setAuthError(err.message || "Gagal menginisialisasi sistem login");
    } finally {
      setIsAuthLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    if (!supabase) {
      setIsAuthLoading(false);
      setAuthError("Supabase belum dikonfigurasi");
      return;
    }

    let isMounted = true;

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth State Changed Event:", event, "User:", session?.user?.id);
      
      const newUser = session?.user;
      
      // Use setTimeout to avoid async callback issues in onAuthStateChange
      setTimeout(async () => {
        if (!isMounted) return;

        if (!newUser) {
          setAuthUser(null);
          setProfile(null);
          setNeedsOnboarding(false);
          setIsAuthLoading(false);
          return;
        }

        const isSameUser = authUserRef.current?.id === newUser.id;
        const alreadyHasProfile = Boolean(profileRef.current);

        setAuthUser(newUser);
        setIsGuest(false);
        localStorage.setItem('isGuest', 'false');

        // Background sync if it's the same user and profile already exists
        if (
          isSameUser && 
          alreadyHasProfile && 
          (event === "TOKEN_REFRESHED" || event === "SIGNED_IN" || event === "INITIAL_SESSION")
        ) {
          fetchProfile(newUser.id).catch(err => {
            console.error("Background profile sync error:", err);
          });
          return;
        }

        try {
          setIsAuthLoading(true);
          setAuthError(null);
          await fetchProfile(newUser.id);
        } catch (err: any) {
          console.error("Auth state change error:", err);
          setAuthError(err.message || "Gagal memproses sesi login");
        } finally {
          if (isMounted) setIsAuthLoading(false);
        }
      }, 0);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, initializeAuth]);

  const retryAuth = async () => {
    await initializeAuth();
  };

  const loginWithGoogle = async () => {
    if (!supabase) return;
    setIsAuthLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        try {
          await GoogleSignIn.initialize({
            clientId: '939384428783-q6j35mkniie5l6r4gramdk60g1sgutqt.apps.googleusercontent.com',
            scopes: ['profile', 'email'],
          });

          const result = await GoogleSignIn.signIn();
          const idToken = result.idToken;

          if (!idToken) throw new Error("No ID Token received from Google Sign-In");

          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
          });

          if (error) throw error;
          return;
        } catch (nativeErr: any) {
          console.error("Native login failed:", nativeErr);
          const isCancelled = nativeErr.message?.toLowerCase().includes('cancel') || nativeErr.code === 'USER_CANCELLED';
          if (isCancelled) {
            setIsAuthLoading(false);
            return;
          }
          throw nativeErr;
        }
      }

      // WEB FLOW
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          }
        },
      });

      if (error) throw error;
      
    } catch (err) {
      console.error("Google login failed:", err);
      setIsAuthLoading(false);
      throw err;
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('isGuest', 'true');
    setAuthUser(null);
    setProfile(null);
    setIsAuthLoading(false);
  };

  const refreshProfile = async () => {
    if (authUser) await fetchProfile(authUser.id);
  };
  
  const updateProfile = async (data: Partial<Profile>) => {
    if (!authUser || !supabase) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', authUser.id);
      
    if (error) throw error;
    await refreshProfile();
  };

  const completeOnboarding = async (data: Partial<Profile>) => {
    if (!authUser || !supabase) {
      throw new Error("User belum login atau Supabase belum siap");
    }

    const anyData = data as any;
    
    const finalDisplayName = 
      anyData.display_name || 
      anyData.full_name || 
      authUser.user_metadata?.full_name || 
      authUser.user_metadata?.name || 
      authUser.email?.split('@')[0] || 
      'User';

    const finalUsername = 
      anyData.username || 
      profile?.username || 
      `user_${Math.random().toString(36).slice(2, 8)}`;

    const payload = {
      id: authUser.id,
      email: authUser.email ?? null,
      ...data,
      display_name: finalDisplayName.trim(),
      username: finalUsername.trim(),
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    };

      const { data: savedProfile, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select('*')
        .maybeSingle();

      if (error) {
        console.error("Supabase upsert error:", error);
        // Special case: Foreign key violation code is 23503
        if (error.code === '23503') {
          setAuthError("Sesi login tidak sinkron dengan database. Silakan login ulang.");
          setTimeout(() => logout(), 2000);
          throw new Error("Login session expired or invalid. Logging out...");
        }
        setAuthError(`Gagal menyimpan profil: ${error.message}`);
        throw error;
      }

    if (!savedProfile) {
      throw new Error("Profil berhasil disimpan tapi tidak bisa dibaca ulang");
    }

    setProfile(savedProfile as Profile);
    setNeedsOnboarding(false);
    setAuthError(null);
  };

  const deleteAccount = async () => {
    if (!authUser || !supabase) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session not found");

      // We use the local API route which works in both preview and production
      // It handles everything: Auth, DB, and Storage.
      const response = await fetch('/api/user/delete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          email: authUser.email,
          targetUserId: authUser.id 
        })
      });

      console.log("User delete account response status:", response.status);
      const text = await response.text();
      console.log("User delete account response body:", text);

      let result: any = {};
      if (text) {
        try {
          result = JSON.parse(text);
        } catch (e) {
          console.error("Invalid JSON response in user delete account:", text, e);
          throw new Error("Respons server tidak valid (bukan JSON).");
        }
      }

      if (!response.ok) throw new Error(result.error || `Gagal menghapus akun (Status: ${response.status})`);
      
      // Cleanup locally
      await logout();
      window.location.href = '/'; // Force a clean redirect to home/login
    } catch (err) {
      console.error("Delete account failed:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      authUser,
      profile,
      isGuest,
      needsOnboarding,
      isAuthLoading,
      authError,
      retryAuth,
      loginWithGoogle,
      continueAsGuest,
      logout,
      safeLogout,
      refreshProfile,
      updateProfile,
      completeOnboarding,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
