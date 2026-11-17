import type { AuthSession, AuthUser, LoginInput, RegisterInput } from '@/types/auth';

import { apiRequest } from './client';
import { endpoints } from './endpoints';
import { ApiError } from './types';
import { clearTokens, getRefreshToken, saveTokens } from './token-storage';

export async function registerAccount(input: RegisterInput): Promise<AuthUser> {
  const user = await apiRequest<AuthUser>(endpoints.register, {
    method: 'POST',
    auth: false,
    retry: false,
    body: {
      email: input.email,
      displayName: input.displayName,
      password: input.password,
    },
  });
  assertUser(user);
  return user;
}

export async function loginAccount(input: LoginInput): Promise<AuthSession> {
  const session = await apiRequest<AuthSession>(endpoints.login, {
    method: 'POST',
    auth: false,
    retry: false,
    body: {
      email: input.email,
      password: input.password,
    },
  });
  assertSession(session);
  await saveTokens(session.accessToken, session.refreshToken);
  return session;
}

export async function logoutAccount(): Promise<void> {
  const refreshToken = await getRefreshToken();
  try {
    if (refreshToken) {
      await apiRequest<{ revoked: true }>(endpoints.logout, {
        method: 'POST',
        auth: false,
        retry: false,
        body: { refreshToken },
      });
    }
  } finally {
    await clearTokens();
  }
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const user = await apiRequest<AuthUser>(endpoints.me, { method: 'GET' });
  assertUser(user);
  return user;
}

function assertUser(user: AuthUser): void {
  if (!user?.id || !user.email || !user.displayName) {
    throw new ApiError('The server returned an unexpected profile.', 0, 'UNEXPECTED_RESPONSE');
  }
}

function assertSession(session: AuthSession): void {
  assertUser(session?.user);
  if (!session.accessToken || !session.refreshToken) {
    throw new ApiError('The server returned an unexpected session.', 0, 'UNEXPECTED_RESPONSE');
  }
}
