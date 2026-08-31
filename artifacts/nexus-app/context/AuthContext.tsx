import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase-premium';
import type { User } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(authUser: SupabaseUser): User {
  const metadata = authUser.user_metadata ?? {};
  return {
    id: (metadata.user_id ?? authUser.id) as unknown as number,
    username: String(
      metadata.username ?? authUser.email?.split('@')[0] ?? 'nexus-user',
    ),
    displayName: String(
      metadata.display_name ?? metadata.username ?? authUser.email ?? 'Nexus User',
    ),
    bio: metadata.bio ?? null,
    avatarUrl: metadata.avatar_url ?? null,
    createdAt: authUser.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((session: Session | null) => {
    setToken(session?.access_token ?? null);
    setUser(session?.user ? mapUser(session.user) : null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const hydrateSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!mounted) return;
      if (error) {
        applySession(null);
      } else {
        applySession(session);
      }
      setIsLoading(false);
    };

    void hydrateSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) applySession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      if (!data.session || !data.user) {
        throw new Error('Oturum açılamadı. E-posta doğrulamasını tamamlayın.');
      }
      applySession(data.session);
    },
    [applySession],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      const tokenValue = idToken.trim();
      if (!tokenValue) {
        throw new Error('Google kimlik doğrulama belirteci alınamadı.');
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: tokenValue,
      });

      if (error) throw error;
      if (!data.session || !data.user) {
        throw new Error('Google ile oturum açılamadı.');
      }

      applySession(data.session);
    },
    [applySession],
  );

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
            username: email.trim().split('@')[0],
          },
        },
      });
      if (error) throw error;
      if (!data.session || !data.user) {
        throw new Error(
          'Kayıt tamamlandı. Giriş yapmadan önce e-posta adresinizi doğrulayın.',
        );
      }
      applySession(data.session);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    applySession(null);
  }, [applySession]);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((previous) => (previous ? { ...previous, ...data } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}