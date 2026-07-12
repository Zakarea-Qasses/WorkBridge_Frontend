import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getApiErrorMessage, setUnauthorizedHandler } from '@/app/api/client';
import * as api from '@/app/api/pages/auth/session';
import {
  clearStoredAuth,
  clearStoredVerificationEmail,
  clearStoredVerificationRole,
  getStoredToken,
  getStoredUser,
  setStoredVerificationEmail,
  setStoredVerificationRole,
  setStoredToken,
  setStoredUser,
} from '@/app/api/tokenStorage';

interface AuthContextValue {
  user: api.WorkBridgeUser | null;
  token: string | null;
  initializing: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isAdmin: boolean;
  isCompany: boolean;
  isPersonal: boolean;
  accountStatus: api.WorkBridgeUser['status'] | null;
  companyVerificationStatus: boolean | null;
  login: (payload: { email: string; password: string }) => Promise<api.WorkBridgeUser>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'personal' | 'company';
  }) => Promise<api.WorkBridgeUser>;
  refreshUser: () => Promise<api.WorkBridgeUser | null>;
  clearAuthSession: () => void;
  startAuthFlow: (mode: 'login' | 'register') => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function getDashboardPath(role?: api.WorkBridgeUser['role']) {
  if (role === 'personal') {
    return '/dashboard';
  }

  if (role === 'company') {
    return '/company-dashboard';
  }

  if (role === 'admin') {
    return '/admin';
  }

  return '/login';
}

export function getDashboardPathForUser(user: api.WorkBridgeUser | null | undefined) {
  if (!user) {
    return '/login';
  }

  return getDashboardPath(user.role);
}

export function getAccountStatusPath(user: api.WorkBridgeUser | null) {
  if (!user) {
    return null;
  }

  if (user.status === 'blocked') {
    return '/account-blocked';
  }

  if (user.status === 'pending_review') {
    return '/account-pending';
  }

  if (user.status === 'under_review') {
    return '/account-under-review';
  }

  if (user.role === 'company' && user.company?.is_verified === false) {
    return '/company-pending-verification';
  }

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState<api.WorkBridgeUser | null>(() => {
    const storedToken = getStoredToken();
    return storedToken ? getStoredUser<api.WorkBridgeUser>() : null;
  });
  const [initializing, setInitializing] = useState(Boolean(token));
  const sessionVersionRef = useRef(0);

  const clearAuthSession = useCallback(() => {
    sessionVersionRef.current += 1;
    clearStoredAuth();
    setToken(null);
    setUser(null);
    setInitializing(false);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuthSession();
      window.location.assign('/login');
    });

    return () => setUnauthorizedHandler(null);
  }, [clearAuthSession]);

  const refreshUser = useCallback(async () => {
    const requestToken = getStoredToken();
    if (!requestToken) {
      return null;
    }

    const requestVersion = sessionVersionRef.current;
    const currentUser = await api.me();
    if (
      requestVersion !== sessionVersionRef.current ||
      getStoredToken() !== requestToken
    ) {
      return null;
    }

    setUser(currentUser);
    setStoredUser(currentUser);
    if (import.meta.env.DEV) {
      console.debug('[auth] /me role:', currentUser.role);
    }
    return currentUser;
  }, []);

  useEffect(() => {
    if (!token) {
      setInitializing(false);
      return;
    }

    let mounted = true;
    const requestVersion = sessionVersionRef.current;
    const requestToken = token;

    api
      .refreshMe()
      .then((currentUser) => {
        if (
          !mounted ||
          requestVersion !== sessionVersionRef.current ||
          getStoredToken() !== requestToken
        ) {
          return;
        }

        setUser(currentUser);
        setStoredUser(currentUser);
        if (import.meta.env.DEV) {
          console.debug('[auth] /me role:', currentUser.role);
        }
      })
      .catch(() => {
        if (
          mounted &&
          requestVersion === sessionVersionRef.current &&
          getStoredToken() === requestToken
        ) {
          clearAuthSession();
        }
      })
      .finally(() => {
        if (mounted) {
          setInitializing(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [clearAuthSession, token]);

  const handleLogin = useCallback(async (payload: { email: string; password: string }) => {
    const loginVersion = ++sessionVersionRef.current;
    const response = await api.login(payload);
    if (loginVersion !== sessionVersionRef.current) {
      throw new Error('This login attempt was replaced by a newer authentication action.');
    }

    setStoredToken(response.token);
    setStoredUser(response.user);
    setStoredVerificationEmail(response.user.email);
    clearStoredVerificationRole();
    setToken(response.token);
    setUser(response.user);
    if (import.meta.env.DEV) {
      console.debug('[auth] login role:', response.user.role);
    }
    return response.user;
  }, []);

  const handleRegister = useCallback<AuthContextValue['register']>(async (payload) => {
    const response = await api.register(payload);
    setStoredVerificationEmail(response.user.email || payload.email);
    setStoredVerificationRole(payload.role);
    if (response.token) {
      sessionVersionRef.current += 1;
      setStoredToken(response.token);
      setStoredUser(response.user);
      setToken(response.token);
      setUser(response.user);
    } else {
      clearAuthSession();
    }
    return response.user;
  }, [clearAuthSession]);

  const startAuthFlow = useCallback(
    (mode: 'login' | 'register') => {
      clearAuthSession();
      clearStoredVerificationEmail();
      clearStoredVerificationRole();
      window.location.assign(mode === 'login' ? '/login' : '/register');
    },
    [clearAuthSession],
  );

  const handleLogout = useCallback(async () => {
    const logoutToken = getStoredToken();
    try {
      if (logoutToken) {
        await api.logout();
      }
    } catch (error) {
      getApiErrorMessage(error);
    } finally {
      if (getStoredToken() === logoutToken) {
        clearAuthSession();
        window.location.assign('/');
      }
    }
  }, [clearAuthSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      initializing,
      isAuthenticated: Boolean(token && user),
      isEmailVerified: Boolean(user?.email_verified_at),
      isAdmin: user?.role === 'admin',
      isCompany: user?.role === 'company',
      isPersonal: user?.role === 'personal',
      accountStatus: user?.status || null,
      companyVerificationStatus:
        typeof user?.company?.is_verified === 'boolean' ? user.company.is_verified : null,
      login: handleLogin,
      register: handleRegister,
      refreshUser,
      clearAuthSession,
      startAuthFlow,
      logout: handleLogout,
    }),
    [
      clearAuthSession,
      handleLogin,
      handleLogout,
      handleRegister,
      initializing,
      refreshUser,
      startAuthFlow,
      token,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
