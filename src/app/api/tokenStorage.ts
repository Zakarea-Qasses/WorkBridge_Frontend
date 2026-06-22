export const AUTH_TOKEN_KEY = 'workbridge-auth-token';
export const AUTH_USER_KEY = 'workbridge-auth-user';
export const VERIFICATION_EMAIL_KEY = 'workbridge-verification-email';
export const VERIFICATION_ROLE_KEY = 'workbridge-verification-role';

function clearLegacySharedAuth() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  window.localStorage.removeItem(VERIFICATION_EMAIL_KEY);
  window.localStorage.removeItem(VERIFICATION_ROLE_KEY);
}

export function getStoredToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  clearLegacySharedAuth();
  return window.sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string) {
  clearLegacySharedAuth();
  window.sessionStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearStoredAuth() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
  window.sessionStorage.removeItem(AUTH_USER_KEY);
  clearLegacySharedAuth();
}

export function getStoredVerificationEmail() {
  if (typeof window === 'undefined') {
    return '';
  }

  clearLegacySharedAuth();
  return window.sessionStorage.getItem(VERIFICATION_EMAIL_KEY) || '';
}

export function setStoredVerificationEmail(email: string) {
  clearLegacySharedAuth();
  window.sessionStorage.setItem(VERIFICATION_EMAIL_KEY, email);
}

export function clearStoredVerificationEmail() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(VERIFICATION_EMAIL_KEY);
  window.localStorage.removeItem(VERIFICATION_EMAIL_KEY);
}

export function getStoredVerificationRole() {
  if (typeof window === 'undefined') {
    return null;
  }

  clearLegacySharedAuth();
  const role = window.sessionStorage.getItem(VERIFICATION_ROLE_KEY);
  return role === 'personal' || role === 'company' ? role : null;
}

export function setStoredVerificationRole(role: 'personal' | 'company') {
  clearLegacySharedAuth();
  window.sessionStorage.setItem(VERIFICATION_ROLE_KEY, role);
}

export function clearStoredVerificationRole() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(VERIFICATION_ROLE_KEY);
  window.localStorage.removeItem(VERIFICATION_ROLE_KEY);
}

export function getStoredUser<T>() {
  if (typeof window === 'undefined') {
    return null;
  }

  clearLegacySharedAuth();
  const raw = window.sessionStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStoredUser(user: unknown) {
  clearLegacySharedAuth();
  window.sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}
