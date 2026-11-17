import { create } from 'zustand';

import { fetchCurrentUser, loginAccount, logoutAccount, registerAccount } from '@/lib/api/auth';
import { setRefreshActivityHandler, setSessionClearedHandler } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import { clearTokens, getAccessToken, getRefreshToken } from '@/lib/api/token-storage';
import type { AuthStatus, AuthUser, LoginInput, RegisterInput } from '@/types/auth';

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  loadCurrentUser: () => Promise<void>;
  clearError: () => void;
};

let initialization: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'initializing',
  loading: false,
  error: null,

  initialize: () => {
    if (!initialization) {
      initialization = restoreSession().finally(() => {
        initialization = null;
      });
    }
    return initialization;
  },

  register: async (input) => {
    set({ loading: true, error: null });
    try {
      await registerAccount(input);
      const session = await loginAccount({ email: input.email, password: input.password });
      set({ loading: false, user: session.user, status: 'authenticated', error: null });
      return session.user;
    } catch (error) {
      set({ loading: false, error: messageFor(error), status: 'unauthenticated' });
      throw error;
    }
  },

  login: async (input) => {
    set({ loading: true, error: null });
    try {
      const session = await loginAccount(input);
      set({ loading: false, user: session.user, status: 'authenticated', error: null });
    } catch (error) {
      set({ loading: false, error: messageFor(error), status: 'unauthenticated' });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await logoutAccount();
    } catch {
      // The API may be unreachable. The local session is still removed below.
    } finally {
      await clearTokens();
      set({ loading: false, user: null, status: 'unauthenticated', error: null });
    }
  },

  loadCurrentUser: async () => {
    set({ loading: true, error: null });
    try {
      const user = await fetchCurrentUser();
      set({ loading: false, user, status: 'authenticated' });
    } catch (error) {
      if (isTemporary(error)) {
        set({
          loading: false,
          error: messageFor(error),
          status: get().user ? 'authenticated' : 'error',
        });
        return;
      }
      await clearTokens();
      set({ loading: false, user: null, status: 'unauthenticated', error: null });
    }
  },

  clearError: () => set({ error: null }),
}));

setSessionClearedHandler(() => {
  useAuthStore.setState({
    user: null,
    status: 'unauthenticated',
    loading: false,
    error: null,
  });
});

setRefreshActivityHandler((active) => {
  const state = useAuthStore.getState();
  if (!state.user) {
    return;
  }
  if (active) {
    useAuthStore.setState({ status: 'refreshing' });
    return;
  }
  if (useAuthStore.getState().status === 'refreshing') {
    useAuthStore.setState({ status: 'authenticated' });
  }
});

async function restoreSession(): Promise<void> {
  useAuthStore.setState({ status: 'initializing', error: null });
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();
  if (!accessToken && !refreshToken) {
    useAuthStore.setState({ user: null, status: 'unauthenticated', loading: false });
    return;
  }

  try {
    const user = await fetchCurrentUser();
    useAuthStore.setState({ user, status: 'authenticated', loading: false, error: null });
  } catch (error) {
    if (isTemporary(error)) {
      useAuthStore.setState({
        user: null,
        status: 'error',
        loading: false,
        error: messageFor(error),
      });
      return;
    }
    await clearTokens();
    useAuthStore.setState({ user: null, status: 'unauthenticated', loading: false, error: null });
  }
}

function isTemporary(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.code === 'NETWORK' || error.code === 'TIMEOUT' || error.code === 'CONFIG')
  );
}

function messageFor(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'NETWORK' || error.code === 'TIMEOUT') {
      return 'errors.offline';
    }
    if (error.code === 'CONFIG') {
      return 'errors.config';
    }
    if (error.code === 'INVALID_CREDENTIALS') {
      return 'errors.invalidCredentials';
    }
    if (error.code === 'EMAIL_TAKEN') {
      return 'errors.emailTaken';
    }
    return 'errors.generic';
  }
  return 'errors.generic';
}
