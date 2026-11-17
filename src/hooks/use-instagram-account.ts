import { useQuery } from '@tanstack/react-query';

import { fetchInstagramAccounts } from '@/lib/api/instagram';
import { useAuthStore } from '@/stores/auth-store';
import type { InstagramAccount } from '@/types/instagram';

export const instagramAccountsKey = ['instagram', 'accounts'] as const;

export function useInstagramAccounts() {
  const signedIn = useAuthStore((state) => state.status === 'authenticated' && state.user !== null);

  return useQuery({
    queryKey: instagramAccountsKey,
    queryFn: fetchInstagramAccounts,
    enabled: signedIn,
  });
}

export function activeInstagramAccount(
  accounts: readonly InstagramAccount[] | undefined,
): InstagramAccount | null {
  return accounts?.find((account) => account.connectionStatus !== 'disconnected') ?? null;
}
