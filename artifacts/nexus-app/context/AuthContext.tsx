import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setToken, removeToken } from '@/lib/api';
import type { User } from '@/lib/types';

const TOKEN_KEY = '@nexus/token';
const USER_KEY = '@nexus/user';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        setTokenState(storedToken);
        setUser(JSON.parse(storedUser));
        await setToken(storedToken);

        // Validate token in background
        try {
          const freshUser = await api.auth.me();
          setUser(freshUser);
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        } catch {
          // Token expired
          await clearAuth();
        }
      }
    } catch {
      await clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuth = async () => {
    setUser(null);
    setTokenState(null);
    await removeToken();
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  };

  const login = useCallback(async (username: string, password: string) => {
    const { user: loggedUser, token: newToken } = await api.auth.login({
      username,
      password,
    });
    await setToken(newToken);
    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(loggedUser));
    setTokenState(newToken);
    setUser(loggedUser);
  }, []);

  const register = useCallback(
    async (username: string, password: string, displayName: string) => {
      const { user: newUser, token: newToken } = await api.auth.register({
        username,
        password,
        displayName,
      });
      await setToken(newToken);
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
      setTokenState(newToken);
      setUser(newUser);
    },
    []
  );

  const logout = useCallback(async () => {
    await clearAuth();
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
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
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
