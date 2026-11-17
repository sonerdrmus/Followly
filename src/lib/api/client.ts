import { shareInFlight } from '@/lib/auth/single-flight';
import type { AuthSession } from '@/types/auth';

import { endpoints } from './endpoints';
import { ApiError, type ApiFailure, type ApiSuccess } from './types';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './token-storage';

const timeoutMs = 15_000;

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  auth?: boolean;
  retry?: boolean;
};

type UnauthorizedHandler = () => Promise<boolean>;
type SessionClearedHandler = () => void;
type RefreshActivityHandler = (active: boolean) => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;
let sessionClearedHandler: SessionClearedHandler | null = null;
let refreshActivityHandler: RefreshActivityHandler | null = null;
const refreshSlot: { current: Promise<boolean> | null } = { current: null };

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler;
}

export function setSessionClearedHandler(handler: SessionClearedHandler): void {
  sessionClearedHandler = handler;
}

export function setRefreshActivityHandler(handler: RefreshActivityHandler): void {
  refreshActivityHandler = handler;
}

export function apiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim() ?? '';
  if (!configured) {
    throw new ApiError(
      'EXPO_PUBLIC_API_URL is not set. Add the API address before calling Followly.',
      0,
      'CONFIG',
    );
  }
  return configured.replace(/\/$/, '');
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (options.auth !== false) {
    const accessToken = await getAccessToken();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });
    const payload = (await response.json()) as ApiSuccess<T> | ApiFailure;

    if (response.status === 401 && options.auth !== false && options.retry !== false) {
      const refreshed = unauthorizedHandler ? await unauthorizedHandler() : false;
      if (refreshed) {
        return apiRequest<T>(path, { ...options, retry: false });
      }
    }

    if (!response.ok || payload.success === false) {
      const failure = payload.success === false ? payload : null;
      throw new ApiError(
        failure?.message ?? 'The request could not be completed.',
        response.status,
        failure?.code ?? 'REQUEST_FAILED',
      );
    }

    return payload.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('The request timed out.', 0, 'TIMEOUT');
    }
    throw new ApiError('The Followly API could not be reached.', 0, 'NETWORK');
  } finally {
    clearTimeout(timer);
  }
}

export function refreshStoredSession(): Promise<boolean> {
  return shareInFlight(refreshSlot, rotateStoredSession);
}

async function rotateStoredSession(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  refreshActivityHandler?.(true);
  try {
    const session = await apiRequest<AuthSession>(endpoints.refresh, {
      method: 'POST',
      auth: false,
      retry: false,
      body: { refreshToken },
    });
    if (!session.accessToken || !session.refreshToken) {
      throw new ApiError('The server returned an unexpected session.', 0, 'UNEXPECTED_RESPONSE');
    }
    await saveTokens(session.accessToken, session.refreshToken);
    return true;
  } catch (error) {
    if (isTemporaryFailure(error)) {
      throw error;
    }
    await clearTokens();
    sessionClearedHandler?.();
    return false;
  } finally {
    refreshActivityHandler?.(false);
  }
}

function isTemporaryFailure(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.code === 'NETWORK' || error.code === 'TIMEOUT' || error.code === 'CONFIG')
  );
}

setUnauthorizedHandler(refreshStoredSession);
