import { clearStoredAuth, getStoredToken } from '@/app/api/tokenStorage';

export interface LaravelErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  status: number;
  payload: LaravelErrorPayload;

  constructor(status: number, payload: LaravelErrorPayload) {
    super(getSafeErrorMessage(status, payload.message));
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function getSafeErrorMessage(status: number, message?: string) {
  const exposesServerDetails =
    Boolean(message) &&
    /SQLSTATE|select\s+.*\s+from|stack trace|exception|database:/i.test(message || '');

  if (status >= 500 || exposesServerDetails) {
    return getFriendlyErrorMessage(status);
  }

  return message || getFriendlyErrorMessage(status);
}

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function getFriendlyErrorMessage(status: number) {
  if (status === 401) {
    return 'Your session has expired. Please log in again.';
  }
  if (status === 403) {
    return 'ليس لديك صلاحية للوصول إلى هذه الصفحة';
  }
  if (status === 404) {
    return 'The requested item was not found.';
  }
  if (status >= 500) {
    return 'تعذر إكمال الطلب بسبب مشكلة في الخادم. حاول مرة أخرى لاحقاً.';
  }

  return 'Something went wrong. Please try again.';
}

export function getValidationErrors(error: unknown) {
  if (error instanceof ApiError) {
    return error.payload.errors || {};
  }

  return {};
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const errorPayload =
      typeof payload === 'object' && payload !== null
        ? (payload as LaravelErrorPayload)
        : { message: getFriendlyErrorMessage(response.status) };

    // Ignore late 401 responses from a previous account/session. Otherwise an
    // old request can clear a newly issued token immediately after login.
    if (response.status === 401 && token && getStoredToken() === token) {
      clearStoredAuth();
      unauthorizedHandler?.();
    }

    throw new ApiError(response.status, errorPayload);
  }

  return payload as T;
}
