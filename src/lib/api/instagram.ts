import type {
  InstagramAccount,
  InstagramConnectSession,
  InstagramDisconnectResult,
} from '@/types/instagram';

import { apiRequest } from './client';
import { endpoints } from './endpoints';

export function startInstagramConnect(): Promise<InstagramConnectSession> {
  return apiRequest<InstagramConnectSession>(endpoints.instagramConnect);
}

export function fetchInstagramAccounts(): Promise<InstagramAccount[]> {
  return apiRequest<InstagramAccount[]>(endpoints.instagramAccounts);
}

export function syncInstagramProfile(accountId: string): Promise<InstagramAccount> {
  return apiRequest<InstagramAccount>(`${endpoints.instagramAccounts}/${accountId}/sync-profile`, {
    method: 'POST',
  });
}

export function disconnectInstagramAccount(accountId: string): Promise<InstagramDisconnectResult> {
  return apiRequest<InstagramDisconnectResult>(
    `${endpoints.instagramAccounts}/${accountId}/disconnect`,
    {
      method: 'POST',
    },
  );
}
